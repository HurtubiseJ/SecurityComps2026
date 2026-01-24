# Disk IO
# node_disk_read_bytes_total{device}
# node_disk_write_bytes_total{device}
# node_disk_io_time_seconds_total{device}
# node_disk_io_wait_seconds_total{device}

import psutil
import logging
from prometheus_client import Counter


class DiskMonitor:

    def __init__(self):
        self._last_io = None

        self.disk_access_totals = Counter(
            "node_disk_total_count",
            "Total disk read-writes on Node",
            ['type']
        )

        self.disk_access_bytes = Counter(
            'node_disk_total_bytes',
            "Total disk read-writes in bytes",
            ['type']
        )

        self.disk_io_miliseconds_total = Counter(
            'node_disk_io_milieconds_total',
            'Node time spend on IO in miliseconds',
            ['type']
        )

    def collect(self):
        self._process_io_counters()

    def _process_io_counters(self):
        try:
            ioCounters = psutil.disk_io_counters()
        except:
            logging.exception("_process_io_counters failed")

        if self._last_io is None:
            self._last_io = ioCounters
            return
        
        def inc_if_positive(counter: Counter, label: str, value: int):
            if value > 0:
                counter.labels(label).inc(value)

        inc_if_positive(self.disk_access_bytes, 'read', ioCounters.read_bytes - self._last_io.read_bytes)
        inc_if_positive(self.disk_access_bytes, 'write', ioCounters.write_bytes - self._last_io.write_bytes)
        
        inc_if_positive(self.disk_access_totals, 'read', ioCounters.read_count - self._last_io.read_count)
        inc_if_positive(self.disk_access_totals, 'write', ioCounters.write_count - self._last_io.write_count)
        if hasattr(ioCounters, "read_merged_count") and hasattr(self._last_io, "read_merged_count"):
            inc_if_positive(self.disk_access_totals, "read_merged", ioCounters.read_merged_count - self._last_io.read_merged_count)
        if hasattr(ioCounters, "write_merged_count") and hasattr(self._last_io, "write_merged_count"):
            inc_if_positive(self.disk_access_totals, "write_merged", ioCounters.write_merged_count - self._last_io.write_merged_count)

        inc_if_positive(self.disk_io_miliseconds_total, "read", ioCounters.read_time - self._last_io.read_time)
        inc_if_positive(self.disk_io_miliseconds_total, "write", ioCounters.write_time - self._last_io.write_time)
        if hasattr(ioCounters, "busy_time") and hasattr(self._last_io, "busy_time"):
            inc_if_positive(self.disk_io_miliseconds_total, 'busy', ioCounters.busy_time - self._last_io.busy_time)

        self._last_io = ioCounters

            

