# Proxy Node

Proxy between clients/attackers and the target. Forwards traffic with **rate limiting** and **connection limiting** (Nginx).

## RUNNING

From the proxy node folder:

```bash
cd project/nodes/proxy
docker compose up -d
```

This starts:

- **nginx-proxy** — listens on ports 8000 and 8001 (8001 for attacker traffic), forwards to backend. **Rate limit:** 10 req/s per IP, burst 20 (429 when exceeded). **Connection limit:** max 10 concurrent connections per IP (503 when exceeded).
- **upstream-nginx** — local test backend (Python http.server on 9000). Used when the real target is unreachable.

## Testing

**Basic (proxy is up):**
```bash
curl http://localhost:8000/proxy-health   # proxy ok
curl http://localhost:8000/               # forwards to backend (200 if backend up)
```

## Attaching attacker and target

**Flow:** Attacker → Proxy → Target

1. **Attacker → Proxy**  
   Attacker (e.g. `attacker1-john`) uses `forward_host` / `forward_port` to send traffic to the proxy. With `forward_host: "localhost"` and `forward_port: "8001"`, the proxy must listen on **8001**. This repo’s proxy listens on both **8000** and **8001**, so no attacker config change is needed.

2. **Proxy → Target**  
   The proxy forwards to the host/port defined in `nginx/nginx.conf` in the `upstream target_upstream` block. By default it uses the local test backend (`upstream:9000`). To use the real target (e.g. target1):
   - In `nginx/nginx.conf`, set the upstream to the target’s address (e.g. `server 137.22.4.153:8000;` for target1 on that host, or `server target1:8000;` if both are on the same Docker network).
   - Restart: `docker compose restart nginx`.


## Configuration

- **Backend:** Edit `nginx/nginx.conf`. Default is `upstream:9000` (local). For real target uncomment `server 137.22.4.153:8000;` and comment `server upstream:9000;`, then `docker compose restart nginx`.
- **Rate limit:** In `nginx/nginx.conf`, adjust `rate=` and `burst=` in `limit_req_zone` and `limit_req`. `/proxy-health` is not rate limited.
- **Connection limit:** In `nginx/nginx.conf`, adjust `limit_conn conn_limit N;` (default 10). Stops one IP from opening too many concurrent connections.

## Testing connection limit

Max 10 concurrent connections per IP; extra get **503**. Run many requests at once (e.g. 15 in parallel):

```bash
cd project/nodes/proxy
for i in $(seq 1 15); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/ & done; wait
```

You should see some **503** (connection limit) in addition to **200**. If all are 200, connections are finishing too quickly—503 appears when more than 10 are *open at once* (i.e many slow or long-lived requests). Rate limiting can also produce **429** if you send too many requests per second.

## Layout

- `nginx/nginx.conf` — Nginx config (upstream, rate limit, connection limit, proxy).
- `docker-compose.yaml` — Nginx + upstream services.
- `Dockerfile` — Nginx image.
- `MASTER_CONFIG.json` — Node config
- `app/` — FastAPI app (config, rate-limit middleware); not used by current compose.
