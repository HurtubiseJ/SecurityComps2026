import logging
from prometheus_client import Counter, Gauge

logger = logging.getLogger(__name__)


class NetworkMonitor:
    def __init__(self, interface="eth0"):
        self.interface = interface
        self._last_stats = None
        
        self.network_bytes_total = Counter(
            "container_network_bytes_total",
            "Total number of network bytes sent/recv by container",
            ["direction"],
        )

        self.network_packets_total = Counter(
            "container_network_packets_total",
            "Total number of network packets sent/recv by container",
            ["direction"],
        )

        self.network_error_total = Counter(
            "container_network_errors_total",
            "Total network errors",
            ["direction"],
        )

        self.network_drop_total = Counter(
            "container_network_dropped_total",
            "Total dropped packets",
            ["direction"],
        )

        # Connection state gauges
        self.network_tcp_count = Gauge(
            "container_network_tcp_connections",
            "TCP connections by state",
            ["state"],
        )

        self.network_udp_count = Gauge(
            "container_network_udp_sockets",
            "UDP socket count",
        )

    def collect(self):
        self._collect_interface_stats()
        self._collect_connection_states()


    def _collect_interface_stats(self):
        try:
            stats = self._read_interface_stats()
        except Exception:
            logger.exception("Failed reading interface stats")
            return

        if self._last_stats is None:
            self._last_stats = stats
            return

        def inc(counter, label, delta):
            if delta >= 0:
                counter.labels(label).inc(delta)

        inc(self.network_bytes_total, "recv", stats["rx_bytes"] - self._last_stats["rx_bytes"])
        inc(self.network_bytes_total, "sent", stats["tx_bytes"] - self._last_stats["tx_bytes"])

        inc(self.network_packets_total, "recv", stats["rx_packets"] - self._last_stats["rx_packets"])
        inc(self.network_packets_total, "sent", stats["tx_packets"] - self._last_stats["tx_packets"])

        inc(self.network_error_total, "recv", stats["rx_errors"] - self._last_stats["rx_errors"])
        inc(self.network_error_total, "sent", stats["tx_errors"] - self._last_stats["tx_errors"])

        inc(self.network_drop_total, "recv", stats["rx_dropped"] - self._last_stats["rx_dropped"])
        inc(self.network_drop_total, "sent", stats["tx_dropped"] - self._last_stats["tx_dropped"])

        self._last_stats = stats

    def _read_interface_stats(self):
        base = f"/sys/class/net/{self.interface}/statistics/"
        return {
            "rx_bytes": int(open(base + "rx_bytes").read()),
            "tx_bytes": int(open(base + "tx_bytes").read()),
            "rx_packets": int(open(base + "rx_packets").read()),
            "tx_packets": int(open(base + "tx_packets").read()),
            "rx_errors": int(open(base + "rx_errors").read()),
            "tx_errors": int(open(base + "tx_errors").read()),
            "rx_dropped": int(open(base + "rx_dropped").read()),
            "tx_dropped": int(open(base + "tx_dropped").read()),
        }


    def _collect_connection_states(self):
        tcp_states = {
            "ESTABLISHED": 0,
            "SYN_SENT": 0,
            "SYN_RECV": 0,
            "FIN_WAIT1": 0,
            "FIN_WAIT2": 0,
            "TIME_WAIT": 0,
            "CLOSE": 0,
            "CLOSE_WAIT": 0,
            "LAST_ACK": 0,
            "LISTEN": 0,
            "CLOSING": 0,
        }

        try:
            with open("/proc/net/tcp", "r") as f:
                lines = f.readlines()[1:]  # skip header

            for line in lines:
                parts = line.split()
                state_hex = parts[3]
                state = self._tcp_state_from_hex(state_hex)
                if state in tcp_states:
                    tcp_states[state] += 1

            for state, count in tcp_states.items():
                self.network_tcp_count.labels(state).set(count)

            # UDP count
            with open("/proc/net/udp", "r") as f:
                udp_lines = f.readlines()[1:]

            self.network_udp_count.set(len(udp_lines))

        except Exception:
            logger.exception("Failed reading /proc/net")

    def _tcp_state_from_hex(self, hex_state):
        mapping = {
            "01": "ESTABLISHED",
            "02": "SYN_SENT",
            "03": "SYN_RECV",
            "04": "FIN_WAIT1",
            "05": "FIN_WAIT2",
            "06": "TIME_WAIT",
            "07": "CLOSE",
            "08": "CLOSE_WAIT",
            "09": "LAST_ACK",
            "0A": "LISTEN",
            "0B": "CLOSING",
        }
        return mapping.get(hex_state, "UNKNOWN")
