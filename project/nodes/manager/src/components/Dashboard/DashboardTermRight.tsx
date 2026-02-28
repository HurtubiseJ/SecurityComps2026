import { useSyncExternalStore, useRef, useEffect } from "react";
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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.scrollTop = el.scrollHeight;
    }, [messageContent])

    console.log(messageContent)
    // console.log(logger.renderLogs(messageContent))
    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden"
        >
            {messageContent.map((msg) => (
                <div key={msg.id} className="flex flex-row gap-x-2 items-start p-0">
                    <p className={`font-bold text-${msg.color}`}>
                        [{msg.owner}]:
                    </p>

                    {msg.isError && (
                        <p className="font-bold text-red-600">
                            Error:
                        </p>
                    )}

                    <p className={`text-${msg.color}`}>
                        {msg.message}
                    </p>
                </div>
            ))}
        </div>
    );
}