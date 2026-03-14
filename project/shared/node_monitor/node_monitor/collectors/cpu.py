import logging
import time
from prometheus_client import Counter, Gauge

logger = logging.getLogger(__name__)


class CPUMonitor:
    def __init__(self):
        self._last_usage_usec = None
        self._last_user_usec = None
        self._last_system_usec = None
        self._last_time = None


        self.cpu_seconds_total = Counter(
            "node_container_cpu_seconds_total",
            "Cumulative CPU time spent in each mode (cgroup)",
            ["mode"],
        )


        self.cpu_time_pct = Gauge(
            "node_container_cpu_time_pct",
            "Percent CPU usage for this container",
            ["mode"],
        )


        self.cpu_stats_total = Counter(
            "node_container_cpu_stats_total",
            "Container CPU scheduling statistics",
            ["stat"],
        )

    def collect(self):
        stats = self._read_cpu_stat()
        if not stats:
            return

        now = time.time()

        usage_usec = stats.get("usage_usec", 0)
        user_usec = stats.get("user_usec", 0)
        system_usec = stats.get("system_usec", 0)
        nr_periods = stats.get("nr_periods", 0)
        nr_throttled = stats.get("nr_throttled", 0)
        throttled_usec = stats.get("throttled_usec", 0)

        if self._last_usage_usec is None:
            self._last_usage_usec = usage_usec
            self._last_user_usec = user_usec
            self._last_system_usec = system_usec
            self._last_time = now
            return

        delta_usage = usage_usec - self._last_usage_usec
        delta_user = user_usec - self._last_user_usec
        delta_system = system_usec - self._last_system_usec
        delta_time = now - self._last_time

        if delta_user > 0:
            self.cpu_seconds_total.labels("user").inc(delta_user / 1_000_000)

        if delta_system > 0:
            self.cpu_seconds_total.labels("system").inc(delta_system / 1_000_000)

        if delta_time > 0:
            cpu_percent = (delta_usage / 1_000_000) / delta_time * 100.0
            self.cpu_time_pct.labels("total").set(cpu_percent)

            user_percent = (delta_user / 1_000_000) / delta_time * 100.0
            system_percent = (delta_system / 1_000_000) / delta_time * 100.0

            self.cpu_time_pct.labels("user").set(user_percent)
            self.cpu_time_pct.labels("system").set(system_percent)

        self.cpu_stats_total.labels("nr_periods").inc(nr_periods)
        self.cpu_stats_total.labels("nr_throttled").inc(nr_throttled)
        self.cpu_stats_total.labels("throttled_usec").inc(throttled_usec)

        self._last_usage_usec = usage_usec
        self._last_user_usec = user_usec
        self._last_system_usec = system_usec
        self._last_time = now

    def _read_cpu_stat(self):
        try:
            with open("/sys/fs/cgroup/cpu.stat", "r") as f:
                lines = f.readlines()

            data = {}
            for line in lines:
                key, value = line.strip().split()
                data[key] = int(value)

            return data

        except Exception:
            logger.exception("Failed to read cgroup cpu.stat")
            return None
