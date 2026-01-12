import { Signal } from '@lumino/signaling';
export class AnnotationModel {
    constructor(options) {
        this._modelChanged = new Signal(this);
        this._updateSignal = new Signal(this);
        this.model = options.model;
    }
    get updateSignal() {
        return this._updateSignal;
    }
    get user() {
        return this._user;
    }
    set model(model) {
        var _a;
        this._model = model;
        const state = (_a = this._model) === null || _a === void 0 ? void 0 : _a.sharedModel.awareness.getLocalState();
        this._user = state === null || state === void 0 ? void 0 : state.user;
        this._modelChanged.emit(void 0);
    }
    get model() {
        return this._model;
    }
    get modelChanged() {
        return this._modelChanged;
    }
    update() {
        this._updateSignal.emit(null);
    }
    getAnnotation(id) {
        var _a;
        const rawData = (_a = this._model) === null || _a === void 0 ? void 0 : _a.sharedModel.getMetadata(id);
        if (rawData) {
            return JSON.parse(rawData);
        }
    }
    getAnnotationIds() {
        var _a;
        const annotationIds = [];
        for (const id in (_a = this._model) === null || _a === void 0 ? void 0 : _a.sharedModel.metadata) {
            if (id.startsWith('annotation')) {
                annotationIds.push(id);
            }
        }
        return annotationIds;
    }
    addAnnotation(key, value) {
        var _a;
        (_a = this._model) === null || _a === void 0 ? void 0 : _a.sharedModel.setMetadata(`annotation_${key}`, JSON.stringify(value));
    }
    removeAnnotation(key) {
        var _a;
        (_a = this._model) === null || _a === void 0 ? void 0 : _a.removeMetadata(key);
    }
    addContent(id, value) {
        var _a;
        const newContent = {
            value,
            user: this._user
        };
        const currentAnnotation = this.getAnnotation(id);
        if (currentAnnotation) {
            const newAnnotation = Object.assign(Object.assign({}, currentAnnotation), { contents: [...currentAnnotation.contents, newContent] });
            (_a = this._model) === null || _a === void 0 ? void 0 : _a.sharedModel.setMetadata(id, JSON.stringify(newAnnotation));
        }
    }
}
