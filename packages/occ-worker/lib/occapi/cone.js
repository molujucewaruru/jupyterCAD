import { getOcc } from './common';
import { setShapePlacement, toRad } from './common';
export function _Cone(arg, _) {
    const { Radius1, Radius2, Height, Angle, Placement } = arg;
    const oc = getOcc();
    const cone = new oc.BRepPrimAPI_MakeCone_2(Radius1, Radius2, Height, toRad(Angle));
    const shape = cone.Shape();
    return setShapePlacement(shape, Placement);
}
