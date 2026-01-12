import { _writeBrep } from './brepIO';
import { _writeStlFile } from './stlIO';
import { getShapesFactory } from './common';
export function _PostOperator(arg, content) {
    var _a;
    const baseObject = content.objects.filter(obj => obj.name === arg.Object);
    if (baseObject.length === 0) {
        return { postShape: '' };
    }
    const shapesFactory = getShapesFactory();
    const baseShape = baseObject[0].shape;
    if (baseShape && shapesFactory[baseShape]) {
        const base = (_a = shapesFactory[baseShape]) === null || _a === void 0 ? void 0 : _a.call(shapesFactory, baseObject[0].parameters, content);
        if (base === null || base === void 0 ? void 0 : base.occShape) {
            let postShape = '';
            if (arg.Type === 'BREP') {
                postShape = _writeBrep(base.occShape);
            }
            else if (arg.Type === 'STL') {
                postShape = _writeStlFile(base.occShape, arg.LinearDeflection, arg.AngularDeflection);
            }
            return { postShape };
        }
    }
    return { postShape: '' };
}
