import type {Domain} from './content';
export type CatalogSource={id:string;name:string;group:string;url:string;mode:string;purpose:string;note:string;feedGroup:string;domains:Domain[]};
export const sourceCatalog:CatalogSource[]=[
  {
    "id": "te",
    "name": "Trading Economics · 中国经济指标",
    "group": "宏观与政策",
    "url": "https://tradingeconomics.com/china/indicators",
    "mode": "参考入口",
    "purpose": "经济增长、通胀与制造业景气",
    "note": "商业数据接口需授权；数值需核对统计期。",
    "feedGroup": "",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "sec",
    "name": "SEC EDGAR",
    "group": "企业披露",
    "url": "https://www.sec.gov/edgar/search/",
    "mode": "公开索引",
    "purpose": "美股企业 10-K、10-Q、8-K 原始披露",
    "note": "区分财年、季度与币种；不以标题自动填财务指标。",
    "feedGroup": "披露与政策",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "seekingalpha",
    "name": "Seeking Alpha",
    "group": "市场与媒体",
    "url": "https://seekingalpha.com/",
    "mode": "公开索引",
    "purpose": "公司研究与业绩会线索",
    "note": "观点非公司披露；全文可能需要订阅。",
    "feedGroup": "财经媒体",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "investing",
    "name": "英为财情 Investing.com",
    "group": "市场与媒体",
    "url": "https://cn.investing.com/",
    "mode": "公开索引",
    "purpose": "宏观新闻与上市公司动态",
    "note": "延迟行情与实时报价区分；不采集登录内容。",
    "feedGroup": "财经媒体",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "ths",
    "name": "同花顺 F10 · 联芸科技",
    "group": "企业披露",
    "url": "https://basic.10jqka.com.cn/688449/",
    "mode": "参考入口",
    "purpose": "存储控制芯片产业链与公司资料",
    "note": "截图 A06126 为历史标识；现入口需以公司名称核对，财务回溯交易所。",
    "feedGroup": "",
    "domains": [
      "aidc"
    ]
  },
  {
    "id": "blackrock",
    "name": "BlackRock Investment Institute",
    "group": "机构研报",
    "url": "https://www.blackrock.com/corporate/insights/blackrock-investment-institute/publications",
    "mode": "公开索引",
    "purpose": "AI 资本开支与宏观配置研究",
    "note": "研究观点和预测，不是已实现市场规模。",
    "feedGroup": "全球资产配置",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "tradingkey",
    "name": "TradingKey",
    "group": "市场与媒体",
    "url": "https://www.tradingkey.com/zh-hans",
    "mode": "公开索引",
    "purpose": "全球财经与科技市场线索",
    "note": "媒体解读应与公司公告交叉核对。",
    "feedGroup": "财经媒体",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "capital",
    "name": "Capital Group",
    "group": "机构研报",
    "url": "https://www.capitalgroup.com/",
    "mode": "公开索引",
    "purpose": "市场波动、企业盈利与长期投资研究",
    "note": "地区站内容不同；投资观点非事实指标。",
    "feedGroup": "全球资产配置",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "pbc",
    "name": "中国人民银行",
    "group": "宏观与政策",
    "url": "https://www.pbc.gov.cn/",
    "mode": "公开索引",
    "purpose": "货币政策、融资条件与金融统计",
    "note": "月度统计不是实时值；需注明发布日期。",
    "feedGroup": "披露与政策",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "safe",
    "name": "国家外汇管理局",
    "group": "宏观与政策",
    "url": "https://www.safe.gov.cn/",
    "mode": "公开索引",
    "purpose": "外汇、国际收支与跨境资本",
    "note": "外汇储备变化同时受估值与交易影响。",
    "feedGroup": "披露与政策",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "fred",
    "name": "FRED",
    "group": "宏观与政策",
    "url": "https://fred.stlouisfed.org/",
    "mode": "数据接口",
    "purpose": "利率与融资环境时间序列",
    "note": "保留观察日期和单位；数据发布可能滞后。",
    "feedGroup": "",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "cofer",
    "name": "IMF COFER",
    "group": "宏观与政策",
    "url": "https://data.imf.org/en/datasets/IMF.STA:COFER",
    "mode": "参考入口",
    "purpose": "官方外汇储备币种构成",
    "note": "季度频率；不是 AI 产业直接需求指标。",
    "feedGroup": "",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "worldbank",
    "name": "World Bank Open Data",
    "group": "宏观与政策",
    "url": "https://data.worldbank.org/",
    "mode": "数据接口",
    "purpose": "中美 GDP 增长与宏观背景",
    "note": "年度统计可能修订；不把最新年度值称为实时增速。",
    "feedGroup": "",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "csrc",
    "name": "中国证监会",
    "group": "企业披露",
    "url": "https://www.csrc.gov.cn/",
    "mode": "公开索引",
    "purpose": "监管政策与资本市场制度",
    "note": "截图 2021 年券商分类为历史资料；使用现行公告核对。",
    "feedGroup": "披露与政策",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "backtrader",
    "name": "Backtrader · 官方文档",
    "group": "研究与评测",
    "url": "https://www.backtrader.com/docu/",
    "mode": "参考入口",
    "purpose": "回测方法与研究可复现性",
    "note": "使用官方文档替代无法识别的中文镜像；回测不是实时行情。",
    "feedGroup": "",
    "domains": [
      "ml"
    ]
  },
  {
    "id": "hillhouse",
    "name": "高瓴 Hillhouse",
    "url": "https://www.hillhouseinvestment.com/news/",
    "purpose": "产业投资、被投企业及并购动态",
    "group": "机构研报",
    "mode": "公开索引",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ],
    "note": "官方新闻入口；历史公告保留原始日期，不视为今日进展。"
  },
  {
    "id": "tpg",
    "name": "TPG",
    "group": "机构研报",
    "url": "https://www.tpg.com/",
    "mode": "公开索引",
    "purpose": "私募资本、数字基础设施与科技投资",
    "note": "组合投资和观点不等于行业全量统计。",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "openrouter",
    "name": "OpenRouter · LLM Rankings",
    "group": "研究与评测",
    "url": "https://openrouter.ai/rankings",
    "mode": "数据接口",
    "purpose": "模型目录、上下文和接口报价",
    "note": "接入模型 API；使用量榜单保留原站入口，不把模型目录排序当能力排名。",
    "feedGroup": "",
    "domains": [
      "ml"
    ]
  },
  {
    "id": "roboarena",
    "name": "RoboArena",
    "group": "研究与评测",
    "url": "https://robo-arena.github.io/",
    "mode": "公开索引",
    "purpose": "真实机器人双盲成对评测",
    "note": "任务与本体条件决定结果；不与语言模型榜单混排。",
    "feedGroup": "机器人开放研究",
    "domains": [
      "robot"
    ]
  },
  {
    "id": "agibot",
    "name": "AGIBOT WORLD",
    "group": "研究与评测",
    "url": "https://agibot-world.com/",
    "mode": "公开索引",
    "purpose": "具身操作数据、基准与开放研究",
    "note": "区分数据集规模、许可证与任务泛化。",
    "feedGroup": "机器人开放研究",
    "domains": [
      "robot"
    ]
  },
  {
    "id": "counterpoint",
    "name": "Counterpoint Research",
    "group": "行业研究",
    "url": "https://counterpointresearch.com/en",
    "mode": "公开索引",
    "purpose": "半导体、终端和 AI 市场研究",
    "note": "公开摘要可索引，付费报告与预测口径保留原站。",
    "feedGroup": "产业研究机构",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "sequoia",
    "name": "Sequoia Capital",
    "group": "机构研报",
    "url": "https://sequoiacap.com/",
    "mode": "公开索引",
    "purpose": "AI 创业与应用商业化",
    "note": "投资机构观点有样本选择，不当作行业普查。",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "prosus",
    "name": "Prosus · 投资者关系",
    "url": "https://www.prosus.com/investors",
    "purpose": "年度业绩、投资组合与 AI 战略",
    "group": "企业披露",
    "mode": "公开索引",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ],
    "note": "使用 HTTPS 官方入口；集团业绩不等同 AI 业务收入。"
  },
  {
    "id": "temasek",
    "name": "Temasek",
    "group": "机构研报",
    "url": "https://www.temasek.com.sg/en/index",
    "mode": "公开索引",
    "purpose": "全球科技投资与年度组合披露",
    "note": "区分投资组合价值、年度回报与企业收入。",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "ietf",
    "name": "IETF",
    "group": "研究与评测",
    "url": "https://www.ietf.org/",
    "mode": "公开索引",
    "purpose": "互联网协议与网络工程标准",
    "note": "草案、RFC、标准轨状态须分别核查。",
    "feedGroup": "技术与标准",
    "domains": [
      "aidc"
    ]
  },
  {
    "id": "palantir",
    "name": "Palantir",
    "group": "企业披露",
    "url": "https://www.palantir.com/",
    "mode": "公开索引",
    "purpose": "企业 AI 平台与智能体产品",
    "note": "产品案例是厂商陈述，需验证部署条件。",
    "feedGroup": "技术与标准",
    "domains": [
      "ml"
    ]
  },
  {
    "id": "gartner",
    "name": "Gartner 中国新闻室",
    "group": "行业研究",
    "url": "https://www.gartner.com/cn/newsroom",
    "mode": "公开索引",
    "purpose": "IT 支出、AI 采用与产业预测",
    "note": "预测与实际统计不同；部分原文需订阅。",
    "feedGroup": "产业研究机构",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "aero",
    "name": "航空产业网",
    "group": "行业研究",
    "url": "https://www.chinaerospace.com/",
    "mode": "公开索引",
    "purpose": "自主系统、工业机器人相邻供应链",
    "note": "仅纳入与机器人或 AI 相关内容；部分报告需登录。",
    "feedGroup": "机器人开放研究",
    "domains": [
      "robot"
    ]
  },
  {
    "id": "nvidia",
    "name": "NVIDIA Research",
    "group": "研究与评测",
    "url": "https://www.nvidia.com/en-us/research/",
    "mode": "公开索引",
    "purpose": "GPU、世界模型和物理 AI 研究",
    "note": "研究成果、产品化与工程复现分别判断。",
    "feedGroup": "技术与标准",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "idc",
    "name": "IDC 中国",
    "group": "行业研究",
    "url": "https://www.idc.com/cn/",
    "mode": "公开索引",
    "purpose": "服务器、云和机器人市场跟踪",
    "note": "交付量、收入、预测需按统计口径对齐。",
    "feedGroup": "产业研究机构",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "techinsights",
    "name": "TechInsights",
    "group": "行业研究",
    "url": "https://www.techinsights.com/",
    "mode": "公开索引",
    "purpose": "半导体拆解与产业链研究",
    "note": "公开洞察可索引，付费拆解数据未接入。",
    "feedGroup": "产业研究机构",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "kkr",
    "name": "KKR Insights",
    "group": "机构研报",
    "url": "https://www.kkr.com/insights",
    "mode": "公开索引",
    "purpose": "基础设施、AI 和资本周期",
    "note": "机构情景与配置观点需标明。",
    "feedGroup": "私募与产业资本",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "millennium",
    "name": "Millennium Management",
    "group": "机构研报",
    "url": "https://www.mlp.com/",
    "mode": "参考入口",
    "purpose": "机构背景与公开信息",
    "note": "官网不是公开策略或实时持仓数据接口。",
    "feedGroup": "",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "pimco",
    "name": "PIMCO",
    "group": "机构研报",
    "url": "https://www.pimco.com/",
    "mode": "公开索引",
    "purpose": "利率、信用和宏观情景",
    "note": "用于理解融资成本，不能替代企业技术证据。",
    "feedGroup": "全球资产配置",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "vanguard",
    "name": "Vanguard",
    "group": "机构研报",
    "url": "https://corporate.vanguard.com/",
    "mode": "公开索引",
    "purpose": "长期经济与资本市场展望",
    "note": "预测时域、币种和名义实际口径需保留。",
    "feedGroup": "全球资产配置",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "morgan",
    "name": "Morgan Stanley Ideas",
    "group": "机构研报",
    "url": "https://www.morganstanley.com/insights",
    "mode": "公开索引",
    "purpose": "AI、数据中心与产业投资研究",
    "note": "公开观点摘要与专业客户报告不同。",
    "feedGroup": "投行与咨询",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "goldman",
    "name": "Goldman Sachs Intelligence",
    "group": "机构研报",
    "url": "https://www.goldmansachs.com/insights",
    "mode": "公开索引",
    "purpose": "AI 资本开支、能源与宏观分析",
    "note": "区分研究预测、情景假设和已实现值。",
    "feedGroup": "投行与咨询",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "spglobal",
    "name": "S&P Global",
    "group": "行业研究",
    "url": "https://www.spglobal.com/en",
    "mode": "公开索引",
    "purpose": "能源、信用和产业情报",
    "note": "商业数据库未授权；使用公开研究索引。",
    "feedGroup": "投行与咨询",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ]
  },
  {
    "id": "deepmind",
    "name": "Google DeepMind Research",
    "url": "https://deepmind.google/research/",
    "purpose": "基础模型、世界模型、机器人与科学研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "前沿 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "meta",
    "name": "Meta AI Research",
    "url": "https://ai.meta.com/research/",
    "purpose": "开放模型、视觉表征与具身智能",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "前沿 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "aistudio",
    "name": "Google AI Studio",
    "url": "https://aistudio.google.com/welcome",
    "purpose": "Gemini 开发和模型试用",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "交互开发平台；部分功能需登录，不采集个人工作区。"
  },
  {
    "id": "highflyer",
    "name": "幻方 · 技术博客",
    "url": "https://www.high-flyer.cn/blog/",
    "purpose": "训练基础设施、并行优化和高效推理",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "中国 AI 研究",
    "domains": [
      "aidc",
      "ml"
    ],
    "note": "包含历史工程文章；按原始日期使用，不以刷新时间冒充新发布。"
  },
  {
    "id": "seed",
    "name": "字节跳动 Seed",
    "url": "https://seed.bytedance.com/zh/research",
    "purpose": "模型、智能体、多模态与机器人论文",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "中国 AI 研究",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "openai",
    "name": "OpenAI Research",
    "url": "https://openai.com/research/",
    "purpose": "模型能力、推理、多模态与安全研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "前沿 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "openaistatus",
    "name": "OpenAI Status",
    "url": "https://status.openai.com/",
    "purpose": "API 与产品服务可用性",
    "group": "服务状态",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "服务状态入口；故障事件不作为技术研究或产业增长证据。"
  },
  {
    "id": "worldlabs",
    "name": "World Labs",
    "url": "https://www.worldlabs.ai/",
    "purpose": "空间智能、三维世界与生成式环境",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "前沿 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "hai",
    "name": "Stanford HAI",
    "url": "https://hai.stanford.edu/",
    "purpose": "AI Index、评测与人本 AI 研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "评测与学术",
    "domains": [
      "aidc",
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "anthropic",
    "name": "Anthropic Research",
    "url": "https://www.anthropic.com/research",
    "purpose": "模型可解释性、智能体和安全研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "前沿 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "arc",
    "name": "ARC Prize Blog",
    "url": "https://arcprize.org/blog",
    "purpose": "泛化能力评测与基准研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "评测与学术",
    "domains": [
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "url": "https://ollama.com/",
    "purpose": "本地模型运行与模型生态",
    "group": "开发工具与文档",
    "mode": "公开索引",
    "feedGroup": "开放模型与工具",
    "domains": [
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "marble",
    "name": "Marble · World Labs",
    "url": "https://marble.worldlabs.ai/",
    "purpose": "空间世界生成工具",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "交互产品需浏览器运行；研究进展通过 World Labs 官方公开资料跟踪。"
  },
  {
    "id": "coze",
    "name": "扣子 Coze",
    "url": "https://www.coze.cn/",
    "purpose": "智能体开发与应用工作流",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "部分功能需登录；不读取账户或私有工作流。"
  },
  {
    "id": "huggingface",
    "name": "Hugging Face",
    "url": "https://huggingface.co/",
    "purpose": "模型卡、数据集、开源工具与机器人生态",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "开放模型与工具",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "wolfram",
    "name": "WolframAlpha",
    "url": "https://www.wolframalpha.com/",
    "purpose": "计算知识与数学复核",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "计算工具入口，不作为模型独立性能评测。"
  },
  {
    "id": "rwkv",
    "name": "RWKV Language Model",
    "url": "https://www.rwkv.com/",
    "purpose": "递归语言模型架构与高效推理",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "开放模型与工具",
    "domains": [
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "replicate",
    "name": "Replicate",
    "url": "https://replicate.com/",
    "purpose": "模型运行、服务接口和开放模型目录",
    "group": "开发工具与文档",
    "mode": "公开索引",
    "feedGroup": "开放模型与工具",
    "domains": [
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "url": "https://www.perplexity.ai/",
    "purpose": "检索增强问答与研究工具",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "检索工具入口；回答需回溯其引用原始来源。"
  },
  {
    "id": "baai",
    "name": "智源社区",
    "url": "https://hub.baai.ac.cn/frontpage/",
    "purpose": "中文 AI 论文、会议与开源研究",
    "group": "研究与评测",
    "mode": "公开索引",
    "feedGroup": "中国 AI 研究",
    "domains": [
      "robot",
      "ml"
    ],
    "note": "研究与产品进展以原文、实验条件和发布日期为准。"
  },
  {
    "id": "pytorch",
    "name": "PyTorch · 稳定版文档",
    "url": "https://docs.pytorch.org/docs/stable/",
    "purpose": "深度学习框架与训练推理接口",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "aidc",
      "ml"
    ],
    "note": "使用当前稳定版文档入口；复现实验时锁定安装版本。"
  },
  {
    "id": "tensorflow",
    "name": "TensorFlow · Windows 源码构建",
    "url": "https://www.tensorflow.org/install/source_windows",
    "purpose": "框架源码构建与系统依赖",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "区分 Windows 原生、WSL 和适用 TensorFlow 版本。"
  },
  {
    "id": "karpathy",
    "name": "Hacker’s Guide to Neural Networks",
    "url": "https://karpathy.github.io/neuralnets/",
    "purpose": "神经网络、反向传播与基础代码推导",
    "group": "开发工具与文档",
    "mode": "参考入口",
    "feedGroup": "",
    "domains": [
      "ml"
    ],
    "note": "经典教程，属于基础知识资料，不作为近期研究进展。"
  }
];
