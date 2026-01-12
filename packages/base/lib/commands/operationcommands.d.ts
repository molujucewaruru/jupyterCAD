import { WidgetTracker } from '@jupyterlab/apputils';
import { IRenderMime } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@lumino/commands';
import { JupyterCadWidget } from '../widget';
export declare namespace ShapeCreationCommandIDs {
    const newBoxWithParams = "jupytercad:newBoxWithParams";
    const newCylinderWithParams = "jupytercad:newCylinderWithParams";
    const newSphereWithParams = "jupytercad:newSphereWithParams";
    const newConeWithParams = "jupytercad:newConeWithParams";
    const newTorusWithParams = "jupytercad:newTorusWithParams";
}
export declare const ShapeCreationCommandMap: {
    'Part::Box': string;
    'Part::Cylinder': string;
    'Part::Sphere': string;
    'Part::Cone': string;
    'Part::Torus': string;
};
export declare function addShapeCreationCommands(options: {
    tracker: WidgetTracker<JupyterCadWidget>;
    commands: CommandRegistry;
    trans: IRenderMime.TranslationBundle;
}): void;
export declare namespace DocumentActionCommandIDs {
    const undoWithParams = "jupytercad:undoWithParams";
    const redoWithParams = "jupytercad:redoWithParams";
    const removeObjectWithParams = "jupytercad:removeObjectWithParams";
    const editShapeWithParams = "jupytercad:editShapeWithParams";
}
export declare function addDocumentActionCommands(options: {
    tracker: WidgetTracker<JupyterCadWidget>;
    commands: CommandRegistry;
    trans: IRenderMime.TranslationBundle;
}): void;
export declare namespace ShapeOperationCommandIDs {
    const cutWithParams = "jupytercad:cutWithParamsWithParams";
    const extrusionWithParams = "jupytercad:extrusionWithParams";
    const unionWithParams = "jupytercad:unionWithParams";
    const intersectionWithParams = "jupytercad:intersectionWithParams";
    const chamferWithParams = "jupytercad:chamferWithParams";
    const filletWithParams = "jupytercad:filletWithParams";
}
export declare function addShapeOperationCommands(options: {
    tracker: WidgetTracker<JupyterCadWidget>;
    commands: CommandRegistry;
    trans: IRenderMime.TranslationBundle;
}): void;
export declare const ShapeOperationCommandMap: {
    'Part::Cut': string;
    'Part::Extrusion': string;
    'Part::Fillet': string;
    'Part::Chamfer': string;
    'Part::MultiFuse': string;
    'Part::MultiCommon': string;
};
