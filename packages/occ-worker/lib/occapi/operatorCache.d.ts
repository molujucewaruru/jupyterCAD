import { OCC } from '@jupytercad/opencascade';
import { IJCadContent, IShapeMetadata, Parts } from '@jupytercad/schema';
import { IDict } from '../types';
export declare function expand_operator(name: Parts | 'ObjectFile', args: any, content: IJCadContent): IDict;
export declare function shape_meta_data(shape: OCC.TopoDS_Shape): IShapeMetadata;
export declare function operatorCache<T>(name: Parts | 'ObjectFile', ops: (args: T, content: IJCadContent) => OCC.TopoDS_Shape | undefined): (args: T, content: IJCadContent) => {
    occShape: OCC.TopoDS_Shape;
    metadata?: IShapeMetadata | undefined;
} | undefined;
