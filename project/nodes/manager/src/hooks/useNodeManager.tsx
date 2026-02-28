import { useEffect, useState } from "react"
import { AttackerConfig, BaseConfig, BaseMonitor, ProxyConfig } from "../types/BaseConfig"
import { LOCAL_NODE_IP_MAP, NODE_IP_MAP } from "../constants/NodeIp"
import { type NodeType } from "../types/configs"
import { type metrics } from "../types/BaseConfig"
import { type Logger } from "../types/Logger"

const IS_LOCAL = import.meta.env.VITE_LOCAL === "true";

const InitDefaultNodes = async (logger: Logger): Promise<BaseConfig[]> => {
    const list: BaseConfig[] = []

    const IP_MAP = IS_LOCAL ? LOCAL_NODE_IP_MAP : NODE_IP_MAP;

    // ATTACKERS
    const attacker1Config = await initNodeConfig(IP_MAP['attacker1'], 'attacker', logger)
    if (attacker1Config) {
        list.push(attacker1Config)
    }
    const attacker2Config = await initNodeConfig(IP_MAP['attacker2'], "attacker", logger)
    if (attacker2Config) {
        list.push(attacker2Config)
    }
    const attacker3Config = await initNodeConfig(IP_MAP['attacker3'], "attacker", logger)
    if (attacker3Config) {
        list.push(attacker3Config)
    }

    // TARGETS
    const targetConfig = await initNodeConfig(IP_MAP['target1'], "target", logger)
    if (targetConfig) {
        list.push(targetConfig)
    }
    const targetAltConfig = await initNodeConfig(IP_MAP['target1-alt'], "target", logger)
    if (targetAltConfig) {
        list.push(targetAltConfig)
    }


    // const attacker1JohnConfig = await initNodeConfig(IP_MAP['attacker1-john'], 'attacker', logger)
    // console.log("ATTACKER1, ", attacker1JohnConfig)
    // if (attacker1JohnConfig) {
    //     list.push(attacker1JohnConfig)
    // }

    // PROXY
    const proxy = await initNodeConfig(IP_MAP['proxy'], 'proxy', logger)
    if (proxy) {
        list.push(proxy)
    }

    return list
}

const initNodeConfig = async (url: string, type: NodeType, logger: Logger): Promise<BaseConfig | null> => {
    const configUrl = `${url}config`

    try {
        const resp = await fetch(configUrl)
        if (!resp.ok) {
            throw new Error(`Could not get config for ${configUrl}`)
        }

        const res = await resp.json()
        console.log(type, " config json: ", res)

        const mon_metrics = res.monitor?.metrics

        const metrics: metrics = {
            cpu: mon_metrics?.cpu,
            memory: mon_metrics?.memory,
            disk: mon_metrics?.disk,
            network: mon_metrics?.network,
            fastapi: mon_metrics?.fastapi,
            sys_cpu: mon_metrics?.sys_cpu,
            sys_memory: mon_metrics?.sys_memory,
            sys_network: mon_metrics?.sys_network,
        }
        const monitorConfig = res.monitor ? new BaseMonitor(res.monitor.enabled, metrics) : null

        if (res.type === "attacker") {
            const attackerConfig: AttackerConfig = res.custom_config
            console.log("ATTACK PRE CONf", attackerConfig)
            const attacker = new AttackerConfig(
                attackerConfig.attack_type,
                attackerConfig.forward_host,
                attackerConfig.forward_port,
                attackerConfig.duration_seconds,
                attackerConfig.rate_rps, 
                attackerConfig.threads,
                attackerConfig.connections,
                attackerConfig.method,
                attackerConfig.paths,
                attackerConfig.path_ratios,
                attackerConfig.keep_alive, 
                attackerConfig.header_interval_ms,
                attackerConfig.payload_bytes,
                attackerConfig.connect_timeout_ms,
                attackerConfig.packet_interval_ms,
                attackerConfig.protocol,
            )

            console.log("Attack conf:", attacker)
            return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig, attacker, logger)
        }

        if (res.type === "proxy") {
            const proxyConfig: ProxyConfig = res.custom_config

            const proxy = new ProxyConfig(
                proxyConfig.enabled,
                proxyConfig.rate_limit_rate,
                proxyConfig.max_connections,
                proxyConfig.burst,
                proxyConfig.connection_timeout,
                proxyConfig.read_timeout,
                proxyConfig.send_timeout
            )

            return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig, proxy, logger)

        }

        return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig, null, logger)
    } catch (e) {
        console.log("Error, ", e)
        return null
    }
}

export default function useNodeManager(logger: Logger) {
    const [nodes, setNodes] = useState<BaseConfig[]>([])
    const [activeNode, setActiveNode] = useState<BaseConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const init = async () => {
            const initialNodes = await InitDefaultNodes(logger)
            if (!mounted) return

            setNodes(initialNodes)
            setActiveNode(initialNodes[0] ?? null)
            setLoading(false)
        }

        init()

        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(updateNodeStatuses, 10000)
        return () => clearInterval(interval)
    }, [])

    const changeActiveNode = (id: string) => {
        setActiveNode(nodes.find(n => n.id === id) ?? null)
    }

    const updateNodeStatuses = async () => {
        const promises: Promise<void>[] = []
        nodes.map((currNode: BaseConfig) => {
            const prom = currNode.checkStatus();
            promises.push(prom);
        })

        await Promise.all(promises)
    }

    const updateNode = async (node: any) => {
        // console.log("UPDATE: ", node)
        const metrics: metrics = {
            cpu: node.monitor?.metrics?.cpu,
            memory: node?.monitor?.metrics?.memory,
            disk: node?.monitor?.metrics?.disk,
            network: node?.monitor?.metrics?.network,
            fastapi: node?.monitor?.metrics?.fastapi,
            sys_cpu: node?.monitor?.metrics?.sys_cpu,
            sys_memory: node?.monitor?.metrics?.sys_memory,
            sys_network: node?.monitor?.metrics?.sys_network
        }
        const monitorConfig = new BaseMonitor(node.monitor.enabled, metrics)

        let attacker_config = null
        if (node.type == "attacker") {
            const attack = node?.custom_config
            attacker_config = new AttackerConfig(attack.attack_type, attack.forward_host, attack.forward_port, attack.duration_seconds, attack.rate_rps, attack.threads,attack.connections, attack.method, attack.paths, attack.ratios, attack.keep_alive, attack.header_interval_ms, attack.payload_bytes, attack.connect_timeout_ms, attack.packet_interval_ms, attack.protocol)
        }
        // console.log("MONITOR: ", monitorConfig)
        const config = new BaseConfig(node.name, node.type, node.enabled, node.forward_host, node.forward_port, node.host, node.port, monitorConfig, attacker_config)

        setNodes(nodes.map((currNode: BaseConfig) => {
            if (currNode.id === config.id) {
                return config
            } else {
                return currNode
            }
        }))
    }

    console.log(nodes)

    return {
        nodes,
        activeNode,
        loading,
        changeActiveNode,
        updateNode
    }
}
