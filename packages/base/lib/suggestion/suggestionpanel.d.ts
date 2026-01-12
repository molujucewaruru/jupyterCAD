import { PanelWithToolbar } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import { SuggestionModel } from './model';
export declare class SuggestionPanel extends PanelWithToolbar {
    constructor(params: SuggestionPanel.IOptions);
    createFork(): Promise<void>;
    private _model;
}
export declare namespace SuggestionPanel {
    /**
     * Instantiation options for `ObjectProperties`.
     */
    interface IOptions extends Panel.IOptions {
        model: SuggestionModel;
    }
}
