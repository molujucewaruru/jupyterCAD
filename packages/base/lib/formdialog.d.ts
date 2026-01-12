import { IDict, IJupyterCadModel } from '@jupytercad/schema';
import { Dialog } from '@jupyterlab/apputils';
export interface IFormDialogOptions {
    schema: IDict;
    sourceData: IDict;
    title: string;
    cancelButton: (() => void) | boolean;
    syncData: (props: IDict) => void;
    syncSelectedPropField?: (id: string | null, value: any, parentType: 'dialog' | 'panel') => void;
    model: IJupyterCadModel;
}
export declare class FormDialog extends Dialog<IDict> {
    constructor(options: IFormDialogOptions);
}
