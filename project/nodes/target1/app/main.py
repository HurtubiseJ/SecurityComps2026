from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse, JSONResponse
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from pathlib import Path
import json
import time, random, threading

app = FastAPI()

MASTER_CONFIG_PATH = Path(__file__).resolve().parent.parent / "MASTER_CONFIG.json"

def load_master_config():
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)

MASTER_CONFIG = load_master_config()


#counts every requests, method -> GET/POST/etc, pathh -> /api/foo, status -> 200, 500, etc
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])

#measure how long requests take per path
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["path"])

#tracks how many requests are currently being processed
INFLIGHT = Gauge("http_inflight_requests", "In-flight requests")

#simulates a background job queue size
QUEUE_DEPTH = Gauge("app_request_queue_depth", "Simulated queue depth")



#node becomes offline/ shuts off cleanly if disabled
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    if not MASTER_CONFIG.get("enabled", True):
        return JSONResponse(status_code=503, content={"error": "Target disabled by config"})

    INFLIGHT.inc()
    start = time.time()
    response = await call_next(request)
    latency = time.time() - start
    REQUEST_LATENCY.labels(path=request.url.path).observe(latency)
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    INFLIGHT.dec()
    return response


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
    time.sleep(0.05)
    return {"function": func, "result": random.randint(1, 100)}

@app.get("/config")
async def show_config():
    return MASTER_CONFIG

#Prometheus endpoint
@app.get("/metrics")
def metrics():
    return generate_latest()


