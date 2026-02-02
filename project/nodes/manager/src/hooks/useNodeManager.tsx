import { useEffect, useState } from "react"
import { BaseConfig, BaseMonitor } from "../types/BaseConfig"
import { LOCAL_NODE_IP_MAP } from "../constants/NodeIp"
import { type NodeType } from "../types/configs"
import { type metrics } from "../types/BaseConfig"

const InitDefaultNodes = async (): Promise<BaseConfig[]> => {
    const list: BaseConfig[] = []

    const attacker2Config = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker2'], "attacker")
    if (attacker2Config) {
        list.push(attacker2Config)
    }
    const targetConfig = await initAttacker2Config(LOCAL_NODE_IP_MAP['target1'], "target")
    if (targetConfig) {
        list.push(targetConfig)
    }

    const attacker1Config = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker1'], 'attacker')
    console.log("ATTACKER1, ", attacker1Config)
    if (attacker1Config) {
        list.push(attacker1Config)
    }

    list.push(new BaseConfig("Proxy 1", "proxy"))

    return list
}

const initAttacker2Config = async (url: string, type: NodeType): Promise<BaseConfig | null> => {
    const configUrl = `${url}config`

    try {
        const resp = await fetch(configUrl)
        if (!resp.ok) {
            throw new Error(`Could not get config for ${configUrl}`)
        }

        const res = await resp.json()
        console.log(type, " config json: ", res)

        const metrics: metrics = {
            cpu: res.monitor?.metrics?.cpu,
            memory: res.monitor?.metrics?.memory,
            disk: res.monitor?.metrics?.disk,
            network: res.monitor?.metrics?.network,
            fastapi: res.monitor?.metrics?.fastapi
        }
        const monitorConfig = res.monitor ? new BaseMonitor(res.monitor.enabled, metrics) : null
        return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port, monitorConfig)
    } catch {
        return null
    }
}

export default function useNodeManager() {
    const [nodes, setNodes] = useState<BaseConfig[]>([])
    const [activeNode, setActiveNode] = useState<BaseConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const init = async () => {
            const initialNodes = await InitDefaultNodes()
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
        console.log("UPDATE: ", node)
        const metrics: metrics = {
            cpu: node.monitor?.metrics?.cpu,
            memory: node?.monitor?.metrics?.memory,
            disk: node?.monitor?.metrics?.disk,
            network: node?.monitor?.metrics?.network,
            fastapi: node?.monitor?.metrics?.fastapi
        }
        const monitorConfig = new BaseMonitor(node.monitor.enabled, metrics)
        console.log("MONITOR: ", monitorConfig)
        const config = new BaseConfig(node.name, node.type, node.enabled, node.forward_host, node.forward_port, node.host, node.port, monitorConfig)
        console.log("INPUT NODE: ", config)

        setNodes(nodes.map((currNode: BaseConfig) => {
            if (currNode.id === config.id) {
                return config
            } else {
                return currNode
            }
        }))
    }

    return {
        nodes,
        activeNode,
        loading,
        changeActiveNode,
        updateNode
    }
}
