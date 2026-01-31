import { useRef, useState } from "react"
import type { BaseConfig } from "../../../types/BaseConfig"

export default function DashboardNodes({ nodeManager }: { nodeManager: any }) {
    const containerRef = useRef<HTMLDivElement>(null)

    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [dragging, setDragging] = useState(false)
    const last = useRef({ x: 0, y: 0 })

    function onMouseDown(e: React.MouseEvent) {
        setDragging(true)
        last.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseMove(e: React.MouseEvent) {
        if (!dragging) return
        const dx = e.clientX - last.current.x
        const dy = e.clientY - last.current.y
        last.current = { x: e.clientX, y: e.clientY }
        setPan(p => ({ x: p.x + dx, y: p.y + dy }))
    }

    function onMouseUp() {
        setDragging(false)
    }

    function onWheel(e: React.WheelEvent) {
        e.preventDefault()
        const delta = -e.deltaY * 0.001
        setZoom(z => Math.min(2, Math.max(0.3, z + delta)))
    }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="flex flex-row items-start gap-x-24 p-8">
          {/* ATTACKER */}
          <div className="flex flex-col gap-y-12">
            {nodeManager.nodes.map((node: BaseConfig) =>
              node.type === "attacker" ? (
                <div key={node.id} className="flex flex-col">
                  {node.getDashboardNode({onClick: () => nodeManager.changeActiveNode(node.id)})}
                </div>
              ) : null
            )}
          </div>

          {/* PROXY */}
          <div className="flex flex-col gap-y-12">
            {nodeManager.nodes.map((node: BaseConfig) =>
              node.type === "proxy" ? (
                <div key={node.id} className="flex flex-col">
                  {node.getDashboardNode({onClick: () => nodeManager.changeActiveNode(node.id)})}
                  </div>
              ) : null
            )}
          </div>

          {/* TARGET */}
          <div className="flex flex-col gap-y-12">
            {nodeManager.nodes.map((node: BaseConfig) =>
              node.type === "target" ? (
                <div key={node.id} className="flex flex-col">
                  {node.getDashboardNode({onClick: () => nodeManager.changeActiveNode(node.id)})}
                  </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
