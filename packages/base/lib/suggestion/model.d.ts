import { IJupyterCadModel, IJupyterCadTracker, IUserData } from '@jupytercad/schema';
import { ISignal } from '@lumino/signaling';
import { IAllForksResponse, IForkCreationResponse, IForkManager } from '@jupyter/docprovider';
import { ICollaborativeContentProvider } from '@jupyter/collaborative-drive';
export declare class SuggestionModel {
    constructor(options: SuggestionModel.IOptions);
    get currentForkId(): string | undefined;
    get title(): string;
    get allForks(): IAllForksResponse;
    get forksUpdated(): ISignal<SuggestionModel, void>;
    get forkSwitched(): ISignal<SuggestionModel, string | undefined>;
    get contextChanged(): ISignal<SuggestionModel, void>;
    get currentUser(): IUserData | undefined;
    switchContext(context: {
        filePath: string;
        jupytercadModel: IJupyterCadModel | undefined;
    }): Promise<void>;
    mergeFork(forkId: string): Promise<void>;
    deleteFork(forkId: string): Promise<void>;
    createFork(title?: string): Promise<IForkCreationResponse | undefined>;
    backToRoot(removeSplitView?: boolean): Promise<void>;
    checkoutFork(forkId: string): Promise<void>;
    private _toggleSplitScreen;
    private _handleForkDeleted;
    private _handleForkAdded;
    private _jupytercadModel;
    private _allForks;
    private _forksUpdated;
    private _forkSwitched;
    private _contextChanged;
    private _filePath;
    private _rootDocId;
    private _tracker;
    private _forkManager;
    private _forkProvider?;
    private _currentSession?;
    private _contentProvider?;
    private _currentForkId;
    private _currentUser?;
}
declare namespace SuggestionModel {
    interface IOptions {
        jupytercadModel: IJupyterCadModel | undefined;
        filePath: string;
        tracker: IJupyterCadTracker;
        forkManager: IForkManager;
        collaborativeContentProvider?: ICollaborativeContentProvider;
    }
}
export {};
