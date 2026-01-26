from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, PlainTextResponse, JSONResponse
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from pathlib import Path
import json
import time
import asyncio
from typing import List, Dict, Any
from .database import get_pool, init_db, close_pool

app = FastAPI()

MASTER_CONFIG_PATH = Path(__file__).resolve().parent.parent / "MASTER_CONFIG.json"

def load_master_config():
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)

MASTER_CONFIG = load_master_config()

# Prometheus metrics (same pattern as target1)
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["path"])
INFLIGHT = Gauge("http_inflight_requests", "In-flight requests")
QUEUE_DEPTH = Gauge("app_request_queue_depth", "Simulated queue depth")
DB_QUERY_COUNT = Counter("db_queries_total", "Total database queries", ["query_type"])
DB_QUERY_LATENCY = Histogram("db_query_duration_seconds", "Database query latency", ["query_type"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    await close_pool()

# Middleware for metrics and enable/disable (same pattern as target1)
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

# Standard endpoints
@app.get("/", response_class=HTMLResponse)
async def home():
    return "<h1>Target Node 2</h1><p>Database-Backed Microservice</p>"

@app.get("/assets/{name}")
def asset(name: str):
    return PlainTextResponse(f"asset:{name}")

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected", "error": str(e)}
        )

@app.get("/config")
async def show_config():
    """Return current node configuration"""
    config = MASTER_CONFIG.copy()
    # Don't expose password in config endpoint
    if "database" in config and "password" in config["database"]:
        config["database"]["password"] = "***"
    return config

@app.get("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

# Database search endpoint
@app.get("/api/search/{query}")
async def search(query: str):
    """Search users by name or email"""
    start = time.time()
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            # Search in users table
            results = await conn.fetch("""
                SELECT id, name, email, created_at 
                FROM users 
                WHERE name ILIKE $1 OR email ILIKE $1 
                LIMIT 20
            """, f"%{query}%")
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="search").observe(latency)
            DB_QUERY_COUNT.labels(query_type="search").inc()
            
            return {
                "query": query,
                "results": [dict(row) for row in results],
                "count": len(results)
            }
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="search").inc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# CRUD operations for users
@app.get("/api/data/{id}")
async def get_data(id: int):
    """GET: Retrieve user by ID"""
    start = time.time()
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, name, email, created_at FROM users WHERE id = $1",
                id
            )
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="select").observe(latency)
            DB_QUERY_COUNT.labels(query_type="select").inc()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            return dict(user)
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="select").inc()
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.post("/api/data")
async def create_data(request: Request):
    """POST: Create a new user"""
    start = time.time()
    body = await request.json()
    pool = await get_pool()
    
    try:
        name = body.get("name")
        email = body.get("email")
        
        if not name or not email:
            raise HTTPException(status_code=400, detail="name and email are required")
        
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
                name, email
            )
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="insert").observe(latency)
            DB_QUERY_COUNT.labels(query_type="insert").inc()
            
            return dict(user)
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="insert").inc()
        raise HTTPException(status_code=500, detail=f"Create failed: {str(e)}")

@app.put("/api/data/{id}")
async def update_data(id: int, request: Request):
    """PUT: Update user by ID"""
    start = time.time()
    body = await request.json()
    pool = await get_pool()
    
    try:
        name = body.get("name")
        email = body.get("email")
        
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, created_at",
                name, email, id
            )
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="update").observe(latency)
            DB_QUERY_COUNT.labels(query_type="update").inc()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            return dict(user)
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="update").inc()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@app.delete("/api/data/{id}")
async def delete_data(id: int):
    """DELETE: Delete user by ID"""
    start = time.time()
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM users WHERE id = $1",
                id
            )
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="delete").observe(latency)
            DB_QUERY_COUNT.labels(query_type="delete").inc()
            
            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="User not found")
            
            return {"message": "User deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="delete").inc()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# Aggregation endpoint
@app.get("/api/stats")
async def get_stats():
    """Get aggregated statistics from database"""
    start = time.time()
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            # Multiple aggregation queries
            user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
            product_count = await conn.fetchval("SELECT COUNT(*) FROM products")
            order_count = await conn.fetchval("SELECT COUNT(*) FROM orders")
            total_revenue = await conn.fetchval("""
                SELECT COALESCE(SUM(o.quantity * p.price), 0) 
                FROM orders o 
                JOIN products p ON o.product_id = p.id
            """)
            avg_order_value = await conn.fetchval("""
                SELECT COALESCE(AVG(o.quantity * p.price), 0) 
                FROM orders o 
                JOIN products p ON o.product_id = p.id
            """)
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="aggregation").observe(latency)
            DB_QUERY_COUNT.labels(query_type="aggregation").inc()
            
            return {
                "users": int(user_count),
                "products": int(product_count),
                "orders": int(order_count),
                "total_revenue": float(total_revenue),
                "avg_order_value": float(avg_order_value)
            }
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="aggregation").inc()
        raise HTTPException(status_code=500, detail=f"Stats query failed: {str(e)}")

