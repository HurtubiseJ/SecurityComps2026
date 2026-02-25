from fastapi import APIRouter, HTTPException
from processes import start_hping3, stop_hping3
import requests
import os
import threading
import docker
import time
import logging
import json
import subprocess
from typing import Optional
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path

logger = logging.getLogger()


class Metrics(BaseModel):
    cpu: bool
    disk: bool
    network: bool
    fastapi: bool
    memory: bool
    sys_cpu: bool
    sys_network: bool
    sys_memory: bool

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
    header_interval_ms: int
    payload_bytes: int
    connect_timeout_ms: int

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

router = APIRouter()

@router.get("/status")
async def status():
    from processes import RUNNING_PROCESS
    state = "running" if RUNNING_PROCESS else "idle"
    return {"status": "ok", "state": state}

@router.post("/start")
async def start():
    success = start_hping3()
    if not success:
        raise HTTPException("Process already running")
    return {"status": "running"}

@router.post("/stop")
async def stop():
    success = stop_hping3()
    if not success:
        raise HTTPException("No process to stop")
    
    return {
        "status": "stopped"
    }

@router.get("/test")
async def test():
    resp = requests.get("http://proxy:8000/config")
    logger.info(resp.content)

    return {"status": "ok", "status_code": resp.status_code}

@router.get("/config")
async def config():
    with open("../MASTER_CONFIG.json", "r") as f:
        config = json.load(f)
    
    if config is None:
        raise HTTPException("Failed to load config")
    
    return config

@router.post("/config")
async def modifyConfig(config: Config):
    logger.info(config)
    with open("../MASTER_CONFIG.json", "w") as f:
        f.write(
            config.model_dump_json(indent=2)
        )
        f.close()
    
    return {"status": "ok", "message": "Config file modified. GET /restart to apply changes."}

@router.get("/restart")
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
    client.containers.get("attacker1-john").restart()
    return True

