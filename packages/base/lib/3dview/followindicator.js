import * as React from 'react';
export function FollowIndicator(props) {
    var _a;
    return ((_a = props.remoteUser) === null || _a === void 0 ? void 0 : _a.display_name) ? (React.createElement("div", { style: {
            position: 'absolute',
            top: 1,
            right: 3,
            background: props.remoteUser.color
        } }, `Following ${props.remoteUser.display_name}`)) : null;
}
