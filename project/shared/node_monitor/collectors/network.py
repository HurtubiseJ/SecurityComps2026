
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

import logging
import psutil 
from prometheus_client import Counter, Gauge

class NetworkMonitor:
    def __init__(self):

        self._last_net_counts = None

        self.network_bytes_total = Counter(
            "node_network_total_bytes",
            "Total number of network bytes sent/recv on node",
            ['type']
        )
        
        self.network_packets_total = Counter(
            'node_network_total_packets',
            "Total number of network packets sent/recv on node",
            ['type']
        )

        self.network_error_total = Counter(
            'node_network_errors_total',
            "Total number of errors while send/recv on node",
            ['type']
        )

        self.network_drop_total = Counter(
            'node_network_drop_total', 
            'Total number of dropped in/out packets',
            ['type']
        )

        self.network_tcp_count = Gauge(
            "node_network_tcp_count",
            "TCP connections on node machine",
            ['type']
        )

        self.network_udp_count = Gauge(
            'node_network_udp_count',
            "UDP connections on node",
            ['type']
        )


        pass

    def collect(self):
        pass

    def _process_net_io_counters(self):
        try:
            netCounts = psutil.net_io_counters()
        except:
            logging.exception("_process_net_io_counters failed")

        def inc_if_positive(counter: Counter, label: str, value: int):
            if value > 0:
                counter.labels(label).inc(value)

        if self._last_net_counts is None:
            self._last_net_counts = netCounts
            return

        inc_if_positive(self.network_bytes_total, "sent", netCounts.bytes_sent - self._last_net_counts.bytes_sent)
        inc_if_positive(self.network_bytes_total, "recv", netCounts.bytes_recv - self._last_net_counts.bytes_recv)

        inc_if_positive(self.network_packets_total, "sent", netCounts.packets_sent - self._last_net_counts.packets_sent)
        inc_if_positive(self.network_packets_total, "recv", netCounts.packets_recv - self._last_net_counts.packets_recv)

        inc_if_positive(self.network_error_total, 'sent', netCounts.errout - self._last_net_counts.errout)
        inc_if_positive(self.network_error_total, 'recv', netCounts.errin - self._last_net_counts.errin)

        inc_if_positive(self.network_drop_total, 'sent', netCounts.dropout - self._last_net_counts.dropout)
        inc_if_positive(self.network_drop_total, 'recv', netCounts.dropin - self._last_net_counts.dropin)

    def _process_net_connections(self, protocol="tcp"):
        try:
            netCon = psutil.net_connections(kind=protocol)
        except:
            logging.exception("_process_net_connections Failed")

        established = 0
        syns = 0
        synr = 0
        finw1 = 0
        finw2 = 0
        timewait = 0
        close = 0
        closewait = 0
        lastack = 0
        listen = 0
        closing = 0
        none = 0

        def inc_counter():
            counter = self.network_tcp_count if protocol == "tcp" else self.network_udp_count
            counter.labels(psutil.CONN_CLOSE).set(close)
            counter.labels(psutil.CONN_CLOSE_WAIT).set(closewait)
            counter.labels(psutil.CONN_CLOSING).set(closing)
            counter.labels(psutil.CONN_ESTABLISHED).set(established)
            counter.labels(psutil.CONN_FIN_WAIT1).set(finw1)
            counter.labels(psutil.CONN_FIN_WAIT2).set(finw2)
            counter.labels(psutil.CONN_LAST_ACK).set(lastack)
            counter.labels(psutil.CONN_LISTEN).set(listen)
            counter.labels(psutil.CONN_SYN_RECV).set(synr)
            counter.labels(psutil.CONN_SYN_SENT).set(syns)
            counter.labels(psutil.CONN_TIME_WAIT).set(timewait)
            counter.labels(psutil.CONN_NONE).set(none)

        for conn in netCon:
            match conn.status:
                case psutil.CONN_CLOSE:
                    close += 1
                    continue
                case psutil.CONN_CLOSE_WAIT:
                    closewait += 1
                    continue
                case psutil.CONN_CLOSING:
                    closing += 1
                    continue
                case psutil.CONN_ESTABLISHED:
                    established += 1
                    continue
                case psutil.CONN_FIN_WAIT1:
                    finw1 += 1
                    continue
                case psutil.CONN_FIN_WAIT2:
                    finw2 += 1
                    continue
                case psutil.CONN_LAST_ACK:
                    lastack += 1
                    continue
                case psutil.CONN_LISTEN:
                    listen += 1
                    continue
                case psutil.CONN_SYN_RECV:
                    synr += 1
                    continue
                case psutil.CONN_SYN_SENT:
                    syns += 1
                    continue
                case psutil.CONN_TIME_WAIT:
                    timewait += 1
                    continue
                case psutil.CONN_NONE:
                    none += 1
                    continue
                case _:
                    continue
        inc_counter()