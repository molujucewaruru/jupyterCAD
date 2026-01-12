import { Dialog, ReactWidget, showDialog } from '@jupyterlab/apputils';
import { closeIcon, LabIcon, PanelWithToolbar, ToolbarButtonComponent } from '@jupyterlab/ui-components';
import { ReactTree } from '@naisutech/react-tree';
import * as React from 'react';
import { v4 as uuid } from 'uuid';
import visibilitySvg from '../../style/icon/visibility.svg';
import visibilityOffSvg from '../../style/icon/visibilityOff.svg';
import { setVisible } from '../commands/tools';
const visibilityIcon = new LabIcon({
    name: 'jupytercad:visibilityIcon',
    svgstr: visibilitySvg
});
const visibilityOffIcon = new LabIcon({
    name: 'jupytercad:visibilityOffIcon',
    svgstr: visibilityOffSvg
});
export const TREE_THEMES = {
    labTheme: {
        text: {
            fontSize: '14px',
            fontFamily: 'var(--jp-ui-font-family)',
            color: 'var(--jp-ui-font-color1)',
            selectedColor: 'var(--jp-ui-inverse-font-color1)',
            hoverColor: 'var(--jp-ui-font-color2)'
        },
        nodes: {
            folder: {
                bgColor: 'var(--jp-layout-color1)',
                selectedBgColor: 'var(--jp-layout-color2)',
                hoverBgColor: 'var(--jp-layout-color2)'
            },
            leaf: {
                bgColor: 'var(--jp-layout-color1)',
                selectedBgColor: 'var(--jp-layout-color2)',
                hoverBgColor: 'var(--jp-layout-color2)'
            },
            icons: {
                size: '9px',
                folderColor: 'var(--jp-inverse-layout-color3)',
                leafColor: 'var(--jp-inverse-layout-color3)'
            }
        }
    }
};
export class ObjectTree extends PanelWithToolbar {
    constructor(params) {
        super(params);
        this.title.label = 'Objects tree';
        const body = ReactWidget.create(React.createElement(ObjectTreeReact, { cpModel: params.controlPanelModel }));
        this.addWidget(body);
        this.addClass('jpcad-sidebar-treepanel');
    }
}
export const handleRemoveObject = (objectId, sharedModel, syncSelected) => {
    if (!sharedModel) {
        return;
    }
    const dependants = sharedModel.getDependants(objectId);
    let body;
    if (dependants.length) {
        body = (React.createElement("div", null,
            'Removing this object will also result in removing:',
            React.createElement("ul", null, dependants.map(dependant => (React.createElement("li", { key: dependant }, dependant))))));
    }
    else {
        body = React.createElement("div", null, "Are you sure?");
    }
    showDialog({
        title: `Removing ${objectId}`,
        body,
        buttons: [Dialog.okButton(), Dialog.cancelButton()]
    }).then(({ button: { accept } }) => {
        if (accept) {
            const toRemove = dependants.concat([objectId]);
            const objetToRemove = sharedModel.getObjectByName(objectId);
            sharedModel.transact(() => {
                var _a;
                (_a = objetToRemove === null || objetToRemove === void 0 ? void 0 : objetToRemove.dependencies) === null || _a === void 0 ? void 0 : _a.forEach((dependency) => {
                    setVisible(sharedModel, dependency, true);
                });
                sharedModel.removeObjects(toRemove);
            });
        }
    });
    syncSelected();
};
class ObjectTreeReact extends React.Component {
    constructor(props) {
        var _a, _b;
        super(props);
        this.stateToTree = () => {
            if (this.state.jcadObject) {
                return this.state.jcadObject.map(obj => {
                    var _a;
                    const name = obj.name;
                    const items = [];
                    if (obj.shape) {
                        items.push({
                            id: `${name}#shape#${obj.shape}#${this.state.filePath}`,
                            label: 'Shape',
                            parentId: name
                        });
                    }
                    if (obj.operators) {
                        items.push({
                            id: `${name}#operator#${this.state.filePath}`,
                            label: 'Operators',
                            parentId: name
                        });
                    }
                    return {
                        id: name,
                        label: (_a = obj.name) !== null && _a !== void 0 ? _a : `Object (#${name})`,
                        parentId: null,
                        items
                    };
                });
            }
            return [];
        };
        this.handleNodeClick = (objectId) => {
            var _a, _b, _c;
            const object = this.getObjectFromName(objectId);
            if (object && object.visible === true) {
                const objPosition = ((_b = (_a = object === null || object === void 0 ? void 0 : object.parameters) === null || _a === void 0 ? void 0 : _a.Placement) === null || _b === void 0 ? void 0 : _b.Position) || {
                    x: 0,
                    y: 0,
                    z: 0
                };
                const event = new CustomEvent('jupytercadObjectSelection', {
                    detail: {
                        objectId,
                        objPosition,
                        mainViewModelId: (_c = this.props.cpModel.mainViewModel) === null || _c === void 0 ? void 0 : _c.id
                    }
                });
                window.dispatchEvent(event);
            }
        };
        this._sharedJcadModelChanged = (sender, change) => {
            if (change.objectChange) {
                const currentSelection = this._getCurrentSelection();
                if (!currentSelection) {
                    this.setState(old => {
                        var _a, _b;
                        return (Object.assign(Object.assign({}, old), { jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(), options: (_b = this.props.cpModel.sharedModel) === null || _b === void 0 ? void 0 : _b.options }));
                    });
                }
                else {
                    this.setState(old => {
                        var _a, _b;
                        return (Object.assign(Object.assign({}, old), { selectedNodes: currentSelection.newSelectedNodes, openNodes: currentSelection.newOpenNodes, jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(), options: (_b = this.props.cpModel.sharedModel) === null || _b === void 0 ? void 0 : _b.options }));
                    });
                }
            }
        };
        this._onClientSharedStateChanged = (sender, clients) => {
            const currentSelection = this._getCurrentSelection(clients);
            if (!currentSelection) {
                return;
            }
            const { newSelectedNodes, newOpenNodes } = currentSelection;
            const { selectedNodes, openNodes } = this.state;
            if (JSON.stringify(selectedNodes) !== JSON.stringify(newSelectedNodes) ||
                JSON.stringify(openNodes) !== JSON.stringify(newOpenNodes)) {
                this.setState(old => (Object.assign(Object.assign({}, old), { openNodes: newOpenNodes, selectedNodes: newSelectedNodes })));
            }
        };
        this._onClientSharedOptionsChanged = (sender, clients) => {
            this.setState(old => (Object.assign(Object.assign({}, old), { options: sender.sharedModel.options })));
        };
        this._handleRemoveObject = (objectId) => {
            var _a;
            const sharedModel = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.sharedModel;
            if (!sharedModel) {
                return;
            }
            handleRemoveObject(objectId, sharedModel, () => {
                var _a;
                (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.syncSelected({});
            });
        };
        this.state = {
            filePath: this.props.cpModel.filePath,
            jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(),
            selectedNodes: [],
            clientId: null,
            id: uuid(),
            openNodes: []
        };
        (_b = this.props.cpModel.jcadModel) === null || _b === void 0 ? void 0 : _b.sharedObjectsChanged.connect(this._sharedJcadModelChanged);
        this.props.cpModel.documentChanged.connect((_, document) => {
            if (document) {
                this.props.cpModel.disconnect(this._sharedJcadModelChanged);
                this.props.cpModel.disconnect(this._onClientSharedStateChanged);
                document.model.sharedObjectsChanged.connect(this._sharedJcadModelChanged);
                document.model.clientStateChanged.connect(this._onClientSharedStateChanged);
                document.model.sharedOptionsChanged.connect(this._onClientSharedOptionsChanged);
                const currentSelection = this._getCurrentSelection();
                if (!currentSelection) {
                    this.setState(old => {
                        var _a, _b;
                        return (Object.assign(Object.assign({}, old), { filePath: document.model.filePath, jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(), options: (_b = this.props.cpModel.sharedModel) === null || _b === void 0 ? void 0 : _b.options, clientId: document.model.getClientId() }));
                    });
                }
                else {
                    this.setState(old => {
                        var _a, _b;
                        return (Object.assign(Object.assign({}, old), { selectedNodes: currentSelection.newSelectedNodes, openNodes: currentSelection.newOpenNodes, filePath: document.model.filePath, jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(), options: (_b = this.props.cpModel.sharedModel) === null || _b === void 0 ? void 0 : _b.options, clientId: document.model.getClientId() }));
                    });
                }
            }
            else {
                this.setState({
                    filePath: undefined,
                    jcadObject: undefined,
                    jcadOption: undefined
                });
            }
        });
    }
    getObjectFromName(name) {
        if (name && this.state.jcadObject) {
            const obj = this.state.jcadObject.filter(o => o.name === name);
            if (obj.length > 0) {
                return obj[0];
            }
        }
    }
    _selectedNodes(selection) {
        const meshNames = new Set();
        for (const selectionName in selection) {
            const selected = selection[selectionName];
            if (selected.type === 'shape') {
                meshNames.add(selectionName);
            }
            else {
                meshNames.add(selected.parent);
            }
        }
        return Array.from(meshNames);
    }
    _getCurrentSelection(clients) {
        var _a, _b, _c;
        const localState = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.localState;
        if (!localState) {
            return;
        }
        let newSelectedNodes = [];
        if (clients && localState.remoteUser) {
            // We are in following mode.
            // Sync selections from a remote user
            const remoteState = clients.get(localState.remoteUser);
            if ((_b = remoteState === null || remoteState === void 0 ? void 0 : remoteState.selected) === null || _b === void 0 ? void 0 : _b.value) {
                newSelectedNodes = this._selectedNodes(remoteState.selected.value);
            }
        }
        else if ((_c = localState.selected) === null || _c === void 0 ? void 0 : _c.value) {
            newSelectedNodes = this._selectedNodes(localState.selected.value);
        }
        const newOpenNodes = [...this.state.openNodes];
        for (const selectedNode of newSelectedNodes) {
            if (selectedNode && newOpenNodes.indexOf(selectedNode) === -1) {
                newOpenNodes.push(selectedNode);
            }
        }
        return { newSelectedNodes, newOpenNodes };
    }
    render() {
        const { selectedNodes, openNodes } = this.state;
        const data = this.stateToTree();
        const selectedNodeIds = [];
        for (const selectedNode of selectedNodes) {
            const parentNode = data.filter(node => node.id === selectedNode);
            if (parentNode.length > 0 && parentNode[0].items.length > 0) {
                selectedNodeIds.push(parentNode[0].items[0].id);
            }
        }
        return (React.createElement("div", { className: "jpcad-treeview-wrapper jp-scrollbar-tiny", tabIndex: 0 },
            React.createElement(ReactTree, { multiSelect: true, nodes: data, openNodes: openNodes, selectedNodes: selectedNodeIds, messages: { noData: 'No data' }, theme: 'labTheme', themes: TREE_THEMES, onToggleSelectedNodes: id => {
                    var _a, _b;
                    if (id === selectedNodeIds) {
                        return;
                    }
                    if (id && id.length > 0) {
                        const newSelection = {};
                        for (const subid of id) {
                            const name = subid;
                            if (name.includes('#')) {
                                newSelection[name.split('#')[0]] = {
                                    type: 'shape'
                                };
                            }
                            else {
                                newSelection[name] = {
                                    type: 'shape'
                                };
                            }
                        }
                        (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.syncSelected(newSelection, this.state.id);
                    }
                    else {
                        (_b = this.props.cpModel.jcadModel) === null || _b === void 0 ? void 0 : _b.syncSelected({});
                    }
                }, RenderNode: opts => {
                    // const paddingLeft = 25 * (opts.level + 1);
                    const jcadObj = this.getObjectFromName(opts.node.parentId);
                    let visible = true;
                    if (jcadObj) {
                        visible = jcadObj.visible;
                    }
                    const isParentNode = opts.node.parentId === null;
                    return (React.createElement("div", { className: `jpcad-control-panel-tree ${opts.selected ? 'selected' : ''} ${isParentNode ? 'jpcad-object-tree-item' : ''}`, "data-object-name": isParentNode ? opts.node.id : null, onClick: () => this.handleNodeClick(opts.node.id) },
                        React.createElement("div", { style: {
                                paddingLeft: '5px',
                                minHeight: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                minWidth: 0
                            } },
                            React.createElement("span", { style: {
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflowX: 'hidden'
                                } }, opts.node.label),
                            opts.type === 'leaf' ? (React.createElement("div", { style: { display: 'flex' } },
                                React.createElement(ToolbarButtonComponent, { className: 'jp-ToolbarButtonComponent', onClick: () => {
                                        var _a;
                                        const objectId = opts.node.parentId;
                                        const obj = this.getObjectFromName(objectId);
                                        if (obj) {
                                            const sharedModel = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.sharedModel;
                                            if (sharedModel) {
                                                sharedModel.updateObjectByName(objectId, {
                                                    data: { key: 'visible', value: !obj.visible }
                                                });
                                            }
                                        }
                                    }, icon: visible ? visibilityIcon : visibilityOffIcon }),
                                React.createElement(ToolbarButtonComponent, { className: 'jp-ToolbarButtonComponent', onClick: () => {
                                        const objectId = opts.node.parentId;
                                        this._handleRemoveObject(objectId);
                                    }, icon: closeIcon }))) : null)));
                } })));
    }
}
