

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
}