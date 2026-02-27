// import SideNav from "../components/Docs/SideNav"
// import DocsContent from "../components/Docs/DocsContent"
// import LandingPage from "../components/Docs/pages/Landing"

// import { useState } from "react"
// import VariablesPage from "../components/Docs/pages/VariablesPage"


// const pages = {
//     "landing": <LandingPage />,
//     "variables": <VariablesPage />
// }


// export default function Docs() {

//     const [selectedPage, setSelectedPage] = useState<String>("landing");

//     // @ts-ignore
//     const currentPage = pages[selectedPage]
//     console.log(selectedPage, currentPage)

//     return (
//         <div className="h-screen w-screen flex flex-row bg-zinc-900 text-zinc-100 overflow-hidden">
//             <SideNav setSelectedPage={setSelectedPage} />

//             <DocsContent Page={currentPage} />
//         </div>
//     )
// }
import { useState, type ReactElement, type JSX } from "react";
import { Link } from "react-router-dom";
import ArchDiagram from "../assets/ArchDiagram.png"

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

// --- Variable System ---

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

// --- Content Block Discriminated Union ---

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

type ContentBlock = HeadingBlock | TextBlock | CodeBlock | CalloutBlock | ImageBlock | VideoBlock;

// --- Page Structure ---

interface ContentPageData {
  title: string;
  breadcrumb: string[];
  blocks: ContentBlock[];
}

type PageKey = "variables" | "architecture" | "findings" | "howto";

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


// ═══════════════════════════════════════════════════════════════
// ICON COMPONENTS
// ═══════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — Variables (DDoS system metrics)
// ═══════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — Content Pages
// ═══════════════════════════════════════════════════════════════

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
      { type: "text", text: "-  PROMETHEUS: Metric aggregator and store" },
      { type: "text", text: "-  GRAFANA: Configurable Dashboard and Metric Filter" },
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
      { type: "text", text: "The target node is very simple and defines a number of endpoints modeling common types of endpoints. This including heavy CPU bound work and IO opperations. Some mitigation is also present here such as caching." },
    ]
  },
  findings: {
    title: "Q4 Attack Analysis",
    breadcrumb: ["Docs", "Findings", "Attack Analysis & Findings"],
    blocks: [
      { id: "Analysis & Findings", type: "heading", level: 1, text: "Attack Analysis & Findings" },
      { type: "text", text: "This report covers the 47 significant DDoS events observed during Q4 2025. Attack sophistication increased notably, with multi-vector campaigns becoming the norm rather than the exception." },
      { type: "callout", variant: "critical", title: "Key Finding", text: "73% of Q4 attacks used carpet-bombing techniques targeting multiple /24 subnets simultaneously, up from 31% in Q3. Traditional per-IP mitigation is no longer sufficient." },
      { type: "image", src: "https://placehold.co/900x400/1e1e2e/f43f5e?text=Attack+Volume+Timeline", alt: "Q4 attack volume timeline", caption: "Figure 1 — Attack volume timeline showing peak events and mitigation response times" },
    //   { type: "heading", level: 2, text: "Attack Vector Distribution" },
      { type: "text", text: "UDP reflection attacks remain dominant at 58% of total volume, but TCP-based attacks showed the highest growth rate. SYN floods with randomized options fields proved particularly challenging for stateless mitigation layers." },
      { type: "code", language: "promql", title: "Detection Query — Carpet Bomb Pattern", code: "# Alert when multiple subnets see simultaneous traffic spikes\ncount by (subnet) (\n  rate(network_rx_bytes{job=\"edge\"}[1m]) > 1e8\n) > 5" },
    ]
  },
  howto: {
    title: "Helpful information and guides",
    breadcrumb: ["Docs", "How-To"],
    blocks: [
      { id: "Content", type: "heading", level: 1, text: "Content" },
      { id: "Content", type: "heading", level: 3, text: "The How-To page covers the following information:" },
      { type: "text", text: "-  Modifing Node Configuration" },
      { type: "text", text: "-  Using the Metrics Dashboard" },
      { type: "text", text: "-  Local Development Configuration" },
      { id: "Content", type: "heading", level: 1, text: "Modifying Node Configuration" },
      { type: "callout", variant: "info", title: "When to Apply", text: "Apply these tunings proactively on any system handling >100k concurrent connections, or reactively when netfilter_conntrack_drop starts incrementing." },
    //   { type: "heading", level: 2, text: "Step 1 — Assess Current State" },
      { type: "code", language: "bash", title: "Check Conntrack Utilization", code: "# Current entries vs maximum\necho \"$(cat /proc/sys/net/netfilter/nf_conntrack_count) / $(cat /proc/sys/net/netfilter/nf_conntrack_max)\"\n\n# Watch in real-time\nwatch -n1 'cat /proc/sys/net/netfilter/nf_conntrack_count'" },
    //   { type: "heading", level: 2, text: "Step 2 — Increase Table Size" },
      { type: "code", language: "bash", title: "Expand Conntrack Table", code: "# Double the conntrack table (default is often 262144)\nsysctl -w net.netfilter.nf_conntrack_max=524288\n\n# Increase hash table buckets (should be ~max/4)\necho 131072 > /sys/module/nf_conntrack/parameters/hashsize" },
      { type: "callout", variant: "warning", title: "Memory Impact", text: "Each conntrack entry uses ~300 bytes. Doubling the table from 262k to 524k entries adds ~75MB of kernel memory. Verify available memory before applying." },
    //   { type: "heading", level: 2, text: "Step 3 — Reduce Timeouts" },
      { type: "code", language: "bash", title: "Aggressive Timeout Tuning", code: "# Reduce established timeout from 5 days to 1 hour\nsysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=3600\n\n# Reduce SYN_RECV timeout from 60s to 10s\nsysctl -w net.netfilter.nf_conntrack_tcp_timeout_syn_recv=10\n\n# Reduce TIME_WAIT from 120s to 30s\nsysctl -w net.netfilter.nf_conntrack_tcp_timeout_time_wait=30" },
      { type: "video", src: "#", poster: "https://placehold.co/900x500/1e1e2e/60a5fa?text=Conntrack+Tuning+Demo", title: "Live Demo — Conntrack Tuning Under Load", duration: "8:21" },
    ]
  }
};

