
#Pulls and configures collectors based on pulled Node config.
from config import configuration
import functools
import asyncio
import logging
from fastapi import FastAPI
from collectors.cpu import CPUMonitor
from collectors.memory import MemoryMonitor
from collectors.network import NetworkMonitor
from collectors.disk import DiskMonitor
from .fastapi import BindPrometheus

class Registry:

    def __init__(self):
        self.config = configuration
        self.interval = self.config.interval if configuration.interval else 1 #Default to 1 Sec

        self._task: asyncio.Task | None = None
        self._running = False

        self.collectors = []
        self.FastAPIBound = False 

        # Add enabled monitors
        self._register_enabled_monitors()
    
    def registerFastAPIApp(self, app: FastAPI) -> bool:
        '''
        Binds prometheus to FastAPI app instance. Collects various app level metrics.

        app: FastAPI (FastAPI app instance)
        Returns: bool (On success True, else False)
        '''
        success = BindPrometheus(app=app)
        if not success:
            return
    
        @app.on_event("startup")
        async def _start():
            await self.start()

        @app.on_event('shutdown')
        async def _stop():
            await self.stop()
    
    async def start(self):
        if self._running:
            logging.warning("Registry already running")
            return
    
        logging.info("Monitoring registry starting")
        self._running = True
        self._task = asyncio.create_task(self._collect_loop())

    async def stop(self):
        if not self._running:
            logging.warning("Monitoring Registry is not running")
            return
    
        logging.info("Stopping Monitoring loop")
        if self._task:
            self._task.cancel()
            self._task = None
        
        self._running = False

    async def _collect_loop(self):
        try:
            while self._running:
                for collector in self.collectors:
                    try:
                        collector.collect()
                    except Exception:
                        logging.exception("Collector %s failed", collector.__class__.__name__)
                await asyncio.sleep(self.interval)
        except asyncio.CancelledError:
            logging.exception("Monitor _collect_loop failed")
            pass

    def _register_enabled_monitors(self):
        if not self.config.enabled:
            logging.warning("Monioring disabled via config JSON")
            return
        self._register(CPUMonitor, self.config.metrics.cpu)
        self._register(DiskMonitor, self.config.metrics.disk)
        self._register(MemoryMonitor, self.config.metrics.memory)
        self._register(NetworkMonitor, self.config.metrics.network)

    def _register(self, cls, enabled: bool):
        if enabled:
            self.collectors.append(cls())



