import { useState, useRef, type ReactElement, type JSX } from "react";
import { Link } from "react-router-dom";

import ArchDiagram from "../assets/ArchDiagram.png"
import HTTPFloodNRLConfigImg from "../assets/HTTPFlood-NRL-Config.png"
import HTTPFloodNRLProxyConigImg from "../assets/HTTPFlood-NRL-ProxyConfig.png"

import HTTPFloodCPUUsageImg from "../assets/HTTPFlood-CPU-Usage.png"
import HTTPFloodHTTPImg from "../assets/HTTPFlood-HTTP.png"
import HTTPFloodInteruptsImg from "../assets/HTTPFlood-Interrupts.png"
import HTTPFloodMemoryImg from "../assets/HTTPFlood-Memory.png"
import HTTPFloodNetworkImg from "../assets/HTTPFlood-NetworkRates2.png"
import HTTPFloodTCP from "../assets/HTTPFlood-TCPStats.png"

import SYNFLoodNetRate from "../assets/SYN-NetRate.png";
import SYNTCPErrs from "../assets/SYN-TCPErrs.png";
import SYNFloodCPU from "../assets/SYN-CPU.png";
import SYNConntrack from "../assets/SYN-Conntrack.png"
import HTTPFloodVideo from "../assets/httpflood1.mp4"
import SYNTCPAccept from "../assets/SYN-TCPAccept.png";
import SYNSockets from "../assets/SYN-TCPInuse.png"

type VariableCategory = "All" | "TCP" | "UDP" | "Network" | "Netfilter" | "Memory" | "CPU" | "Conntrack";
type VariableType = "counter" | "gauge" | "histogram" | "summary";

interface Variable {
  name: string;
  category: Exclude<VariableCategory, "All">;
  type: VariableType;
  unit: string;
  description: string;
  example: string;
}

interface HeadingBlock {
  id: string;
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
}

interface TextBlock {
  type: "text";
  text: string;
}

interface TextListBlock {
    type: "textlist";
    text: string[];
}

interface CodeBlock {
  type: "code";
  language: string;
  title?: string;
  code: string;
}

type CalloutVariant = "info" | "warning" | "critical" | "info2";

interface CalloutBlock {
  type: "callout";
  variant: CalloutVariant;
  title: string;
  text: string;
}

interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

interface VideoBlock {
  type: "video";
  src: string;
  poster: string;
  title?: string;
  duration?: string;
}

type ContentBlock = HeadingBlock | TextBlock | TextListBlock | CodeBlock | CalloutBlock | ImageBlock | VideoBlock;

// --- Page Structure ---

interface ContentPageData {
  title: string;
  breadcrumb: string[];
  blocks: ContentBlock[];
}

type PageKey = "variables" | "architecture" | "howto" | "httpflood" | "synflood"; // | "findings";

interface SidebarNavChild {
  label: string;
  page: PageKey;
}

interface SidebarNavSection {
  label: string;
  icon: ReactElement;
  children: SidebarNavChild[];
}

// --- Component Props ---

interface HeadingBlockProps {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

interface TextBlockProps {
  text: string;
}

interface TextListBlockProps {
  text: string[];
}

interface CodeBlockProps {
  language: string;
  title?: string;
  code: string;
}

interface CalloutBlockProps {
  variant: CalloutVariant;
  title: string;
  text: string;
}

interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
}

interface VideoBlockProps {
  src: string;
  poster: string;
  title?: string;
  duration?: string;
}

interface ContentPageProps {
  pageKey: Exclude<PageKey, "variables">;
}

interface SidebarProps {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface CalloutStyleConfig {
  border: string;
  bg: string;
  icon: ReactElement;
  iconColor: string;
  titleColor: string;
}


// ICON COMPONENTS

const SearchIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronRight = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ChevronDown = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const BookIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const LayersIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const TerminalIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

const ActivityIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  </svg>
);

const CopyIcon = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PlayIcon = (): ReactElement => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const InfoIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

const AlertIcon = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const LinkIcon = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const MenuIcon = (): ReactElement => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = (): ReactElement => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);


// Variables (DDoS system metrics)

const VARIABLE_CATEGORIES: VariableCategory[] = [
  "All", "TCP", "UDP", "Network", "Netfilter", "Memory", "CPU", "Conntrack"
];

