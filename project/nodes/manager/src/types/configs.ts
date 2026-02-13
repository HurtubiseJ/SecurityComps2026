// Configs
export type ManagerConfig = {};

export type ProxyConfig = {};

export type AttackerConfig = {};

export type targetConfig = {};

export type MonitoringConfig = {
  enabled: boolean;
  metrics: string[];
};

export type NodeType = "proxy" | "monitor" | "target" | "manager" | "attacker";

export type MasterConfig = {
  id: string;
  name: string;
  type: NodeType;
  enabled: boolean;
  forward_host: string;
  forward_port: string;
  port: string;
  host: string;

  monitoring: MonitoringConfig;

  custom_config: any;
};

// Config UI Classes
export type ConfigGroup = {
  groups: FieldGroup[];
};

export type FieldGroup = {
  fields: BaseField[];
  groupTitle: string;
};

export interface BaseField {
  title: string;
  key: string;
  icon: React.ReactElement;
}

export interface BooleanField extends BaseField {
  value: boolean;
}

export interface RatioField extends BaseField {
  value: string;
  pct: number;
}

export interface TextField extends BaseField {
  value: string;
}
