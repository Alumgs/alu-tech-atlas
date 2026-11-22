import type {CalendarCategory,CalendarEvent} from './types';

type Focus = readonly [zh:string,en:string];

const fallback:Record<CalendarCategory,Focus>={
 macro:['对照前值与修订，留意主要分项是否同向变化。','Compare prior readings and revisions, then check whether the main components moved together.'],
 'central-bank':['留意对通胀、增长和下一次政策决定的表述。','Watch the wording on inflation, growth and the next policy decision.'],
 politics:['留意正式公告、后续决策时间表和执行条件。','Watch official announcements, the timetable for decisions and implementation conditions.'],
 earnings:['留意营收、利润率，以及管理层对下一期的指引。','Watch revenue, margins and management guidance for the next period.'],
 technology:['留意新产品规格、商用时间和已确认的合作项目。','Watch product specifications, availability and confirmed partnerships.'],
 policy:['核对适用范围、生效时间和配套执行细则。','Check who is covered, when the policy takes effect and how it will be implemented.'],
 market:['留意成交量、流动性和交易规则变化。','Watch trading volume, liquidity and any changes to market rules.'],
};

// Editorial reading prompts, independent of issuer summaries and calendar status.
const rules:readonly (readonly [pattern:RegExp,zh:string,en:string])[]=[
 [/主动.*ETF|actively managed ETFs/i,'看首日成交、折溢价及各产品的建仓进度。','Watch first-day turnover, premiums to NAV and how quickly funds build positions.'],
 [/芝加哥联储全国活动指数|\bCFNAI\b|Chicago Fed National Activity Index/i,'看指数相对零线的位置，以及生产和就业的贡献。','Watch the index relative to zero, and the contributions from production and employment.'],
 [/东盟周|ASEAN Week/i,'看陆海新通道、跨境物流和产业合作是否有具体安排。','Watch for concrete plans on trade corridors, cross-border logistics and industry cooperation.'],
 [/Consumer Confidence|消费者信心/i,'对照现况与预期指数，留意就业和收入预期变化。','Compare present conditions with expectations, especially views on jobs and income.'],
 [/小米|Xiaomi/i,'看汽车业务毛利率及高端手机销售占比。','Watch EV margins and the share of premium smartphone sales.'],
 [/哔哩哔哩|Bilibili/i,'看广告与增值服务的收入占比，以及整体毛利率。','Watch the revenue mix of advertising and value-added services, and the overall gross margin.'],
 [/理想汽车|Li Auto/i,'看各车型交付占比、单车收入与汽车毛利率。','Watch deliveries by model, revenue per vehicle and vehicle gross margin.'],
 [/美团|Meituan/i,'看外卖单均利润与即时零售投入的变化。','Watch delivery profit per order and spending on on-demand retail.'],
 [/Dell Technologies|戴尔|HPE earnings|慧与科技/i,'看 AI 服务器订单、交付节奏和基础设施利润率。','Watch AI server orders, delivery pace and infrastructure margins.'],
 [/Analog Devices|亚德诺/i,'看工业与汽车芯片需求，以及库存去化进度。','Watch industrial and automotive chip demand and the pace of inventory reduction.'],
 [/Zoom/i,'看企业客户留存、收入增长与 AI 功能商业化。','Watch enterprise retention, revenue growth and monetization of AI features.'],
 [/Personal Income and Outlays|\bPCE\b/i,'看核心 PCE 环比与服务价格，结合实际消费判断需求。','Watch monthly core PCE and services prices alongside real consumer spending.'],
 [/\bGDP\b|国内生产总值/i,'看消费、设备投资与库存对增长的贡献。','Watch how consumption, equipment investment and inventories contribute to growth.'],
 [/初请失业金|initial.*jobless claims|initial.*unemployment claims|weekly claims/i,'结合初请人数四周均值与续请人数，判断就业是否转弱。','Compare the four-week average of initial claims with continuing claims for signs of labor-market weakness.'],
 [/原油库存|Weekly Petroleum Status|Crude Oil Inventories/i,'对照原油、汽油库存与炼厂开工率，判断供需松紧。','Compare crude and gasoline inventories with refinery utilization for signs of tighter supply.'],
 [/褐皮书|Beige Book/i,'看各联储辖区如何描述工资、招聘和企业定价。','Watch how Fed districts describe wages, hiring and business pricing.'],
 [/高交会|China Hi-Tech Fair/i,'看新技术是否公布量产计划、落地项目或签约合作。','Watch for production plans, deployment projects and signed partnerships.'],
 [/提前收盘|early close/i,'核对各产品收盘时间，留意缩短交易时段的流动性。','Check closing times by product and liquidity during the shortened session.'],
 [/休市|Thanksgiving Day/i,'核对现货与衍生品交易时段，留意假日期间的流动性。','Check cash and derivatives trading hours and watch holiday liquidity.'],
 [/货币供应|\bM3\b|Monetary developments in the euro area/i,'看 M3 增速及企业、居民贷款增速是否同向变化。','Watch whether M3 growth and lending to firms and households move together.'],
 [/工业经济效益|工业企业利润/i,'看利润变化是否集中在少数行业，尤其是装备制造和原材料。','Watch whether profit changes are concentrated in a few sectors, especially equipment and raw materials.'],
 [/生产资料市场价格/i,'对照黑色金属、化工和能源品种的价格变化。','Compare price changes across ferrous metals, chemicals and energy products.'],
 [/成品油|fuel price review/i,'等正式通知，核对汽柴油零售限价及生效时间。','Watch for the official notice, retail fuel price caps and their effective time.'],
 [/广州国际车展|Auto Guangzhou/i,'看新车售价、辅助驾驶配置与预计交付时间。','Watch new model prices, driver-assistance features and delivery schedules.'],
 [/东京都区部|Tokyo CPI/i,'看剔除生鲜食品后的通胀及服务价格，观察日本央行面临的物价压力。','Watch inflation excluding fresh food and services prices for signals relevant to the Bank of Japan.'],
 [/OPEC\+/i,'看产量基线、成员配额和后续调整时间表。','Watch production baselines, member quotas and the timetable for adjustments.'],
 [/西班牙议会大选|Spain.*general election/i,'看议席分布及组阁所需的联盟，留意财政政策走向。','Watch seat distribution, coalition options and the direction of fiscal policy.'],
 [/\bPMI\b|采购经理指数/i,'对照制造业与服务业的新订单和就业分项。','Compare new orders and employment across manufacturing and services.'],
 [/\bCPI\b|居民消费价格|Consumer Price/i,'比较核心通胀与整体通胀，找出变动最大的分项。','Compare core and headline inflation and identify the largest component moves.'],
 [/\bPPI\b|工业生产者价格|Producer Price/i,'看上游价格是否传导至下游出厂价。','Watch whether upstream cost changes feed into downstream producer prices.'],
 [/耐用品|Durable Goods/i,'看剔除运输后的订单与核心资本品订单，判断企业投资需求。','Watch orders excluding transport and core capital goods orders for signals on business investment.'],
 [/新屋销售|Residential Sales/i,'看销量、可售库存与房价是否同向变化。','Watch whether sales, inventory and prices move together.'],
 [/进出口|International Trade|Import and Export/i,'分辨价格与数量对进出口变化的贡献。','Separate price and volume effects on import and export changes.'],
 [/氢氧化锂|lithium hydroxide/i,'看首日成交、持仓以及期现价格差异。','Watch first-day volume, open interest and the gap between futures and spot prices.'],
 [/\b6G\b/i,'看标准进度、试验频段和可落地的产业合作。','Watch standards milestones, trial spectrum and concrete industry partnerships.'],
 [/利率决议|FOMC|monetary policy/i,'看利率决定、投票分歧和对下一步政策的措辞。','Watch the decision, any split vote and guidance on the next move.'],
 [/选举|election/i,'看席位变化、官方计票进度和组阁时间表。','Watch seat changes, official counting progress and the timetable for forming a government.'],
];

export function calendarFocus(event:CalendarEvent):Focus {
 if(event.status==='cancelled')return ['留意主办方是否发布替代安排。','Watch for a replacement schedule from the organizer.'];
 const match=rules.find(([pattern])=>pattern.test(event.title));
 return match?[match[1],match[2]]:fallback[event.category];
}
