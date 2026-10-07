import {newArticles} from './new-content';
import {deep} from './deep-content';
export type Domain='aidc'|'robot'|'ml';
export type Article={id:string;domain:Domain;category:string;title:string;summary:string;level:string;minutes:number;sections:{title:string;text:string}[];checks:string[];source:string;sourceName:string;kind:'手册'|'案例';};
const refs={
ocp:['Open Compute Project · 开放硬件资料','https://www.opencompute.org/'],
iea:['IEA · Energy and AI (2025)','https://www.iea.org/reports/energy-and-ai'],
nccl:['NVIDIA NCCL 文档','https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html'],
prom:['Prometheus 官方文档','https://prometheus.io/docs/introduction/overview/'],
ros:['ROS 2 Jazzy 文档','https://docs.ros.org/en/jazzy/index.html'],
moveit:['MoveIt 2 文档','https://moveit.picknik.ai/main/index.html'],
isaac:['NVIDIA Isaac Lab','https://developer.nvidia.com/isaac/lab'],
groot:['NVIDIA Isaac GR00T','https://developer.nvidia.com/isaac/gr00t'],
unitree:['Unitree G1 官方资料','https://www.unitree.com/g1'],
};
type Row=[string,Domain,string,string,string,string,string,string,string,string[],keyof typeof refs,('手册'|'案例')?];
const rows:Row[]=[
['a01','aidc','规划与土建','从业务负载到机房规划','先确定算力交付目标，再推导电力、空间与冷却边界。','基础','规划的起点不是机柜数量，而是训练或推理业务的规模、交付周期与服务等级。训练偏重集群互联与连续运行；推理更关注时延、弹性和成本。将业务需求转换为 IT 负载曲线，区分装机额定功率、同时使用系数与实际计量功率。','总图需要联合检查电网接入、变电站容量、洪涝风险、交通运输、承重与扩容路径。楼面均布荷载不能替代机柜脚轮、支腿的局部荷载校核；液冷还会增加管路和存液重量。施工图与承载校核必须由有资质的专业人员完成。','先制作设备清单与逐期上架计划，再把电力、冷却、网络和空间的可用容量逐项配平。一个系统有余量，不代表整个机房有可用容量。',['区分本期交付与远期预留','核对净高、搬运通道和设备更换路径','记录场地与供电约束'], 'ocp'],
['a02','aidc','供配电','市电到 GPU：供电链路全解','变压器、开关柜、UPS、母线与机柜 PDU 的职责边界。','基础','典型链路是市电接入、变压器、低压配电、UPS、末端配电与服务器电源。发电机承担长时间后备，UPS 提供短时储能与电能调节。双路供电是否真正独立，需要追溯上游共因故障点。','三相交流有功功率近似 P=√3×U×I×功率因数，单位一致时得到 W。kW 是功率，kWh 是一段时间的电量。配电容量选择还应考虑谐波、冲击、环境温度、保护选择性及当地规范，不能只把设备铭牌相加。','巡检应联看三相不平衡、电流、接头温度、断路器状态和告警。切换演练必须有审批、回退和旁站，禁止以在线试错验证供电拓扑。',['绘制端到端单线图','检查 A/B 路是否共用上游单点','核对保护定值与选择性'], 'ocp'],
['a03','aidc','供配电','N+1、2N 与可维护性','冗余数量不等于业务可用性。','进阶','N 指满足设计负载所需的容量，N+1 是额外保留一个模块，2N 是两套完整容量。需要分别分析容量冗余、路径冗余、控制冗余与维护隔离。共享母线、阀门或控制器仍可能形成单点。','假设三台 500 kW 模块组成 1,000 kW 的 N+1 系统，移除一台后剩余容量恰好满足设计值。但环境降额、维护期间再故障和电池能力都可能改变结论，此示例不能直接用于选型。','用故障模式与影响分析逐一验证：设备失效、检修隔离、误操作、公共控制故障。指标应包含恢复时间、可维护性和演练通过率，而不仅是设备数量。',['核验最不利降额条件','模拟计划维护后的供电路径','建立切换回退清单'], 'ocp'],
['a04','aidc','制冷与液冷','冷板、CDU 与双回路液冷','理解从芯片热量到室外冷源的完整路径。','基础','冷板把芯片热量传给工艺侧冷却液，机柜歧管汇集流量，CDU 通过换热器和泵把热量交给设施水。两侧回路通常隔离，以管理水质、压力和材料兼容性；具体拓扑以厂商设计为准。','热量近似 Q=ṁ×cp×ΔT。水的比热约为 4.18 kJ/(kg·K)，但冷却液添加剂会改变物性。流量不足、过滤器堵塞、气泡与压差异常都可能造成热点。设计要核对供回水温度、露点、压降、冗余和维护旁路。','不能把液冷覆盖率当作全部热量已被带走：内存、存储、电源等仍可能依靠风冷。验收需要在实际功率阶跃下观察芯片温度与回路响应。',['核对材料和水质兼容性','设置漏液检测与联动策略','保留残余风冷能力'], 'ocp'],
['a05','aidc','制冷与液冷','冷热通道与气流组织','制冷量充足，为什么服务器仍然过热？','基础','冷热通道的目标是减少送回风短路和热风再循环。机柜正面相对形成冷通道，背面相对形成热通道。封闭结构需结合消防、压差、人员通行与检修要求设计。','温度传感器应覆盖机柜进风侧上中下位置。只看机房平均温度会掩盖局部热点。盲板、孔洞封堵、风量分配和线缆阻塞都影响气流组织。','排障先定位进风温度异常柜，再核对负载、风扇状态、旁路和回风路径。不可一味降低空调设定温度，否则可能增加能耗并引入凝露风险。',['检查盲板和穿线孔密封','记录进风而非仅环境温度','核对通道封闭与消防联动'], 'ocp'],
['a06','aidc','服务器与 GPU','GPU 服务器：算力之外看什么','HBM、互联、精度与软件生态共同决定有效产出。','基础','GPU 服务器由 CPU、GPU、内存、存储、网卡、电源和散热构成。GPU 峰值 FLOPS 仅表示特定精度和条件下的理论计算能力；比较时需注明 FP32、BF16、FP8 及是否使用稀疏计算。','模型权重占用近似参数量×每参数字节数，实际推理还包括 KV Cache、激活、框架和临时缓冲。训练额外需要梯度与优化器状态。HBM 容量与带宽不足会限制模型规模或吞吐。','选型使用真实业务压测，记录吞吐、首 token 时延、尾延迟、功耗和错误率。不同软件版本、并发与序列长度的结果不可直接横比。',['注明计算精度与稀疏口径','核对服务器电源和散热能力','测量业务有效吞吐'], 'nccl'],
['a07','aidc','网络与互联','Scale-up 与 Scale-out 网络','机内高速互联、跨节点 RDMA 与业务以太网。','进阶','Scale-up 扩大紧耦合计算域，Scale-out 通过网络扩展节点数量。管理网、存储网、业务网和训练网可以逻辑或物理隔离，隔离策略取决于故障域与性能目标。','RDMA 减少数据移动中的 CPU 参与。RoCE 通常依赖以太网的拥塞控制和正确队列配置；PFC 并非越多越好，不当配置可能引发暂停传播。InfiniBand 与 RoCE 的比较应包含生态、运维和完整成本。','集群验收需覆盖点对点带宽和集合通信，结合 NCCL 测试查看 AllReduce 的规模效率。应用扩展不佳时检查拓扑映射、拥塞、重传与跨域路径，而非只看端口标称速率。',['确认超售比和故障域','记录 MTU、ECN 与队列策略','对比单节点与多节点效率'], 'nccl'],
['a08','aidc','存储系统','训练数据与检查点的存储设计','吞吐、元数据与恢复时间必须一起评估。','进阶','训练需要顺序或随机读取大量样本，检查点需要阶段性写入大文件。对象存储适合海量数据管理，分布式文件系统适合需要文件语义的并行访问，本地 NVMe 可以承担缓存。','平均吞吐掩盖长尾阻塞。小文件场景还受元数据操作限制。数据预处理、压缩、分片和本地缓存会改变实际瓶颈，因此存储测试必须复现真实样本尺寸与访问模式。','恢复能力是存储设计的一部分。制定 RPO 与 RTO，验证检查点完整性、异地副本与实际恢复流程。RAID 或多副本不是防勒索、误删或异地灾害的完整备份方案。',['压测小文件与并发读写','执行检查点恢复演练','分离生产权限与备份权限'], 'ocp'],
['a09','aidc','集群与调度','从裸机到可交付的算力服务','驱动、容器、调度、配额与作业生命周期。','进阶','硬件交付后需统一固件、驱动、运行时和通信库版本，建立配置基线。调度层把 GPU、CPU、内存与网络约束映射到作业，支持配额、优先级和故障重调度。','利用率不等于业务价值。GPU 忙碌可能是在处理低效任务；需要结合有效 tokens/s、作业完成时间与客户服务等级。多租户环境还需隔离数据、网络与权限。','上线前验证断卡、断网、节点重启、检查点恢复与资源回收。变更应分批灰度，保留已知可用的软件镜像，避免全量升级造成集群不可用。',['建立驱动与镜像兼容矩阵','测试作业抢占与恢复','跟踪排队时长和有效产出'], 'nccl'],
['a10','aidc','监控与运维','把 EMS、DCIM 与 Prometheus 接起来','以统一资产标识连接设施监控和 IT 可观测性。','进阶','设施系统可能通过 Modbus、SNMP、BACnet 或厂商接口输出数据；Prometheus 通常拉取 HTTP 指标。适配层负责读取源数据、单位归一、状态映射和时间戳管理，不应把 JSON 接口误认为可直接抓取的 metrics。','指标标签适合站点、机房、机柜和设备 ID，避免把连续变化的值或无限增长的事件 ID 放进标签。采集失败和数值为零必须区分；网络中断时不应把上次值伪装成实时读数。','告警需要分级、去重、抑制、升级与关闭证据。温度升高应关联负载、供水与流量，而不是每个传感器分别轰炸值班人员。',['统一单位和资产 ID','定义缺数与采集失败告警','保留告警确认和处置审计'], 'prom'],
['a11','aidc','能效与成本','PUE、WUE 与每单位算力成本','低 PUE 不必然等于低碳或高收益。','基础','PUE=数据中心总能耗/IT 设备能耗，必须在相同时间窗口和边界下计量。设施部分通常包括供配电损耗、制冷和相关辅助能耗。部分负载时 PUE 可能变差，不能把单点瞬时值当作全年值。','WUE 关注用水强度，但现场用水与上游发电耗水口径不同。碳排放还取决于电力排放因子和时间匹配，不能只用 PUE 推断。IEA 2025 报告的需求预测是情景，不是已经实现的数值。','经济评估要计入资本折旧、电费、网络、维护、软件许可和闲置。单位成本应除以实际可交付的 GPU 小时或有效业务产出，而非理论全年满载小时。',['核对计量边界与时间窗口','区分额定、平均与峰值功率','同时报告利用率和能耗'], 'iea'],
['a12','aidc','安全与交付','消防、安防与综合验收','设计、测试和运维交接是一条连续责任链。','基础','机房安全覆盖电气、消防、液体泄漏、人员访问与网络安全。高能量电池、发电机燃油和制冷剂各有专项风险。具体防火分区、介质与联动方案必须遵循项目适用规范，并由专业设计审查。','综合验收不只是设备通电。需要系统级联动、故障切换、告警上报、容量测试和维护操作验证。测试计划必须预先界定风险、退出条件和现场责任人。','交付物包括竣工图、资产清单、版本基线、操作规程、维护周期、备件与培训记录。机器人进入机房也不能绕过访问控制、危险区域隔离和人员安全规则。',['按场景验证系统联动','核验现场与竣工图一致性','留存故障与整改闭环证据'], 'ocp'],
['a13','aidc','工程案例','1 MW IT 负载：电费与 PUE 的关系','可复算示例，不是某一园区的实测运行数据。','案例','假设平均 IT 负载为 1,000 kW，全年 8,760 小时运行，PUE 为 1.30，统一电价为 0.70 元/kWh。总功率平均为 1,300 kW，年用电量约 1,138.8 万 kWh，年电费约 797.16 万元。','若在相同 IT 负载下 PUE 降到 1.20，则年电量减少 87.6 万 kWh，电费减少 61.32 万元。这里未考虑峰谷电价、需量费用、税费、停机和改造投资，不能直接用作财务立项结论。','实际分析先收集分时计量，区分负载增长与效率改善。改造回收期应使用增量现金流，还要评估设备寿命、维护成本和可用性风险。',['替换为实际分时电价','使用平均而非铭牌功率','记录模型假设和排除项'], 'iea','案例'],
['a14','aidc','工程案例','液冷机柜：用热平衡核对流量','用 100 kW 示例理解温差与流量的取舍。','案例','假设进入冷却水的热量为 100 kW，供回水温差 10 K，介质近似为水。由 Q=ṁcpΔT 可得质量流量约 2.39 kg/s，约 143.5 L/min。这是稳态热平衡估算，不是泵的选型结果。','若温差变成 5 K，所需流量约翻倍。更高流量可能增加压降和泵耗；更大温差可能提高芯片温度。还需评估末端热阻、管径、并联分配与 CDU 能力。','流量计与温度测点可以估算实际散热量，但传感器精度、时间不同步和部分热量由空气带走都会引入偏差。异常时结合服务器遥测交叉验证。',['明确热量进入水侧的比例','核对冷却液真实物性','检查仪表精度和安装位置'], 'ocp','案例'],
['r01','robot','系统架构','机器人系统：感知、决策与执行','从传感器到驱动器，理解完整闭环。','基础','机器人通过相机、激光雷达、IMU 和编码器感知自身及环境。状态估计将观测合成为位姿、速度与接触状态；规划与策略生成目标；控制器把目标转为执行器指令。反馈闭环用于纠正模型和实际之间的偏差。','不同环路有不同频率和时延要求。视觉推理可能较慢，关节控制需要更稳定的实时响应。网络、时间同步和数据丢包都会改变闭环行为，不能只比较模型推理速度。','系统设计从任务成功条件与安全边界开始。将任务拆成可验证子能力，明确失败检测、重试次数与人工接管路径。演示完成一次不代表能持续自主运行。',['绘制数据与控制接口','标注各环路周期和时延','定义安全停机条件'], 'ros'],
['r02','robot','机械与执行器','电机、减速器与关节模组','关节能力取决于完整扭矩—速度—温升包络。','基础','常见关节模组由电机、减速器、驱动器、编码器与轴承组成。减速器放大输出扭矩，同时影响速度、回差、效率和反驱能力。峰值扭矩不能替代连续扭矩。','负载不仅是末端重量，还包括连杆质量、加速度和姿态引起的力矩。热容量允许短时峰值，但持续运行可能过热降额。传动刚度、摩擦与结构振动会影响控制精度。','选型需按照完整工作循环校核热负荷、机械疲劳、制动与故障状态。对有坠落危险的轴，断电后的保持和安全策略比峰值性能更重要。',['确认额定与峰值持续时间','核验关节温升和回差','评估断电制动与反驱风险'], 'unitree'],
['r03','robot','传感与感知','视觉、力觉与触觉如何协同','看得到物体，并不意味着能够稳定操作它。','基础','RGB 视觉提供纹理与语义，深度信息支持几何重建，腕部六维力传感器测量合力与力矩，触觉传感器描述接触分布。不同传感器在透明物体、强光、遮挡和振动下有不同失效模式。','多模态融合需要时间同步和空间标定。外参漂移会让相机中的位置与机械臂动作错位；力传感器应处理零偏与重力补偿。触觉还能辅助识别滑移，但依赖接触条件和传感器布置。','先为任务选择必要观测，再增加传感器。更多输入带来标定、带宽、故障诊断与训练成本，不能默认提升成功率。',['检查时间戳与坐标系','建立标定和复检流程','记录弱光、反光与遮挡测试'], 'ros'],
['r04','robot','机械臂与规划','正逆运动学与轨迹规划','从末端目标位姿到连续、可执行的关节运动。','进阶','正运动学把关节角转换成末端位姿，逆运动学寻找实现目标的关节解。解可能不存在或不唯一。接近奇异位形时，小的末端速度可能要求很大的关节速度。','规划除了避障，还要满足关节限制、速度、加速度和工作空间约束。末端可达不代表整个机械臂运动过程安全；线缆、夹具和抓取物也应纳入碰撞模型。','MoveIt 提供运动规划及相关集成。部署需要校准机器人模型和环境，测试控制器执行偏差；规划成功只是执行的前置条件，不代表实际任务成功。',['校准基座与工具坐标系','加入夹具及工件碰撞体','检查奇异位形和关节边界'], 'moveit'],
['r05','robot','灵巧手','自由度、驱动数与抓取能力','为什么更多手指关节不一定更适合现场？','基础','自由度表示独立运动变量，驱动数表示执行器数量，两者不必相等。欠驱动机构能被动适应物体形状，但对独立指位控制有约束。夹爪、三指手与五指手各自适用于不同任务。','稳定抓取取决于接触几何、摩擦、力分配与物体形变。捏取、包络抓取和手内操作对指尖精度、触觉与控制带宽提出不同要求。物体重心偏移可能导致旋转或滑落。','从目标物体集合设计测试：不同尺寸、材质、姿态、重量与表面状态。应统计成功率、掉落率、时间与维护成本，而非只展示单次抓取。',['区分自由度与独立驱动数','测试抓取后的搬运稳定性','校核夹持力与物体损伤'], 'moveit'],
['r06','robot','控制与运动','阻抗控制与接触任务','让机器人在接触世界时具有可控的柔顺性。','进阶','位置控制追踪位置，力控制追踪接触力，阻抗控制通过虚拟质量、阻尼与刚度建立运动与力的关系。较低刚度能缓解接触冲击，但会影响定位精度。','接触任务中模型误差、摩擦变化和时延都可能导致振荡。阻抗参数不能脱离采样周期、执行器能力和环境刚度选择。速度、力矩与能量限制应独立于上层策略。','调试从低速度、受控环境和安全负载开始，逐步验证接触、滑动与脱离。学习策略输出的动作必须经过约束和安全控制层，不应直接无边界地驱动电机。',['验证力矩及速度限制','记录接触超调和振荡','保持独立急停链路'], 'isaac'],
['r07','robot','算法与 VLA','VLA：从视觉语言到机器人动作','统一模型不等于取消状态估计与安全控制。','进阶','VLA 将视觉和语言条件映射为动作表示。动作可以是末端增量、关节目标或一段动作序列，不同表示对应不同机器人接口。训练数据的动作坐标、单位与采样频率必须一致。','端到端策略可减少手工编排，但泛化仍受数据覆盖、形态差异和环境变化影响。语言理解正确不代表动作安全；高层推理与低层控制仍需对齐时延和执行边界。','以开机柜门为例，策略需要识别把手、接近、接触、解锁并拉开。成功评估要包含不同门体、阻力、光照与失败恢复，并单独报告人工干预。',['确认动作空间与控制频率','保留碰撞与力矩约束','按场景报告成功率'], 'groot'],
['r08','robot','算法与 VLA','模仿学习、强化学习与数据闭环','不同学习方式解决不同的数据与探索难题。','进阶','模仿学习利用示范建立观测到动作的映射，但可能在偏离示范的状态上累积误差。强化学习通过奖励优化策略，适合在可交互环境中探索，但奖励设计和安全探索很重要。','遥操作示范需要记录传感器、动作、时间戳、任务成功与操作者干预。数据应按场景或任务划分训练和测试集，避免相似轨迹泄漏导致虚高成绩。','闭环改进从失败案例归因开始，补充针对性数据并回归验证。不要仅以训练损失判断上线质量，应评估真实任务成功率、恢复能力与最差场景。',['核查训练测试是否泄漏','记录失败原因和接管次数','版本化数据、模型与配置'], 'isaac'],
['r09','robot','仿真与世界模型','Sim-to-Real：仿真到真实的差距','物理、传感器和时延误差都影响策略迁移。','进阶','仿真让机器人在低成本环境中探索大量状态。真实世界的摩擦、接触刚度、执行器延迟和传感器噪声很难完全还原。视觉逼真也不等于动力学准确。','域随机化在训练中改变物理与视觉参数，使策略适应一定变化；系统辨识用真实数据估计关键参数。随机范围过大可能损害学习效率，过小又难以覆盖实际差异。','世界模型用于预测或生成环境变化，但预测的合理性不等于物理可执行性。仿真通过后仍需分级进行真实验证，记录碰撞、漂移和长时间运行表现。',['辨识执行器时延和摩擦','用留出场景评估迁移','保留真实测试与安全边界'], 'isaac'],
['r10','robot','ROS 与部署','ROS 2：消息、服务和动作','软件模块之间如何交换数据并协同执行。','基础','Topic 适合连续数据流，Service 适合短时请求响应，Action 适合有反馈和取消需求的长任务。机器人定位、机械臂轨迹和任务调度对通信语义的需求不同。','QoS 会影响可靠性、历史深度和传递行为。不匹配的配置可能造成发现节点却收不到消息。网络隔离、多播限制和时钟不同步是现场常见问题。','上线应固定软件版本、记录参数和接口契约，并通过 rosbag 等机制回放问题。机器人断网时需要本地安全行为，不能依赖远程页面上的停止按钮作为唯一急停。',['验证 QoS 兼容性','明确任务取消和超时语义','测试断网后的本地行为'], 'ros'],
['r11','robot','移动与导航','SLAM、定位与自主导航','建图、定位和避障是不同的能力。','进阶','SLAM 在估计机器人轨迹的同时构建地图；已有地图中的定位与在线避障则面临不同问题。激光、视觉与惯性传感器可以互补，但长走廊、反光和动态人群都可能退化。','导航一般包括全局路径规划、局部控制与代价地图。可通过性还取决于机器人尺寸、足端或轮组接触、坡度、门槛和制动距离。路径存在不代表能安全通过。','机房巡检要测试窄通道、地面线槽、开门后的通道变化和人员交叉。定位失效应触发减速或停车，并报告原因，而不是继续盲走。',['校准机器人外形与安全膨胀','测试动态障碍物和定位丢失','验证充电与任务恢复'], 'ros'],
['r12','robot','安全与评测','从演示成功到持续可用','成功率、节拍、接管率和风险需要共同报告。','基础','任务评测需要明确起始状态、成功条件、超时和失败标准。展示剪辑无法反映真实可靠性。建议保留完整试验次数、失败分布、人工重置和接管记录。','不同任务不可只按自由度或推理速度比较。需要把成功率、周期时间、连续运行时长、维护频率和安全事件一起报告。小样本成功率存在很大不确定性。','部署现场需开展风险评估，识别挤压、撞击、夹持、电池与信息安全风险。学习策略、普通避障和视觉识别不能替代经过验证的安全功能。实际实施须遵循适用标准并由专业人员评估。',['固定测试集与成功定义','公开接管和人工重置次数','完成现场风险评估'], 'unitree'],
['r13','robot','应用案例','GR00T：从模型到机器人工作流','官方平台案例导读，不把模型发布当作现场验收。','案例','NVIDIA Isaac GR00T 面向通用机器人模型与数据工作流。官方平台连接数据采集、仿真、训练与部署，研究版本和支持形态会持续变化，具体能力需查看对应版本资料。','工程上仍要处理传感器同步、动作重定向、控制接口与安全边界。仿真中的成功率不能直接当作真实现场指标，也不能由一个任务推断任意物体操作能力。','建议复现一个边界明确的任务，例如固定工作台上的物体搬运。记录未见物体、光照变化和遮挡测试，再逐步扩展任务；每次升级保持同一组回归评测。',['固定模型与机器人版本','明确训练和部署场景差异','记录完整失败与恢复过程'], 'groot','案例'],
['r14','robot','应用案例','机房巡检机器人：如何设计验收','把行走展示转换为可测量的运维价值。','案例','以下是工程场景示例，不代表已实施项目。将任务拆分为到点、识别资产、读取仪表、热异常检测和上报告警。每一步应有可验证的完成条件与错误分类。','验收样本应覆盖不同机柜、光照、遮挡和通道宽度。热像异常要结合环境和设备负载判断；仪表读数需要与人工或原始监控交叉核对。机器人不得操作带电设备或越过权限边界。','成本评估需包含本体、传感器、软件、地图维护、充电、维修和人工接管。只有实际减少重复任务时间且未增加风险，才构成可交付的运维收益。',['统计漏检率与误报率','记录每次巡检的人工接管','验证断网和低电量回退'], 'ros','案例']
];
const baseArticles:Article[]=rows.map((r)=>({id:r[0],domain:r[1],category:r[2],title:r[3],summary:r[4],level:r[5],minutes:4,sections:[{title:'核心概念',text:r[6]},{title:'技术要点',text:r[7]},{title:'现场应用',text:r[8]}],checks:r[9],sourceName:refs[r[10]][0],source:refs[r[10]][1],kind:r[11]||'手册'}));
export const articles:Article[]=[...baseArticles.map(a=>({...a,minutes:9,category:a.domain==='robot'?(['r02','r03','r05'].includes(a.id)?'硬件 · ':'软件 · ')+a.category:a.category,sections:[...a.sections,{title:'工作原理与系统约束',text:deep[a.id].principle},{title:'工程实现与验证',text:deep[a.id].engineering}]})),...newArticles];
export type News={title:string;url:string;date:string;source:string;domain:Domain;type:string;summary?:string;historical?:boolean;topics?:string[];collectedAt?:string;stale?:boolean;feed?:string;region?:'cn';language?:'zh';sourceKind?:string};
export const curated:News[]=[
{title:'NVIDIA FY2027 Q2：数据中心业务继续扩张',url:'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027',date:'2026-08-26',source:'NVIDIA 官方财报',domain:'aidc',type:'企业财报',summary:'季度营收 962.21 亿美元；数据中心营收约 890 亿美元。注意财年与自然年口径。',historical:true},
{title:'用 Isaac GR00T 构建端到端人形机器人策略',url:'https://developer.nvidia.com/blog/develop-humanoid-robot-policies-end-to-end-with-nvidia-isaac-gr00t/',date:'2026-07-07',source:'NVIDIA Developer',domain:'robot',type:'技术研究',summary:'官方开发工作流覆盖数据采集、仿真训练、验证与真实部署。',historical:true},
{title:'ABB Q2 2026：可比收入增长 12%',url:'https://new.abb.com/news/detail/137496/q2-2026-results',date:'2026-07-16',source:'ABB 官方公告',domain:'robot',type:'企业财报',summary:'集团持续经营口径不应直接视作机器人业务增速；关注处置业务的口径变化。',historical:true},
{title:'IEA：数据中心用电需求与电网约束',url:'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',date:'2025-04-10',source:'IEA · 2025 报告',domain:'aidc',type:'市场洞察',summary:'2025 年基准情景预测 2030 年约 945 TWh；这是全球数据中心预测，不是仅 AIDC 的实测值。',historical:true},
{title:'Serve Robotics Q1 2026：规模扩张与现金储备',url:'https://investors.serverobotics.com/news-releases/news-release-details/serve-robotics-announces-first-quarter-2026-results-3x',date:'2026-05-07',source:'Serve Robotics 投资者关系',domain:'robot',type:'企业财报',summary:'季度营收 300 万美元；关注收入规模、现金消耗与商业化持续性。',historical:true}
];
export const companies=[
{name:'NVIDIA',code:'NVDA',domain:'aidc',area:'加速计算 · 网络 · 物理 AI',tech:'GPU 系统、CUDA、NVLink 与 Isaac 平台。研究时把计算、互联和软件栈一起评估。',period:'FY2027 Q2 · 截至 2026-07-26',revenue:'962.21 亿美元',margin:'75.0%',note:'GAAP 毛利率；集团收入不等于 GPU 单一产品收入。数据中心收入约 890 亿美元。',url:curated[0].url,ir:'https://investor.nvidia.com/',color:'#76b900'},
{name:'Vertiv',code:'VRT',domain:'aidc',area:'供电 · 热管理 · 液冷',tech:'关注高密度机柜的电源、CDU、热管理集成与交付能力。',period:'查看官方最新披露',revenue:'未在本站核录',margin:'—',note:'区分有机增长、订单和确认收入；订单积压不等于本期收入。',url:'https://investors.vertiv.com/news/default.aspx',ir:'https://investors.vertiv.com/',color:'#d86c22'},
{name:'华为',code:'HUAWEI',domain:'aidc',area:'昇腾 · 网络 · 数字能源',tech:'关注昇腾计算生态、集群网络与数据中心能源基础设施，比较时注明具体型号与软件版本。',period:'查看官方年度报告',revenue:'未在本站核录',margin:'—',note:'集团财务不等于昇腾业务收入；不据产品热度推算未披露分部营收。',url:'https://www.huawei.com/cn/annual-report',ir:'https://www.huawei.com/cn/annual-report',color:'#c83935'},
{name:'AMD',code:'AMD',domain:'aidc',area:'EPYC · Instinct · ROCm',tech:'比较加速器时关注 HBM、实际工作负载性能和 ROCm 软件兼容性。',period:'查看官方季度披露',revenue:'未在本站核录',margin:'—',note:'核对 Data Center 分部中 CPU 与 GPU 的边界，不直接等同 AI GPU 销售额。',url:'https://ir.amd.com/',ir:'https://ir.amd.com/',color:'#161c27'},
{name:'ABB',code:'ABBN',domain:'robot',area:'自动化 · 工业机器人',tech:'关注运动控制、工业集成与机器人业务交易进展；公司范围可能随交易变化。',period:'2026 Q2 · 集团持续经营口径',revenue:'可比增长 12%',margin:'20.2%*',note:'*为 Operational EBITA 利润率，不是毛利率；不得与其他公司的毛利率直接比较。',url:'https://new.abb.com/news/detail/137496/q2-2026-results',ir:'https://global.abb/group/en/investors',color:'#e23536'},
{name:'宇树科技',code:'UNITREE',domain:'robot',area:'四足 · 人形 · 关节硬件',tech:'G1 等平台提供本体与开发接口，功能、自由度和二次开发能力须按版本核对。',period:'本站暂无已核验财务数据',revenue:'未核验',margin:'—',note:'不以产品售价或演示视频推算营收、订单与估值。',url:'https://www.unitree.com/g1',ir:'https://www.unitree.com/',color:'#286dc7'},
{name:'优必选',code:'9880.HK',domain:'robot',area:'人形机器人 · 工业应用',tech:'关注工业人形机器人交付、现场成功率和项目验收周期。',period:'官方财报与公告入口',revenue:'未在本站核录',margin:'—',note:'收入、合同金额、意向订单应分开；结合应收账款、研发投入和经营现金流阅读。',url:'https://www.ubtrobot.com/en/financial',ir:'https://www.ubtrobot.com/en/announce',color:'#e16e31'},
{name:'Serve Robotics',code:'SERV',domain:'robot',area:'配送机器人 · 运营服务',tech:'关注机器人配送的订单密度、运营区域、人工接管和单次配送成本。',period:'2026 Q1 · 截至 2026-03-31',revenue:'300 万美元',margin:'未核录',note:'官方披露流动性 1.974 亿美元。流动性储备不是利润，季度营收也不代表已实现盈利。',url:curated[4].url,ir:'https://investors.serverobotics.com/',color:'#987a12'}
];
export const newsTypes=['全部','技术研究','研究论文','市场洞察','企业财报','产品发布'];
const newsFeed=(query:string,english=false)=>'https://news.google.com/rss/search?q='+encodeURIComponent(query+' when:30d')+(english?'&hl=en-US&gl=US&ceid=US:en':'&hl=zh-CN&gl=CN&ceid=CN:zh-Hans');
export type FeedSource={name:string;url:string;domain:Domain|'both';type:string;description:string;language?:'zh';kind?:'官方直连'|'媒体直连'|'新闻聚合';catalogGroup?:string};
export const sources:FeedSource[]=[
{name:'TechCrunch · AI',url:'https://techcrunch.com/category/artificial-intelligence/feed/',domain:'ml',type:'市场洞察',description:'AI 公司、融资与商业应用报道；媒体观点和企业财报分开核查。'},
{name:'DCD · 数据中心产业',url:'https://www.datacenterdynamics.com/en/rss/',domain:'aidc',type:'市场洞察',description:'数据中心专业媒体的独立订阅源；投资、工程和供应链报道须结合原始资料核查。'},
{name:'The Robot Report',url:'https://www.therobotreport.com/feed/',domain:'robot',type:'市场洞察',description:'机器人专业媒体，独立于新闻聚合源；保留原始发布日期。'},
{name:'VentureBeat · AI',url:'https://venturebeat.com/category/ai/feed/',domain:'ml',type:'市场洞察',description:'企业 AI 与智能体行业媒体；观点与企业披露分开阅读。'},
{name:'NVIDIA Newsroom',url:'https://nvidianews.nvidia.com/releases.xml',domain:'both',type:'产品发布',description:'官方技术发布与财报；厂商陈述与独立评测分开阅读。'},
{name:'NVIDIA Developer',url:'https://developer.nvidia.com/blog/feed/',domain:'both',type:'技术研究',description:'官方开发资料；按主题可同时进入多个栏目。'},
{name:'arXiv · cs.RO',url:'https://export.arxiv.org/rss/cs.RO',domain:'robot',type:'研究论文',description:'机器人预印本，尚不代表同行评审或商用验证。'},
{name:'arXiv · cs.LG',url:'https://export.arxiv.org/rss/cs.LG',domain:'ml',type:'研究论文',description:'机器学习预印本；跟踪原论文与实验条件。'},
{name:'Hugging Face',url:'https://huggingface.co/blog/feed.xml',domain:'ml',type:'技术研究',description:'模型、训练和部署技术博客，保留原文标题。'},
{name:'AIDC · 市场',url:newsFeed('(智算中心 OR 数据中心 OR AIDC) (市场 OR 能源 OR 投资 OR 液冷)'),domain:'aidc',type:'市场洞察',description:'中文新闻聚合索引；打开原文核查数据与机构口径。'},
{name:'机器人 · 市场',url:newsFeed('(具身智能 OR 机器人) (市场 OR 融资 OR 订单 OR 量产)'),domain:'robot',type:'市场洞察',description:'聚合媒体报道，订单与交付、融资与收入不可混用。'},
{name:'机器学习 · 市场',url:newsFeed('(大模型 OR 智能体 OR 小模型) (市场 OR 融资 OR 商业化)'),domain:'ml',type:'市场洞察',description:'模型和智能体产业动态，不自动生成投资结论。'},
{name:'AIDC · 财务',url:newsFeed('(英伟达 OR AMD OR 维谛 OR 浪潮) (财报 OR 营收 OR 业绩)'),domain:'aidc',type:'企业财报',description:'财报线索索引；财务结论需核查企业官方披露。'},
{name:'机器人 · 财务',url:newsFeed('(优必选 OR 宇树 OR ABB OR 机器人) (财报 OR 营收 OR 业绩)'),domain:'robot',type:'企业财报',description:'财报报道入口，不将融资估值等同经营收入。'},
{name:'机器学习 · 财务',url:newsFeed('(微软 OR 谷歌 OR 百度 OR 阿里 OR 大模型) (财报 OR 营收 OR 业绩)'),domain:'ml',type:'企业财报',description:'集团财报不等同模型业务财务表现。'},
{name:'世界模型 · 专题',url:newsFeed('("world model" OR 世界模型 OR Cosmos OR V-JEPA OR Genie) (机器人 OR AI OR research)'),domain:'robot',type:'技术研究',description:'世界模型研究、产品与市场线索；技术事实以作者或机构原文为准。'}
,{name:'InfoQ 中文 · 工程实践',url:'https://www.infoq.cn/feed',domain:'both',type:'技术研究',language:'zh',kind:'媒体直连',description:'InfoQ 中文原站 RSS；按 AI、基础设施和机器人关键词筛选工程实践，媒体报道中的技术结论需结合原始资料。'},
{name:'华为 · 中文官方动态',url:'https://www.huawei.com/cn/rss-feeds/huawei-updates/rss',domain:'both',type:'技术研究',language:'zh',kind:'官方直连',description:'华为官方中文 RSS；按算力、数据中心与 AI 主题筛选，保留原始日期。厂商发布不等同第三方评测。'},
{name:'量子位 · 中文 AI 科技',url:'https://www.qbitai.com/feed',domain:'both',type:'技术研究',language:'zh',kind:'媒体直连',description:'中文 AI 媒体原站 RSS；按主题分流至三个领域，覆盖模型、机器人和算力进展，也包含海外研究。'},
{name:'中国 AIDC · 政策与市场',url:newsFeed('(中国 OR 国内 OR 工信部 OR 信通院) (智算中心 OR 算力中心 OR 东数西算 OR 液冷)'),domain:'aidc',type:'市场洞察',language:'zh',kind:'新闻聚合',description:'中国算力投资、政策、液冷与产业研究线索；聚合索引，数据应回溯工信部、信通院或报告原文。'},
{name:'中国 AIDC · 头部企业技术',url:newsFeed('(华为 OR 昇腾 OR 浪潮信息 OR 中科曙光 OR 新华三 OR 寒武纪) (超节点 OR AI芯片 OR 服务器 OR 液冷 OR 算力) -手机 -Mate -麒麟'),domain:'aidc',type:'技术研究',language:'zh',kind:'新闻聚合',description:'国产计算、服务器、互联与液冷进展；通过新闻索引发现线索，产品参数以企业正式资料为准。'},
{name:'中国机器人 · 市场与交付',url:newsFeed('(中国 OR 国内 OR 宇树 OR 优必选 OR 智元 OR 傅利叶 OR 埃斯顿) (机器人 OR 具身智能) (量产 OR 交付 OR 融资 OR 订单)'),domain:'robot',type:'市场洞察',language:'zh',kind:'新闻聚合',description:'跟踪国内机器人商业化；区分意向订单、签约、交付与确认收入。'},
{name:'中国机器人 · 技术与世界模型',url:newsFeed('(宇树 OR 智元 OR 优必选 OR 傅利叶 OR 北京人形 OR 智源 OR 上海人工智能实验室) (机器人 OR 具身 OR 世界模型 OR 灵巧手 OR VLA)'),domain:'robot',type:'技术研究',language:'zh',kind:'新闻聚合',description:'本体、操作策略、世界模型与开源成果线索；实验条件需查看原论文、模型卡或官方技术报告。'},
{name:'中国模型 · 大模型与智能体',url:newsFeed('(DeepSeek OR 深度求索 OR 通义 OR 千问 OR 豆包 OR 文心 OR 智谱 OR Kimi OR MiniMax) (模型 OR 智能体 OR 开源 OR 推理)'),domain:'ml',type:'技术研究',language:'zh',kind:'新闻聚合',description:'国内模型团队的技术、开源与产品进展，覆盖大模型、智能体和高效推理。'},
{name:'中国 AI · 市场与商业化',url:newsFeed('(中国 OR 国内 OR 阿里 OR 百度 OR 腾讯 OR 字节 OR 智谱) (大模型 OR 智能体) (市场 OR 商业化 OR 融资 OR 价格)'),domain:'ml',type:'市场洞察',language:'zh',kind:'新闻聚合',description:'中国模型服务与智能体产业报道；融资、估值、调用量与收入分别解读。'},
{name:'中国 AIDC · 企业财务',url:newsFeed('(浪潮信息 OR 中科曙光 OR 寒武纪 OR 中际旭创 OR 英维克 OR 润泽科技 OR 数据港) (财报 OR 营收 OR 业绩)'),domain:'aidc',type:'企业财报',language:'zh',kind:'新闻聚合',description:'国内服务器、芯片、光模块、液冷和 IDC 企业财报线索；以交易所公告和定期报告为准。'},
{name:'中国机器人 · 企业财务',url:newsFeed('(优必选 OR 埃斯顿 OR 汇川技术 OR 绿的谐波 OR 三花智控) (财报 OR 营收 OR 业绩)'),domain:'robot',type:'企业财报',language:'zh',kind:'新闻聚合',description:'机器人整机、控制和零部件企业披露线索；集团收入不等于人形机器人收入。'},
{name:'中国 AI · 企业财务',url:newsFeed('(阿里巴巴 OR 百度 OR 腾讯 OR 科大讯飞 OR 商汤) (财报 OR 营收 OR 业绩) (AI OR 智能 OR 云)'),domain:'ml',type:'企业财报',language:'zh',kind:'新闻聚合',description:'中国云与 AI 企业财报线索；不把云或集团收入直接当作模型业务营收。'}
];
companies.push(
{name:'Google / Alphabet',code:'GOOGL',domain:'ml',area:'大模型 · Gemma · 世界模型',tech:'观察 Gemini、Gemma 与 DeepMind 研究，并区分通用语言能力、端侧模型和世界模型的用途。',period:'官方财务披露入口',revenue:'未在本站核录',margin:'—',note:'Alphabet 集团或云业务收入不能直接视为 Gemini 收入；最新财报线索见财务披露动态。',url:'https://abc.xyz/investor/',ir:'https://abc.xyz/investor/',color:'#4285f4'},
{name:'Microsoft',code:'MSFT',domain:'ml',area:'智能体 · 云 AI · 小模型',tech:'关注企业智能体的权限、工具集成与可观测性，以及 Phi 等小模型的设备适配。',period:'官方财务披露入口',revenue:'未在本站核录',margin:'—',note:'云收入、AI 相关增长与单产品营收口径不同；本站不推算未披露分部数据。',url:'https://www.microsoft.com/en-us/Investor/',ir:'https://www.microsoft.com/en-us/Investor/',color:'#087eaf'},
{name:'阿里巴巴 / 通义',code:'BABA / 9988.HK',domain:'ml',area:'Qwen · 云平台 · 模型生态',tech:'关注开放模型权重、模型卡、推理成本与行业部署，测试需锁定模型和量化版本。',period:'官方财务披露入口',revenue:'未在本站核录',margin:'—',note:'云智能集团收入不能等同 Qwen 商业收入；财报期与自然年需区分。',url:'https://www.alibabagroup.com/en-US/ir-financial-reports',ir:'https://www.alibabagroup.com/en-US/investor-relations',color:'#e27728'},
{name:'Hugging Face',code:'未上市',domain:'ml',area:'开放模型 · 小模型 · 机器人',tech:'模型卡、数据集与推理工具形成开放研究工作流；小模型路线可结合 SmolVLA 等公开研究理解。',period:'公开资料观察',revenue:'未核验',margin:'—',note:'未上市企业不假设公开季度财报；融资额、估值和下载量都不是收入。',url:'https://huggingface.co/blog',ir:'https://huggingface.co/',color:'#ac8e16'}
);

