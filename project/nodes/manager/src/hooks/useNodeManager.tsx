import { useEffect, useState } from "react"
import { AttackerConfig, BaseConfig, BaseMonitor } from "../types/BaseConfig"
import { LOCAL_NODE_IP_MAP } from "../constants/NodeIp"
import { type NodeType } from "../types/configs"
import { type metrics } from "../types/BaseConfig"
import { type Logger } from "../types/Logger"

const InitDefaultNodes = async (logger: Logger): Promise<BaseConfig[]> => {
    const list: BaseConfig[] = []

    const attacker2Config = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker2'], "attacker", logger)
    if (attacker2Config) {
        list.push(attacker2Config)
    }
    const attacker3Config = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker3'], "attacker", logger)
    if (attacker3Config) {
        list.push(attacker3Config)
    }
    const targetConfig = await initAttacker2Config(LOCAL_NODE_IP_MAP['target1'], "target", logger)
    if (targetConfig) {
        list.push(targetConfig)
    }

    const attacker1Config = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker1'], 'attacker', logger)
    console.log("ATTACKER1, ", attacker1Config)
    if (attacker1Config) {
        list.push(attacker1Config)
    }

    const attacker1JohnConfig = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker1-john'], 'attacker', logger)
    console.log("ATTACKER1, ", attacker1JohnConfig)
    if (attacker1JohnConfig) {
        list.push(attacker1JohnConfig)
    }

    const proxy = await initAttacker2Config(LOCAL_NODE_IP_MAP['proxy'], 'proxy', logger)
    if (proxy) {
        list.push(proxy)
    }

    return list
}

const initAttacker2Config = async (url: string, type: NodeType, logger: Logger): Promise<BaseConfig | null> => {
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
            fastapi: mon_metrics?.fastapi
        }
        const monitorConfig = res.monitor ? new BaseMonitor(res.monitor.enabled, metrics) : null

        if (res.type === "attacker") {
            const attackerConfig = res.custom_config ?? {}
            const socket_count = attackerConfig.socket_count ?? attackerConfig.connections ?? 200
            const header_interval_ms = attackerConfig.header_interval_ms ?? 10000
            const payload_bytes = attackerConfig.payload_bytes ?? 0
            const connect_timeout_ms = attackerConfig.connect_timeout_ms ?? 3000
            const attacker = new AttackerConfig(
                attackerConfig.attack_type ?? "unknown",
                attackerConfig.forward_host ?? res.forward_host ?? "",
                attackerConfig.forward_port ?? res.forward_port ?? "",
                attackerConfig.rate_rps ?? 0, 
                attackerConfig.threads ?? 1,
                attackerConfig.connections ?? 100,
                socket_count,
                attackerConfig.method ?? "GET",
                attackerConfig.paths ?? [],
                attackerConfig.path_ratios ?? [],
                attackerConfig.headers ?? {},
                attackerConfig.keep_alive ?? true,
                header_interval_ms,
                payload_bytes,
                connect_timeout_ms
            )

            console.log("Attack conf:", attacker)
            return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig, attacker, logger)
        }

        const attacker = null
        return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig, attacker, logger)
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

    const changeActiveNode = (id: string) => {
        setActiveNode(nodes.find(n => n.id === id) ?? null)
    }

    const updateNode = (node: any) => {
        // console.log("UPDATE: ", node)
        const metrics: metrics = {
            cpu: node.monitor?.metrics?.cpu,
            memory: node?.monitor?.metrics?.memory,
            disk: node?.monitor?.metrics?.disk,
            network: node?.monitor?.metrics?.network,
            fastapi: node?.monitor?.metrics?.fastapi
        }
        const monitorConfig = new BaseMonitor(node.monitor.enabled, metrics)

        console.log("NODE: ", node)

        let attacker_config = null
        if (node.type == "attacker") {
            const attack = node?.custom_config
            const socket_count = attack.socket_count ?? attack.connections ?? 200
            const header_interval_ms = attack.header_interval_ms ?? 10000
            const payload_bytes = attack.payload_bytes ?? 0
            const connect_timeout_ms = attack.connect_timeout_ms ?? 3000
            attacker_config = new AttackerConfig(
                attack.attack_type,
                attack.forward_host,
                attack.forward_port,
                attack.rate_rps,
                attack.threads,
                attack.connections,
                socket_count,
                attack.method,
                attack.paths,
                attack.path_ratios ?? attack.ratios ?? [],
                attack.headers,
                attack.keep_alive,
                header_interval_ms,
                payload_bytes,
                connect_timeout_ms
            )
        }
        // console.log("MONITOR: ", monitorConfig)
        const config = new BaseConfig(node.name, node.type, node.enabled, node.forward_host, node.forward_port, node.host, node.port, monitorConfig, attacker_config)


        // console.log("INPUT NODE: ", config)

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