const SAMPLE_VARIABLES: Variable[] = [
  { name: "network_tcp_drop", category: "TCP", type: "counter", unit: "packets", description: "Total number of inbound TCP packets dropped by the kernel due to buffer overflow, policy rules, or rate limiting during a DDoS event.", example: "network_tcp_drop > 10000" },
  { name: "network_tcp_syn_recv", category: "TCP", type: "gauge", unit: "connections", description: "Current number of TCP connections in SYN_RECV state. Spikes indicate SYN flood attacks overwhelming the handshake queue.", example: "network_tcp_syn_recv > 5000" },
  { name: "network_tcp_retransmit", category: "TCP", type: "counter", unit: "segments", description: "Count of TCP segments retransmitted. High values during an attack suggest congestion or packet loss caused by volumetric floods.", example: "rate(network_tcp_retransmit[5m]) > 200" },
  { name: "network_tcp_backlog_drop", category: "TCP", type: "counter", unit: "packets", description: "Packets dropped because the TCP listen backlog was full. Directly correlated with SYN flood intensity.", example: "network_tcp_backlog_drop > 0" },
  { name: "network_udp_drop", category: "UDP", type: "counter", unit: "packets", description: "Total UDP packets dropped. Common during UDP reflection/amplification attacks targeting DNS, NTP, or memcached.", example: "rate(network_udp_drop[1m]) > 5000" },
  { name: "network_udp_rcvbuf_errors", category: "UDP", type: "counter", unit: "errors", description: "Number of UDP receive buffer errors. Indicates the socket receive buffer is being overwhelmed by incoming traffic.", example: "network_udp_rcvbuf_errors > 100" },
  { name: "network_rx_bytes", category: "Network", type: "counter", unit: "bytes", description: "Total bytes received on the network interface. Track rate of change to detect volumetric attacks exceeding baseline bandwidth.", example: "rate(network_rx_bytes[1m]) > 1e9" },
  { name: "network_rx_packets", category: "Network", type: "counter", unit: "packets", description: "Total packets received. Useful for detecting packet-per-second (PPS) floods that saturate NIC processing capacity.", example: "rate(network_rx_packets[1m]) > 1e6" },
  { name: "network_rx_dropped", category: "Network", type: "counter", unit: "packets", description: "Packets dropped at the network interface level before reaching the kernel stack. Indicates NIC ring buffer saturation.", example: "network_rx_dropped > 0" },
  { name: "network_tx_errors", category: "Network", type: "counter", unit: "errors", description: "Transmit errors on the interface. May indicate outbound path congestion during attack response or mitigation.", example: "rate(network_tx_errors[5m]) > 10" },
  { name: "netfilter_conntrack_count", category: "Netfilter", type: "gauge", unit: "entries", description: "Current number of entries in the conntrack table. Approaching the max indicates potential connection table exhaustion attack.", example: "netfilter_conntrack_count / netfilter_conntrack_max > 0.8" },
  { name: "netfilter_conntrack_max", category: "Netfilter", type: "gauge", unit: "entries", description: "Maximum size of the connection tracking table. When count reaches this limit, new connections are dropped.", example: "netfilter_conntrack_max = 262144" },
  { name: "netfilter_conntrack_drop", category: "Netfilter", type: "counter", unit: "entries", description: "Connections dropped because the conntrack table was full. Critical indicator of state-exhaustion attacks.", example: "netfilter_conntrack_drop > 0" },
  { name: "netfilter_nf_queue_drop", category: "Netfilter", type: "counter", unit: "packets", description: "Packets dropped from the netfilter queue. Occurs when userspace processing (e.g., IPS) cannot keep up with attack volume.", example: "rate(netfilter_nf_queue_drop[1m]) > 100" },
  { name: "memory_available_bytes", category: "Memory", type: "gauge", unit: "bytes", description: "Available memory for new allocations. DDoS attacks can exhaust memory through connection state, socket buffers, or logging.", example: "memory_available_bytes < 1e9" },
  { name: "memory_slab_unreclaimable", category: "Memory", type: "gauge", unit: "bytes", description: "Kernel slab memory that cannot be reclaimed. Growth during attacks indicates kernel resource exhaustion from connection tracking.", example: "rate(memory_slab_unreclaimable[5m]) > 1e7" },
  { name: "cpu_softirq_percent", category: "CPU", type: "gauge", unit: "percent", description: "Percentage of CPU time spent handling software interrupts. High values indicate network interrupt storms from flood traffic.", example: "cpu_softirq_percent > 60" },
  { name: "cpu_system_percent", category: "CPU", type: "gauge", unit: "percent", description: "System (kernel) CPU usage. Elevated during attacks due to packet processing, firewall rule evaluation, and connection tracking.", example: "cpu_system_percent > 80" },
  { name: "conntrack_tcp_timeout_syn_recv", category: "Conntrack", type: "gauge", unit: "seconds", description: "Timeout for connections in SYN_RECV state in the conntrack table. Tuning this value affects SYN flood resilience.", example: "conntrack_tcp_timeout_syn_recv = 30" },
  { name: "conntrack_tcp_timeout_established", category: "Conntrack", type: "gauge", unit: "seconds", description: "Timeout for established TCP connections in conntrack. Reducing during attacks can free table entries faster.", example: "conntrack_tcp_timeout_established = 432000" },
];


// Content Pages

