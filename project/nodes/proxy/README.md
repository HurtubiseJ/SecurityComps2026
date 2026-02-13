# Proxy Node

Sits between attackers and the target. Forwards traffic through nginx with rate limiting, connection limiting, and SYN backlog tuning.

```
Attacker -> Proxy (nginx:8000) -> Target (upstream:9000)
```

## Running

From the project root (starts all nodes including proxy):

```bash
cd project
docker compose up --build
```

Or just the proxy:

```bash
cd project/nodes/proxy
docker compose up --build
```

## Services

| Service | Container | Port | What it does |
|---------|-----------|------|-------------|
| proxy | `proxy` | 8001:8000 | Nginx reverse proxy with rate/connection limiting |
| proxy-app | `proxy-app` | 8003:8000 | FastAPI management API (stub endpoints) |
| nginx-exporter | `nginx-exporter` | 9113 | Converts nginx stats to Prometheus metrics |
| upstream | `upstream` | 9000 | Dummy backend (stand-in for real target) |

## Testing

```bash
curl http://localhost:8001/proxy-health   # "proxy ok" from nginx
curl http://localhost:8003/proxy-health   # {"status":"ok"} from FastAPI app
curl http://localhost:8001/               # forwards to upstream
```

## Mitigations

**Rate limiting** (nginx) -- 10 req/s per IP, burst 20. Returns 429 when exceeded.

**Connection limiting** (nginx) -- max 10 concurrent connections per IP. Returns 503 when exceeded.

**SYN backlog tuning** (sysctls) -- protects against SYN flood attacks:
- `tcp_max_syn_backlog=4096` -- larger queue for half-open connections
- `tcp_syncookies=1` -- SYN cookies when queue is full
- `tcp_synack_retries=2` -- faster cleanup of dead half-opens
- `somaxconn=4096` -- larger listen backlog

## Configuration

- **Backend target:** Edit `nginx/nginx.conf`, change the `upstream target_upstream` server address.
- **Rate limit:** Edit `rate=` and `burst=` in `nginx/nginx.conf`.
- **Connection limit:** Edit `limit_conn conn_limit N` in `nginx/nginx.conf`.
- **SYN tuning:** Edit `sysctls` in `docker-compose.yaml`.

## Layout

```
proxy/
  nginx/nginx.conf       -- nginx config (upstream, rate limit, connection limit)
  docker-compose.yaml    -- all proxy services + sysctls
  Dockerfile             -- nginx image
  Dockerfile.app         -- FastAPI app image
  app/main.py            -- FastAPI stub endpoints
  MASTER_CONFIG.json     -- node config
```
