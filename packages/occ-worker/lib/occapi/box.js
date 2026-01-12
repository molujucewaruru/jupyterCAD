import { getOcc, setShapePlacement } from './common';
export function _Box(arg, _) {
    const { Length, Width, Height, Placement } = arg;
    const oc = getOcc();
    const box = new oc.BRepPrimAPI_MakeBox_2(Length, Width, Height);
    const shape = box.Shape();
    return setShapePlacement(shape, Placement);
}
