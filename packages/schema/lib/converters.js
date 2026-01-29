/**
 * Conversion utilities between JCAD Schema and Assembly Schema
 * for DTEditor integration
 */
/**
 * Placement converter utility
 * Handles conversion between JCAD Placement and Assembly feature position/axis/normal
 */
export class PlacementConverter {
    /**
     * JCAD Placement → Assembly position
     */
    static jcadToAssemblyPosition(placement) {
        const pos = placement.Position;
        return [pos[0], pos[1], pos[2]];
    }
    /**
     * JCAD Placement → Assembly axis
     */
    static jcadToAssemblyAxis(placement) {
        const normalized = this.normalize([...placement.Axis]);
        return [normalized[0], normalized[1], normalized[2]];
    }
    /**
     * Assembly center → JCAD Position
     */
    static assemblyCenterToJCADPosition(center) {
        return {
            Position: [center[0], center[1], center[2]],
            Axis: [0, 0, 1],
            Angle: 0
        };
    }
    /**
     * Assembly position/axis → JCAD Placement
     */
    static assemblyPositionAxisToJCADPlacement(position, axis) {
        const normalized = this.normalize([...axis]);
        return {
            Position: [position[0], position[1], position[2]],
            Axis: [normalized[0], normalized[1], normalized[2]],
            Angle: 0
        };
    }
    /**
     * Assembly position/normal → JCAD Placement
     */
    static assemblyPositionNormalToJCADPlacement(position, normal) {
        const normalized = this.normalize([...normal]);
        return {
            Position: [position[0], position[1], position[2]],
            Axis: [normalized[0], normalized[1], normalized[2]],
            Angle: 0
        };
    }
    /**
     * Vector normalization
     */
    static normalize(v) {
        const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        if (len === 0)
            return [0, 0, 1];
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    /**
     * Calculate vector length
     */
    static vectorLength(v) {
        return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    }
    /**
     * Dot product of two vectors
     */
    static dot(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    /**
     * Cross product of two vectors
     */
    static cross(v1, v2) {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    }
}
/**
 * JCAD to Assembly converter
 * Extracts assembly features from JCAD objects
 */
export class JCADToAssemblyConverter {
    /**
     * Extract assembly features from a JCAD object
     */
    static extractFeatures(jcadObject) {
        // If the object already has assemblyFeatures, use them
        if (jcadObject.assemblyFeatures && jcadObject.assemblyFeatures.length > 0) {
            return jcadObject.assemblyFeatures;
        }
        // Otherwise, automatically extract features based on shape type
        const features = [];
        switch (jcadObject.shape) {
            case 'Part::Cylinder':
                features.push(this.convertCylinder(jcadObject));
                break;
            case 'Part::Sphere':
                features.push(this.convertSphere(jcadObject));
                break;
            case 'Part::Cone':
                features.push(this.convertCone(jcadObject));
                break;
            case 'Part::Torus':
                features.push(this.convertTorus(jcadObject));
                break;
            case 'Part::Box':
                features.push(...this.convertBox(jcadObject));
                break;
            default:
                // For other shapes, no automatic extraction
                break;
        }
        return features;
    }
    /**
     * Convert Cylinder to assembly feature
     *
     * Mapping:
     * - position ← Placement.Position
     * - axis ← Placement.Axis (normalized)
     * - radius ← Radius
     * - height ← Height
     */
    static convertCylinder(obj) {
        const params = obj.parameters;
        const placement = params.Placement;
        return {
            type: 'Feature::Cylinder',
            name: `${obj.name}_axis`,
            position: PlacementConverter.jcadToAssemblyPosition(placement),
            axis: PlacementConverter.jcadToAssemblyAxis(placement),
            radius: params.Radius,
            height: params.Height,
            metadata: {
                originalObject: obj.name
            }
        };
    }
    /**
     * Convert Sphere to assembly feature
     *
     * Mapping:
     * - center ← Placement.Position
     * - radius ← Radius
     */
    static convertSphere(obj) {
        const params = obj.parameters;
        const placement = params.Placement;
        return {
            type: 'Feature::Sphere',
            name: `${obj.name}_center`,
            center: PlacementConverter.jcadToAssemblyPosition(placement),
            radius: params.Radius,
            metadata: {
                originalObject: obj.name
            }
        };
    }
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
    static convertCone(obj) {
        const params = obj.parameters;
        const placement = params.Placement;
        return {
            type: 'Feature::Cone',
            name: `${obj.name}_axis`,
            position: PlacementConverter.jcadToAssemblyPosition(placement),
            axis: PlacementConverter.jcadToAssemblyAxis(placement),
            radius1: params.Radius1,
            radius2: params.Radius2,
            height: params.Height,
            metadata: {
                originalObject: obj.name
            }
        };
    }
    /**
     * Convert Torus to assembly feature
     *
     * Mapping (CRITICAL):
     * - position ← Placement.Position
     * - axis ← Placement.Axis (normalized, normal to torus plane)
     * - radius ← Radius1 (main radius: center to tube center)
     * - tube ← Radius2 (tube radius)
     */
    static convertTorus(obj) {
        const params = obj.parameters;
        const placement = params.Placement;
        return {
            type: 'Feature::Torus',
            name: `${obj.name}_center`,
            position: PlacementConverter.jcadToAssemblyPosition(placement),
            axis: PlacementConverter.jcadToAssemblyAxis(placement),
            radius: params.Radius1, // Main radius
            tube: params.Radius2, // Tube radius
            metadata: {
                originalObject: obj.name
            }
        };
    }
    /**
     * Convert Box to assembly features (extract faces)
     *
     * Returns 6 face features for the 6 faces of the box
     */
    static convertBox(obj) {
        const params = obj.parameters;
        const placement = params.Placement;
        const [x, y, z] = placement.Position;
        const [l, w, h] = [params.Length, params.Width, params.Height];
        // Return 6 face features
        return [
            {
                type: 'Feature::Face',
                name: `${obj.name}_top`,
                normal: [0, 1, 0],
                center: [x, y + h / 2, z],
                metadata: { originalObject: obj.name, face: 'top' }
            },
            {
                type: 'Feature::Face',
                name: `${obj.name}_bottom`,
                normal: [0, -1, 0],
                center: [x, y - h / 2, z],
                metadata: { originalObject: obj.name, face: 'bottom' }
            },
            {
                type: 'Feature::Face',
                name: `${obj.name}_front`,
                normal: [0, 0, 1],
                center: [x, y, z + w / 2],
                metadata: { originalObject: obj.name, face: 'front' }
            },
            {
                type: 'Feature::Face',
                name: `${obj.name}_back`,
                normal: [0, 0, -1],
                center: [x, y, z - w / 2],
                metadata: { originalObject: obj.name, face: 'back' }
            },
            {
                type: 'Feature::Face',
                name: `${obj.name}_right`,
                normal: [1, 0, 0],
                center: [x + l / 2, y, z],
                metadata: { originalObject: obj.name, face: 'right' }
            },
            {
                type: 'Feature::Face',
                name: `${obj.name}_left`,
                normal: [-1, 0, 0],
                center: [x - l / 2, y, z],
                metadata: { originalObject: obj.name, face: 'left' }
            }
        ];
    }
}
/**
 * Assembly to JCAD converter
 * Creates JCAD objects from assembly features
 */
export class AssemblyToJCADConverter {
    /**
     * Create a JCAD object from an assembly feature
     */
    static createJCADObject(feature, objectName) {
        switch (feature.type) {
            case 'Feature::Cylinder':
                return this.createCylinder(feature, objectName);
            case 'Feature::Sphere':
                return this.createSphere(feature, objectName);
            case 'Feature::Cone':
                return this.createCone(feature, objectName);
            case 'Feature::Torus':
                return this.createTorus(feature, objectName);
            default:
                throw new Error(`Unsupported feature type for JCAD creation: ${feature.type}`);
        }
    }
    /**
     * Create Cylinder JCAD object from assembly feature
     *
     * Mapping:
     * - Placement.Position ← position
     * - Placement.Axis ← axis
     * - Radius ← radius
     * - Height ← height
     */
    static createCylinder(feature, objectName) {
        if (!feature.position || !feature.axis || !feature.radius || !feature.height) {
            throw new Error('Missing required cylinder parameters');
        }
        const placement = PlacementConverter.assemblyPositionAxisToJCADPlacement(feature.position, feature.axis);
        return {
            name: objectName,
            visible: true,
            shape: 'Part::Cylinder',
            parameters: {
                Radius: feature.radius,
                Height: feature.height,
                Angle: 360,
                Placement: placement
            },
            assemblyFeatures: [feature]
        };
    }
    /**
     * Create Sphere JCAD object from assembly feature
     *
     * Mapping:
     * - Placement.Position ← center
     * - Radius ← radius
     */
    static createSphere(feature, objectName) {
        if (!feature.center || !feature.radius) {
            throw new Error('Missing required sphere parameters');
        }
        return {
            name: objectName,
            visible: true,
            shape: 'Part::Sphere',
            parameters: {
                Radius: feature.radius,
                Angle1: 0,
                Angle2: 180,
                Angle3: 360,
                Placement: PlacementConverter.assemblyCenterToJCADPosition(feature.center)
            },
            assemblyFeatures: [feature]
        };
    }
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
    static createCone(feature, objectName) {
        if (!feature.position || !feature.axis ||
            feature.radius1 === undefined || feature.radius2 === undefined) {
            throw new Error('Missing required cone parameters');
        }
        const placement = PlacementConverter.assemblyPositionAxisToJCADPlacement(feature.position, feature.axis);
        return {
            name: objectName,
            visible: true,
            shape: 'Part::Cone',
            parameters: {
                Radius1: feature.radius1,
                Radius2: feature.radius2,
                Height: feature.height || 10,
                Angle: 360,
                Placement: placement
            },
            assemblyFeatures: [feature]
        };
    }
    /**
     * Create Torus JCAD object from assembly feature
     *
     * Mapping (CRITICAL):
     * - Placement.Position ← position
     * - Placement.Axis ← axis
     * - Radius1 ← radius (main radius)
     * - Radius2 ← tube (tube radius)
     */
    static createTorus(feature, objectName) {
        if (!feature.position || !feature.axis || !feature.radius || !feature.tube) {
            throw new Error('Missing required torus parameters');
        }
        const placement = PlacementConverter.assemblyPositionAxisToJCADPlacement(feature.position, feature.axis);
        return {
            name: objectName,
            visible: true,
            shape: 'Part::Torus',
            parameters: {
                Radius1: feature.radius, // Main radius
                Radius2: feature.tube, // Tube radius
                Angle1: 0,
                Angle2: 360,
                Angle3: 360,
                Placement: placement
            },
            assemblyFeatures: [feature]
        };
    }
}
/**
 * Unified geometry feature converter
 * Provides batch conversion and validation utilities
 */
export class GeometryFeatureConverter {
    /**
     * Batch convert JCAD objects to assembly features
     */
    static jcadBatchToAssembly(jcadObjects) {
        const features = [];
        for (const obj of jcadObjects) {
            // If object has assemblyFeatures, use them directly
            if (obj.assemblyFeatures && obj.assemblyFeatures.length > 0) {
                features.push(...obj.assemblyFeatures);
            }
            else {
                // Otherwise, automatically extract
                features.push(...JCADToAssemblyConverter.extractFeatures(obj));
            }
        }
        return features;
    }
    /**
     * Create JCAD assembly from assembly features
     */
    static assemblyToJCADAssembly(features) {
        var _a;
        const jcadObjects = [];
        for (const feature of features) {
            const objectName = ((_a = feature.metadata) === null || _a === void 0 ? void 0 : _a.originalObject) ||
                `${feature.type}_${feature.name}`;
            try {
                const jcadObj = AssemblyToJCADConverter.createJCADObject(feature, objectName);
                jcadObjects.push(jcadObj);
            }
            catch (e) {
                console.warn(`Failed to convert feature ${feature.name}:`, e);
            }
        }
        return jcadObjects;
    }
    /**
     * Validate feature completeness
     */
    static validateFeature(feature) {
        const requiredFields = {
            'Feature::Cylinder': ['position', 'axis', 'radius', 'height'],
            'Feature::Sphere': ['center', 'radius'],
            'Feature::Cone': ['position', 'axis', 'radius1', 'radius2'],
            'Feature::Torus': ['position', 'axis', 'radius', 'tube'],
            'Feature::Circle': ['center', 'normal', 'radius'],
            'Feature::Face': ['normal', 'center']
        };
        const required = requiredFields[feature.type];
        if (!required)
            return false;
        for (const field of required) {
            if (!(field in feature) || feature[field] === undefined) {
                return false;
            }
        }
        return true;
    }
    /**
     * Get required fields for a feature type
     */
    static getRequiredFields(featureType) {
        const fieldMap = {
            'Feature::Cylinder': ['position', 'axis', 'radius', 'height'],
            'Feature::Sphere': ['center', 'radius'],
            'Feature::Cone': ['position', 'axis', 'radius1', 'radius2'],
            'Feature::Torus': ['position', 'axis', 'radius', 'tube'],
            'Feature::Circle': ['center', 'normal', 'radius'],
            'Feature::Face': ['normal', 'center'],
            'Feature::Point': ['position'],
            'Feature::Edge': ['position'] // simplified
        };
        return fieldMap[featureType] || [];
    }
}
/**
 * Parameter mapping reference
 * Documents the mapping between JCAD and Assembly parameters
 */
export const ParameterMapping = {
    'Feature::Cylinder': {
        'Assembly.position': 'JCAD.Placement.Position',
        'Assembly.axis': 'JCAD.Placement.Axis',
        'Assembly.radius': 'JCAD.Radius',
        'Assembly.height': 'JCAD.Height'
    },
    'Feature::Sphere': {
        'Assembly.center': 'JCAD.Placement.Position',
        'Assembly.radius': 'JCAD.Radius'
        // Angle1/2/3 are ignored for full sphere
    },
    'Feature::Cone': {
        'Assembly.position': 'JCAD.Placement.Position',
        'Assembly.axis': 'JCAD.Placement.Axis',
        'Assembly.radius1': 'JCAD.Radius1',
        'Assembly.radius2': 'JCAD.Radius2',
        'Assembly.height': 'JCAD.Height'
    },
    'Feature::Torus': {
        'Assembly.position': 'JCAD.Placement.Position',
        'Assembly.axis': 'JCAD.Placement.Axis',
        'Assembly.radius': 'JCAD.Radius1', // CRITICAL: main radius
        'Assembly.tube': 'JCAD.Radius2' // CRITICAL: tube radius
        // Angle1/2/3 are ignored for full torus
    }
};
