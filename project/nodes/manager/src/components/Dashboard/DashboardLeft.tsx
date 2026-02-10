import { LineSegmentIcon } from "@phosphor-icons/react"

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


export default function DashboardLeft() {

    return (
        <div className="flex flex-1 h-full w-full flex-col p-2 items-start justify-start gap-y-4">
            <NavBarItem icon={<LineSegmentIcon color={"orange"}/>} text="Docs" link="/docs"/>
            <NavBarItem icon={<LineSegmentIcon color={"green"}/>} text="Dashboard" link="/" />
            <NavBarItem icon={<LineSegmentIcon color={"blue"}/>} text="Metrics" link="http://localhost:3000/" />
        </div>
    )
}