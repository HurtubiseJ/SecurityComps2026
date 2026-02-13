import { v4 as uuidv4 } from "uuid";
import type { NodeType } from "./configs";
import { LetterCircleHIcon, TextItalicIcon } from "@phosphor-icons/react";
import { LOCAL_NODE_IP_MAP } from "../constants/NodeIp";
import type { Logger, Message } from "./Logger";

export type metrics = {
  cpu: boolean;
  memory: boolean;
  disk: boolean;
  network: boolean;
  fastapi: boolean;
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
          (v) => (this.enabled = v.target),
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
      </div>
    );
  }
}

export class BaseConfig {
  public id: string;
  public name: string;
  public type: NodeType;
  public enabled: boolean;
  public forward_host: string;
  public forward_port: string;
  public port: string;
  public host: string;

  public monitor: BaseMonitor | null;

  public logger: Logger | null;

  public constructor(
    name: string,
    type: NodeType,
    enabled: boolean = false,
    forward_host: string = "10.0.0.0",
    forward_port: string = "8000",
    host: string = "10.0.0.1",
    port: string = "8000",
    monitor: BaseMonitor | null = null,
    logger: Logger | null = null
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

    this.logger = logger;
  }

  applyConfigActiveNode = async () => {
    console.log(JSON.stringify(this.getConfig()));
    // @ts-ignore
    const response = await fetch(`${LOCAL_NODE_IP_MAP[this.name]}config`, {
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

    if (this.logger != null) {
      this.logger.appendLog({
        id: "start",
        owner: this.name,
        color: "39c553",
        message: JSON.stringify(content),
      } as Message);
    }

    return true;
  };

  restartConfigActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${LOCAL_NODE_IP_MAP[this.name]}restart`);
  };
  getConfigActiveNodeConfig = async () => {
    // @ts-ignore
    const response = await fetch(`${LOCAL_NODE_IP_MAP[this.name]}config`);
    const res = await response.json();
    return res;
  };

  startActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${LOCAL_NODE_IP_MAP[this.name]}start`, {
      method: "POST",
    });
    const res = await response.json();
    return res;
  };

  stopActiveNode = async () => {
    // @ts-ignore
    const response = await fetch(`${LOCAL_NODE_IP_MAP[this.name]}stop`, {
      method: "POST",
    });

    const res = await response.json();
    console.log("STOP: ", res);
    return res;
  };

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
    };
  }

  getApplyRestart() {
    return (
      <div className="flex flex-1 flex-col items-start justify-center gap-y-2">
        <div className="flex flex-1 w-full flex-row gap-x-4 items-start justify-between">
          <a
            className="flex w-full bg-yellow-200 hover:bg-yellow-100 cursor-pointer rounded-md px-4 py-2"
            onClick={async () => {
              await this.applyConfigActiveNode();
            }}
          >
            <p className="text-black text-sm">Save Config</p>
          </a>
          <a
            className="flex w-full bg-blue-200 hover:bg-blue-100 cursor-pointer rounded-md px-4 py-2"
            onClick={async () => {
              await this.restartConfigActiveNode();
            }}
          >
            <p className="text-black text-sm">Apply Config</p>
          </a>
        </div>
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
            console.log("CLICK");
            onClick();
          }}
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
              this.name = v.target.name;
            },
            this.name,
            (nodeStr: any) => updateNode(nodeStr)
          )}
          {this.configRow(
            "Node Type",
            "type",
            "checkbox",
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

export class AttackerConfig extends BaseConfig {
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

export class ProxyConfig extends BaseConfig {
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
