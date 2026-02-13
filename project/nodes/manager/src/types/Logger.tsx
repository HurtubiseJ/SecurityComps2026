

export type Message = {
    id: string;
    owner: string; 
    color: string; // Hex?
    message: string;
}

export class Logger {
    public buffer: Message[];

    public constructor() {
        this.buffer = [];

        const initMsg: Message = {
            id: "start",
            owner: "Manager",
            color: "red",
            message: "Machine logs will appear here"
        }
        const initMsg2: Message = {
            id: "start",
            owner: "Manager",
            color: "red",
            message: "Machine sadaglogs will agdfgadadppear here"
        }
        const initMsg3: Message = {
            id: "start",
            owner: "Manager",
            color: "red",
            message: "Machine logs wisadasdasdasdll appear here"
        }
        this.buffer.push(initMsg);
        this.buffer.push(initMsg2);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
        this.buffer.push(initMsg3);
    }

    appendLog(msg: Message) {
        if (!msg) {
            throw new Error("No message given")
        }

        if (!msg.id || !msg.owner) {
            throw new Error("Message 'id' and 'owner' is required.")
        }

        if (msg) {
            this.buffer.push(msg)
        }
    }


    // Layout
    renderLogs() {

        return (
            <div className="w-full h-full items-start justify-end overflow-y-auto overflow-x-hidden">
                {this.buffer.map((msg: Message) => {
                    return (
                        <div className="flex flex-row gap-x-2 items-start justify-start p-0 overflow-x-hidden"> 
                            <p className={`font-bold text-${msg.color} overflow-x-hidden`}>
                                [{msg.owner}]:
                            </p>

                            <p className={`text-${msg.color} overflow-x-hidden`}>
                                {msg.message}
                            </p>
                        </div>
                    )
                })}
            </div>
        )
    }
}