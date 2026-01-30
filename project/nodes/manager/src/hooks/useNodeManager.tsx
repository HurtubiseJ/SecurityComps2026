import { useEffect, useState } from "react"
import { BaseConfig } from "../types/BaseConfig"
import { LOCAL_NODE_IP_MAP } from "../constants/NodeIp"
import { type NodeType } from "../types/configs"

const InitDefaultNodes = async (): Promise<BaseConfig[]> => {
    const list: BaseConfig[] = []

    const attackerConfig = await initAttacker2Config(LOCAL_NODE_IP_MAP['attacker2'], "attacker")
    if (attackerConfig) {
        list.push(attackerConfig)
    }
    const targetConfig = await initAttacker2Config(LOCAL_NODE_IP_MAP['target1'], "target")
    if (targetConfig) {
        list.push(targetConfig)
    }

    list.push(new BaseConfig("Proxy 1", "proxy"))

    return list
}

const initAttacker2Config = async (url: string, type: NodeType): Promise<BaseConfig | null> => {
    const configUrl = `${url}config`

    try {
        const resp = await fetch(configUrl)
        if (!resp.ok) {
            throw new Error("Could not get config from attacker2")
        }

        const res = await resp.json()
        console.log(type, " config json: ", res)
        return new BaseConfig(res.name, type, res.enabled, res.forward_host, res.forward_port, res.host, res.port)
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
        setActiveNode(prev => {
            const node = nodes.find(n => n.id === id)
            return node ?? prev
        })
    }

    return {
        nodes,
        activeNode,
        loading,
        changeActiveNode,
    }
}
