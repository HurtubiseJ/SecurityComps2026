from fastapi import APIRouter, HTTPException
from processes import start_hping3, stop_hping3
import requests
import logging
import json
import subprocess

logger = logging.getLogger("attacker2")


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