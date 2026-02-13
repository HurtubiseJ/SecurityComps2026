from fastapi import APIRouter, HTTPException
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


router = APIRouter()

@router.get("/status")
async def status():
    return {"status": "running"}

@router.post("/start")
async def start():
    success = start_wrk()

    if not success:
        raise HTTPException("Process already running")
    return {"status": "running"}

@router.post("/stop")
async def stop():
    success = stop_wrk()
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

    with open("../MASTER_CONFIG.json", "r") as f:
        c = json.load(f)
        print(c)
        logger.warning(c)
    
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
