from fastapi import APIRouter, HTTPException, WebSocket
from processes import start_wrk, stop_wrk
import os
import time
import threading
import requests
import logging
import json
import subprocess
from typing import Optional
from pydantic import BaseModel
from pathlib import Path
import subprocess
import docker
from processes import RUNNING_PROCESS

logger = logging.getLogger()

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

class startOptions(BaseModel):
    forward_Host: str
    forward_port: str
    end_point: str
    num_connections: int
    num_threads: int
    duration_seconds: int

router = APIRouter()

def _load_config():
    with open(Path(os.getenv("CONFIG_FILE_PATH"), "../MASTER_CONFIG.json")) as f:
        config = json.load(f)

    if not config:
        raise RuntimeError("Unable to load config")
    
    return config

# config = _load_config() 
# duration = config.duration_seconds


@router.get("/status")
async def status():
    if RUNNING_PROCESS is None:
        return {"status": "idle", "message": "Idle, no proccess running"}
    return {"status": "running", "message": "Proccess Running"}

@router.post("/start")
async def start(options: startOptions):

    success = start_wrk(forwardHost=options.forward_host, forwardPort=options.forward_port, endPoint=options.end_point, num_threads=options.num_threads, num_connections=options.num_connections, duraition_seconds=options.duration_seconds)

    if not success:
        raise HTTPException("Process already running")
    
    return {"status": "running", "message": "Process started"}

@router.post("/stop")
async def stop():
    success = stop_wrk()
    if not success:
        return {
            "status": "stopped",
            "message": "No process to stop"
        }
    
    return {
        "status": "stopped",
        "message": "Stopped Process"
    }

@router.get("/test")
async def test():
    resp = requests.get("http://proxy:8000/config")
    logger.info(resp.content)

    return {"status": "ok", "status_code": resp.status_code}

@router.get("/config")
async def config():
    subprocess.run(["ls"])
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
