var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { FormComponent } from '@jupyterlab/ui-components';
import validatorAjv8 from '@rjsf/validator-ajv8';
import CustomArrayField from './customarrayfield';
const WrappedFormComponent = (props) => {
    const { fields } = props, rest = __rest(props, ["fields"]);
    return (React.createElement(FormComponent, Object.assign({}, rest, { validator: validatorAjv8, fields: Object.assign(Object.assign({}, fields), { ArrayField: CustomArrayField }) })));
};
export class ObjectPropertiesForm extends React.Component {
    constructor(props) {
        super(props);
        this.setStateByKey = (key, value) => {
            const floatValue = parseFloat(value);
            if (Number.isNaN(floatValue)) {
                return;
            }
            this.setState(old => (Object.assign(Object.assign({}, old), { internalData: Object.assign(Object.assign({}, old.internalData), { [key]: floatValue }) })), () => this.props.syncData({ [key]: floatValue }));
        };
        this.onFormSubmit = (e) => {
            const internalData = Object.assign({}, this.state.internalData);
            Object.entries(e.formData).forEach(([k, v]) => (internalData[k] = v));
            this.setState(old => (Object.assign(Object.assign({}, old), { internalData })), () => {
                this.props.syncData(e.formData);
                this.props.cancel && this.props.cancel();
            });
        };
        this.state = {
            internalData: Object.assign({}, this.props.sourceData),
            schema: props.schema
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.sourceData !== this.props.sourceData) {
            this.setState(old => (Object.assign(Object.assign({}, old), { internalData: this.props.sourceData })));
        }
        if (prevProps.schema !== this.props.schema) {
            this.setState(old => (Object.assign(Object.assign({}, old), { schema: this.props.schema })));
        }
    }
    buildForm() {
        if (!this.props.sourceData || !this.state.internalData) {
            return [];
        }
        const inputs = [];
        for (const [key, value] of Object.entries(this.props.sourceData)) {
            let input;
            if (typeof value === 'string' || typeof value === 'number') {
                input = (React.createElement("div", { key: key },
                    React.createElement("label", { htmlFor: "" }, key),
                    React.createElement("input", { type: "number", value: this.state.internalData[key], onChange: e => this.setStateByKey(key, e.target.value) })));
                inputs.push(input);
            }
        }
        return inputs;
    }
    removeArrayButton(schema, uiSchema) {
        Object.entries(schema['properties']).forEach(([k, v]) => {
            if (v['type'] === 'array') {
                uiSchema[k] = {
                    'ui:options': {
                        orderable: false,
                        removable: false,
                        addable: false
                    }
                };
            }
            else if (v['type'] === 'object') {
                uiSchema[k] = {};
                this.removeArrayButton(v, uiSchema[k]);
            }
            uiSchema['Color'] = {
                'ui:widget': 'color'
            };
        });
    }
    generateUiSchema(schema) {
        const uiSchema = {
            additionalProperties: {
                'ui:label': false,
                classNames: 'jpcad-hidden-field'
            }
        };
        this.removeArrayButton(schema, uiSchema);
        return uiSchema;
    }
    render() {
        var _a;
        if (this.props.schema) {
            const schema = Object.assign(Object.assign({}, this.props.schema), { additionalProperties: true });
            const submitRef = React.createRef();
            return (React.createElement("div", { className: "jpcad-property-panel", "data-path": (_a = this.props.filePath) !== null && _a !== void 0 ? _a : '', 
                // Prevent any key press from propagating to other elements
                onKeyDown: (e) => {
                    e.stopPropagation();
                } },
                React.createElement("div", { className: "jpcad-property-outer jp-scrollbar-tiny", onKeyUp: (e) => {
                        var _a;
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            (_a = submitRef.current) === null || _a === void 0 ? void 0 : _a.click();
                        }
                    } },
                    React.createElement(WrappedFormComponent, { schema: schema, uiSchema: this.generateUiSchema(this.props.schema), formData: this.state.internalData, onSubmit: this.onFormSubmit, liveValidate: true, onFocus: (id, value) => {
                            this.props.syncSelectedField
                                ? this.props.syncSelectedField(id, value, this.props.parentType)
                                : null;
                        }, onBlur: (id, value) => {
                            this.props.syncSelectedField
                                ? this.props.syncSelectedField(null, value, this.props.parentType)
                                : null;
                        }, children: React.createElement("button", { ref: submitRef, type: "submit", style: { display: 'none' } }) })),
                React.createElement("div", { className: "jpcad-property-buttons" },
                    this.props.cancel ? (React.createElement("button", { className: "jp-Dialog-button jp-mod-reject jp-mod-styled", onClick: this.props.cancel },
                        React.createElement("div", { className: "jp-Dialog-buttonLabel" }, "Cancel"))) : null,
                    React.createElement("button", { className: "jp-Dialog-button jp-mod-accept jp-mod-styled", type: "button", onClick: () => {
                            var _a;
                            (_a = submitRef.current) === null || _a === void 0 ? void 0 : _a.click();
                        } },
                        React.createElement("div", { className: "jp-Dialog-buttonLabel" }, "Submit")))));
        }
        else {
            return React.createElement("div", null, this.buildForm());
        }
    }
}
