# Attacker 1 - Layer 7 HTTP Attacker

Layer 7 HTTP flood attacking machine using wrk2. Executes HTTP flood attacks targeting one or more endpoints with valid requests and configurable rate limiting.

## Purpose

- Execute L7 HTTP Flood attacks with precise rate control
- Targets one or more endpoints with valid requests and timings
- Resource exhaustion comes from number of requests and normal server work

## Tools

- **wrk2**: High-performance HTTP benchmarking tool with constant throughput rate control
- Uses the [AmpereTravis/wrk2-aarch64](https://github.com/AmpereTravis/wrk2-aarch64) fork for ARM64/Apple Silicon compatibility
- Supports configurable request rates, paths, methods, and headers

## Configuration

Configuration is managed via `MASTER_CONFIG.json` (mounted as a volume for hot-reload):

```json
{
    "monitor": {
        "enabled": true,
        "metrics": {...}
    },
    "custom_config": {
        "attack": {
            "attack_type": "http_flood",
            "threads": 4,
            "connections": 200,
            "rate_rps": 5000,
            "method": "GET",
            "paths": ["/api/test", "/health"],
            "path_ratios": [0.8, 0.2],
            "headers": {"User-Agent": "wrk"},
            "keep_alive": true,
            "target_host": "target1",
            "target_port": 8001
        }
    }
}
```

### Configuration Parameters

- `attack_type`: Type of attack (currently supports "http_flood")
- `threads`: Number of worker threads (typically 2-4x CPU cores)
- `connections`: Total concurrent connections
- `rate_rps`: Total requests per second (distributed across paths based on ratios)
- `method`: HTTP method (GET, POST, PUT, etc.)
- `paths`: Array of target paths to attack
- `path_ratios`: Distribution ratios for paths (must sum to 1.0)
  - Example: `[0.8, 0.2]` means 80% of requests go to first path, 20% to second
- `headers`: Custom HTTP headers as key-value pairs
- `keep_alive`: Enable HTTP keep-alive connections (true/false)
- `target_host`: Target host (container name or IP address)
- `target_port`: Target host port

## API Endpoints

### Control Endpoints

- `POST /attack/start` - Start HTTP flood attack with configuration from MASTER_CONFIG.json
  - Returns: Attack status and process information
- `POST /attack/stop` - Stop running attack
  - Returns: Stopped process count
- `GET /attack/status` - Get current attack status
  - Returns: Status, running processes, and their configurations

### Information Endpoints

- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint
- `GET /config` - Get current configuration (master config + attack config)
- `GET /metrics` - Prometheus metrics endpoint

## Prometheus Metrics

The attacker exposes the following metrics:

- `attack_requests_sent_total{path, method}` - Total HTTP requests sent
- `attack_requests_per_second{path}` - Current requests per second
- `attack_bytes_sent_total{path}` - Total bytes sent
- `attack_active_connections` - Active attack connections
- `attack_status` - Attack status (0=idle, 1=running, 2=stopped)

## How to Run

### Prerequisites

1. **Docker Network**: Create the shared network if it doesn't exist:
   ```bash
   docker network create ddos-shared
   ```

2. **Target Running**: Ensure your target (e.g., target1) is running and connected to `ddos-shared` network

### Using Docker Compose (Recommended)

```bash
cd project/nodes/attacker1
docker-compose up --build
```

This will:
- Build the container with wrk2 compiled from the ARM64-compatible fork
- Start the FastAPI control interface on port 8000
- Connect to the `ddos-shared` network
- Mount `MASTER_CONFIG.json` for easy configuration updates

**Note**: The first build will take a few minutes as it compiles wrk2 from source. Subsequent builds will be faster due to Docker layer caching.

### Starting an Attack

1. Ensure `MASTER_CONFIG.json` is configured with your attack parameters
2. Start the attack:
   ```bash
   curl -X POST http://localhost:8000/attack/start
   ```
3. Check attack status:
   ```bash
   curl http://localhost:8000/attack/status
   ```
4. Stop the attack:
   ```bash
   curl -X POST http://localhost:8000/attack/stop
   ```

### Updating Configuration

To change attack parameters without rebuilding:

1. Edit `MASTER_CONFIG.json`
2. Restart the container to reload config:
   ```bash
   docker restart attacker1
   ```
3. Start a new attack with the updated config

### Testing wrk2 Manually

You can test wrk2 directly inside the container:

```bash
# Test with rate limiting (10 RPS for 5 seconds)
docker exec attacker1 wrk -t1 -c1 -d5s -R10 http://target1:8001/health
```

## Architecture

- **FastAPI Application**: Provides REST API for attack control
- **wrk2 Processes**: Separate wrk2 processes for each path with rate distribution
- **Process Management**: Tracks and manages attack process lifecycle
- **Monitoring Integration**: Integrates with node_monitor for system metrics

## Path Distribution

When multiple paths are specified with `path_ratios`, the attacker:
1. Calculates RPS per path based on ratios
2. Launches separate wrk2 processes for each path
3. Each process runs at its calculated rate
4. Total RPS across all processes equals `rate_rps`

Example: With `rate_rps: 5000`, `paths: ["/api/test", "/health"]`, `path_ratios: [0.8, 0.2]`:
- Path 1 (`/api/test`): 4000 RPS (80%)
- Path 2 (`/health`): 1000 RPS (20%)

## ARM64/Apple Silicon Support

This implementation uses the [AmpereTravis/wrk2-aarch64](https://github.com/AmpereTravis/wrk2-aarch64) fork which provides proper ARM64 support. The original `giltene/wrk2` has LuaJIT compatibility issues on Apple Silicon.

The Dockerfile is configured for `linux/arm64` platform and will build correctly on M1/M2/M3 Macs.

## Notes

- Attacks run until explicitly stopped via `/attack/stop`
- Multiple attacks cannot run simultaneously
- Configuration is loaded from `MASTER_CONFIG.json` at startup (restart container to reload)
- The `-R` flag (rate) is **required** for wrk2 - it enforces constant throughput
- If `target_host`/`target_port` are not specified in attack config, falls back to `forward_host`/`forward_port` from base config
