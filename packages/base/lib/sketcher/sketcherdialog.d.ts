import { IDict, IJupyterCadDoc } from '@jupytercad/schema';
import { Dialog } from '@jupyterlab/apputils';
export interface ISketcherDialogOptions {
    sharedModel: IJupyterCadDoc;
    closeCallback: {
        handler: () => void;
    };
}
export declare class SketcherDialog extends Dialog<IDict> {
    constructor(options: ISketcherDialogOptions);
}
