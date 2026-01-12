import { MainAreaWidget } from '@jupyterlab/apputils';
import { IJCadWorkerRegistry, IJupyterCadModel, IJupyterCadDocumentWidget, IJupyterCadOutputWidget } from '@jupytercad/schema';
import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { JSONValue } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';
import { SplitPanel } from '@lumino/widgets';
import { JupyterCadMainViewPanel } from './3dview';
import { MainViewModel } from './3dview/mainviewmodel';
import { ConsoleView } from './console';
import { AxeHelper, CameraSettings, ClipSettings, ExplodedView, SplitScreenSettings } from './types';
export type JupyterCadWidget = JupyterCadDocumentWidget | JupyterCadOutputWidget;
export declare class JupyterCadDocumentWidget extends DocumentWidget<JupyterCadPanel, IJupyterCadModel> implements IJupyterCadDocumentWidget {
    constructor(options: DocumentWidget.IOptions<JupyterCadPanel, IJupyterCadModel>);
    get model(): IJupyterCadModel;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    onResize: (msg: any) => void;
}
/**
 * A main area widget designed to be used as Notebook cell output widget, to ease the
 * integration of toolbar and tracking.
 */
export declare class JupyterCadOutputWidget extends MainAreaWidget<JupyterCadPanel> implements IJupyterCadOutputWidget {
    constructor(options: JupyterCadOutputWidget.IOptions);
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    readonly model: IJupyterCadModel;
    readonly resizeObserver: ResizeObserver;
}
export declare namespace JupyterCadOutputWidget {
    interface IOptions extends MainAreaWidget.IOptions<JupyterCadPanel> {
        model: IJupyterCadModel;
    }
}
export declare class JupyterCadPanel extends SplitPanel {
    constructor(options: JupyterCadPanel.IOptions);
    _initModel(options: {
        model: IJupyterCadModel;
        workerRegistry: IJCadWorkerRegistry;
    }): Promise<void>;
    _initView(): void;
    get jupyterCadMainViewPanel(): JupyterCadMainViewPanel;
    get viewChanged(): ISignal<ObservableMap<JSONValue>, IObservableMap.IChangedArgs<JSONValue>>;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    get currentViewModel(): MainViewModel;
    get axes(): AxeHelper;
    set axes(value: AxeHelper);
    get explodedView(): ExplodedView;
    set explodedView(value: ExplodedView);
    get cameraSettings(): CameraSettings;
    set cameraSettings(value: CameraSettings);
    get clipView(): ClipSettings | undefined;
    set clipView(value: ClipSettings | undefined);
    get consolePanel(): ConsolePanel | undefined;
    get splitScreen(): SplitScreenSettings | undefined;
    set splitScreen(value: SplitScreenSettings | undefined);
    deleteAxes(): void;
    exportAsGLB(download?: boolean): void;
    get wireframe(): boolean;
    set wireframe(value: boolean);
    get transform(): boolean;
    set transform(value: boolean);
    get consoleOpened(): boolean;
    executeConsole(): void;
    removeConsole(): void;
    toggleConsole(jcadPath: string): Promise<void>;
    private _mainViewModel;
    private _view;
    private _jupyterCadMainViewPanel;
    private _consoleView?;
    private _consoleOpened;
    private _consoleOption;
    private _consoleTracker;
}
export declare namespace JupyterCadPanel {
    interface IOptions extends Partial<ConsoleView.IOptions> {
        model: IJupyterCadModel;
        workerRegistry: IJCadWorkerRegistry;
        consoleTracker?: IConsoleTracker;
    }
}
