import DashboardNodes from "./configUI/DashboardNodes"

export default function DashboardCenter({
    nodeManager
} : {  
    nodeManager: any
}) {
    return (
        <div className="flex flex-1">
            <DashboardNodes nodeManager={nodeManager} />
        </div>
    )
}