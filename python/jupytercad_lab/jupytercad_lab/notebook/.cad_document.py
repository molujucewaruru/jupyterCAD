from __future__ import annotations

import json
import logging
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from pycrdt import Array, Doc, Map, Text
from pydantic import BaseModel
from ypywidgets.comm import CommWidget

from uuid import uuid4

from jupytercad_core.schema import (
    IBox,
    ICone,
    ICut,
    ICylinder,
    IExtrusion,
    IFuse,
    IIntersection,
    ISphere,
    IChamfer,
    IFillet,
    ITorus,
    ISketchObject,
    Parts,
    ShapeMetadata,
    IAny,
    SCHEMA_VERSION,
)
from jupytercad_core.schema.interfaces import geomLineSegment, geomCircle

logger = logging.getLogger(__file__)


class CadDocument(CommWidget):
    """
    Create a new CadDocument object.

    :param path: the path to the file that you would like to open.
    If not provided, a new empty document will be created.
    """

    def __init__(self, path: Optional[str] = None):
        comm_metadata = CadDocument._path_to_comm(path)

        ydoc = Doc()

        super().__init__(
            comm_metadata=dict(ymodel_name="@jupytercad:widget", **comm_metadata),
            ydoc=ydoc,
        )

        self.ydoc["schemaVersion"] = self._schemaVersion = Text(SCHEMA_VERSION)
        self.ydoc["objects"] = self._objects_array = Array()
        self.ydoc["metadata"] = self._metadata = Map()
        self.ydoc["outputs"] = self._outputs = Map()
        self.ydoc["options"] = self._options = Map()

    @property
    def objects(self) -> List[str]:
        """
        Get the list of objects that the document contains as a list of strings.
        """
        if self._objects_array:
            return [x["name"] for x in self._objects_array]
        return []

    @classmethod
    def import_from_file(cls, path: str | Path) -> CadDocument:
        """
        Import a CadDocument from a .jcad file.

        :param path: The path to the file.
        :return: A new CadDocument instance.
        """
        instance = cls()
        with open(path, "r") as f:
            jcad_content = json.load(f)

        instance.ydoc["objects"] = instance._objects_array = Array(
            [Map(obj) for obj in jcad_content.get("objects", [])]
        )
        instance.ydoc["options"] = instance._options = Map(
            jcad_content.get("options", {})
        )
        instance.ydoc["metadata"] = instance._metadata = Map(
            jcad_content.get("metadata", {})
        )
        instance.ydoc["outputs"] = instance._outputs = Map(
            jcad_content.get("outputs", {})
        )

        return instance

    def save(self, path: str | Path) -> None:
        """
        Save the CadDocument to a .jcad file on the local filesystem.

        :param path: The path to the file.
        """
        content = {
            "schemaVersion": SCHEMA_VERSION,
            "objects": self._objects_array.to_py(),
            "options": self._options.to_py(),
            "metadata": self._metadata.to_py(),
            "outputs": self._outputs.to_py(),
        }
        with open(path, "w") as f:
            json.dump(content, f, indent=4)

    def export(self, path: str) -> None:
        """
        Export the current document to a GLB file.
        """
        try:
            from OCC.Core.TDocStd import TDocStd_Document
            from OCC.Core.XCAFApp import XCAFApp_Application
            from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ColorGen
            from OCC.Core.RWGltf import RWGltf_CafWriter
            from OCC.Core.TCollection import TCollection_ExtendedString, TCollection_AsciiString
            from OCC.Core.Quantity import Quantity_Color as Quantities_Color, Quantity_TOC_RGB as Quantities_TOC_RGB
            from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
            from OCC.Core.TColStd import TColStd_IndexedDataMapOfStringString
            from OCC.Core.Message import Message_ProgressRange
            from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
        except ImportError as e:
            raise ImportError(f"{e}")

        # 1. 初始化 XCAF 文档
        h_app = XCAFApp_Application.GetApplication()
        doc = TDocStd_Document(TCollection_ExtendedString("BinXCAF"))
        h_app.NewDocument(TCollection_ExtendedString("BinXCAF"), doc)
        
        shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
        color_tool = XCAFDoc_DocumentTool.ColorTool(doc.Main())

        seq_labels = TDF_LabelSequence()
        created_shapes = {} # 缓存所有重建的形状（包括不可见的）

        # 2. 遍历所有对象
        for obj_data in self.objects: 
            name = obj_data
            obj = self.get_object(name)
            
            if not obj:
                continue

            # --- 重建几何体 ---
            # 无论是否可见，都必须重建，因为不可见的对象可能是布尔运算（如Cut）的底座或工具
            shape = self._reconstruct_occ_shape(obj, created_shapes)
            
            if shape:
                # 存入缓存
                created_shapes[name] = shape
                
                # --- 仅导出可见对象 ---
                # 现在 PythonJcadObject 有了 visible 属性，可以直接访问
                if obj.visible:
                    # 生成网格 (Triangulation)，GLB 必须项
                    # 0.01 是线性偏差，越小越平滑
                    mesh_gen = BRepMesh_IncrementalMesh(shape, 0.01)
                    mesh_gen.Perform()
                    
                    # 添加到 XCAF 文档
                    label = shape_tool.AddShape(shape, False)
                    seq_labels.Append(label)
                    
                    # 设置颜色
                    if hasattr(obj, "parameters") and hasattr(obj.parameters, "Color"):
                        hex_color = obj.parameters.Color 
                        if hex_color and hex_color.startswith("#"):
                            try:
                                r = int(hex_color[1:3], 16) / 255.0
                                g = int(hex_color[3:5], 16) / 255.0
                                b = int(hex_color[5:7], 16) / 255.0
                                
                                col = Quantities_Color(r, g, b, Quantities_TOC_RGB)
                                color_tool.SetColor(label, col, XCAFDoc_ColorGen)
                            except ValueError:
                                pass

        # 5. 执行导出
        writer = RWGltf_CafWriter(TCollection_AsciiString(path), True) 
        
        file_info = TColStd_IndexedDataMapOfStringString()
        progress = Message_ProgressRange()
        
        if seq_labels.Length() > 0:
            writer.Perform(doc, seq_labels, None, file_info, progress)
            print(f"Successfully exported GLB to {path} (Objects: {seq_labels.Length()})")
        else:
            print("Warning: No visible objects found to export.")

    def _reconstruct_occ_shape(self, obj, existing_shapes):
        """
        Internal helper to convert a JCAD object to a TopoDS_Shape.
        """
        from OCC.Core.BRepPrimAPI import (
            BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCylinder,
            BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeCone, BRepPrimAPI_MakeTorus
        )
        from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut, BRepAlgoAPI_Fuse, BRepAlgoAPI_Common
        from OCC.Core.gp import gp_Trsf, gp_Vec, gp_Ax1, gp_Pnt, gp_Dir
        from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
        from OCC.Core.TopoDS import TopoDS_Shape
        
        # 修复：获取枚举的字符串值，避免 Enum != String 的问题
        shape_type = obj.shape.value if hasattr(obj.shape, "value") else str(obj.shape)
        params = obj.parameters
        occ_shape = None

        try:
            # --- 基础几何体 ---
            if shape_type == "Part::Box":
                occ_shape = BRepPrimAPI_MakeBox(params.Length, params.Width, params.Height).Shape()
            
            elif shape_type == "Part::Cylinder":
                occ_shape = BRepPrimAPI_MakeCylinder(params.Radius, params.Height, params.Angle * 0.0174533).Shape()
                
            elif shape_type == "Part::Sphere":
                occ_shape = BRepPrimAPI_MakeSphere(params.Radius, params.Angle3 * 0.0174533).Shape()
                
            elif shape_type == "Part::Cone":
                occ_shape = BRepPrimAPI_MakeCone(params.Radius1, params.Radius2, params.Height, params.Angle * 0.0174533).Shape()
                
            elif shape_type == "Part::Torus":
                occ_shape = BRepPrimAPI_MakeTorus(params.Radius1, params.Radius2, params.Angle3 * 0.0174533).Shape()

            # --- 布尔运算 ---
            elif shape_type == "Part::Cut":
                base = existing_shapes.get(params.Base)
                tool = existing_shapes.get(params.Tool)
                if base and tool:
                    occ_shape = BRepAlgoAPI_Cut(base, tool).Shape()
            
            elif shape_type == "Part::MultiFuse":
                shapes = [existing_shapes.get(s) for s in params.Shapes if s in existing_shapes]
                if shapes:
                    algo = BRepAlgoAPI_Fuse(shapes[0], shapes[1])
                    for i in range(2, len(shapes)):
                        algo = BRepAlgoAPI_Fuse(algo.Shape(), shapes[i])
                    occ_shape = algo.Shape()
            
            elif shape_type == "Part::MultiCommon":
                shapes = [existing_shapes.get(s) for s in params.Shapes if s in existing_shapes]
                if len(shapes) >= 2:
                    occ_shape = BRepAlgoAPI_Common(shapes[0], shapes[1]).Shape()

            # --- 变换处理 (Placement) ---
            if occ_shape and hasattr(params, "Placement"):
                pos = params.Placement.Position
                axis = params.Placement.Axis
                angle = params.Placement.Angle

                trsf = gp_Trsf()
                if axis and angle != 0:
                    q_axis = gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(axis[0], axis[1], axis[2]))
                    trsf.SetRotation(q_axis, angle * 0.0174533)
                if pos:
                    trsf_trans = gp_Trsf()
                    trsf_trans.SetTranslation(gp_Vec(pos[0], pos[1], pos[2]))
                    trsf = trsf_trans.Multiplied(trsf)
                
                occ_shape = BRepBuilderAPI_Transform(occ_shape, trsf, True).Shape()
                
        except Exception as e:
            print(f"Error reconstructing object {obj.name}: {e}")
            return None

        return occ_shape

    @classmethod
    def _path_to_comm(cls, filePath: Optional[str]) -> Dict:
        path = None
        format = None
        contentType = None

        if filePath is not None:
            path = filePath
            file_name = Path(path).name
            try:
                ext = file_name.split(".")[1].lower()
            except Exception:
                raise ValueError("Can not detect file extension!")
            if ext == "fcstd":
                format = "base64"
                contentType = "FCStd"
            elif ext == "jcad":
                format = "text"
                contentType = "jcad"
            else:
                raise ValueError("File extension is not supported!")
        return dict(
            path=path, format=format, contentType=contentType, createydoc=path is None
        )

    def get_object(self, name: str) -> Optional["PythonJcadObject"]:
        if self.check_exist(name):
            data = self._get_yobject_by_name(name).to_py()
            return OBJECT_FACTORY.create_object(data, self)

    def _get_color(self, shape_id: str | int) -> str:
        """
        Retrieve the color of a shape by its name or index.

        :param shape_id: The name or index of the shape.
        :return: The color of the shape in hex format.
        """
        shape = self.get_object(shape_id)
        if hasattr(shape, "parameters") and hasattr(shape.parameters, "Color"):
            color = shape.parameters.Color
            return color
        else:
            return "#808080"

    def remove(self, name: str) -> CadDocument:
        """
        Remove an object from the document.

        :param name: The name of the object to remove.
        :return: The document itself.
        """
        index = self._get_yobject_index_by_name(name)
        if self._objects_array and index != -1:
            self._objects_array.pop(index)
        return self

    def rename(self, old_name: str, new_name: str) -> CadDocument:
        """
        Rename an object in the document.

        :param old_name: The current name of the object.
        :param new_name: The new name for the object.
        :return: The document itself.
        """
        if new_name == old_name:
            return self
        new_obj = self.get_object(old_name)
        new_obj.name = new_name
        self.add_object(new_obj).remove(old_name)
        return self

    def add_object(self, new_object: "PythonJcadObject") -> CadDocument:
        if self._objects_array is not None and not self.check_exist(new_object.name):
            obj_dict = json.loads(new_object.model_dump_json())
            obj_dict["visible"] = True
            new_map = Map(obj_dict)
            self._objects_array.append(new_map)
        else:
            logger.error(f"Object {new_object.name} already exists")
        return self

    def add_annotation(
        self,
        parent: str,
        message: str,
        *,
        position: Optional[List[float]] = None,
        user: Optional[Dict] = None,
    ) -> Optional[str]:
        """
        Add an annotation to the document.

        :param parent: The object which holds the annotation.
        :param message: The first messages in the annotation.
        :param position: The position of the annotation.
        :param user: The user who create this annotation.
        :return: The id of the annotation if it is created.
        """
        new_id = f"annotation_${uuid4()}"
        parent_obj = self.get_object(parent)
        if parent_obj is None:
            raise ValueError("Parent object not found")

        if position is None:
            position = (
                parent_obj.metadata.centerOfMass
                if parent_obj.metadata is not None
                else [0, 0, 0]
            )
        contents = [{"user": user, "value": message}]
        if self._metadata is not None:
            self._metadata[new_id] = json.dumps(
                {
                    "position": position,
                    "contents": contents,
                    "parent": parent,
                }
            )
            return new_id

    def remove_annotation(self, annotation_id: str) -> None:
        """
        Remove an annotation from the document.

        :param annotation_id: The id of the annotation
        """
        if self._metadata is not None:
            del self._metadata[annotation_id]

    def add_step_file(
        self,
        path: str,
        name: str = "",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        shape_name = name if name else Path(path).stem
        if self.check_exist(shape_name):
            logger.error(f"Object {shape_name} already exists")
            return

        with open(path, "r") as fobj:
            data = fobj.read()

        data = {
            "shape": "Part::Any",
            "name": shape_name,
            "parameters": {
                "Content": data,
                "Type": "STEP",
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
            "visible": True,
        }

        self._objects_array.append(Map(data))

        return self

    def add_occ_shape(
        self,
        shape,
        name: str = "",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add an OpenCascade TopoDS shape to the document.
        You need `pythonocc-core` installed in order to use this method.

        :param shape: The Open Cascade shape to add.
        :param name: The name that will be used for the object in the document.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """
        try:
            from OCC.Core.BRepTools import breptools
        except ImportError:
            raise RuntimeError("Cannot add an OpenCascade shape if it's not installed.")

        shape_name = name if name else self._new_name("OCCShape")
        if self.check_exist(shape_name):
            logger.error(f"Object {shape_name} already exists")
            return

        with tempfile.NamedTemporaryFile() as tmp:
            breptools.Write(shape, tmp.name, True, False, 1)
            brepdata = tmp.read().decode("ascii")

        data = {
            "shape": "Part::Any",
            "name": shape_name,
            "parameters": {
                "Content": brepdata,
                "Type": "brep",
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
            "visible": True,
        }

        self._objects_array.append(Map(data))

        return self

    def add_box(
        self,
        name: str = "",
        length: float = 1,
        width: float = 1,
        height: float = 1,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a box to the document.

        :param name: The name that will be used for the object in the document.
        :param length: The length of the box.
        :param width: The width of the box.
        :param height: The height of the box.
        :param color: The color of the box in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """
        data = {
            "shape": Parts.Part__Box.value,
            "name": name if name else self._new_name("Box"),
            "parameters": {
                "Length": length,
                "Width": width,
                "Height": height,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def add_cone(
        self,
        name: str = "",
        radius1: float = 1,
        radius2: float = 0.5,
        height: float = 1,
        angle: float = 360,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a cone to the document.

        :param name: The name that will be used for the object in the document.
        :param radius1: The bottom radius of the cone.
        :param radius2: The top radius of the cone.
        :param height: The height of the cone.
        :param angle: The revolution angle of the cone (0: no cone, 180: half cone, 360: full cone).
        :param color: The color of the cone in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa 501
        data = {
            "shape": Parts.Part__Cone.value,
            "name": name if name else self._new_name("Cone"),
            "parameters": {
                "Radius1": radius1,
                "Radius2": radius2,
                "Height": height,
                "Angle": angle,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def add_cylinder(
        self,
        name: str = "",
        radius: float = 1,
        height: float = 1,
        angle: float = 360,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a cylinder to the document.

        :param name: The name that will be used for the object in the document.
        :param radius: The radius of the cylinder.
        :param height: The height of the cylinder.
        :param angle: The revolution angle of the cylinder (0: no cylinder, 180: half cylinder, 360: full cylinder).
        :param color: The color of the cylinder in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        data = {
            "shape": Parts.Part__Cylinder.value,
            "name": name if name else self._new_name("Cylinder"),
            "parameters": {
                "Radius": radius,
                "Height": height,
                "Angle": angle,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def add_sphere(
        self,
        name: str = "",
        radius: float = 5,
        angle1: float = -90,
        angle2: float = 90,
        angle3: float = 360,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a sphere to the document.

        :param name: The name that will be used for the object in the document.
        :param radius: The radius of the sphere.
        :param angle1: The revolution angle of the sphere on the X axis (0: no sphere, 180: half sphere, 360: full sphere).
        :param angle2: The revolution angle of the sphere on the Y axis (0: no sphere, 180: half sphere, 360: full sphere).
        :param angle3: The revolution angle of the sphere on the Z axis (0: no sphere, 180: half sphere, 360: full sphere).
        :param color: The color of the sphere in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        data = {
            "shape": Parts.Part__Sphere.value,
            "name": name if name else self._new_name("Sphere"),
            "parameters": {
                "Radius": radius,
                "Angle1": angle1,
                "Angle2": angle2,
                "Angle3": angle3,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def add_torus(
        self,
        name: str = "",
        radius1: float = 10,
        radius2: float = 2,
        angle1: float = -180,
        angle2: float = 180,
        angle3: float = 360,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a torus to the document.

        :param name: The name that will be used for the object in the document.
        :param radius1: The outer radius of the torus.
        :param radius2: The inner radius of the torus.
        :param angle1: The revolution angle of the torus on the X axis (0: no torus, 180: half torus, 360: full torus).
        :param angle2: The revolution angle of the torus on the Y axis (0: no torus, 180: half torus, 360: full torus).
        :param angle3: The revolution angle of the torus on the Z axis (0: no torus, 180: half torus, 360: full torus).
        :param color: The color of the torus in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        data = {
            "shape": Parts.Part__Torus.value,
            "name": name if name else self._new_name("Torus"),
            "parameters": {
                "Radius1": radius1,
                "Radius2": radius2,
                "Angle1": angle1,
                "Angle2": angle2,
                "Angle3": angle3,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def add_sketch(
        self,
        name: str = "",
        geometry: List[
            Union[geomCircle.IGeomCircle, geomLineSegment.IGeomLineSegment]
        ] = [],
        attachment_offset_position: List[float] = [0, 0, 0],
        attachment_offset_rotation_axis: List[float] = [0, 0, 1],
        attachment_offset_rotation_angle: float = 0,
        color: str = "#808080",
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Add a sketch to the document.

        :param name: The name that will be used for the object in the document.
        :param geometry: The list of geometries for the sketch.
        :param attachment_offset_position: The attachment offset 3D position.
        :param attachment_offset_rotation_axis: The attachment offset 3D axis used for the rotation.
        :param attachment_offset_rotation_angle: The attachment offset rotation angle, in degrees.
        :param color: The color of the sketch in hex format (e.g., "#FF5733") or RGB float list.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """
        data = {
            "shape": Parts.Sketcher__SketchObject.value,
            "name": name if name else self._new_name("Sketch"),
            "parameters": {
                "AttachmentOffset": {
                    "Position": attachment_offset_position,
                    "Axis": attachment_offset_rotation_axis,
                    "Angle": attachment_offset_rotation_angle,
                },
                "Geometry": geometry,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def cut(
        self,
        name: str = "",
        base: str | int = None,
        tool: str | int = None,
        refine: bool = False,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply a cut boolean operation between two objects. If no objects are provided as input, the last two created objects will be used as operands.

        :param name: The name that will be used for the object in the document.
        :param base: The base object that will be used for the cut. Can be the name of the object or its index in the objects list.
        :param tool: The tool object that will be used for the cut. Can be the name of the object or its index in the objects list.
        :param refine: Whether or not to refine the mesh during the cut computation.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        base, tool = self._get_boolean_operands(base, tool)

        # Use specified color or fall back to the base object's color
        if color is None:
            color = self._get_color(base)

        data = {
            "shape": Parts.Part__Cut.value,
            "name": name if name else self._new_name("Cut"),
            "parameters": {
                "Base": base,
                "Tool": tool,
                "Refine": refine,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(base, False)
        self.set_visible(tool, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def fuse(
        self,
        name: str = "",
        shape1: str | int = None,
        shape2: str | int = None,
        refine: bool = False,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply a union boolean operation between two objects. If no objects are provided as input, the last two created objects will be used as operands.

        :param name: The name that will be used for the object in the document.
        :param shape1: The first object used for the union. Can be the name of the object or its index in the objects list.
        :param shape2: The first object used for the union. Can be the name of the object or its index in the objects list.
        :param refine: Whether or not to refine the mesh during the union computation.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        shape1, shape2 = self._get_boolean_operands(shape1, shape2)

        # Use specified color or fall back to the base object's color
        if color is None:
            color = self._get_color(shape1)

        data = {
            "shape": Parts.Part__MultiFuse.value,
            "name": name if name else self._new_name("Fuse"),
            "parameters": {
                "Shapes": [shape1, shape2],
                "Refine": refine,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(shape1, False)
        self.set_visible(shape2, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def intersect(
        self,
        name: str = "",
        shape1: str | int = None,
        shape2: str | int = None,
        refine: bool = False,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply an intersection boolean operation between two objects.
        If no objects are provided as input, the last two created objects will be used as operands.

        :param name: The name that will be used for the object in the document.
        :param shape1: The first object used for the intersection. Can be the name of the object or its index in the objects list.
        :param shape2: The first object used for the intersection. Can be the name of the object or its index in the objects list.
        :param refine: Whether or not to refine the mesh during the intersection computation.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        shape1, shape2 = self._get_boolean_operands(shape1, shape2)

        # Use specified color or fall back to the base object's color
        if color is None:
            color = self._get_color(shape1)

        data = {
            "shape": Parts.Part__MultiCommon.value,
            "name": name if name else self._new_name("Intersection"),
            "parameters": {
                "Shapes": [shape1, shape2],
                "Refine": refine,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(shape1, False)
        self.set_visible(shape2, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def extrude(
        self,
        name: str = "",
        shape: str | int = None,
        direction: List[float] = [0, 0, 1],
        length_fwd: float = 10,
        length_rev: float = 0,
        solid: bool = False,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply an extrusion operation on an object.
        If no object is provided as input, the last created object will be used as operand.

        :param name: The name that will be used for the object in the document.
        :param shape: The input object used for the extrusion. Can be the name of the object or its index in the objects list.
        :param direction: The direction of the extrusion.
        :param length_fwd: The length of the extrusion.
        :param length_rev: The length of the extrusion in the reverse direction.
        :param solid: Whether to create a solid or a shell.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """
        shape = self._get_operand(shape)

        if color is None:
            color = self._get_color(shape)

        data = {
            "shape": Parts.Part__Extrusion.value,
            "name": name if name else self._new_name("Extrusion"),
            "parameters": {
                "Base": shape,
                "Dir": direction,
                "LengthFwd": length_fwd,
                "LengthRev": length_rev,
                "Solid": solid,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(shape, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def chamfer(
        self,
        name: str = "",
        shape: str | int = None,
        edge: int = 0,
        dist: float = 0.1,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply a chamfer operation on an object.
        If no objects are provided as input, the last created object will be used as operand.

        :param name: The name that will be used for the object in the document.
        :param shape: The input object used for the chamfer. Can be the name of the object or its index in the objects list.
        :param edge: The edge index where to apply chamfer.
        :param dist: The distance of the chamfer.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        shape = self._get_operand(shape)

        if color is None:
            color = self._get_color(shape)

        # Use specified color or fall back to the base object's color
        data = {
            "shape": Parts.Part__Chamfer.value,
            "name": name if name else self._new_name("Chamfer"),
            "parameters": {
                "Base": shape,
                "Edge": edge,
                "Dist": dist,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(shape, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def fillet(
        self,
        name: str = "",
        shape: str | int = None,
        edge: int = 0,
        radius: float = 0.1,
        color: Optional[str] = None,
        position: List[float] = [0, 0, 0],
        rotation_axis: List[float] = [0, 0, 1],
        rotation_angle: float = 0,
    ) -> CadDocument:
        """
        Apply a fillet operation on an object.
        If no objects are provided as input, the last created object will be used as operand.

        :param name: The name that will be used for the object in the document.
        :param shape: The input object used for the fillet. Can be the name of the object or its index in the objects list.
        :param edge: The edge index where to apply fillet.
        :param radius: The radius of the fillet.
        :param color: The color in hex format (e.g., "#FF5733") or RGB float list. Defaults to the base object's color if None.
        :param position: The shape 3D position.
        :param rotation_axis: The 3D axis used for the rotation.
        :param rotation_angle: The shape rotation angle, in degrees.
        :return: The document itself.
        """  # noqa E501
        shape = self._get_operand(shape)

        # Use specified color or fall back to the base object's color
        if color is None:
            color = self._get_color(shape)

        data = {
            "shape": Parts.Part__Fillet.value,
            "name": name if name else self._new_name("Fillet"),
            "parameters": {
                "Base": shape,
                "Edge": edge,
                "Radius": radius,
                "Color": color,
                "Placement": {
                    "Position": position,
                    "Axis": rotation_axis,
                    "Angle": rotation_angle,
                },
            },
        }
        self.set_visible(shape, False)
        return self.add_object(OBJECT_FACTORY.create_object(data, self))

    def _get_operand(self, shape: str | int | None, default_idx: int = -1):
        if isinstance(shape, str):
            if shape not in self.objects:
                raise ValueError(f"Unknown object {shape}")
        elif isinstance(shape, int):
            shape = self.objects[shape]
        else:
            shape = self.objects[default_idx]

        return shape

    def _get_boolean_operands(self, shape1: str | int | None, shape2: str | int | None):
        if len(self.objects) < 2:
            raise ValueError(
                "Cannot apply boolean operator if there are less than two objects in the document."  # noqa E501
            )

        shape1 = self._get_operand(shape1, -2)
        shape2 = self._get_operand(shape2, -1)

        return shape1, shape2

    def set_visible(self, name: str, value):
        """
        Set the visibility of an object.

        :param name: The name of the object.
        :param value: The visibility value (True or False).
        """
        obj: Optional[Map] = self._get_yobject_by_name(name)

        if obj is None:
            raise RuntimeError(f"No object named {name}")

        obj["visible"] = value

    def set_color(self, name: str, value: str):
        """
        Set the color of an object.

        :param name: The name of the object.
        :param value: The color in hex format (e.g., "#FF5733").
        """
        obj: Optional[Map] = self._get_yobject_by_name(name)

        if obj is None:
            raise RuntimeError(f"No object named {name}")
        parameters = obj.get("parameters", {})
        parameters["Color"] = value
        obj["parameters"] = parameters

    def check_exist(self, name: str) -> bool:
        if self.objects:
            return name in self.objects
        return False

    def _get_yobject_by_name(self, name: str) -> Optional[Map]:
        if self._objects_array:
            for index, item in enumerate(self._objects_array):
                if item["name"] == name:
                    return self._objects_array[index]
        return None

    def _get_yobject_index_by_name(self, name: str) -> int:
        if self._objects_array:
            for index, item in enumerate(self._objects_array):
                if item["name"] == name:
                    return index
        return -1

    def _new_name(self, obj_type: str) -> str:
        n = 1
        name = f"{obj_type} 1"
        objects = self.objects

        while name in objects:
            name = f"{obj_type} {n}"
            n += 1

        return name


class PythonJcadObject(BaseModel):
    class Config:
        arbitrary_types_allowed = True
        extra = "allow"

    name: str
    # 新增 visible 字段    
    visible: bool = True
    shape: Parts
    parameters: Union[
        IAny,
        IBox,
        ICone,
        ICut,
        ICylinder,
        IExtrusion,
        IIntersection,
        IFuse,
        ISphere,
        ITorus,
        ISketchObject,
        IFillet,
        IChamfer,
    ]
    metadata: Optional[ShapeMetadata]
    _caddoc = Optional[CadDocument]
    _parent = Optional[CadDocument]

    def __init__(__pydantic_self__, parent, **data: Any) -> None:  # noqa
        super().__init__(**data)
        __pydantic_self__._caddoc = CadDocument()
        __pydantic_self__._caddoc.add_object(__pydantic_self__)
        __pydantic_self__._parent = parent


class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ObjectFactoryManager(metaclass=SingletonMeta):
    def __init__(self):
        self._factories: Dict[str, type[BaseModel]] = {}

    def register_factory(self, shape_type: str, cls: type[BaseModel]) -> None:
        if shape_type not in self._factories:
            self._factories[shape_type] = cls

    def create_object(
        self, data: Dict, parent: Optional[CadDocument] = None
    ) -> Optional[PythonJcadObject]:
        object_type = data.get("shape", None)
        name: str = data.get("name", None)
        meta = data.get("shapeMetadata", None)
        # 获取可见性，默认为 True
        visible = data.get("visible", True)

        if object_type and object_type in self._factories:
            Model = self._factories[object_type]
            args = {}
            params = data["parameters"]
            for field in Model.model_fields:
                args[field] = params.get(field, None)
            obj_params = Model(**args)
            return PythonJcadObject(
                parent=parent,
                name=name,
                shape=object_type,
                parameters=obj_params,
                metadata=meta,
                visible=visible
            )

        return None


OBJECT_FACTORY = ObjectFactoryManager()

OBJECT_FACTORY.register_factory(Parts.Part__Any.value, IAny)
OBJECT_FACTORY.register_factory(Parts.Part__Box.value, IBox)
OBJECT_FACTORY.register_factory(Parts.Part__Cone.value, ICone)
OBJECT_FACTORY.register_factory(Parts.Part__Cut.value, ICut)
OBJECT_FACTORY.register_factory(Parts.Part__Cylinder.value, ICylinder)
OBJECT_FACTORY.register_factory(Parts.Part__Extrusion.value, IExtrusion)
OBJECT_FACTORY.register_factory(Parts.Part__MultiCommon.value, IIntersection)
OBJECT_FACTORY.register_factory(Parts.Part__MultiFuse.value, IFuse)
OBJECT_FACTORY.register_factory(Parts.Part__Sphere.value, ISphere)
OBJECT_FACTORY.register_factory(Parts.Part__Torus.value, ITorus)
OBJECT_FACTORY.register_factory(Parts.Sketcher__SketchObject.value, ISketchObject)
OBJECT_FACTORY.register_factory(Parts.Part__Chamfer.value, IChamfer)
OBJECT_FACTORY.register_factory(Parts.Part__Fillet.value, IFillet)