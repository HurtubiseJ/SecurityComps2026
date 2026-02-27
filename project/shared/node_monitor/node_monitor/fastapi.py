# Bind to node's fastapi application

from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import FastAPI
import logging
import os

def BindPrometheus(app: FastAPI) -> bool:
    try:
        Instrumentator().instrument(app).expose(app)
        return True
    except:
        logging.exception("Failed to bind prometheus to fastAPI app. Does config contain 'fastapi' field?")
        return False