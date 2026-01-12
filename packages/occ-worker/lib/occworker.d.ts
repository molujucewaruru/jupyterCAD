import { IJCadWorker, IMessageHandler } from '@jupytercad/schema';
export declare class OccWorker implements IJCadWorker {
    constructor(options: OccWorker.IOptions);
    get ready(): Promise<void>;
    register(options: {
        messageHandler: IMessageHandler;
        thisArg?: any;
    }): string;
    unregister(id: string): void;
    postMessage(msg: {
        id: string;
        [key: string]: any;
    }): void;
    private _handlerFactory;
    private _ready;
    private _messageChannels;
    private _nativeWorker;
}
export declare namespace OccWorker {
    interface IOptions {
        worker: Worker;
    }
}
