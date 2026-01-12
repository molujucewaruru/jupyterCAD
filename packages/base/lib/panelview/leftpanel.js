import { SidePanel } from '@jupyterlab/ui-components';
import { ControlPanelHeader } from './header';
import { ObjectTree } from './objecttree';
import { ObjectProperties } from './objectproperties';
export class LeftPanelWidget extends SidePanel {
    constructor(options) {
        super();
        this.addClass('jpcad-sidepanel-widget');
        this.addClass('data-jcad-keybinding');
        this.node.tabIndex = 0;
        this._model = options.model;
        const header = new ControlPanelHeader();
        this.header.addWidget(header);
        const tree = new ObjectTree({ controlPanelModel: this._model });
        this.addWidget(tree);
        const properties = new ObjectProperties({
            controlPanelModel: this._model,
            formSchemaRegistry: options.formSchemaRegistry,
            tracker: options.tracker
        });
        this.addWidget(properties);
        this._handleFileChange = () => {
            var _a;
            header.title.label = ((_a = this._currentModel) === null || _a === void 0 ? void 0 : _a.filePath) || '-';
        };
        options.tracker.currentChanged.connect((_, changed) => {
            if (changed) {
                if (this._currentModel) {
                    this._currentModel.pathChanged.disconnect(this._handleFileChange);
                }
                this._currentModel = changed.model;
                header.title.label = changed.model.filePath;
                this._currentModel.pathChanged.connect(this._handleFileChange);
            }
            else {
                header.title.label = '-';
                this._currentModel = null;
            }
        });
        this.content.setRelativeSizes([4, 6]);
    }
    dispose() {
        super.dispose();
    }
}
