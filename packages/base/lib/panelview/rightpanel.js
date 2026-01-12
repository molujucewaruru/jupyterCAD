import { SidePanel } from '@jupyterlab/ui-components';
import { Annotations } from './annotations';
import { ControlPanelHeader } from './header';
import { SuggestionPanel } from '../suggestion/suggestionpanel';
import { SuggestionModel } from '../suggestion/model';
export class RightPanelWidget extends SidePanel {
    constructor(options) {
        var _a;
        super();
        this.addClass('jpcad-sidepanel-widget');
        this.addClass('data-jcad-keybinding');
        this.node.tabIndex = 0;
        const { model, tracker, forkManager, collaborativeContentProvider, annotationModel } = options;
        this._model = model;
        this._annotationModel = annotationModel;
        const header = new ControlPanelHeader();
        this.header.addWidget(header);
        const annotations = new Annotations({ model: this._annotationModel });
        this.addWidget(annotations);
        let suggestionModel = undefined;
        if (forkManager) {
            suggestionModel = new SuggestionModel({
                jupytercadModel: (_a = this._model) === null || _a === void 0 ? void 0 : _a.jcadModel,
                filePath: '',
                tracker: tracker,
                forkManager: forkManager,
                collaborativeContentProvider: collaborativeContentProvider
            });
            const suggestion = new SuggestionPanel({ model: suggestionModel });
            this.addWidget(suggestion);
        }
        this._handleFileChange = () => {
            var _a;
            header.title.label = ((_a = this._currentModel) === null || _a === void 0 ? void 0 : _a.filePath) || '-';
        };
        options.tracker.currentChanged.connect(async (_, changed) => {
            var _a;
            if (changed) {
                if (this._currentModel) {
                    this._currentModel.pathChanged.disconnect(this._handleFileChange);
                }
                this._currentModel = changed.model;
                header.title.label = this._currentModel.filePath;
                this._currentModel.pathChanged.connect(this._handleFileChange);
                this._annotationModel.model =
                    ((_a = options.tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.model) || undefined;
                // await changed.model.ready;
                suggestionModel === null || suggestionModel === void 0 ? void 0 : suggestionModel.switchContext({
                    filePath: changed.model.filePath,
                    jupytercadModel: changed.model
                });
            }
            else {
                header.title.label = '-';
                this._currentModel = null;
                this._annotationModel.model = undefined;
                suggestionModel === null || suggestionModel === void 0 ? void 0 : suggestionModel.switchContext({
                    filePath: '',
                    jupytercadModel: undefined
                });
            }
        });
    }
    dispose() {
        super.dispose();
    }
}
