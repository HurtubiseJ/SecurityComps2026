# HOW TO USE

## MASTER_CONFIG.json
The library looks for `./MASTER_CONFIG.json`. In your dockerfile make sure to copy the config into the app root. **MASTER CONFIG FILE IS REQUIRED**. Look at attacker1/MASTER_CONFIG.json for correct structure.

## Functionality
You must do the following to use the monitoring package. 
After adding the package prometheus will automatically export enabled metrics from `/metrics`. **DO NOT** add additional endpoints on `/metrics`

**IMPORTANT** `MASTER_CONFIG.json` MUST contain `fastapi` field in metrics. If True then monitor will collect fastAPI http metrics, if false, only system metrics are captured. Enable fastapi field **IF AND ONLY IF** fastAPI metrics are required/useful.

1. Import and add an instance of Registry. This class is located /node_monitor/registry.py
2. Bind Registry module to FastAPI using Registry.registerFastAPIApp(app=app)

Ex. Usage
\\\
from fastapi import FastAPI
from node_monitor import Registry

app = FastAPI() // FastAPI Instance
registry = Registry() // Registry Class

registry.registerFastAPIApp(app=app) // Bind prometheus to FastAPI instance (exposes /metrics)
\\\

3. 
4. LOOK AT `nodes/attacker2/Dockerfile` `nodes/attacker2/docker-compose.yaml` and `nodes/attacker2/MASTER_CONFIG.json`. Note the build root is /project/ **NOT** /attacker2 (See docker-compose context: ../../). This is so docker can access `shared/node_monitor`. The `Dockerfile` copies the node_monitor lib and downloads it to be used as a pip installed library. You will need to imcorperate this into each nodes dockerfiles. 

