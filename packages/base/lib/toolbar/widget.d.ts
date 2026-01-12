import { IJCadExternalCommand, JupyterCadModel } from '@jupytercad/schema';
import { Toolbar, ReactiveToolbar } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';
export declare const TOOLBAR_SEPARATOR_CLASS = "jcad-Toolbar-Separator";
export declare class Separator extends Widget {
    /**
     * Construct a new separator widget.
     */
    constructor();
}
export declare class ToolbarWidget extends ReactiveToolbar {
    constructor(options: ToolbarWidget.IOptions);
}
export declare namespace ToolbarWidget {
    interface IOptions extends Toolbar.IOptions {
        commands?: CommandRegistry;
        model: JupyterCadModel;
        externalCommands: IJCadExternalCommand[];
    }
}
