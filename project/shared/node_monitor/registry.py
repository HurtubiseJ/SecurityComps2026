
#Pulls and configures collectors based on pulled Node config.
from config import configuration
import functools
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
        self.CPUMonitor = None
        self.MemoryMonitor = None
        self.NetworkMonitor = None
        self.DiskMonitor = None

        self.FastAPIBound = False 



        self.registerEnabledMonitors()

    def enabled(func):
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.config.enabled:
                logging.exception("Function not enabled. Is montoring.enabled True in config.json?")
            res = func(*args, **kwargs)
            return res
        return wrapper
    
    def registerFastAPIApp(self, app: FastAPI) -> bool:
        '''
        Binds prometheus to FastAPI app instance. Collects various app level metrics.

        app: FastAPI (FastAPI app instance)
        Returns: bool (On success True, else False)
        '''
        success = BindPrometheus(app=app)
        if success:
            self.FastAPIBound = True
            return True
        return False
    
    
    def registerEnabledMonitors(self):
        self.RegisterCPUMonitor()
        self.RegisterDiskMonitor()
        self.RegisterMemoryMonitor()
        self.RegisterNetworkMonitor()


    @enabled
    def RegisterCPUMonitor(self):
        # if self.config.metrics.cpu:
        self.CPUMonitor = CPUMonitor()

        pass

    @enabled
    def RegisterMemoryMonitor(self):
        self.MemoryMonitor = MemoryMonitor()

    @enabled
    def RegisterNetworkMonitor(self):
        self.NetworkMonitor = NetworkMonitor()

    @enabled
    def RegisterDiskMonitor(self):
        self.DiskMonitor = DiskMonitor()


