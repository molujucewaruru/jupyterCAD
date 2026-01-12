var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { ToolbarButton } from '@jupyterlab/apputils';
import { downloadIcon } from '@jupyterlab/ui-components';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ObservableMap } from '@jupyterlab/observables';
import { Signal } from '@lumino/signaling';
import { SplitPanel, Widget } from '@lumino/widgets';
import { JupyterCadMainViewPanel } from './3dview';
import { MainViewModel } from './3dview/mainviewmodel';
import { ConsoleView } from './console';
import { MessageLoop } from '@lumino/messaging';
const CELL_OUTPUT_WIDGET_CLASS = 'jcad-cell-output-widget';
export class JupyterCadDocumentWidget extends DocumentWidget {
    constructor(options) {
        super(options);
        this.onResize = (msg) => {
            window.dispatchEvent(new Event('resize'));
        };
        // 新增
        this.toolbar.addItem('export-glb', new ToolbarButton({
            icon: downloadIcon,
            label: '', // 按钮旁显示的文字，如果只想显示图标可去掉此行
            tooltip: 'Export to .glb',
            onClick: () => {
                // 调用 Panel 中的 exportAsGLB 方法
                if (this.content && this.content.exportAsGLB) {
                    this.content.exportAsGLB();
                }
                else {
                    console.error('exportAsGLB method not found on content panel');
                }
            }
        }));
    }
    get model() {
        return this.context.model;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        // [新增] 在销毁组件前，调用 Panel 的 exportAsGLB 方法
        // 这将触发 MainView 监听到变更，从而获取数据并释放 _emitExportAsGLB 信号
        if (this.content && !this.content.isDisposed && this.content.exportAsGLB) {
            this.content.exportAsGLB();
        }
        this.content.dispose();
        super.dispose();
    }
}
/**
 * A main area widget designed to be used as Notebook cell output widget, to ease the
 * integration of toolbar and tracking.
 */