# Join operations endpoint
@app.get("/api/related/{id}")
async def get_related(id: int):
    """Get user with related orders and product details (JOIN operation)"""
    start = time.time()
    pool = await get_pool()
    
    try:
        async with pool.acquire() as conn:
            # Get user with all their orders and product details
            user = await conn.fetchrow(
                "SELECT id, name, email, created_at FROM users WHERE id = $1",
                id
            )
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            orders = await conn.fetch("""
                SELECT 
                    o.id as order_id,
                    o.quantity,
                    o.created_at as order_date,
                    p.id as product_id,
                    p.name as product_name,
                    p.price as product_price,
                    (o.quantity * p.price) as order_total
                FROM orders o
                JOIN products p ON o.product_id = p.id
                WHERE o.user_id = $1
                ORDER BY o.created_at DESC
            """, id)
            
            latency = time.time() - start
            DB_QUERY_LATENCY.labels(query_type="join").observe(latency)
            DB_QUERY_COUNT.labels(query_type="join").inc()
            
            return {
                "user": dict(user),
                "orders": [dict(row) for row in orders],
                "order_count": len(orders)
            }
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="join").inc()
        raise HTTPException(status_code=500, detail=f"Join query failed: {str(e)}")

# Batch operations endpoint
@app.post("/api/batch")
async def batch_operations(request: Request):
    """POST: Perform batch operations (create multiple orders)"""
    start = time.time()
    body = await request.json()
    pool = await get_pool()
    
    try:
        operations = body.get("operations", [])
        if not operations:
            raise HTTPException(status_code=400, detail="operations array is required")
        
        results = []
        async with pool.acquire() as conn:
            async with conn.transaction():
                for op in operations:
                    op_type = op.get("type")
                    
                    if op_type == "create_order":
                        user_id = op.get("user_id")
                        product_id = op.get("product_id")
                        quantity = op.get("quantity", 1)
                        
                        if not user_id or not product_id:
                            results.append({"error": "user_id and product_id required"})
                            continue
                        
                        order = await conn.fetchrow(
                            "INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id, user_id, product_id, quantity, created_at",
                            user_id, product_id, quantity
                        )
                        results.append({"success": True, "order": dict(order)})
                    
                    elif op_type == "update_stock":
                        product_id = op.get("product_id")
                        stock_change = op.get("stock_change", 0)
                        
                        if not product_id:
                            results.append({"error": "product_id required"})
                            continue
                        
                        product = await conn.fetchrow(
                            "UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING id, name, stock",
                            stock_change, product_id
                        )
                        if product:
                            results.append({"success": True, "product": dict(product)})
                        else:
                            results.append({"error": "Product not found"})
                    
                    else:
                        results.append({"error": f"Unknown operation type: {op_type}"})
        
        latency = time.time() - start
        DB_QUERY_LATENCY.labels(query_type="batch").observe(latency)
        DB_QUERY_COUNT.labels(query_type="batch").inc()
        
        return {
            "processed": len(results),
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        DB_QUERY_COUNT.labels(query_type="batch").inc()
        raise HTTPException(status_code=500, detail=f"Batch operation failed: {str(e)}")

