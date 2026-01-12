import { IJupyterCadDoc } from '@jupytercad/schema';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { ThemeSettings } from '@naisutech/react-tree';
import { IControlPanelModel } from '../types';
export declare const TREE_THEMES: ThemeSettings;
export declare class ObjectTree extends PanelWithToolbar {
    constructor(params: ObjectTree.IOptions);
}
export declare const handleRemoveObject: (objectId: string, sharedModel: IJupyterCadDoc, syncSelected: () => void) => void;
export declare namespace ObjectTree {
    /**
     * Instantiation options for `ObjectTree`.
     */
    interface IOptions extends Panel.IOptions {
        controlPanelModel: IControlPanelModel;
    }
}
