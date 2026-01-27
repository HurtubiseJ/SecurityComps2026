from fastapi import FastAPI
from node_monitor import Registry

app = FastAPI()

registry = Registry()
registry.registerFastAPIApp(app=app)

