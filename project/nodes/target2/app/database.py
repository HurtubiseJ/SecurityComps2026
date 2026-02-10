import asyncpg
from pathlib import Path
import json
from typing import Optional

MASTER_CONFIG_PATH = Path(__file__).resolve().parent.parent / "MASTER_CONFIG.json"

def load_master_config():
    if not MASTER_CONFIG_PATH.exists():
        raise RuntimeError("MASTER_CONFIG.json not found")
    with open(MASTER_CONFIG_PATH) as f:
        return json.load(f)

MASTER_CONFIG = load_master_config()

# Global connection pool
_pool: Optional[asyncpg.Pool] = None

async def get_pool() -> asyncpg.Pool:
    """Get or create the database connection pool"""
    global _pool
    if _pool is None:
        db_config = MASTER_CONFIG.get("database", {})
        _pool = await asyncpg.create_pool(
            host=db_config.get("host", "postgres"),
            port=db_config.get("port", 5432),
            database=db_config.get("name", "target2_db"),
            user=db_config.get("user", "target2_user"),
            password=db_config.get("password", "target2_password"),
            min_size=1,
            max_size=db_config.get("max_connections", 20),
        )
    return _pool

async def close_pool():
    """Close the database connection pool"""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

async def init_db():
    """Initialize database schema and seed data"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Create tables
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                product_id INTEGER NOT NULL REFERENCES products(id),
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for better query performance
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id)")
        
        # Check if data already exists
        user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        
        if user_count == 0:
            # Seed users
            await conn.executemany(
                "INSERT INTO users (name, email) VALUES ($1, $2)",
                [
                    ("Alice Johnson", "alice@example.com"),
                    ("Bob Smith", "bob@example.com"),
                    ("Charlie Brown", "charlie@example.com"),
                    ("Diana Prince", "diana@example.com"),
                    ("Eve Wilson", "eve@example.com"),
                    ("Frank Miller", "frank@example.com"),
                    ("Grace Lee", "grace@example.com"),
                    ("Henry Davis", "henry@example.com"),
                    ("Ivy Chen", "ivy@example.com"),
                    ("Jack Taylor", "jack@example.com"),
                ]
            )
            
            # Seed products
            await conn.executemany(
                "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3)",
                [
                    ("Laptop", 999.99, 50),
                    ("Mouse", 29.99, 200),
                    ("Keyboard", 79.99, 150),
                    ("Monitor", 299.99, 75),
                    ("Headphones", 149.99, 100),
                    ("Webcam", 89.99, 80),
                    ("USB Drive", 19.99, 300),
                    ("External SSD", 199.99, 60),
                    ("Docking Station", 179.99, 40),
                    ("Wireless Charger", 49.99, 120),
                ]
            )
            
            # Seed orders (deterministic relationships)
            user_ids = await conn.fetch("SELECT id FROM users ORDER BY id")
            product_ids = await conn.fetch("SELECT id FROM products ORDER BY id")
            
            orders_data = []
            for i, user_row in enumerate(user_ids):
                # Each user gets 2-4 orders
                num_orders = (i % 3) + 2
                for j in range(num_orders):
                    product_idx = (i * num_orders + j) % len(product_ids)
                    orders_data.append((
                        user_row['id'],
                        product_ids[product_idx]['id'],
                        (i + j) % 5 + 1  # quantity between 1-5
                    ))
            
            await conn.executemany(
                "INSERT INTO orders (user_id, product_id, quantity) VALUES ($1, $2, $3)",
                orders_data
            )

