"""
FastAPI Application (empty endpoints)
Runs behind nginx reverse proxy
"""
from fastapi import FastAPI

app = FastAPI(title="Proxy API", version="1.0.0")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Proxy API"}


@app.get("/proxy-health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/metrics")
async def metrics():
    """Metrics endpoint"""
    return {}


@app.post("/metrics/set-log-level")
async def set_log_level():
    """Set log level endpoint"""
    return {}


@app.post("/proxy/apply")
async def apply_config():
    """Apply configuration endpoint"""
    return {}


@app.post("/proxy/reset")
async def reset_proxy():
    """Reset proxy endpoint"""
    return {}


@app.get("/proxy/status")
async def get_status():
    """Get proxy status endpoint"""
    return {}


@app.post("/proxy/config")
async def update_config():
    """Update configuration endpoint"""
    return {}