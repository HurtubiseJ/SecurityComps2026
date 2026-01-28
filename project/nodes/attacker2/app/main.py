from fastapi import FastAPI
from node_monitor import Registry
from urls import router


app = FastAPI()

app.include_router(router=router, prefix="")

registry = Registry()
registry.registerFastAPIApp(app=app)

