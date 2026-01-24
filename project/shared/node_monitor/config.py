# File will pull node config file for monitoring config
import os 
import json

class Config:

    def __init__(self):
        self.configPath = os.getenv("CONFIG_FILE_PATH", "./MASTER_CONFIG.json")

        try:    
            with open(self.configPath, "r") as f:
                config = json.load(f)


            assert hasattr(config, "enabled")
            assert hasattr(config, "metrics")
            assert hasattr(config, "interval")
        except:
            raise Exception("Configuration JSON file must contain fields 'enabled' and 'metrics'")


        self.enabled = config.enabled
        self.interval = config.interval
        self.metrics = config.metrics

configuration = Config()


# METRICS LIST
## REFINED

# CPU
# node_cpu_seconds_total{cpu,mode="user"}
# node_cpu_seconds_total{cpu,mode="system"}
# node_cpu_seconds_total{cpu,mode="idle"}
# node_cpu_seconds_total{cpu,mode="iowait"}
# node_cpu_seconds_total{cpu,mode="softirq"}
# node_cpu_seconds_total{cpu,mode="irq"}
# node_cpu_seconds_total{cpu,mode="steal"}

# Load/Scheduling
# node_load1
# node_load5
# node_load15

# node_pressure_cpu_waiting_seconds_total
# node_pressure_memory_stalled_seconds_total
# node_pressure_io_stalled_seconds_total

#Memory
# node_memory_MemTotal_bytes
# node_memory_MemAvailable_bytes
# node_memory_MemFree_bytes
# node_memory_Buffers_bytes
# node_memory_Cached_bytes

# node_memory_Slab_bytes
# node_memory_SlabReclaimable_bytes
# node_memory_SlabUnreclaimable_bytes

# node_memory_TcpMem_bytes
# node_memory_SwapTotal_bytes
# node_memory_SwapFree_bytes

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

#Softnet
# node_softnet_processed_total
# node_softnet_dropped_total
# node_softnet_time_squeezed_total

#Conntrack
# node_nf_conntrack_entries
# node_nf_conntrack_entries_limit
# node_nf_conntrack_dropped

# Socket and FD 
# node_sockstat_TCP_inuse
# node_sockstat_TCP_tw
# node_sockstat_UDP_inuse
# node_sockstat_RAW_inuse

# node_filefd_allocated
# node_filefd_maximum

# Process level
# process_cpu_seconds_total{pid,process}
# process_resident_memory_bytes{pid,process}
# process_virtual_memory_bytes{pid,process}
# process_open_fds{pid,process}
# process_threads{pid,process}
# process_start_time_seconds{pid,process}

# Disk IO
# node_disk_read_bytes_total{device}
# node_disk_write_bytes_total{device}
# node_disk_io_time_seconds_total{device}
# node_disk_io_wait_seconds_total{device}





## ORIGINAL

# ATTACKER Core Metrics:
# attack_requests_sent_total
# attack_packets_sent_total
# attack_requests_per_second
# attack_bytes_sent_total

# attack_requests_success_total
# attack_requests_failed_total
# attack_send_errors_total

# attack_concurrent_connections
# attack_active_workers

# attack_request_latency_seconds
# attack_connection_setup_time_seconds

# attack_tcp_connections_open
# attack_tcp_connections_closed
# attack_udp_packets_sent
# attack_http_headers_sent_total

# attack_socket_errors_total
# attack_tcp_retransmissions_total
# attack_ephemeral_port_exhaustion

# attack_fd_usage
# attack_tcp_timewait_sockets
# attack_syn_retries

# attack_start_time_epoch
# attack_stop_time_epoch

# attack_cpu_usage_percent
# attack_memory_usage_bytes

# PROXY Metrics
# proxy_connections_active
# proxy_connections_reading
# proxy_connections_writing
# proxy_connections_waiting
# proxy_connections_accepted_total
# proxy_connections_handled_total
# proxy_connections_dropped_total

# proxy_http_requests_total
# proxy_http_requests_current

# proxy_http_limit_req_dropped
# proxy_http_limit_req_delayed
# proxy_http_limit_conn_dropped
# proxy_http_responses_total{status="2xx"}
# proxy_http_responses_total{status="4xx"}

# proxy_worker_cpu_seconds_total
# proxy_worker_memory_bytes
# proxy_worker_restarts_total

# proxy_upstream_response_time_seconds_bucket
# proxy_upstream_connect_time_seconds_bucket

# proxy_request_queue_depth
# proxy_request_queue_overflow_total

# proxy_tls_handshakes_total
# proxy_tls_handshake_failures_total
# proxy_tls_handshake_duration_seconds

# TARGET Metrics
# L3/L4 Metrics 
# node_netstat_Tcp_ActiveOpens
# node_netstat_Tcp_PassiveOpens
# node_netstat_Tcp_RetransSegs
# node_netstat_Tcp_InErrs
# node_netstat_Tcp_OutRsts
# node_netstat_Tcp_CurrEstab

# SYN Flood Metrics
# node_netstat_TcpExt_SyncookiesSent
# node_netstat_TcpExt_SyncookiesRecv
# node_netstat_TcpExt_TCPAbortOnTimeout
# node_netstat_TcpExt_TCPAbortOnMemory

# UDP 
# node_netstat_Udp_InDatagrams
# node_netstat_Udp_RcvbufErrors
# node_netstat_Udp_NoPorts

# Interface 
# node_network_receive_bytes_total
# node_network_transmit_bytes_total
# node_network_receive_dropped_total
# node_network_receive_errors_total

# CPU/Memory
# node_memory_MemAvailable_bytes
# node_memory_Slab_bytes
# node_memory_TcpMem_bytes
# node_cpu_seconds_total{mode="system"}
# node_cpu_seconds_total{mode="iowait"}

# HTTP
# http_requests_total{method, path, status}
# http_request_duration_seconds_bucket
# http_requests_total{status="5xx"}
# http_requests_total{status="429"}
# http_inflight_requests
# app_request_queue_depth

# PROXY (Same as proxy)


