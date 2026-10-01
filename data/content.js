window.ATLAS = {
  meta: {
    verifiedAt: "2026-10-01",
    title: "知域 · Technology Atlas",
    subtitle: "从算力基础设施，到机器人与机器学习"
  },
  domains: {
    aidc: {
      name: "AIDC 智算中心",
      eyebrow: "AI DATA CENTER",
      intro: "从电网到 GPU、从热管理到网络互联，把 AI Factory 当作一个完整的工程系统来学习。",
      accent: "基础设施 · 算力 · 能效",
      knowledge: [
        ["01","规划与土建","从业务负载反推园区、电力、白空间与建设边界。","foundation"],
        ["02","供配电","市电、中压、变压器、UPS、母线、PDU 到 GPU 的完整链路。","power"],
        ["03","制冷与液冷","芯片热量、冷板、CDU、一次/二次侧与室外冷源。","cooling"],
        ["04","服务器与 GPU","计算节点、GPU、CPU、HBM、NIC 与整机功耗。","compute"],
        ["05","Scale-up 网络","机内与机柜内高带宽互联、拓扑与同步。","scaleup"],
        ["06","Scale-out 网络","RDMA、RoCE、拥塞控制与 AI Fabric。","scaleout"],
        ["07","存储系统","训练数据、Checkpoint、对象/并行文件系统与吞吐。","storage"],
        ["08","集群与调度","GPU 池化、作业调度、拓扑感知与利用率。","scheduling"],
        ["09","监控与运维","BMS/DCIM/ITSM、告警、故障域与闭环。","ops"],
        ["10","能效与成本","PUE、WUE、CAPEX、OPEX 与单位算力成本。","efficiency"]
      ]
    },
    embodied: {
      name: "具身智能",
      eyebrow: "EMBODIED INTELLIGENCE",
      intro: "把世界模型、VLA、策略学习、仿真与机器人本体放在同一条感知—推理—行动链路中理解。",
      accent: "世界模型 · VLA · 机器人",
      knowledge: [
        ["01","世界模型","从观测构建潜在状态，并预测动作后的未来世界。","world-model"],
        ["02","VLM / VLA","视觉语言理解如何延伸为可执行动作。","vla"],
        ["03","策略学习","模仿学习、强化学习与多任务策略。","policy"],
        ["04","仿真与合成数据","数字孪生、Domain Randomization 与 Sim2Real。","simulation"],
        ["05","感知系统","RGB、深度、触觉、力觉、定位与融合。","perception"],
        ["06","本体与执行器","关节、减速器、电机、控制器与动力学。","hardware"],
        ["07","灵巧手","高自由度末端、触觉闭环与精细操作。","dexterity"],
        ["08","边缘计算","机器人侧算力、实时控制与模型部署。","edge"]
      ]
    },
    ml: {
      name: "机器学习",
      eyebrow: "MACHINE LEARNING",
      intro: "从基础模型、智能体到端侧小模型，系统追踪训练、推理、运行时与部署技术。",
      accent: "大模型 · 智能体 · 小模型",
      knowledge: [
        ["01","大模型基础","Transformer、Attention、Tokenization 与预训练。","llm"],
        ["02","训练与后训练","SFT、偏好优化、强化学习与推理训练。","training"],
        ["03","MoE 与并行","专家路由、数据/张量/流水/序列并行。","moe"],
        ["04","推理系统","KV Cache、Batching、Speculative Decoding 与 Serving。","inference"],
        ["05","智能体架构","Context、Memory、Tools、Planner、Executor。","agent"],
        ["06","Agent Runtime","沙箱、长任务、子智能体、Computer Use 与可观测。","runtime"],
        ["07","小模型","蒸馏、剪枝、量化与任务专用模型。","small-model"],
        ["08","Edge AI","NPU、端侧推理、隐私、能耗与实时性。","edge-ai"]
      ]
    }
  },
  studyPlan: [
    {domain:"aidc",title:"为什么 AI 机柜正在走向液冷？",path:["GPU 热流密度","冷板与 TIM","CDU 双回路","园区冷源"],minutes:28,article:"cooling"},
    {domain:"ml",title:"从 LLM 到 Agent Runtime：智能体真正多了什么？",path:["模型","工具调用","记忆与上下文","长任务与子智能体"],minutes:25,article:"agent"},
    {domain:"embodied",title:"世界模型到底和 VLA 有什么区别？",path:["观测","潜在状态","未来预测","策略与动作"],minutes:26,article:"world-model"},
    {domain:"aidc",title:"100MW AI Factory 如何从 GPU 数量推导到电力容量？",path:["IT Load","机柜功率","PUE","Facility Load"],minutes:30,article:"power"},
    {domain:"ml",title:"为什么推理系统越来越像一个操作系统？",path:["KV Cache","调度","批处理","多租户"],minutes:24,article:"inference"}
  ],
  articles: {
    cooling: {
      domain:"aidc",category:"制冷与液冷",title:"从芯片热量到室外冷源：液冷的完整链路",
      lead:"液冷并不是“把水送进服务器”这么简单。真正的工程边界跨越芯片封装、服务器、机柜、CDU、设施水系统和室外冷源。",
      sections:[
        ["1. 热从哪里来","GPU/CPU 的电功率最终绝大部分都会转化为热。随着单柜功率跨越百千瓦级，传统空气换热所需风量、压损与噪声迅速上升，液体更高的比热容与换热能力使其成为高热流密度场景的关键路径。"],
        ["2. 冷板回路","冷板直接贴近 GPU/CPU，通过冷却液带走热量。冷板内部流道需要在换热、压损、堵塞风险与均匀性之间权衡。服务器侧通常属于技术冷却系统的一部分。"],
        ["3. CDU 的作用","CDU 连接 IT 侧冷却回路与设施侧水系统，承担换热、泵送、压差控制、过滤、补液和监测。它同时也是重要故障域，因此容量与冗余设计必须与机柜分组匹配。"],
        ["4. 设施侧与室外冷源","设施侧把热量送往冷机、冷却塔、干冷器或其他热排散设备。供回水温度越高，越有机会提高自然冷却时长并降低制冷能耗，但必须满足服务器入口温度和换热余量。"]
      ],
      formula:"Q = ṁ × cₚ × ΔT\n其中 Q 为换热功率，ṁ 为质量流量，cₚ 为冷却液比热容，ΔT 为供回液温差。",
      sources:[
        ["NVIDIA AI Factory / 800 VDC infrastructure","https://blogs.nvidia.com/blog/800-vdc-power-architecture-ai-factory/"],
        ["IEA · Key Questions on Energy and AI","https://www.iea.org/reports/key-questions-on-energy-and-ai"]
      ]
    },
    power: {
      domain:"aidc",category:"供配电",title:"从电网到 GPU：AI Factory 的供电链路",
      lead:"AIDC 的供电系统不是“UPS + PDU”的简单组合，而是一条由电网接入、电压等级、转换效率、冗余方式和故障域共同决定的能量路径。",
      sections:[
        ["1. 传统链路","Grid → MV Switchgear → Transformer → LV Switchgear → UPS → Busway → Rack PDU → PSU → VRM → GPU。每一次转换都会产生损耗，也引入设备与故障点。"],
        ["2. 冗余不是可用性的同义词","N+1、2N 只描述容量或路径冗余形式。真正业务可用性还取决于故障隔离、维护切换、控制系统、旁路路径和操作流程。"],
        ["3. 800 VDC 为什么出现","随着机柜功率继续上升，高压直流可以减少部分转换级并降低同功率下的电流，从而缓解铜耗、配电体积和效率压力。2026 年 NVIDIA 与生态伙伴已经公开推进 800 VDC AI Factory 架构。"]
      ],
      formula:"Facility Load = IT Load × PUE\nI = P / V\n在相同功率 P 下，提高配电电压 V 可以降低电流 I，从而降低与 I²R 相关的导体损耗。",
      sources:[["NVIDIA · 800 VDC Power Architecture","https://blogs.nvidia.com/blog/800-vdc-power-architecture-ai-factory/"]]
    },
    world_model: {
      domain:"embodied",category:"软件 / 世界模型",title:"世界模型：让机器人在行动前先预测未来",
      lead:"VLA 直接学习“看见什么、听到什么、该做什么”；世界模型进一步显式或隐式学习环境状态如何随动作变化。两者可以独立，也可以组合。",
      sections:[
        ["1. 基本对象","机器人在时间 t 接收观测 oₜ，经编码得到潜在状态 zₜ。给定动作 aₜ，世界模型预测 zₜ₊₁ 或未来观测，再由规划器或策略选择动作。"],
        ["2. 与 VLM 的区别","VLM 重点解决视觉与语言理解；它可以回答“这是什么、应该怎么做”，但不天然具备闭环动作控制。"],
        ["3. 与 VLA 的区别","VLA 把视觉/语言输入映射为动作序列。世界模型则关注“动作会如何改变世界”。在复杂规划中，二者可以形成 model-based policy。"],
        ["4. 2026 路线","NVIDIA Cosmos 3 将视觉推理、世界生成和动作预测组合进 Physical AI 基础模型；Google DeepMind 的 Gemini Robotics 2 则继续推进具身推理与全身控制。"]
      ],
      formula:"zₜ = Enc(oₜ)\nẑₜ₊₁ = fθ(zₜ, aₜ)\naₜ = π(zₜ, goal)",
      sources:[
        ["NVIDIA Cosmos 3","https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai/"],
        ["Google DeepMind · Gemini Robotics 2","https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/"]
      ]
    },
    agent: {
      domain:"ml",category:"智能体",title:"从“LLM 调工具”到 Agent Runtime",
      lead:"真正的智能体系统不仅需要模型，还需要上下文管理、工具、运行环境、长期任务、子智能体、可观测与评测。",
      sections:[
        ["1. Agent 系统栈","Model → Context → Memory → Planner → Tools → Executor → Environment → Eval/Guardrail。模型只是其中一个层。"],
        ["2. 为什么需要 Runtime","长任务会经历多轮工具调用、文件变化、错误恢复和上下文压缩。Runtime 负责把这些状态持久化，并在任务跨度从分钟扩大到小时甚至天时保持可靠。"],
        ["3. 子智能体","子智能体允许把检索、编码、验证等工作拆开执行。关键问题不只是“并发”，而是任务边界、上下文传递、结果合并和失败重试。"],
        ["4. 2026 的变化","OpenAI 在 2026-09-10 发布 Agents API，公开强调 Codex harness、长任务、工具、文件环境与 subagents；这说明 Agent 基础设施正从 SDK 逐步演进为托管运行时。"]
      ],
      formula:"Agent = Model + State + Tools + Runtime + Feedback\n可靠性 ≠ 单次模型准确率，而是多步成功率、恢复能力与可观测性的组合。",
      sources:[["OpenAI · Introducing the Agents API","https://openai.com/index/introducing-the-agents-api/"]]
    },
    inference: {
      domain:"ml",category:"大模型 / 推理",title:"推理系统为什么越来越像操作系统",
      lead:"当大模型进入生产，核心问题从“能不能生成”变成“如何在有限 GPU、显存和延迟预算下调度大量并发请求”。",
      sections:[
        ["1. KV Cache","自回归生成中，历史 token 的 K/V 可以缓存，避免重复计算。但 KV Cache 会快速占用显存，因此成为容量规划的重要约束。"],
        ["2. Continuous Batching","推理请求长度不一致，静态 batch 会产生大量空转。连续批处理允许在 token 级动态加入/移除请求，提高 GPU 利用率。"],
        ["3. 调度与抢占","系统需要在 TTFT、吞吐、SLO 和显存之间平衡。不同优先级请求可能需要排队、抢占或迁移。"],
        ["4. 推理架构与 AIDC 的联系","更高吞吐会改变网络流量、GPU 利用率和热负载，所以推理系统优化最终会反馈到基础设施侧。"]
      ],
      formula:"Throughput ≈ Generated tokens / second\nTTFT = request arrival → first token\nTPOT = inter-token latency",
      sources:[]
    }
  },
  market: {
    aidc: {
      title:"全球数据中心用电：需求增长与设施约束",
      unit:"TWh / 年",
      source:"IEA · Key Questions on Energy and AI（2026）",
      sourceUrl:"https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary",
      note:"IEA 中央情景：全球数据中心用电从 2025 年约 485 TWh 增至 2030 年约 950 TWh。2030 为预测，不是已发生值。",
      points:[
        {label:"2025",value:485,type:"actual"},
        {label:"2026",value:560,type:"estimate"},
        {label:"2027",value:650,type:"estimate"},
        {label:"2028",value:750,type:"estimate"},
        {label:"2029",value:850,type:"estimate"},
        {label:"2030",value:950,type:"forecast"}
      ]
    }
  },
  companies: [
    {name:"NVIDIA",domain:["aidc","embodied","ml"],focus:["GPU / AI Factory","Spectrum-X","Cosmos / Robotics"],url:"https://www.nvidia.com/"},
    {name:"Google DeepMind",domain:["embodied","ml"],focus:["Gemini","Gemini Robotics","具身推理"],url:"https://deepmind.google/"},
    {name:"OpenAI",domain:["ml"],focus:["Frontier Models","Agents API","Codex / Tool Use"],url:"https://openai.com/"},
    {name:"Vertiv",domain:["aidc"],focus:["供配电","热管理","液冷"],url:"https://www.vertiv.com/"},
    {name:"华为",domain:["aidc","embodied"],focus:["昇腾","数据中心能源","网络"],url:"https://www.huawei.com/"},
    {name:"AMD",domain:["aidc","ml"],focus:["EPYC","Instinct","ROCm"],url:"https://www.amd.com/"}
  ],
  seedNews: [
    {domain:"aidc",category:"产业动态",technology:"供配电",company:"NVIDIA",published_at:"2026-08-11",verified_at:"2026-10-01",title:"NVIDIA 推进 800 VDC AI Factory 电力架构",facts:"通过提高配电电压并减少转换级，为更高机柜功率密度提供升级路径。",what_changed:"AI Factory 的电力架构开始从传统 AC 配电向混合 AC / 800 VDC 方案演进。",why_it_matters:"高密度机柜的瓶颈不再只在 GPU，本地配电效率、铜耗和设备体积正在成为系统级约束。",source:"NVIDIA Blog",url:"https://blogs.nvidia.com/blog/800-vdc-power-architecture-ai-factory/",related_knowledge:"power",related_case:"100MW AI Factory"},
    {domain:"aidc",category:"产业动态",technology:"Scale-out 网络",company:"NVIDIA",published_at:"2026-07-21",verified_at:"2026-10-01",title:"Spectrum-6 面向 Gigascale AI Factory，交换容量 102.4 Tb/s",facts:"Spectrum-6 作为新一代 Spectrum-X Ethernet 交换系统，公开容量达到 102.4 Tb/s。",what_changed:"以太网 AI Fabric 继续向数十万 GPU 规模扩展。",why_it_matters:"网络正从附属资源变为决定训练和推理有效算力的核心基础设施。",source:"NVIDIA Blog",url:"https://blogs.nvidia.com/blog/nvidia-spectrum-six-arrives-in-gigascale-ai-factories/",related_knowledge:"scaleout",related_case:"100MW AI Factory"},
    {domain:"ml",category:"产业动态",technology:"Agent Runtime",company:"OpenAI",published_at:"2026-09-10",verified_at:"2026-10-01",title:"OpenAI 发布 Agents API 公测",facts:"提供托管 Codex harness，用于上下文管理、工具调用、长任务、文件环境与子智能体协作。",what_changed:"Agent 开发从库和 SDK 继续向托管运行时演进。",why_it_matters:"未来智能体竞争不只在模型，而在任务执行基础设施、状态管理和工具生态。",source:"OpenAI",url:"https://openai.com/index/introducing-the-agents-api/",related_knowledge:"agent",related_case:"Agent Runtime"},
    {domain:"embodied",category:"科研进展",technology:"机器人基础模型",company:"Google DeepMind",published_at:"2026-07-30",verified_at:"2026-10-01",title:"Gemini Robotics 2 推进全身智能与精细操作",facts:"面向全身控制、灵巧操作与跨机器人能力泛化。",what_changed:"具身基础模型的能力边界从单机械臂任务扩展到更完整的全身控制与协作。",why_it_matters:"机器人模型的训练目标开始覆盖本体差异、全身动力学与复杂任务协调。",source:"Google DeepMind",url:"https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/",related_knowledge:"vla",related_case:"Embodied Lab"},
    {domain:"embodied",category:"科研进展",technology:"世界模型",company:"NVIDIA",published_at:"2026-05-31",verified_at:"2026-10-01",title:"NVIDIA Cosmos 3 将推理、世界生成与动作预测统一",facts:"Cosmos 3 使用 mixture-of-transformers 架构，将视觉推理、世界模拟和动作生成组合到 Physical AI 基础模型。",what_changed:"世界模型正与动作模型逐步融合。",why_it_matters:"未来机器人策略可能更多通过预测未来世界来支持规划和数据生成。",source:"NVIDIA Newsroom",url:"https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai/",related_knowledge:"world-model",related_case:"Embodied Lab"}
  ]
};
