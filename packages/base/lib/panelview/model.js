export class ControlPanelModel {
    constructor(options) {
        this._tracker = options.tracker;
        this._documentChanged = this._tracker.currentChanged;
    }
    get documentChanged() {
        return this._documentChanged;
    }
    get filePath() {
        var _a;
        return (_a = this._tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.model.filePath;
    }
    get jcadModel() {
        var _a;
        return (_a = this._tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.model;
    }
    get sharedModel() {
        var _a;
        return (_a = this._tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.model.sharedModel;
    }
    get mainViewModel() {
        var _a;
        return (_a = this._tracker.currentWidget) === null || _a === void 0 ? void 0 : _a.content.currentViewModel;
    }
    disconnect(f) {
        this._tracker.forEach(w => {
            w.model.sharedObjectsChanged.disconnect(f);
            w.model.sharedOptionsChanged.disconnect(f);
            w.model.sharedMetadataChanged.disconnect(f);
        });
        this._tracker.forEach(w => w.model.themeChanged.disconnect(f));
        this._tracker.forEach(w => w.model.clientStateChanged.disconnect(f));
    }
}