const SAMPLE_CONTENT_PAGES: Record<Exclude<PageKey, "variables">, ContentPageData> = {
  architecture: {
    title: "DDoS Defense: Effectivness Across Protocol Layers",
    breadcrumb: ["Docs", "Architecture", "Overview"],
    blocks: [
      { id: "DDoS Replication", type: "heading", level: 1, text: "DDoS Defense: Effectivness Across Protocol Layers" },
      { type: "text", text: "This document outlines the architecture, design decisions, and use cases of the project. This content specifically refers to the RasberryPI Cluster implimentation which has higher metric and simulation validity. For more information on the local architecture see `Architecture -> Local w/ Docker`." },
      { type: "callout", variant: "info", title: "Note", text: "Relationships and observations seen here may not replacate when running locally with docker. This is due to virtualization and shared kernel states." },
      { type: "image", src: ArchDiagram, alt: "Multi-layer DDoS architecture", caption: "Figure 1 — Multi-layer DDoS simulation, midigation, and montoring architecture diagram." },
      { id: "Observability Layer", type: "heading", level: 2, text: "Observability Layer - Metrics & Dashboard" },
      { type: "text", text: "Observability and Configuration were two major focuses during architecture. Without observability running tests, besides looking cool, lead to no actionable changes. The goal is to be able to watch all relavent system metrics from each node during testing. This information can then be used to modify configuration, see relationships, and potential problems. Similarly, configuration allows us to test a multitude of attack and midigation approaches as well as modify levels within each type. With this functionality we are able to show DDoS attack and midigation relationships clearly through optimal attack and filtering rates." },
      { id: "Observability Stack", type: "heading", level:3, text: "The observability stack primarily uses 2 services:" },
      { type: "textlist", text: ["-  PROMETHEUS: Metric aggregator and store", "-  GRAFANA: Configurable Dashboard and Metric Filter"]},
      { type: "text", text: "Both of these services run on the `Monitor` node. Prometheus polls nodes on a 3 second interval via `/metric` endpoints defined on each node. Each node is responsible to aggregate its own metrics and expose these values for prometheus. \n\n Grafana is what powers the `Metrics` page. Grafana automatically binds to the Prometheus data store allowing quick construction of visualizations." },
      { type: "text", text: "The configuration stack runs on the `Manager` node providing the ability to modify configuration of the various nodes in the system. All configuration happens through the  `Dashboard` page through the modification of config file on each node which define the behavior of each node. An example configuration file for an attacking machine is shown below." },
      {
        type: "code",
        language: "MASTER_CONFIG.json",
        title: "Attacker Node — Sample Configuration",
        code: `{
    "id": "e0dbc283-5d3c-4f07-bc5c-519a2820969f",
    "name": "attacker1",
    "type": "attacker",
    "enabled": true,
    "forward_host": "proxy",
    "forward_port": "8000",
    "host": "0.0.0.0",
    "port": "8001",
    "monitor": {
        "enabled": true,
        "interval": null,
        "metrics": {
            "cpu": true,
            "disk": true,
            "network": true,
            "fastapi": true,
            "memory": true,
            "sys_cpu": true,
            "sys_network": true,
            "sys_memory": true
        }
    },
    "custom_config": {
        "attack_type": "http_flood",
        "threads": 2,
        "connections": 400,
        "duration_seconds": 120,
        "rate_rps": 600,
        "method": "GET",
        "paths": ["/api/cpu"],
        "path_ratios": [1.0],
        "keep_alive": true,
        "header_interval_ms": 100,
        "payload_bytes": 0,
        "connect_timeout_ms": 3000
    }
}`
      },
      { type: "text", text: "Every configuration file contains a set of shared values in the root of the json structure such as id, name, ip, host, ect... The `monitor` object defines the behavior of the node_monitor python package running in the FastAPI app. The allows the configuration of metrics exposed to `/metrics` for Prometheus. The `custom_config` object defines node specific behavior. For instance the request rate and amount of connections used in the HTTP Flood attack via wrk2." },


      { id: "Attack Layer", type: "heading", level: 2, text: "Attack Layer - HTTP | TCP | UDP Floods & Slowloris" },
      { type: "text", text: "The attack layer is the source of the DDoS attacks during simulation. Each node supports a different type of attack including Layer 3, Layer 4, and Layer 7 attacks. By default all attackers route packets to the proxy, though this can be modified through `forward_host` config changes. Multiple nodes can be started at one time, though, this is not done in out analysis in favor of more interpretable metrics." },
      { type: "callout", variant: "info", title: "This isn't a DDoS Attack?", text: "Yes, with one node running technically the attacks here are Denial of Service - DoS attacks. DDoS requires multiple machines sending requests to one or more victim machines, which the project does not do. That being said, attacking machines only need to supply enough load to cause target and proxy resource exaustion. With only 4 cores and 4gb of ram a piece on the proxy and target, one attacker is sufficent. For sepecific midigations, such as IP filtering, this can cause problems as all requests come from one machine, meaning all packet IP's are the same. Without modification this undermines the realism of midigations. Using the IP example above we can simply use IP spoofing from the attacking machine to replicate changing IP's in real DDoS attack." },
      { id: "HTTP Flood", type: "heading", level: 3, text: "HTTP Flood - Layer 7" },
      { type: "text", text: "The first attack type is an HTTP Flood implimented by Attacker 1. An HTTP flood targets the application or Layer 7 in the OSI model. In a HTTP Flood attack, the attacking machine(s) construct valid HTTP packets targeting one or more endpoints on the victim machine. The resource exaustion appears through shear load of HTTP packets being sent. This can be exastrabated if the endpoint contains expensive work such as heavy CPU bound work or long I/O such as a database read. In some cases, a large amount of TCP connections can cause Layer 3&4 pressure but this is less common in real applications."},
      { type: "callout", variant: "info2", title: "Metrics", text: "Resouces exaustion is most easlity seen in CPU metrics. On the dashboard view CPU load related panels. Depending on the endpoint and or request rate, load is seen in TCP metrics such as TCP Errors and TCP memory buffers." },
      { id: "TCP/UDP Flood", type: "heading", level: 3, text: "TCP | UDP Flood - Layer 3 & 4" },
      { type: "text", text: ""},
      { type: "callout", variant: "info2", title: "Metrics", text: "" },
      { id: "Slowloris", type: "heading", level: 3, text: "Slowloris - Layer 7" },
      { type: "text", text: ""},
      { type: "callout", variant: "info2", title: "Metrics", text: "" },

      { id: "Mitigation Layer", type: "heading", level: 2, text: "Mitigation Layer - Target & Proxy" },
      { type: "text", text: "Lastly we have the Mitigation layer including the Target and Proxy nodes. In the intest of replicating real world architecture we included a reverse proxy infront of the FastAPI application on the target node. The reverse proxy, or proxy node, runs NGINX which forwards packets to the target node and impliments many of the mitigations discussed in the project. Modification of NGINX behavior can be done through the dashboard which exposes NGINX configuration values." },
      { type: "callout", variant: "critical", title: "Restart Required", text: "In order to apply changes to NGINX running on the proxy node you MUST both click `Save Config` then `Restart`. Without restarting, changes made to the NGinx configuration will not apply." },
      { type: "text", text: "The target node is very simple and defines a number of endpoints modeling common types of endpoints. This including heavy CPU bound work and IO opperations. Some mitigation is also present here such as caching. Behavior is defined by A. changing the endpoint the attacker forwards requests to, or B. modifying the target machines configuration files." },
    ]
  },
  howto: {
    title: "How to Run the Project Locally",
    breadcrumb: ["Docs", "How-To"],
    blocks: [
      { id: "Content", type: "heading", level: 1, text: "How To - Running Locally" },
      { type: "text", text: "The only prerequisite needed is docker desktop. Once installed open the project and change directory into `/project`."},
      { type: "callout", title: "Hosted Page VS Running Locally", variant: "critical", text: "If you are viewing this through docker.io in a browser (anything other than localhost), then only static content, such as these docs pages will work. Viewing the dashboard and or metrics endpoint will NOT work. You must first run the project locally, then full functionality including these docs pages will be available."},
      { type: "callout", title: "Docker Settings - Resources", variant: "warning", text: "Inside each specific node's docker-compose.yml file you will see a 'cpuset' field. This pins each containers CPU usage to specific CPU usage. By default these use values ranging from 0-7 using 8 CPU cores. If 8 cores are not available to docker you may get errors build or running the project. Either go to docker desktop settings and increase the usable resources, or two, modify the compose files to select valid CPUs."},
      { type: "text", text: "Once in the project folder you will be able to start all the docker containers. The containers activated are defined in `project/docker-compose.yaml`. If you would like to dissable or add different nodes, modify this file."},
      { type: "text", text: "To start the project locally, run the following command at /project. Note, this can take a few minutes to build the first time."},
      { type: "code", language: "bash", code: "docker compose up --build"},
      { type: "text", text: "Once build, navigate to http://localhost:5173/ to view the dashboard. That's it! When viewing metrics, click the `metrics` button in the left drawer. On the first page you should be able to see a `Local Dashboard` link. Click this to view the prebuilt the real-time metrics dashboard."},
      { id: "Content", type: "heading", level: 1, text: "How To - View and Modify Metrics" },
      { type: "text", text: "While you are able to use the default dashboard, you are able to modify the look and metrics shown on the dashboard. This may require login. If so use Username: admin, and Password: admin. Very secure! The current dashboard configuration uses a json file source. You can view the original source in /project/nodes/monitor/local/grafana/dashboards, the two files in this folder are the two different dashboards loaded on build. If you make an edit you will need to click 'save' in grafana, then copy and paste the new dashboard in the corresponding file above. This will persist your changes."},
      { type: "text", text: "If you add or modify a node, you can change the prometheus scraping behavior in /monitor/prometheus/prometheus.yaml. Look up prometheus documentation for more. In general, having extranious polls to metrics endpoints are harmless and won't affect behavior, so no need to modify this file when disabling a node."},

    ]
  }, 
  httpflood: {
    title: "HTTP Flood Attack & Analysis",
    breadcrumb: ['Docs', 'Attacks & Analysis', "HTTP Flood"],
    blocks: [
        { id: "Content", type: "heading", level: 1, text: "HTTP Flood Attack & Analysis"},
        { type: "text", text: "The following page is our analysis and metrics across related nodes during a simulation of a HTTP Flood attack. See Docs -> Architecture -> HTTP Flood - Layer 7 for more information on this type of attack."}, 
        { id: "Content", type: "heading", level: 2, text: "HTTP Flood - Attack Video"},
        { type: "text", text: "We recommend reading all content below before watching the video. This will make the video more interpretable."},
        { type: "video", src: HTTPFloodVideo, poster: "https://placehold.co/900x500/1e1e2e/60a5fa?text=HTTP+Flood+Simulation", duration: "8:16", title: "HTTP Flood Simulation"},
        { id: "Content", type: "heading", level: 2, text: "Inital Setup & Node Configuration"},
        { type: "text", text: "The simulation uses the following nodes: "},
        { type: "textlist", text: ["-    attacker1", "-    Proxy", "-    target1"]},
        { type: "text", text: "`attacker1` is the source of the HTTP Flood attack forwarding the HTTP requests to the proxy server. This is done with a HTTP load testing tool `wrk2`. The first portion of the attack includes NO proxy mitigation. This means all requests made from the attacking machine reach the target endpoint."},
        { id: "Content", type: "heading", level: 3, text: "Attacker1 Configuration"},
        { type: "text", text: "The values listed below are the important configuration values on the attacking machine."},
        { type: "textlist", text: ['- Request Rate: 160', '- Connections: 20', '- Paths: /', '- Path Ratios: 1']},
        { type: 'text', text: "Request Rate controls how the number of HTTP request sent by `wrk2` per second. Connections specifies the number of connections made with the target server to send requests. Paths determines the the endpoints on the target machine which requests are sent to. Path Ratios determines the what percent of HTTP requests go to each path. In this case all requests hit `target1:8000/`. These configuration values can be seen in the configuration section on the dashboard."},
        { type: 'image', src: HTTPFloodNRLConfigImg, alt: "HTTP Flood `attacker1` configuration values  for the inital non-ratelimited attack", caption: "HTTP Flood `attacker1` configuration values  for the inital non-ratelimited attack" },
        { id: "Content", type: "heading", level: 3, text: "Proxy Configuration"},
        { type: 'text', text: "The following values are important to note on the `proxy` machine. NOTE: while limits are set they are too high allowing all attack requests through."},
        { type: 'textlist', text: ["- Rate RPS: 250", "- Max Connections: 40", "- Burst: 300"]},
        { type: 'text', text: "Rate RPS controls the the maximum allowed requests per second for a single IP. Burst defines the size of the rate limit overflow queue for requests over this ratelimit. Max Connections defines the number of open connections a single IP can have before connections are rejected."},
        { type: "callout", variant: "info", title: "Nginx - Rate Limits & Burst Information", text: "In the default setup, Rate RPS is a HARD limit, meaing NGINX will forward a packet every 0.004 seconds. Request over this rate will be appended to the overflow queue to be processed at the 0.004 second rate. In our case we use the option `nodelay`. This allows NGINX to process requests without queueing as long as long as the total burst size is not exceded. Once 300 requests exceed the rate limit those requests are dropped."}, 
        { type: "code", language: "nginx.conf", code: `http {
  limit_req_zone $binary_remote_addr zone=req_limit:10m rate=250r/s;
  limit_req_status 429;

  limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
  limit_conn_status 503;

  server {
    listen 8000;

    location / {
      limit_conn conn_limit 40;
      limit_req zone=req_limit burst=300 nodelay;

      proxy_pass http://target_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}`    }, 
      { type: 'image', src: HTTPFloodNRLProxyConigImg, alt: "HTTP Flood `proxy` configuration values  for the inital non-ratelimited attack", caption: "HTTP Flood `proxy` configuration values for the inital non-ratelimited attack" },
      { id: "Content", type: "heading", level: 2, text: "Second Attack - Rate Limit Node Configuration"},
      { type: "text", text: "During the second attack shown proxy mitigations are implimented. The proxy rate limit, max connections, and burst values are modified to the following values. All other configuration values on the attacker and target machines remain the same. This means the scale of attack is the exact same between the two runs."},
      { type: 'textlist', text: ["- Rate RPS: 115", "- Max Connections: 15", "- Burst: 200"]},
      { id: "Content", type: "heading", level: 2, text: "Metrics and Analysis"},
      { type: "text", text: "As expected we seen CPU utilization playing a large role in the HTTP Flood attack. HTTP Floods attack the application layer meaning much of the stress on the system is on the CPU. During the inital attack, when no rate limiting is present, we see the target machine's CPU percentage maxed at or near 100% utilization. Furthermore, 55% is system, 40% is user, 5% is softirq, the rest being iowait, irq, and steal."}, 
      { type: "text", text: "Most of the utilization is from user and system spaces. As many requests reach the FastAPI application this means the computer must read in all requests from the network, pass the requests to the user space for FastAPI, FastAPI processes and creates a response, finally the response is passed back to the system for network transmission. These steps at a high rate cause CPU utilization to spike creating a CPU bottleneck in response rate."}, 
      { type: "text", text: "In the second attack rate request rate is limited. Lowering the amount and rate of HTTP requests the target needs to handle. This leads to a lower CPU utlization on the machine."},
      { type: "image", src: HTTPFloodCPUUsageImg, alt: "Figure 1 - HTTP Flood CPU Utilization", caption: "Figure 1 - HTTP Flood CPU Utilization"},
      { type: "text", text: "Looking at HTTP related statistics we see more effects of rate limiting. HTTP Status and Response averages drop when rate limiting is applied compared to the intial attack: ~150 RPS to ~115 RPS. While the total number of responses is lower, response consistency greatly increases. The 90th Quant Duration Rate Panel shows rate of requests who response times are above the 90th quantile. During max load the amount of high latency requests is large, after rate limiting no requests break the 90th quantile in response time. This can also be seen in the raw HTTP response graphs. The total variation in rate for both bytes and status decreases during the second phase. The last Nginx panel shows that while packets are filtered, not forwarded to the target machine, Nginx still received the full 160 packets per second. "}, 
      {type: "callout", title: "HTTP Statistics - FastAPI Workers", variant: "warning", text: "HTTP statistics are averages per FastAPI worker, the machine uses 5 workers, meaning metrics should be multiplied by 5 to estimate totals."}, 
      { type: "image", src: HTTPFloodHTTPImg, alt: "Figure 2 - HTTP Flood HTTP and Nginx Statistics", caption: "Figure 2 - HTTP Flood HTTP and Nginx Statistics"},
      { type: "image", src: HTTPFloodNetworkImg, alt: "Figure 3 - Networking and Interfaces", caption: "Figure 3- Networking and Interfaces"},
      { type: "text", text: "Network byte transfer rates, Figure 3, show a similar story. There are two important things to note here. First, looking at the Network Packet Rate panel, specifically `attacker1 recv` and `attacker1 sent`. We see in the first attack the rate of packets out is intially equal to packets received. Then, packets received by attacker1 begin to drop off. This shows the target dropping packets due to the CPU bottleneck. In the second attack we see the attacker sent and recevied packet rates are nearly identical as all HTTP request are responded to. The second metric to note is the spike in transmition over eth0 on target1 at the end of the first attack, this is seen on the Net Transmit Rate panel. This spike can be seen in various other panels shown but is most pronounced here. The reason for the spike is due to freed CPU time as packets are no longer being received on the target machine. This allows the CPU to handle packets in queue leading to the spike in transmission."}, 
      { type: "image", src: HTTPFloodInteruptsImg, caption: "Figure 4 - CPU Scheduling Pressure", alt: "Figure 4 - CPU Scheduling Pressure"}, 
      { type: "callout", variant: "info2", title: "Variables", text: "See the variables page for more information on the panels not discussed."},
      { type: "text", text: "While we have focused mostly on the target machine the rate limiting also has an effect on the proxy machine. From the inital CPU% panel we see a small ~4% jump in CPU usage, but the biggest differences are shown in CPU scheduling statistics."},
      { id: "Content", type: "heading", level: 3, text: "TCP & Memory Statistics"},
      { type: "text", text: "In Figure 4 we see in all panels that CPU contention decreases for the target machine while the opposite is true for the proxy. We see interrupts, context switches, IO pressure, and page faults increase when rate limiting is occuring. This is due to rate limits being reached which causes more reads/writes from memory, appending to access logs, and creation of rate limited HTTP response packets. This is also supported in Figure 5 outlining memory stats. "},
      { type: "image", src: HTTPFloodMemoryImg, caption: "Figure 5 - Memory Usage", alt: "Figure 4 - Memory usage"}, 
      { type: "callout", variant: "info", title: "Figure 5 - Legend", text: "In the `TCP Mem` panel the legend naming is cutoff. Green is the proxy, orange is the target, and pink is the attacker"},
      { type: "text", text: "The following figure shows TCP statistics. These stats have little affect in terms of the system bottle neck and correlate with all that has been already said, so we will skip elaboration."},
      { type: "image", src: HTTPFloodTCP, caption: "Figure 6 - TCP Statistics", alt: "Figure 6 - TCP Statistics"},

    ]
  },
    synflood: {
        title: "TCP SYN Flood Attack & Analysis",
        breadcrumb: ['Docs', 'Attacks & Analysis', "TCP SYN Flood"],
        blocks: [
            { id: "Content", type: "heading", level: 1, text: "SYN Flood Attack & Analysis"},
            { type: "text", text: "This was the most interesting analysis our team was able to complete, though not without a number of headaches. This analysis is not focused on mitigation, but instead on the effect of our architecture on the behavior of the attack and its unexpected outcomes."},
            { type: "callout", variant: "info", title: "Architecture Modifications", text: "The architecture setup during this test differs from the other tests. Only two machines are used: Attacker2 and Target1. Attacker2 appears in the graphs as Attacker1 due to problems discussed later. Target1 appears as Target1-alt because the node is running on a separate Raspberry Pi, not on the original cluster Pi it was assigned to. This was done to allow modification of Linux networking configuration between attacks."},
            { type: "callout", variant: "warning", title: "SYN Cookies - Linux Networking", text: "The most important configuration note for this test is that SYN Cookies are disabled (net.ipv4.tcp_syncookies=0). This means all SYN packets are handled in the default manner — SYN packets create conntrack entries and returned SYN-ACK packets do not contain a cookie. With syncookies disabled, this behavior is consistent even under high networking memory pressure. See the variables page for more information."},
            { type: "text", text: "The attack was set up as follows. Hping3 was used to send a steady rate of TCP SYN packets to the target machine on port 8000. The rate was set to u600, meaning one packet is sent every 600 microseconds, totaling between 1600 and 2000 SYN packets per second. No mitigation was employed during this test — the graphs represent the full duration of the attack."},
            { type: "text", text: "Initially the behavior observed was entirely consistent with expectations. However, after looking deeper into the Linux networking statistics, we began to see measurements inconsistent with a standard SYN flood failure. If only CPU metrics are considered, the behavior is entirely expected."},
            { type: "image", src: SYNFloodCPU, caption: "Figure 1 - SYN Flood CPU Statistics", alt: "Figure 1 - SYN Flood CPU Statistics"},
            { type: "text", text: "The graph shows a period of relative stability. The target's CPU utilization sits very low, around 15%, for approximately 6 minutes at the beginning of the attack. At the same time, the attacker's CPU sits relatively stable around 40–45%. This is expected — TCP SYN packet handling is heavily optimized and handled at the kernel level, avoiding unnecessary translations. Additionally, the target was running on a Pi with a significant hardware advantage: nearly double the CPU clock speed, double the L1 and L2 cache, an L3 cache absent on the cluster Pis, and 16 GB of RAM compared to 8 GB. Given this, the initial CPU utilization levels are consistent with expected SYN flood behavior."},
            { type: "text", text: "After 6 minutes, at 12:02:30 on the graph, this balance breaks sharply. The target's CPU utilization spikes suddenly and severely. Throughout the remainder of the attack, the target's metrics drop out as the high load prevents the local monitoring packages from extracting and exposing metrics to the Prometheus scraper. Notably, while not visible in the graph, CPU utilization on the target as viewed via HTOP showed 80% utilization across all 4 cores. In other tests using higher SYN packet rates, 100% utilization was observed during the same failure period."},
            { type: "text", text: "Figure 2 shows the network packet rates over the same period. The results are consistent — a high rate of incoming and outgoing packets is visible while the target is stable on both machines. Once the target fails, packet rates drop to zero with the exception of small spikes. This makes sense as the target kernel can no longer handle networking due to memory and CPU pressure."},
            { type: "image", src: SYNFLoodNetRate, caption: "Figure 2 - SYN Flood Network Rates", alt: "Figure 2 - SYN Flood Network Rates"},
            { type: "text", text: "If only CPU utilization and network rates were considered, the analysis would continue similarly to the HTTP Flood analysis. However, subsequent metrics tell a different story."},
            { type: "text", text: "The TCP figures below provide the first clues into unexpected behavior. Metrics such as TCP listen overflows, TCP timeouts, and TCP out resets are all expected. Listen overflows occur when the SYN queue or accept queue becomes full. The size of these queues is directly related to the net.ipv4.tcp_max_syn_backlog and net.core.somaxconn kernel values. In this case both the target and attacker had large queue sizes, but overflows still occurred on the target — meaning incoming SYN packets were dropped. [SEE ABORT_ON_OVERFLOW NOTE]. Timeouts occur after roughly 2 minutes when the server has not received a response from the client. In this case the attacker never sends an ACK after receiving the SYN-ACK packets. Out resets occur when the remote party drops or resets the connection for any reason."},
            { type: "text", text: "All of this behavior stems from memory pressure on the host's TCP queues and the nature of a SYN flood. Listen overflows occur when the SYN queue or accept queue becomes full. The size of these queues is directly related to the net.ipv4.tcp_max_syn_backlog and net.core.somaxconn kernel values. In this case both the target and attacker had large queue sizes, but overflows still occurred on the target. With net.ipv4.tcp_abort_on_overflow set to 1, the kernel responds to overflowing SYN packets with a RST, actively rejecting new connections rather than silently dropping them. Timeouts occur after roughly 2 minutes when the server has not received a response from the client — in this case the attacker never sends an ACK after receiving SYN-ACK packets. Out resets occur when the remote party drops or resets the connection for any reason."},
            { type: "image", src: SYNTCPErrs, caption: "Figure 3 - SYN Flood TCP Errors", alt: "Figure 3 - SYN Flood TCP Errors"},
            { type: "text", text: "Other metrics shown reveal some inconsistencies. To understand these, it is important to understand how Hping3 behaves. By default, Hping3 uses raw sockets to send TCP SYN packets. Normal applications use a TCP socket tracked by the host kernel. When using a raw socket, Hping3 bypasses a number of host-level connection tracking mechanisms, though packets still pass through the NIC and are visible to iptables and ebtables. The consequence is that received SYN-ACK packets from the target have no corresponding connection on the host, so the SYN-ACK is rejected by the attacking host."},
            { type: "text", text: "In Figure 3, TCP retransmissions and SYN retransmissions show a different story. We would expect to see zero values for the attacking machine — all packets sent using Hping3 should be fire-and-forget, meaning there is no case where the attacking machine should retransmit or reply to target responses. The non-zero values for these metrics indicate a problem with the attack setup."},
            { type: "text", text: "Similarly, Figure 4 displays the number of conntrack entries on each machine. The use of raw sockets by Hping3 sits below the netfilter layer, meaning packets sent through the raw socket should not appear in conntrack. Instead, a steady number of conntrack entries are created on the attacker. Even more interestingly, the number of these entries explodes around the time the target system fails. The consistent pressure on the target machine is also visible, with conntrack entries maxed for nearly the entire duration of the attack. The difference in maximum values between machines is simply due to different max memory configurations."},
            { type: "image", src: SYNConntrack, caption: "Figure 4 - SYN Flood Conntrack Values", alt: "Figure 4 - SYN Flood Conntrack Values"},
            { type: "callout", variant: "info", title: "Figure 4 - Target Conntrack Values", text: "In the figure above, target conntrack values are lost. Using a stable source, the conntrack values for the target machine showed a decreasing step pattern down to the lower values visible."},
            { type: "text", text: "So what is actually happening? The root cause is Docker virtualization and Docker networking. While Docker was primarily used locally to simulate the full network environment and assist development, it was also used on some Raspberry Pis to gain access to tooling without root privileges. In the case of the attacker, this was done to install Hping3. Docker was not strictly required but was the easiest path to get it running on the physical system. In subsequent testing, Docker will be removed. By running within Docker, Hping3 operates inside the Docker engine's virtual environment, which modifies packet tracking behavior and leads to these extraneous results."},
            { type: "text", text: "When running on the host directly, Hping3 avoids host kernel conntrack entries. But when running inside Docker this is not the case. Raw socket packets originate within the container and pass through the Docker bridge to the host system. This handoff causes the host machine to create a conntrack entry for the SYN packet, explaining the climbing attacker conntrack entries. However, even when tracked by the host, return SYN-ACKs should still be rejected due to the absence of a matching socket — and this holds true during the stable period of the attack, where no TCP accepts are observed on either machine. This is shown in Figure 5."},
            { type: "image", src: SYNTCPAccept, caption: "Figure 5 - SYN Flood TCP Accepts", alt: "Figure 5 - SYN Flood TCP Accepts"},
            { type: "text", text: "Initially, even when partially tracked, all SYN-ACKs are rejected and no connections are formed. But at the point of target failure, a large spike in accepted connections occurs coinciding with the CPU spike and network failure on the target. So why do connections suddenly start completing?"},
            { type: "text", text: "The key is how Docker conntrack entries change the handling of returning SYN-ACKs. Because Docker created conntrack entries for the outbound SYN packets, when SYN-ACKs arrive back at the attacker they are matched to existing conntrack entries and are not marked INVALID by netfilter. This means they are passed normally to the host kernel's network stack. The host kernel has no socket for this connection, so it generates a RST|ACK response. Crucially, this RST|ACK contains a valid acknowledgment number — the target's ISN plus one — which the target's kernel interprets as a legitimate final ACK. The target briefly promotes the connection from the SYN queue to the accept queue before the RST flag causes it to be torn down immediately after."},
            { type: "text", text: "Under normal steady-state conditions this RST|ACK cycle happens continuously but too quickly to register as a sustained spike — each connection is accepted and immediately reset. At the point of target system failure, however, the target kernel is overwhelmed and cannot process the RST flag quickly enough. Thousands of queued RST|ACK packets are processed as ACKs first, each one briefly completing a handshake before the RST is processed. This batched promotion of connections from the SYN queue to the accept queue is what produces the sudden spike observed in TCP accepts. The resulting memory load from tracking thousands of these transient full connections is the most likely cause of overall system failure."},
            { type: "image", src: SYNSockets, caption: "Figure 6 - SYN Flood Socket Statistics", alt: "Figure 6 - SYN Flood Socket Statistics"},
            { type: "text", text: "The TCP-related errors in the figure below are once again consistent with expected SYN flood behavior."},
            { type: "image", src: SYNTCPErrs, caption: "Figure 7 - SYN Flood TCP Errors", alt: "Figure 7 - SYN Flood TCP Errors"},
        ]    
  }
};

