import math
from jupytercad import CadDocument

def create_hollow_t_joint(filename="t_joint.jcad"):
    """
    示例 1: 工业 T 型管道接头 (T-Joint Pipe)
    组合两个圆柱体形成 T 型，并添加法兰，最后钻孔使其空心。
    """
    doc = CadDocument()
    
    # 1. 创建垂直管身 (Vertical Pipe)
    doc.add_cylinder(name="Pipe_Vert", radius=10, height=60, position=[0, 0, 0])
    
    # 2. 创建水平管身 (Horizontal Pipe) - 旋转90度
    doc.add_cylinder(name="Pipe_Horiz", radius=10, height=60, 
                     position=[0, 0, 30], # 提升到垂直管中间
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    
    # 3. 融合垂直和水平管
    doc.fuse(name="T_Shape", shape1="Pipe_Vert", shape2="Pipe_Horiz")
    
    # 4. 创建上部法兰 (Top Flange)
    doc.add_cylinder(name="Flange_Top", radius=15, height=5, position=[0, 0, 60])
    doc.fuse(name="T_With_Top_Flange", shape1="T_Shape", shape2="Flange_Top")
    
    # 5. 创建水平法兰 (Side Flange)
    doc.add_cylinder(name="Flange_Side", radius=15, height=5, 
                     position=[30, 0, 30], 
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    doc.fuse(name="T_Solid", shape1="T_With_Top_Flange", shape2="Flange_Side")
    
    # 6. 钻垂直孔 (Vertical Hole) - 稍长一点以确保完全穿透
    doc.add_cylinder(name="Hole_Vert", radius=8, height=70, position=[0, 0, -5])
    doc.cut(name="T_Hollow_Vert", base="T_Solid", tool="Hole_Vert")
    
    # 7. 钻水平孔 (Horizontal Hole)
    doc.add_cylinder(name="Hole_Horiz", radius=8, height=70, 
                     position=[-5, 0, 30],
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    
    # 最终切割
    doc.cut(name="Final_T_Joint", base="T_Hollow_Vert", tool="Hole_Horiz", color="#E67E22")
    
    
    doc.save(filename)
    # 尝试导出 GLB (需要 pythonocc-core)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_mechanical_bracket(filename="bracket.jcad"):
    """
    示例 2: 机械支架 (U-Bracket)
    使用立方体构建U型底座，并在侧面打孔。
    """
    doc = CadDocument()
    
    # 1. 底座 (Base)
    doc.add_box(name="Base_Plate", length=50, width=40, height=5, position=[-25, -20, 0])
    
    # 2. 左侧板 (Left Wall)
    doc.add_box(name="Wall_Left", length=5, width=40, height=40, position=[-25, -20, 5])
    
    # 3. 右侧板 (Right Wall)
    doc.add_box(name="Wall_Right", length=5, width=40, height=40, position=[20, -20, 5])
    
    # 4. 组合成 U 型
    doc.fuse(name="U_Base_1", shape1="Base_Plate", shape2="Wall_Left")
    doc.fuse(name="U_Base_Final", shape1="U_Base_1", shape2="Wall_Right")
    
    # 5. 侧面轴孔 (Axle Hole) - 穿过两个侧板
    doc.add_cylinder(name="Axle_Hole", radius=5, height=60, 
                     position=[-30, 0, 25], # 位置在侧板中心高度
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    
    # 6. 切割轴孔
    doc.cut(name="Bracket_With_Hole", base="U_Base_Final", tool="Axle_Hole", color="#3498DB")
    
    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_wheel_assembly(filename="wheel.jcad"):
    """
    示例 3: 简易车轮 (Wheel)
    外圈轮胎，内部轮毂，中间挖空并添加轮辐。
    """
    doc = CadDocument()
    
    # 1. 轮胎 (Tire)
    doc.add_cylinder(name="Tire", radius=20, height=10, position=[0, 0, 0])
    
    # 2. 轮毂孔 (Hub Void) - 切掉中间部分，留出轮圈
    doc.add_cylinder(name="Rim_Cutout", radius=15, height=12, position=[0, 0, -1])
    doc.cut(name="Rim", base="Tire", tool="Rim_Cutout", color="#2C3E50")
    
    # 3. 中心轴 (Hub)
    doc.add_cylinder(name="Hub", radius=5, height=10, position=[0, 0, 0], color="#95A5A6")
    
    # 4. 辐条 1 (Spoke 1)
    doc.add_box(name="Spoke_1", length=36, width=4, height=6, position=[-18, -2, 2])
    
    # 5. 辐条 2 (Spoke 2) - 旋转90度
    doc.add_box(name="Spoke_2", length=4, width=36, height=6, position=[-2, -18, 2])
    
    # 6. 组合所有部件
    # 注意：cad_document 中的 MultiFuse 可以一次融合多个，
    # 但这里的 fuse 函数封装只接受两个参数。我们需要链式操作。
    doc.fuse(name="Wheel_Step1", shape1="Rim", shape2="Hub")
    doc.fuse(name="Wheel_Step2", shape1="Wheel_Step1", shape2="Spoke_1")
    doc.fuse(name="Final_Wheel", shape1="Wheel_Step2", shape2="Spoke_2", color="#5D6D7E")
    
    # 7. 轴孔 (Axle Hole)
    doc.add_cylinder(name="Center_Hole", radius=2, height=20, position=[0, 0, -5])
    doc.cut(name="Wheel_Ready", base="Final_Wheel", tool="Center_Hole")

    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_rocket_toy(filename="rocket.jcad"):
    """
    示例 4: 玩具火箭 (Toy Rocket)
    组合圆柱体、圆锥体和立方体（作为尾翼）。
    """
    doc = CadDocument()
    
    # 1. 火箭主体 (Body)
    doc.add_cylinder(name="Body", radius=10, height=60, position=[0, 0, 0])
    
    # 2. 鼻锥 (Nose Cone)
    doc.add_cone(name="Nose", radius1=10, radius2=0.01, height=20, position=[0, 0, 60])
    doc.fuse(name="Rocket_Main", shape1="Body", shape2="Nose")
    
    # 3. 尾翼 1 (Fin 1)
    # 使用 Box 模拟薄片尾翼
    doc.add_box(name="Fin_1", length=40, width=2, height=15, position=[-20, -1, 0])
    
    # 4. 尾翼 2 (Fin 2)
    doc.add_box(name="Fin_2", length=2, width=40, height=15, position=[-1, -20, 0])
    
    # 5. 组合尾翼
    doc.fuse(name="Rocket_Step1", shape1="Rocket_Main", shape2="Fin_1")
    doc.fuse(name="Final_Rocket", shape1="Rocket_Step1", shape2="Fin_2", color="#E74C3C")
    
    # 6. 底部喷口 (Exhaust) - 切割底部
    doc.add_cone(name="Exhaust_Cut", radius1=8, radius2=4, height=5, position=[0, 0, -1])
    doc.cut(name="Rocket_Complete", base="Final_Rocket", tool="Exhaust_Cut")
    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_abstract_sculpture(filename="sculpture.jcad"):
    """
    示例 5: 抽象几何雕塑 (Boolean Cube Frame)
    一个立方体，三个方向各挖去一个圆柱体，中心形成复杂的空腔结构。
    """
    doc = CadDocument()
    
    # 1. 主立方体 (Main Cube)
    size = 40
    doc.add_box(name="Cube", length=size, width=size, height=size, 
                position=[-size/2, -size/2, -size/2], color="#9B59B6")
    
    # 2. X轴切割柱 (Cylinder X)
    doc.add_cylinder(name="Cyl_X", radius=15, height=size+10, 
                     position=[-(size+10)/2, 0, 0],
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    
    # 3. Y轴切割柱 (Cylinder Y)
    doc.add_cylinder(name="Cyl_Y", radius=15, height=size+10, 
                     position=[0, -(size+10)/2, 0],
                     rotation_axis=[1, 0, 0], rotation_angle=90) # 注意：Cylinder默认朝Z，绕X转90变Y
                     
    # 4. Z轴切割柱 (Cylinder Z)
    doc.add_cylinder(name="Cyl_Z", radius=15, height=size+10, 
                     position=[0, 0, -(size+10)/2])
    
    # 5. 执行连续切割
    doc.cut(name="Shape_Step1", base="Cube", tool="Cyl_X")
    doc.cut(name="Shape_Step2", base="Shape_Step1", tool="Cyl_Y")
    doc.cut(name="Final_Sculpture", base="Shape_Step2", tool="Cyl_Z", color="#8E44AD")
    
    # 6. 在中心放一个球体 (Inner Sphere)
    doc.add_sphere(name="Core_Sphere", radius=10, position=[0, 0, 0], color="#F1C40F")
    # 不融合，保持独立物体展示内部结构

    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))

def create_v6_engine_block(filename="v6_engine.jcad"):
    """
    示例 6: V6 发动机缸体
    难点：复合角度切割。需要在一个实体上，以特定夹角（如60度）
    精确切割出6个气缸孔，以及中间的曲轴通道。
    """
    doc = CadDocument()
    
    block_len = 100
    block_width = 80
    block_height = 60
    
    # 1. 铸造主体 (Main Cast)
    doc.add_box(name="Engine_Block_Raw", length=block_len, width=block_width, height=block_height, 
                position=[-block_len/2, -block_width/2, 0], color="#95A5A6")
    
    # 2. 挖掉中间的 V 型槽 (The V-Valley)
    # 使用一个旋转的 Box 切掉顶部中间
    doc.add_box(name="V_Cut_Tool", length=block_len + 10, width=40, height=40,
                position=[-(block_len+5)/2, -20, block_height],
                rotation_axis=[1, 0, 0], rotation_angle=45) # 倾斜45度切一刀
    
    # 这里为了简单，我们直接切气缸孔，不做复杂的 V-Valley 倒角，保留工业粗狂感
    
    current_shape = "Engine_Block_Raw"
    
    # 3. 切割 6 个气缸 (Cylinders) - V型夹角 60度 (左右各30度)
    # 气缸排列在 Y 轴方向
    bore_radius = 6
    bore_depth = 50
    cylinder_spacing = 28
    
    # 左排气缸 (Left Bank) - 倾斜 -30 度
    for i in range(3):
        cyl_name = f"Cyl_L_{i}"
        y_pos = -block_width/3 + (i * cylinder_spacing)
        
        # 复杂的定位：需要根据角度计算偏移，确保孔在表面中心对齐
        # 简单处理：将圆柱放高一点，旋转后往下插
        doc.add_cylinder(name=cyl_name, radius=bore_radius, height=bore_depth,
                         position=[0, y_pos, block_height - 10], # 初始位置
                         rotation_axis=[0, 1, 0], rotation_angle=-30) # 绕Y轴转 (注意坐标系方向)
        
        # 由于 add_cylinder 的 rotation_axis 是局部轴，我们需要更精确的控制。
        # 这里的 CadDocument 逻辑是：先旋转，再平移。
        # V型引擎通常是绕 X 轴排列的（如果曲轴在 X 轴）。
        # 让我们修正坐标系：假设 X 是曲轴方向。
        # 左排：绕 X 轴旋转。
        
        # 修正：将气缸工具重置
        doc.remove(cyl_name) 
        x_pos = -block_len/3 + (i * cylinder_spacing) + 10
        doc.add_cylinder(name=cyl_name, radius=bore_radius, height=bore_depth*1.5,
                         position=[x_pos, -15, block_height], # 偏左
                         rotation_axis=[1, 0, 0], rotation_angle=30) # 绕X轴向内倾斜
        
        cut_name = f"Block_Cut_L_{i}"
        doc.cut(name=cut_name, base=current_shape, tool=cyl_name)
        current_shape = cut_name

    # 右排气缸 (Right Bank) - 倾斜 +30 度
    for i in range(3):
        cyl_name = f"Cyl_R_{i}"
        x_pos = -block_len/3 + (i * cylinder_spacing) + 10 # 错开一点点(连杆错位)
        doc.add_cylinder(name=cyl_name, radius=bore_radius, height=bore_depth*1.5,
                         position=[x_pos, 15, block_height], # 偏右
                         rotation_axis=[1, 0, 0], rotation_angle=-30)
        
        cut_name = f"Block_Cut_R_{i}"
        doc.cut(name=cut_name, base=current_shape, tool=cyl_name)
        current_shape = cut_name

    # 4. 曲轴通道 (Crankshaft Tunnel) - 贯穿 X 轴
    doc.add_cylinder(name="Crank_Tunnel", radius=12, height=block_len + 20,
                     position=[-(block_len+10)/2, 0, 15],
                     rotation_axis=[0, 1, 0], rotation_angle=90)
    
    doc.cut(name="V6_Engine_Final", base=current_shape, tool="Crank_Tunnel", color="#7F8C8D")
    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))

def create_ball_bearing(filename="bearing.jcad"):
    """
    示例 8: 滚珠轴承
    难点：曲面切割（Torus cut Cylinder）生成跑道（Race），
    以及极坐标阵列放置滚珠。
    """
    doc = CadDocument()
    
    od = 60 # 外径
    id = 30 # 内径
    width = 20
    ball_radius = 7
    
    # 1. 外圈 (Outer Race)
    doc.add_cylinder(name="Outer_Cyl_Raw", radius=od/2, height=width, position=[0,0,0])
    doc.add_cylinder(name="Outer_Cyl_Hole", radius=(od/2) - 5, height=width+2, position=[0,0,-1])
    doc.cut(name="Outer_Ring", base="Outer_Cyl_Raw", tool="Outer_Cyl_Hole")
    
    # 2. 内圈 (Inner Race)
    doc.add_cylinder(name="Inner_Cyl_Raw", radius=(id/2) + 5, height=width, position=[0,0,0])
    doc.add_cylinder(name="Inner_Cyl_Hole", radius=id/2, height=width+2, position=[0,0,-1])
    doc.cut(name="Inner_Ring", base="Inner_Cyl_Raw", tool="Inner_Cyl_Hole")
    
    # 3. 切割滚珠轨道 (Grooves)
    # 轨道是一个 Torus（环形），需要从内圈的外壁和外圈的内壁切掉
    race_radius = (od + id) / 4 # 滚珠中心所在的半径
    
    # 轨道工具
    doc.add_torus(name="Groove_Tool", radius1=race_radius, radius2=ball_radius + 0.5, 
                  position=[0,0, width/2]) # Z轴居中
    
    doc.cut(name="Outer_Race_Final", base="Outer_Ring", tool="Groove_Tool", color="#BDC3C7")
    
    # 注意：Groove_Tool 在上一步切完后可能被消耗（取决于内核实现，CadDocument里设为invisible了）
    # 我们需要重新添加或复制。这里重新添加一个。
    doc.add_torus(name="Groove_Tool_2", radius1=race_radius, radius2=ball_radius + 0.5, 
                  position=[0,0, width/2])
    
    doc.cut(name="Inner_Race_Final", base="Inner_Ring", tool="Groove_Tool_2", color="#7F8C8D")
    
    # 4. 放置滚珠 (Balls)
    num_balls = 8
    angle_step = 360 / num_balls
    
    balls_compound = None
    
    for i in range(num_balls):
        angle_rad = math.radians(i * angle_step)
        x = race_radius * math.cos(angle_rad)
        y = race_radius * math.sin(angle_rad)
        
        b_name = f"Ball_{i}"
        doc.add_sphere(name=b_name, radius=ball_radius, position=[x, y, width/2], color="#F1C40F")
        
        if balls_compound is None:
            balls_compound = b_name
        else:
            new_name = f"Balls_Agg_{i}"
            doc.fuse(name=new_name, shape1=balls_compound, shape2=b_name)
            balls_compound = new_name

    # 5. 保持架 (Cage) - 简化版：一个有孔的薄环
    # 略，为了代码简洁，仅展示核心结构

    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_dna_tower(filename="dna_tower.jcad"):
    """
    示例 9: DNA 双螺旋塔
    难点：数学计算。使用正弦函数控制每一层的位置偏移，
    构建出有机的扭曲结构。
    """
    doc = CadDocument()
    
    floors = 20
    floor_height = 4
    radius = 15
    twist_per_floor = 15 # degrees
    
    # 两个螺旋支柱 (Helix Strands)
    prev_floor_a = None
    prev_floor_b = None
    
    for i in range(floors):
        z = i * floor_height
        angle = i * twist_per_floor
        rad = math.radians(angle)
        
        # 链 A 位置
        ax = radius * math.cos(rad)
        ay = radius * math.sin(rad)
        
        # 链 B 位置 (相位差 180度)
        bx = radius * math.cos(rad + math.pi)
        by = radius * math.sin(rad + math.pi)
        
        # 创建楼板 (连接 A 和 B 的桥梁)
        # 使用 Box，并旋转到当前角度
        floor_name = f"Floor_{i}"
        doc.add_box(name=floor_name, length=radius*2.5, width=6, height=1,
                    position=[-radius*1.25, -3, 0], # 局部居中
                    rotation_axis=[0,0,1], rotation_angle=angle)
        
        # 修正 Box 的 Z 高度：先旋转，再平移（需要复杂的矩阵变换，或者简单点：由add_box参数直接控制）
        # CadDocument 的 Placement 逻辑：先旋转后平移。
        # 所以我们将 Box 放在原点旋转，然后平移到 Z。
        # 重新添加：
        doc.remove(floor_name)
        doc.add_box(name=floor_name, length=radius*2.5, width=6, height=1,
                    position=[0, 0, z], # Z轴提升
                    rotation_axis=[0,0,1], rotation_angle=angle) # 绕Z轴旋转
        
        # 放置立柱 (Columns)
        # 这里用球体代表节点
        node_a = f"Node_A_{i}"
        node_b = f"Node_B_{i}"
        
        doc.add_sphere(name=node_a, radius=2, position=[ax, ay, z], color="#3498DB")
        doc.add_sphere(name=node_b, radius=2, position=[bx, by, z], color="#E74C3C")
        
        # 融合这一层
        layer_name = f"Layer_{i}"
        doc.fuse(name=f"Layer_Tmp_{i}", shape1=node_a, shape2=node_b)
        doc.fuse(name=layer_name, shape1=f"Layer_Tmp_{i}", shape2=floor_name)
        
        # 将这一层融合到主塔
        if prev_floor_a is None:
            prev_floor_a = layer_name
        else:
            new_main = f"Tower_Step_{i}"
            doc.fuse(name=new_main, shape1=prev_floor_a, shape2=layer_name)
            prev_floor_a = new_main
            
    # 最后给颜色
    doc.set_color(prev_floor_a, "#ECF0F1")
    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))


