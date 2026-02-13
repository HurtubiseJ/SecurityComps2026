"""
FastAPI Proxy Application
(NGINX alternative) 
"""
import os
import sys
import logging
import time
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../shared/node_monitor'))

try:
    from registry import Registry
    NODE_MONITOR_AVAILABLE = True
except ImportError:
    NODE_MONITOR_AVAILABLE = False
    logging.warning("node_monitor not available, metrics will be limited")

from config_manager import config_manager
from middleware import MitigationMiddleware
from metrics.proxy_metrics import proxy_metrics
from mitigations.tcp_hardening import TCPHardening

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
node_monitor_registry: Optional[Registry] = None
mitigation_middleware: Optional[MitigationMiddleware] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    global node_monitor_registry, mitigation_middleware
    
    # Startup
    logger.info("Starting proxy application...")
    
    # Initialize node monitor if available
    if NODE_MONITOR_AVAILABLE:
        try:
            node_monitor_registry = Registry()
            node_monitor_registry.registerFastAPIApp(app=app)
            logger.info("Node monitor registry initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize node monitor: {e}")
    
    # Initialize mitigation middleware (will be disabled if config says so)
    mitigation_middleware = MitigationMiddleware(app)
    app.add_middleware(MitigationMiddleware)
    
    # Log mitigation status
    custom_config = config_manager.get_custom_config()
    mitigations_enabled = any([
        custom_config.get("rate_limit", {}).get("enabled", False),
        custom_config.get("connection_limit", {}).get("enabled", False),
        custom_config.get("header_timeout", {}).get("enabled", False)
    ])
    if not mitigations_enabled:
        logger.info("All mitigations disabled - running in basic forwarding mode")
    
    logger.info("Proxy application started")
    
    yield
    
    logger.info("Shutting down proxy application...")
    if node_monitor_registry:
        try:
            await node_monitor_registry.stop()
        except:
            pass


# Create FastAPI app
app = FastAPI(
    title="Proxy Service",
    description="DDoS mitigation proxy with rate limiting and connection management",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LogLevelRequest(BaseModel):
    level: str


class ConfigUpdateRequest(BaseModel):
    custom_config: Dict[str, Any]


# API Routes
@app.get("/proxy-health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "proxy"}


@app.get("/proxy/status")
async def get_status():
    """Get proxy status"""
    config = config_manager.get_config()
    custom_config = config_manager.get_custom_config()
    
    # Get TCP hardening status
    tcp_config = custom_config.get("tcp_hardening", {})
    tcp_hardening = TCPHardening(tcp_config)
    
    # Get connection limiter stats
    from mitigations.connection_limit import ConnectionLimiter
    conn_limiter = ConnectionLimiter(custom_config.get("connection_limit", {}))
    
    status_info = {
        "enabled": config_manager.is_enabled(),
        "upstream": config_manager.get_upstream_url(),
        "listen": f"{config_manager.get_listen_host()}:{config_manager.get_listen_port()}",
        "active_connections": conn_limiter.get_total_active(),
        "mitigations": {
            "rate_limit": {
                "enabled": custom_config.get("rate_limit", {}).get("enabled", False)
            },
            "connection_limit": {
                "enabled": custom_config.get("connection_limit", {}).get("enabled", False),
                "active": conn_limiter.get_total_active()
            },
            "header_timeout": {
                "enabled": custom_config.get("header_timeout", {}).get("enabled", False)
            },
            "tcp_hardening": tcp_hardening.get_status()
        },
        "monitoring": {
            "enabled": config.get("monitoring", {}).get("enabled", False),
            "node_monitor_available": NODE_MONITOR_AVAILABLE
        }
    }
    
    return status_info


@app.post("/proxy/config")
async def update_config(request: ConfigUpdateRequest):
    """Update proxy configuration"""
    try:
        success = config_manager.update_config({"custom_config": request.custom_config})
        
        # Reload mitigations
        if mitigation_middleware:
            mitigation_middleware.reload_mitigations()
        
        if success:
            return {
                "status": "success",
                "message": "Configuration updated",
                "config": config_manager.get_custom_config()
            }
        else:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to update configuration"}
            )
    except Exception as e:
        logger.exception("Error updating configuration")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


@app.post("/proxy/apply")
async def apply_config():
    """Apply current configuration (reload mitigations)"""
    try:
        if mitigation_middleware:
            mitigation_middleware.reload_mitigations()
            return {"status": "success", "message": "Configuration applied"}
        else:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Middleware not initialized"}
            )
    except Exception as e:
        logger.exception("Error applying configuration")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


