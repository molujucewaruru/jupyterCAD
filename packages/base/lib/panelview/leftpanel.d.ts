import { JupyterCadDoc, IJupyterCadTracker, IJCadFormSchemaRegistry } from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';
import { IControlPanelModel } from '../types';
export declare class LeftPanelWidget extends SidePanel {
    constructor(options: LeftPanelWidget.IOptions);
    dispose(): void;
    private _currentModel;
    private _handleFileChange;
    private _model;
}
export declare namespace LeftPanelWidget {
    interface IOptions {
        model: IControlPanelModel;
        tracker: IJupyterCadTracker;
        formSchemaRegistry: IJCadFormSchemaRegistry;
    }
    interface IProps {
        filePath?: string;
        sharedModel?: JupyterCadDoc;
    }
}
