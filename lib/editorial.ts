import type {News} from './content';
import {canonicalUrl, publicUrl} from './url-safety.ts';

export type SourceTier = 'primary' | 'media' | 'aggregate' | 'other';
export const tierLabels: Record<SourceTier, string> = {primary:'一手资料',media:'专业媒体',aggregate:'聚合索引',other:'其他来源'};
// A publisher label alone must not promote an unknown website to an official source.
const primaryRoots=['nvidia.com','arxiv.org','iea.org','abb.com','serverobotics.com','huawei.com','openai.com','anthropic.com','deepmind.google','research.google','ai.meta.com','huggingface.co','baai.ac.cn','gov.cn','bytedance.com','unitree.com','ubtrobot.com','qwen.ai','un.org','federalreserve.gov','imf.org','worldbank.org'];
const mediaRoots=['techcrunch.com','datacenterdynamics.com','therobotreport.com','venturebeat.com','infoq.cn','qbitai.com','ieee.org','acm.org','nature.com','science.org','bbc.co.uk','bbc.com','chinanews.com.cn','10jqka.com.cn','theverge.com'];
const matches=(host:string,root:string)=>host===root||host.endsWith('.'+root);
export function sourceTier(n:News):SourceTier{
 const host=publicUrl(n.url)?.hostname||'';
 if(matches(host,'news.google.com')||/新闻聚合|聚合索引/.test(n.sourceKind||''))return 'aggregate';
 if(primaryRoots.some(root=>matches(host,root)))return 'primary';
 if(mediaRoots.some(root=>matches(host,root)))return 'media';
 return 'other';
}
export function scoreNews(n:News,now=Date.now()):number{
 const time=Date.parse(n.date),age=(now-time)/86400000;
 if(!canonicalUrl(n.url)||!Number.isFinite(time)||time>now+300000)return 0;
 const recency=Math.round(28*Math.exp(-Math.max(0,age)/24));
 const types:Record<string,number>={'研究论文':24,'技术研究':23,'企业财报':22,'产品发布':20,'市场洞察':15,'政策法规':21,'行业活动':8,'国际时事':20,'科技与科学':20,'社会与公共政策':20};
 const source={primary:25,media:17,aggregate:7,other:10}[sourceTier(n)];
 const length=(n.summary||'').trim().length;
 const completeness=length>=120?11:length>=60?8:length>=25?4:0;
 return Math.max(0,Math.min(100,(types[n.type]??12)+recency+source+completeness+(/\d/.test(n.title)?3:0)-(n.stale?12:0)-(n.historical?10:0)));
}
export function scoreReasons(n:News,now=Date.now()):string[]{
 const reasons:string[]=[],age=(now-Date.parse(n.date))/86400000;
 if(Number.isFinite(age)&&age>=0&&age<=7)reasons.push('近 7 天发布');
 if(sourceTier(n)==='primary')reasons.push('一手资料优先');
 if(['研究论文','技术研究','企业财报','产品发布','政策法规'].includes(n.type))reasons.push('技术与产业研究线索');
 if((n.summary||'').trim().length>=60)reasons.push('有来源摘要');
 if(n.stale||n.historical)reasons.push('历史/缓存资料');
 return reasons.slice(0,3);
}
function normalizeTitle(n:News):string{
 let title=n.title.toLowerCase();const source=n.source.toLowerCase().trim();
 if(source&&title.endsWith(' - '+source))title=title.slice(0,-source.length-3);
 title=title.replace(/\s+(?:-|–|—|\|)\s*(?:bbc(?: news)?|the verge|reuters|路透社|中新网|中国新闻网|同花顺)\s*$/i,'');
 return title.replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/[^\p{L}\p{N}]/gu,'');
}
function grams(value:string){const chars=Array.from(value),out=new Set<string>();for(let i=0;i<chars.length-1;i++)out.add(chars[i]+chars[i+1]);return out;}
type MatchFeatures={title:string;numbers:string;time:number;url:string;score:number;grams?:Set<string>};
function sameEvent(a:News,b:News,read:(n:News)=>MatchFeatures):boolean{
 if((a.scope!=='world'&&a.domain!==b.domain)||a.scope!==b.scope)return false;
 const x=read(a),y=read(b);if(Math.abs(x.time-y.time)>14*86400000||!x.title||!y.title)return false;
 if(x.title===y.title)return true;
 if(x.numbers!==y.numbers||Math.min(x.title.length,y.title.length)<14)return false;
 x.grams||=grams(x.title);y.grams||=grams(y.title);let common=0;for(const part of x.grams)if(y.grams.has(part))common++;
 return common/Math.max(1,x.grams.size+y.grams.size-common)>=.82;
}
export type NewsEvent={id:string;primary:News;reports:News[];sourceCount:number;heat:number;score:number;latestDate:string};
function publisher(n:News):string{
 const host=publicUrl(n.url)?.hostname||'';
 if(sourceTier(n)!=='aggregate')return [...primaryRoots,...mediaRoots].find(root=>matches(host,root))||host.replace(/^www\./,'');
 const label=n.source.toLowerCase().replace(/[\s\p{P}]+/gu,'');
 const aliases:Array<[RegExp,string]>=[[/nvidia|英伟达/,'nvidia.com'],[/datacenterdynamics|dcd|datacentredynamics/,'datacenterdynamics.com'],[/techcrunch/,'techcrunch.com'],[/therobotreport/,'therobotreport.com'],[/venturebeat/,'venturebeat.com'],[/量子位|qbitai/,'qbitai.com'],[/infoq/,'infoq.cn'],[/arxiv/,'arxiv.org'],[/huggingface/,'huggingface.co'],[/openai/,'openai.com'],[/anthropic/,'anthropic.com'],[/华为|huawei/,'huawei.com']];
 return aliases.find(([pattern])=>pattern.test(label))?.[1]||label;
}
function representative(a:News,b:News):News{
 if(Boolean(a.stale)!==Boolean(b.stale))return a.stale?b:a;
 const material=(n:News)=>(n.summary||'').trim().length>=25;
 if(material(a)!==material(b))return material(a)?a:b;
 const tier={primary:0,media:1,other:2,aggregate:3};
 return tier[sourceTier(a)]<=tier[sourceTier(b)]?a:b;
}
/** Conservative, bounded grouping. Ambiguous reports stay separate. */
export function clusterStories(items:News[],now=Date.now()):NewsEvent[]{
 const features=new Map<News,MatchFeatures>();
 const read=(n:News)=>{let value=features.get(n);if(!value){value={title:normalizeTitle(n),numbers:[...n.title.matchAll(/\d+(?:\.\d+)?/g)].map(m=>m[0]).sort().join('|'),time:Date.parse(n.date),url:canonicalUrl(n.url),score:scoreNews(n,now)};features.set(n,value);}return value;};
 const sorted=items.filter(n=>{const value=read(n);return value.url&&Number.isFinite(value.time)&&value.time<=now+300000;})
 .sort((a,b)=>Number(Boolean(a.stale))-Number(Boolean(b.stale))||read(b).score-read(a).score||read(b).time-read(a).time);
 const events:NewsEvent[]=[],urls=new Map<string,NewsEvent>(),titles=new Map<string,NewsEvent>(),recent=new Map<string,NewsEvent[]>();
 for(const item of sorted.slice(0,5000)){
  const canonical=(item.scope||item.domain)+'|'+read(item).url,titleKey=(item.scope||item.domain)+'|'+read(item).title,byTitle=titles.get(titleKey);
  const event=urls.get(canonical)||(byTitle&&sameEvent(byTitle.primary,item,read)?byTitle:undefined)||(recent.get(item.scope==='world'?'world':item.domain)||[]).find(e=>sameEvent(e.primary,item,read));
  if(event){
   event.primary=representative(event.primary,item);event.score=read(event.primary).score;
   if(!urls.has(canonical))event.reports.push(item);
   urls.set(canonical,event);
  }else{
   const next:NewsEvent={id:canonical,primary:item,reports:[item],sourceCount:1,heat:0,score:read(item).score,latestDate:item.date};
   events.push(next);urls.set(canonical,next);titles.set(titleKey,next);
   const recentKey=item.scope==='world'?'world':item.domain,pool=recent.get(recentKey)||[];pool.push(next);if(pool.length>120)pool.shift();recent.set(recentKey,pool);
  }
 }
 for(const event of events){
  event.reports.sort((a,b)=>read(b).time-read(a).time);event.latestDate=event.reports[0].date;
  event.sourceCount=new Set(event.reports.map(publisher)).size;
  const heat=new Map<string,number>();
  for(const report of event.reports){const age=(now-Date.parse(report.date))/3600000;if(/^\d{4}-\d{2}-\d{2}$/.test(report.date)||age<0||age>48||report.stale||report.historical)continue;const key=publisher(report);heat.set(key,Math.max(heat.get(key)||0,100*Math.pow(0.5,age/24)));}
  event.heat=Math.round([...heat.values()].reduce((a,b)=>a+b,0));
 }
 return events;
}
export function dedupeStories(items:News[],now=Date.now()):News[]{return clusterStories(items,now).map(e=>e.primary);}
export function rankNews(items:News[],now=Date.now()):News[]{return dedupeStories(items,now).sort((a,b)=>scoreNews(b,now)-scoreNews(a,now)||Date.parse(b.date)-Date.parse(a.date));}
/** Require source material beyond a title, and at most two stories per publisher. */
export function selectEdition(items:News[],limit=6,minScore=34,now=Date.now()):News[]{
 const picked:News[]=[],counts=new Map<string,number>();
 for(const n of rankNews(items,now)){
  if(n.stale||n.historical||(n.summary||'').trim().length<25||scoreNews(n,now)<minScore)continue;
  const key=publisher(n);if((counts.get(key)||0)>=2)continue;
  picked.push(n);counts.set(key,(counts.get(key)||0)+1);if(picked.length>=limit)break;
 }
 return picked;
}
