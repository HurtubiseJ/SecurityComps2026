from fastapi import APIRouter, HTTPException
from processes import start_hping3, stop_hping3
import requests
import logging
import json
import subprocess
from pydantic import BaseModel

logger = logging.getLogger("attacker2")


class Monitor(BaseModel):
    cpu: bool
    disk: bool
    network: bool
    fastapi: bool
    memory: bool

class Config(BaseModel):
    enabled: bool
    interval: int
    metrics: Monitor


router = APIRouter()

@router.get("/status")
async def status():
    return {"status": "running"}

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
    subprocess.run(["ls"])
    with open("../MASTER_CONFIG.json", "r") as f:
        config = json.load(f)
    
    if config is None:
        raise HTTPException("Failed to load config")
    
    return config

@router.post("/config")
async def modifyConfig(config: Config):
    with open("../MASTER_CONFIG.json", "+w") as f:
        config.model_dump_json()
    
    return {"status": "ok", "message": "Config file modified. GET /restart to apply changes."}

@router.get("/restart")
async def restart():
    from main import restartApplication
    restartApplication()
    pass
