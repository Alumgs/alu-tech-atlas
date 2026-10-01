window.ATLAS = {
  "meta": {
    "verifiedAt": "2026-10-01",
    "title": "知域 · Technology Atlas V3",
    "subtitle": "专业技术杂志 + 知识地图",
    "version": "3.0"
  },
  "domains": {
    "aidc": {
      "name": "AIDC 智算中心",
      "eyebrow": "AI DATA CENTER",
      "short": "AI Factory",
      "intro": "从电网到 GPU、从热管理到网络互联，把智算中心理解成一个“算力—电力—热—网络”耦合系统。",
      "accent": "基础设施 · 算力 · 能效",
      "groups": [
        {
          "name": "01 基础设施",
          "desc": "先建立容量、电力与热的物理边界",
          "items": [
            "foundation",
            "power",
            "cooling"
          ]
        },
        {
          "name": "02 算力系统",
          "desc": "理解计算、互联、存储与调度如何共同决定有效算力",
          "items": [
            "compute",
            "scaleup",
            "scaleout",
            "storage",
            "scheduling"
          ]
        },
        {
          "name": "03 运营经济",
          "desc": "把故障、能效和成本放入长期运营闭环",
          "items": [
            "ops",
            "efficiency"
          ]
        }
      ]
    },
    "embodied": {
      "name": "具身智能",
      "eyebrow": "EMBODIED INTELLIGENCE",
      "short": "Physical AI",
      "intro": "沿着“感知—世界建模—规划—策略—执行”链路，把软件模型与机器人硬件放在同一个闭环中理解。",
      "accent": "世界模型 · VLA · 机器人",
      "groups": [
        {
          "name": "01 软件智能",
          "desc": "从理解世界到预测未来并生成动作",
          "items": [
            "world-model",
            "vla",
            "policy",
            "simulation"
          ]
        },
        {
          "name": "02 感知与本体",
          "desc": "把多模态状态变成可控的物理系统",
          "items": [
            "perception",
            "hardware",
            "dexterity",
            "edge"
          ]
        }
      ]
    },
    "ml": {
      "name": "机器学习",
      "eyebrow": "MACHINE LEARNING",
      "short": "Models & Agents",
      "intro": "从基础模型到智能体运行时，再到小模型与端侧部署，理解训练、推理和执行基础设施。",
      "accent": "大模型 · 智能体 · 小模型",
      "groups": [
        {
          "name": "01 大模型",
          "desc": "模型结构、训练、MoE 与生产推理",
          "items": [
            "llm",
            "training",
            "moe",
            "inference"
          ]
        },
        {
          "name": "02 智能体",
          "desc": "从工具调用走向持久化任务执行",
          "items": [
            "agent",
            "runtime"
          ]
        },
        {
          "name": "03 小模型与端侧",
          "desc": "把能力压缩到更低的延迟、成本与功耗预算",
          "items": [
            "small-model",
            "edge-ai"
          ]
        }
      ]
    }
  },
  "studyPlan": [
    {
      "domain": "aidc",
      "article": "cooling",
      "title": "为什么 AI 机柜正在走向液冷？",
      "minutes": 28,
      "path": [
        "GPU 热流密度",
        "冷板",
        "CDU",
        "设施水与冷源"
      ]
    },
    {
      "domain": "embodied",
      "article": "world-model",
      "title": "世界模型到底和 VLA 有什么区别？",
      "minutes": 26,
      "path": [
        "观测",
        "潜在状态",
        "未来预测",
        "规划与动作"
      ]
    },
    {
      "domain": "ml",
      "article": "runtime",
      "title": "从 LLM 到 Agent Runtime：真正多了什么？",
      "minutes": 25,
      "path": [
        "Model",
        "Tools",
        "Sandbox",
        "Durable execution"
      ]
    },
    {
      "domain": "aidc",
      "article": "power",
      "title": "100MW AI Factory 的电从哪里来？",
      "minutes": 30,
      "path": [
        "Grid",
        "UPS/DC",
        "Busway",
        "GPU"
      ]
    },
    {
      "domain": "ml",
      "article": "inference",
      "title": "为什么推理系统越来越像操作系统？",
      "minutes": 24,
      "path": [
        "Prefill",
        "KV Cache",
        "Batching",
        "SLO 调度"
      ]
    }
  ],
  "articles": {
    "foundation": {
      "id": "foundation",
      "domain": "aidc",
      "category": "规划与土建",
      "title": "从业务负载反推一座 AI Factory",
      "deck": "智算中心的第一张图不是平面图，而是容量边界图：先确定要交付多少有效算力，再推导 IT 负载、电网接入、机柜数量、白空间、冷源和扩容路径。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "容量规划",
        "园区",
        "白空间",
        "分期建设"
      ],
      "visual": {
        "title": "从业务负载反推一座 AI Factory",
        "nodes": [
          "业务需求|训练/推理规模",
          "GPU 规模|并发与利用率",
          "IT Load|MW",
          "机柜与白空间|kW/rack",
          "电力与冷却|容量边界",
          "分期扩容|Phase 1→N"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心起点",
          "业务工作负载",
          "不要从“有多少平方米”开始"
        ],
        [
          "关键中间量",
          "IT Load",
          "连接算力需求与机电容量"
        ],
        [
          "设计原则",
          "分期可扩展",
          "电力、冷却、网络同时留接口"
        ]
      ],
      "sections": [
        {
          "title": "1. 从业务目标开始",
          "body": "先把“我要多少 GPU”改写为“我要交付什么业务能力”。训练场景关注集群规模、作业持续时间、通信比例和 Checkpoint；推理场景关注并发、TTFT、吞吐与峰谷差。二者会形成完全不同的负载曲线。",
          "bullets": [
            "训练：高持续负载、网络同步强、作业持续时间长",
            "推理：峰谷明显、批处理与缓存影响 GPU 利用率",
            "混合场景：需要把容量按故障域和租户隔离"
          ]
        },
        {
          "title": "2. 把算力翻译成 IT Load",
          "body": "IT Load 不只是 GPU TDP 的求和，还包括 CPU、HBM、NIC/DPU、NVMe、风扇/泵、交换机、存储等。工程上常从设备整机功耗或机柜额定功率推导，而不是只看芯片参数。",
          "bullets": [
            "优先使用设备/机柜厂商额定与实测数据",
            "区分峰值、设计值和长期平均负载",
            "为网络与存储保留独立容量"
          ]
        },
        {
          "title": "3. 白空间不是简单的“机柜数×面积”",
          "body": "高密度机柜会改变承重、运输通道、母线、液冷管路、维护空间与消防分区。机柜数量减少不一定意味着机房更小，因为机电和维护空间占比会上升。"
        },
        {
          "title": "4. 从 Day-1 就设计扩容",
          "body": "真正可运营的 AI Factory 需要分期建设。每一期不仅增加 GPU，还要检查上游变电容量、CDU/冷源、网络 Spine、存储带宽和运维人员能力是否同步扩容。"
        }
      ],
      "formula": {
        "expr": "IT Load ≈ Σ(P_rack × N_rack) + P_network + P_storage",
        "explanation": "容量规划先得到 IT 负载，再使用 PUE、冗余和环境约束推导设施容量。"
      },
      "table": {
        "headers": [
          "设计量",
          "回答的问题",
          "常见误区"
        ],
        "rows": [
          [
            "GPU 数量",
            "需要多少计算资源？",
            "只按芯片数，不看整机功耗"
          ],
          [
            "机柜功率",
            "每个故障域多大？",
            "用平均功率替代设计峰值"
          ],
          [
            "白空间",
            "设备如何落位维护？",
            "忽略管路、承重与维护通道"
          ],
          [
            "分期边界",
            "下一期从哪里接入？",
            "只留面积，不留电力/冷却接口"
          ]
        ]
      },
      "pitfalls": [
        "先有机房面积，再往里塞设备",
        "把 PUE 当作固定常数而不是运行结果",
        "网络/存储放到最后再补容量"
      ],
      "related": [
        "power",
        "cooling",
        "compute",
        "efficiency"
      ],
      "sources": [
        {
          "name": "IEA · Key Questions on Energy and AI",
          "url": "https://www.iea.org/reports/key-questions-on-energy-and-ai",
          "note": "数据中心能源与基础设施约束背景"
        }
      ],
      "callout": "把一座智算中心理解成“受电力、热、空间、网络共同约束的算力产品”，比把它理解成“装服务器的楼”更接近工程本质。"
    },
    "power": {
      "id": "power",
      "domain": "aidc",
      "category": "供配电",
      "title": "从电网到 GPU：每一瓦电经历了什么",
      "deck": "供电链路决定了 AI Factory 的容量上限、效率、故障域和维护方式。高密度机柜正在把传统 AC 配电推向更高电压与更少转换级。",
      "readMinutes": 22,
      "level": "进阶",
      "tags": [
        "电网",
        "UPS",
        "母线",
        "800VDC"
      ],
      "visual": {
        "title": "从电网到 GPU：每一瓦电经历了什么",
        "nodes": [
          "Grid|电网接入",
          "MV Switchgear|中压开关",
          "Transformer|变压",
          "UPS / DC|储能与质量",
          "Busway / PDU|末端配电",
          "PSU / VRM / GPU|最终负载"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "典型链路",
          "MV→LV→UPS→PDU",
          "每一级都有效率与故障域"
        ],
        [
          "系统关系",
          "I=P/V",
          "电压越高，同功率电流越小"
        ],
        [
          "新趋势",
          "800VDC",
          "面向超高密度 AI Factory"
        ]
      ],
      "sections": [
        {
          "title": "1. 电力路径与故障域",
          "body": "传统路径通常包含中压开关、变压器、低压开关、UPS、母线/列头柜、机柜 PDU、服务器 PSU 与板级 VRM。任何一级都可能成为容量瓶颈或公共故障点。"
        },
        {
          "title": "2. N+1、2N 到底保护什么",
          "body": "冗余只描述资源数量或路径，不自动等于业务高可用。需要同时回答：哪一段能在线维护？故障能否隔离？切换是否自动？切换瞬间的电能质量是否满足服务器要求？",
          "bullets": [
            "N+1：容量冗余",
            "2N：路径冗余",
            "Concurrent Maintainability：维护时仍满足目标容量"
          ]
        },
        {
          "title": "3. 为什么机柜功率越高，配电越难",
          "body": "同样的功率下，电流随电压降低而增大。高电流意味着更粗的导体、更高 I²R 损耗、更大的接头发热和更复杂的保护。高功率密度正在推动上游电压等级和末端架构变化。"
        },
        {
          "title": "4. 800VDC 的意义",
          "body": "800VDC 不是“把 AC 全换掉”，而是一种减少转换级、降低电流和提升高密度末端配电效率的路线。工程上仍需处理直流保护、隔离、维护、设备生态与安全规范。"
        }
      ],
      "formula": {
        "expr": "P = V × I；P_loss = I²R",
        "explanation": "在相同功率 P 下提高电压 V，可以降低电流 I，从而降低导体损耗与截面积压力。"
      },
      "table": {
        "headers": [
          "层级",
          "主要职责",
          "重点指标"
        ],
        "rows": [
          [
            "电网/中压",
            "容量与接入",
            "MVA、短路容量、双路来源"
          ],
          [
            "UPS/储能",
            "电能质量与过渡",
            "效率、后备时间、旁路"
          ],
          [
            "母线/PDU",
            "末端分配",
            "额定电流、温升、选择性保护"
          ],
          [
            "PSU/VRM",
            "板级转换",
            "效率、瞬态响应"
          ]
        ]
      },
      "pitfalls": [
        "只看 UPS 冗余，不看上游变压器/母线公共点",
        "忽略连接器与铜排温升",
        "把额定容量当作长期可用容量"
      ],
      "related": [
        "foundation",
        "compute",
        "efficiency"
      ],
      "sources": [
        {
          "name": "NVIDIA · 800 VDC Power Architecture for AI Factories",
          "url": "https://blogs.nvidia.com/blog/800-vdc-power-architecture-ai-factory/"
        }
      ]
    },
    "cooling": {
      "id": "cooling",
      "domain": "aidc",
      "category": "制冷与液冷",
      "title": "从芯片热量到室外冷源：液冷完整链路",
      "deck": "液冷的本质是把热从芯片高效搬运到室外。冷板、CDU、设施水、冷机/冷却塔构成一条连续热流链，任何一处瓶颈都会反映为温度、压差或流量异常。",
      "readMinutes": 24,
      "level": "进阶",
      "tags": [
        "冷板",
        "CDU",
        "Facility Water",
        "热管理"
      ],
      "visual": {
        "title": "从芯片热量到室外冷源：液冷完整链路",
        "nodes": [
          "GPU / CPU|热源",
          "TIM + Cold Plate|芯片侧换热",
          "Rack Manifold|分配",
          "CDU|泵+换热+控制",
          "Facility Water|设施水",
          "Heat Rejection|冷机/冷却塔"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心方程",
          "Q=ṁcₚΔT",
          "把功率换成流量需求"
        ],
        [
          "高密度机柜",
          "100kW+",
          "风冷压损与噪声迅速上升"
        ],
        [
          "故障关键量",
          "温度/压差/流量",
          "三者要一起看"
        ]
      ],
      "sections": [
        {
          "title": "1. 为什么液体更适合高热流密度",
          "body": "水或专用冷却液的体积比热远高于空气，可以用更小体积流量搬运同样热量。与此同时，液冷把换热面推到芯片附近，减少“芯片→空气→机房→盘管”的多级热阻。"
        },
        {
          "title": "2. 冷板与服务器侧回路",
          "body": "冷板内部流道决定换热与压损。设计需要在温度均匀性、压损、材料兼容、污染控制、泄漏检测与维护便利之间平衡。"
        },
        {
          "title": "3. CDU 是液冷系统的控制边界",
          "body": "CDU 负责隔离 IT 回路与设施侧、提供泵送、调节流量/压差、换热、过滤和补液。它既是设备，也是故障域，因此必须与机柜分组和冗余策略协同设计。"
        },
        {
          "title": "4. 设施侧与自然冷却",
          "body": "更高的供水温度可能提高自然冷却时长，降低压缩机制冷能耗；但上限受服务器入口温度、换热器逼近温差、气候和水系统设计约束。"
        }
      ],
      "formula": {
        "expr": "Q = ṁ × cₚ × ΔT",
        "explanation": "Q 为换热功率；ṁ 为质量流量；cₚ 为冷却液比热；ΔT 为供回液温差。100 MW 热负荷在 ΔT=10°C 时需要约 2,390 kg/s 的水侧质量流量（忽略其他效应的示意计算）。"
      },
      "table": {
        "headers": [
          "层级",
          "要监测什么",
          "典型故障"
        ],
        "rows": [
          [
            "冷板",
            "入口/出口温度、压降",
            "堵塞、接触不良"
          ],
          [
            "机柜歧管",
            "支路流量、压差",
            "分配不均"
          ],
          [
            "CDU",
            "泵速、二次侧温度、液位",
            "泵故障、过滤器堵塞"
          ],
          [
            "设施水",
            "供回水温、总流量",
            "冷源不足、阀门异常"
          ]
        ]
      },
      "pitfalls": [
        "只看供水温度，不看流量和压差",
        "把 CDU 额定能力直接等同于长期可用能力",
        "忽略水质、材料兼容和泄漏管理"
      ],
      "related": [
        "power",
        "compute",
        "ops",
        "efficiency"
      ],
      "sources": [
        {
          "name": "NVIDIA NVL72 AI Factory · System Hardware & Components",
          "url": "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html"
        }
      ]
    },
    "compute": {
      "id": "compute",
      "domain": "aidc",
      "category": "服务器与 GPU",
      "title": "从芯片到整柜：理解 AI 服务器的资源耦合",
      "deck": "AI 服务器不是“GPU 数量越多越快”。CPU、HBM、NVLink、NIC/DPU、NVMe、供电与冷却共同决定单节点和整柜的有效算力。",
      "readMinutes": 20,
      "level": "基础",
      "tags": [
        "GPU",
        "HBM",
        "CPU",
        "NIC/DPU"
      ],
      "visual": {
        "title": "从芯片到整柜：理解 AI 服务器的资源耦合",
        "nodes": [
          "CPU|主机与编排",
          "GPU|张量计算",
          "HBM|高带宽显存",
          "NVLink|Scale-up",
          "NIC / DPU|Scale-out",
          "NVMe|本地缓存"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "性能瓶颈",
          "Compute / Memory / Network",
          "三者经常轮流主导"
        ],
        [
          "容量对象",
          "节点→托盘→机柜",
          "故障域逐级放大"
        ],
        [
          "能源关系",
          "几乎全部电功率→热",
          "供电和冷却必须同步"
        ]
      ],
      "sections": [
        {
          "title": "1. GPU 只是计算路径的一部分",
          "body": "大模型训练与推理会在矩阵计算、HBM 访问、CPU 调度、网络通信和存储加载之间切换。单看 GPU 峰值 FLOPS 无法解释真实端到端吞吐。"
        },
        {
          "title": "2. HBM 为什么重要",
          "body": "模型参数、激活和 KV Cache 都会占用显存。带宽决定数据喂给计算单元的速度，容量决定批次、上下文和模型分片方式。"
        },
        {
          "title": "3. NVLink 与 NIC 分工",
          "body": "Scale-up 通常用于节点/机柜内高带宽低延迟协作，Scale-out 负责跨节点/跨机柜扩展。两者的拓扑、拥塞模型和故障影响范围不同。"
        },
        {
          "title": "4. 从整机功耗看基础设施",
          "body": "工程容量应使用整机或整柜额定功率，而不是 GPU TDP 简单相加。风扇、泵、CPU、NIC、存储以及电源转换都会贡献额外功耗。"
        }
      ],
      "formula": {
        "expr": "Effective FLOPS ≈ Peak FLOPS × Utilization",
        "explanation": "利用率受内存、通信、调度、数据加载和软件栈影响，因此峰值算力不是业务吞吐。"
      },
      "table": {
        "headers": [
          "组件",
          "主要作用",
          "基础设施影响"
        ],
        "rows": [
          [
            "GPU",
            "矩阵/张量计算",
            "主导功耗与热密度"
          ],
          [
            "HBM",
            "参数/激活/KV Cache",
            "容量和带宽约束"
          ],
          [
            "NIC/DPU",
            "跨节点通信/卸载",
            "网络带宽与线缆密度"
          ],
          [
            "NVMe",
            "OS/缓存/Checkpoint",
            "存储吞吐与写放大"
          ]
        ]
      },
      "pitfalls": [
        "只用 TFLOPS 比较系统性能",
        "把 GPU TDP 当整机功耗",
        "忽略 NIC/存储对训练 step time 的影响"
      ],
      "related": [
        "scaleup",
        "scaleout",
        "storage",
        "cooling"
      ],
      "sources": [
        {
          "name": "NVIDIA NVL72 AI Factory Reference Architecture",
          "url": "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html"
        }
      ]
    },
    "scaleup": {
      "id": "scaleup",
      "domain": "aidc",
      "category": "Scale-up 网络",
      "title": "让多颗 GPU 像一台更大的机器协作",
      "deck": "Scale-up 关注节点/机柜内部的超高带宽低延迟互联。其目标不是“联网”，而是让并行计算在更大显存域和更低同步开销下协作。",
      "readMinutes": 18,
      "level": "进阶",
      "tags": [
        "NVLink",
        "拓扑",
        "All-Reduce",
        "显存域"
      ],
      "visual": {
        "title": "让多颗 GPU 像一台更大的机器协作",
        "nodes": [
          "GPU Group|并行任务",
          "High-speed Links|点到点链路",
          "Switch Fabric|互联交换",
          "Collective|All-Reduce",
          "Memory Domain|更大共享视图"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "主要目标",
          "低延迟+高带宽",
          "缩短集体通信"
        ],
        [
          "典型通信",
          "All-Reduce / All-Gather",
          "训练并行核心"
        ],
        [
          "设计关注",
          "拓扑亲和性",
          "作业放置要感知物理连接"
        ]
      ],
      "sections": [
        {
          "title": "1. Scale-up 和普通以太网不是一回事",
          "body": "Scale-up 互联通常围绕 GPU 间的高频同步设计，强调极低延迟、高带宽和拓扑确定性。它服务的是计算语义，而不仅是报文传输。"
        },
        {
          "title": "2. Collective 决定并行效率",
          "body": "数据并行和张量并行都会触发 All-Reduce、All-Gather、Reduce-Scatter 等集体通信。随着 GPU 数量增加，通信占比可能吞噬更多 step 时间。"
        },
        {
          "title": "3. 拓扑感知调度",
          "body": "相同 GPU 数量，如果跨越更多交换级或不对称链路，性能可能显著不同。因此调度器需要知道“哪些 GPU 彼此更近”。"
        },
        {
          "title": "4. 故障影响",
          "body": "Scale-up 故障往往直接影响一个高耦合计算域。故障隔离、降级运行和节点替换策略必须与训练框架协同。"
        }
      ],
      "formula": {
        "expr": "T_step ≈ T_compute + T_collective + T_input",
        "explanation": "当模型扩展时，Collective 通信时间会成为主要瓶颈之一。"
      },
      "table": {
        "headers": [
          "层次",
          "典型目标",
          "关注点"
        ],
        "rows": [
          [
            "节点内",
            "GPU-GPU",
            "链路带宽、Hop 数"
          ],
          [
            "机柜内",
            "GPU 域扩展",
            "交换级、布线"
          ],
          [
            "软件",
            "Collective 库",
            "拓扑发现、算法选择"
          ]
        ]
      },
      "pitfalls": [
        "把 Scale-up 与 Scale-out 只按“快慢”区分",
        "调度器不感知拓扑",
        "故障时只替换链路，不检查作业并行策略"
      ],
      "related": [
        "compute",
        "scaleout",
        "scheduling"
      ],
      "sources": [
        {
          "name": "NVIDIA NVL72 AI Factory Reference Architecture",
          "url": "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html"
        }
      ]
    },
    "scaleout": {
      "id": "scaleout",
      "domain": "aidc",
      "category": "Scale-out 网络",
      "title": "RDMA、RoCE 与 AI Fabric：跨机柜扩展有效算力",
      "deck": "当训练集群从几十块 GPU 扩展到成千上万块，网络不再是“传输通道”，而是决定有效算力的计算部件。",
      "readMinutes": 22,
      "level": "进阶",
      "tags": [
        "RDMA",
        "RoCE",
        "ECN/PFC",
        "AI Fabric"
      ],
      "visual": {
        "title": "RDMA、RoCE 与 AI Fabric：跨机柜扩展有效算力",
        "nodes": [
          "GPU / NIC|流量源",
          "Leaf|接入",
          "Spine|核心",
          "ECN/PFC|拥塞反馈",
          "RDMA|低 CPU 开销",
          "Collective|训练同步"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心目标",
          "低尾延迟",
          "慢一条流会拖慢整步训练"
        ],
        [
          "关键机制",
          "RDMA / RoCE",
          "绕过部分内核路径"
        ],
        [
          "2026 产品指标",
          "102.4 Tb/s",
          "Spectrum-6 单系统公开容量"
        ]
      ],
      "sections": [
        {
          "title": "1. 为什么训练网络对尾延迟敏感",
          "body": "同步训练中，一个 rank 迟到可能让其他 GPU 一起等待。平均带宽很高但尾部拥塞严重，仍会显著降低 MFU 和 tokens/s。"
        },
        {
          "title": "2. RDMA / RoCE",
          "body": "RDMA 让数据更直接地在主机内存与网络设备之间搬运，减少 CPU 参与和软件栈开销。RoCE 把 RDMA 语义带到以太网上，但要求更严格的拥塞与队列管理。"
        },
        {
          "title": "3. PFC、ECN 与拥塞控制",
          "body": "无损并不意味着“永不丢包”。工程重点是快速反馈拥塞、避免队列长期积压，同时防止 PFC 风暴和 Head-of-Line Blocking。"
        },
        {
          "title": "4. 网络即有效算力",
          "body": "如果网络拥塞导致 GPU 等待，电力仍然在消耗，但业务产出下降。因此网络效率应与 GPU 利用率一起看。"
        }
      ],
      "formula": {
        "expr": "Effective compute ≈ GPU capacity × Utilization(network, memory, scheduler)",
        "explanation": "网络瓶颈会直接把已购买的 GPU 算力变成等待时间。"
      },
      "table": {
        "headers": [
          "指标",
          "含义",
          "为什么重要"
        ],
        "rows": [
          [
            "Bandwidth",
            "可传输数据量",
            "决定大消息通信上限"
          ],
          [
            "Latency",
            "单次通信时间",
            "影响细粒度同步"
          ],
          [
            "Tail Latency",
            "最慢流延迟",
            "同步训练被慢 rank 拖累"
          ],
          [
            "ECN/PFC",
            "拥塞反馈/暂停",
            "决定无损网络稳定性"
          ]
        ]
      },
      "pitfalls": [
        "只测 iperf 平均吞吐",
        "把 PFC 打开就当成无损完成",
        "忽略训练框架通信模式"
      ],
      "related": [
        "scaleup",
        "scheduling",
        "ops"
      ],
      "sources": [
        {
          "name": "NVIDIA Spectrum-6 · Gigascale AI Factories",
          "url": "https://blogs.nvidia.com/blog/nvidia-spectrum-six-arrives-in-gigascale-ai-factories/"
        }
      ]
    },
    "storage": {
      "id": "storage",
      "domain": "aidc",
      "category": "存储系统",
      "title": "训练数据、Checkpoint 与存储带宽如何影响 GPU",
      "deck": "GPU 等数据时，机房仍在耗电。AIDC 存储设计的目标不是“容量够”，而是让数据准备、训练读取和 Checkpoint 不成为持续瓶颈。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "对象存储",
        "并行文件系统",
        "Checkpoint",
        "缓存"
      ],
      "visual": {
        "title": "训练数据、Checkpoint 与存储带宽如何影响 GPU",
        "nodes": [
          "Object Store|海量数据",
          "Parallel FS|高吞吐",
          "Local NVMe|缓存",
          "Data Loader|预取",
          "GPU|训练",
          "Checkpoint|回写"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "容量维度",
          "PB 级",
          "模型与数据持续增长"
        ],
        [
          "性能维度",
          "GB/s / IOPS",
          "训练与 Checkpoint 模式不同"
        ],
        [
          "可靠性",
          "恢复时间",
          "不是只看副本数"
        ]
      ],
      "sections": [
        {
          "title": "1. 三类 I/O 行为",
          "body": "训练数据通常是大量顺序或随机读取；Checkpoint 是阶段性大规模写入；元数据操作则可能是大量小文件。不同工作负载需要不同缓存与文件布局。"
        },
        {
          "title": "2. 分层存储",
          "body": "常见结构是对象存储保存长期数据，并行文件系统承担高吞吐训练，节点本地 NVMe 做热数据缓存。这样把成本和性能解耦。"
        },
        {
          "title": "3. Checkpoint 是恢复能力的一部分",
          "body": "Checkpoint 间隔越短，故障损失越小，但写入开销越高。需要结合故障概率、写带宽和恢复时间一起优化。"
        },
        {
          "title": "4. 数据管道和 GPU 利用率",
          "body": "数据清洗、解码、Tokenization、Shuffle、Prefetch 都可能让 GPU 等待。存储与数据管道需要从端到端 step time 看，而不是只看设备吞吐。"
        }
      ],
      "formula": {
        "expr": "Useful GPU time = Total time − I/O wait − communication wait − scheduling wait",
        "explanation": "存储性能最终要用“减少 GPU 等待”衡量。"
      },
      "table": {
        "headers": [
          "层",
          "适合内容",
          "典型特征"
        ],
        "rows": [
          [
            "对象存储",
            "原始数据/归档",
            "容量大、成本低"
          ],
          [
            "并行文件系统",
            "训练热数据",
            "高吞吐、并发"
          ],
          [
            "本地 NVMe",
            "缓存/临时文件",
            "低延迟、高局部性"
          ]
        ]
      },
      "pitfalls": [
        "把容量与性能混成一个指标",
        "Checkpoint 不做恢复演练",
        "数据管道只由存储团队负责"
      ],
      "related": [
        "compute",
        "scheduling",
        "ops"
      ],
      "sources": []
    },
    "scheduling": {
      "id": "scheduling",
      "domain": "aidc",
      "category": "集群与调度",
      "title": "GPU 池化、拓扑感知与有效利用率",
      "deck": "买到 GPU 只是开始。调度器负责把作业需求映射到真实拓扑、显存、网络和故障域，决定集群能否把硬件变成稳定产出。",
      "readMinutes": 19,
      "level": "进阶",
      "tags": [
        "GPU 池化",
        "拓扑感知",
        "配额",
        "利用率"
      ],
      "visual": {
        "title": "GPU 池化、拓扑感知与有效利用率",
        "nodes": [
          "Job Queue|作业",
          "Scheduler|策略",
          "Topology|物理位置",
          "GPU Pool|资源",
          "Runtime|执行",
          "Telemetry|反馈"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "优化目标",
          "吞吐 + SLO + 公平性",
          "不能只追 GPU 利用率"
        ],
        [
          "约束",
          "显存/拓扑/镜像/数据",
          "资源不是同质的"
        ],
        [
          "反馈",
          "实际运行数据",
          "调度需要闭环"
        ]
      ],
      "sections": [
        {
          "title": "1. GPU 不是完全可互换资源",
          "body": "型号、显存、拓扑、网络、驱动版本、数据本地性和故障域都会让 GPU 有不同价值。调度器必须理解这些约束。"
        },
        {
          "title": "2. Gang Scheduling",
          "body": "大规模分布式训练常要求多个资源同时就绪。如果只分配一部分 GPU，可能形成碎片或长时间占用。"
        },
        {
          "title": "3. 拓扑感知",
          "body": "同一机柜、同一高速域、跨机柜、跨 Pod 的通信成本不同。调度目标应尽量让高耦合作业获得更近的资源。"
        },
        {
          "title": "4. 利用率不是唯一 KPI",
          "body": "GPU Util 可能很高，但如果网络拥塞或 batch 设置不合理，业务产出仍然低。更应该看 tokens/s、jobs/day、SLO 和单位能耗产出。"
        }
      ],
      "formula": {
        "expr": "Effective utilization = Useful compute time / Allocated GPU time",
        "explanation": "“Allocated” 不等于“Useful”。调度、通信和 I/O 等待都会消耗已分配 GPU 时间。"
      },
      "table": {
        "headers": [
          "调度维度",
          "问题",
          "常用策略"
        ],
        "rows": [
          [
            "资源形状",
            "需要几张/多大显存",
            "队列+配额"
          ],
          [
            "拓扑",
            "GPU 是否相邻",
            "拓扑感知放置"
          ],
          [
            "优先级",
            "谁先运行",
            "Preemption / Fair-share"
          ],
          [
            "碎片",
            "小空洞太多",
            "Bin packing / Backfill"
          ]
        ]
      },
      "pitfalls": [
        "只看 GPU Util 不看业务产出",
        "忽略拓扑导致网络拖慢",
        "配额与优先级规则不可解释"
      ],
      "related": [
        "scaleup",
        "scaleout",
        "storage",
        "ops"
      ],
      "sources": []
    },
    "ops": {
      "id": "ops",
      "domain": "aidc",
      "category": "监控与运维",
      "title": "从 BMS/DCIM 到 ITSM：把告警变成闭环",
      "deck": "AIDC 运维的难点不是“能看到更多指标”，而是把电力、冷却、IT、网络和机器人巡检数据关联到同一个故障对象和处置流程。",
      "readMinutes": 21,
      "level": "进阶",
      "tags": [
        "BMS",
        "DCIM",
        "ITSM",
        "告警闭环"
      ],
      "visual": {
        "title": "从 BMS/DCIM 到 ITSM：把告警变成闭环",
        "nodes": [
          "Sensors|设备指标",
          "BMS / DCIM|设施上下文",
          "GPU / Network Telemetry|IT 指标",
          "Event Engine|关联定界",
          "ITSM|处置流程",
          "Feedback|复盘与规则更新"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "目标",
          "MTTD↓ / MTTR↓",
          "从发现到恢复"
        ],
        [
          "关键能力",
          "跨域关联",
          "电力热网络必须串起来"
        ],
        [
          "运营原则",
          "告警≠事件",
          "需要去重、聚合、定界"
        ]
      ],
      "sections": [
        {
          "title": "1. 监控层次",
          "body": "设施侧有电压、电流、温湿度、流量、压差；IT 侧有 GPU 温度、功耗、ECC、网络队列、作业状态。只有时间对齐和拓扑映射后，才能用于根因定位。"
        },
        {
          "title": "2. 告警风暴",
          "body": "一个上游故障可能触发数百个下游告警。事件引擎应把“症状”聚成“事件”，按拓扑、时间和因果规则降低噪声。"
        },
        {
          "title": "3. 从定界到处置",
          "body": "事件需要明确责任域、影响范围、SLO、Runbook 与升级策略。自动化只适合边界清晰、可回滚的动作。"
        },
        {
          "title": "4. 数据反馈",
          "body": "故障结束后应把实际根因、处置耗时、误报、遗漏和新阈值回写规则库，形成持续学习的运维体系。"
        }
      ],
      "formula": {
        "expr": "MTTR = Detection + Diagnosis + Decision + Recovery",
        "explanation": "优化 MTTR 不能只加快告警，要逐段减少诊断与决策等待。"
      },
      "table": {
        "headers": [
          "系统",
          "主要对象",
          "价值"
        ],
        "rows": [
          [
            "BMS",
            "机电设施",
            "安全与环境"
          ],
          [
            "DCIM",
            "容量/资产/能效",
            "设施与 IT 关联"
          ],
          [
            "GPU/Network Telemetry",
            "计算与通信",
            "业务性能"
          ],
          [
            "ITSM",
            "事件/变更/工单",
            "流程闭环"
          ]
        ]
      },
      "pitfalls": [
        "监控平台只是“大屏”",
        "告警数量越多越安全",
        "自动化动作没有回滚与审计"
      ],
      "related": [
        "cooling",
        "scheduling",
        "efficiency"
      ],
      "sources": []
    },
    "efficiency": {
      "id": "efficiency",
      "domain": "aidc",
      "category": "能效与成本",
      "title": "PUE 之外：单位有效算力成本才是终点",
      "deck": "低 PUE 并不自动等于高收益。AIDC 应把设施效率、GPU 利用率、网络效率、资本成本和业务产出放到同一个经济模型里。",
      "readMinutes": 20,
      "level": "进阶",
      "tags": [
        "PUE",
        "WUE",
        "TCO",
        "单位算力成本"
      ],
      "visual": {
        "title": "PUE 之外：单位有效算力成本才是终点",
        "nodes": [
          "Energy|电力成本",
          "Facility Efficiency|PUE",
          "GPU Utilization|利用率",
          "Throughput|tokens/s",
          "Capex|折旧",
          "Unit Economics|单位产出成本"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "PUE",
          "Facility / IT",
          "设施能效"
        ],
        [
          "业务指标",
          "tokens/kWh",
          "把能耗和产出连接"
        ],
        [
          "经济指标",
          "TCO / 单位有效算力",
          "避免局部最优"
        ]
      ],
      "sections": [
        {
          "title": "1. PUE 的正确用法",
          "body": "PUE 衡量设施总能耗与 IT 能耗的比值，适合观察设施侧损耗，但不能说明 IT 自身是否高效。GPU 空转时，PUE 仍可能很好看。"
        },
        {
          "title": "2. WUE 与水资源",
          "body": "冷却方案可能在电耗和用水之间权衡。WUE 需要结合地区水资源压力、气候和运行时段理解。"
        },
        {
          "title": "3. 有效算力成本",
          "body": "相同电费下，网络拥塞、调度碎片、低批处理效率都会降低有效 tokens/kWh。应把设施和软件效率放到同一张单位经济表里。"
        },
        {
          "title": "4. 生命周期视角",
          "body": "CAPEX 还包括电力设备、冷却、建筑、网络与融资成本；OPEX 包括电费、维护、备件、水、软件和人员。容量闲置同样是成本。"
        }
      ],
      "formula": {
        "expr": "PUE = Facility Energy / IT Energy；Unit Cost ≈ TCO / Useful Compute Output",
        "explanation": "第二个式子把基础设施和业务产出连接起来，更适合跨方案比较。"
      },
      "table": {
        "headers": [
          "指标",
          "适合回答",
          "不能回答"
        ],
        "rows": [
          [
            "PUE",
            "设施损耗多大",
            "GPU 是否高效"
          ],
          [
            "WUE",
            "水资源强度",
            "业务吞吐"
          ],
          [
            "GPU Util",
            "设备忙不忙",
            "忙得是否有价值"
          ],
          [
            "tokens/kWh",
            "单位能耗产出",
            "完整财务成本"
          ]
        ]
      },
      "pitfalls": [
        "把低 PUE 当成唯一 KPI",
        "只算电费不算资本闲置",
        "用峰值算力做单位成本分母"
      ],
      "related": [
        "foundation",
        "power",
        "cooling",
        "ops"
      ],
      "sources": [
        {
          "name": "IEA · Key Questions on Energy and AI",
          "url": "https://www.iea.org/reports/key-questions-on-energy-and-ai"
        }
      ]
    },
    "world-model": {
      "id": "world-model",
      "domain": "embodied",
      "category": "软件 / 世界模型",
      "title": "世界模型：让机器人在行动前先想象未来",
      "deck": "世界模型学习“状态如何随动作变化”。它可以预测未来观测、潜在状态或奖励，再让规划器在真实执行前评估候选动作。",
      "readMinutes": 26,
      "level": "核心",
      "tags": [
        "World Model",
        "Latent State",
        "Planning",
        "Physical AI"
      ],
      "visual": {
        "title": "世界模型：让机器人在行动前先想象未来",
        "nodes": [
          "Observation oₜ|摄像头/触觉",
          "Encoder|表征",
          "Latent zₜ|世界状态",
          "Dynamics fθ|状态转移",
          "Future zₜ₊₁|预测",
          "Planner / Policy|选择动作",
          "Robot Action|执行"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心能力",
          "Predict consequences",
          "动作前预测后果"
        ],
        [
          "价值",
          "更强规划与数据效率",
          "可在模型中试错"
        ],
        [
          "难点",
          "误差累积",
          "长时预测易漂移"
        ]
      ],
      "sections": [
        {
          "title": "1. 世界模型学什么",
          "body": "它不是单纯识别物体，而是学习环境的动态规律：当前状态、动作和下一状态之间的关系。状态可以是像素、3D 表征、token 或压缩后的 latent。"
        },
        {
          "title": "2. 为什么使用 Latent State",
          "body": "直接预测高清未来视频成本很高，且大量像素与控制无关。Latent 模型尝试保留对任务最有用的状态变量，让预测与规划更高效。"
        },
        {
          "title": "3. Model-based Planning",
          "body": "规划器可以在世界模型中滚动多个候选动作序列，预测未来状态/奖励，再选择最优动作。这样把一部分真实世界试错转移到模型内部。"
        },
        {
          "title": "4. 和 VLA 的组合",
          "body": "VLA 可以作为动作先验或策略，世界模型负责评估后果；反过来，世界模型也可以生成合成轨迹帮助训练策略。未来系统很可能是多模型协作，而非单一路线。"
        }
      ],
      "formula": {
        "expr": "zₜ = Enc(oₜ)；ẑₜ₊₁ = fθ(zₜ, aₜ)；a* = argmaxₐ E[R(ẑ)]",
        "explanation": "编码观测→预测动作后的未来→规划器在预测轨迹中选择动作。"
      },
      "table": {
        "headers": [
          "路线",
          "输入→输出",
          "强项"
        ],
        "rows": [
          [
            "VLM",
            "视觉+语言→理解/文本",
            "语义理解"
          ],
          [
            "VLA",
            "视觉+语言→动作",
            "直接控制"
          ],
          [
            "World Model",
            "状态+动作→未来状态",
            "后果预测"
          ],
          [
            "World-Action Model",
            "世界预测+动作生成",
            "把预测与执行耦合"
          ]
        ]
      },
      "pitfalls": [
        "把视频生成模型都称为可控世界模型",
        "长时滚动不评估误差累积",
        "世界模型强但动作空间/动力学没有对齐"
      ],
      "related": [
        "vla",
        "policy",
        "simulation",
        "perception"
      ],
      "sources": [
        {
          "name": "NVIDIA · Cosmos 3 (2026-05-31)",
          "url": "https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai"
        },
        {
          "name": "Google DeepMind · Gemini Robotics",
          "url": "https://deepmind.google/models/gemini-robotics/"
        }
      ],
      "compare": [
        {
          "name": "VLM",
          "learns": "语义与空间理解",
          "returns": "文字/结构化理解",
          "control": "弱"
        },
        {
          "name": "VLA",
          "learns": "观测到动作",
          "returns": "动作 token / trajectory",
          "control": "强"
        },
        {
          "name": "World Model",
          "learns": "世界动力学",
          "returns": "未来状态/观测",
          "control": "间接"
        },
        {
          "name": "World-Action",
          "learns": "未来+动作联合",
          "returns": "预测与动作",
          "control": "强"
        }
      ],
      "callout": "一个实用判断：如果模型回答的是“现在是什么”，更像感知/VLM；如果回答“该做什么”，更像策略/VLA；如果回答“做了以后世界会怎样”，这就是世界模型的核心问题。"
    },
    "vla": {
      "id": "vla",
      "domain": "embodied",
      "category": "软件 / VLM & VLA",
      "title": "从“看懂”到“动手”：VLM 与 VLA",
      "deck": "VLM 把视觉信息接入语言推理；VLA 再把语义与空间理解转成连续或离散动作，使基础模型真正进入机器人控制环。",
      "readMinutes": 21,
      "level": "核心",
      "tags": [
        "VLM",
        "VLA",
        "Action Token",
        "Multimodal"
      ],
      "visual": {
        "title": "从“看懂”到“动手”：VLM 与 VLA",
        "nodes": [
          "Vision|图像/视频",
          "Language|指令",
          "Multimodal Encoder|融合",
          "Reasoning|任务理解",
          "Action Head|动作生成",
          "Robot|闭环执行"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "VLM 输出",
          "语义/文本",
          "理解世界"
        ],
        [
          "VLA 输出",
          "动作/轨迹",
          "改变世界"
        ],
        [
          "核心挑战",
          "闭环误差",
          "动作错一次就改变后续观测"
        ]
      ],
      "sections": [
        {
          "title": "1. VLM 提供语义先验",
          "body": "机器人需要理解物体、关系、任务和约束。VLM 让开放词汇语义进入机器人系统，减少每个任务单独建模。"
        },
        {
          "title": "2. VLA 把动作纳入模型接口",
          "body": "VLA 常把动作离散成 token、预测连续关节/末端轨迹，或生成高层技能。关键是动作表示必须和机器人控制频率、自由度及安全约束匹配。"
        },
        {
          "title": "3. 数据组成",
          "body": "互联网视觉语言数据提供语义，机器人轨迹提供动作监督。两类数据分布差异很大，因此需要对齐、重采样和动作标准化。"
        },
        {
          "title": "4. 闭环而非一次性推理",
          "body": "机器人执行后环境会变化，模型必须再次观测并修正。闭环频率、延迟、动作平滑与安全过滤决定实际体验。"
        }
      ],
      "formula": {
        "expr": "aₜ = πθ(oₜ, instruction, history)",
        "explanation": "VLA 直接把当前观测、指令和历史映射为动作。"
      },
      "table": {
        "headers": [
          "维度",
          "VLM",
          "VLA"
        ],
        "rows": [
          [
            "训练数据",
            "图文/视频语义",
            "图文+机器人轨迹"
          ],
          [
            "输出",
            "文本/表征",
            "动作/轨迹"
          ],
          [
            "关键评测",
            "理解准确性",
            "任务成功率/安全性"
          ],
          [
            "部署",
            "云/边缘均可",
            "更受实时性约束"
          ]
        ]
      },
      "pitfalls": [
        "只看离线动作误差，不做闭环任务评测",
        "动作 token 与机器人本体不匹配",
        "语义理解强就假设控制也强"
      ],
      "related": [
        "world-model",
        "policy",
        "perception",
        "edge"
      ],
      "sources": [
        {
          "name": "Google DeepMind · Gemini Robotics",
          "url": "https://deepmind.google/models/gemini-robotics/"
        }
      ]
    },
    "policy": {
      "id": "policy",
      "domain": "embodied",
      "category": "软件 / 策略学习",
      "title": "模仿学习、强化学习与多任务策略",
      "deck": "策略是从状态到动作的决策函数。具身智能的核心问题，是如何让策略既会模仿人类经验，又能通过试错优化，并在新任务上泛化。",
      "readMinutes": 20,
      "level": "进阶",
      "tags": [
        "Imitation Learning",
        "RL",
        "Policy",
        "Reward"
      ],
      "visual": {
        "title": "模仿学习、强化学习与多任务策略",
        "nodes": [
          "Demo Data|示范",
          "Behavior Cloning|模仿",
          "Policy π|策略",
          "Environment|交互",
          "Reward / Preference|反馈",
          "Update|强化/优化"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "模仿学习",
          "稳定起点",
          "依赖示范分布"
        ],
        [
          "强化学习",
          "优化长期目标",
          "样本与安全成本高"
        ],
        [
          "混合路线",
          "BC + RL",
          "当前常见工程路径"
        ]
      ],
      "sections": [
        {
          "title": "1. Behavior Cloning",
          "body": "把专家轨迹当监督学习数据，直接学习观测到动作映射。优点是简单稳定，缺点是遇到示范之外状态时会产生分布偏移。"
        },
        {
          "title": "2. DAgger 与数据闭环",
          "body": "通过让当前策略运行、收集失败状态，再让专家标注或自动纠正，可以逐步覆盖真实执行中的偏离。"
        },
        {
          "title": "3. 强化学习",
          "body": "RL 根据奖励优化长期回报，适合接触、动态控制和复杂序列任务，但真实机器人上试错昂贵，因此常在仿真中训练再迁移。"
        },
        {
          "title": "4. 多任务与条件策略",
          "body": "统一策略通过语言、任务 token 或目标状态条件化，尝试让同一模型覆盖抓取、移动、操作等多种任务。"
        }
      ],
      "formula": {
        "expr": "π* = argmaxπ E[Σ γᵗ rₜ]",
        "explanation": "策略希望最大化折扣累计回报。"
      },
      "table": {
        "headers": [
          "方法",
          "优势",
          "主要风险"
        ],
        "rows": [
          [
            "Behavior Cloning",
            "稳定、易训练",
            "分布偏移"
          ],
          [
            "DAgger",
            "覆盖策略自己的错误状态",
            "标注成本"
          ],
          [
            "RL",
            "可优化长期目标",
            "样本/安全成本"
          ],
          [
            "Offline RL",
            "利用历史数据",
            "分布外动作估计困难"
          ]
        ]
      },
      "pitfalls": [
        "只用离线 loss 判断任务成功",
        "奖励设计过窄导致策略钻漏洞",
        "仿真训练不做真实域校准"
      ],
      "related": [
        "vla",
        "simulation",
        "world-model"
      ],
      "sources": []
    },
    "simulation": {
      "id": "simulation",
      "domain": "embodied",
      "category": "软件 / 仿真与合成数据",
      "title": "从数字孪生到 Sim2Real：让机器人先在虚拟世界练习",
      "deck": "仿真让机器人以更低成本、大规模并行地收集交互数据。真正难点不是“画得像”，而是动力学、接触、传感器和控制频率是否足够支持迁移。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "Simulation",
        "Synthetic Data",
        "Domain Randomization",
        "Sim2Real"
      ],
      "visual": {
        "title": "从数字孪生到 Sim2Real：让机器人先在虚拟世界练习",
        "nodes": [
          "CAD / Scene|场景",
          "Physics|动力学",
          "Sensors|相机/力觉",
          "Policy Training|并行训练",
          "Randomization|域随机化",
          "Real Robot|迁移"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "最大价值",
          "并行试错",
          "真实机器人无法海量摔坏"
        ],
        [
          "迁移关键",
          "随机化+校准",
          "覆盖真实不确定性"
        ],
        [
          "误区",
          "视觉逼真≠物理准确",
          "接触任务尤其敏感"
        ]
      ],
      "sections": [
        {
          "title": "1. 仿真解决什么",
          "body": "提供可重置、可并行、可标注的环境，用于强化学习、数据生成、控制器调试和安全测试。"
        },
        {
          "title": "2. Domain Randomization",
          "body": "随机纹理、光照、质量、摩擦、传感器噪声等参数，使策略不依赖仿真中的某个精确配置，从而提升真实迁移鲁棒性。"
        },
        {
          "title": "3. System Identification",
          "body": "通过真实机器人实验估计质量、摩擦、执行器延迟等参数，让仿真分布更贴近真实。"
        },
        {
          "title": "4. 合成数据与世界模型",
          "body": "仿真可以生成带完美标签的多模态数据，也可以作为世界模型训练或评测环境。"
        }
      ],
      "formula": {
        "expr": "Sim2Real gap = distribution(real) − distribution(sim)",
        "explanation": "工程目标不是让差距为零，而是让训练分布覆盖真实运行分布。"
      },
      "table": {
        "headers": [
          "仿真层",
          "需要校准",
          "常见用途"
        ],
        "rows": [
          [
            "视觉",
            "材质/光照/噪声",
            "感知训练"
          ],
          [
            "刚体动力学",
            "质量/摩擦/关节",
            "运动控制"
          ],
          [
            "接触",
            "柔顺/力反馈",
            "装配/抓取"
          ],
          [
            "传感器",
            "延迟/噪声/频率",
            "闭环策略"
          ]
        ]
      },
      "pitfalls": [
        "只追求渲染逼真",
        "固定参数训练导致过拟合仿真",
        "忽略真实控制延迟"
      ],
      "related": [
        "world-model",
        "policy",
        "perception"
      ],
      "sources": [
        {
          "name": "NVIDIA Isaac Sim / Isaac Lab",
          "url": "https://developer.nvidia.com/isaac/sim"
        }
      ]
    },
    "perception": {
      "id": "perception",
      "domain": "embodied",
      "category": "软件 / 感知系统",
      "title": "RGB、深度、触觉与力觉：机器人如何形成状态",
      "deck": "具身智能需要把视觉、几何、触觉、力和本体状态融合成可用于控制的世界表征。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "Vision",
        "Depth",
        "Tactile",
        "Sensor Fusion"
      ],
      "visual": {
        "title": "RGB、深度、触觉与力觉：机器人如何形成状态",
        "nodes": [
          "RGB|纹理语义",
          "Depth / LiDAR|几何",
          "Force / Tactile|接触",
          "Proprioception|关节状态",
          "Fusion|统一状态",
          "Policy|决策"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "视觉",
          "语义丰富",
          "易受遮挡与光照影响"
        ],
        [
          "触觉",
          "接触时关键",
          "数据稀疏、硬件复杂"
        ],
        [
          "融合",
          "互补",
          "时间同步非常重要"
        ]
      ],
      "sections": [
        {
          "title": "1. 视觉与深度",
          "body": "RGB 擅长语义，深度/点云提供几何。操作任务需要把二者转换为相对位姿、可达区域和接触面。"
        },
        {
          "title": "2. 触觉与力觉",
          "body": "装配、插拔、抓取稳定性往往无法只靠视觉判断。末端力矩、触觉阵列和关节电流提供接触状态。"
        },
        {
          "title": "3. 本体感知",
          "body": "关节位置、速度、电流、IMU 等数据描述机器人自身状态，是闭环控制基础。"
        },
        {
          "title": "4. 时间同步与融合",
          "body": "多传感器频率和延迟不同，若不同步会让策略看到“时间错位的世界”。需要时间戳、插值和延迟补偿。"
        }
      ],
      "formula": {
        "expr": "stateₜ = Fuse(visionₜ, depthₜ, tactileₜ, proprioceptionₜ)",
        "explanation": "感知融合的目标是形成对控制有用、时间一致的状态。"
      },
      "table": {
        "headers": [
          "模态",
          "优势",
          "弱点"
        ],
        "rows": [
          [
            "RGB",
            "语义丰富",
            "光照/遮挡"
          ],
          [
            "Depth",
            "几何直接",
            "反光/透明体"
          ],
          [
            "Force/Tactile",
            "接触状态",
            "局部、硬件成本"
          ],
          [
            "Proprioception",
            "高速稳定",
            "缺外部环境信息"
          ]
        ]
      },
      "pitfalls": [
        "传感器越多越好",
        "忽略时钟同步",
        "训练时有某模态、部署时缺失"
      ],
      "related": [
        "vla",
        "world-model",
        "hardware",
        "dexterity"
      ],
      "sources": []
    },
    "hardware": {
      "id": "hardware",
      "domain": "embodied",
      "category": "硬件 / 本体与执行器",
      "title": "电机、减速器、关节与控制器：智能如何落到物理世界",
      "deck": "机器人能力上限由软件和本体共同决定。扭矩密度、背隙、刚度、热、重量和控制频率会直接限制策略能做什么。",
      "readMinutes": 20,
      "level": "基础",
      "tags": [
        "Actuator",
        "Reducer",
        "Joint",
        "Dynamics"
      ],
      "visual": {
        "title": "电机、减速器、关节与控制器：智能如何落到物理世界",
        "nodes": [
          "Motor|电磁驱动",
          "Reducer|减速增扭",
          "Joint Sensor|位置/力矩",
          "Motor Driver|电流环",
          "Controller|状态控制",
          "Link / Body|机械结构"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "关键指标",
          "Torque density",
          "扭矩/重量"
        ],
        [
          "控制层级",
          "电流→速度→位置/力矩",
          "频率逐级变化"
        ],
        [
          "工程限制",
          "热+背隙+刚度",
          "影响精细控制"
        ]
      ],
      "sections": [
        {
          "title": "1. 执行器不是“有力就行”",
          "body": "同样峰值扭矩下，持续扭矩、热衰减、响应速度、重量和效率会决定机器人能否长期完成动态任务。"
        },
        {
          "title": "2. 减速器与背隙",
          "body": "谐波、RV、行星等方案在重量、刚度、效率、成本和背隙上不同。背隙和柔顺会影响精准定位与力控。"
        },
        {
          "title": "3. 多环控制",
          "body": "底层驱动器通常运行高频电流环，上层控制速度/位置/力矩，策略模型则在更低频率输出目标。多频率系统需要稳定接口。"
        },
        {
          "title": "4. 热与电源",
          "body": "执行器在高负载下发热，电池或电源又限制持续功率。高动态动作必须把热设计和能量预算纳入策略。"
        }
      ],
      "formula": {
        "expr": "τ_joint ≈ Kₜ × I × gear_ratio × η",
        "explanation": "关节扭矩与电机电流、减速比和效率相关，但持续能力还受热限制。"
      },
      "table": {
        "headers": [
          "组件",
          "关键指标",
          "影响"
        ],
        "rows": [
          [
            "电机",
            "扭矩密度/热",
            "动态能力"
          ],
          [
            "减速器",
            "背隙/刚度/效率",
            "精度与力控"
          ],
          [
            "编码器",
            "分辨率/延迟",
            "状态估计"
          ],
          [
            "驱动器",
            "电流环频率",
            "响应与安全"
          ]
        ]
      },
      "pitfalls": [
        "只看峰值扭矩",
        "控制频率和模型输出频率混在一起",
        "软件补偿无法完全消除机械背隙"
      ],
      "related": [
        "perception",
        "dexterity",
        "edge"
      ],
      "sources": []
    },
    "dexterity": {
      "id": "dexterity",
      "domain": "embodied",
      "category": "硬件 / 灵巧手",
      "title": "从夹爪到灵巧手：高自由度操作为什么难",
      "deck": "灵巧手把机器人操作从“抓住”推进到“重新摆放、旋转、插拔和工具使用”。自由度越高，动作空间、感知和控制难度也指数上升。",
      "readMinutes": 18,
      "level": "进阶",
      "tags": [
        "Dexterous Hand",
        "Tactile",
        "Force Control",
        "Manipulation"
      ],
      "visual": {
        "title": "从夹爪到灵巧手：高自由度操作为什么难",
        "nodes": [
          "Palm|基座",
          "Fingers|多自由度",
          "Tactile|接触",
          "Force Control|力控",
          "Policy|动作策略",
          "Object|在手操作"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "优势",
          "操作空间大",
          "可模仿人类工具使用"
        ],
        [
          "瓶颈",
          "动作维度高",
          "数据与控制难"
        ],
        [
          "关键感知",
          "触觉/力觉",
          "视觉常被手遮挡"
        ]
      ],
      "sections": [
        {
          "title": "1. 自由度和可控性",
          "body": "更多自由度带来更多可达姿态，但也增加控制变量和标定复杂度。策略必须学会协调手指间接触。"
        },
        {
          "title": "2. 在手操作",
          "body": "目标不是仅抓住物体，而是在不释放的情况下旋转、平移和重定位。任务高度依赖接触模型和触觉。"
        },
        {
          "title": "3. 触觉闭环",
          "body": "视觉在手指遮挡时信息不足，触觉可以检测滑移、接触面积和压力分布，为闭环调整抓力提供依据。"
        },
        {
          "title": "4. 数据问题",
          "body": "真实灵巧操作数据昂贵，遥操作、合成数据、示范重放和仿真成为重要数据来源。"
        }
      ],
      "formula": {
        "expr": "Action dimension ↑ ⇒ exploration/data complexity ↑",
        "explanation": "自由度提高扩大动作空间，需要更强先验、更好的示范或更高效学习方法。"
      },
      "table": {
        "headers": [
          "能力",
          "夹爪",
          "灵巧手"
        ],
        "rows": [
          [
            "抓取",
            "强",
            "强"
          ],
          [
            "在手旋转",
            "弱",
            "强"
          ],
          [
            "控制复杂度",
            "低",
            "高"
          ],
          [
            "数据需求",
            "较低",
            "高"
          ],
          [
            "触觉价值",
            "中",
            "高"
          ]
        ]
      },
      "pitfalls": [
        "自由度越多就一定更好",
        "只用视觉训练精细接触",
        "忽略机械可靠性和维护成本"
      ],
      "related": [
        "perception",
        "hardware",
        "policy"
      ],
      "sources": []
    },
    "edge": {
      "id": "edge",
      "domain": "embodied",
      "category": "硬件 / 边缘计算",
      "title": "机器人为什么需要在本体侧推理",
      "deck": "控制回路对延迟和网络可靠性敏感。云端模型适合复杂推理，本体侧计算负责实时感知、控制、安全和断网可用。",
      "readMinutes": 17,
      "level": "基础",
      "tags": [
        "Edge AI",
        "Latency",
        "Safety",
        "On-device"
      ],
      "visual": {
        "title": "机器人为什么需要在本体侧推理",
        "nodes": [
          "Sensors|高频输入",
          "Edge Compute|感知/策略",
          "Real-time Controller|硬实时",
          "Actuator|执行",
          "Cloud|复杂推理/更新"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "本地价值",
          "低延迟",
          "闭环控制"
        ],
        [
          "云端价值",
          "大模型/共享知识",
          "资源弹性"
        ],
        [
          "最佳结构",
          "Cloud + Edge",
          "按时间尺度分层"
        ]
      ],
      "sections": [
        {
          "title": "1. 时间尺度分层",
          "body": "电机电流环可能在 kHz，运动控制在数百 Hz，策略模型几十 Hz，高层规划可以更慢。不是所有任务都应该放在同一计算层。"
        },
        {
          "title": "2. 断网安全",
          "body": "移动机器人必须在网络不稳定时仍能完成制动、避障和安全降级，因此关键控制逻辑需要本地运行。"
        },
        {
          "title": "3. NPU/GPU 取舍",
          "body": "NPU 强调能效，GPU 更灵活。实际选择取决于模型算子、精度、内存、功耗、SDK 和实时调度能力。"
        },
        {
          "title": "4. 云边协同",
          "body": "云端可以运行更大模型、训练和 fleet learning，本体侧负责实时执行；两者通过任务级接口协作，而不是把每帧视频都发云端。"
        }
      ],
      "formula": {
        "expr": "End-to-end latency = sensing + preprocessing + inference + control + actuation",
        "explanation": "任何一段抖动都可能破坏闭环稳定性。"
      },
      "table": {
        "headers": [
          "任务",
          "适合位置",
          "原因"
        ],
        "rows": [
          [
            "电机控制",
            "本地 MCU/控制器",
            "硬实时"
          ],
          [
            "视觉避障",
            "本地 GPU/NPU",
            "低延迟"
          ],
          [
            "复杂语义规划",
            "本地或云",
            "算力/时延权衡"
          ],
          [
            "训练/大规模回放",
            "云/数据中心",
            "资源密集"
          ]
        ]
      },
      "pitfalls": [
        "模型平均延迟低就忽略 P99",
        "安全功能依赖公网",
        "只看 TOPS 不看实际算子支持"
      ],
      "related": [
        "hardware",
        "perception",
        "vla"
      ],
      "sources": []
    },
    "llm": {
      "id": "llm",
      "domain": "ml",
      "category": "大模型 / 基础",
      "title": "Transformer、Token 与预训练：大模型的最小骨架",
      "deck": "大模型的基本循环是把 token 映射为向量，通过 Attention 与 MLP 反复混合上下文，再预测下一个 token。规模只是结果，表示、数据和训练目标同样重要。",
      "readMinutes": 20,
      "level": "基础",
      "tags": [
        "Transformer",
        "Attention",
        "Token",
        "Pretraining"
      ],
      "visual": {
        "title": "Transformer、Token 与预训练：大模型的最小骨架",
        "nodes": [
          "Text / Multimodal|输入",
          "Tokenizer|离散 token",
          "Embedding|向量",
          "Attention|上下文交互",
          "MLP|非线性变换",
          "Next-token|预测"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "基本目标",
          "Next-token prediction",
          "从数据学习分布"
        ],
        [
          "核心结构",
          "Attention + MLP",
          "残差堆叠"
        ],
        [
          "扩展轴",
          "参数/数据/算力",
          "三者需要平衡"
        ]
      ],
      "sections": [
        {
          "title": "1. Tokenization",
          "body": "模型不直接读取文字，而是读取 token。词表大小、中文切分、代码与多语言覆盖都会影响序列长度和效率。"
        },
        {
          "title": "2. Self-Attention",
          "body": "每个位置根据 Query-Key 相似度聚合其他位置的 Value，从而让 token 之间建立动态依赖。"
        },
        {
          "title": "3. MLP 与残差",
          "body": "Attention 负责信息混合，MLP 进行位置独立的非线性变换；残差与归一化让深层网络更易训练。"
        },
        {
          "title": "4. 预训练",
          "body": "在海量数据上优化预测目标，让模型形成语言、知识和模式先验。之后再通过后训练塑造指令遵循、推理与安全行为。"
        }
      ],
      "formula": {
        "expr": "Attention(Q,K,V)=softmax(QKᵀ/√d)V",
        "explanation": "注意力用相似度决定不同 token 之间的信息聚合权重。"
      },
      "table": {
        "headers": [
          "概念",
          "作用",
          "常见约束"
        ],
        "rows": [
          [
            "Token",
            "离散输入单元",
            "序列长度"
          ],
          [
            "Attention",
            "跨位置交互",
            "O(n²) 计算/显存"
          ],
          [
            "MLP",
            "特征变换",
            "参数量/算力"
          ],
          [
            "Context",
            "可见历史",
            "KV Cache"
          ]
        ]
      },
      "pitfalls": [
        "把参数量当作唯一能力指标",
        "忽略 tokenizer 对多语言效率影响",
        "预训练 loss 下降就假设下游都提升"
      ],
      "related": [
        "training",
        "moe",
        "inference"
      ],
      "sources": []
    },
    "training": {
      "id": "training",
      "domain": "ml",
      "category": "大模型 / 训练与后训练",
      "title": "从预训练到后训练：模型行为是怎么被塑造的",
      "deck": "预训练学习“世界中有哪些模式”，后训练决定“模型如何响应用户、如何推理、何时调用工具”。",
      "readMinutes": 22,
      "level": "进阶",
      "tags": [
        "SFT",
        "Preference Optimization",
        "RL",
        "Reasoning"
      ],
      "visual": {
        "title": "从预训练到后训练：模型行为是怎么被塑造的",
        "nodes": [
          "Pretraining|基础能力",
          "SFT|指令格式",
          "Preference Data|偏好",
          "RL / PO|行为优化",
          "Evals|评测",
          "Iteration|迭代"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "SFT",
          "示范行为",
          "给模型正确格式与任务分布"
        ],
        [
          "偏好优化",
          "排序行为",
          "解决多答案质量差异"
        ],
        [
          "RL",
          "长期/可验证目标",
          "可用于推理与工具任务"
        ]
      ],
      "sections": [
        {
          "title": "1. SFT",
          "body": "使用高质量输入-输出示范训练模型遵循指令。SFT 的关键不是数据越多越好，而是覆盖目标任务、格式与失败模式。"
        },
        {
          "title": "2. 偏好优化",
          "body": "当多个答案都“可接受”时，偏好数据表达更细粒度的质量排序。直接偏好优化和奖励模型路线都在解决这一问题。"
        },
        {
          "title": "3. 可验证奖励",
          "body": "数学、代码、工具任务可以用可执行结果作为奖励，降低主观标注依赖，并让模型通过搜索和试错改进策略。"
        },
        {
          "title": "4. Evals 驱动训练",
          "body": "后训练需要与评测闭环：先定义能力/安全指标，再收集数据，训练后回归验证，防止优化一个指标破坏另一个指标。"
        }
      ],
      "formula": {
        "expr": "Training loop: Eval gap → Data → Optimization → Regression eval",
        "explanation": "后训练不是一次性阶段，而是围绕评测缺口持续迭代。"
      },
      "table": {
        "headers": [
          "阶段",
          "主要数据",
          "目标"
        ],
        "rows": [
          [
            "Pretraining",
            "海量无标注/弱标注",
            "基础表示与知识"
          ],
          [
            "SFT",
            "高质量示范",
            "指令遵循"
          ],
          [
            "Preference",
            "成对/排序",
            "行为质量"
          ],
          [
            "RL/Verifier",
            "交互/可验证任务",
            "推理与策略"
          ]
        ]
      },
      "pitfalls": [
        "用训练数据直接做评测",
        "只提升平均分不看回归项",
        "后训练数据分布与真实用户差太大"
      ],
      "related": [
        "llm",
        "moe",
        "inference",
        "agent"
      ],
      "sources": []
    },
    "moe": {
      "id": "moe",
      "domain": "ml",
      "category": "大模型 / MoE 与并行",
      "title": "MoE 为什么能扩参数，却不同比例增加计算",
      "deck": "Mixture-of-Experts 让每个 token 只激活部分专家，把模型总参数与单 token 计算解耦；代价是路由、负载均衡和跨设备通信更复杂。",
      "readMinutes": 20,
      "level": "进阶",
      "tags": [
        "MoE",
        "Expert Routing",
        "Tensor Parallel",
        "Pipeline"
      ],
      "visual": {
        "title": "MoE 为什么能扩参数，却不同比例增加计算",
        "nodes": [
          "Token|输入",
          "Router|选择专家",
          "Expert 1..N|部分激活",
          "All-to-All|通信",
          "Combine|合并",
          "Next Layer|继续"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心收益",
          "参数↑，FLOPs 不同比例↑",
          "稀疏激活"
        ],
        [
          "关键代价",
          "All-to-All 通信",
          "网络更重要"
        ],
        [
          "训练难点",
          "专家负载不均",
          "需要 balance loss"
        ]
      ],
      "sections": [
        {
          "title": "1. 稀疏激活",
          "body": "Dense 模型每个 token 都经过全部参数；MoE 通过路由器选择 top-k 专家，只计算其中一部分。"
        },
        {
          "title": "2. 专家并行",
          "body": "专家分布在不同 GPU 上，token 需要 All-to-All 发送到对应设备，再取回结果。网络和拓扑成为 MoE 性能核心。"
        },
        {
          "title": "3. 负载均衡",
          "body": "如果少数专家被大量 token 选择，会形成热点和容量溢出，需要辅助损失、容量因子或路由正则。"
        },
        {
          "title": "4. 多维并行",
          "body": "大模型还会组合数据并行、张量并行、流水并行、序列并行和专家并行。并行策略必须与真实网络拓扑匹配。"
        }
      ],
      "formula": {
        "expr": "Compute/token ≈ activated experts × expert size",
        "explanation": "总参数可增加，但单 token 只激活 top-k 专家。"
      },
      "table": {
        "headers": [
          "并行方式",
          "切什么",
          "主要通信"
        ],
        "rows": [
          [
            "Data Parallel",
            "Batch",
            "梯度 All-Reduce"
          ],
          [
            "Tensor Parallel",
            "层内矩阵",
            "频繁 Collective"
          ],
          [
            "Pipeline",
            "层",
            "Stage 间激活"
          ],
          [
            "Expert Parallel",
            "专家",
            "All-to-All"
          ]
        ]
      },
      "pitfalls": [
        "MoE 总参数大就等于单次推理更贵",
        "忽略专家通信热点",
        "并行策略不对齐物理拓扑"
      ],
      "related": [
        "training",
        "scaleout",
        "inference"
      ],
      "sources": []
    },
    "inference": {
      "id": "inference",
      "domain": "ml",
      "category": "大模型 / 推理系统",
      "title": "推理系统为什么越来越像操作系统",
      "deck": "生产推理的核心不再只是模型前向，而是显存管理、请求调度、KV Cache、批处理、抢占与多租户隔离。",
      "readMinutes": 23,
      "level": "核心",
      "tags": [
        "KV Cache",
        "Continuous Batching",
        "Serving",
        "SLO"
      ],
      "visual": {
        "title": "推理系统为什么越来越像操作系统",
        "nodes": [
          "Requests|不同长度",
          "Scheduler|排队/优先级",
          "KV Cache|显存状态",
          "Batcher|动态合批",
          "GPU Workers|执行",
          "Streaming|返回 token"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "TTFT",
          "首 token 延迟",
          "交互体验"
        ],
        [
          "TPOT",
          "token 间延迟",
          "生成速度"
        ],
        [
          "Throughput",
          "tokens/s",
          "系统产能"
        ],
        [
          "瓶颈",
          "KV Cache",
          "常主导显存"
        ]
      ],
      "sections": [
        {
          "title": "1. Prefill 与 Decode",
          "body": "Prefill 并行处理输入上下文，计算密度高；Decode 每步只生成一个 token，更容易受内存带宽和 KV Cache 访问影响。两阶段资源特征不同。"
        },
        {
          "title": "2. KV Cache",
          "body": "保存历史 token 的 Key/Value，避免每步重复计算，但上下文越长、并发越高，占用显存越大。系统必须做分页、复用、淘汰和配额。"
        },
        {
          "title": "3. Continuous Batching",
          "body": "不同请求长度差异大，固定 batch 会出现空洞。连续批处理允许 token 级动态加入/移除请求，提高 GPU 利用率。"
        },
        {
          "title": "4. SLO 驱动调度",
          "body": "低延迟、吞吐和成本往往冲突。生产系统需要优先级、抢占、Admission Control 和自动扩缩容。"
        }
      ],
      "formula": {
        "expr": "Capacity ≈ GPU memory − Model weights − KV Cache − Runtime overhead",
        "explanation": "KV Cache 是推理并发和上下文长度的重要容量约束。"
      },
      "table": {
        "headers": [
          "指标",
          "定义",
          "优化方向"
        ],
        "rows": [
          [
            "TTFT",
            "请求→首 token",
            "Prefill/排队"
          ],
          [
            "TPOT",
            "token 间延迟",
            "Decode/KV"
          ],
          [
            "Throughput",
            "tokens/s",
            "Batching/并发"
          ],
          [
            "Goodput",
            "满足 SLO 的吞吐",
            "调度/容量"
          ]
        ]
      },
      "pitfalls": [
        "只追最大吞吐忽略 P99",
        "KV Cache 不做配额导致 OOM",
        "压测请求长度与真实业务不一致"
      ],
      "related": [
        "llm",
        "agent",
        "runtime",
        "small-model"
      ],
      "sources": []
    },
    "agent": {
      "id": "agent",
      "domain": "ml",
      "category": "智能体 / 架构",
      "title": "Agent 不只是“LLM + Tool”：完整系统栈",
      "deck": "真正可用的 Agent 需要模型、上下文、记忆、工具、规划、执行环境、权限、评测和恢复机制共同组成。",
      "readMinutes": 22,
      "level": "核心",
      "tags": [
        "Agent",
        "Tools",
        "Memory",
        "Planner"
      ],
      "visual": {
        "title": "Agent 不只是“LLM + Tool”：完整系统栈",
        "nodes": [
          "Goal|任务目标",
          "Context|上下文",
          "Model|决策",
          "Tools|读写外部世界",
          "Memory|长期状态",
          "Executor|执行",
          "Eval / Guardrail|验证"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "关键变化",
          "从回答→执行",
          "模型影响外部世界"
        ],
        [
          "系统难点",
          "多步误差累积",
          "单步准确率不够"
        ],
        [
          "工程核心",
          "可观测+恢复",
          "知道做了什么、失败后能重试"
        ]
      ],
      "sections": [
        {
          "title": "1. Context 与 Memory",
          "body": "Context 是当前推理窗口内的信息，Memory 是跨轮次、跨任务保存的状态。二者必须有检索、压缩和更新策略，否则会无限膨胀或污染。"
        },
        {
          "title": "2. Tools",
          "body": "工具让模型读取数据库、搜索、运行代码、操作软件。每个工具都需要清晰输入输出、权限边界、幂等性和错误处理。"
        },
        {
          "title": "3. Planner / Executor",
          "body": "复杂任务可以拆成规划与执行：规划器管理目标和依赖，执行器完成具体动作。是否显式拆分取决于任务复杂度与可控性要求。"
        },
        {
          "title": "4. Guardrails 与 Evals",
          "body": "Agent 可能执行外部动作，所以评测不能只看答案质量，还要看权限使用、工具成功率、恢复率、成本和是否遵循审批。"
        }
      ],
      "formula": {
        "expr": "Agent success ≈ Π(step success) × recovery ability",
        "explanation": "多步任务里，单步错误会累积，因此恢复机制与可验证性非常重要。"
      },
      "table": {
        "headers": [
          "层",
          "职责",
          "失败例子"
        ],
        "rows": [
          [
            "Model",
            "推理/决策",
            "错误判断"
          ],
          [
            "Tool",
            "外部动作",
            "API 失败"
          ],
          [
            "Memory",
            "跨轮状态",
            "旧信息污染"
          ],
          [
            "Runtime",
            "执行与恢复",
            "任务中断"
          ],
          [
            "Eval",
            "验证结果",
            "漏掉隐性失败"
          ]
        ]
      },
      "pitfalls": [
        "工具越多越强",
        "把聊天历史直接当长期记忆",
        "没有幂等/回滚的写操作"
      ],
      "related": [
        "runtime",
        "inference",
        "training"
      ],
      "sources": [
        {
          "name": "OpenAI · Introducing the Agents API",
          "url": "https://openai.com/index/introducing-the-agents-api/"
        }
      ]
    },
    "runtime": {
      "id": "runtime",
      "domain": "ml",
      "category": "智能体 / Agent Runtime",
      "title": "从 SDK 到托管执行框架：长任务如何可靠运行",
      "deck": "当 Agent 任务从几秒延长到小时甚至数天，系统必须负责持久状态、上下文压缩、沙箱、子智能体、重试、文件和工具编排。",
      "readMinutes": 24,
      "level": "进阶",
      "tags": [
        "Runtime",
        "Sandbox",
        "Subagents",
        "Durable Execution"
      ],
      "visual": {
        "title": "从 SDK 到托管执行框架：长任务如何可靠运行",
        "nodes": [
          "Task|长期目标",
          "Harness|编排",
          "Context Compaction|上下文压缩",
          "Sandbox|文件/代码",
          "Subagents|并行分工",
          "Recovery|重试恢复",
          "Artifacts|产物"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "2026 变化",
          "Agents API 公测",
          "托管 Codex harness"
        ],
        [
          "核心能力",
          "Durable execution",
          "跨小时/天保持状态"
        ],
        [
          "边界",
          "执行环境 + 权限",
          "比模型本身更系统化"
        ]
      ],
      "sections": [
        {
          "title": "1. 为什么 SDK 不够",
          "body": "SDK 可以帮助调用模型和工具，但长任务还需要进程中断恢复、状态持久化、文件环境、重试和任务进度，这些属于运行时。"
        },
        {
          "title": "2. Context Compaction",
          "body": "长任务不可能把全部历史原样塞回模型。运行时需要总结、保留关键状态、丢弃噪声，并确保压缩后不丢失任务约束。"
        },
        {
          "title": "3. Sandbox 与文件系统",
          "body": "代码、数据和中间产物需要一个可重复执行的环境。沙箱同时也是安全边界，限制网络、凭证和系统权限。"
        },
        {
          "title": "4. Subagents",
          "body": "子智能体可以按领域拆任务并行处理，但需要主 Agent 管理上下文传递、结果验证和冲突合并。"
        }
      ],
      "formula": {
        "expr": "Durability = persisted state + idempotent tools + recovery checkpoints",
        "explanation": "可靠长任务不是“模型一直在线”，而是任何时刻中断后都能从已知状态恢复。"
      },
      "table": {
        "headers": [
          "能力",
          "短会话",
          "长任务 Runtime"
        ],
        "rows": [
          [
            "状态",
            "内存内",
            "持久化"
          ],
          [
            "上下文",
            "完整历史",
            "压缩/摘要"
          ],
          [
            "工具",
            "单次调用",
            "重试/幂等"
          ],
          [
            "文件",
            "临时",
            "持续工作区"
          ],
          [
            "失败",
            "返回错误",
            "恢复/继续"
          ]
        ]
      },
      "pitfalls": [
        "把长任务理解成“更长 context”",
        "子智能体并行但没有结果验证",
        "沙箱里暴露长期凭证"
      ],
      "related": [
        "agent",
        "inference",
        "training"
      ],
      "sources": [
        {
          "name": "OpenAI · Agents API",
          "url": "https://openai.com/index/introducing-the-agents-api/"
        },
        {
          "name": "OpenAI API · Agents overview",
          "url": "https://developers.openai.com/api/docs/guides/agents-api/overview"
        }
      ]
    },
    "small-model": {
      "id": "small-model",
      "domain": "ml",
      "category": "小模型",
      "title": "蒸馏、剪枝与量化：把能力压进更小的预算",
      "deck": "小模型不是“大模型缩水版”，而是围绕特定延迟、成本、隐私和端侧约束重新设计的系统。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "Distillation",
        "Quantization",
        "Pruning",
        "SLM"
      ],
      "visual": {
        "title": "蒸馏、剪枝与量化：把能力压进更小的预算",
        "nodes": [
          "Teacher|大模型",
          "Distillation|知识迁移",
          "Fine-tune|任务适配",
          "Quantize|低比特",
          "Runtime|算子优化",
          "Edge / Service|部署"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "核心目标",
          "低延迟/低成本",
          "在目标任务保留足够能力"
        ],
        [
          "常用手段",
          "蒸馏+量化",
          "软件硬件协同"
        ],
        [
          "评测原则",
          "任务级指标",
          "不能只看参数量"
        ]
      ],
      "sections": [
        {
          "title": "1. 蒸馏",
          "body": "让学生模型学习教师的软标签、推理轨迹或中间表示，把更大模型的行为压缩到更小参数规模。"
        },
        {
          "title": "2. 量化",
          "body": "把权重/激活从 FP16/BF16 压到 INT8、INT4 等，降低显存和带宽；精度损失取决于模型、层和校准数据。"
        },
        {
          "title": "3. 剪枝与稀疏",
          "body": "移除低贡献参数或结构，若硬件/运行时能真正利用稀疏性，才会转化为实际加速。"
        },
        {
          "title": "4. 任务专用优化",
          "body": "对于固定意图分类、视觉检测、本地助手等任务，小模型可以通过窄任务数据和蒸馏获得更好的成本/延迟比。"
        }
      ],
      "formula": {
        "expr": "Compression gain only matters if runtime maps it to latency / memory savings",
        "explanation": "模型更小不自动等于更快，取决于内核、硬件和内存访问。"
      },
      "table": {
        "headers": [
          "方法",
          "主要收益",
          "风险"
        ],
        "rows": [
          [
            "蒸馏",
            "行为迁移",
            "教师偏差被继承"
          ],
          [
            "量化",
            "显存/带宽↓",
            "精度损失"
          ],
          [
            "剪枝",
            "参数/计算↓",
            "硬件未必利用"
          ],
          [
            "任务微调",
            "目标任务↑",
            "泛化下降"
          ]
        ]
      },
      "pitfalls": [
        "只看模型文件大小",
        "量化后不做任务回归测试",
        "稀疏模型在硬件上并未真正加速"
      ],
      "related": [
        "edge-ai",
        "inference",
        "training"
      ],
      "sources": []
    },
    "edge-ai": {
      "id": "edge-ai",
      "domain": "ml",
      "category": "小模型 / Edge AI",
      "title": "NPU、端侧推理与本地智能",
      "deck": "Edge AI 把模型运行到手机、PC、摄像头和机器人上，用更低延迟、更强隐私和断网可用性换取严格的内存、功耗与算子约束。",
      "readMinutes": 18,
      "level": "基础",
      "tags": [
        "NPU",
        "On-device",
        "Latency",
        "Privacy"
      ],
      "visual": {
        "title": "NPU、端侧推理与本地智能",
        "nodes": [
          "Model|压缩模型",
          "Compiler|图优化",
          "NPU/GPU|执行",
          "Memory|共享/专用",
          "App|本地业务",
          "Cloud|可选增强"
        ],
        "caption": "沿箭头阅读：每个模块既是知识点，也是工程设计中的一个约束或接口。"
      },
      "quickFacts": [
        [
          "优势",
          "延迟/隐私",
          "不依赖网络"
        ],
        [
          "约束",
          "内存/功耗",
          "模型必须适配设备"
        ],
        [
          "工程关键",
          "Compiler + Runtime",
          "决定真实速度"
        ]
      ],
      "sections": [
        {
          "title": "1. NPU 不等于“更快的 GPU”",
          "body": "NPU 针对矩阵/张量推理优化，追求能效和持续运行。实际性能取决于算子覆盖、数据类型、内存和编译器。"
        },
        {
          "title": "2. 内存是硬约束",
          "body": "模型权重、KV Cache、激活和应用本身共享有限内存。端侧长上下文尤其容易遇到容量限制。"
        },
        {
          "title": "3. 本地与云协同",
          "body": "简单任务、本地隐私数据和实时交互可端侧完成；复杂推理可按需升级到云端，形成 routing。"
        },
        {
          "title": "4. 产品价值",
          "body": "端侧智能可用于离线助手、机器人、相机、工业终端和隐私敏感场景，但模型更新、兼容性和能耗管理同样重要。"
        }
      ],
      "formula": {
        "expr": "User latency ≈ preprocess + compile/runtime + inference + postprocess",
        "explanation": "端侧体验由完整链路决定，TOPS 只是硬件上限。"
      },
      "table": {
        "headers": [
          "维度",
          "端侧",
          "云端"
        ],
        "rows": [
          [
            "延迟",
            "低且稳定",
            "受网络影响"
          ],
          [
            "隐私",
            "数据可不出端",
            "需上传"
          ],
          [
            "算力",
            "受设备约束",
            "弹性大"
          ],
          [
            "更新",
            "设备碎片化",
            "集中部署"
          ]
        ]
      },
      "pitfalls": [
        "只用 TOPS 宣称体验",
        "模型能跑但发热降频",
        "缺少不同芯片/系统版本兼容测试"
      ],
      "related": [
        "small-model",
        "runtime",
        "edge"
      ],
      "sources": []
    }
  },
  "market": {
    "aidc": {
      "title": "全球数据中心用电需求正在快速抬升",
      "subtitle": "IEA 2026 中央情景：全球数据中心用电从 2025 年约 485 TWh 增至 2030 年约 950 TWh。",
      "unit": "TWh / year",
      "source": "IEA · Key Questions on Energy and AI (2026)",
      "sourceUrl": "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary",
      "verifiedAt": "2026-10-01",
      "points": [
        {
          "label": "2025",
          "value": 485,
          "kind": "actual"
        },
        {
          "label": "2030",
          "value": 950,
          "kind": "forecast"
        }
      ],
      "lenses": [
        {
          "label": "NVL72 full rack",
          "value": "up to 142 kW",
          "note": "GB300 NVL72 参考架构公开规格",
          "source": "NVIDIA NVL72 AI Factory",
          "url": "https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html"
        },
        {
          "label": "Spectrum-6",
          "value": "102.4 Tb/s",
          "note": "2026 公布的下一代 Spectrum-X 交换系统容量",
          "source": "NVIDIA Blog",
          "url": "https://blogs.nvidia.com/blog/nvidia-spectrum-six-arrives-in-gigascale-ai-factories/"
        },
        {
          "label": "Data center demand 2030",
          "value": "~950 TWh",
          "note": "IEA 中央情景预测，不是已发生值",
          "source": "IEA",
          "url": "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary"
        }
      ]
    }
  },
  "companies": [
    {
      "name": "NVIDIA",
      "domain": [
        "aidc",
        "embodied",
        "ml"
      ],
      "focus": [
        "AI Factory",
        "Spectrum-X / NVLink",
        "Cosmos / Robotics"
      ],
      "url": "https://www.nvidia.com/"
    },
    {
      "name": "OpenAI",
      "domain": [
        "ml"
      ],
      "focus": [
        "Frontier models",
        "Agents API",
        "Codex harness"
      ],
      "url": "https://openai.com/"
    },
    {
      "name": "Google DeepMind",
      "domain": [
        "embodied",
        "ml"
      ],
      "focus": [
        "Gemini",
        "Gemini Robotics",
        "Embodied reasoning"
      ],
      "url": "https://deepmind.google/"
    },
    {
      "name": "Vertiv",
      "domain": [
        "aidc"
      ],
      "focus": [
        "Power",
        "Thermal management",
        "Liquid cooling"
      ],
      "url": "https://www.vertiv.com/"
    },
    {
      "name": "华为",
      "domain": [
        "aidc",
        "embodied"
      ],
      "focus": [
        "昇腾",
        "数据中心能源",
        "网络与机器人生态"
      ],
      "url": "https://www.huawei.com/"
    },
    {
      "name": "AMD",
      "domain": [
        "aidc",
        "ml"
      ],
      "focus": [
        "EPYC",
        "Instinct",
        "ROCm"
      ],
      "url": "https://www.amd.com/"
    }
  ],
  "seedNews": [
    {
      "domain": "ml",
      "category": "产业动态",
      "technology": "Agent Runtime",
      "company": "OpenAI",
      "published_at": "2026-09-10",
      "verified_at": "2026-10-01",
      "title": "OpenAI 发布 Agents API 公测",
      "facts": "OpenAI 将 Codex harness 作为托管执行框架开放，覆盖上下文管理、工具、文件环境、长任务和子智能体。",
      "what_changed": "Agent 基础设施从 SDK 继续向托管 Runtime 演进。",
      "why_it_matters": "长期任务的竞争焦点正在从“单次模型调用”转向状态、工具、沙箱和恢复能力。",
      "source": "OpenAI",
      "url": "https://openai.com/index/introducing-the-agents-api/",
      "related_knowledge": "runtime",
      "related_case": ""
    },
    {
      "domain": "aidc",
      "category": "产业动态",
      "technology": "Scale-out 网络",
      "company": "NVIDIA",
      "published_at": "2026-07-21",
      "verified_at": "2026-10-01",
      "title": "Spectrum-6 面向 Gigascale AI Factory，容量达到 102.4 Tb/s",
      "facts": "NVIDIA 公布下一代 Spectrum-X Ethernet 交换系统 Spectrum-6。",
      "what_changed": "AI Fabric 的单系统带宽和规模继续向数十万 GPU 场景推进。",
      "why_it_matters": "网络正在成为决定有效算力与 tokens/s 的基础设施核心。",
      "source": "NVIDIA Blog",
      "url": "https://blogs.nvidia.com/blog/nvidia-spectrum-six-arrives-in-gigascale-ai-factories/",
      "related_knowledge": "scaleout",
      "related_case": "100MW AI Factory"
    },
    {
      "domain": "aidc",
      "category": "市场洞察",
      "technology": "Energy",
      "company": "IEA",
      "published_at": "2026-04-16",
      "verified_at": "2026-10-01",
      "title": "IEA：全球数据中心用电中央情景约从 485 TWh 增至 950 TWh",
      "facts": "2025 到 2030 约翻倍，AI-focused data centres 增速更快。",
      "what_changed": "AI 基础设施能源约束继续上升为产业核心问题。",
      "why_it_matters": "容量规划不能只跟芯片供给，电网、设备交期和资本同样决定落地速度。",
      "source": "IEA",
      "url": "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary",
      "related_knowledge": "efficiency",
      "related_case": "100MW AI Factory"
    },
    {
      "domain": "embodied",
      "category": "科研进展",
      "technology": "World Model",
      "company": "NVIDIA",
      "published_at": "2026-05-31",
      "verified_at": "2026-10-01",
      "title": "NVIDIA 发布 Cosmos 3，将物理推理、世界生成与动作预测纳入统一模型",
      "facts": "Cosmos 3 使用 mixture-of-transformers 架构，面向物理 AI 推理、世界模拟和动作生成。",
      "what_changed": "世界模型路线正在从“生成未来画面”继续向“推理 + 模拟 + 动作”统一。",
      "why_it_matters": "机器人系统可以把理解世界、预测后果和动作策略放到更紧密的模型闭环中。",
      "source": "NVIDIA Newsroom",
      "url": "https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai",
      "related_knowledge": "world-model",
      "related_case": ""
    }
  ]
};