const institutionGroups:Record<string,string[]>={
 '产业研究机构':['gartner.com','idc.com','counterpointresearch.com','techinsights.com'],
 '投行与咨询':['morganstanley.com','goldmansachs.com','spglobal.com'],
 '全球资产配置':['blackrock.com','capitalgroup.com','pimco.com','vanguard.com'],
 '私募与产业资本':['tpg.com','sequoiacap.com','temasek.com.sg','kkr.com','hillhouseinvestment.com','prosus.com'],
 '技术与标准':['ietf.org','palantir.com','research.nvidia.com'],
 '机器人开放研究':['agibot-world.com','agibot.com','robo-arena.github.io','chinaerospace.com'],
 '披露与政策':['sec.gov','pbc.gov.cn','safe.gov.cn','csrc.gov.cn'],
 '前沿 AI 研究':['deepmind.google','ai.meta.com','openai.com','anthropic.com','worldlabs.ai'],
 '中国 AI 研究':['high-flyer.cn','seed.bytedance.com','hub.baai.ac.cn'],
 '开放模型与工具':['ollama.com','huggingface.co','rwkv.com','replicate.com'],
 '评测与学术':['hai.stanford.edu','arcprize.org'],
 '财经媒体':['seekingalpha.com','investing.com','tradingkey.com']
};
for(const [group,hosts] of Object.entries(institutionGroups))sources.push({name:'研报索引 · '+group,url:newsFeed('('+hosts.map(h=>'site:'+h).join(' OR ')+') ("artificial intelligence" OR "data center" OR robot OR semiconductor OR 大模型 OR 算力 OR 具身)',['全球资产配置','私募与产业资本','技术与标准','机器人开放研究','投行与咨询','前沿 AI 研究','开放模型与工具','评测与学术'].includes(group)),domain:'both',type:['技术与标准','机器人开放研究','前沿 AI 研究','中国 AI 研究','开放模型与工具','评测与学术'].includes(group)?'技术研究':'市场洞察',kind:'新闻聚合',catalogGroup:group,description:'按机构域名检索公开标题和链接；不是机构 API，也不含付费全文。无命中不代表机构没有更新。'});
