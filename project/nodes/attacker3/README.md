# Attacker 3 - Slowloris

Slowloris-style L7 attacker that holds many sockets open and periodically sends partial headers to exhaust the target’s connection pool.

## Run
```bash
docker network create ddos-shared   # if not already
cd project/nodes/attacker3
docker-compose up --build
```
FastAPI control API is on `http://localhost:8040`.

## Control API
- `GET /health`
- `GET /config` / `POST /config`
- `POST /start`
- `POST /stop`
- `GET /status`
- Prometheus metrics at `/metrics` (via node_monitor)

## Default config (`MASTER_CONFIG.json`)
- `attack_type`: `"slowloris"`
- `socket_count`: `300`
- `header_interval_ms`: `10000` (send keep-alive header every 10s)
- `target_host`: `proxy`
- `target_port`: `8000`
- `headers`: `{ "User-Agent": "slowloris-attacker3" }`
- `payload_bytes`: `0` (set >0 to drip small bodies)
- `connect_timeout_ms`: `3000`

## How it works
1. Opens `socket_count` TCP connections to `target_host:target_port`.
2. Sends initial HTTP request line + headers.
3. In a background loop, sends one header line every `header_interval_ms` (and optional payload bytes) to keep sockets from closing.

## Monitoring
Key Prometheus metrics:
- `slowloris_active_connections`
- `slowloris_headers_sent_total`
- `slowloris_bytes_sent_total`
- `slowloris_connect_errors_total`
- `slowloris_attack_status`
