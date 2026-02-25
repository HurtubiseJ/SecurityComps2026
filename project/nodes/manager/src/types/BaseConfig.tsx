import { v4 as uuidv4 } from "uuid";
import type { NodeType } from "./configs";
import {
  CaretDownIcon,
  CaretUpIcon,
  LetterCircleHIcon,
  TextItalicIcon,
} from "@phosphor-icons/react";
import { LOCAL_NODE_IP_MAP, NODE_IP_MAP } from "../constants/NodeIp";
import type { Logger, Message } from "./Logger";
import { NodeColorMap } from "../constants/NodeColorMap";

const IS_LOCAL = import.meta.env.VITE_LOCAL === "true";
const IP_MAP = IS_LOCAL ? LOCAL_NODE_IP_MAP : NODE_IP_MAP

export type metrics = {
  cpu: boolean;
  memory: boolean;
  disk: boolean;
  network: boolean;
  fastapi: boolean;
  sys_cpu: boolean;
  sys_memory: boolean;
  sys_network: boolean;
};

export class BaseMonitor {
  public enabled: boolean;
  public metrics: metrics;

  public constructor(enabled: boolean = false, metrics: metrics) {
    this.enabled = enabled;
    this.metrics = metrics;
  }

  getConfig() {
    return {
      enabled: this.enabled,
      metrics: this.metrics,
    };
  }

  configRow(
    title: string,
    key: string,
    inputType: string,
    icon: React.ReactElement,
    onChange: (v: any) => void,
    value: string | boolean,
    updateNode: (nodeJson: any) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full overflow-hidden min-w-0 pr-4">
        <div className="flex w-full flex-row justify-between items-start pr-1">
          <h4 className="font-light text-gray-300">{title}</h4>
          <p className="text-gray-500">{key}</p>
        </div>

        <div className="flex items-center gap-x-2 rounded-md overflow-hidden bg-slate-600 p-1 min-w-0">
          {icon}
          {inputType === "checkbox" ? (
            <input
              type={inputType}
              onChange={(v) => {
                onChange(v);
                updateNode(parentGetConfig());
              }}
              name={key}
              checked={value as boolean}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          ) : (
            <input
              type={inputType}
              onChange={onChange}
              name={key}
              value={value as string}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          )}
        </div>
      </div>
    );
  }

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full gap-y-2 mt-2 pb-2 border-b border-zinc-700">
        <h3 className="text-lg text-white">Monitoring</h3>

        {this.configRow(
          "Enabled",
          "enabled",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.enabled = v.target.checked),
          this.enabled,
          updateNode,
          parentGetConfig
        )}

        {this.configRow(
          "CPU",
          "cpu",
          "checkbox",
          <LetterCircleHIcon weight="bold" />,
          (v) => {
            this.metrics.cpu = v.target.checked;
          },
          this.metrics.cpu,
          updateNode,
          parentGetConfig
        )}

        {this.configRow(
          "Disk",
          "disk",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.disk = v.target.checked),
          this.metrics.disk,
          updateNode,
          parentGetConfig
        )}

        {this.configRow(
          "Network",
          "network",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.network = v.target.checked),
          this.metrics.network,
          updateNode,
          parentGetConfig
        )}

        {this.configRow(
          "FastAPI",
          "fastapi",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.fastapi = v.target.checked),
          this.metrics.fastapi,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "System CPU",
          "sys_cpu",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.sys_cpu = v.target.checked),
          this.metrics.sys_cpu,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "System Memory",
          "sys_memory",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.sys_memory = v.target.checked),
          this.metrics.sys_memory,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "System Network",
          "sys_network",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.metrics.sys_network = v.target.checked),
          this.metrics.sys_network,
          updateNode,
          parentGetConfig
        )}
      </div>
    );
  }
}

export class BaseConfig {
  public id: string;
  public running: boolean;
  public name: string;
  public type: NodeType;
  public enabled: boolean;
  public forward_host: string;
  public forward_port: string;
  public port: string;
  public host: string;

