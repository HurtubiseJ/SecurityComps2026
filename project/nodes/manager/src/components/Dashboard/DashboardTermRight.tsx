import { useSyncExternalStore } from "react";
import type { Logger } from "../../types/Logger"


function useLogger(logger: Logger) {
    return useSyncExternalStore(
        logger.subscribe.bind(logger),
        logger.getMessages.bind(logger)
    )
}

export default function DashboardTermRight({
    logger
} : {
    logger: Logger
    }
) {
    const messageContent = useLogger(logger);

    console.log(messageContent)
    console.log(logger.renderLogs(messageContent))
    return (
        <>
            {logger.renderLogs(messageContent)}
        </>
    )
}