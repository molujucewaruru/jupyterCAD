import { Signal } from '@lumino/signaling';
import { requestDocSession } from '@jupyter/docprovider';
export class SuggestionModel {
    constructor(options) {
        this._allForks = {};
        this._forksUpdated = new Signal(this);
        this._forkSwitched = new Signal(this);
        this._contextChanged = new Signal(this);
        const { tracker, forkManager, filePath, jupytercadModel, collaborativeContentProvider } = options;
        this._tracker = tracker;
        this._forkManager = forkManager;
        this._contentProvider = collaborativeContentProvider;
        this.switchContext({
            filePath,
            jupytercadModel
        });
        this._forkManager.forkAdded.connect(this._handleForkAdded, this);
        this._forkManager.forkDeleted.connect(this._handleForkDeleted, this);
    }
    get currentForkId() {
        return this._currentForkId;
    }
    get title() {
        var _a, _b;
        const pathComponents = (_b = (_a = this._filePath) === null || _a === void 0 ? void 0 : _a.split(':')) !== null && _b !== void 0 ? _b : [];
        return pathComponents.length > 1 ? pathComponents[1] : pathComponents[0];
    }
    get allForks() {
        return this._allForks;
    }
    get forksUpdated() {
        return this._forksUpdated;
    }
    get forkSwitched() {
        return this._forkSwitched;
    }
    get contextChanged() {
        return this._contextChanged;
    }
    get currentUser() {
        return this._currentUser;
    }
    async switchContext(context) {
        var _a, _b, _c;
        this._filePath = context.filePath;
        this._jupytercadModel = context.jupytercadModel;
        if (!this._jupytercadModel) {
            this._allForks = {};
        }
        if (this._filePath && this._filePath.length > 0) {
            const session = (this._currentSession = await requestDocSession('text', 'jcad', this._filePath));
            this._forkProvider = this._forkManager.getProvider({
                documentPath: this._filePath,
                format: session.format,
                type: session.type
            });
            this._rootDocId = `${session.format}:${session.type}:${session.fileId}`;
            this._allForks = await this._forkManager.getAllForks(this._rootDocId);
            this._currentForkId = undefined;
            this._forkSwitched.emit(undefined);
        }
        if ((_a = this._jupytercadModel) === null || _a === void 0 ? void 0 : _a.currentUserId) {
            const matched = ((_c = (_b = this._jupytercadModel) === null || _b === void 0 ? void 0 : _b.users) !== null && _c !== void 0 ? _c : []).filter(it => it.userId === this._jupytercadModel.currentUserId);
            if (matched[0]) {
                this._currentUser = matched[0];
            }
        }
        this._contextChanged.emit();
    }
    async mergeFork(forkId) {
        var _a;
        await this._forkManager.deleteFork({ forkId, merge: true });
        await ((_a = this._forkProvider) === null || _a === void 0 ? void 0 : _a.reconnect());
        this._toggleSplitScreen(false);
        this._currentForkId = undefined;
        this._forkSwitched.emit(undefined);
    }
    async deleteFork(forkId) {
        await this._forkManager.deleteFork({
            forkId,
            merge: false
        });
    }
    async createFork(title) {
        var _a;
        if (this._rootDocId) {
            const now = new Date(Date.now());
            const meta = {
                timestamp: now.toLocaleString(),
                author: (_a = this._currentUser) === null || _a === void 0 ? void 0 : _a.userData
            };
            try {
                const res = await this._forkManager.createFork({
                    rootId: this._rootDocId,
                    synchronize: false,
                    title,
                    description: JSON.stringify(meta)
                });
                if (res) {
                    this.checkoutFork(res.fork_roomid);
                }
                return res;
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    async backToRoot(removeSplitView = false) {
        var _a, _b;
        if (!this._currentForkId) {
            return;
        }
        (_a = this._jupytercadModel) === null || _a === void 0 ? void 0 : _a.sharedModel.dispose();
        if (this._contentProvider && this._currentSession && this._filePath) {
            const currentSharedModel = this._contentProvider.sharedModelFactory.createNew({
                path: this._filePath,
                format: this._currentSession.format,
                contentType: this._currentSession.type,
                collaborative: true
            });
            if (currentSharedModel) {
                (_b = this._jupytercadModel) === null || _b === void 0 ? void 0 : _b.swapSharedModel(currentSharedModel);
            }
            this._forkProvider = this._forkManager.getProvider({
                documentPath: this._filePath,
                format: this._currentSession.format,
                type: this._currentSession.type
            });
            await this._forkProvider.ready;
            if (removeSplitView) {
                this._toggleSplitScreen(false);
            }
            this._currentForkId = undefined;
            this._forkSwitched.emit(undefined);
        }
    }
    async checkoutFork(forkId) {
        var _a;
        let enableSplitView = true;
        if (this._currentForkId === forkId) {
            return;
        }
        if (this._currentSession) {
            if (this._currentForkId) {
                enableSplitView = false;
                await this.backToRoot();
            }
            await ((_a = this._forkProvider) === null || _a === void 0 ? void 0 : _a.connectToForkDoc(forkId, this._currentSession.sessionId));
            if (enableSplitView) {
                this._toggleSplitScreen(true);
            }
            this._currentForkId = forkId;
            this._forkSwitched.emit(forkId);
        }
    }
    _toggleSplitScreen(enabled) {
        const current = this._tracker.currentWidget;
        if (!current) {
            return;
        }
        if (current.content.splitScreen) {
            current.content.splitScreen = {
                enabled
            };
        }
    }
    async _handleForkDeleted(_, changes) {
        if (this._rootDocId && changes.fork_info.root_roomid === this._rootDocId) {
            this._allForks = await this._forkManager.getAllForks(this._rootDocId);
            this._forksUpdated.emit();
            if (this._currentForkId && changes.fork_roomid === this._currentForkId) {
                this.backToRoot(true);
            }
        }
    }
    async _handleForkAdded(_, changes) {
        if (this._rootDocId && changes.fork_info.root_roomid === this._rootDocId) {
            this._allForks = await this._forkManager.getAllForks(this._rootDocId);
            this._forksUpdated.emit();
        }
    }
}
