import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
export function _Fuse(arg, content) {
    const oc = getOcc();
    const { Shapes, Placement } = arg;
    const occShapes = [];
    Shapes.forEach(Base => {
        var _a;
        const baseObject = content.objects.filter(obj => obj.name === Base);
        if (baseObject.length === 0) {
            return;
        }
        const shapesFactory = getShapesFactory();
        const baseShape = baseObject[0].shape;
        if (baseShape && shapesFactory[baseShape]) {
            const base = (_a = shapesFactory[baseShape]) === null || _a === void 0 ? void 0 : _a.call(shapesFactory, baseObject[0].parameters, content);
            if (base && base.occShape) {
                occShapes.push(base.occShape);
                baseObject[0].visible = false;
            }
        }
    });
    if (occShapes.length === 0) {
        return;
    }
    let fusedShape = occShapes[0];
    for (let i = 1; i < occShapes.length; i++) {
        const operator = new oc.BRepAlgoAPI_Fuse_3(fusedShape, occShapes[i], new oc.Message_ProgressRange_1());
        if (operator.IsDone()) {
            fusedShape = operator.Shape();
        }
        else {
            console.error(`Fusion failed at index ${i}`);
            return;
        }
    }
    return setShapePlacement(fusedShape, Placement);
}
