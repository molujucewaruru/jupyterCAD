import React from 'react';
const CustomArrayField = props => {
    const { formData = [], name, required, schema, errorSchema = {}, onChange, onBlur } = props;
    const handleInputChange = (index, value) => {
        const updatedValue = [...formData];
        updatedValue[index] = value;
        onChange(updatedValue);
    };
    const renderInputField = (value, index) => {
        const { enum: enumOptions, type: itemType } = schema.items || {};
        if (enumOptions) {
            return (React.createElement("select", { value: value || '', required: required, onChange: e => handleInputChange(index, e.target.value), onBlur: () => onBlur(name, value) }, enumOptions.map((option, i) => (React.createElement("option", { key: i, value: option }, option)))));
        }
        else if (itemType === 'number') {
            return (React.createElement("input", { type: "number", value: value, step: "any", required: required, onChange: e => handleInputChange(index, e.target.value === '' ? null : parseFloat(e.target.value)), onBlur: () => onBlur(name, value) }));
        }
        else if (itemType === 'boolean') {
            return (React.createElement("input", { type: "checkbox", checked: !!value, onChange: e => handleInputChange(index, e.target.checked), onBlur: () => onBlur(name, value) }));
        }
        else {
            return (React.createElement("input", { type: "text", value: value, required: required, onChange: e => handleInputChange(index, e.target.value), onBlur: () => onBlur(name, value) }));
        }
    };
    return (React.createElement("fieldset", null,
        React.createElement("legend", null, name),
        React.createElement("p", { className: "field-description" }, schema.description),
        React.createElement("div", { className: "custom-array-wrapper" }, formData.map((value, index) => {
            var _a, _b, _c;
            return (React.createElement("div", { key: index, className: "array-item" },
                renderInputField(value, index),
                ((_b = (_a = errorSchema === null || errorSchema === void 0 ? void 0 : errorSchema[index]) === null || _a === void 0 ? void 0 : _a.__errors) === null || _b === void 0 ? void 0 : _b.length) > 0 && (React.createElement("div", { className: "validationErrors" }, (_c = errorSchema === null || errorSchema === void 0 ? void 0 : errorSchema[index]) === null || _c === void 0 ? void 0 : _c.__errors.map((error, errorIndex) => (React.createElement("div", { key: `${index}-${errorIndex}`, className: "error" }, error)))))));
        }))));
};
export default CustomArrayField;
