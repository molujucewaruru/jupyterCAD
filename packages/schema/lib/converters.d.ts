/**
 * Conversion utilities between JCAD Schema and Assembly Schema
 * for DTEditor integration
 */
import { IJCadObject, IAssemblyFeature } from './_interface/jcad';
/**
 * JCAD Placement interface (axis-angle representation)
 */
interface JCADPlacement {
    Position: number[];
    Axis: number[];
    Angle: number;
}
/**
 * Placement converter utility
 * Handles conversion between JCAD Placement and Assembly feature position/axis/normal
 */
export declare class PlacementConverter {
    /**
     * JCAD Placement → Assembly position
     */
    static jcadToAssemblyPosition(placement: JCADPlacement): [number, number, number];
    /**
     * JCAD Placement → Assembly axis
     */
    static jcadToAssemblyAxis(placement: JCADPlacement): [number, number, number];
    /**
     * Assembly center → JCAD Position
     */
    static assemblyCenterToJCADPosition(center: number[]): JCADPlacement;
    /**
     * Assembly position/axis → JCAD Placement
     */
    static assemblyPositionAxisToJCADPlacement(position: number[], axis: number[]): JCADPlacement;
    /**
     * Assembly position/normal → JCAD Placement
     */
    static assemblyPositionNormalToJCADPlacement(position: number[], normal: number[]): JCADPlacement;
    /**
     * Vector normalization
     */
    static normalize(v: number[]): number[];
    /**
     * Calculate vector length
     */
    static vectorLength(v: number[]): number;
    /**
     * Dot product of two vectors
     */
    static dot(v1: number[], v2: number[]): number;
    /**
     * Cross product of two vectors
     */
    static cross(v1: number[], v2: number[]): number[];
}
/**
 * JCAD to Assembly converter
 * Extracts assembly features from JCAD objects
 */
export declare class JCADToAssemblyConverter {
    /**
     * Extract assembly features from a JCAD object
     */
    static extractFeatures(jcadObject: IJCadObject): IAssemblyFeature[];
    /**
     * Convert Cylinder to assembly feature
     *
     * Mapping:
     * - position ← Placement.Position
     * - axis ← Placement.Axis (normalized)
     * - radius ← Radius
     * - height ← Height
     */
    private static convertCylinder;
    /**
     * Convert Sphere to assembly feature
     *
     * Mapping:
     * - center ← Placement.Position
     * - radius ← Radius
     */
    private static convertSphere;
    /**
     * Convert Cone to assembly feature
     *
     * Mapping:
     * - position ← Placement.Position
     * - axis ← Placement.Axis (normalized)
     * - radius1 ← Radius1 (bottom radius)
     * - radius2 ← Radius2 (top radius)
     * - height ← Height
     */
    private static convertCone;
    /**
     * Convert Torus to assembly feature
     *
     * Mapping (CRITICAL):
     * - position ← Placement.Position
     * - axis ← Placement.Axis (normalized, normal to torus plane)
     * - radius ← Radius1 (main radius: center to tube center)
     * - tube ← Radius2 (tube radius)
     */
    private static convertTorus;
    /**
     * Convert Box to assembly features (extract faces)
     *
     * Returns 6 face features for the 6 faces of the box
     */
    private static convertBox;
}
/**
 * Assembly to JCAD converter
 * Creates JCAD objects from assembly features
 */
export declare class AssemblyToJCADConverter {
    /**
     * Create a JCAD object from an assembly feature
     */
    static createJCADObject(feature: IAssemblyFeature, objectName: string): IJCadObject;
    /**
     * Create Cylinder JCAD object from assembly feature
     *
     * Mapping:
     * - Placement.Position ← position
     * - Placement.Axis ← axis
     * - Radius ← radius
     * - Height ← height
     */
    private static createCylinder;
    /**
     * Create Sphere JCAD object from assembly feature
     *
     * Mapping:
     * - Placement.Position ← center
     * - Radius ← radius
     */
    private static createSphere;
    /**
     * Create Cone JCAD object from assembly feature
     *
     * Mapping:
     * - Placement.Position ← position
     * - Placement.Axis ← axis
     * - Radius1 ← radius1
     * - Radius2 ← radius2
     * - Height ← height
     */
    private static createCone;
    /**
     * Create Torus JCAD object from assembly feature
     *
     * Mapping (CRITICAL):
     * - Placement.Position ← position
     * - Placement.Axis ← axis
     * - Radius1 ← radius (main radius)
     * - Radius2 ← tube (tube radius)
     */
    private static createTorus;
}
/**
 * Unified geometry feature converter
 * Provides batch conversion and validation utilities
 */
export declare class GeometryFeatureConverter {
    /**
     * Batch convert JCAD objects to assembly features
     */
    static jcadBatchToAssembly(jcadObjects: IJCadObject[]): IAssemblyFeature[];
    /**
     * Create JCAD assembly from assembly features
     */
    static assemblyToJCADAssembly(features: IAssemblyFeature[]): IJCadObject[];
    /**
     * Validate feature completeness
     */
    static validateFeature(feature: IAssemblyFeature): boolean;
    /**
     * Get required fields for a feature type
     */
    static getRequiredFields(featureType: string): string[];
}
/**
 * Parameter mapping reference
 * Documents the mapping between JCAD and Assembly parameters
 */
export declare const ParameterMapping: {
    'Feature::Cylinder': {
        'Assembly.position': string;
        'Assembly.axis': string;
        'Assembly.radius': string;
        'Assembly.height': string;
    };
    'Feature::Sphere': {
        'Assembly.center': string;
        'Assembly.radius': string;
    };
    'Feature::Cone': {
        'Assembly.position': string;
        'Assembly.axis': string;
        'Assembly.radius1': string;
        'Assembly.radius2': string;
        'Assembly.height': string;
    };
    'Feature::Torus': {
        'Assembly.position': string;
        'Assembly.axis': string;
        'Assembly.radius': string;
        'Assembly.tube': string;
    };
};
export {};
