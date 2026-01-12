import { IParsedShape } from '@jupytercad/schema';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { IJCadObject } from '@jupytercad/schema';
export declare const DEFAULT_LINEWIDTH = 2;
export declare const SELECTED_LINEWIDTH = 6;
export declare const DEFAULT_MESH_COLOR_CSS = "--jp-inverse-layout-color4";
export declare const DEFAULT_EDGE_COLOR_CSS = "--jp-inverse-layout-color2";
export declare const BOUNDING_BOX_COLOR_CSS = "--jp-brand-color0";
export declare const SPLITVIEW_BACKGROUND_COLOR_CSS = "--jcad-splitview-background";
export declare const SELECTION_BOUNDING_BOX = "selectionBoundingBox";
export declare const DEFAULT_MESH_COLOR: THREE.Color;
export declare const DEFAULT_EDGE_COLOR: THREE.Color;
export declare const BOUNDING_BOX_COLOR: THREE.Color;
export declare const SPLITVIEW_BACKGROUND_COLOR: THREE.Color;
export type BasicMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial | THREE.MeshStandardMaterial>;
/**
 * The interface for a 3D pointer
 */
export interface IPointer {
    parent: BasicMesh;
    readonly mesh: BasicMesh;
}
/**
 * The result of mesh picking, contains the picked mesh and the 3D position of the pointer.
 */
export interface IPickedResult {
    mesh: BasicMesh;
    position: THREE.Vector3;
}
/**
 * The interface defining a mouse drag by its start and end position in pixels.
 */
export interface IMouseDrag {
    start: THREE.Vector2;
    end: THREE.Vector2;
    button?: number;
}
export interface IMeshGroupMetadata {
    type: string;
    jcObject: IJCadObject;
    [key: string]: any;
}
export interface IMeshGroup extends THREE.Group {
    userData: IMeshGroupMetadata;
}
export declare function projectVector(options: {
    vector: THREE.Vector3;
    camera: THREE.Camera;
    width: number;
    height: number;
}): THREE.Vector2;
export declare function getQuaternion(jcObject: IJCadObject): THREE.Quaternion;
export declare function computeExplodedState(options: {
    mesh: BasicMesh;
    boundingGroup: THREE.Box3;
    factor: number;
}): {
    oldGeometryCenter: THREE.Vector3;
    newGeometryCenter: THREE.Vector3;
    vector: THREE.Vector3;
    distance: number;
};
export declare function buildShape(options: {
    objName: string;
    data: IParsedShape;
    clippingPlanes: THREE.Plane[];
    isSolid: boolean;
    isWireframe: boolean;
    objColor?: THREE.Color | string | number;
}): {
    meshGroup: IMeshGroup;
    mainMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    edgesMeshes: LineSegments2[];
} | null;
