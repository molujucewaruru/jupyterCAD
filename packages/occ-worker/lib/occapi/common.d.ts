import { OCC } from '@jupytercad/opencascade';
import { Parts } from '@jupytercad/schema';
import { IAllOperatorFunc } from '../types';
export declare function getOcc(): OCC.OpenCascadeInstance;
export declare function toRad(deg: number): number;
export declare function toDeg(rad: number): number;
export declare function setShapePlacement(shape: OCC.TopoDS_Shape, placement?: {
    Position: number[];
    Axis: number[];
    Angle: number;
}): OCC.TopoDS_Shape;
export declare function getShapesFactory(): {
    "Part::Any": IAllOperatorFunc | undefined;
    "Part::Box": IAllOperatorFunc | undefined;
    "Part::Cylinder": IAllOperatorFunc | undefined;
    "Part::Sphere": IAllOperatorFunc | undefined;
    "Part::Cone": IAllOperatorFunc | undefined;
    "Part::Torus": IAllOperatorFunc | undefined;
    "Part::Cut": IAllOperatorFunc | undefined;
    "Part::MultiFuse": IAllOperatorFunc | undefined;
    "Part::MultiCommon": IAllOperatorFunc | undefined;
    "Part::Extrusion": IAllOperatorFunc | undefined;
    "Part::Chamfer": IAllOperatorFunc | undefined;
    "Part::Fillet": IAllOperatorFunc | undefined;
    "Sketcher::SketchObject": IAllOperatorFunc | undefined;
    "Post::Operator": IAllOperatorFunc | undefined;
};
export declare function setShapesFactory(key: Parts, value: IAllOperatorFunc): void;
