import type {Domain,News} from './content';
export const domainNames:Record<Domain,string>={aidc:'AIDC 智算中心',robot:'机器人与具身智能',ml:'机器学习'};
export const frameworks:Record<Domain,{thesis:string;questions:{title:string;logic:string;metrics:string;verify:string}[]}>={
 aidc:{thesis:'以有效算力交付为主线，把芯片与互联、供电与液冷、客户需求与现金流放在同一框架下判断。设备发布、项目签约和实际投产分别形成证据。',questions:[
 {title:'算力供给：从峰值算力到有效吞吐',logic:'芯片代际、显存和集合通信共同决定任务完成速度。新产品公告只说明供给方向，不能直接证明集群利用率或客户回报。',metrics:'真实任务 tokens/s、训练扩展效率、GPU 利用率、交付周期',verify:'技术报告与模型卡 → 系统压测 → 客户验收；关注 NVIDIA Research、华为及服务器企业披露。'},
 {title:'设施约束：能源、液冷与建设节奏',logic:'高密度算力增加供电和冷却约束；项目 MW 口径需区分 IT 容量、设施总容量、在建与已投产。利率变化影响资本开支的融资成本。',metrics:'IT MW、机柜 kW、PUE、液冷覆盖率、单位 GPU 小时成本',verify:'工程负载与能效实测 → 运营披露 → IEA/IDC 等研究；FRED 利率只作融资环境背景。'},
 {title:'商业兑现：订单、收入与现金流',logic:'产业景气应以订单转交付和现金回收验证。GPU、服务器、液冷、光模块和 IDC 的收入确认周期不同。',metrics:'确认收入、订单积压、资本开支、应收账款、经营现金流',verify:'SEC/交易所定期报告 → 企业业绩会 → 机构研究；避免重复累计产业链上下游营收。'}]},
 robot:{thesis:'沿着数据、策略、本体、任务成功率和交付运营成本梳理证据。演示视频、实验室评测和规模化部署处于不同验证阶段。',questions:[
 {title:'软件能力：世界模型与操作策略',logic:'世界模型关注环境演化预测，VLA 关注感知到动作映射。模型需要在闭环任务中接受检验，视频逼真度不是控制可靠性的替代指标。',metrics:'跨场景成功率、接管率、动作时延、失败恢复率',verify:'原论文/代码 → RoboArena 成对评测 → 自有任务集；记录本体、场景和样本数。'},
 {title:'数据与硬件：泛化的实际边界',logic:'数据覆盖、力触觉和关节性能影响迁移效果。AGIBOT WORLD 等数据资源应核对任务分布与许可证；数据量增长未必带来泛化提升。',metrics:'任务覆盖、有效轨迹、关节连续扭矩、末端精度、温升',verify:'数据集文档 → 本体规格 → 连续作业测试；公开样机与量产版本分开记录。'},
 {title:'产业落地：从交付数量到运行效率',logic:'订单、交付和现场持续使用是三个阶段。工业机器人安装量不能直接代表人形机器人销量，集团收入也不能当作人形机器人收入。',metrics:'验收交付量、开机时长、人工接管、单任务成本、售后成本',verify:'IDC/Counterpoint 统计口径 → 企业报告 → 客户现场证据；检查渠道库存和意向订单。'}]},
 ml:{thesis:'把能力评测、推理成本与商业需求联合分析，分别观察大模型、智能体和小模型。模型数量、榜单热度和调用量都不能单独证明企业盈利。',questions:[
 {title:'大模型：能力与价格的共同变化',logic:'对比模型时同时固定任务、上下文、输出长度和推理设置。OpenRouter 报价是服务目录信息，使用量榜单不是独立能力评测。',metrics:'任务通过率、输入/输出美元每百万 token、上下文、尾延迟',verify:'官方模型卡与基准 → 可复现任务评测 → 当前服务报价；缓存折扣与路由价格另计。'},
 {title:'智能体：任务闭环与部署条件',logic:'工具调用成功不等于业务成功。需要记录端到端结果、重试次数、权限边界和人工审核成本。机构对采用率的调查应保留样本与年份。',metrics:'端到端完成率、工具错误率、人工介入率、单任务总成本',verify:'产品文档 → 真实工作流评测 → 客户留存；Palantir 等厂商案例需核对实施条件。'},
 {title:'小模型：部署效率与专用价值',logic:'蒸馏、量化和专用微调可以降低运行成本，但要验证任务精度和硬件适配。云分部收入与单个模型业务收入需要分开。',metrics:'显存占用、功耗、吞吐、准确率、客户续费和毛利',verify:'模型卡与量化版本 → 目标设备测试 → 企业财务；小参数量不自动等于低总成本。'}]}
};

const topicRules:Record<Domain,RegExp[]>={
 aidc:[/gpu|chip|semiconductor|nvidia|blackwell|rubin|芯片|昇腾|互联|超节点|算力/i,/cooling|power|energy|grid|liquid|电力|液冷|供电|能源|机房/i,/invest|capital|revenue|earning|demand|市场|融资|订单|营收|财报|投资/i],
 robot:[/world.model|vla|policy|cosmos|genie|v-jepa|模型|策略|具身/i,/dataset|data|hardware|sensor|actuator|数据|硬件|传感|关节|灵巧手/i,/deploy|commercial|manufactur|deliver|factory|应用|商业|量产|交付|工厂|订单/i],
 ml:[/llm|language.model|benchmark|reason|pricing|大模型|推理|评测|报价|千问|deepseek/i,/agent|tool.use|workflow|智能体|工作流|工具调用/i,/small.model|distill|quantiz|edge|小模型|蒸馏|量化|端侧/i]
};
export function evidenceTopics(domain:Domain,items:News[]){return frameworks[domain].questions.map((q,i)=>{const seen=new Set<string>();const matches=items.filter(n=>n.domain===domain&&topicRules[domain][i].test(n.title+' '+(n.summary||''))&&!seen.has(n.url)&&Boolean(seen.add(n.url))).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));return {title:q.title,count:matches.length,latest:matches.slice(0,3)};});}
