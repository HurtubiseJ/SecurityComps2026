from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import HTMLResponse, PlainTextResponse
import time


app = FastAPI()

@app.get("/", response_class=HTMLResponse)
def home():
    return "<html><body><h1>Target1 Machine actings as a victim to attacking machines</h1></body></html>"

@app.get("/assets/{name}")
def asset(name: str):
    return PlainTextResponse(f"asset:{name}")

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/{func}")
def api_func(func: str):
    return {"func": func, "result": "ok"}