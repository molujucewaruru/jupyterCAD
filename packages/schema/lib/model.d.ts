import { MapChange } from '@jupyter/ydoc';
import { IChangedArgs } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { PartialJSONObject } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { IJCadContent, IJCadModel, IJCadObject } from './_interface/jcad';
import { Camera, IAnnotationModel, IJcadObjectDocChange, IJupyterCadClientState, IJupyterCadDoc, IJupyterCadModel, ISelection, IUserData, Pointer, IJCadSettings } from './interfaces';
import { Contents } from '@jupyterlab/services';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
export declare class JupyterCadModel implements IJupyterCadModel {
    constructor(options: JupyterCadModel.IOptions);
    /**
     * Initialize custom settings for JupyterLab.
     */
    initSettings(): Promise<void>;
    private _onSettingsChanged;
    private _updateLocalSettings;
    get jcadSettings(): IJCadSettings;
    /**
     * Expose the settingsChanged signal for external use.
     */
    get settingsChanged(): ISignal<JupyterCadModel, string>;
    emitSettingChanged(settingName: string): void;
    /**
     * Return stored settings.
     */
    getSettings(): Promise<ISettingRegistry.ISettings>;
    readonly collaborative = true;
    get sharedModel(): IJupyterCadDoc;
    get isDisposed(): boolean;
    get contentChanged(): ISignal<this, void>;
    get stateChanged(): ISignal<this, IChangedArgs<any, any, string>>;
    get themeChanged(): Signal<this, IChangedArgs<string, string | null, string>>;
    get currentUserId(): number | undefined;
    get users(): IUserData[];
    get userChanged(): ISignal<this, IUserData[]>;
    get dirty(): boolean;
    set dirty(value: boolean);
    get readOnly(): boolean;
    set readOnly(value: boolean);
    get localState(): IJupyterCadClientState | null;
    /**
     * Getter for the contents manager.
     */
    get contentsManager(): Contents.IManager | undefined;
    /**
     * Setter for the contents manager.
     * Also updates the file path.
     */
    set contentsManager(manager: Contents.IManager | undefined);
    get clientStateChanged(): ISignal<this, Map<number, IJupyterCadClientState>>;
    get sharedMetadataChanged(): ISignal<this, MapChange>;
    get sharedOptionsChanged(): ISignal<this, MapChange>;
    get sharedObjectsChanged(): ISignal<this, IJcadObjectDocChange>;
    get sharedModelSwapped(): ISignal<this, void>;
    /**
     * Getter for the file path associated with the contents manager.
     */
    get filePath(): string;
    /**
     * Setter for the file path associated with the contents manager.
     */
    set filePath(path: string);
    get pathChanged(): ISignal<JupyterCadModel, string>;
    get disposed(): ISignal<JupyterCadModel, void>;
    swapSharedModel(newSharedModel: IJupyterCadDoc): void;
    dispose(): void;
    toString(): string;
    fromString(data: string): void;
    toJSON(): PartialJSONObject;
    fromJSON(data: PartialJSONObject): void;
    initialize(): void;
    getWorker(): Worker;
    getContent(): IJCadContent;
    getAllObject(): IJCadModel;
    syncPointer(pointer?: Pointer, emitter?: string): void;
    syncCamera(camera?: Camera, emitter?: string): void;
    syncSelected(value: {
        [key: string]: ISelection;
    }, emitter?: string): void;
    syncSelectedPropField(data: {
        id: string | null;
        value: any;
        parentType: 'panel' | 'dialog';
    }): void;
    setUserToFollow(userId?: number): void;
    syncFormData(form: any): void;
    getClientId(): number;
    addMetadata(key: string, value: string): void;
    removeMetadata(key: string): void;
    setCopiedObject(object: IJCadObject | null): void;
    getCopiedObject(): IJCadObject | null;
    protected createSharedModel(): IJupyterCadDoc;
    private _onSharedModelChanged;
    private _onClientStateChanged;
    private _connectSignal;
    private _disconnectSignal;
    private _metadataChangedHandler;
    private _optionsChangedHandler;
    private _objectsChangedHandler;
    readonly defaultKernelName: string;
    readonly defaultKernelLanguage: string;
    readonly annotationModel?: IAnnotationModel;
    readonly settingRegistry?: ISettingRegistry;
    private _settings;
    private _sharedModel;
    private _copiedObject;
    private _dirty;
    private _readOnly;
    private _isDisposed;
    private _filePath;
    private _pathChanged;
    private _contentsManager?;
    private _jcadSettings;
    private _userChanged;
    private _usersMap?;
    private _disposed;
    private _contentChanged;
    private _stateChanged;
    private _themeChanged;
    private _clientStateChanged;
    private _settingsChanged;
    private _sharedMetadataChanged;
    private _sharedOptionsChanged;
    private _sharedObjectsChanged;
    private _sharedModelSwapped;
    static worker: Worker;
}
export declare namespace JupyterCadModel {
    interface IOptions extends DocumentRegistry.IModelOptions<IJupyterCadDoc> {
        annotationModel?: IAnnotationModel;
        settingRegistry?: ISettingRegistry;
    }
}
