import { LineSegmentIcon } from "@phosphor-icons/react"
import { LOCAL_NODE_IP_MAP, NODE_IP_MAP } from "../../constants/NodeIp";
import { Link } from "react-router-dom";

type NavBarItemProps = {
    icon: React.ReactElement,
    text: string, 
    link: string
}

function NavBarItem({
    icon,
    text, 
    link
} :NavBarItemProps) {

    return (
        <a className="w-full" href={link}>
            <div className="flex flex-row items-center justify-start gap-x-4">
                <div>
                    {icon}
                </div>
                <p>{text}</p>
            </div>
        </a>
    )
}

function LinkNavBarItem({
    icon,
    text,
    link
} : NavBarItemProps) {

    return (
        <Link className="w-full" to={link}>
            <div className="flex flex-row items-center justify-start gap-x-4">
                <div>
                    {icon}
                </div>
                <p>{text}</p>
            </div>
        </Link>
    )
}

const IS_LOCAL = import.meta.env.LOCAL;
const IP_MAP = IS_LOCAL ? LOCAL_NODE_IP_MAP : NODE_IP_MAP;

export default function DashboardLeft() {

    return (
        <div className="flex flex-1 h-full w-full flex-col p-2 items-start justify-start gap-y-4">
            <LinkNavBarItem icon={<LineSegmentIcon color={"orange"}/>} text="Docs" link="/docs"/>
            <NavBarItem icon={<LineSegmentIcon color={"green"}/>} text="Dashboard" link="/" />
            <NavBarItem icon={<LineSegmentIcon color={"blue"}/>} text="Metrics" link={`http://${IP_MAP['monitor']}:3000/`}/>
        </div>
    )
}