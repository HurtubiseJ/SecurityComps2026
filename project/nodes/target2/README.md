# Target Node 2 (`target2`)

This node simulates a **database-backed microservice** in a controlled DDoS lab environment. It acts as a secondary service to replicate micro-service/distributed architecture patterns, using PostgreSQL for persistent data storage and FastAPI for the API layer.

---

## What It Does

- Serves database-backed API responses with multiple operation types
- Simulates real-world database operations (CRUD, search, joins, aggregations, batch operations)
- Exposes Prometheus metrics for monitoring
- Loads settings from `MASTER_CONFIG.json`
- Provides deterministic behavior with pre-seeded test data

---

## Architecture

Target2 uses:
- **FastAPI** for the web framework (consistent with target1)
- **PostgreSQL 15+** for database storage
- **asyncpg** for async database operations
- **Prometheus** for metrics collection

The service is containerized using Docker Compose, running both the FastAPI application and PostgreSQL database.

---

## Database Schema

The database contains three main tables with pre-seeded data:

### `users` Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `email` (VARCHAR(255) UNIQUE)
- `created_at` (TIMESTAMP)

**Seeded Data**: 10 users (Alice, Bob, Charlie, Diana, Eve, Frank, Grace, Henry, Ivy, Jack)

### `products` Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200))
- `price` (DECIMAL(10, 2))
- `stock` (INTEGER)
- `created_at` (TIMESTAMP)

**Seeded Data**: 10 products (Laptop, Mouse, Keyboard, Monitor, Headphones, Webcam, USB Drive, External SSD, Docking Station, Wireless Charger)

### `orders` Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, REFERENCES users(id))
- `product_id` (INTEGER, REFERENCES products(id))
- `quantity` (INTEGER)
- `created_at` (TIMESTAMP)

**Seeded Data**: Deterministic orders linking users to products (2-4 orders per user)

---

## Key Endpoints

### Standard Endpoints

- `GET /` → Static HTML page
- `GET /health` → Health check (includes database connectivity check)
- `GET /config` → Returns current node configuration (password redacted)
- `GET /metrics` → Prometheus metrics endpoint
- `GET /assets/{name}` → Static asset endpoint

### Database Search Endpoint

- `GET /api/search/{query}` → Search users by name or email
  - Returns up to 20 matching users
  - Example: `GET /api/search/alice` finds users matching "alice"

### CRUD Operations

- `GET /api/data/{id}` → Retrieve user by ID
  - Returns user details (id, name, email, created_at)
  - Returns 404 if user not found

- `POST /api/data` → Create a new user
  - Request body: `{"name": "John Doe", "email": "john@example.com"}`
  - Returns created user with generated ID

- `PUT /api/data/{id}` → Update user by ID
  - Request body: `{"name": "Updated Name", "email": "updated@example.com"}`
  - Both fields optional (updates only provided fields)
  - Returns 404 if user not found

- `DELETE /api/data/{id}` → Delete user by ID
  - Returns success message or 404 if user not found

### Aggregation Endpoint

- `GET /api/stats` → Get aggregated statistics
  - Returns: user count, product count, order count, total revenue, average order value
  - Performs multiple aggregation queries (COUNT, SUM, AVG)

### Join Operations

- `GET /api/related/{id}` → Get user with all related orders and product details
  - Returns user information plus all orders with joined product details
  - Includes order totals (quantity × price)
  - Demonstrates JOIN operations across multiple tables

### Batch Operations

- `POST /api/batch` → Perform batch operations
  - Request body: `{"operations": [{"type": "create_order", "user_id": 1, "product_id": 1, "quantity": 2}, ...]}`
  - Supports multiple operation types:
    - `create_order`: Create multiple orders in a transaction
    - `update_stock`: Update product stock levels
  - All operations executed in a single database transaction
  - Returns results for each operation

---

## Prometheus Metrics

Target2 exposes the same metrics as target1, plus additional database-specific metrics:

- `http_requests_total` - Total HTTP requests by method, path, and status
- `http_request_duration_seconds` - Request latency by path
- `http_inflight_requests` - Current in-flight requests
- `app_request_queue_depth` - Simulated queue depth
- `db_queries_total` - Total database queries by query type (select, insert, update, delete, search, join, aggregation, batch)
- `db_query_duration_seconds` - Database query latency by query type

---

## Configuration

Configuration is managed via `MASTER_CONFIG.json`:

- `enabled`: Enable/disable the service (returns 503 when disabled)
- `forward_host` / `forward_port`: Network configuration
- `database`: Database connection settings
  - `host`, `port`, `name`, `user`, `password`
  - `max_connections`, `connection_timeout_ms`, `query_timeout_ms`
- `monitoring`, `caching`, `rate_limit`: Same as target1

---

## How to Run

### Using Docker Compose (Recommended)

```bash
cd project/nodes/target2
docker-compose up --build
```

This will:
- Start PostgreSQL on port 5433 (host) / 5432 (container)
- Start FastAPI on port 8002
- Automatically initialize the database schema and seed data

Access the service at: `http://localhost:8002`

### Local Development

1. **Start PostgreSQL** (ensure it's running on localhost:5432 or update config)

2. **Set up Python environment**:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. **Update MASTER_CONFIG.json** database settings for local connection:
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "target2_db",
    "user": "your_user",
    "password": "your_password"
  }
}
```

4. **Run the application**:
```bash
cd app
uvicorn main:app --host 0.0.0.0 --port 8002
```

---

## Testing Endpoints

### Example Requests

```bash
# Health check
curl http://localhost:8002/health

# Search users
curl http://localhost:8002/api/search/alice

# Get user by ID
curl http://localhost:8002/api/data/1

# Create user
curl -X POST http://localhost:8002/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Get statistics
curl http://localhost:8002/api/stats

# Get user with orders (JOIN)
curl http://localhost:8002/api/related/1

# Batch operations
curl -X POST http://localhost:8002/api/batch \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"type": "create_order", "user_id": 1, "product_id": 1, "quantity": 2},
      {"type": "update_stock", "product_id": 1, "stock_change": -2}
    ]
  }'
```

---

## Differences from Target1

- **Database-backed**: All operations interact with PostgreSQL
- **More complex endpoints**: Simulates real-world database operations
- **Deterministic data**: Pre-seeded database with known data for testing
- **Multiple operation types**: Search, CRUD, aggregations, joins, batch operations
- **Docker Compose**: Includes PostgreSQL service alongside FastAPI
- **Additional metrics**: Database-specific query metrics

---

## Notes

- Database is automatically initialized on first startup
- Data is persisted in Docker volume `postgres_data`
- All database operations use connection pooling for efficiency
- The service follows the same enable/disable pattern as target1
- All endpoints are deterministic and suitable for testing DDoS behavior