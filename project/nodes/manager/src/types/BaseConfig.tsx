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
const IP_MAP = IS_LOCAL ? LOCAL_NODE_IP_MAP : NODE_IP_MAP;

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

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full gap-y-3 mt-3 pb-4 border-b border-zinc-700/60">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      <div className="flex flex-col gap-y-2">{children}</div>
    </div>
  );
}

/** Single config input row — shared across all config classes */
function ConfigRow({
  title,
  keyLabel,
  inputType,
  icon,
  onChange,
  value,
  updateNode,
  parentGetConfig,
}: {
  title: string;
  keyLabel: string;
  inputType: string;
  icon: React.ReactElement;
  onChange: (v: React.ChangeEvent<HTMLInputElement>) => void;
  value: string | boolean;
  updateNode: (nodeJson: any) => void;
  parentGetConfig: () => any;
}) {
  return (
    <div className="flex flex-col w-full overflow-hidden min-w-0">
      <div className="flex w-full items-center mb-1">
        <h4 className="text-nowrap min-w-0 flex-1 truncate text-[13px] font-normal text-zinc-300">
          {title}
        </h4>
        <code className="ml-2 shrink-0 text-[10px] font-mono text-zinc-600">
          {keyLabel}
        </code>
      </div>

      <div className="flex items-center gap-x-2 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700/60 px-2 py-1.5 min-w-0 transition-colors focus-within:border-purple-500/50 focus-within:bg-zinc-800/80">
        <span className="text-zinc-500 shrink-0">{icon}</span>
        {inputType === "checkbox" ? (
          <input
            type="checkbox"
            onChange={(v) => {
              onChange(v);
              updateNode(parentGetConfig());
            }}
            name={keyLabel}
            checked={value as boolean}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-purple-500 accent-purple-500 cursor-pointer"
          />
        ) : (
          <input
            type={inputType}
            onChange={(v) => {
              onChange(v);
              updateNode(parentGetConfig());
            }}
            name={keyLabel}
            value={value as string}
            size={Math.min(30 + 2 || 1, 80)}
            className="max-w-full bg-transparent text-zinc-200 text-sm outline-none placeholder:text-zinc-600"
          />
        )}
      </div>
    </div>
  );
}

/** Multi-value config row (e.g. paths, ratios) with add/remove */
function MultiConfigRow({
  title,
  titleKey,
  inputType,
  icon,
  onChange,
  values,
  updateNode,
  parentGetConfig,
}: {
  title: string;
  titleKey: string;
  inputType: string;
  icon: React.ReactElement;
  onChange: (v: any) => void;
  values: any[];
  updateNode: (nodeJson: any) => void;
  parentGetConfig: () => any;
}) {
  return (
    <div className="flex flex-col w-full overflow-hidden min-w-0">
      <div className="flex w-full items-center mb-1">
        <h4 className="text-nowrap min-w-0 flex-1 truncate text-[13px] font-normal text-zinc-300">
          {title}
        </h4>
        <code className="ml-2 shrink-0 text-[10px] font-mono text-zinc-600">
          {titleKey}
        </code>
      </div>

      <div className="flex flex-col gap-y-1.5">
        {values?.map((_val, i) => {
          return (
            <div
              key={`${titleKey}-${i}`}
              className="flex w-full items-center gap-x-2 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700/60 px-2 py-1.5 min-w-0 transition-colors focus-within:border-purple-500/50"
            >
              <span className="text-zinc-500 shrink-0">{icon}</span>
              <input
                type={inputType}
                onChange={(v) => {
                  values[i] = v.target.value as unknown as string;
                  onChange(values);
                  updateNode(parentGetConfig());
                }}
                name={`${titleKey}-${i}`}
                value={values[i] as string}
                size={Math.min(30 + 2 || 1, 80)}
                className="max-w-full bg-transparent text-zinc-200 text-sm outline-none placeholder:text-zinc-600"
              />
              <span className="ml-auto text-[10px] font-mono text-zinc-600 shrink-0">
                [{i}]
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row w-full gap-x-2 items-center justify-center mt-1.5">
        <button
          onClick={() => {
            values.pop();
            updateNode(parentGetConfig());
          }}
          className="flex items-center gap-x-1 px-2 py-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors text-xs"
          title="Remove last"
        >
          <CaretUpIcon width={12} />
          <span>Remove</span>
        </button>
        <button
          onClick={() => {
            values.push("");
            updateNode(parentGetConfig());
          }}
          className="flex items-center gap-x-1 px-2 py-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors text-xs"
          title="Add new"
        >
          <CaretDownIcon width={12} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}

// BASE MONITOR
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

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => any
  ) {
    return (
      <ConfigSection title="Monitoring">
        <ConfigRow
          title="Enabled"
          keyLabel="enabled"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.enabled = v.target.checked)}
          value={this.enabled}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="CPU"
          keyLabel="cpu"
          inputType="checkbox"
          icon={<LetterCircleHIcon weight="bold" />}
          onChange={(v) => {
            this.metrics.cpu = v.target.checked;
          }}
          value={this.metrics.cpu}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Disk"
          keyLabel="disk"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.disk = v.target.checked)}
          value={this.metrics.disk}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Network"
          keyLabel="network"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.network = v.target.checked)}
          value={this.metrics.network}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="FastAPI"
          keyLabel="fastapi"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.fastapi = v.target.checked)}
          value={this.metrics.fastapi}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="System CPU"
          keyLabel="sys_cpu"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.sys_cpu = v.target.checked)}
          value={this.metrics.sys_cpu}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="System Memory"
          keyLabel="sys_memory"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.sys_memory = v.target.checked)}
          value={this.metrics.sys_memory}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="System Network"
          keyLabel="sys_network"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.metrics.sys_network = v.target.checked)}
          value={this.metrics.sys_network}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
      </ConfigSection>
    );
  }
}

