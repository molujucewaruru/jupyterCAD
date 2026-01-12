from jupytercad import CadDocument
import math

# 配色方案
FERRARI_RED = "#D40000"
WINDOW_BLACK = "#111111"
CARBON_BLACK = "#0A0A0A"
WHEEL_SILVER = "#CCCCCC"
YELLOW_BADGE = "#FFDD00"

class FerrariCyberBuilder:
    def __init__(self, filename="ferrari_cyber_concept.jcad"):
        self.doc = CadDocument()
        self.filename = filename

    def to_rad(self, deg):
        return deg * (math.pi / 180)

    def build_chassis_frame(self):
        """
        构建底盘骨架，作为所有部件的连接基础，防止零件悬空。
        """
        print("Welding Chassis Frame...")
        # 核心底板 (The spine)
        self.doc.add_box(name="Chassis_Main", length=420, width=160, height=15, 
                         position=[0, 0, 15], color=CARBON_BLACK)
        
        # 前轮轴连接处
        self.doc.add_box(name="Axle_Front_Block", length=40, width=190, height=15,
                         position=[140, 0, 15], color=CARBON_BLACK)
        # 后轮轴连接处
        self.doc.add_box(name="Axle_Rear_Block", length=40, width=190, height=15,
                         position=[-140, 0, 15], color=CARBON_BLACK)
        
        # 融合底盘
        self.doc.fuse(name="Chassis_1", shape1="Chassis_Main", shape2="Axle_Front_Block")
        self.doc.fuse(name="Chassis_Final", shape1="Chassis_1", shape2="Axle_Rear_Block", color=CARBON_BLACK)
        self.base = "Chassis_Final"

    def build_body_shell(self):
        """
        【核心技巧】：使用旋转的扁平Box拼接出流线型外壳。
        像折纸一样拼接车身。
        """
        print("Assembling Body Panels...")
        
        parts = [] # 暂存车身部件名称
        
        # 1. 车头盖 (Hood) - 向下倾斜
        # 位置计算：车头中心 x=120, z=45. 旋转后需要调整位置保证连接
        self.doc.add_box(name="Panel_Hood", length=140, width=170, height=5,
                         position=[130, 0, 45], 
                         rotation_axis=[0, 1, 0], rotation_angle=12, color=FERRARI_RED)
        parts.append("Panel_Hood")

        # 2. 前保险杠/鼻锥 (Nose Cone) - 更陡的角度
        self.doc.add_box(name="Panel_Nose", length=50, width=170, height=5,
                         position=[205, 0, 25],
                         rotation_axis=[0, 1, 0], rotation_angle=45, color=FERRARI_RED)
        parts.append("Panel_Nose")

        # 3. 前铲 (Splitter) - 底部纯平
        self.doc.add_box(name="Aero_Splitter", length=30, width=180, height=2,
                         position=[220, 0, 10], color=CARBON_BLACK)
        parts.append("Aero_Splitter")

        # 4. 挡风玻璃 (Windshield) - 大角度后倾
        self.doc.add_box(name="Panel_Windshield", length=110, width=160, height=4,
                         position=[50, 0, 80],
                         rotation_axis=[0, 1, 0], rotation_angle=60, color=WINDOW_BLACK)
        parts.append("Panel_Windshield")

        # 5. 车顶 (Roof) - 略微弧度，用两块板拼
        self.doc.add_box(name="Panel_Roof", length=70, width=150, height=4,
                         position=[-10, 0, 108], color=FERRARI_RED)
        parts.append("Panel_Roof")

        # 6. 后背/引擎盖 (Rear Deck/Engine Cover) - 经典的百叶窗斜坡
        # 长长的斜坡连接车顶和车尾
        self.doc.add_box(name="Panel_RearDeck", length=160, width=160, height=5,
                         position=[-100, 0, 85],
                         rotation_axis=[0, 1, 0], rotation_angle=-15, color=FERRARI_RED)
        parts.append("Panel_RearDeck")

        # 7. 车侧裙板 (Side Skirts) - 连接前后轮
        # 左侧
        self.doc.add_box(name="Skirt_L", length=200, width=10, height=30,
                         position=[0, 85, 30], color=FERRARI_RED)
        # 右侧
        self.doc.add_box(name="Skirt_R", length=200, width=10, height=30,
                         position=[0, -85, 30], color=FERRARI_RED)
        parts.append("Skirt_L")
        parts.append("Skirt_R")

        # --- 融合所有车身板件 ---
        # 这是一个串行融合过程，确保所有板件连成一体
        current_body = self.base
        for part in parts:
            new_name = f"Body_Fused_{part}"
            # 注意：如果 fuse 失败，可能是因为两个物体没有重叠。
            # 我们的板件设计上是有轻微重叠的，应该没问题。
            self.doc.fuse(name=new_name, shape1=current_body, shape2=part, color=FERRARI_RED)
            current_body = new_name
        
        self.body = current_body

    def build_widebody_fenders(self):
        """
        宽体轮眉。为了不让它们看起来像简单的圆柱，
        我们使用多边形近似法（用3个旋转的方块组成拱门）。
        """
        print("Adding Widebody Fenders...")
        
        def add_arch(name_prefix, x, y, is_front):
            width = 20
            length = 50 if is_front else 60
            height = 10
            base_z = 45
            
            # 拱门顶部
            top_name = f"{name_prefix}_Top"
            self.doc.add_box(name=top_name, length=length, width=width, height=height,
                             position=[x, y, base_z + 20], color=FERRARI_RED)
            
            # 拱门前部 (旋转)
            front_name = f"{name_prefix}_Front"
            self.doc.add_box(name=front_name, length=length, width=width, height=height,
                             position=[x + length/1.5, y, base_z + 5],
                             rotation_axis=[0, 1, 0], rotation_angle=45, color=FERRARI_RED)

            # 拱门后部 (旋转)
            rear_name = f"{name_prefix}_Rear"
            self.doc.add_box(name=rear_name, length=length, width=width, height=height,
                             position=[x - length/1.5, y, base_z + 5],
                             rotation_axis=[0, 1, 0], rotation_angle=-45, color=FERRARI_RED)
            
            # 融合
            self.doc.fuse(name=f"{name_prefix}_M1", shape1=self.body, shape2=top_name)
            self.doc.fuse(name=f"{name_prefix}_M2", shape1=f"{name_prefix}_M1", shape2=front_name)
            self.doc.fuse(name=f"{name_prefix}_Final", shape1=f"{name_prefix}_M2", shape2=rear_name, color=FERRARI_RED)
            self.body = f"{name_prefix}_Final"

        # 前轮
        add_arch("Fender_FL", 140, 85, True)
        add_arch("Fender_FR", 140, -85, True)
        # 后轮
        add_arch("Fender_RL", -140, 88, False)
        add_arch("Fender_RR", -140, -88, False)

    def build_cyber_wheels(self):
        """
        构建低多边形风格的轮子。
        使用 Cylinder 但配合不同颜色做出轮毂效果。
        """
        print("Mounting Cyber Wheels...")
        
        positions = [
            (140, 82), (140, -82),   # 前轮
            (-140, 85), (-140, -85)  # 后轮
        ]
        
        for i, (x, y) in enumerate(positions):
            # 宽胎
            tire_name = f"Wheel_Tire_{i}"
            radius = 33 if i < 2 else 35 # 后轮略大
            width = 28
            self.doc.add_cylinder(name=tire_name, radius=radius, height=width,
                                  position=[x, y, radius],
                                  rotation_axis=[1, 0, 0], rotation_angle=90, color="#151515")
            
            # 轮圈 (Rim) - 稍微小一点，银色
            rim_name = f"Wheel_Rim_{i}"
            # 稍微突出一点点
            offset_y = 2 if y > 0 else -2
            self.doc.add_cylinder(name=rim_name, radius=radius-8, height=width+4,
                                  position=[x, y + offset_y, radius],
                                  rotation_axis=[1, 0, 0], rotation_angle=90, color=WHEEL_SILVER)
            
            # 中心锁 (Center Lock) - 红色
            lock_name = f"Wheel_Lock_{i}"
            offset_y_lock = 4 if y > 0 else -4
            self.doc.add_cylinder(name=lock_name, radius=5, height=width+6,
                                  position=[x, y + offset_y_lock, radius],
                                  rotation_axis=[1, 0, 0], rotation_angle=90, color="#FF0000")

    def build_f40_wing(self):
        """
        构建尾翼。使用板件拼接，而不是切割。
        """
        print("Installing Aero Wing...")
        wing_x = -190
        wing_z = 105
        
        # 侧翼板 (Side Plates) - 三角形感觉
        # 用旋转的Box模拟三角形
        self.doc.add_box(name="Wing_Side_L", length=60, width=5, height=30,
                         position=[wing_x, 85, wing_z],
                         rotation_axis=[0, 1, 0], rotation_angle=20, color=FERRARI_RED)
        
        self.doc.add_box(name="Wing_Side_R", length=60, width=5, height=30,
                         position=[wing_x, -85, wing_z],
                         rotation_axis=[0, 1, 0], rotation_angle=20, color=FERRARI_RED)
        
        # 融合侧板到车身
        self.doc.fuse(name="Body_W_WingL", shape1=self.body, shape2="Wing_Side_L")
        self.doc.fuse(name="Body_W_WingR", shape1="Body_W_WingL", shape2="Wing_Side_R", color=FERRARI_RED)
        self.body = "Body_W_WingR"
        
        # 主翼片 (Main Foil)
        self.doc.add_box(name="Wing_Foil", length=30, width=170, height=4,
                         position=[wing_x+10, 0, wing_z+15], 
                         rotation_axis=[0, 1, 0], rotation_angle=10, color=FERRARI_RED) # 稍微带点攻角
        
        self.doc.fuse(name="Body_Final", shape1=self.body, shape2="Wing_Foil", color=FERRARI_RED)
        self.body = "Body_Final"

    def build_details(self):
        """
        细节：尾灯和排气
        """
        # 尾部格栅
        self.doc.add_box(name="Rear_Grille", length=5, width=150, height=25,
                         position=[-210, 0, 60], color="#111")
        
        # 圆形尾灯
        for i, y in enumerate([-40, -20, 20, 40]):
            self.doc.add_cylinder(name=f"Taillight_{i}", radius=5, height=10,
                                  position=[-212, y, 60],
                                  rotation_axis=[0, 1, 0], rotation_angle=90, color="#FF0000")
            
        # 三出排气
        self.doc.add_box(name="Exhaust_Box", length=10, width=30, height=10,
                         position=[-215, 0, 30], color="#333")


    def run(self):
        self.build_chassis_frame()
        self.build_body_shell()     # 核心：拼接蒙皮
        self.build_widebody_fenders() # 核心：宽体组件
        self.build_cyber_wheels()   # 独立部件
        self.build_f40_wing()       # 空力套件
        self.build_details()
        
        print(f"Saving Cyber-Ferrari to {self.filename}...")
        self.doc.save(self.filename)

if __name__ == "__main__":
    builder = FerrariCyberBuilder()
    builder.run()
    print("Generation Complete.")