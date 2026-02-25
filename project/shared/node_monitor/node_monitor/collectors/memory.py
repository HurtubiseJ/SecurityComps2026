# # node_memory_MemTotal_bytesX
# # node_memory_MemAvailable_bytesX
# # node_memory_MemFree_bytesX
# # node_memory_Buffers_bytesX
# # node_memory_Cached_bytesX

# # node_memory_Slab_bytes X
# # node_memory_SlabReclaimable_bytes
# # node_memory_SlabUnreclaimable_bytes

# # node_memory_TcpMem_bytes
# # node_memory_SwapTotal_bytesX
# # node_memory_SwapFree_bytesX   

# import psutil
# from prometheus_client import Gauge
# import logging

# logger = logging.getLogger(__name__)

# class MemoryMonitor:

#     def __init__(self):
#         self.memory_total_bytes = Gauge(
#             "node_memory_MemTotal_bytes",
#             "Total memory in bytes on Node",
#             ['type']
#         )

#         self.memory_buffer_bytes = Gauge(
#             "node_memory_buffer_bytes",
#             "Node Memory Buffer size in bytes"
#         )

#         self.memory_cached_bytes = Gauge(
#             "node_memory_cached_bytes",
#             "Cached bytes on node",
#         )

#         self.memory_slab_bytes = Gauge(
#             "node_memory_slab_total",
#             "Node memory slab metric totals",
#             ['type']
#         )

#         self.memory_swap_bytes = Gauge(
#             'node_memory_swap_total',
#             'Swap memory in bytes on node',
#             ['type']
#         )

#     def collect(self):
#         self._process_virtual_memory()
#         self._process_swap_memory()

#     def _process_virtual_memory(self):
#         try:
#             virtMem = psutil.virtual_memory()
#         except:
#             logger.exception("_process_virtual_memory failed")

#         self.memory_total_bytes.labels('total').set(virtMem.total)
#         self.memory_total_bytes.labels('available').set(virtMem.available)
#         self.memory_total_bytes.labels('free').set(virtMem.free)

#         if hasattr(virtMem, "buffers"):
#             self.memory_buffer_bytes.set(virtMem.buffers)
#         if hasattr(virtMem, 'cached'):
#             self.memory_cached_bytes.set(virtMem.cached)
#         if hasattr(virtMem, "slab"):
#             self.memory_slab_bytes.labels('total').set(virtMem.slab)


#     def _process_swap_memory(self):
#         try:
#             swapMem = psutil.swap_memory()
#         except:
#             logger.exception("_process_swap_memory failed")
        
#         self.memory_swap_bytes.labels('total').set(swapMem.total)
#         self.memory_swap_bytes.labels('used').set(swapMem.used)
#         self.memory_swap_bytes.labels('free').set(swapMem.free)
#         self.memory_swap_bytes.labels('sin').set(swapMem.sin)
#         self.memory_swap_bytes.labels('frsoutee').set(swapMem.sout)

import time
import logging
from prometheus_client import Counter, Gauge

logger = logging.getLogger(__name__)


class MemoryMonitor:
    def __init__(self):
        self._last_pgfault = None
        self._last_pgmajfault = None
        self._last_pgscan = None
        self._last_pgsteal = None

        # Current memory usage
        self.memory_usage_bytes = Gauge(
            "node_container_memory_usage_bytes",
            "Current memory usage in bytes (cgroup)"
        )

        self.memory_socket_bytes = Gauge(
            "node_container_memory_socket_bytes",
            "Memory used by socket buffers (network pressure indicator)"
        )

        self.memory_kernel_bytes = Gauge(
            "node_container_memory_kernel_bytes",
            "Kernel memory usage in bytes"
        )

        self.memory_slab_bytes = Gauge(
            "node_container_memory_slab_bytes",
            "Total slab memory usage in bytes"
        )

        # Fault / pressure counters
        self.memory_events_total = Counter(
            "node_container_memory_events_total",
            "Cumulative memory events",
            ["event"],
        )

    def collect(self):
        stats = self._read_memory_stat()
        if not stats:
            return

        # ---- Current Gauges ----
        usage_bytes = self._read_memory_current()
        if usage_bytes is not None:
            self.memory_usage_bytes.set(usage_bytes)

        self.memory_socket_bytes.set(stats.get("sock", 0))
        self.memory_kernel_bytes.set(stats.get("kernel", 0))
        self.memory_slab_bytes.set(stats.get("slab", 0))

        # ---- Cumulative Counters (delta-based) ----
        pgfault = stats.get("pgfault", 0)
        pgmajfault = stats.get("pgmajfault", 0)
        pgscan = stats.get("pgscan", 0)
        pgsteal = stats.get("pgsteal", 0)

        if self._last_pgfault is None:
            self._last_pgfault = pgfault
            self._last_pgmajfault = pgmajfault
            self._last_pgscan = pgscan
            self._last_pgsteal = pgsteal
            return

        delta_pgfault = pgfault - self._last_pgfault
        delta_pgmajfault = pgmajfault - self._last_pgmajfault
        delta_pgscan = pgscan - self._last_pgscan
        delta_pgsteal = pgsteal - self._last_pgsteal

        if delta_pgfault > 0:
            self.memory_events_total.labels("pgfault").inc(delta_pgfault)

        if delta_pgmajfault > 0:
            self.memory_events_total.labels("pgmajfault").inc(delta_pgmajfault)

        if delta_pgscan > 0:
            self.memory_events_total.labels("pgscan").inc(delta_pgscan)

        if delta_pgsteal > 0:
            self.memory_events_total.labels("pgsteal").inc(delta_pgsteal)

        self._last_pgfault = pgfault
        self._last_pgmajfault = pgmajfault
        self._last_pgscan = pgscan
        self._last_pgsteal = pgsteal

    def _read_memory_current(self):
        try:
            with open("/sys/fs/cgroup/memory.current", "r") as f:
                return int(f.read().strip())
        except Exception:
            logger.exception("Failed to read memory.current")
            return None

    def _read_memory_stat(self):
        try:
            with open("/sys/fs/cgroup/memory.stat", "r") as f:
                lines = f.readlines()

            data = {}
            for line in lines:
                key, value = line.strip().split()
                data[key] = int(value)

            return data

        except Exception:
            logger.exception("Failed to read memory.stat")
            return None
        