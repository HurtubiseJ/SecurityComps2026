from fastapi import APIRouter, HTTPException
from processes import start_hping3, stop_hping3


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


