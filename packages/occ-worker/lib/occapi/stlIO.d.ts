import { OCC } from '@jupytercad/opencascade';
export declare function _loadStlFile(content: string): OCC.TopoDS_Shape | undefined;
export declare function _writeStlFile(shape: OCC.TopoDS_Shape, linearDeflection?: number, angularDeflection?: number): string;
