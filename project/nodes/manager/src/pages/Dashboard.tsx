import DashboardLayout from "../components/DashboardLayout";

import DashboardTermLeft from "../components/DashboardTermLeft";
import DashboardTermRight from "../components/DashboardTermRight";
import DashboardRight from "../components/DashboardRight";
import DashboardLeft from "../components/DashboardLeft";
import DashboardCenter from "../components/DashboardCenter";


export default function Dashboard() {

    return (
        <DashboardLayout 
            left={DashboardLeft()}
            right={DashboardRight()}
            center={DashboardCenter()}
            termLeft={DashboardTermLeft()}
            termRight={DashboardTermRight()}       
        />
    )   
}