import { PanelWithToolbar, ReactWidget } from '@jupyterlab/ui-components';
import * as React from 'react';
import { Annotation } from '../annotation/view';
export class ReactAnnotations extends React.Component {
    constructor(props) {
        super(props);
        const updateCallback = () => {
            this.forceUpdate();
        };
        this._model = props.model;
        this._model.modelChanged.connect(async () => {
            // await this._model?.model?.ready;
            var _a, _b, _c, _d;
            (_b = (_a = this._model) === null || _a === void 0 ? void 0 : _a.model) === null || _b === void 0 ? void 0 : _b.sharedMetadataChanged.disconnect(updateCallback);
            this._model = props.model;
            (_d = (_c = this._model) === null || _c === void 0 ? void 0 : _c.model) === null || _d === void 0 ? void 0 : _d.sharedMetadataChanged.connect(updateCallback);
            this.forceUpdate();
        });
    }
    render() {
        var _a;
        const annotationIds = (_a = this._model) === null || _a === void 0 ? void 0 : _a.getAnnotationIds();
        if (!annotationIds || !this._model) {
            return React.createElement("div", null);
        }
        const annotations = annotationIds.map((id) => {
            return (React.createElement("div", null,
                React.createElement(Annotation, { model: this._model, itemId: id }),
                React.createElement("hr", { className: "jpcad-Annotations-Separator" })));
        });
        return React.createElement("div", null, annotations);
    }
}
export class Annotations extends PanelWithToolbar {
    constructor(options) {
        super({});
        this.title.label = 'Annotations';
        this.addClass('jpcad-Annotations');
        this._model = options.model;
        this._widget = ReactWidget.create(React.createElement(ReactAnnotations, { model: this._model }));
        this.addWidget(this._widget);
    }
}
