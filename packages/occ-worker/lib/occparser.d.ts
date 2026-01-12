import { IJCadObject, IParsedShape } from '@jupytercad/schema';
import { IDict, IOperatorFuncOutput } from './types';
interface IShapeList {
    shapeData: IOperatorFuncOutput;
    jcObject: IJCadObject;
}
export declare class OccParser {
    private _shapeList;
    private _occ;
    constructor(shapeList: IShapeList[]);
    execute(raiseOnFailure?: boolean): IDict<IParsedShape>;
    private _shouldComputeEdge;
    private _shouldComputeWire;
    private _build_wire_mesh;
    private _build_face_mesh;
    private _build_edge_mesh;
}
export {};