def create_planetary_gear(filename="gear_system.jcad"):
    """
    示例 10: 行星齿轮组 (近似)
    难点：多对象阵列与齿牙模拟。
    因为没有 Extrude(Polygon)，我们用“切槽法”模拟齿轮。
    """
    doc = CadDocument()
    
    def create_gear_approximation(name, r, height, teeth_count, color, center=[0,0,0]):
        # 1. 齿轮本体
        body_name = f"{name}_Body"
        doc.add_cylinder(name=body_name, radius=r, height=height, position=center, color=color)
        
        # 2. 挖齿 (Teeth)
        # 在圆周上切掉一圈方块
        current_gear = body_name
        cut_w = (2 * math.pi * r) / teeth_count / 2 # 齿槽宽
        
        # 为了性能，只切 0, 90, 180, 270 四个方向示意，或者切全部但数量少点
        step = 1 if teeth_count < 10 else 2 # 抽样切，防止过卡
        
        for i in range(0, teeth_count, step):
            angle = (360 / teeth_count) * i
            rad = math.radians(angle)
            
            # 计算切刀位置：在边缘
            cut_x = center[0] + (r * math.cos(rad))
            cut_y = center[1] + (r * math.sin(rad))
            
            tool_name = f"{name}_Cut_{i}"
            doc.add_box(name=tool_name, length=r/3, width=cut_w, height=height+2,
                        position=[0, -cut_w/2, center[2]-1], # 局部
                        rotation_axis=[0,0,1], rotation_angle=angle)
            
            # 修正位置：旋转后平移
            doc.remove(tool_name)
            doc.add_box(name=tool_name, length=r/3, width=cut_w, height=height+2,
                        position=[cut_x, cut_y, center[2]-1],
                        rotation_axis=[0,0,1], rotation_angle=angle)
            
            step_name = f"{name}_Step_{i}"
            doc.cut(name=step_name, base=current_gear, tool=tool_name, color=color)
            current_gear = step_name
            
        return current_gear

    # 太阳轮 (Sun Gear)
    sun_r = 15
    sun_gear = create_gear_approximation("Sun", sun_r, 10, 12, "#F39C12")
    
    # 行星轮 (Planet Gears) - 3个
    planet_r = 10
    dist = sun_r + planet_r + 1 # 中心距
    
    planets = []
    for i in range(3):
        angle = 120 * i
        rad = math.radians(angle)
        px = dist * math.cos(rad)
        py = dist * math.sin(rad)
        
        p_name = f"Planet_{i}"
        pg = create_gear_approximation(p_name, planet_r, 10, 8, "#2ECC71", center=[px, py, 0])
        planets.append(pg)
        
    # 齿圈 (Ring Gear) - 外壳
    ring_ir = dist + planet_r + 1
    ring_or = ring_ir + 5
    
    doc.add_cylinder(name="Ring_Out", radius=ring_or, height=10, position=[0,0,0])
    doc.add_cylinder(name="Ring_In", radius=ring_ir, height=12, position=[0,0,-1])
    doc.cut(name="Ring_Gear", base="Ring_Out", tool="Ring_In", color="#34495E")
    
    # 将所有齿轮组合在一起 (Visual grouping via Fuse, though mechanically they are separate)
    # 这里我们只保留它们独立存在即可，或者加一个底座
    
    doc.add_cylinder(name="Base_Shaft", radius=4, height=30, position=[0,0,-10])
    
    doc.save(filename)
    doc.export("converted/" + filename.replace(".jcad", ".glb"))

if __name__ == "__main__":
    try:
        print("Starting algorithmic generation of complex models...")
        create_v6_engine_block()
        create_ball_bearing()
        create_dna_tower()
        create_planetary_gear()
        print("All operations completed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")