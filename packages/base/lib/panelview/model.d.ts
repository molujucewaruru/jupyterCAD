import { IJupyterCadDoc, IJupyterCadModel } from '@jupytercad/schema';
import { ISignal } from '@lumino/signaling';
import { IJupyterCadTracker, IJupyterCadWidget } from '@jupytercad/schema';
import { IControlPanelModel } from '../types';
import { MainViewModel } from '../3dview/mainviewmodel';
export declare class ControlPanelModel implements IControlPanelModel {
    constructor(options: ControlPanelModel.IOptions);
    get documentChanged(): ISignal<IJupyterCadTracker, IJupyterCadWidget | null>;
    get filePath(): string | undefined;
    get jcadModel(): IJupyterCadModel | undefined;
    get sharedModel(): IJupyterCadDoc | undefined;
    get mainViewModel(): MainViewModel | undefined;
    disconnect(f: any): void;
    private readonly _tracker;
    private _documentChanged;
}
declare namespace ControlPanelModel {
    interface IOptions {
        tracker: IJupyterCadTracker;
    }
}
export {};