// BASE CONFIG
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
    if (IS_LOCAL) {
      // Use cAdvisor
    }
  };

  checkStatus = async () => {
    // @ts-ignore
    const response = await fetch(`${IP_MAP[this.name]}status`);
    if (!response || response.status != 200) {
      this.state = "stopped";
      return;
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
    const response = await fetch(`${IP_MAP[this.name]}config`);
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
      <div className="flex flex-col w-full gap-y-2">
        <div className="flex w-full flex-row gap-x-2">
          <button
            className="flex flex-1 items-center justify-center rounded-md bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-amber-300 text-xs font-medium hover:bg-amber-500/25 active:bg-amber-500/35 transition-colors cursor-pointer"
            onClick={async () => {
              await this.applyConfigActiveNode();
            }}
          >
            Save Config
          </button>
          <button
            className="flex flex-1 items-center justify-center rounded-md bg-sky-500/15 border border-sky-500/30 px-3 py-2 text-sky-300 text-xs font-medium hover:bg-sky-500/25 active:bg-sky-500/35 transition-colors cursor-pointer"
            onClick={async () => {
              await this.restartConfigActiveNode();
            }}
          >
            Restart
          </button>
        </div>

        {this.type === "attacker" && (
          <div className="flex w-full flex-row gap-x-2">
            <button
              className="flex flex-1 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 active:bg-emerald-500/35 transition-colors cursor-pointer"
              onClick={async () => {
                await this.startActiveNode();
              }}
            >
              START
            </button>
            <button
              className="flex flex-1 items-center justify-center rounded-md bg-red-500/15 border border-red-500/30 px-3 py-2 text-red-300 text-xs font-medium hover:bg-red-500/25 active:bg-red-500/35 transition-colors cursor-pointer"
              onClick={async () => {
                await this.stopActiveNode();
              }}
            >
              STOP
            </button>
          </div>
        )}
      </div>
    );
  }

  // Layout functions
  getDashboardNode({ onClick }: { onClick: () => void }) {
    const stateColor =
      this.state === "running"
        ? "bg-emerald-500"
        : this.state === "idle"
          ? "bg-amber-400"
          : "bg-zinc-500";

    const stateLabel =
      this.state === "running"
        ? "Running"
        : this.state === "idle"
          ? "Idle"
          : "Stopped";

    return (
      <div className="flex flex-col gap-y-1.5 min-w-[150px]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-purple-400">{this.name}</p>
          <div className="flex items-center gap-x-1.5">
            <div className={`rounded-full ${stateColor} h-2 w-2`} />
            <span className="text-[10px] text-zinc-500">{stateLabel}</span>
          </div>
        </div>

        <button
          onClick={() => {
            onClick();
          }}
          className="
            relative flex flex-col
            w-full min-h-[120px]
            rounded-lg
            bg-zinc-800 border border-zinc-700/60
            p-3 text-left
            hover:border-zinc-600 hover:bg-zinc-750
            active:bg-zinc-700
            transition-colors cursor-pointer
          "
        >
          <div className="flex flex-col gap-y-1">
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-600 w-16 inline-block">IP</span>
              <span className="text-zinc-300 font-mono">{this.host}</span>
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-600 w-16 inline-block">Port</span>
              <span className="text-zinc-300 font-mono">{this.port}</span>
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-600 w-16 inline-block">Role</span>
              <span className="text-zinc-300">{this.type}</span>
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-600 w-16 inline-block">Fwd</span>
              <span className="text-zinc-300 font-mono">
                {this.forward_host}:{this.forward_port}
              </span>
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-600 w-16 inline-block">Enabled</span>
              <span
                className={
                  this.enabled ? "text-emerald-400" : "text-zinc-500"
                }
              >
                {this.enabled ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </button>
      </div>
    );
  }

  configLayout(updateNode: (nodeStr: any) => void) {
    return (
      <div className="flex flex-col w-full items-start justify-start gap-y-1 min-w-0 mt-2">
        {this.getApplyRestart()}

        <ConfigSection title="Base">
          <ConfigRow
            title="UUID"
            keyLabel="id"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.id = v.target.value;
            }}
            value={this.id}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Node Name"
            keyLabel="name"
            inputType="text"
            icon={<LetterCircleHIcon weight="bold" />}
            onChange={(v) => {
              this.name = v.target.value;
            }}
            value={this.name}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Node Type"
            keyLabel="type"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
                // @ts-ignore
              this.type = v.target.value;
            }}
            value={this.type}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Enabled"
            keyLabel="enabled"
            inputType="checkbox"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.enabled = v.target.checked;
            }}
            value={this.enabled}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Host"
            keyLabel="host"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.host = v.target.value;
            }}
            value={this.host}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Port"
            keyLabel="port"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.port = v.target.value;
            }}
            value={this.port}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Forward Host"
            keyLabel="forward_host"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.forward_host = v.target.value;
            }}
            value={this.forward_host}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
          <ConfigRow
            title="Forward Port"
            keyLabel="forward_port"
            inputType="text"
            icon={<TextItalicIcon weight="bold" />}
            onChange={(v) => {
              this.forward_port = v.target.value;
            }}
            value={this.forward_port}
            updateNode={(nodeStr: any) => updateNode(nodeStr)}
            parentGetConfig={() => this.getConfig()}
          />
        </ConfigSection>

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

