# Bind to node's fastapi application

from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import FastAPI
import logging

def BindPrometheus(app: FastAPI) -> bool:
    try:
        Instrumentator(    
            should_group_status_codes=True,
            should_ignore_untemplated=True,
            # instrument_http=configuration.metrics['fastapi'],
            excluded_handlers=["/metrics"],
        ).instrument(app=app).expose(app, "/metrics")
        return True
    except:
        logging.exception("Failed to bind prometheus to fastAPI app. Does config contain 'fastapi' field?")
        return False