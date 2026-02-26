from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# from prometheus_client import Counter, Histogram, Gauge, generate_latest
from pathlib import Path
import json
import time, random, threading
from node_monitor import Registry
from pydantic import BaseModel
from typing import Optional
import docker
import os
import math
import asyncio

class Metrics(BaseModel):
    cpu: bool
    disk: bool
    network: bool
    fastapi: bool
    memory: bool
    sys_cpu: bool
    sys_memory: bool
    sys_network: bool

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

registry = Registry()
registry.registerFastAPIApp(app=app)

MASTER_CONFIG_PATH = Path(__file__).resolve().parent.parent / "MASTER_CONFIG.json"

def load_master_config():
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)

MASTER_CONFIG = load_master_config()


#counts every requests, method -> GET/POST/etc, pathh -> /api/foo, status -> 200, 500, etc
# REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])

# #measure how long requests take per path
# REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["path"])

# #tracks how many requests are currently being processed
# INFLIGHT = Gauge("http_inflight_requests", "In-flight requests")

# #simulates a background job queue size
# QUEUE_DEPTH = Gauge("app_request_queue_depth", "Simulated queue depth")



#node becomes offline/ shuts off cleanly if disabled
# @app.middleware("http")
# async def metrics_middleware(request: Request, call_next):
#     if not MASTER_CONFIG.get("enabled", True):
#         return JSONResponse(status_code=503, content={"error": "Target disabled by config"})

#     INFLIGHT.inc()
#     start = time.time()
#     response = await call_next(request)
#     latency = time.time() - start
#     REQUEST_LATENCY.labels(path=request.url.path).observe(latency)
#     REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
#     INFLIGHT.dec()
#     return response


@app.get("/", response_class=HTMLResponse)
async def home():
    return "<h1>Target Node</h1><p>Simulated Web Service</p>"

@app.get("/assets/{name}")
def asset(name: str):
    return PlainTextResponse(f"asset:{name}")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/{func}")
async def api_func(func: str):
    await asyncio.sleep(0.01)
    return {"function": func, "result": random.randint(1, 100)}

@app.get("/api/cpu")
async def api_cpu_func():
    for _ in range(1000000):
        math.sqrt(random.random())

@app.get("/config")
async def getConfig():
    with open("../MASTER_CONFIG.json", "r") as f:
        config = json.load(f)

    if not config:
        return {"status": "Failed", "message": "Failed to open and read config file"}
    
    return config

@app.post("/config")
async def modifyConfig(config: Config):
    with open("../MASTER_CONFIG.json", "w") as f:
        f.write(config.model_dump_json(indent=2))
        f.close()
    
    return {"status": "ok", "message": "Config successfully modified"}
    


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
    
@app.get("/status")
async def status():
    return {
        "status": "ok",
        "state": "running",
    }


def run_local_restart():
    time.sleep(0.5)
    client = docker.client()
    client.containers.get("proxy").restart()
    return True
