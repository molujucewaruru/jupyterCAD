import { OCC } from '@jupytercad/opencascade';
export declare function _writeBrep(shape: OCC.TopoDS_Shape): string;
export declare function _loadBrepFile(content: string): OCC.TopoDS_Shape | undefined;
