from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from node_monitor import Registry
from urls import router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

registry = Registry()
registry.registerFastAPIApp(app=app)


app.include_router(router=router, prefix="")



