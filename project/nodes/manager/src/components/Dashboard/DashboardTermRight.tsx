import type { Logger } from "../../types/Logger"


export default function DashboardTermRight({
    logger
} : {
    logger: Logger
    }
) {


    return (
        <>
            {logger.renderLogs()}
        </>
    )
}