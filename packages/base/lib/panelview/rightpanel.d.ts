import { IAnnotationModel, IJupyterCadTracker, JupyterCadDoc } from '@jupytercad/schema';
import { SidePanel } from '@jupyterlab/ui-components';
import { IControlPanelModel } from '../types';
import { IForkManager } from '@jupyter/docprovider';
import { ICollaborativeContentProvider } from '@jupyter/collaborative-drive';
export declare class RightPanelWidget extends SidePanel {
    constructor(options: RightPanelWidget.IOptions);
    dispose(): void;
    private _currentModel;
    private _handleFileChange;
    private _model;
    private _annotationModel;
}
export declare namespace RightPanelWidget {
    interface IOptions {
        model: IControlPanelModel;
        tracker: IJupyterCadTracker;
        annotationModel: IAnnotationModel;
        forkManager?: IForkManager;
        collaborativeContentProvider?: ICollaborativeContentProvider;
    }
    interface IProps {
        filePath?: string;
        sharedModel?: JupyterCadDoc;
    }
}
