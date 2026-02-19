import psutil
import logging
from prometheus_client import Counter, Gauge

logger = logging.getLogger(__name__)

class CPUMonitor:
    def __init__(self):
        self._last_cpu_times = None
        self._last_cpu_stats = None

        self.cpu_seconds_total = Counter(
            "node_cpu_seconds_total",
            "Cumulative CPU time spent in each mode",
            ["mode"],
        )

        self.cpu_time_pct = Gauge(
            "node_cpu_time_pct",
            "Percent values for CPU usage",
            ['mode']
        )

        self.cpu_stats_total = Counter(
            "node_cpu_stats_total",
            "CPU statistics",
            ["stat"],
        )

    def collect(self):
        self._collect_cpu_time()
        self._collect_cpu_time_pct()
        self._collect_cpu_stats()

    def _collect_cpu_time(self):
        try:
            cpu = psutil.cpu_times()
        except Exception:
            logger.exception("Failed to read cpu_times")
            return

        if self._last_cpu_times is None:
            self._last_cpu_times = cpu
            return

        def inc_if_positive(mode: str, value: float):
            if value > 0:
                self.cpu_seconds_total.labels(mode).inc(value)

        inc_if_positive("user", cpu.user - self._last_cpu_times.user)
        inc_if_positive("system", cpu.system - self._last_cpu_times.system)
        inc_if_positive("idle", cpu.idle - self._last_cpu_times.idle)

        if hasattr(cpu, "iowait"):
            inc_if_positive("iowait", cpu.iowait - self._last_cpu_times.iowait)
        if hasattr(cpu, "irq"):
            inc_if_positive("irq", cpu.irq - self._last_cpu_times.irq)
        if hasattr(cpu, "softirq"):
            inc_if_positive("softirq", cpu.softirq - self._last_cpu_times.softirq)
        if hasattr(cpu, "steal"):
            inc_if_positive("steal", cpu.steal - self._last_cpu_times.steal)

        self._last_cpu_times = cpu

    def _collect_cpu_time_pct(self):
        try:
            cpu = psutil.cpu_times_percent()
        except Exception:
            logger.exception("Failed to read _cpu_time_pct")

        self.cpu_time_pct.labels("user").set(cpu.user)
        self.cpu_time_pct.labels("system").set(cpu.system)
        self.cpu_time_pct.labels("idle").set(cpu.idle)
        if hasattr(cpu, 'iowait'):
            self.cpu_time_pct.labels("iowait").set(cpu.iowait)
        if hasattr(cpu, 'irq'):
            self.cpu_time_pct.labels("irq").set(cpu.irq)
        if hasattr(cpu, 'softirq'):
            self.cpu_time_pct.labels("softirq").set(cpu.softirq)
        if hasattr(cpu, 'steal'):
            self.cpu_time_pct.labels("steal").set(cpu.steal)

        
        
    def _collect_cpu_stats(self):
        try:
            stats = psutil.cpu_stats()
        except Exception:
            logger.exception("Failed to read cpu_stats")
            return

        if self._last_cpu_stats is None:
            self._last_cpu_stats = stats
            return

        def inc_stat(name: str, current: int, previous: int):
            delta = current - previous
            if delta > 0:
                self.cpu_stats_total.labels(name).inc(delta)

        inc_stat("ctx_switches", stats.ctx_switches, self._last_cpu_stats.ctx_switches)
        inc_stat("interrupts", stats.interrupts, self._last_cpu_stats.interrupts)
        inc_stat("soft_interrupts", stats.soft_interrupts, self._last_cpu_stats.soft_interrupts)
        inc_stat("syscalls", stats.syscalls, self._last_cpu_stats.syscalls)

        self._last_cpu_stats = stats