const SIDEBAR_NAV: SidebarNavSection[] = [
  { label: "Getting Started", icon: <BookIcon />, children: [
    { label: "Introduction", page: "architecture" },
    { label: "Run Locally", page: "howto" },
  ]},
  { label: "Architecture", icon: <LayersIcon />, children: [
    { label: "Overview", page: "architecture" },
    { label: "Observability Layer", page: "architecture" },
    { label: "Attack Layer", page: "architecture" },
    { label: "Mitigation Layer", page: "architecture" },
  ]},
  { label: "Variables Reference", icon: <TerminalIcon />, children: [
    { label: "All Variables", page: "variables" },
  ]},
  { label: "Attacks and Findings", icon: <ActivityIcon />, children: [
    // { label: "Analysis & Findings", page: "findings" },
    { label: "HTTP Flood", page: "httpflood"},
    { label: "TCP SYN Flood", page: "synflood"}
  ]},
  { label: "How-To Guides", icon: <BookIcon />, children: [
    { label: "How-To", page: "howto" },
  ]},
];


// TYPE COLOR MAPS
const VARIABLE_TYPE_COLORS: Record<VariableType, string> = {
  counter: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  gauge: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  histogram: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  summary: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const CALLOUT_STYLES: Record<CalloutVariant, CalloutStyleConfig> = {
  info: { border: "border-sky-500/40", bg: "bg-sky-500/5", icon: <InfoIcon />, iconColor: "text-sky-400", titleColor: "text-sky-300" },
  warning: { border: "border-amber-500/40", bg: "bg-amber-500/5", icon: <AlertIcon />, iconColor: "text-amber-400", titleColor: "text-amber-300" },
  critical: { border: "border-red-500/40", bg: "bg-red-500/5", icon: <AlertIcon />, iconColor: "text-red-400", titleColor: "text-red-300" },
  info2: { border: "border-purple-500/40", bg: "bg-purple-500/5", icon: <InfoIcon />, iconColor: "text-purple-400", titleColor: "text-purple-300" },
};

const HEADING_SIZES: Record<1 | 2 | 3, string> = {
  1: "text-3xl font-semibold text-zinc-50 mt-2 mb-4",
  2: "text-xl font-medium text-zinc-100 mt-10 mb-3 border-t border-zinc-700/60 pt-8",
  3: "text-lg font-medium text-zinc-100 mt-6 mb-2",
};

const PAGE_LABELS: Record<PageKey, string> = {
  variables: "Variables",
  architecture: "Architecture",
  howto: "How-To",
  httpflood: "HTTP Flood Attack & Analysis",
  synflood: "TCP SYN Flood Attack & Analysis"
};

const ALL_PAGE_KEYS: PageKey[] = ["architecture", "variables", "howto", "httpflood", "synflood"]; //"findings",


// REUSABLE CONTENT BLOCK COMPONENTS
function HeadingBlockComponent({id, level, text }: HeadingBlockProps): ReactElement {
//   const id: string = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const [hovered, setHovered] = useState<boolean>(false);
  const Tag = (level === 1 ? "h1" : level === 2 ? "h2" : "h3") as keyof JSX.IntrinsicElements;

  return (
    <Tag
      id={id}
      className={`${HEADING_SIZES[level]} flex items-center gap-2 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {text}
      <a href={`#${id}`} className={`transition-opacity ${hovered ? "opacity-60" : "opacity-0"}`}>
        <LinkIcon />
      </a>
    </Tag>
  );
}

function TextBlockComponent({ text }: TextBlockProps): ReactElement {
  return (
    <p className="text-zinc-300 leading-relaxed text-[15px] py-2">
      {text}
    </p>
  );
}

function TextListBlockComponent({ text }: TextListBlockProps): ReactElement {
    return (
        <div className="pl-8">
            {text.map((line) => (
                <p className="text-zinc-300 leading-relaxed text-[15px] py-0">
                    {line}
                </p>
            ))}
        </div>
    );
  }

function CodeBlockComponent({ language, title, code }: CodeBlockProps): ReactElement {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (): void => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-zinc-700/80 bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400">{language}</span>
          {title && <span className="text-xs text-zinc-500 ml-1">— {title}</span>}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-zinc-300 font-mono text-[13px]">{code}</code>
      </pre>
    </div>
  );
}

function CalloutBlockComponent({ variant = "info", title, text }: CalloutBlockProps): ReactElement {
  const s: CalloutStyleConfig = CALLOUT_STYLES[variant] ?? CALLOUT_STYLES.info;

  return (
    <div className={`my-4 rounded-lg border-l-4 ${s.border} ${s.bg} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={s.iconColor}>{s.icon}</span>
        <span className={`text-sm font-semibold ${s.titleColor}`}>{title}</span>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed ml-6">{text}</p>
    </div>
  );
}

function ImageBlockComponent({ src, alt, caption }: ImageBlockProps): ReactElement {
  return (
    <figure className="my-6">
      <div className="rounded-lg overflow-hidden border border-zinc-700/60 bg-zinc-800/40">
        <img src={src} alt={alt} content="fit" className="w-full h-auto object-fill" loading="lazy" />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-zinc-500 italic">{caption}</figcaption>
      )}
    </figure>
  );
}

function VideoBlockComponent({ src, poster, title, duration }: VideoBlockProps): ReactElement {
    const [playing, setPlaying] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
  
    const handlePlay = (): void => {
      setPlaying(true);
      // Small delay to let the video element mount before calling play
      setTimeout(() => {
        videoRef.current?.play();
      }, 50);
    };
  
    const handlePause = (): void => {
      setPlaying(false);
      videoRef.current?.pause();
    };
  
    return (
      <figure className="my-6">
        <div className="rounded-lg overflow-hidden border border-zinc-700/60 bg-zinc-950 relative group">
          {!playing ? (
            <div className="relative cursor-pointer" onClick={handlePlay}>
              {poster ? (
                <img
                  src={poster}
                  alt={title ?? "Video thumbnail"}
                  className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-video bg-zinc-900" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900/90 border border-zinc-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayIcon />
                </div>
              </div>
              {duration && (
                <span className="absolute bottom-3 right-3 bg-zinc-900/90 text-zinc-300 text-xs font-mono px-2 py-1 rounded">
                  {duration}
                </span>
              )}
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={src}
                controls
                className="w-full aspect-video bg-zinc-900"
                onEnded={handlePause}
                onPause={() => {
                  if (videoRef.current?.ended) {
                    setPlaying(false);
                  }
                }}
              />
              <button
                onClick={handlePause}
                className="absolute top-3 right-3 z-10 bg-zinc-900/80 border border-zinc-700/60 rounded-md px-2 py-1 text-zinc-400 text-xs hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
        {title && (
          <figcaption className="mt-2 text-center text-xs text-zinc-500">{title}</figcaption>
        )}
      </figure>
    );
  }

// --- Block Renderer (exhaustive switch on discriminated union) ---

function renderBlock(block: ContentBlock, index: number): ReactElement | null {
  switch (block.type) {
    case "heading":
      return <HeadingBlockComponent key={index} id={block.id} level={block.level} text={block.text} />;
    case "text":
      return <TextBlockComponent key={index} text={block.text} />;
    case "textlist":
      return <TextListBlockComponent key={index} text={block.text} />;
    case "code":
      return <CodeBlockComponent key={index} language={block.language} title={block.title} code={block.code} />;
    case "callout":
      return <CalloutBlockComponent key={index} variant={block.variant} title={block.title} text={block.text} />;
    case "image":
      return <ImageBlockComponent key={index} src={block.src} alt={block.alt} caption={block.caption} />;
    case "video":
      return <VideoBlockComponent key={index} src={block.src} poster={block.poster} title={block.title} duration={block.duration} />;
    default: {
    // @ts-ignore
      const _exhaustive: never = block;
      return null;
    }
  }
}


// VARIABLES PAGE

function VariablesPage(): ReactElement {
  const [search, setSearch] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<VariableCategory>("All");
  const [expandedVar, setExpandedVar] = useState<string | null>(null);

  const filtered: Variable[] = SAMPLE_VARIABLES.filter((v: Variable): boolean => {
    const matchCat: boolean = activeCategory === "All" || v.category === activeCategory;
    const q: string = search.toLowerCase();
    const matchSearch: boolean =
      !q ||
      v.name.includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.type.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-zinc-50 mb-1">Variables Reference</h1>
      <p className="text-zinc-500 text-sm mb-6">System metrics collected during DDoS mitigation events</p>

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><SearchIcon /></div>
        <input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search variables by name, type, category, or description…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {VARIABLE_CATEGORIES.map((cat: VariableCategory) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700/60 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-xs text-zinc-600 mb-3">
        {filtered.length} variable{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Variable Cards */}
      <div className="flex flex-col gap-2">
        {filtered.map((v: Variable) => {
          const isOpen: boolean = expandedVar === v.name;
          return (
            <div
              key={v.name}
              className={`rounded-lg border transition-colors cursor-pointer ${
                isOpen
                  ? "bg-zinc-800/80 border-zinc-600"
                  : "bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600"
              }`}
              onClick={() => setExpandedVar(isOpen ? null : v.name)}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  <ChevronRight />
                </span>
                <code className="text-sm font-mono text-zinc-200 flex-1">{v.name}</code>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${
                    VARIABLE_TYPE_COLORS[v.type] ?? "text-zinc-400 bg-zinc-700 border-zinc-600"
                  }`}
                >
                  {v.type}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-mono w-16 text-right">
                  {v.unit}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-500 font-medium">
                  {v.category}
                </span>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 ml-7 border-t border-zinc-700/40 pt-3">
                  <p className="text-sm text-zinc-400 leading-relaxed mb-3">{v.description}</p>
                  <div className="bg-zinc-950 rounded-md px-3 py-2 border border-zinc-700/40">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Example usage</span>
                    <code className="block text-xs text-emerald-400 font-mono mt-1">{v.example}</code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">
            No variables match your search criteria
          </div>
        )}
      </div>
    </div>
  );
}