  public monitor: BaseMonitor | null;
  public custom_config: AttackerConfig | ProxyConfig | null;

  public logger: Logger | null;

  public state: "stopped" | "idle" | "running";

  public run_time: number = 0;
  public cpu_cpt: number = 0;
  public cpu_count: number = 0;

  public constructor(
    name: string,
    type: NodeType,
    enabled: boolean = false,
    forward_host: string = "10.0.0.0",
    forward_port: string = "8000",
    host: string = "10.0.0.1",
    port: string = "8000",
    monitor: BaseMonitor | null = null,
    custom_config: AttackerConfig | ProxyConfig | null = null,
    logger: Logger | null = null,
    running: boolean = false, 
    state: "stopped" | "idle" | "running" = "idle"
  ) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.enabled = enabled;
    this.forward_host = forward_host;
    this.forward_port = forward_port;
    this.port = port;
    this.host = host;

    this.monitor = monitor;
    this.custom_config = custom_config;

    this.logger = logger;

    this.running = running;

    this.state = state;

    this.checkStatus();
  }

  checkMetrics = async () => {
    if (IS_LOCAL) { // Use cAdvisor
        
    }
    
  }

  checkStatus = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}status`);
    if (!response || response.status != 200) {
        this.state = "stopped";
        return
    }

    const content = await response.json();
    if (!content) {
      this.state = "stopped";
      return;
    }

    this.state = content["state"] ?? "stopped";
  };

  appendToLogger = (text: string, isError: boolean = false) => {
    if (this.logger == null) {
      console.log("LOGGER IS NULL");
      return;
    }

    const msg: Message = {
      id: this.id,
      owner: this.name,
      color: NodeColorMap[this.name],
      message: text,
      isError: isError,
    };

    this.logger?.appendLog(msg);
  };

  applyConfigActiveNode = async () => {
    console.log(JSON.stringify(this.getConfig()));
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.getConfig()),
    });

    if (!response.ok) {
      throw new Error("Could apply config");
    }

    const content = await response.json();

    this.appendToLogger(JSON.stringify(content["message"]));

    return true;
  };

  restartConfigActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}restart`);
    const res = await response.json();
    this.appendToLogger(JSON.stringify(res["message"]));
  };
  getConfigActiveNodeConfig = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.jname]}config`);
    const res = await response.json();

    this.appendToLogger(`Successfully fetched Node Config`);
    return res;
  };

  startActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}start`, {
      method: "POST",
    });
    const res = await response.json();

    this.appendToLogger(JSON.stringify(res["message"]));

    this.checkStatus();

    return res;
  };

  stopActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}stop`, {
      method: "POST",
    });

    const res = await response.json();

    this.appendToLogger(JSON.stringify(res["message"]));

    this.checkStatus();
    return res;
  };

  //   @ts-ignore
  getConfig() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      forward_host: this.forward_host,
      forward_port: this.forward_port,
      host: this.host,
      port: this.port,

      monitor: this.monitor?.getConfig(),

      custom_config: this.custom_config?.getConfig(),
    };
  }

  getApplyRestart() {
    return (
      <div className="flex flex-1 w-full flex-col items-start justify-center gap-y-2 pr-4">
        <div className="flex flex-1 w-full flex-row gap-x-4 items-start justify-between">
          <a
            className="flex w-full bg-yellow-200 hover:bg-yellow-100 cursor-pointer items-center rounded-md px-4 py-2"
            onClick={async () => {
              await this.applyConfigActiveNode();
            }}
          >
            <p className="text-black text-sm">Save Config</p>
          </a>
          <a
            className="flex w-full bg-blue-200 hover:bg-blue-100 cursor-pointer items-center rounded-md px-4 py-2"
            onClick={async () => {
              await this.restartConfigActiveNode();
            }}
          >
            <p className="text-black text-sm">Restart</p>
          </a>
        </div>

        {this.type === "attacker" && (
          <div className="flex flex-1 w-full  flex-row gap-x-4 items-start justify-between">
            <a
              className="flex w-full bg-green-500 hover:bg-green-400 cursor-pointer rounded-md px-4 py-2"
              onClick={async () => {
                await this.startActiveNode();
              }}
            >
              <p className="text-black text-sm">START</p>
            </a>
            <a
              className="flex w-full bg-red-500 hover:bg-red-400 cursor-pointer rounded-md px-4 py-2"
              onClick={async () => {
                await this.stopActiveNode();
              }}
            >
              <p className="text-black text-sm">STOP</p>
            </a>
          </div>
        )}
      </div>
    );
  }

  // Layout functions
  getDashboardNode({ onClick }: { onClick: () => void }) {
    return (
      <div className="flex flex-col gap-y-2 min-w-[140px]">
        <p className="text-sm font-medium text-purple-400">{this.name}</p>

        <button
          onClick={() => {
            onClick();
          }}
          className="
          relative
          flex flex-col 
          w-full min-h-[120px]
          rounded-lg
          bg-gray-700
          text-left
          hover:bg-gray-600
          active:bg-gray-500
          transition
          cursor-pointer
          "
        >
          <div className="w-full">
            {this.state === "running" ? (
              <div className="absolute right-2 top-2 rounded-full bg-green-600 h-3 w-3 min-w-1" />
            ) : this.state === "idle" ? (
              <div className="absolute right-2 top-2 rounded-full bg-yellow-400 h-3 w-3 min-w-1" />
            ) : (
              <div className="absolute right-2 top-2 rounded-full bg-gray-500 h-3 w-3 min-w-1" />
            )}
          </div>
          <div
            className="
                flex flex-col gap-y-1
                w-full min-h-[120px]
                rounded-lg
                bg-gray-700
                p-3
                text-left
                hover:bg-gray-600
                active:bg-gray-500
                transition
                cursor-pointer
                "
          >
            <p className="text-xs text-purple-300">Enabled: {this.enabled}</p>
            <p className="text-xs text-purple-300">IP: {this.host}</p>
            <p className="text-xs text-purple-300">Port: {this.port}</p>
            <p className="text-xs text-purple-300">Role: {this.type}</p>
            <p className="text-xs text-purple-300">
              Forward IP: {this.forward_host}
            </p>
            <p className="text-xs text-purple-300">
              Forward Port: {this.forward_port}
            </p>
          </div>
        </button>
      </div>
    );
  }

  configRow(
    title: string,
    key: string,
    inputType: string,
    icon: React.ReactElement,
    onChange: (v: any) => void,
    value: string,
    updateNode: (nodeStr: any) => void
  ) {
    return (
      <div className="flex flex-col w-full overflow-hidden min-w-0 pr-4">
        <div className="flex w-full flex-row justify-between items-start pr-1">
          <h4 className="font-light text-gray-300">{title}</h4>
          <p className="text-gray-500">{key}</p>
        </div>

        <div className="flex items-center gap-x-2 rounded-md overflow-hidden bg-slate-600 p-1 min-w-0">
          {icon}
          <input
            type={inputType}
            onChange={(v) => {
              onChange(v);
              updateNode(this.getConfig());
            }}
            value={value}
            size={Math.min(this.id.length + 2 || 1, 80)}
            className="max-w-full bg-slate-600 text-gray-300"
          />
        </div>
      </div>
    );
  }

  configLayout(updateNode: (nodeStr: any) => void) {
    return (
      <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 mt-2">
        {this.getApplyRestart()}
        <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 pb-4 border-b border-zinc-700">
          <h3 className="text-lg text-white">Base</h3>

          {this.configRow(
            "UUID",
            "id",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.id = v.target.value;
            },
            this.id,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Node name",
            "name",
            "text",
            <LetterCircleHIcon weight="bold" />,
            (v) => {
              console.log(v.target.value);
              this.name = v.target.value;
            },
            this.name,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Node Type",
            "type",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.type = v.target.value;
            },
            this.type,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Enabled",
            "enabled",
            "checkbox",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.enabled = v.target.checked;
            },
            this.enabled ? "Enabled" : "Disabled",
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Host",
            "host",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.host = v.target.value;
            },
            this.host,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Port",
            "port",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.port = v.target.value;
            },
            this.port,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Forward Host",
            "forward_host",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.forward_host = v.target.value;
            },
            this.forward_host,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Forward Port",
            "forward_port",
            "text",
            <TextItalicIcon weight="bold" />,
            (v) => {
              this.forward_port = v.target.value;
            },
            this.forward_port,
            (nodeStr: any) => updateNode(nodeStr)
          )}
        </div>

        {this.monitor !== null && (
          <>{this.monitor.configLayout(updateNode, () => this.getConfig())}</>
        )}

        {this.custom_config !== null && (
          <>
            {this.custom_config.configLayout(updateNode, () =>
              this.getConfig()
            )}
          </>
        )}
      </div>
    );
  }
}

export class MonitorNodeConfig extends BaseConfig {
  public constructor(
    name: string,
    type: NodeType,
    enabled: boolean,
    forward_host: string,
    forward_port: string,
    host: string,
    port: string
  ) {
    super(name, type, enabled, forward_host, forward_port, host, port);
    // Additional config
  }
}

export class AttackerConfig {
  public attack_type: string;
  public forward_host: string;
  public forward_port: string;
  public duration_seconds: number;
  public rate_rps: number;
  public threads: number;
  public connections: number;
  //   public socket_count: number;
  public method: string;
  public paths: string[];
  public path_ratios: number[];
  //   public headers: Map<string, string>;
  public keep_alive: boolean;
  public header_interval_ms: number;
  public payload_bytes: number;
  public connect_timeout_ms: number;

  public constructor(
    attack_type: string,
    forward_host: string,
    forward_port: string,
    duration_seconds: number,
    rate_rps: number,
    threads: number,
    connections: number,
    // socket_count: number,
    method: string,
    paths: string[],
    path_ratios: number[],
    // headers: Map<string, string>,
    keep_alive: boolean,
    header_interval_ms: number,
    payload_bytes: number,
    connection_timeout_ms: number
  ) {
    this.attack_type = attack_type;
    this.forward_host = forward_host;
    this.forward_port = forward_port;
    this.rate_rps = rate_rps;
    this.threads = threads;
    this.connections = connections;
    // this.socket_count = socket_count;
    this.method = method;
    this.paths = paths;
    this.path_ratios = path_ratios;
    // this.headers = headers;
    this.keep_alive = keep_alive;
    this.duration_seconds = duration_seconds;
    this.header_interval_ms = header_interval_ms;
    this.payload_bytes = payload_bytes;
    this.connect_timeout_ms = connection_timeout_ms;
  }

  //   @ts-ignore
  getConfig() {
    return {
      attack_type: this.attack_type,
      forward_host: this.forward_host,
      forward_port: this.forward_port,
      duration_seconds: this.duration_seconds,
      rate_rps: this.rate_rps,
      threads: this.threads,
      connections: this.connections,
      method: this.method,
      paths: this.paths,
      path_ratios: this.path_ratios,
      keep_alive: this.keep_alive,
      header_interval_ms: this.header_interval_ms,
      connect_timeout_ms: this.connect_timeout_ms,
      payload_bytes: this.payload_bytes,
    };
  }

  configRow(
    title: string,
    key: string,
    inputType: string,
    icon: React.ReactElement,
    onChange: (v: any) => void,
    value: string | boolean,
    updateNode: (nodeJson: any) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full overflow-hidden min-w-0 pr-4">
        <div className="flex w-full flex-row justify-between items-start pr-1">
          <h4 className="font-light text-gray-300">{title}</h4>
          <p className="text-gray-500">{key}</p>
        </div>

        <div className="flex items-center gap-x-2 rounded-md overflow-hidden bg-slate-600 p-1 min-w-0">
          {icon}
          {inputType === "checkbox" ? (
            <input
              type={inputType}
              onChange={(v) => {
                onChange(v);
                updateNode(parentGetConfig());
              }}
              name={key}
              checked={value as boolean}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          ) : (
            <input
              type={inputType}
              onChange={(v) => {
                onChange(v);
                updateNode(parentGetConfig());
              }}
              name={key}
              value={value as string}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          )}
        </div>
      </div>
    );
  }

  multiConfigRow(
    title: string,
    title_key: string,
    inputType: string,
    icon: React.ReactElement,
    onChange: (v: any) => void,
    values: any[],
    updateNode: (nodeJson: any) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full overflow-hidden min-w-0 pr-4">
        <div className="flex w-full flex-row justify-between items-start pr-1">
          <h4 className="font-light text-gray-300">{title}</h4>
          <p className="text-gray-500">{title_key}</p>
        </div>

        <div className="flex flex-col gap-y-2 items-center">
          {values?.map((key, i) => {
            return (
              <div
                key={key}
                className="flex w-full items-center gap-x-2 rounded-md overflow-hidden bg-slate-600 p-1 min-w-0"
              >
                {icon}
                <input
                  type={inputType}
                  onChange={(v) => {
                    values[i] = v.target.value as unknown as string;

                    onChange(values);
                    updateNode(parentGetConfig());
                  }}
                  name={values[i] as string}
                  value={values[i] as string}
                  size={Math.min(30 + 2 || 1, 80)}
                  className="max-w-full bg-slate-600 text-gray-300"
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-row w-full gap-x-4 items-start justify-center">
          <button
            onClick={() => {
              values.pop();
              updateNode(parentGetConfig());
            }}
          >
            <CaretUpIcon width={12} />
          </button>
          <button
            onClick={() => {
              values.push("");
              updateNode(parentGetConfig());
            }}
          >
            <CaretDownIcon width={12} />
          </button>
        </div>
      </div>
    );
  }

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full gap-y-2 mt-2 pb-2 border-b border-zinc-700">
        <h3 className="text-lg text-white">Attacker Config</h3>

        {this.configRow(
          "Attack Type",
          "attack_type",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.attack_type = v.target.value),
          this.attack_type,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Threads",
          "threads",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.threads = Number(v.target.value)),
          String(this.threads),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Duration Sec",
          "duration_seconds",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.duration_seconds = Number(v.target.value)),
          String(this.duration_seconds),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Request Rate",
          "rate_rps",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.rate_rps = Number(v.target.value)),
          String(this.rate_rps),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Connections",
          "connections",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.connections = Number(v.target.value)),
          String(this.connections),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Method",
          "method",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.method = v.target.value),
          this.method,
          updateNode,
          parentGetConfig
        )}
        {this.multiConfigRow(
          "Paths",
          "paths",
          "text",
          <TextItalicIcon weight="bold" />,
          (v: any) => (this.paths = v),
          this.paths,
          updateNode,
          parentGetConfig
        )}
        {this.multiConfigRow(
          "Path Ratios",
          "path_ratios",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.path_ratios = v),
          this.path_ratios,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Keep Alive",
          "keep_alive",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.keep_alive = v.target),
          this.keep_alive,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Header Interval",
          "header_interval_ms",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.header_interval_ms = Number(v.target.value)),
          String(this.header_interval_ms),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Payload Bytes",
          "payload_bytes",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.payload_bytes = Number(v.target.value)),
          String(this.payload_bytes),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Connection Timeout",
          "connection_timeout_ms",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.connect_timeout_ms = Number(v.target.value)),
          String(this.connect_timeout_ms),
          updateNode,
          parentGetConfig
        )}
      </div>
    );
  }
}

export class ProxyConfig {
  public enabled: boolean;
  public rate_limit_rate: number;
  public max_connections: number;
  public burst: number;
  public connection_timeout: number;
  public read_timeout: number;
  public send_timeout: number;

  public constructor(
    enabled: boolean,
    rate_limit_rate: number,
    max_connections: number,
    burst: number,
    connection_timeout: number,
    read_timeout: number,
    send_timeout: number
  ) {
    this.enabled = enabled;
    this.rate_limit_rate = rate_limit_rate;
    this.max_connections = max_connections;
    this.burst = burst;
    this.connection_timeout = connection_timeout;
    this.read_timeout = read_timeout;
    this.send_timeout = send_timeout;
  }

  //   @ts-ignore
  getConfig() {
    return {
      enabled: this.enabled,
      rate_limit_rate: this.rate_limit_rate,
      max_connections: this.max_connections,
      burst: this.burst,
      connection_timeout: this.connection_timeout,
      read_timeout: this.read_timeout,
      send_timeout: this.send_timeout,
    };
  }

  configRow(
    title: string,
    key: string,
    inputType: string,
    icon: React.ReactElement,
    onChange: (v: any) => void,
    value: string | boolean,
    updateNode: (nodeJson: any) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full overflow-hidden min-w-0 pr-4">
        <div className="flex w-full flex-row justify-between items-start pr-1">
          <h4 className="font-light text-gray-300">{title}</h4>
          <p className="text-gray-500">{key}</p>
        </div>

        <div className="flex items-center gap-x-2 rounded-md overflow-hidden bg-slate-600 p-1 min-w-0">
          {icon}
          {inputType === "checkbox" ? (
            <input
              type={inputType}
              onChange={(v) => {
                onChange(v);
                updateNode(parentGetConfig());
              }}
              name={key}
              checked={value as boolean}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          ) : (
            <input
              type={inputType}
              onChange={(v) => {
                onChange(v);
                updateNode(parentGetConfig());
              }}
              name={key}
              value={value as string}
              size={Math.min(30 + 2 || 1, 80)}
              className="max-w-full bg-slate-600 text-gray-300"
            />
          )}
        </div>
      </div>
    );
  }

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => {}
  ) {
    return (
      <div className="flex flex-col w-full gap-y-2 mt-2 pb-2 border-b border-zinc-700">
        <h3 className="text-lg text-white">Proxy Config</h3>

        {this.configRow(
          "Enabled",
          "enabled",
          "checkbox",
          <TextItalicIcon weight="bold" />,
          (v) => (this.enabled = v.target.checked),
          this.enabled,
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Rate RPS",
          "rate_limit_rate",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.rate_limit_rate = Number(v.target.value)),
          String(this.rate_limit_rate),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Max Connections",
          "max_connections",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.max_connections = Number(v.target.value)),
          String(this.max_connections),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Burst",
          "burst",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.burst = Number(v.target.value)),
          String(this.burst),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Connection Timeout",
          "connection_timeout",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.connection_timeout = Number(v.target.value)),
          String(this.connection_timeout),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Read Timeout",
          "read_timeout",
          "text",
          <TextItalicIcon weight="bold" />,
          (v: any) => (this.read_timeout = Number(v.target.value)),
          String(this.read_timeout),
          updateNode,
          parentGetConfig
        )}
        {this.configRow(
          "Send Timeout",
          "send_timeout",
          "text",
          <TextItalicIcon weight="bold" />,
          (v) => (this.send_timeout = Number(v.target.value)),
          String(this.send_timeout),
          updateNode,
          parentGetConfig
        )}
      </div>
    );
  }
}

export class TargetConfig extends BaseConfig {
  public constructor(
    name: string,
    type: NodeType,
    enabled: boolean,
    forward_host: string,
    forward_port: string,
    host: string,
    port: string
  ) {
    super(name, type, enabled, forward_host, forward_port, host, port);
    // Additional config
  }
}