export class JupyterCadOutputWidget extends MainAreaWidget {
    constructor(options) {
        super(options);
        this.addClass(CELL_OUTPUT_WIDGET_CLASS);
        this.model = options.model;
        this.resizeObserver = new ResizeObserver(() => {
            // Send a resize message to the widget, to update the child size.
            MessageLoop.sendMessage(this, Widget.ResizeMessage.UnknownSize);
        });
        this.resizeObserver.observe(this.node);
        this.model.disposed.connect(() => this.dispose());
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (!this.isDisposed) {
            this.resizeObserver.disconnect();
            this.content.dispose();
            super.dispose();
        }
    }
}
export class JupyterCadPanel extends SplitPanel {
    constructor(options) {
        super({ orientation: 'vertical', spacing: 0 });
        this._consoleOpened = false;
        const { model, workerRegistry, consoleTracker } = options, consoleOption = __rest(options, ["model", "workerRegistry", "consoleTracker"]);
        this._consoleOption = consoleOption;
        this._consoleTracker = consoleTracker;
        this._initModel({ model, workerRegistry }).then(() => {
            this._initView();
        });
    }
    async _initModel(options) {
        var _a, _b, _c;
        this._view = new ObservableMap({});
        await options.model.initSettings();
        const settings = await options.model.getSettings();
        const compositeSettings = (_a = settings === null || settings === void 0 ? void 0 : settings.composite) !== null && _a !== void 0 ? _a : {};
        const cameraSettings = {
            type: (_b = compositeSettings.cameraType) !== null && _b !== void 0 ? _b : 'Perspective'
        };
        const axes = {
            visible: (_c = compositeSettings.showAxesHelper) !== null && _c !== void 0 ? _c : false
        };
        const explodedView = {
            enabled: false,
            factor: 0
        };
        this._view.set('cameraSettings', cameraSettings);
        this._view.set('explodedView', explodedView);
        this._view.set('axes', axes);
        this._mainViewModel = new MainViewModel({
            jcadModel: options.model,
            workerRegistry: options.workerRegistry,
            viewSetting: this._view
        });
    }
    _initView() {
        this._jupyterCadMainViewPanel = new JupyterCadMainViewPanel({
            mainViewModel: this._mainViewModel
        });
        this.addWidget(this._jupyterCadMainViewPanel);
        SplitPanel.setStretch(this._jupyterCadMainViewPanel, 1);
    }
    get jupyterCadMainViewPanel() {
        return this._jupyterCadMainViewPanel;
    }
    get viewChanged() {
        return this._view.changed;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        if (this._consoleView) {
            this._consoleView.dispose();
        }
        Signal.clearData(this);
        this._mainViewModel.dispose();
        super.dispose();
    }
    get currentViewModel() {
        return this._mainViewModel;
    }
    get axes() {
        return this._view.get('axes');
    }
    set axes(value) {
        this._view.set('axes', value);
    }
    get explodedView() {
        return this._view.get('explodedView');
    }
    set explodedView(value) {
        this._view.set('explodedView', value);
    }
    get cameraSettings() {
        return this._view.get('cameraSettings');
    }
    set cameraSettings(value) {
        this._view.set('cameraSettings', value);
    }
    get clipView() {
        return this._view.get('clipView');
    }
    set clipView(value) {
        this._view.set('clipView', value || null);
    }
    get consolePanel() {
        var _a;
        return (_a = this._consoleView) === null || _a === void 0 ? void 0 : _a.consolePanel;
    }
    get splitScreen() {
        var _a;
        return ((_a = this._view.get('splitScreen')) !== null && _a !== void 0 ? _a : {
            enabled: false
        });
    }
    set splitScreen(value) {
        this._view.set('splitScreen', value || null);
    }
    deleteAxes() {
        this._view.delete('axes');
    }
    // // 新增：必须添加这个 getter，否则 commands 无法获取 viewModel
    // get currentViewModel(): MainViewModel {
    //   return this._view.viewModel; 
    // }
    exportAsGLB() {
        // 设置一个带有时间戳的随机值来触发 MainView 中的监听器
        this._view.set('exportAsGLB', new Date().toISOString());
    }
    get wireframe() {
        return this._view.get('wireframe');
    }
    set wireframe(value) {
        this._view.set('wireframe', value);
    }
    get transform() {
        return this._view.get('transform');
    }
    set transform(value) {
        this._view.set('transform', value);
    }
    get consoleOpened() {
        return this._consoleOpened;
    }
    executeConsole() {
        if (this._consoleView) {
            this._consoleView.execute();
        }
    }
    removeConsole() {
        if (this._consoleView) {
            this._consoleView.dispose();
            this._consoleView = undefined;
            this._consoleOpened = false;
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 250);
        }
    }
    async toggleConsole(jcadPath) {
        if (!this._consoleView) {
            const { contentFactory, manager, mimeTypeService, rendermime, commandRegistry } = this._consoleOption;
            if (contentFactory &&
                manager &&
                mimeTypeService &&
                rendermime &&
                commandRegistry &&
                this._consoleTracker) {
                this._consoleView = new ConsoleView({
                    contentFactory,
                    manager,
                    mimeTypeService,
                    rendermime,
                    commandRegistry
                });
                const { consolePanel } = this._consoleView;
                this._consoleTracker.widgetAdded.emit(consolePanel);
                await consolePanel.sessionContext.ready;
                this.addWidget(this._consoleView);
                this.setRelativeSizes([2, 1]);
                this._consoleOpened = true;
                await consolePanel.console.inject(`from jupytercad import CadDocument\ndoc = CadDocument("${jcadPath}")`);
                consolePanel.console.sessionContext.kernelChanged.connect((_, arg) => {
                    if (!arg.newValue) {
                        this.removeConsole();
                    }
                });
            }
        }
        else {
            if (this._consoleOpened) {
                this._consoleOpened = false;
                this.setRelativeSizes([1, 0]);
            }
            else {
                this._consoleOpened = true;
                this.setRelativeSizes([2, 1]);
            }
        }
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 250);
    }
}
