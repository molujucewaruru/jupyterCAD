import { Dialog, showDialog } from '@jupyterlab/apputils';
import { checkIcon, closeIcon, ToolbarButtonComponent } from '@jupyterlab/ui-components';
import { ReactTree, useReactTreeApi } from '@naisutech/react-tree';
import * as React from 'react';
import { TREE_THEMES } from '../panelview/objecttree';
import { chevronRightIcon, visibilityIcon, visibilityOffIcon } from '../tools';
export const Suggestion = (props) => {
    const [currentForkId, setCurrentForkId] = React.useState();
    const [forkData, setForkData] = React.useState([
        { id: 'root', label: props.model.title, parentId: null, items: [] }
    ]);
    const treeApi = useReactTreeApi();
    const updateFork = React.useCallback(() => {
        const allForks = props.model.allForks;
        const newState = [...forkData];
        newState[0] = Object.assign(Object.assign({}, forkData[0]), { label: props.model.title, items: Object.entries(allForks).map(([key, val]) => {
                var _a;
                return ({
                    id: key,
                    label: val.title && val.title.length ? val.title : key,
                    parentId: 'root',
                    rootRoomId: val.root_roomid,
                    metadata: JSON.parse((_a = val.description) !== null && _a !== void 0 ? _a : '{}')
                });
            }) });
        setForkData(newState);
    }, [props.model, forkData]);
    React.useEffect(() => {
        props.model.contextChanged.connect(updateFork);
        props.model.forksUpdated.connect(updateFork);
        props.model.forkSwitched.connect((_, newForkId) => {
            setCurrentForkId(newForkId);
            if (!newForkId && treeApi.current) {
                treeApi.current.toggleAllNodesSelectedState('unselected');
            }
        });
    }, [props.model, updateFork, treeApi]);
    const acceptSuggestion = React.useCallback(async (forkId) => {
        const { button } = await showDialog({
            title: 'Accept suggestion',
            body: 'Do you want to merge content of the suggestion?',
            buttons: [Dialog.cancelButton(), Dialog.okButton()],
            hasClose: true
        });
        if (button.accept) {
            await props.model.mergeFork(forkId);
        }
    }, [props.model]);
    const deleteSuggestion = React.useCallback(async (forkId) => {
        const { button } = await showDialog({
            title: 'Delete suggestion',
            body: 'Do you want to delete the suggestion?',
            buttons: [Dialog.cancelButton(), Dialog.okButton()],
            hasClose: true
        });
        if (button.accept) {
            await props.model.deleteFork(forkId);
        }
    }, [props.model]);
    return (React.createElement("div", { className: "jcad-Suggestion" },
        React.createElement("div", { className: "jpcad-treeview-wrapper" },
            React.createElement(ReactTree, { ref: treeApi, multiSelect: false, nodes: forkData, messages: { noData: 'No data' }, theme: 'labTheme', themes: TREE_THEMES, openNodes: ['root'], RenderIcon: opts => {
                    if (opts.type === 'node') {
                        return (React.createElement(chevronRightIcon.react, { className: "jcad-suggestion-tree-node-icon" }));
                    }
                }, RenderNode: opts => {
                    var _a, _b, _c, _d, _e;
                    const metadata = (_a = opts.node) === null || _a === void 0 ? void 0 : _a.metadata;
                    const userData = metadata === null || metadata === void 0 ? void 0 : metadata.author;
                    return (React.createElement("div", { className: `jpcad-control-panel-suggestion ${currentForkId === opts.node.id ? 'selected' : ''}` },
                        React.createElement("div", { title: (_b = metadata === null || metadata === void 0 ? void 0 : metadata.timestamp) !== null && _b !== void 0 ? _b : '' },
                            opts.type === 'leaf' && (React.createElement("div", { title: `Created at: ${(_c = userData === null || userData === void 0 ? void 0 : userData.display_name) !== null && _c !== void 0 ? _c : ''}`, className: 'jcad-suggestion-tree-node-user', style: { backgroundColor: (_d = userData === null || userData === void 0 ? void 0 : userData.color) !== null && _d !== void 0 ? _d : '#999999' } },
                                React.createElement("span", null, (_e = userData === null || userData === void 0 ? void 0 : userData.initials) !== null && _e !== void 0 ? _e : ''))),
                            React.createElement("span", { className: "jcad-suggestion-tree-node-label" }, opts.node.label),
                            opts.type === 'leaf' && (React.createElement("div", { style: { display: 'flex' } },
                                React.createElement(ToolbarButtonComponent, { className: 'jp-ToolbarButtonComponent', onClick: async () => {
                                        setCurrentForkId(opts.node.id);
                                        await props.model.checkoutFork(opts.node.id);
                                    }, icon: currentForkId === opts.node.id
                                        ? visibilityIcon
                                        : visibilityOffIcon, tooltip: "Preview suggestion" }),
                                React.createElement(ToolbarButtonComponent, { className: 'jp-ToolbarButtonComponent', onClick: async () => await acceptSuggestion(opts.node.id), icon: checkIcon, tooltip: "Accept suggestion" }),
                                React.createElement(ToolbarButtonComponent, { className: 'jp-ToolbarButtonComponent', onClick: async () => await deleteSuggestion(opts.node.id), icon: closeIcon, tooltip: "Delete suggestion" }))))));
                } }))));
};
