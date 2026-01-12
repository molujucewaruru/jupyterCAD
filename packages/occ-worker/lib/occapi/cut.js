import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
export function _Cut(arg, content) {
    var _a, _b;
    const { Placement, Base, Tool } = arg;
    const oc = getOcc();
    const baseObject = content.objects.filter(obj => obj.name === Base);
    const toolObject = content.objects.filter(obj => obj.name === Tool);
    if (baseObject.length === 0 || toolObject.length === 0) {
        return;
    }
    const baseShape = baseObject[0].shape;
    const toolShape = toolObject[0].shape;
    const shapesFactory = getShapesFactory();
    if (baseShape &&
        shapesFactory[baseShape] &&
        toolShape &&
        shapesFactory[toolShape]) {
        const base = (_a = shapesFactory[baseShape]) === null || _a === void 0 ? void 0 : _a.call(shapesFactory, baseObject[0].parameters, content);
        const tool = (_b = shapesFactory[toolShape]) === null || _b === void 0 ? void 0 : _b.call(shapesFactory, toolObject[0].parameters, content);
        if (base && tool && base.occShape && tool.occShape) {
            baseObject[0].visible = false;
            toolObject[0].visible = false;
            const operator = new oc.BRepAlgoAPI_Cut_3(base.occShape, tool.occShape, new oc.Message_ProgressRange_1());
            if (operator.IsDone()) {
                return setShapePlacement(operator.Shape(), Placement);
            }
        }
    }
}
