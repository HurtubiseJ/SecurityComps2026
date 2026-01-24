# HOW TO USE

## MASTER_CONFIG.json
The `node_monitor` uses the ENV variable `CONFIG_FILE_PATH` to locate the `MASTER_CONFIG.json` file. Defaults to `./MASTER_CONFIG.json` if not provided. **MASTER CONFIG FILE IS REQUIRED**. See FIGMA for vaild JSON structure. 

## Functionality
You must do the following to use the monitoring package. 
After adding the package prometheus will automatically export enabled metrics from `/metrics`. **DO NOT** add additional endpoints on `/metrics`

**IMPORTANT** `MASTER_CONFIG.json` MUST contain `fastapi` field in metrics. If True then monitor will collect fastAPI http metrics, if false, only system metrics are captured. Enable fastapi field **IF AND ONLY IF** fastAPI metrics are required/useful.

1. Import and add an instance of Registry. This class is located /node_monitor/registry.py
2. Bind Registry module to FastAPI using Registry.registerFastAPIApp(app=app)

Ex. Usage
\\\
from fastapi import FastAPI
from shared.node_monitor.registry import Registry

app = FastAPI() // FastAPI Instance
registry = Registry() // Registry Class

registry.registerFastAPIApp(app=app) // Bind prometheus to FastAPI instance (exposes /metrics)
\\\

