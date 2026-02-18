"""Proxy node – w/ metrics and config endpoints."""
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import threading
import time
from pathlib import Path
import os
import json
import docker
from node_monitor import Registry

app = FastAPI(title="Proxy API")

registry = Registry()
registry.registerFastAPIApp(app=app)

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

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/status")
async def status():
    return {"status": "ok", "message": "Status OK"}

@app.get("/config")
async def getConfig():
    with open("../MASTER_CONFIG.json", "r") as f:
        content = json.load(f)
    
    if not content:
        return {"status": "Failed", "message": "Unable to open MASTER_CONFIG.json"}

    return content 

@app.post("/config")
async def updateConfig(config: Config):
    with open("../MASTER_CONFIG.json", 'w') as f:
        f.write(config.model_dump_json(indent=2))
        f.close()    


    return {"status": "ok", "message": "Config successfully modified"}


# @app.post("/apply")
# async def apply_jconfig():
#     return {}

@app.post("/restart")
async def reset():
    if os.getenv("LOCAL"):
        process = threading.Thread(
            target=run_local_restart
        )

        process.start()
        return {"status": "ok", "message": "Restarting container via Docker"}
    else:
        Path("/control/restart_required").touch()
        return {"status": "ok", "message": "Restarting container vis systemd"}


def run_local_restart():
    time.sleep(0.5)
    client = docker.client()
    client.containers.get("proxy").restart()
    return True

@app.get("/metrics")
async def metrics():
    return {}