@app.post("/proxy/reset")
async def reset_proxy():
    """Reset proxy state (clear rate limit buckets, connection counts)"""
    try:
        custom_config = config_manager.get_custom_config()
        
        # Reset rate limiter
        from mitigations.rate_limit import RateLimiter
        rate_limiter = RateLimiter(custom_config.get("rate_limit", {}))
        rate_limiter.reset()
        
        # Reset connection limiter
        from mitigations.connection_limit import ConnectionLimiter
        conn_limiter = ConnectionLimiter(custom_config.get("connection_limit", {}))
        conn_limiter.reset()
        
        return {"status": "success", "message": "Proxy state reset"}
    except Exception as e:
        logger.exception("Error resetting proxy")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )


@app.post("/metrics/set-log-level")
async def set_log_level(request: LogLevelRequest):
    """Set logging level"""
    level = request.level.upper()
    valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    
    if level not in valid_levels:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": f"Invalid level. Must be one of: {valid_levels}"}
        )
    
    logging.getLogger().setLevel(getattr(logging, level))
    logger.info(f"Log level set to {level}")
    
    return {"status": "success", "level": level}


# Main forwarding logic
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def forward_request(request: Request, path: str):
    """Forward request to upstream target"""
    if not config_manager.is_enabled():
        return JSONResponse(
            status_code=503,
            content={"error": "Proxy is disabled"}
        )
    
    upstream_url = config_manager.get_upstream_url()
    target_url = f"{upstream_url}/{path}" if path else upstream_url
    
    # Add query string if present
    if request.url.query:
        target_url += f"?{request.url.query}"
    
    # Prepare headers 
    headers = {}
    excluded_headers = {
        "host", "connection", "keep-alive", "proxy-authenticate",
        "proxy-authorization", "te", "trailers", "transfer-encoding", "upgrade"
    }
    
    for key, value in request.headers.items():
        if key.lower() not in excluded_headers:
            headers[key] = value
    
    if "X-Forwarded-For" not in headers:
        client_ip = request.client.host if request.client else "unknown"
        headers["X-Forwarded-For"] = client_ip
    
    # Get request body
    body = await request.body()
    
    # Forward request
    start_time = time.time()
    connect_start = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Record connect time
            connect_time = time.time() - connect_start
            
            # Make request
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body if body else None,
                follow_redirects=True
            )
            
            # Record response time
            response_time = time.time() - start_time
            proxy_metrics.record_upstream_time(response_time, connect_time)
            
            # Prepare response headers
            response_headers = {}
            for key, value in response.headers.items():
                if key.lower() not in excluded_headers:
                    response_headers[key] = value
            
            # Return response
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get("content-type")
            )
    
    except httpx.TimeoutException:
        logger.warning(f"Upstream timeout: {target_url}")
        proxy_metrics.record_request(request.method, path, 504)
        return JSONResponse(
            status_code=504,
            content={"error": "Upstream timeout"}
        )
    
    except httpx.ConnectError:
        logger.error(f"Upstream connection error: {target_url}")
        proxy_metrics.record_request(request.method, path, 502)
        return JSONResponse(
            status_code=502,
            content={"error": "Bad gateway"}
        )
    
    except Exception as e:
        logger.exception(f"Error forwarding request: {e}")
        proxy_metrics.record_request(request.method, path, 500)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )


if __name__ == "__main__":
    import uvicorn
    
    host = config_manager.get_listen_host()
    port = config_manager.get_listen_port()
    
    logger.info(f"Starting proxy server on {host}:{port}")
    uvicorn.run(
        "proxy:app",
        host=host,
        port=port,
        log_level="info",
        reload=False
    )
