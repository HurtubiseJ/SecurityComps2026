import { v4 as uuidv4 } from "uuid"
import type { NodeType } from "./configs";
import { LetterCircleHIcon, TextItalicIcon } from "@phosphor-icons/react";

class BaseMonitor {
    public enabled: boolean;
    public metrics: string[];

    public constructor(
        enabled: boolean = false,
        metrics: string[] = []
    ) {
        this.enabled = enabled;
        this.metrics = metrics;
    }

    getConfig() {
        return {
            enabled: this.enabled,
            metrics: this.metrics
        }
    }

    configLayout() {
        return (
            <div></div>
        )
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

    public monitor: BaseMonitor; 

    public constructor(
        name: string,
        type: NodeType,
        enabled: boolean = false,
        forward_host: string = "10.0.0.0",
        forward_port: string = "8000",
        host: string = "10.0.0.1",
        port: string = "8000"
    ) {
        this.id = uuidv4();
        this.name = name;
        this.type = type;
        this.enabled = enabled;
        this.forward_host = forward_host;
        this.forward_port = forward_port;
        this.port = port;
        this.host = host;

        this.monitor = new BaseMonitor();
    }

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

            metrics: this.monitor.getConfig(), 
        }
    }

    // Layout functions
    configRow(
        title: string,
        key: string,
        inputType: string,
        icon: React.ReactElement,
        onChange: () => void,
        value: string,
    ){
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
                        onChange={onChange}
                        value={value}
                        size={Math.min(this.id.length + 2 || 1, 80)}
                        className="max-w-full bg-slate-600 text-gray-300"
                    />
                </div>
            </div>
        )
    }

    configLayout() {
        return (
            <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 mt-2">
                <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 pb-4 border-b border-zinc-700">
                    <h3 className="text-lg text-white">Base</h3>

                    {this.configRow("UUID", "id", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Node name", "name", "text", <LetterCircleHIcon weight="bold" />, () => {}, this.name)}
                    {this.configRow("Node Type", "type", "checkbox", <TextItalicIcon weight="bold" />, () => {}, this.type)}
                    {this.configRow("Enabled", "enabled", "checkbox", <TextItalicIcon weight="bold" />,() => {}, this.enabled ? "Enabled" : "Disabled")}
                    {this.configRow("Host", "host", "text", <TextItalicIcon weight="bold" />,() => {}, this.host)}
                    {this.configRow("Port", "port", "text", <TextItalicIcon weight="bold" />,() => {}, this.port)}
                    {this.configRow("Forward Host", "forward_host", "text", <TextItalicIcon weight="bold" />,() => {}, this.forward_host)}
                    {this.configRow("Forward Port", "forward_port", "text", <TextItalicIcon weight="bold" />,() => {}, this.forward_port)}

                </div>

                <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 mt-2 pb-2 border-b border-zinc-700">
                    <h3 className="text-lg text-white">Monitoring</h3>

                    {this.configRow("UUID", "id", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Node name", "name", "text", <LetterCircleHIcon weight="bold" />, () => {}, this.id)}
                    {this.configRow("Node Type", "type", "checkbox", <TextItalicIcon weight="bold" />, () => {}, this.id)}
                    {this.configRow("Enabled", "enabled", "checkbox", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Host", "host", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Port", "port", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Forward Host", "forward_host", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Forward Port", "forward_port", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}

                </div>

                <div className="flex flex-col w-full items-start justify-start gap-y-2 min-w-0 mt-2 pb-2 border-b border-zinc-700">
                    <h3 className="text-lg text-white">Monitoring</h3>

                    {this.configRow("UUID", "id", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Node name", "name", "text", <LetterCircleHIcon weight="bold" />, () => {}, this.id)}
                    {this.configRow("Node Type", "type", "checkbox", <TextItalicIcon weight="bold" />, () => {}, this.id)}
                    {this.configRow("Enabled", "enabled", "checkbox", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Host", "host", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Port", "port", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Forward Host", "forward_host", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                    {this.configRow("Forward Port", "forward_port", "text", <TextItalicIcon weight="bold" />,() => {}, this.id)}
                </div>
            </div>
        )
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