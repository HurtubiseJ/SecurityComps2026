import { useRef, type RefObject } from "react"
import { BaseConfig } from '../types/BaseConfig';

const InitDefaultNodes = (): BaseConfig[] => {
    const list = []
    list.push(new BaseConfig("Attacker 1", "attacker"))
    list.push(new BaseConfig("Proxy 1", "proxy"))
    list.push(new BaseConfig("Target 1", "target"))
    return list
}

export default function useNodeManager() {
    // Initalize nodes and configs
    // Store currently selected node
    // Change Selected node
    // Expose current node

    const nodes: RefObject<BaseConfig[]> = useRef(InitDefaultNodes())

    const activeNode: RefObject<BaseConfig> = useRef(nodes.current[0])

    const changeActiveNode = (id: string) => {
        nodes.current.map(node => {
            if (node.id === id) {
                activeNode.current = node
            } 
        })
    }

    return {
        nodes, activeNode, changeActiveNode
    }
}