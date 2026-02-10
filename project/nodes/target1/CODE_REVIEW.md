# Code Review by John Hurtubise

## 01/26 JH
I took a look through the current code, great start! There are a few things I would try to modify as you move forward.

1. The node_monitor library will be able to capture a lot of metrics, before moving forward on metrics take a look through the shared folder. I will also improve the node_monitor documentation/talk in class about its capabilities. Right now the FastAPI integration with Prometheus is able to capture request counts, status codes, timinings, ect. **ALSO** it automatically exposes the `/metrics` endpoint for Prometheus, using the prometheus-client lib you can simply add Counters and the metrics will be automatically managed by the lib and added to `/metrics`.

We will prefer to use the shared node_monitor lib for all feasible metrics to reduce complexity and have focused functionality on the node machines. So some of the counters you have in `app/main.py` will be obsolete. 

2. Try to get the app running in Docker if possible. Will make collaboration and prod implimentation easier.

3. Make sure MASTER_CONFIG.json has a more robust open and load. Right now the code uses `Path(__file__).parent.parent` this will definitely work but could cause problems in the future. If the load code is moved outside of main this will break. Depending on docker COPY commands this could break. I would recommend using the .env file with **CONFIG_FILE_PATH** set based on the code PATH (This is a robust solution when implimented with docker WORKDIR). 

**IMPORTANT** the node_monitor package looks for **CONFIG_FILE_PATH** in the ENV to load montior configuration (although it defaults to root). So adding the condig path in the .env file will be ideal. 
