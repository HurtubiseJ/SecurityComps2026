import DashboardLayout from "../components/Dashboard/DashboardLayout";

import DashboardTermLeft from "../components/Dashboard/DashboardTermLeft";
import DashboardTermRight from "../components/Dashboard/DashboardTermRight";
import DashboardRight from "../components/Dashboard/DashboardRight";
import DashboardLeft from "../components/Dashboard/DashboardLeft";
import DashboardCenter from "../components/Dashboard/DashboardCenter";
import useNodeManager from "../hooks/useNodeManager";
import { Logger } from "../types/Logger";


export default function Dashboard() {

    const manager = useNodeManager(); 
    const logger = new Logger()
    console.log(manager.nodes.current)

    return (
        <DashboardLayout 
            left={<DashboardLeft />}
            right={<DashboardRight baseConfig={manager.activeNode.current} />}
            center={<DashboardCenter />}
            termLeft={<DashboardTermLeft />}
            termRight={<DashboardTermRight logger={logger} />}       
        />
    )   
}