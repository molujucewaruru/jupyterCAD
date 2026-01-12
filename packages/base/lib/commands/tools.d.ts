import { IDryRunResponsePayload, IJCadContent, IJCadObject, IJupyterCadDoc, IJupyterCadModel, ISelection } from '@jupytercad/schema';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { MainViewModel } from '../3dview/mainviewmodel';
import { JupyterCadWidget } from '../widget';
export declare const DEFAULT_PLACEMENT_SCHEMA: {
    type: string;
    description: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        Position: {
            type: string;
            description: string;
            items: {
                type: string;
            };
            default: number[];
        };
        Axis: {
            type: string;
            description: string;
            items: {
                type: string;
            };
            default: number[];
        };
        Angle: {
            type: string;
            description: string;
            default: number;
        };
    };
};
/**
 * Generates a new unique name for an object based on the given type.
 * @param type The type of object (e.g., 'Box', 'Cylinder')
 * @param model The JupyterCad model containing the shared model
 * @returns A unique name for the new object
 */
export declare function newName(type: string, model: IJupyterCadModel): string;
/**
 * Performs a dry run check to verify if an operation can be performed.
 * @param options Configuration options for the dry run
 * @param options.jcadContent The JCad content to check
 * @param options.mainView The main view model
 * @param options.requestedOperator The operator being checked
 * @returns The dry run response payload if successful, null otherwise
 */
export declare function dryRunCheck(options: {
    jcadContent: IJCadContent;
    mainView: MainViewModel;
    requestedOperator: string;
}): Promise<IDryRunResponsePayload | null>;
/**
 * Gets the name of the selected object from the application context or model.
 * @param app The JupyterFrontEnd application instance
 * @param model The JupyterCad model
 * @param objectNames Array of available object names
 * @returns The name of the selected object
 */
export declare function getSelectedObject(app: JupyterFrontEnd, model: IJupyterCadModel, objectNames: string[]): string;
/**
 * Sets the visibility of an object in the shared model.
 * @param sharedModel The shared JupyterCad document model
 * @param name The name of the object to update
 * @param value The visibility value to set
 */
export declare function setVisible(sharedModel: IJupyterCadDoc, name: string, value: boolean): void;
export declare const PARTS: {
    box: {
        title: string;
        shape: string;
        default: (model: IJupyterCadModel) => {
            Name: string;
            Length: number;
            Width: number;
            Height: number;
            Placement: {
                Position: number[];
                Axis: number[];
                Angle: number;
            };
        };
    };
    cylinder: {
        title: string;
        shape: string;
        default: (model: IJupyterCadModel) => {
            Name: string;
            Radius: number;
            Height: number;
            Angle: number;
            Placement: {
                Position: number[];
                Axis: number[];
                Angle: number;
            };
        };
    };
    sphere: {
        title: string;
        shape: string;
        default: (model: IJupyterCadModel) => {
            Name: string;
            Radius: number;
            Angle1: number;
            Angle2: number;
            Angle3: number;
            Placement: {
                Position: number[];
                Axis: number[];
                Angle: number;
            };
        };
    };
    cone: {
        title: string;
        shape: string;
        default: (model: IJupyterCadModel) => {
            Name: string;
            Radius1: number;
            Radius2: number;
            Height: number;
            Angle: number;
            Placement: {
                Position: number[];
                Axis: number[];
                Angle: number;
            };
        };
    };
    torus: {
        title: string;
        shape: string;
        default: (model: IJupyterCadModel) => {
            Name: string;
            Radius1: number;
            Radius2: number;
            Angle1: number;
            Angle2: number;
            Angle3: number;
            Placement: {
                Position: number[];
                Axis: number[];
                Angle: number;
            };
        };
    };
};
/**
 * Gets the name of the selected mesh at the specified index.
 * @param selection The selection object containing selected items
 * @param index The index of the selected mesh to retrieve
 * @returns The name of the selected mesh, or an empty string if not found
 */
export declare function getSelectedMeshName(selection: {
    [key: string]: ISelection;
} | undefined, index: number): string;
/**
 * Gets the selected edges from the selection object.
 * @param selection The selection object containing selected items
 * @returns An object containing the shape name and array of edge indices, or undefined if no edges are selected
 */
export declare function getSelectedEdges(selection: {
    [key: string]: ISelection;
} | undefined): {
    shape: string;
    edgeIndices: number[];
} | undefined;
/**
 * Adds an object to the shared model after performing a dry run check.
 * @param options Configuration options for adding the object
 * @param options.jcadWidget The JupyterCad widget
 * @param options.objectModel The object model to add
 */
export declare function addObjectToSharedModel({ jcadWidget, objectModel }: {
    objectModel: IJCadObject;
    jcadWidget: JupyterCadWidget;
}): Promise<void>;
export declare function executeOperator(name: string, objectModel: IJCadObject, current: JupyterCadWidget, transaction: (sharedModel: IJupyterCadDoc) => any): Promise<void>;
