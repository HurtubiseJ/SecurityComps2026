
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

    def _process_net_connections(self):

        def inc_tcp_udp(type: str, isTcp: bool):
            if isTcp:
                self.network_tcp_count.labels(type).inc()
            else: 
                self.network_udp_count.labels(type).inc()
            return
        
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

        for b in [0, 1]:
            try:
                kind = "tcp" if b else "udp"
                netCon = psutil.net_connections(kind="")
            except:
                logging.exception("_process_net_connections Failed")
                    
            for conn in netCon:
                match conn.status:
                    case psutil.CONN_CLOSE:
                        inc_tcp_udp(psutil.CONN_CLOSE, True)
                        continue
                    case psutil.CONN_CLOSE_WAIT:
                        inc_tcp_udp(psutil.CONN_CLOSE_WAIT, True)
                        continue
                    case psutil.CONN_CLOSING:
                        inc_tcp_udp(psutil.CONN_CLOSING, True)
                        continue
                    case psutil.CONN_ESTABLISHED:
                        inc_tcp_udp(psutil.CONN_CLOSING, True)
                        continue
                    case psutil.CONN_FIN_WAIT1:
                        inc_tcp_udp(psutil.CONN_FIN_WAIT1, True)
                        continue
                    case psutil.CONN_FIN_WAIT2:
                        inc_tcp_udp(psutil.CONN_FIN_WAIT2, True)
                        continue
                    case psutil.CONN_LAST_ACK:
                        inc_tcp_udp(psutil.CONN_LAST_ACK, True)
                        continue
                    case psutil.CONN_LISTEN:
                        inc_tcp_udp(psutil.CONN_LISTEN, True)
                        continue
                    case psutil.CONN_SYN_RECV:
                        inc_tcp_udp(psutil.CONN_SYN_RECV, True)
                        continue
                    case psutil.CONN_SYN_SENT:
                        inc_tcp_udp(psutil.CONN_SYN_SENT, True)
                        continue
                    case psutil.CONN_TIME_WAIT:
                        inc_tcp_udp(psutil.CONN_TIME_WAIT, True)
                        continue
                    case psutil.CONN_NONE:
                        inc_tcp_udp(psutil.CONN_NONE, True)
                        continue
                    case _:
                        continue