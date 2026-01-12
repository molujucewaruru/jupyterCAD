import { ReactWidget } from '@jupyterlab/apputils';
import { MainViewModel } from './mainviewmodel';
import { Message } from '@lumino/messaging';
export declare class JupyterCadMainViewPanel extends ReactWidget {
    /**
     * Construct a `JupyterCadPanel`.
     *
     * @param context - The documents context.
     */
    constructor(options: {
        mainViewModel: MainViewModel;
    });
    processMessage(msg: Message): void;
    render(): JSX.Element;
    private _mainViewModel;
}
