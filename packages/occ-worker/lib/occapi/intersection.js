import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
export function _Intersection(arg, content) {
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
    const operator = new oc.BRepAlgoAPI_Common_3(occShapes[0], occShapes[1], new oc.Message_ProgressRange_1());
    if (operator.IsDone()) {
        return setShapePlacement(operator.Shape(), Placement);
    }
    return;
}
