import { ReactWidget } from '@jupyterlab/apputils';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import * as React from 'react';
import { v4 as uuid } from 'uuid';
import { focusInputField, itemFromName, removeStyleFromProperty } from '../tools';
import { ObjectPropertiesForm } from './formbuilder';
export class ObjectProperties extends PanelWithToolbar {
    constructor(params) {
        super(params);
        const { controlPanelModel, formSchemaRegistry, tracker } = params;
        this.title.label = 'Objects Properties';
        const body = ReactWidget.create(React.createElement(ObjectPropertiesReact, { cpModel: controlPanelModel, tracker: tracker, formSchemaRegistry: formSchemaRegistry }));
        this.addWidget(body);
        this.addClass('jpcad-sidebar-propertiespanel');
        const updateTitle = (sender, clients) => {
            var _a, _b, _c;
            const localState = sender.localState;
            if (!localState) {
                return;
            }
            let selection = {};
            if (localState.remoteUser) {
                // We are in following mode.
                // Sync selections from a remote user
                const remoteState = clients.get(localState.remoteUser);
                if ((_a = remoteState === null || remoteState === void 0 ? void 0 : remoteState.selected) === null || _a === void 0 ? void 0 : _a.value) {
                    selection = (_b = remoteState === null || remoteState === void 0 ? void 0 : remoteState.selected) === null || _b === void 0 ? void 0 : _b.value;
                }
            }
            else if ((_c = localState.selected) === null || _c === void 0 ? void 0 : _c.value) {
                selection = localState.selected.value;
            }
            const selectionNames = Object.keys(selection);
            if (selectionNames.length === 1) {
                const selected = selectionNames[0];
                if (selected.startsWith('edge-') && selection[selected].parent) {
                    this.title.label = selection[selected].parent;
                }
                else {
                    this.title.label = selected;
                }
            }
            else {
                this.title.label = 'No selection';
            }
        };
        let currentModel = undefined;
        controlPanelModel.documentChanged.connect((_, changed) => {
            if (changed) {
                if (currentModel) {
                    currentModel.clientStateChanged.disconnect(updateTitle);
                }
                if (changed.model.sharedModel.editable) {
                    currentModel = changed.model;
                    const clients = currentModel === null || currentModel === void 0 ? void 0 : currentModel.sharedModel.awareness.getStates();
                    updateTitle(currentModel, clients);
                    currentModel === null || currentModel === void 0 ? void 0 : currentModel.clientStateChanged.connect(updateTitle);
                    body.show();
                }
                else {
                    this.title.label = 'Read Only File';
                    body.hide();
                }
            }
            else {
                this.title.label = '-';
            }
        });
    }
}
class ObjectPropertiesReact extends React.Component {
    constructor(props) {
        var _a, _b, _c;
        super(props);
        this.syncSelectedField = (id, value, parentType) => {
            var _a;
            let property = null;
            if (id) {
                const prefix = id.split('_')[0];
                property = id.substring(prefix.length);
            }
            (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.syncSelectedPropField({
                parentType,
                id: property,
                value
            });
        };
        this._sharedJcadModelChanged = (_, changed) => {
            this.setState(old => {
                var _a, _b;
                if (old.selectedObject) {
                    const jcadObject = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject();
                    if (jcadObject) {
                        const selectedObj = itemFromName(old.selectedObject, jcadObject);
                        if (!selectedObj) {
                            return old;
                        }
                        const selectedObjectData = selectedObj['parameters'];
                        return Object.assign(Object.assign({}, old), { jcadObject: jcadObject, selectedObjectData });
                    }
                    else {
                        return old;
                    }
                }
                else {
                    return Object.assign(Object.assign({}, old), { jcadObject: (_b = this.props.cpModel.jcadModel) === null || _b === void 0 ? void 0 : _b.getAllObject() });
                }
            });
        };
        this._onClientSharedStateChanged = (sender, clients) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const remoteUser = (_b = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.localState) === null || _b === void 0 ? void 0 : _b.remoteUser;
            const clientId = this.state.clientId;
            let newState;
            if (remoteUser) {
                newState = clients.get(remoteUser);
                const id = (_c = newState === null || newState === void 0 ? void 0 : newState.selectedPropField) === null || _c === void 0 ? void 0 : _c.id;
                const value = (_d = newState === null || newState === void 0 ? void 0 : newState.selectedPropField) === null || _d === void 0 ? void 0 : _d.value;
                const parentType = (_e = newState === null || newState === void 0 ? void 0 : newState.selectedPropField) === null || _e === void 0 ? void 0 : _e.parentType;
                if (parentType === 'panel') {
                    this._lastSelectedPropFieldId = focusInputField(`${this.state.filePath}::panel`, id, value, (_f = newState === null || newState === void 0 ? void 0 : newState.user) === null || _f === void 0 ? void 0 : _f.color, this._lastSelectedPropFieldId);
                }
            }
            else {
                const localState = clientId ? clients.get(clientId) : null;
                if (this._lastSelectedPropFieldId) {
                    removeStyleFromProperty(`${this.state.filePath}::panel`, this._lastSelectedPropFieldId, ['border-color', 'box-shadow']);
                    this._lastSelectedPropFieldId = undefined;
                }
                if (localState &&
                    ((_g = localState.selected) === null || _g === void 0 ? void 0 : _g.emitter) &&
                    localState.selected.emitter !== this.state.id &&
                    ((_h = localState.selected) === null || _h === void 0 ? void 0 : _h.value)) {
                    newState = localState;
                }
            }
            if (newState) {
                const selection = newState.selected.value;
                const selectedObjectNames = Object.keys(selection || {});
                // Only show object properties if ONE object is selected and it's a shape
                if (selection === undefined || selectedObjectNames.length !== 1) {
                    this.setState(old => (Object.assign(Object.assign({}, old), { schema: undefined, selectedObject: '', selectedObjectData: undefined })));
                    return;
                }
                let selectedObject = selectedObjectNames[0];
                if (selection[selectedObject] &&
                    selection[selectedObject].type !== 'shape') {
                    selectedObject = selection[selectedObject].parent;
                }
                if (selectedObject !== this.state.selectedObject) {
                    const objectData = (_j = this.props.cpModel.jcadModel) === null || _j === void 0 ? void 0 : _j.getAllObject();
                    if (objectData) {
                        let schema;
                        const selectedObj = itemFromName(selectedObject, objectData);
                        if (!selectedObj) {
                            return;
                        }
                        if (selectedObj.shape) {
                            schema = this._formSchema.get(selectedObj.shape);
                        }
                        const selectedObjectData = selectedObj['parameters'];
                        this.setState(old => (Object.assign(Object.assign({}, old), { selectedObjectData,
                            selectedObject,
                            schema })));
                    }
                }
            }
            else {
                this.setState(old => (Object.assign(Object.assign({}, old), { schema: undefined, selectedObject: '', selectedObjectData: undefined })));
            }
        };
        this.state = {
            filePath: this.props.cpModel.filePath,
            jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(),
            clientId: null,
            id: uuid()
        };
        this._formSchema = props.formSchemaRegistry.getSchemas();
        (_b = this.props.cpModel.jcadModel) === null || _b === void 0 ? void 0 : _b.sharedObjectsChanged.connect(this._sharedJcadModelChanged);
        (_c = this.props.cpModel.jcadModel) === null || _c === void 0 ? void 0 : _c.sharedModelSwapped.connect(this._sharedModelSwappedHandler, this);
        this.props.cpModel.documentChanged.connect((_, changed) => {
            if (changed) {
                this.props.cpModel.disconnect(this._sharedJcadModelChanged);
                this.props.cpModel.disconnect(this._onClientSharedStateChanged);
                const currentModel = changed.model;
                currentModel.sharedObjectsChanged.connect(this._sharedJcadModelChanged);
                currentModel.sharedModelSwapped.connect(this._sharedModelSwappedHandler, this);
                const clients = currentModel.sharedModel.awareness.getStates();
                this.setState(old => {
                    var _a;
                    return ({
                        jcadOption: undefined,
                        selectedObjectData: undefined,
                        selectedObject: undefined,
                        schema: undefined,
                        filePath: changed.model.filePath,
                        jcadObject: (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject(),
                        clientId: currentModel.getClientId()
                    });
                }, () => {
                    this._onClientSharedStateChanged(currentModel, clients);
                    currentModel.clientStateChanged.connect(this._onClientSharedStateChanged);
                });
            }
            else {
                this.setState({
                    jcadOption: undefined,
                    filePath: undefined,
                    jcadObject: undefined,
                    selectedObjectData: undefined,
                    selectedObject: undefined,
                    schema: undefined
                });
            }
        });
    }
    async syncObjectProperties(objectName, properties) {
        if (!this.state.jcadObject || !objectName) {
            return;
        }
        const currentWidget = this.props.tracker
            .currentWidget;
        if (!currentWidget) {
            return;
        }
        const model = this.props.cpModel.jcadModel;
        if (!model) {
            return;
        }
        currentWidget.content.currentViewModel.maybeUpdateObjectParameters(objectName, properties);
    }
    _sharedModelSwappedHandler(sender) {
        const clientId = sender.getClientId();
        this.setState(old => (Object.assign(Object.assign({}, old), { clientId })));
    }
    render() {
        var _a;
        // Fill form schema with available objects
        const form_schema = this.state.schema;
        if (form_schema) {
            const allObjects = (_a = this.props.cpModel.jcadModel) === null || _a === void 0 ? void 0 : _a.getAllObject().reduce((all, o) => {
                o.name !== this.state.selectedObject && all.push(o.name);
                return all;
            }, []);
            for (const prop in form_schema['properties']) {
                const fcType = form_schema['properties'][prop]['fcType'];
                if (fcType) {
                    const propDef = form_schema['properties'][prop];
                    switch (fcType) {
                        case 'App::PropertyLink':
                            propDef['enum'] = allObjects;
                            break;
                        case 'App::PropertyLinkList':
                            propDef['items']['enum'] = allObjects;
                            break;
                        default:
                    }
                }
            }
        }
        return this.state.schema && this.state.selectedObjectData ? (React.createElement(ObjectPropertiesForm, { parentType: "panel", filePath: `${this.state.filePath}::panel`, schema: form_schema, sourceData: this.state.selectedObjectData, syncData: (properties) => {
                this.syncObjectProperties(this.state.selectedObject, properties);
            }, syncSelectedField: this.syncSelectedField })) : (React.createElement("div", null));
    }
}
