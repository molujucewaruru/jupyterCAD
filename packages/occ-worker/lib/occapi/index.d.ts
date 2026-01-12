import { IAny, IBox, IChamfer, IFillet, ICone, ICut, ICylinder, IExtrusion, IFuse, IIntersection, ISketchObject, ISphere, ITorus } from '@jupytercad/schema';
export declare const Any: (args: IAny, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Box: (args: IBox, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Cylinder: (args: ICylinder, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Sphere: (args: ISphere, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Cone: (args: ICone, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Torus: (args: ITorus, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const SketchObject: (args: ISketchObject, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Cut: (args: ICut, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Fuse: (args: IFuse, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Intersection: (args: IIntersection, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Extrude: (args: IExtrusion, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Chamfer: (args: IChamfer, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const Fillet: (args: IFillet, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare const ObjectFile: (args: {
    content: string;
    type: IAny["Type"];
    placement?: {
        Position: number[];
        Axis: number[];
        Angle: number;
    };
}, content: import("@jupytercad/schema").IJCadContent) => {
    occShape: import("@jupytercad/opencascade/lib/jupytercad.opencascade").TopoDS_Shape;
    metadata?: import("@jupytercad/schema").IShapeMetadata | undefined;
} | undefined;
export declare function initShapesFactory(): void;
export { getShapesFactory } from './common';
