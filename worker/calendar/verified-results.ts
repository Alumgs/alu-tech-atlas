import type {CalendarEvent} from '../../lib/calendar/types';

type Evidence={resultUrl:string;result:string;resultCheckedAt:string};
type Publication=[source:string,day:string|RegExp,key:string|RegExp,url:string,summary:string];

// Edition-specific reports, filings and statements verified against the original release.
const publications:Publication[]=[
 ['nbs','2026-11-09',/居民消费价格/,'https://www.stats.gov.cn/sj/zxfb/202611/t20261109_1965795.html','10 月 CPI 同比上涨 0.7%，环比持平。'],
 ['nbs','2026-11-09',/工业生产者(?:出厂)?价格/,'https://www.stats.gov.cn/sj/zxfb/202611/t20261109_1965794.html','10 月 PPI 同比上涨 5.7%，环比上涨 0.7%。'],
 ['nbs','2026-11-16',/国民经济运行/,'https://www.stats.gov.cn/sj/xwfbh/fbhwd/202611/t20261116_1965844.html','国家统计局已发布 10 月经济运行情况，包含工业、消费和就业等数据。'],
 ['bls','2026-11-17',/Import and Export Price Indexes/i,'https://www.bls.gov/news.release/archives/ximpim_11172026.htm','美国劳工统计局已发布 10 月进出口价格指数。'],
 ['nvidia','2026-11-17',/(?:third|3rd) quarter|\bQ3\b/i,'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Third-Quarter-Fiscal-2027/','英伟达 FY2027 第三季度营收为 1,158 亿美元，数据中心营收为 1,076 亿美元。'],
 ['tencent','2026-11-18',/third quarter|\bQ3\b|三季度|第三季/i,'https://www.tencent.com/wp-content/uploads/2026/11/Tencent-Announces-2026-Third-Quarter-Results.pdf','腾讯已发布 2026 年第三季度未经审计业绩。'],
 ['alibaba','2026-11-19','earnings:september:2026','https://data.alibabagroup.com/ecms-files/1532295521/e676aff4-e76d-489b-960a-47b9cf36485d/Alibaba%20Group%20Announces%20September%20Quarter%202026%20Results%20and%20Interim%20Results%20for%20the%20Six%20Months%20Ended%20September%2030%2C%202026.pdf','阿里巴巴已发布截至 2026 年 9 月的季度及半年度业绩。'],
 ['netease','2026-11-19','earnings:third-quarter:2026','https://ir.netease.com/news-releases/news-release-details/netease-announces-third-quarter-2026-unaudited-financial-results','网易已发布 2026 年第三季度未经审计业绩。'],
 ['apec',/^2026-11-(?:18|19)$/,/Economic Leaders(?:['’]|&rsquo;)? Meeting/i,'https://www.apec.org/meeting-papers/leaders-declarations/2026/2026-apec-leaders-declaration','深圳会议发布《2026 年 APEC 领导人宣言》，涉及贸易投资、互联互通、创新与经济增长。'],
 ['lpr','2026-11-20','lpr:2026-11','https://www.chinamoney.com.cn/chinese/rdgz/20261120/3453464.html','1 年期 LPR 为 3.0%，5 年期以上 LPR 为 3.5%。'],
 ['cfnai','2026-11-23','cfnai-2026-10','https://www.haver.com/articles/chicago-fed-national-activity-index-negative-in-october','据 Haver Analytics 引述芝加哥联储发布的数据，10 月全国活动指数为 −0.06。'],
 ['verified-notices','2026-11-23','active-etf-first-listing','https://www.sse.com.cn/aboutus/mediacenter/hotandd/c/c_20261123_10838703.shtml','沪深首批 18 只主动 ETF 上市，两家交易所各上市 9 只。链接为上交所上市公告。'],
 ['verified-notices','2026-11-23','china-asean-week-2026','https://www.cqrd.gov.cn/web/article/1574736459202506752/web/content_1574736459202506752.html','中国—东盟周于 11 月 23 日在重庆开幕。'],
 ['verified-notices','2026-11-23','pmi-flash-2026-11-us','https://www.spglobal.com/content/dam/spglobal/mi/en/documents/news-insights/research/2026/11/6328150_6328134_0.1.pdf','美国 11 月综合 PMI 初值为 54.6，低于 10 月的 55.9。'],
 ['verified-notices','2026-11-23','pmi-flash-2026-11-eu','https://www.spglobal.com/content/dam/spglobal/mi/en/documents/news-insights/research/2026/11/6327993_6327969_0.1.pdf','欧元区 11 月综合 PMI 初值为 51.7，与 10 月持平。'],
 ['verified-notices','2026-11-23','hpe-fy2026-q4','https://www.hpe.com/us/en/newsroom/press-release/2026/11/hpe-reports-fiscal-2026-fourth-quarter-results.html','HPE 已发布截至 2026 年 10 月的第四季度业绩。'],
 ['verified-notices','2026-11-23','zoom-fy2027-q3-call','https://investors.zoom.us/static-files/209e2f44-95c7-4c49-a2ae-a36d63ddb1ff','Zoom 已披露 FY2027 第三季度业绩，财报见 8-K 附件 99.1。'],
 ['verified-notices','2026-11-24','nbs-2026-11-midmonth-producer-market','https://www.stats.gov.cn/sj/zxfbhjd/202611/t20261123_1965935.html','与 11 月上旬相比，50 种监测产品中 11 种上涨、38 种下降、1 种持平。'],
];

export function verifiedResult(event:CalendarEvent):Evidence|undefined{
 if(event.status==='cancelled')return;
 const sourceDay=event.originalDate.slice(0,10);
 const match=publications.find(([source,day,key])=>source===event.sourceId
  &&(typeof day==='string'?day===sourceDay:day.test(sourceDay))
  &&(typeof key==='string'?key===event.key:key.test(event.title)));
 if(match)return {resultUrl:match[3],result:match[4],resultCheckedAt:'2026-11-24'};
}
