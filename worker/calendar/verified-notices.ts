import {calendarEvent} from '../../lib/calendar/parsers.ts';
import type {CalendarCategory,CalendarSource} from '../../lib/calendar/types';

type Notice = {
 key:string;
 title:string;
 publisher:string;
 url:string;
 category:CalendarCategory;
 region:string;
 country:string;
 zone?:string;
 date:string;
 time?:string;
 end?:string;
 summary:string;
 provisional?:boolean;
};

const china={region:'中国',country:'中国',zone:'Asia/Shanghai'};
const us={region:'美洲',country:'美国',zone:'America/New_York'};
const pmiUrl='https://www.pmi.spglobal.com/Public/Home/PDF/UK_Rel_Dates';
const nbsUrl='https://www.stats.gov.cn/xw/tjxw/tzgg/202512/t20251224_1962137.html';
const flashPmi=[
 ['au','澳大利亚','亚太','Australia','Australia/Sydney','2026-11-23','09:00'],
 ['in','印度','亚太','India','Asia/Kolkata','2026-11-23','10:30'],
 ['fr','法国','欧洲','France','Europe/Paris','2026-11-23','09:15'],
 ['de','德国','欧洲','Germany','Europe/Berlin','2026-11-23','09:30'],
 ['eu','欧元区','欧洲','Eurozone','Europe/Berlin','2026-11-23','10:00'],
 ['uk','英国','欧洲','UK','Europe/London','2026-11-23','09:30'],
 ['us','美国','美洲','US','America/New_York','2026-11-23','09:45'],
 ['jp','日本','亚太','Japan','Asia/Tokyo','2026-11-24','09:30'],
] as const;
const notices:Notice[]=[
 ...flashPmi.map(([code,country,region,english,zone,date,time]):Notice=>({
  key:'pmi-flash-2026-11-'+code,title:country+' 11 月 PMI 初值 / '+english+' Flash PMI',
  publisher:'S&P Global Market Intelligence',url:pmiUrl,category:'macro',
  country,region,zone,date,time,provisional:true,
  summary:'包含制造业、服务业及综合 PMI 初值。标普全球注明发布时间可能调整。',
 })),
 {
  ...china,key:'active-etf-first-listing',title:'沪深首批主动 ETF 开始挂牌 / First actively managed ETFs list',
  publisher:'基金管理人上市公告书',url:'https://fund.eastmoney.com/gonggao/581010%2CAN202611171831792865.html',
  date:'2026-11-23',category:'market',
  summary:'首批主动管理 ETF 开始挂牌。汇添富与华宝等管理人公告确认上市日，链接为汇添富基金上市公告书。',
 },
 {
  ...us,key:'cfnai-2026-10',title:'美国 10 月芝加哥联储全国活动指数 / Chicago Fed National Activity Index',
  publisher:'芝加哥联储',url:'https://www.chicagofed.org/research/data/data-release-calendar',
  date:'2026-11-23',time:'08:30',category:'macro',
  summary:'芝加哥联储日程列出的 10 月读数，用于衡量美国经济活动相对历史趋势的位置。',
 },
 {
  ...china,key:'china-asean-week-2026',title:'2026 中国—东盟周在重庆开幕 / China–ASEAN Week opens in Chongqing',
  publisher:'重庆市政府新闻发布会',url:'https://www.cqnews.net/app/content_1571911169945731072.html',
  date:'2026-11-23',category:'politics',
  summary:'重庆市政府新闻发布会确认开幕日期。活动涵盖经贸、互联互通及科技合作。',
 },
 {
  ...us,key:'conference-board-confidence-2026-11',title:'美国 11 月谘商会消费者信心指数 / US Consumer Confidence Index',
  publisher:'美国谘商会',url:'https://www.conference-board.org/topics/consumer-confidence/',
  date:'2026-11-24',time:'10:00',category:'macro',
  summary:'谘商会在前一期发布中列明本次调查结果的发布日期和时间。',
 },
 {
  ...us,key:'dol-claims-2026-11-25',title:'美国上周初请失业金人数 / US initial jobless claims',
  publisher:'美国劳工部就业与培训署',url:'https://oui.doleta.gov/unemploy/archive.asp',
  date:'2026-11-25',time:'08:30',category:'macro',
  summary:'美国劳工部排期列明感恩节当周提前至周三发布，采用美东时间。',
 },
 {
  ...us,key:'eia-petroleum-2026-11-25',title:'美国 EIA 原油库存周报 / EIA Weekly Petroleum Status Report',
  publisher:'美国能源信息署 EIA',url:'https://www.eia.gov/petroleum/supply/weekly/schedule.php',
  date:'2026-11-25',time:'10:30',category:'macro',
  summary:'依据 EIA 官方周报排期。本周不在延迟发布例外表内，采用周三美东 10:30 常规时刻。',
 },
 {
  key:'ecb-m3-2026-10',title:'欧元区 10 月 M3 与信贷数据 / Euro area M3 and credit',
  publisher:'欧洲央行',url:'https://www.ecb.europa.eu/press/calendars/weekly/html/index.en.html',
  date:'2026-11-26',time:'10:00',category:'macro',region:'欧洲',country:'欧元区',zone:'Europe/Berlin',
  summary:'欧洲央行当周日历列出欧元区货币与银行信贷数据公布时点。',
 },
 {
  ...china,key:'china-fuel-window-2026-11-26',title:'国内成品油调价窗口（暂定） / China retail fuel price review',
  publisher:'国家发展改革委',url:'https://www.ndrc.gov.cn/xwdt/xwfb/202611/t20261112_1408795.html',
  date:'2026-11-27',time:'00:00',category:'policy',provisional:true,
  summary:'按上次 11 月 12 日的调价公告及十个工作日机制推算。11 月 26 日 24:00 为可能的生效时点，调价与否及幅度以正式通知为准。',
 },
 {
  key:'tokyo-cpi-2026-11',title:'日本 11 月东京都区部 CPI 初值 / Tokyo CPI',
  publisher:'日本总务省统计局',url:'https://www.stat.go.jp/english/data/cpi/1582.html',
  date:'2026-11-27',time:'08:30',category:'macro',region:'亚太',country:'日本',zone:'Asia/Tokyo',
  summary:'采用统计局公布的东京区部当月初值日程及当地 08:30 的公布口径。',
 },
 {
  ...china,key:'nbs-2026-11-midmonth-producer-market',title:'中国 11 月中旬生产资料市场价格 / China producer goods market prices',
  publisher:'国家统计局',url:nbsUrl,date:'2026-11-24',time:'09:30',category:'macro',provisional:true,
  summary:'年度发布日程附注列出的流通领域重要生产资料市场价格旬报，关注黑色金属、化工等品种。',
 },
 {
  ...china,key:'china-6g-2026',title:'上海 6G 发展大会 / 6G Development Conference',
  publisher:'上海市科技委员会政务发布',url:'https://www.thepaper.cn/newsDetail_forward_34421575',
  date:'2026-11-24',end:'2026-11-25',category:'technology',
  summary:'上海松江举办，议程涵盖 6G 统一标准、通感融合与产业生态。',
 },
 {
  ...china,key:'xiaomi-2026-q3',title:'小米三季度业绩董事会 / Xiaomi Q3 results board meeting',
  publisher:'小米集团 · 港交所披露',url:'https://www.hkexnews.hk/listedco/listconews/sehk/2026/1023/2026102301169.pdf',
  date:'2026-11-24',category:'earnings',
  summary:'董事会审议未经审计的第三季度业绩，公告未给出具体披露时刻。',
 },
 {
  ...china,key:'bilibili-2026-q3',title:'哔哩哔哩三季度业绩 / Bilibili Q3 results',
  publisher:'哔哩哔哩 · 港交所披露',url:'https://www.hkexnews.hk/listedco/listconews/sehk/2026/1103/2026110301722.pdf',
  date:'2026-11-24',time:'18:00',category:'earnings',
  summary:'公司预计约 18:00 公布三季度业绩，20:00 举行财报电话会。',
 },
 {
  ...us,key:'hpe-fy2026-q4',title:'慧与科技 FY2026 Q4 财报电话会 / HPE earnings call',
  publisher:'HPE 投资者关系',url:'https://investors.hpe.com/#11-23-2026',
  date:'2026-11-23',category:'earnings',
  summary:'原站采用美国当地 11 月 23 日，查看官方活动页获取电话会详情。',
 },
 {
  ...us,key:'zoom-fy2027-q3-call',title:'Zoom FY2027 Q3 财报说明会 / Zoom earnings webinar',
  publisher:'Zoom 投资者关系',url:'https://investors.zoom.us/events/event-details/zoom-third-quarter-fiscal-year-2027-earnings-webinar',
  date:'2026-11-23',time:'17:00',category:'earnings',
  summary:'财报在美股收盘后发布，所示时刻为官方说明会安排。',
 },
 {
  ...us,key:'nyfed-williams-bronx-2026',title:'纽约联储主席威廉姆斯谈经济与货币政策 / John Williams speaks',
  publisher:'纽约联储',url:'https://www.newyorkfed.org/newsevents/mediaadvisory/2026/1113-2026',
  date:'2026-11-23',time:'16:00',category:'central-bank',
  summary:'在纽约圣文森特山大学发表公开讲话并回答提问。时间采用纽约联储公告。',
 },
 {
  ...china,key:'gfex-li-futures-launch',title:'广期所氢氧化锂期货上市 / GFEX lithium hydroxide futures launch',
  publisher:'广州期货交易所',url:'https://www.gfex.com.cn/gfex/tzts/202611/95c7d06853534fb1b136fc1111621d1d.shtml',
  date:'2026-11-26',category:'market',
  summary:'广期所公告〔2026〕71 号，确认氢氧化锂期货首日交易日期。',
 },
 {
  ...china,key:'gfex-li-options-launch',title:'广期所氢氧化锂期权上市 / GFEX lithium hydroxide options launch',
  publisher:'广州期货交易所',url:'https://www.gfex.com.cn/gfex/tzts/202611/bf5a7d5031724e7ebc726826ee0c6502.shtml',
  date:'2026-11-27',category:'market',
  summary:'广期所公告〔2026〕72 号，确认氢氧化锂期权首日交易日期。',
 },
 {
  key:'bok-2026-11-decision',title:'韩国央行利率决议 / Bank of Korea policy decision',
  publisher:'韩国央行',url:'https://www.bok.or.kr/eng/bbs/E0000627/view.do?menuNo=400022&nttId=10094301',
  date:'2026-11-26',category:'central-bank',region:'亚太',country:'韩国',zone:'Asia/Seoul',
  summary:'韩国央行年度货币政策委员会排期确认当日召开议息会议，具体公布时刻以央行公告为准。',
 },
 {
  ...china,key:'chtf-2026',title:'深圳高交会 / China Hi-Tech Fair',
  publisher:'高交会组委会',url:'https://www.chtf.com/canzhanzhiyin/schedule/',
  date:'2026-11-26',end:'2026-11-28',category:'technology',
  summary:'深圳国际会展中心（宝安）举办，关注人工智能、半导体与机器人产业。',
 },
 {
  ...china,key:'guangzhou-auto-2026',title:'广州国际车展开幕 / Auto Guangzhou opens',
  publisher:'广州国际车展组委会',url:'https://www.autoguangzhou.org.cn/auto/zhanhuijieshao/',
  date:'2026-11-27',end:'2026-12-06',category:'technology',
  summary:'展期为 11 月 27 日至 12 月 6 日，关注智能汽车与新能源汽车产业。',
 },
 {
  ...china,key:'meituan-2026-q3',title:'美团三季度业绩董事会 / Meituan Q3 results board meeting',
  publisher:'美团 · 港交所披露',url:'https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1117/2026111700394.pdf',
  date:'2026-11-27',category:'earnings',
  summary:'董事会审议未经审计的第三季度业绩，公告未给出具体披露时刻。',
 },
 {
  key:'spain-general-election-2026',title:'西班牙议会大选 / Spain general election',
  publisher:'西班牙国家公报 BOE',url:'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742',
  date:'2026-11-29',category:'politics',region:'欧洲',country:'西班牙',zone:'Europe/Madrid',
  summary:'皇家法令 806/2026 确定众议院与参议院选举投票日。',
 },
 {
  key:'opec-42nd-ministerial',title:'OPEC+ 第 42 次部长级会议 / 42nd OPEC+ ministerial meeting',
  publisher:'OPEC 秘书处',url:'https://www.opec.org/pr-detail/605-7-june-2026.html',
  date:'2026-11-29',category:'market',region:'全球',country:'多国',
  summary:'OPEC 官方公报公布部长级会议日期，具体时刻未公布。',
 },
];

export const NOTICE_SOURCE='verified-notices';
export const noticeVerificationDay='2026-11-22';
export function verifiedNoticeEvents(){
 return notices.map(notice=>{
  const source:CalendarSource={
   id:NOTICE_SOURCE,name:notice.publisher,url:notice.url,parser:'ics',
   category:notice.category,region:notice.region,country:notice.country,
   timezone:notice.zone||'当地时间',level:'official',note:notice.summary,
  };
  const event=calendarEvent(source,notice.key,notice.title,notice.date,notice.time);
  return {
   ...event,importance:'major' as const,endDay:notice.end,verifiedOn:noticeVerificationDay,
   ...(notice.provisional?{status:'tentative' as const,certainty:'tentative' as const}:{}),
  };
 });
}
