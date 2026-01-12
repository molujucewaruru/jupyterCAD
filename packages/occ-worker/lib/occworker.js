import { MainAction, WorkerAction } from '@jupytercad/schema';
import { PromiseDelegate } from '@lumino/coreutils';
import { v4 as uuid } from 'uuid';
export class OccWorker {
    constructor(options) {
        this._ready = new PromiseDelegate();
        this._messageChannels = new Map();
        this._nativeWorker = options.worker;
    }
    get ready() {
        return this._ready.promise;
    }
    register(options) {
        const { messageHandler, thisArg } = options;
        const id = uuid();
        const messageChannel = new MessageChannel();
        if (thisArg) {
            messageHandler.bind(thisArg);
        }
        messageChannel.port1.onmessage = this._handlerFactory(messageHandler);
        this._messageChannels.set(id, messageChannel);
        const initMessage = {
            id,
            action: WorkerAction.REGISTER,
            payload: { id }
        };
        this._nativeWorker.postMessage(initMessage, [messageChannel.port2]);
        return id;
    }
    unregister(id) {
        this._messageChannels.delete(id);
    }
    postMessage(msg) {
        this._nativeWorker.postMessage(msg);
    }
    _handlerFactory(messageHandler) {
        return (msg) => {
            if (msg.data.action === MainAction.INITIALIZED) {
                this._ready.resolve();
            }
            messageHandler(msg.data);
        };
    }
}
