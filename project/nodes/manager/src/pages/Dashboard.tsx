import DashboardLayout from "../components/Dashboard/DashboardLayout";

import DashboardTermLeft from "../components/Dashboard/DashboardTermLeft";
import DashboardTermRight from "../components/Dashboard/DashboardTermRight";
import DashboardRight from "../components/Dashboard/DashboardRight";
import DashboardLeft from "../components/Dashboard/DashboardLeft";
import DashboardCenter from "../components/Dashboard/DashboardCenter";
import useNodeManager from "../hooks/useNodeManager";
import { Logger } from "../types/Logger";


export default function Dashboard() {

    const logger = new Logger()
    const manager = useNodeManager(logger); 

    return (
        <DashboardLayout 
            left={<DashboardLeft />}
            right={<DashboardRight baseConfig={manager.activeNode} updateNode={manager.updateNode} />}
            center={<DashboardCenter nodeManager={manager} />}
            termLeft={<DashboardTermLeft />}
            termRight={<DashboardTermRight logger={logger} />}       
        />
    )   
}