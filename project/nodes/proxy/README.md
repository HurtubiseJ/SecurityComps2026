# Proxy Node

This node acts as a proxy between clients/attackers and the target service.

Traffic path: `client/attacker -> proxy -> target`

## Current Mode: Basic Forwarding

The proxy is currently configured for **basic forwarding only**. It simply forwards requests to the upstream target.

### Quick Commands
**Using Docker Compose (Recommended):**
```bash
cd project/nodes/proxy
docker-compose up
```

**Using Docker:**
```bash
cd project/nodes/proxy
docker build -t proxy .
docker run -d -p 8000:8000 --name proxy proxy
```

**Using Local Nginx:**
```bash
cd project/nodes/proxy
sudo nginx -t -c $(pwd)/nginx/nginx.conf
sudo nginx -c $(pwd)/nginx/nginx.conf
```

**Test:**
```bash
curl http://localhost:8000/proxy-health
curl http://localhost:8000/
```

### Using Python Proxy (Alternative)

If you want to use the Python FastAPI proxy instead:

1. Install dependencies:
```bash
cd python
pip install -r requirements.txt
```

2. Run the proxy:
```bash
python proxy.py
```

## Nginx Configuration

The nginx configuration is in `nginx/nginx.conf`. This proxy acts as a relay and forwards data from the internal server to the client.

### What It Does

- Listens on port 8000 for incoming requests
- Forwards all requests to upstream target (137.22.4.153:8000)
- Provides health check endpoint at `/proxy-health`
- Sets proper proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)
- Handles connection timeouts (5s connect, 30s read/send)

### Configuration Details

The nginx config uses an `upstream` block to define the target server:

```nginx
upstream target_upstream {
  server 137.22.4.153:8000;  # target (grape00)
}
```

All requests hitting the proxy on port 8000 get forwarded to this upstream. The proxy preserves:
- Original request method (GET, POST, etc.)
- Request path and query parameters
- Request body
- Most request headers (filters out hop-by-hop headers)

### Request Flow

```
Client Request → Proxy (port 8000) → Upstream (137.22.4.153:8000) → Response → Client
```

The proxy is transparent - it doesn't modify request/response content, just forwards it through.

### Headers Added by Proxy

The proxy automatically adds these headers to help the upstream server identify the original client:

- `X-Real-IP`: Original client IP address
- `X-Forwarded-For`: Client IP (or chain of proxies)
- `X-Forwarded-Proto`: Original protocol (http/https)
- `Host`: Original host header from client


### Health Check Endpoint

The `/proxy-health` endpoint returns immediately without forwarding:

```bash
curl http://localhost:8000/proxy-health
# Returns: proxy ok
```



## Python Proxy Configuration (Alternative)

If using the Python proxy, configuration is loaded from `MASTER_CONFIG.json`.

## API Endpoints

### Health Check
- `GET /proxy-health` - Simple health check

### Status & Management
- `GET /proxy/status` - Get proxy status and configuration
- `POST /proxy/config` - Update configuration
- `POST /proxy/apply` - Apply current configuration (reload mitigations)
- `POST /proxy/reset` - Reset proxy state (clear rate limit buckets, connection counts)

### Metrics
- `GET /metrics` - Prometheus metrics endpoint (exposed via node_monitor)
- `POST /metrics/set-log-level` - Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

### Request Forwarding
- All other requests are forwarded to the upstream target configured in `MASTER_CONFIG.json`

## Testing

### Health Check
Test if the proxy is running:
```bash
curl http://localhost:8000/proxy-health
# Expected: proxy ok
```

### Forwarding Test
Test if requests are being forwarded to upstream:
```bash
curl http://localhost:8000/
# This forwards to 137.22.4.153:8000
```




- **Proxy listens on:** Port 8000 (all interfaces: 0.0.0.0)
- **Proxy forwards to:** 137.22.4.153:8000
- **Health check:** Available on same port 8000 at `/proxy-health`

### Testing Network Connectivity

From proxy machine, test if target is reachable:
```bash
curl http://137.22.4.153:8000/
ping 137.22.4.153
telnet 137.22.4.153 8000
```

From client machine, test if proxy is reachable:
```bash
curl http://137.22.4.154:8000/proxy-health
```


## Forwarding Behavior

### What Gets Forwarded

The proxy forwards:
- All HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- All request paths and query strings
- Request bodies (for POST, PUT, PATCH)
- Most request headers
- All response data from upstream

## Notes

- Currently using nginx for basic forwarding - no mitigations active
- Python proxy code exists in `python/` directory but is not being used
- Rate limiting uses a token bucket algorithm (when enabled via Python proxy)
-Docker sudo permissions off in pi's
- Connection limiting tracks active connections per IP or globally (when enabled)
- The proxy integrates with the shared `node_monitor` package for system-level metrics (Python proxy only)
- Configuration changes via API are persisted to `MASTER_CONFIG.json` (Python proxy only)
