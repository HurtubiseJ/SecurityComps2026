# Target Node 1 (`target1`)

This node simulates a real web application in a **controlled DDoS lab environment**. It acts as a target machine that exposes multiple endpoints and metrics so traffic and system behavior can be observed safely.

---

## What It Does

- Serves static HTML and API responses  
- Simulates background jobs and database reads/writes  
- Exposes Prometheus metrics for monitoring  
- Loads settings from `MASTER_CONFIG.json`

---

## Key Endpoints

- `GET /` -> Static page  
- `GET /health` -> Light health check  
- `GET /api/{func}` -> Simulates a function call with a small delay and random result
- `GET /config` -> Returns the current node configuration


---

## How to Run

```bash

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

cd app

uvicorn main:app --host 0.0.0.0 --port 8000

```
