import React, { useEffect, useState } from "react"
import { BaseConfig } from "../types/BaseConfig"
import { NODE_IP_MAP } from "../constants/NodeIp"

const InitDefaultNodes = async (): Promise<BaseConfig[]> => {
    const list: BaseConfig[] = [
        new BaseConfig("Attacker 1", "attacker"),
        new BaseConfig("Proxy 1", "proxy"),
        new BaseConfig("Target 1", "target"),
    ]

    const attackerConfig = await initAttacker2Config()
    if (attackerConfig) {
        list.push(attackerConfig)
    }

    return list
}

const initAttacker2Config = async (): Promise<BaseConfig | null> => {
    const url = NODE_IP_MAP["attacker2"]
    const configUrl = `${url}config`

    try {
        const resp = await fetch(configUrl)
        if (!resp.ok) {
            throw new Error("Could not get config from attacker2")
        }

        const res = await resp.json()
        console.log("Attacker2 config json: ", res)
        return new BaseConfig(res.name, "attacker")
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
