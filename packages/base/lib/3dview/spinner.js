import * as React from 'react';
export function Spinner(props) {
    return (React.createElement("div", { className: 'jpcad-Spinner', style: { display: props.loading ? 'flex' : 'none' } },
        React.createElement("div", { className: 'jpcad-SpinnerContent' })));
}
