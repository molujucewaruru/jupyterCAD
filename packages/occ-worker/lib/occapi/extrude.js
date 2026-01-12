import { getOcc } from './common';
import { setShapePlacement, getShapesFactory } from './common';
export function _Extrude(arg, content) {
    var _a;
    const { Base, Dir, LengthFwd, LengthRev, Placement, Solid } = arg;
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
        const dirVec = new oc.gp_Vec_4(Dir[0], Dir[1], Dir[2]);
        const vec = dirVec.Multiplied(LengthFwd + LengthRev);
        let baseCopy = new oc.BRepBuilderAPI_Copy_2(base.occShape, true, false).Shape();
        if (LengthRev !== 0) {
            const mov = new oc.gp_Trsf_1();
            mov.SetTranslation_1(dirVec.Multiplied(-LengthRev));
            const loc = new oc.TopLoc_Location_2(mov);
            baseCopy.Move(loc, true);
        }
        if (Solid) {
            const xp = new oc.TopExp_Explorer_2(baseCopy, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
            if (xp.More()) {
                //source shape has faces. Just extrude as-is.
            }
            else {
                const wireEx = new oc.TopExp_Explorer_2(baseCopy, oc.TopAbs_ShapeEnum.TopAbs_EDGE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
                const wireMaker = new oc.BRepBuilderAPI_MakeWire_1();
                while (wireEx.More()) {
                    const ed = oc.TopoDS.Edge_1(wireEx.Current());
                    wireMaker.Add_1(ed);
                    wireEx.Next();
                }
                const wire = wireMaker.Wire();
                const faceMaker = new oc.BRepBuilderAPI_MakeFace_15(wire, false);
                baseCopy = faceMaker.Face();
            }
        }
        const result = new oc.BRepPrimAPI_MakePrism_1(baseCopy, vec, false, true);
        return setShapePlacement(result.Shape(), Placement);
    }
    return;
}
