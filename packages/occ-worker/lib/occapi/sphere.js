import { getOcc } from './common';
import { setShapePlacement, toRad } from './common';
export function _Sphere(arg, _) {
    const { Radius, Angle1, Angle2, Angle3, Placement } = arg;
    const oc = getOcc();
    const sphere = new oc.BRepPrimAPI_MakeSphere_4(Radius, toRad(Angle1), toRad(Angle2), toRad(Angle3));
    const shape = sphere.Shape();
    return setShapePlacement(shape, Placement);
}
