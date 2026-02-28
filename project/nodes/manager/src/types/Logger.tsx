

export type Message = {
    id: string;
    owner: string; 
    color: string; // Hex?
    message: string;
    isError: boolean;
}

type Listener = () => void;

export class Logger {
    public buffer: Message[];
    private listeners: Set<Listener> = new Set();

    public constructor() {
        this.buffer = [];

        // const initMsg: Message = {
        //     id: "start",
        //     owner: "Manager",
        //     color: "red",
        //     message: "Machine logs will appear here",
        //     isError: false,
        // }
        // const initMsg2: Message = {
        //     id: "start",
        //     owner: "Manager",
        //     color: "red",
        //     message: "Machine sadaglogs will agdfgadadppear here",
        //     isError: true,
        // }
        // const initMsg3: Message = {
        //     id: "start",
        //     owner: "Manager",
        //     color: "red",
        //     message: "Machine logs wisadasdasdasdll appear here",
        //     isError: false,
        // }
        // this.appendLog(initMsg);
        // this.appendLog(initMsg2);
        // this.appendLog(initMsg3);
    }

    subscribe(listener: Listener) {
        console.log("Subscribe")
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener);
        }
    }

    private emit() {
        console.log("Emitting")
        this.listeners.forEach(listener => listener());
    }

    appendLog(msg: Message) {
        if (!msg) {
            throw new Error("No message given")
        }

        if (!msg.id || !msg.owner) {
            throw new Error("Message 'id' and 'owner' is required.")
        }

        if (msg) {
            this.buffer = [...this.buffer, msg]
            this.emit();
        }
    }

    getMessages() {
        return this.buffer
    }

    // Layout
    // renderLogs(buffer: Message[]) {

    //     return (
    //         <div className="w-full h-full items-start justify-end overflow-y-auto overflow-x-hidden">
    //             {buffer.map((msg: Message) => {
    //                 return (
    //                     <div className="flex flex-row gap-x-2 items-start justify-start p-0 overflow-x-hidden"> 
    //                         <p className={`font-bold text-${msg.color} overflow-x-hidden`}>
    //                             [{msg.owner}]:
    //                         </p>

    //                         {msg.isError && (
    //                             <p className="fold-bold text-red-600 overflow-x-hidden">Error: </p>
    //                         )}

    //                         <p className={`text-${msg.color} overflow-x-hidden`}>
    //                             {msg.message}
    //                         </p>
    //                     </div>
    //                 )
    //             })}
    //         </div>
    //     )
    // }
}