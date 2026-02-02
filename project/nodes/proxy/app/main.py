"""
Proxy node FastAPI application.
"""
import os
import sys
import time
import asyncio
from collections import defaultdict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# node_monitor for /metrics
try:
    from node_monitor import Registry
    NODE_MONITOR_AVAILABLE = True
except ImportError:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../shared/node_monitor"))
    try:
        from node_monitor import Registry
        NODE_MONITOR_AVAILABLE = True
    except ImportError:
        NODE_MONITOR_AVAILABLE = False
        Registry = None

from app.config import get_rate_limit, get_config, reload as config_reload

app = FastAPI(title="Proxy API", version="1.0.0")

# Rate limit state: 
_rate_limit_buckets: dict = defaultdict(lambda: (0.0, 0.0))
_rate_limit_lock = asyncio.Lock()

MANAGEMENT_PREFIXES = ("/proxy/", "/proxy-health", "/metrics", "/docs", "/openapi.json")


def _client_key(request: Request, scope: str) -> str:
    if scope == "global":
        return "global"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Token-bucket rate limiter using config from MASTER_CONFIG."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path == "/proxy-health" or path == "/metrics" or path.startswith("/proxy/") or path.startswith("/docs") or path == "/openapi.json":
            return await call_next(request)

        rl = get_rate_limit()
        if not rl.get("enabled"):
            return await call_next(request)

        rps = max(0.001, rl.get("requests_per_second", 100))
        burst = max(1, rl.get("burst", 50))
        scope = rl.get("scope", "per_ip")
        code = rl.get("response_code", 429)

        key = _client_key(request, scope)
        now = time.monotonic()

        async with _rate_limit_lock:
            tokens, last = _rate_limit_buckets[key]
            elapsed = now - last
            tokens = min(burst, tokens + elapsed * rps)
            allowed = tokens >= 1
            if allowed:
                tokens -= 1
            _rate_limit_buckets[key] = (tokens, now)

        if not allowed:
            return JSONResponse(
                status_code=code,
                content={"error": "rate limit exceeded", "retry_after": "1"},
            )
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)

if NODE_MONITOR_AVAILABLE and Registry is not None:
    try:
        registry = Registry()
        registry.registerFastAPIApp(app=app)
    except Exception:
        pass

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Proxy API"}


@app.get("/proxy-health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/config")
async def config():
    """Return current MASTER_CONFIG (same as targets/attacker; used by attacker /test)."""
    return get_config()


if not NODE_MONITOR_AVAILABLE:
    @app.get("/metrics")
    async def metrics_stub():
        """Metrics endpoint stub when node_monitor not available"""
        return {}


@app.post("/metrics/set-log-level")
async def set_log_level():
    """Set proxy log level endpoint"""
    return {}


@app.post("/proxy/apply")
async def apply_config():
    """Reload config from file so middleware uses latest MASTER_CONFIG."""
    config_reload()
    return {"status": "ok", "message": "config reloaded"}


@app.post("/proxy/reset")
async def reset_proxy():
    """Reset proxy endpoint"""
    return {}


@app.get("/proxy/status")
async def get_status():
    """Proxy status endpoint with rate_limit config."""
    rl = get_rate_limit()
    return {
        "rate_limit": {
            "enabled": rl["enabled"],
            "requests_per_second": rl["requests_per_second"],
            "burst": rl["burst"],
            "scope": rl["scope"],
        }
    }

@app.post("/proxy/config")
async def update_config():
    """Update configuration endpoint"""
    return {}
