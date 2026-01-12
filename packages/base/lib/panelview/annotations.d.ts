import { IAnnotationModel } from '@jupytercad/schema';
import { PanelWithToolbar } from '@jupyterlab/ui-components';
import * as React from 'react';
interface IProps {
    model: IAnnotationModel;
}
export declare class ReactAnnotations extends React.Component<IProps> {
    constructor(props: IProps);
    render(): JSX.Element;
    private _model;
}
export declare class Annotations extends PanelWithToolbar {
    constructor(options: Annotations.IOptions);
    private _widget;
    private _model;
}
export declare namespace Annotations {
    interface IOptions {
        model: IAnnotationModel;
    }
}
export {};