// MONITOR NODE CONFIG
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
  }
}

// ATTACKER CONFIG
export class AttackerConfig {
  public attack_type: string;
  public forward_host: string;
  public forward_port: string;
  public duration_seconds: number;
  public rate_rps: number;
  public threads: number;
  public connections: number;
  public method: string;
  public paths: string[];
  public path_ratios: number[];
  public keep_alive: boolean;
  public header_interval_ms: number;
  public payload_bytes: number;
  public connect_timeout_ms: number;
  public packet_interval_ms: number;
  public protocol: string

  public constructor(
    attack_type: string,
    forward_host: string,
    forward_port: string,
    duration_seconds: number,
    rate_rps: number,
    threads: number,
    connections: number,
    method: string,
    paths: string[],
    path_ratios: number[],
    keep_alive: boolean,
    header_interval_ms: number,
    payload_bytes: number,
    connection_timeout_ms: number,
    packet_interval_ms: number,
    protocol: string
  ) {
    this.attack_type = attack_type;
    this.forward_host = forward_host;
    this.forward_port = forward_port;
    this.rate_rps = rate_rps;
    this.threads = threads;
    this.connections = connections;
    this.method = method;
    this.paths = paths;
    this.path_ratios = path_ratios;
    this.keep_alive = keep_alive;
    this.duration_seconds = duration_seconds;
    this.header_interval_ms = header_interval_ms;
    this.payload_bytes = payload_bytes;
    this.connect_timeout_ms = connection_timeout_ms;
    this.packet_interval_ms = packet_interval_ms;
    this.protocol = protocol;
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
      packet_interval_ms: this.packet_interval_ms,
      protocol: this.protocol,
    };
  }

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => any
  ) {
    return (
      <ConfigSection title="Attacker Config">
        <ConfigRow
          title="Attack Type"
          keyLabel="attack_type"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.attack_type = v.target.value)}
          value={this.attack_type}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Threads"
          keyLabel="threads"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.threads = Number(v.target.value))}
          value={String(this.threads)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Duration Sec"
          keyLabel="duration_seconds"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.duration_seconds = Number(v.target.value))}
          value={String(this.duration_seconds)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Request Rate"
          keyLabel="rate_rps"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.rate_rps = Number(v.target.value))}
          value={String(this.rate_rps)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Connections"
          keyLabel="connections"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.connections = Number(v.target.value))}
          value={String(this.connections)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Method"
          keyLabel="method"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.method = v.target.value)}
          value={this.method}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <MultiConfigRow
          title="Paths"
          titleKey="paths"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v: any) => (this.paths = v)}
          values={this.paths}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <MultiConfigRow
          title="Path Ratios"
          titleKey="path_ratios"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.path_ratios = v)}
          values={this.path_ratios}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Keep Alive"
          keyLabel="keep_alive"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.keep_alive = v.target.checked)}
          value={this.keep_alive}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Header Interval"
          keyLabel="header_interval_ms"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.header_interval_ms = Number(v.target.value))}
          value={String(this.header_interval_ms)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Payload Bytes"
          keyLabel="payload_bytes"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.payload_bytes = Number(v.target.value))}
          value={String(this.payload_bytes)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Connection Timeout"
          keyLabel="connect_timeout_ms"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.connect_timeout_ms = Number(v.target.value))}
          value={String(this.connect_timeout_ms)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Hping Packet Interval"
          keyLabel="packet_interval_ms"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.packet_interval_ms = Number(v.target.value))}
          value={String(this.packet_interval_ms)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Hping Protocol"
          keyLabel="protocol"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.protocol = v.target.value)}
          value={String(this.protocol)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
      </ConfigSection>
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PROXY CONFIG
// ═══════════════════════════════════════════════════════════════

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

  configLayout(
    updateNode: (nodeStr: string) => void,
    parentGetConfig: () => any
  ) {
    return (
      <ConfigSection title="Proxy Config">
        <ConfigRow
          title="Enabled"
          keyLabel="enabled"
          inputType="checkbox"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.enabled = v.target.checked)}
          value={this.enabled}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Rate RPS"
          keyLabel="rate_limit_rate"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.rate_limit_rate = Number(v.target.value))}
          value={String(this.rate_limit_rate)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Max Connections"
          keyLabel="max_connections"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.max_connections = Number(v.target.value))}
          value={String(this.max_connections)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Burst"
          keyLabel="burst"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.burst = Number(v.target.value))}
          value={String(this.burst)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Connection Timeout"
          keyLabel="connection_timeout"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.connection_timeout = Number(v.target.value))}
          value={String(this.connection_timeout)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Read Timeout"
          keyLabel="read_timeout"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.read_timeout = Number(v.target.value))}
          value={String(this.read_timeout)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
        <ConfigRow
          title="Send Timeout"
          keyLabel="send_timeout"
          inputType="text"
          icon={<TextItalicIcon weight="bold" />}
          onChange={(v) => (this.send_timeout = Number(v.target.value))}
          value={String(this.send_timeout)}
          updateNode={updateNode}
          parentGetConfig={parentGetConfig}
        />
      </ConfigSection>
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// TARGET CONFIG
// ═══════════════════════════════════════════════════════════════

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
  }
}