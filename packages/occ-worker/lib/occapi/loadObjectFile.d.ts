import { OCC } from '@jupytercad/opencascade';
import { IAny } from '@jupytercad/schema';
export declare function _loadObjectFile(arg: {
    content: string;
    type: IAny['Type'];
    placement?: {
        Position: number[];
        Axis: number[];
        Angle: number;
    };
}): OCC.TopoDS_Shape | undefined;
