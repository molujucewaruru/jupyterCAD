import { ConsolePanel } from '@jupyterlab/console';
import { BoxPanel } from '@lumino/widgets';
import { debounce } from '../tools';
import { closeIcon, CommandToolbarButton, expandIcon, Toolbar } from '@jupyterlab/ui-components';
export class ConsoleView extends BoxPanel {
    constructor(options) {
        super({ direction: 'top-to-bottom' });
        this._resize = debounce(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200);
        this.addClass('jpcad-console');
        const { manager, contentFactory, mimeTypeService, rendermime } = options;
        const clonedRendermime = rendermime.clone();
        this._consolePanel = new ConsolePanel({
            manager,
            contentFactory,
            mimeTypeService,
            rendermime: clonedRendermime,
            kernelPreference: { name: 'python3', shutdownOnDispose: true }
        });
        this._consolePanel.console.node.dataset.jpInteractionMode = 'notebook';
        this.addWidget(this._consolePanel);
        BoxPanel.setStretch(this._consolePanel, 1);
        this._consolePanel.toolbar.addItem('spacer', Toolbar.createSpacerItem());
        this._consolePanel.toolbar.addItem('toggle', new CommandToolbarButton({
            label: '',
            icon: expandIcon,
            id: 'jupytercad:toggleConsole',
            commands: options.commandRegistry
        }));
        this._consolePanel.toolbar.addItem('close', new CommandToolbarButton({
            label: '',
            icon: closeIcon,
            id: 'jupytercad:removeConsole',
            commands: options.commandRegistry
        }));
    }
    get consolePanel() {
        return this._consolePanel;
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._consolePanel.dispose();
        super.dispose();
    }
    execute() {
        this._consolePanel.console.execute(false);
    }
    onResize(msg) {
        super.onResize(msg);
        this._resize();
    }
}