// CONTENT PAGE

function ContentPage({ pageKey }: ContentPageProps): ReactElement {
  const page: ContentPageData | undefined = SAMPLE_CONTENT_PAGES[pageKey];

  if (!page) {
    return <div className="text-zinc-500">Page not found</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-zinc-600 mb-6">
        {page.breadcrumb.map((crumb: string, i: number) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="mx-0.5">/</span>}
            <span
              className={
                i === page.breadcrumb.length - 1
                  ? "text-zinc-400"
                  : "hover:text-zinc-400 cursor-pointer transition-colors"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Render all blocks */}
      <div className="max-w-none">
        {page.blocks.map((block: ContentBlock, i: number) => renderBlock(block, i))}
      </div>

      {/* Page footer */}
      <div className="mt-16 pt-6 border-t border-zinc-700/40 flex items-center justify-between text-xs text-zinc-600">
        <span>COMPS Winter 2026 - Analysing and Replicating Malware</span>
        <button className="hover:text-zinc-400 transition-colors flex items-center gap-1">
          <LinkIcon /> Copy link to page
        </button>
      </div>
    </div>
  );
}


// SIDEBAR

function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps): ReactElement {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: true, 3: true, 4: true,
  });

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col
        transform transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0
      `}
    >
      
      <Link to={"/"} className="flex items-center justify-between px-4 h-14 border-b border-zinc-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
            <LayersIcon />
          </div>
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">Back to Dashbaord</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-500 hover:text-zinc-300">
          <XIcon />
        </button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
            <ActivityIcon />
          </div>
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">DDoS Docs</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-500 hover:text-zinc-300">
          <XIcon />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {SIDEBAR_NAV.map((section: SidebarNavSection, si: number) => (
          <div key={si} className="mb-1">
            <button
              onClick={() => setExpanded((prev: Record<number, boolean>) => ({ ...prev, [si]: !prev[si] }))}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/40 transition-colors"
            >
              <span className="text-zinc-600">{section.icon}</span>
              <span className="flex-1 text-left">{section.label}</span>
              <span className={`transition-transform ${expanded[si] ? "" : "-rotate-90"}`}>
                <ChevronDown />
              </span>
            </button>
            {expanded[si] && (
              <div className="ml-3 mt-0.5 border-l border-zinc-700/50 pl-3">
                {section.children.map((item: SidebarNavChild, ci: number) => (
                  <button
                    key={ci}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      currentPage === item.page
                        ? "text-purple-300 bg-purple-500/10"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-zinc-700/60 px-4 py-3">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">COMPS Winter 2025</p>
      </div>
    </div>
  );
}


// MAIN APP
export default function DocsApp(): ReactElement {
  const [currentPage, setCurrentPage] = useState<PageKey>("variables");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div
      className="h-screen w-screen flex bg-zinc-900 text-zinc-100 overflow-hidden"
      style={{ fontFamily: "'IBM Plex Sans', 'SF Pro Text', -apple-system, sans-serif" }}
    >
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-3 h-14 px-4 border-b border-zinc-700/60 shrink-0 bg-zinc-800/50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-500 hover:text-zinc-300">
            <MenuIcon />
          </button>
          <div className="flex-1" />
          <div className="flex gap-1">
            {ALL_PAGE_KEYS.map((page: PageKey) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  currentPage === page
                    ? "bg-zinc-700 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/40"
                }`}
              >
                {PAGE_LABELS[page]}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {currentPage === "variables" ? (
              <VariablesPage />
            ) : (
              <ContentPage pageKey={currentPage} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}