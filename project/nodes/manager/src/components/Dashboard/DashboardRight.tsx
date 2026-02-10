import type { BaseConfig } from "../../types/BaseConfig"


type DashboardLeftProps = {
    baseConfig: BaseConfig | null
    updateNode: (nodeStr: any) => void
}

export default function DashboardRight({
    baseConfig, 
    updateNode
} : DashboardLeftProps) {

    if (!baseConfig) {
        return (
            <div>
                No active node
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col pt-4 pl-4 pb-4 overflow-y-auto">
            <div className="flex flex-col gap-y-4 border-b border-zinc-700 pb-2">
                <p className="font-bold">Configuration</p>

                <p>Node: {(baseConfig.name as string).toUpperCase()}</p>
            </div>


            {baseConfig.configLayout(updateNode)}


            
        </div>
    )
}