"""Proxy node – w/ metrics and config endpoints."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
from typing import Optional
import threading
import time
from pathlib import Path
import os
import json
import docker
from node_monitor import Registry

app = FastAPI(title="Proxy API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

registry = Registry()
registry.registerFastAPIApp(app=app)

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

class ProxyConfig(BaseModel):
    enabled: bool
    rate_limit_rate: int
    max_connections: int
    burst: int
    connection_timeout: int
    read_timeout: int
    send_timeout: int

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
    custom_config: ProxyConfig

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/status")
async def status():
    return {"status": "ok", "state": "running", "message": "Status OK"}

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

@app.get("/restart")
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
    client = docker.from_env()
    client.containers.get("proxy").exec_run("/reload_conf.sh")
    client.containers.get("proxy").exec_run("nginx -s reload")
    return True

@app.get("/metrics")
async def metrics():
    return {}
