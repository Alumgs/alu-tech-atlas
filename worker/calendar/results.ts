import type {CalendarEvent} from '../../lib/calendar/types';
import {validDay} from '../../lib/calendar/time.ts';
import {clean,englishDate} from '../../lib/calendar/parsers.ts';
/** Evidence must identify the actual release date, not the time we downloaded a page. */
export function resultEvidence(raw:string,event:CalendarEvent){
 const meta=[...raw.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
 let published=meta.find(s=>/(?:name|property|itemprop)=["'][^"']*(?:date|published)[^"']*["']/i.test(s)&&/content=["']20\d{2}-\d{2}-\d{2}/.test(s))?.match(/content=["'](20\d{2}-\d{2}-\d{2})/)?.[1];
 if(!published){const embargo=clean(raw.match(/(?:Transmission of material|embargoed|For release)[\s\S]{0,900}/i)?.[0]||'');published=englishDate(embargo);}
 const sourceDay=event.originalDate.slice(0,10);if(!published||published!==sourceDay)return null;
 const content=raw.match(/<div[^>]*class=["'][^"']*(?:TRS_Editor|TRS_UEDITOR|highlight-box|news-release|release-body)[^"']*["'][^>]*>([\s\S]*?)(?:<table|<footer|<script)/i)?.[1]||raw.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)?.[1]||'';
 const text=clean(content);if(text.length<40)return null;
 return {text:text.slice(0,600),date:published};
}
export function nbsResultLink(raw:string,event:CalendarEvent){
 const keys:Record<string,RegExp>={'国民经济':/国民经济运行/,'采购经理':/采购经理指数/,'居民消费':/居民消费价格/,'工业生产者':/工业生产者出厂价格/,'工业经济效益':/工业企业利润/,'商品住宅':/商品住宅销售价格/};
 const pattern=Object.entries(keys).find(([key])=>event.title.includes(key))?.[1];if(!pattern)return null;
 for(const m of raw.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  if(!pattern.test(clean(m[2])))continue;
  const day=m[1].match(/t(20\d{2})(\d{2})(\d{2})_/)?.slice(1).join('-');
  if(day!==event.originalDate.slice(0,10))continue;
  const url=new URL(m[1],'https://www.stats.gov.cn/sj/zxfb/');if(url.origin==='https://www.stats.gov.cn')return url.href;
 }
 return null;
}

/** Do not send archived events to a latest-release URL that rewrites each month. */
export function blsResultLink(event:CalendarEvent){
 const patterns:[RegExp,string][]=[
  [/Consumer Price Index/i,'cpi'],[/Employment Situation/i,'empsit'],[/Producer Price Index/i,'ppi'],
  [/Job Openings/i,'jolts'],[/Import and Export Price Indexes/i,'ximpim'],[/Real Earnings/i,'realer'],
 ];
 const slug=patterns.find(([pattern])=>pattern.test(event.title))?.[1];
 const day=event.originalDate.slice(0,10);
 if(event.sourceId!=='bls'||!slug||!validDay(day))return null;
 const [year,month,date]=day.split('-');
 return 'https://www.bls.gov/news.release/archives/'+slug+'_'+month+date+year+'.htm';
}
