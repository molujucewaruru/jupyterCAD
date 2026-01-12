import { Signal } from '@lumino/signaling';
import Ajv from 'ajv';
import { JupyterCadDoc } from './doc';
import jcadSchema from './schema/jcad.json';
const SETTINGS_ID = '@jupytercad/jupytercad-core:jupytercad-settings';
export class JupyterCadModel {
    constructor(options) {
        this.collaborative = true;
        this._onSharedModelChanged = (sender, changes) => {
            var _a;
            if (changes && ((_a = changes === null || changes === void 0 ? void 0 : changes.objectChange) === null || _a === void 0 ? void 0 : _a.length)) {
                this._contentChanged.emit(void 0);
                this.dirty = true;
            }
        };
        this._onClientStateChanged = changed => {
            const clients = this.sharedModel.awareness.getStates();
            this._clientStateChanged.emit(clients);
            if (changed.added.length || changed.removed.length) {
                this._userChanged.emit(this.users);
            }
        };
        this.defaultKernelName = '';
        this.defaultKernelLanguage = '';
        this._dirty = false;
        this._readOnly = false;
        this._isDisposed = false;
        this._jcadSettings = {
            showAxesHelper: false,
            cameraType: 'Perspective'
        };
        this._userChanged = new Signal(this);
        this._disposed = new Signal(this);
        this._contentChanged = new Signal(this);
        this._stateChanged = new Signal(this);
        this._themeChanged = new Signal(this);
        this._clientStateChanged = new Signal(this);
        this._sharedMetadataChanged = new Signal(this);
        this._sharedOptionsChanged = new Signal(this);
        this._sharedObjectsChanged = new Signal(this);
        this._sharedModelSwapped = new Signal(this);
        const { annotationModel, sharedModel, settingRegistry } = options;
        if (sharedModel) {
            this._sharedModel = sharedModel;
        }
        else {
            this._sharedModel = this.createSharedModel();
        }
        this._connectSignal();
        this.annotationModel = annotationModel;
        this.settingRegistry = settingRegistry;
        this._copiedObject = null;
        this._pathChanged = new Signal(this);
        this._settingsChanged = new Signal(this);
    }
    /**
     * Initialize custom settings for JupyterLab.
     */
    async initSettings() {
        if (this.settingRegistry) {
            try {
                const setting = await this.settingRegistry.load(SETTINGS_ID);
                this._settings = setting;
                this._updateLocalSettings();
                setting.changed.connect(this._onSettingsChanged, this);
            }
            catch (error) {
                console.error(`Failed to load settings for ${SETTINGS_ID}:`, error);
                this._jcadSettings = {
                    showAxesHelper: false,
                    cameraType: 'Perspective'
                };
            }
        }
        else {
            this._jcadSettings = {
                showAxesHelper: false,
                cameraType: 'Perspective'
            };
        }
    }
    _onSettingsChanged() {
        const oldSettings = this._jcadSettings;
        this._updateLocalSettings();
        const newSettings = this._jcadSettings;
        if (oldSettings.showAxesHelper !== newSettings.showAxesHelper) {
            this._settingsChanged.emit('showAxesHelper');
        }
        if (oldSettings.cameraType !== newSettings.cameraType) {
            this._settingsChanged.emit('cameraType');
        }
    }
    _updateLocalSettings() {
        var _a, _b;
        const composite = this._settings.composite;
        this._jcadSettings = {
            showAxesHelper: (_a = composite.showAxesHelper) !== null && _a !== void 0 ? _a : false,
            cameraType: (_b = composite.cameraType) !== null && _b !== void 0 ? _b : 'Perspective'
        };
    }
    get jcadSettings() {
        return this._jcadSettings;
    }
    /**
     * Expose the settingsChanged signal for external use.
     */
    get settingsChanged() {
        return this._settingsChanged;
    }
    emitSettingChanged(settingName) {
        this._settingsChanged.emit(settingName);
    }
    /**
     * Return stored settings.
     */
    async getSettings() {
        return this._settings;
    }
    get sharedModel() {
        return this._sharedModel;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    get contentChanged() {
        return this._contentChanged;
    }
    get stateChanged() {
        return this._stateChanged;
    }
    get themeChanged() {
        return this._themeChanged;
    }
    get currentUserId() {
        var _a;
        return (_a = this.sharedModel) === null || _a === void 0 ? void 0 : _a.awareness.clientID;
    }
    get users() {
        var _a;
        this._usersMap = (_a = this.sharedModel) === null || _a === void 0 ? void 0 : _a.awareness.getStates();
        const users = [];
        if (this._usersMap) {
            this._usersMap.forEach((val, key) => {
                users.push({ userId: key, userData: val.user });
            });
        }
        return users;
    }
    get userChanged() {
        return this._userChanged;
    }
    get dirty() {
        return this._dirty;
    }
    set dirty(value) {
        this._dirty = value;
    }
    get readOnly() {
        return this._readOnly;
    }
    set readOnly(value) {
        this._readOnly = value;
    }
    get localState() {
        return this.sharedModel.awareness.getLocalState();
    }
    /**
     * Getter for the contents manager.
     */
    get contentsManager() {
        return this._contentsManager;
    }
    /**
     * Setter for the contents manager.
     * Also updates the file path.
     */
    set contentsManager(manager) {
        this._contentsManager = manager;
    }
    get clientStateChanged() {
        return this._clientStateChanged;
    }
    get sharedMetadataChanged() {
        return this._sharedMetadataChanged;
    }
    get sharedOptionsChanged() {
        return this._sharedOptionsChanged;
    }
    get sharedObjectsChanged() {
        return this._sharedObjectsChanged;
    }
    get sharedModelSwapped() {
        return this._sharedModelSwapped;
    }
    /**
     * Getter for the file path associated with the contents manager.
     */
    get filePath() {
        return this._filePath;
    }
    /**
     * Setter for the file path associated with the contents manager.
     */
    set filePath(path) {
        this._filePath = path;
        this._pathChanged.emit(path);
    }
    get pathChanged() {
        return this._pathChanged;
    }
    get disposed() {
        return this._disposed;
    }
    swapSharedModel(newSharedModel) {
        this._disconnectSignal();
        this._sharedModel.dispose();
        this._sharedModel = newSharedModel;
        this._connectSignal();
        this._sharedObjectsChanged.emit({ objectChange: [] });
        this._sharedModelSwapped.emit();
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disconnectSignal();
        this._sharedModel.dispose();
        this._disposed.emit();
        Signal.clearData(this);
    }
    toString() {
        return JSON.stringify(this.getContent(), null, 2);
    }
    fromString(data) {
        const jsonData = JSON.parse(data);
        const ajv = new Ajv();
        const validate = ajv.compile(jcadSchema);
        const valid = validate(jsonData);
        if (!valid) {
            let errorMsg = 'JupyterCAD File format invalid:\n';
            for (const error of validate.errors || []) {
                errorMsg = `${errorMsg}- ${error.instancePath} ${error.message}\n`;
            }
            console.warn(errorMsg);
        }
        this.sharedModel.transact(() => {
            var _a;
            this.sharedModel.addObjects(jsonData.objects);
            this.sharedModel.setOptions((_a = jsonData.options) !== null && _a !== void 0 ? _a : {});
        });
        this.dirty = true;
    }
    toJSON() {
        return JSON.parse(this.toString());
    }
    fromJSON(data) {
        // nothing to do
    }
    initialize() {
        //
    }
    getWorker() {
        return JupyterCadModel.worker;
    }
    getContent() {
        return {
            objects: this.sharedModel.objects,
            options: this.sharedModel.options
        };
    }
    getAllObject() {
        return this.sharedModel.objects;
    }
    syncPointer(pointer, emitter) {
        this.sharedModel.awareness.setLocalStateField('pointer', {
            value: pointer,
            emitter: emitter
        });
    }
    syncCamera(camera, emitter) {
        this.sharedModel.awareness.setLocalStateField('camera', {
            value: camera,
            emitter: emitter
        });
    }
    syncSelected(value, emitter) {
        this.sharedModel.awareness.setLocalStateField('selected', {
            value,
            emitter: emitter
        });
    }
    syncSelectedPropField(data) {
        this.sharedModel.awareness.setLocalStateField('selectedPropField', data);
    }
    setUserToFollow(userId) {
        if (this.sharedModel) {
            this.sharedModel.awareness.setLocalStateField('remoteUser', userId);
        }
    }
    syncFormData(form) {
        if (this.sharedModel) {
            this.sharedModel.awareness.setLocalStateField('toolbarForm', form);
        }
    }
    getClientId() {
        return this.sharedModel.awareness.clientID;
    }
    addMetadata(key, value) {
        this.sharedModel.setMetadata(key, value);
    }
    removeMetadata(key) {
        this.sharedModel.removeMetadata(key);
    }
    setCopiedObject(object) {
        this._copiedObject = object ? Object.assign({}, object) : null;
    }
    getCopiedObject() {
        return this._copiedObject ? Object.assign({}, this._copiedObject) : null;
    }
    createSharedModel() {
        return JupyterCadDoc.create();
    }
    _connectSignal() {
        this._sharedModel.changed.connect(this._onSharedModelChanged);
        this._sharedModel.awareness.on('change', this._onClientStateChanged);
        this._sharedModel.metadataChanged.connect(this._metadataChangedHandler, this);
        this._sharedModel.optionsChanged.connect(this._optionsChangedHandler, this);
        this._sharedModel.objectsChanged.connect(this._objectsChangedHandler, this);
    }
    _disconnectSignal() {
        this._sharedModel.changed.disconnect(this._onSharedModelChanged);
        this._sharedModel.awareness.off('change', this._onClientStateChanged);
        this._sharedModel.metadataChanged.disconnect(this._metadataChangedHandler, this);
        this._sharedModel.optionsChanged.disconnect(this._optionsChangedHandler, this);
        this._sharedModel.objectsChanged.disconnect(this._objectsChangedHandler, this);
    }
    _metadataChangedHandler(_, args) {
        this._sharedMetadataChanged.emit(args);
    }
    _optionsChangedHandler(_, args) {
        this._sharedOptionsChanged.emit(args);
    }
    _objectsChangedHandler(_, args) {
        this._sharedObjectsChanged.emit(args);
    }
}
