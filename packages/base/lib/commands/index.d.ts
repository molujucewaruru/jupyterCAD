import { IJCadFormSchemaRegistry, IJCadWorkerRegistry } from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { ITranslator } from '@jupyterlab/translation';
import { JupyterCadWidget } from '../widget';
/**
 * Add the FreeCAD commands to the application's command registry.
 */
export declare function addCommands(app: JupyterFrontEnd, tracker: WidgetTracker<JupyterCadWidget>, translator: ITranslator, formSchemaRegistry: IJCadFormSchemaRegistry, workerRegistry: IJCadWorkerRegistry, completionProviderManager: ICompletionProviderManager | undefined): void;
/**
 * The command IDs used by the FreeCAD plugin.
 */
export declare namespace CommandIDs {
    const redo = "jupytercad:redo";
    const undo = "jupytercad:undo";
    const newSketch = "jupytercad:sketch";
    const removeObject = "jupytercad:removeObject";
    const newBox = "jupytercad:newBox";
    const newCylinder = "jupytercad:newCylinder";
    const newSphere = "jupytercad:newSphere";
    const newCone = "jupytercad:newCone";
    const newTorus = "jupytercad:newTorus";
    const cut = "jupytercad:cut";
    const extrusion = "jupytercad:extrusion";
    const union = "jupytercad:union";
    const intersection = "jupytercad:intersection";
    const wireframe = "jupytercad:wireframe";
    const transform = "jupytercad:transform";
    const copyObject = "jupytercad:copyObject";
    const pasteObject = "jupytercad:pasteObject";
    const chamfer = "jupytercad:chamfer";
    const fillet = "jupytercad:fillet";
    const updateAxes = "jupytercad:updateAxes";
    const updateExplodedView = "jupytercad:updateExplodedView";
    const updateCameraSettings = "jupytercad:updateCameraSettings";
    const updateClipView = "jupytercad:updateClipView";
    const splitScreen = "jupytercad:splitScreen";
    const exportJcad = "jupytercad:exportJcad";
    const toggleConsole = "jupytercad:toggleConsole";
    const invokeCompleter = "jupytercad:invokeConsoleCompleter";
    const removeConsole = "jupytercad:removeConsole";
    const executeConsole = "jupytercad:executeConsole";
    const selectCompleter = "jupytercad:selectConsoleCompleter";
    const exportAsSTL = "jupytercad:stl:export-as-stl";
    const exportAsBREP = "jupytercad:stl:export-as-brep";
    const exportAsGLB = "jupytercad:export-as-glb";
}
