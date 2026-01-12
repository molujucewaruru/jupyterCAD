import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';
import { MainView } from './mainview';
export class JupyterCadMainViewPanel extends ReactWidget {
    /**
     * Construct a `JupyterCadPanel`.
     *
     * @param context - The documents context.
     */
    constructor(options) {
        super();
        this._mainViewModel = options.mainViewModel;
        this.addClass('jp-jupytercad-panel');
    }
    processMessage(msg) {
        super.processMessage(msg);
        switch (msg.type) {
            case 'resize':
            case 'after-show':
            case 'after-attach':
                this._mainViewModel.emitAfterShow();
                break;
        }
    }
    render() {
        return React.createElement(MainView, { viewModel: this._mainViewModel });
    }
}
