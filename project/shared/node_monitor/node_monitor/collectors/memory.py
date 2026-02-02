# node_memory_MemTotal_bytesX
# node_memory_MemAvailable_bytesX
# node_memory_MemFree_bytesX
# node_memory_Buffers_bytesX
# node_memory_Cached_bytesX

# node_memory_Slab_bytes X
# node_memory_SlabReclaimable_bytes
# node_memory_SlabUnreclaimable_bytes

# node_memory_TcpMem_bytes
# node_memory_SwapTotal_bytesX
# node_memory_SwapFree_bytesX   

import psutil
from prometheus_client import Gauge
import logging

logger = logging.getLogger(__name__)

class MemoryMonitor:

    def __init__(self):
        self.memory_total_bytes = Gauge(
            "node_memory_MemTotal_bytes",
            "Total memory in bytes on Node",
            ['type']
        )

        self.memory_buffer_bytes = Gauge(
            "node_memory_buffer_bytes",
            "Node Memory Buffer size in bytes"
        )

        self.memory_cached_bytes = Gauge(
            "node_memory_cached_bytes",
            "Cached bytes on node",
        )

        self.memory_slab_bytes = Gauge(
            "node_memory_slab_total",
            "Node memory slab metric totals",
            ['type']
        )

        self.memory_swap_bytes = Gauge(
            'node_memory_swap_total',
            'Swap memory in bytes on node',
            ['type']
        )

    def collect(self):
        self._process_virtual_memory()
        self._process_swap_memory()

    def _process_virtual_memory(self):
        try:
            virtMem = psutil.virtual_memory()
        except:
            logger.exception("_process_virtual_memory failed")

        self.memory_total_bytes.labels('total').set(virtMem.total)
        self.memory_total_bytes.labels('available').set(virtMem.available)
        self.memory_total_bytes.labels('free').set(virtMem.free)

        if hasattr(virtMem, "buffers"):
            self.memory_buffer_bytes.set(virtMem.buffers)
        if hasattr(virtMem, 'cached'):
            self.memory_cached_bytes.set(virtMem.cached)
        if hasattr(virtMem, "slab"):
            self.memory_slab_bytes.labels('total').set(virtMem.slab)


    def _process_swap_memory(self):
        try:
            swapMem = psutil.swap_memory()
        except:
            logger.exception("_process_swap_memory failed")
        
        self.memory_swap_bytes.labels('total').set(swapMem.total)
        self.memory_swap_bytes.labels('used').set(swapMem.used)
        self.memory_swap_bytes.labels('free').set(swapMem.free)
        self.memory_swap_bytes.labels('sin').set(swapMem.sin)
        self.memory_swap_bytes.labels('frsoutee').set(swapMem.sout)

    
        