const SIDEBAR_NAV: SidebarNavSection[] = [
  { label: "Getting Started", icon: <BookIcon />, children: [
    { label: "Introduction", page: "architecture" },
    { label: "Quick Start", page: "howto" },
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
    { label: "Analysis & Findings", page: "findings" },
  ]},
  { label: "How-To Guides", icon: <BookIcon />, children: [
    { label: "How-To", page: "howto" },
  ]},
];


// ═══════════════════════════════════════════════════════════════
// TYPE COLOR MAPS
// ═══════════════════════════════════════════════════════════════

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
  findings: "Findings",
  howto: "How-To",
};

const ALL_PAGE_KEYS: PageKey[] = ["architecture", "variables", "findings", "howto"];


// ═══════════════════════════════════════════════════════════════
// REUSABLE CONTENT BLOCK COMPONENTS
// ═══════════════════════════════════════════════════════════════

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

  return (
    <figure className="my-6">
      <div
        className="rounded-lg overflow-hidden border border-zinc-700/60 bg-zinc-950 relative group cursor-pointer"
        onClick={() => setPlaying(!playing)}
      >
        {!playing ? (
          <>
            <img src={poster} alt={title ?? "Video thumbnail"} className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
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
          </>
        ) : (
          <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center text-zinc-500 text-sm">
            Video player would render here — src: {src}
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


// ═══════════════════════════════════════════════════════════════
// VARIABLES PAGE
// ═══════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════
// CONTENT PAGE
// ═══════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════

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


// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function DocsApp(): ReactElement {
  const [currentPage, setCurrentPage] = useState<PageKey>("variables");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div
      className="h-screen w-screen flex bg-zinc-900 text-zinc-100 overflow-hidden"
      style={{ fontFamily: "'IBM Plex Sans', 'SF Pro Text', -apple-system, sans-serif" }}
    >
      {/* Sidebar overlay on mobile */}
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