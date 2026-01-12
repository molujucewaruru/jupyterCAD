import { IAnnotation, IAnnotationModel, IJupyterCadModel } from '@jupytercad/schema';
import { User } from '@jupyterlab/services';
import { ISignal } from '@lumino/signaling';
export declare class AnnotationModel implements IAnnotationModel {
    constructor(options: AnnotationModel.IOptions);
    get updateSignal(): ISignal<this, null>;
    get user(): User.IIdentity | undefined;
    set model(model: IJupyterCadModel | undefined);
    get model(): IJupyterCadModel | undefined;
    get modelChanged(): ISignal<this, void>;
    update(): void;
    getAnnotation(id: string): IAnnotation | undefined;
    getAnnotationIds(): string[];
    addAnnotation(key: string, value: IAnnotation): void;
    removeAnnotation(key: string): void;
    addContent(id: string, value: string): void;
    private _model;
    private _modelChanged;
    private _updateSignal;
    private _user?;
}
declare namespace AnnotationModel {
    interface IOptions {
        model: IJupyterCadModel | undefined;
    }
}
export {};
