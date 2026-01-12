import { ConsolePanel } from '@jupyterlab/console';
import { ServiceManager } from '@jupyterlab/services';
import { BoxPanel, Widget } from '@lumino/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';
import { CommandRegistry } from '@lumino/commands';
export declare class ConsoleView extends BoxPanel {
    constructor(options: ConsoleView.IOptions);
    get consolePanel(): ConsolePanel;
    dispose(): void;
    execute(): void;
    protected onResize(msg: Widget.ResizeMessage): void;
    private _consolePanel;
    private _resize;
}
export declare namespace ConsoleView {
    interface IOptions {
        manager: ServiceManager.IManager;
        contentFactory: ConsolePanel.IContentFactory;
        mimeTypeService: IEditorMimeTypeService;
        rendermime: IRenderMimeRegistry;
        commandRegistry: CommandRegistry;
    }
}
