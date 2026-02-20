
# Network Interface
# node_network_receive_bytes_total{device}
# node_network_transmit_bytes_total{device}

# node_network_receive_packets_total{device}
# node_network_transmit_packets_total{device}

# node_network_receive_dropped_total{device}
# node_network_transmit_dropped_total{device}

# node_network_receive_errors_total{device}
# node_network_transmit_errors_total{device}

# TCP/UDP Kernel Metrics
# node_netstat_Tcp_ActiveOpens
# node_netstat_Tcp_PassiveOpens
# node_netstat_Tcp_CurrEstab
# node_netstat_Tcp_RetransSegs
# node_netstat_Tcp_InErrs
# node_netstat_Tcp_OutRsts

# node_netstat_Udp_InDatagrams
# node_netstat_Udp_NoPorts
# node_netstat_Udp_RcvbufErrors

# Cont... SYN Flood / Stress
# node_netstat_TcpExt_SyncookiesSent
# node_netstat_TcpExt_SyncookiesRecv
# node_netstat_TcpExt_SyncookiesFailed

# node_netstat_TcpExt_TCPAbortOnTimeout
# node_netstat_TcpExt_TCPAbortOnMemory
# node_netstat_TcpExt_ListenOverflows
# node_netstat_TcpExt_ListenDrops

# import logging
# import psutil 
# from prometheus_client import Counter, Gauge

# class NetworkMonitor:
#     def __init__(self):

#         self._last_net_counts = None

#         self.network_bytes_total = Counter(
#             "node_network_total_bytes",
#             "Total number of network bytes sent/recv on node",
#             ['type']
#         )
        
#         self.network_packets_total = Counter(
#             'node_network_total_packets',
#             "Total number of network packets sent/recv on node",
#             ['type']
#         )

#         self.network_error_total = Counter(
#             'node_network_errors_total',
#             "Total number of errors while send/recv on node",
#             ['type']
#         )

#         self.network_drop_total = Counter(
#             'node_network_drop_total', 
#             'Total number of dropped in/out packets',
#             ['type']
#         )

#         self.network_tcp_count = Gauge(
#             "node_network_tcp_count",
#             "TCP connections on node machine",
#             ['type']
#         )

#         self.network_udp_count = Gauge(
#             'node_network_udp_count',
#             "UDP connections on node",
#             ['type']
#         )


#         pass

#     def collect(self):
#         self._process_net_connections()
#         self._process_net_io_counters()
#         pass

#     def _process_net_io_counters(self):
#         try:
#             netCounts = psutil.net_io_counters()
#         except:
#             logging.exception("_process_net_io_counters failed")

#         def inc_if_positive(counter: Counter, label: str, value: int):
#             if value > 0:
#                 counter.labels(label).inc(value)

#         if self._last_net_counts is None:
#             self._last_net_counts = netCounts
#             return

#         inc_if_positive(self.network_bytes_total, "sent", netCounts.bytes_sent - self._last_net_counts.bytes_sent)
#         inc_if_positive(self.network_bytes_total, "recv", netCounts.bytes_recv - self._last_net_counts.bytes_recv)

#         inc_if_positive(self.network_packets_total, "sent", netCounts.packets_sent - self._last_net_counts.packets_sent)
#         inc_if_positive(self.network_packets_total, "recv", netCounts.packets_recv - self._last_net_counts.packets_recv)

#         inc_if_positive(self.network_error_total, 'sent', netCounts.errout - self._last_net_counts.errout)
#         inc_if_positive(self.network_error_total, 'recv', netCounts.errin - self._last_net_counts.errin)

#         inc_if_positive(self.network_drop_total, 'sent', netCounts.dropout - self._last_net_counts.dropout)
#         inc_if_positive(self.network_drop_total, 'recv', netCounts.dropin - self._last_net_counts.dropin)

#         self._last_net_counts = netCounts


#     def _process_net_connections(self, protocol="tcp"):
#         try:
#             netCon = psutil.net_connections(kind=protocol)
#         except:
#             logging.exception("_process_net_connections Failed")
#             return

#         established = 0
#         syns = 0
#         synr = 0
#         finw1 = 0
#         finw2 = 0
#         timewait = 0
#         close = 0
#         closewait = 0
#         lastack = 0
#         listen = 0
#         closing = 0
#         none = 0

#         def inc_counter():
#             counter = self.network_tcp_count if protocol == "tcp" else self.network_udp_count
#             counter.labels(psutil.CONN_CLOSE).set(close)
#             counter.labels(psutil.CONN_CLOSE_WAIT).set(closewait)
#             counter.labels(psutil.CONN_CLOSING).set(closing)
#             counter.labels(psutil.CONN_ESTABLISHED).set(established)
#             counter.labels(psutil.CONN_FIN_WAIT1).set(finw1)
#             counter.labels(psutil.CONN_FIN_WAIT2).set(finw2)
#             counter.labels(psutil.CONN_LAST_ACK).set(lastack)
#             counter.labels(psutil.CONN_LISTEN).set(listen)
#             counter.labels(psutil.CONN_SYN_RECV).set(synr)
#             counter.labels(psutil.CONN_SYN_SENT).set(syns)
#             counter.labels(psutil.CONN_TIME_WAIT).set(timewait)
#             counter.labels(psutil.CONN_NONE).set(none)

#         for conn in netCon:
#             match conn.status:
#                 case psutil.CONN_CLOSE:
#                     close += 1
#                     continue
#                 case psutil.CONN_CLOSE_WAIT:
#                     closewait += 1
#                     continue
#                 case psutil.CONN_CLOSING:
#                     closing += 1
#                     continue
#                 case psutil.CONN_ESTABLISHED:
#                     established += 1
#                     continue
#                 case psutil.CONN_FIN_WAIT1:
#                     finw1 += 1
#                     continue
#                 case psutil.CONN_FIN_WAIT2:
#                     finw2 += 1
#                     continue
#                 case psutil.CONN_LAST_ACK:
#                     lastack += 1
#                     continue
#                 case psutil.CONN_LISTEN:
#                     listen += 1
#                     continue
#                 case psutil.CONN_SYN_RECV:
#                     synr += 1
#                     continue
#                 case psutil.CONN_SYN_SENT:
#                     syns += 1
#                     continue
#                 case psutil.CONN_TIME_WAIT:
#                     timewait += 1
#                     continue
#                 case psutil.CONN_NONE:
#                     none += 1
#                     continue
#                 case _:
#                     continue
#         inc_counter()

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
            if delta > 0:
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
