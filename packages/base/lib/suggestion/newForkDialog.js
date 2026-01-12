import * as React from 'react';
export function NewForkDialog(props) {
    const { setForkLabel } = props;
    const [label, setLabel] = React.useState('New suggestion');
    const updateLabel = React.useCallback(value => {
        setLabel(value);
        setForkLabel(value);
    }, [setForkLabel]);
    return (React.createElement("div", null,
        React.createElement("p", { className: "field-description" }, "Label of the suggestion"),
        React.createElement("input", { className: "form-control jp-mod-styled", style: { width: '100%' }, value: label, onChange: e => updateLabel(e.target.value), type: "text", placeholder: "New suggestion" })));
}
