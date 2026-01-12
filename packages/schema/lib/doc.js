import { YDocument } from '@jupyter/ydoc';
import { JSONExt } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import * as Y from 'yjs';
import { SCHEMA_VERSION } from './_interface/version';
export class JupyterCadDoc extends YDocument {
    constructor() {
        super();
        this.editable = true;
        this._objectsObserver = (events) => {
            const changes = [];
            let needEmit = false;
            events.forEach(event => {
                const name = event.target.get('name');
                if (name) {
                    event.keys.forEach((change, key) => {
                        if (!needEmit && key !== 'shapeMetadata') {
                            needEmit = true;
                        }
                        changes.push({
                            name,
                            key: key,
                            newValue: JSONExt.deepCopy(event.target.toJSON())
                        });
                    });
                }
            });
            needEmit = changes.length === 0 ? true : needEmit;
            if (needEmit) {
                this._objectsChanged.emit({ objectChange: changes });
            }
            this._changed.emit({ objectChange: changes });
        };
        this._metaObserver = (event) => {
            const changes = new Map();
            event.changes.keys.forEach((event, key) => {
                changes.set(key, {
                    action: event.action,
                    oldValue: event.oldValue,
                    newValue: this._metadata.get(key)
                });
            });
            this._metadataChanged.emit(changes);
        };
        this._optionsObserver = (event) => {
            const changes = new Map();
            event.changes.keys.forEach((event, key) => {
                changes.set(key, {
                    action: event.action,
                    oldValue: event.oldValue,
                    newValue: this._options.get(key)
                });
            });
            this._optionsChanged.emit(changes);
        };
        this._metadataChanged = new Signal(this);
        this._optionsChanged = new Signal(this);
        this._objectsChanged = new Signal(this);
        this._options = this.ydoc.getMap('options');
        this._objects = this.ydoc.getArray('objects');
        this._metadata = this.ydoc.getMap('metadata');
        this._outputs = this.ydoc.getMap('outputs');
        this.undoManager.addToScope(this._objects);
        this._objects.observeDeep(this._objectsObserver);
        this._metadata.observe(this._metaObserver);
        this._options.observe(this._optionsObserver);
    }
    dispose() {
        super.dispose();
    }
    get version() {
        return SCHEMA_VERSION;
    }
    get objects() {
        const objs = this._objects.map(obj => JSONExt.deepCopy(obj.toJSON()));
        return objs;
    }
    get options() {
        return JSONExt.deepCopy(this._options.toJSON());
    }
    get metadata() {
        return JSONExt.deepCopy(this._metadata.toJSON());
    }
    get outputs() {
        return JSONExt.deepCopy(this._outputs.toJSON());
    }
    get objectsChanged() {
        return this._objectsChanged;
    }
    get optionsChanged() {
        return this._optionsChanged;
    }
    getSource() {
        const objects = this._objects.toJSON();
        const options = this._options.toJSON();
        const metadata = this._metadata.toJSON();
        const outputs = this._outputs.toJSON();
        return { objects, options, metadata, outputs };
    }
    setSource(source) {
        if (!source) {
            return;
        }
        let value;
        if (typeof source === 'string') {
            value = JSON.parse(source);
        }
        else {
            value = source;
        }
        this.transact(() => {
            var _a, _b, _c, _d;
            const objects = ((_a = value['objects']) !== null && _a !== void 0 ? _a : []);
            objects.forEach(obj => {
                this._objects.push([new Y.Map(Object.entries(obj))]);
            });
            const options = (_b = value['options']) !== null && _b !== void 0 ? _b : {};
            Object.entries(options).forEach(([key, val]) => this._options.set(key, val));
            const metadata = (_c = value['metadata']) !== null && _c !== void 0 ? _c : {};
            Object.entries(metadata).forEach(([key, val]) => this._metadata.set(key, val));
            const outputs = (_d = value['outputs']) !== null && _d !== void 0 ? _d : {};
            Object.entries(outputs).forEach(([key, val]) => this._outputs.set(key, val));
        });
    }
    get metadataChanged() {
        return this._metadataChanged;
    }
    objectExists(name) {
        return Boolean(this._getObjectAsYMapByName(name));
    }
    getObjectByName(name) {
        const obj = this._getObjectAsYMapByName(name);
        if (obj) {
            return JSONExt.deepCopy(obj.toJSON());
        }
        return undefined;
    }
    getDependants(name) {
        const dependants = [];
        const dependantMap = new Map();
        for (const obj of this._objects) {
            const deps = obj.get('dependencies') || [];
            const objName = obj.get('name');
            deps.forEach(dep => {
                const currentSet = dependantMap.get(dep);
                if (currentSet) {
                    currentSet.add(objName);
                }
                else {
                    dependantMap.set(dep, new Set([objName]));
                }
            });
        }
        const selectedDeps = dependantMap.get(name);
        if (!selectedDeps) {
            return [];
        }
        while (selectedDeps.size) {
            const depsList = [...selectedDeps];
            depsList.forEach(it => {
                var _a;
                dependants.push(it);
                selectedDeps.delete(it);
                (_a = dependantMap.get(it)) === null || _a === void 0 ? void 0 : _a.forEach(newIt => selectedDeps.add(newIt));
            });
        }
        return dependants;
    }
    removeObjects(names) {
        this.transact(() => {
            for (const name of names) {
                this.removeObjectByName(name);
            }
        });
    }
    removeObjectByName(name) {
        // Get object index
        let index = 0;
        for (const obj of this._objects) {
            if (obj.get('name') === name) {
                break;
            }
            index++;
        }
        if (this._objects.length > index) {
            this._objects.delete(index);
            this.removeOutput(name);
        }
    }
    addObject(value) {
        this.addObjects([value]);
    }
    addObjects(value) {
        this.transact(() => {
            value.map(obj => {
                if (!this.objectExists(obj.name)) {
                    this._objects.push([new Y.Map(Object.entries(obj))]);
                }
                else {
                    console.error('There is already an object with the name:', obj.name);
                }
            });
        });
    }
    updateObjectByName(name, payload) {
        const obj = this._getObjectAsYMapByName(name);
        if (!obj) {
            return;
        }
        const { key, value } = payload.data;
        this.transact(() => {
            // Special case for changing parameters, we may need to update dependencies
            if (key === 'parameters') {
                switch (obj.get('shape')) {
                    case 'Part::Cut': {
                        obj.set('dependencies', [value['Base'], value['Tool']]);
                        break;
                    }
                    case 'Part::Extrusion':
                    case 'Part::Fillet':
                    case 'Part::Chamfer': {
                        obj.set('dependencies', [value['Base']]);
                        break;
                    }
                    case 'Part::MultiCommon':
                    case 'Part::MultiFuse': {
                        obj.set('dependencies', value['Shapes']);
                        break;
                    }
                    default:
                        break;
                }
            }
            obj.set(key, value);
            if (payload.meta) {
                obj.set('shapeMetadata', payload.meta);
            }
        });
    }
    getOption(key) {
        const content = this._options.get(key);
        if (!content) {
            return;
        }
        return JSONExt.deepCopy(content);
    }
    setOption(key, value) {
        this.transact(() => void this._options.set(key, value));
    }
    setOptions(options) {
        this.transact(() => {
            for (const [key, value] of Object.entries(options)) {
                this._options.set(key, value);
            }
        });
    }
    getMetadata(key) {
        return this._metadata.get(key);
    }
    setMetadata(key, value) {
        this.transact(() => void this._metadata.set(key, value));
    }
    removeMetadata(key) {
        if (this._metadata.has(key)) {
            this._metadata.delete(key);
        }
    }
    getOutput(key) {
        return this._outputs.get(key);
    }
    setOutput(key, value) {
        this.transact(() => void this._outputs.set(key, value));
    }
    removeOutput(key) {
        if (this._outputs.has(key)) {
            this._outputs.delete(key);
        }
    }
    setShapeMeta(name, meta) {
        const obj = this._getObjectAsYMapByName(name);
        if (meta && obj) {
            this.transact(() => void obj.set('shapeMetadata', meta));
        }
    }
    static create() {
        return new JupyterCadDoc();
    }
    _getObjectAsYMapByName(name) {
        for (const obj of this._objects) {
            if (obj.get('name') === name) {
                return obj;
            }
        }
        return undefined;
    }
}
