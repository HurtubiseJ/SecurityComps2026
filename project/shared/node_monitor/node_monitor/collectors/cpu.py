# import psutil
# import logging
# from prometheus_client import Counter, Gauge

# logger = logging.getLogger(__name__)

# class CPUMonitor:
#     def __init__(self):
#         self._last_cpu_times = None
#         self._last_cpu_stats = None

#         self.cpu_seconds_total = Counter(
#             "node_cpu_seconds_total",
#             "Cumulative CPU time spent in each mode",
#             ["mode"],
#         )

#         self.cpu_time_pct = Gauge(
#             "node_cpu_time_pct",
#             "Percent values for CPU usage",
#             ['mode']
#         )

#         self.cpu_stats_total = Counter(
#             "node_cpu_stats_total",
#             "CPU statistics",
#             ["stat"],
#         )

#     def collect(self):
#         self._collect_cpu_time()
#         self._collect_cpu_time_pct()
#         self._collect_cpu_stats()

#     def _collect_cpu_time(self):
#         try:
#             cpu = psutil.cpu_times()
#         except Exception:
#             logger.exception("Failed to read cpu_times")
#             return

#         if self._last_cpu_times is None:
#             self._last_cpu_times = cpu
#             return

#         def inc_if_positive(mode: str, value: float):
#             if value > 0:
#                 self.cpu_seconds_total.labels(mode).inc(value)

#         inc_if_positive("user", cpu.user - self._last_cpu_times.user)
#         inc_if_positive("system", cpu.system - self._last_cpu_times.system)
#         inc_if_positive("idle", cpu.idle - self._last_cpu_times.idle)

#         if hasattr(cpu, "iowait"):
#             inc_if_positive("iowait", cpu.iowait - self._last_cpu_times.iowait)
#         if hasattr(cpu, "irq"):
#             inc_if_positive("irq", cpu.irq - self._last_cpu_times.irq)
#         if hasattr(cpu, "softirq"):
#             inc_if_positive("softirq", cpu.softirq - self._last_cpu_times.softirq)
#         if hasattr(cpu, "steal"):
#             inc_if_positive("steal", cpu.steal - self._last_cpu_times.steal)

#         self._last_cpu_times = cpu

#     def _collect_cpu_time_pct(self):
#         try:
#             cpu = psutil.cpu_times_percent()
#         except Exception:
#             logger.exception("Failed to read _cpu_time_pct")

#         self.cpu_time_pct.labels("user").set(cpu.user)
#         self.cpu_time_pct.labels("system").set(cpu.system)
#         self.cpu_time_pct.labels("idle").set(cpu.idle)
#         if hasattr(cpu, 'iowait'):
#             self.cpu_time_pct.labels("iowait").set(cpu.iowait)
#         if hasattr(cpu, 'irq'):
#             self.cpu_time_pct.labels("irq").set(cpu.irq)
#         if hasattr(cpu, 'softirq'):
#             self.cpu_time_pct.labels("softirq").set(cpu.softirq)
#         if hasattr(cpu, 'steal'):
#             self.cpu_time_pct.labels("steal").set(cpu.steal)

        
        
#     def _collect_cpu_stats(self):
#         try:
#             stats = psutil.cpu_stats()
#         except Exception:
#             logger.exception("Failed to read cpu_stats")
#             return

#         if self._last_cpu_stats is None:
#             self._last_cpu_stats = stats
#             return

#         def inc_stat(name: str, current: int, previous: int):
#             delta = current - previous
#             if delta > 0:
#                 self.cpu_stats_total.labels(name).inc(delta)

#         inc_stat("ctx_switches", stats.ctx_switches, self._last_cpu_stats.ctx_switches)
#         inc_stat("interrupts", stats.interrupts, self._last_cpu_stats.interrupts)
#         inc_stat("soft_interrupts", stats.soft_interrupts, self._last_cpu_stats.soft_interrupts)
#         inc_stat("syscalls", stats.syscalls, self._last_cpu_stats.syscalls)

#         self._last_cpu_stats = stats

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
