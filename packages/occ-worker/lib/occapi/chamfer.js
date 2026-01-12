import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
export function _Chamfer(arg, content) {
    var _a;
    const { Base, Edge, Dist, Placement } = arg;
    const oc = getOcc();
    const baseObject = content.objects.filter(obj => obj.name === Base);
    if (baseObject.length === 0) {
        return;
    }
    const baseShape = baseObject[0].shape;
    const shapesFactory = getShapesFactory();
    if (baseShape && shapesFactory[baseShape]) {
        const base = (_a = shapesFactory[baseShape]) === null || _a === void 0 ? void 0 : _a.call(shapesFactory, baseObject[0].parameters, content);
        if (!base || !base.occShape) {
            return;
        }
        const mapOfShape = new oc.TopTools_IndexedMapOfShape_1();
        oc.TopExp.MapShapes_1(base.occShape, oc.TopAbs_ShapeEnum.TopAbs_EDGE, mapOfShape);
        const chamferBuilder = new oc.BRepFilletAPI_MakeChamfer(base.occShape);
        const edgeList = Array.isArray(Edge) ? Edge : [Edge];
        for (const edgeIdx of edgeList) {
            const e = oc.TopoDS.Edge_1(mapOfShape.FindKey(edgeIdx + 1));
            chamferBuilder.Add_2(Dist, e);
        }
        chamferBuilder.Build(new oc.Message_ProgressRange_1());
        if (chamferBuilder.IsDone()) {
            return setShapePlacement(chamferBuilder.Shape(), Placement);
        }
        else {
            console.error('Failed to create chamfer');
        }
    }
}
