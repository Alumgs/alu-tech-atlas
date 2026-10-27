import {articleDescription} from '@/lib/official-news';
import {boundedText} from '@/lib/http-safety';
import {canonicalUrl} from '@/lib/url-safety';
import {parseSource} from '@/lib/domestic-feeds';
import {sources,type News,type Domain,type FeedSource} from '@/lib/content';
export const dynamic='force-dynamic';

type FeedStatus={name:string;domain:string;ok:boolean;count:number;error?:string;warning?:string;fallback?:boolean;checkedAt:string;latestPublishedAt?:string;durationMs?:number};
type Payload={items:News[];statuses:FeedStatus[];checkedAt:string};
const feedMemory=new Map<string,{at:number;day:string;data:Payload}>();
const lastGood=new Map<string,News[]>();
const feedInFlight=new Map<string,Promise<Payload>>();
const day=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});

const fallbackQueries:Record<string,string>={
 'TechCrunch · AI':'site:techcrunch.com/category/artificial-intelligence (AI OR artificial intelligence OR machine learning)',
 'DCD · 数据中心产业':'site:datacenterdynamics.com (AI data center OR liquid cooling OR data centre)',
 'The Robot Report':'site:therobotreport.com (robotics OR humanoid OR AI)',
 'VentureBeat · AI':'site:venturebeat.com (AI OR artificial intelligence OR agents)',
 'NVIDIA Newsroom':'site:nvidianews.nvidia.com/releases (GPU OR AI OR data center OR robotics)',
 'NVIDIA Developer':'site:developer.nvidia.com/blog (AI OR CUDA OR robotics OR inference)',
 'arXiv · cs.RO':'site:arxiv.org/abs (robotics OR robot learning OR embodied AI)',
 'arXiv · cs.LG':'site:arxiv.org/abs (machine learning OR deep learning OR language model)',
 'Hugging Face':'site:huggingface.co/blog (models OR inference OR robotics OR AI)',
 'InfoQ 中文 · 工程实践':'site:infoq.cn/article (大模型 OR AI OR 机器人 OR 数据中心 OR 智能体)',
 '华为 · 中文官方动态':'site:huawei.com/cn (昇腾 OR 算力 OR 数据中心 OR AI OR 液冷)',
 '量子位 · 中文 AI 科技':'site:qbitai.com (大模型 OR AI OR 机器人 OR 智算 OR 智能体)'
};
function fallbackUrl(source:FeedSource){
 const q=fallbackQueries[source.name];
 if(!q||source.url.includes('news.google.com/rss/search'))return '';
 const chinese=source.language==='zh';
 return 'https://news.google.com/rss/search?q='+encodeURIComponent(q+' when:30d')+'&hl='+(chinese?'zh-CN':'en-US')+'&gl='+(chinese?'CN':'US')+'&ceid='+(chinese?'CN:zh-Hans':'US:en');
}
function errorLabel(error:unknown){
 const message=error instanceof Error?error.message:String(error||'未知错误');
 if(/TimeoutError|timed out|timeout|超时/i.test(message))return '连接超时';
 const status=message.match(/\bHTTP\s+(\d{3})\b/i)?.[1];
 if(status==='401'||status==='403')return '源站拒绝访问（HTTP '+status+'）';
 if(status==='404'||status==='410')return '订阅地址失效（HTTP '+status+'）';
 if(status==='429')return '源站限流（HTTP 429）';
 if(status&&Number(status)>=500)return '源站服务异常（HTTP '+status+'）';
 if(/RSS\/Atom\/XML|格式|有效条目|解析/i.test(message))return message.slice(0,90);
 return /fetch failed|network|连接|socket|dns/i.test(message)?'网络连接失败':message.slice(0,100)||'未知错误';
}
async function fetchFeed(url:string,source:FeedSource,checkedAt:string,timeoutMs:number,fallback=false){
 const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(timeoutMs),headers:{
  'Cache-Control':'no-cache','Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8',
  'User-Agent':source.format?'Mozilla/5.0 (compatible; KnowledgeAtlas/4.2)':'KnowledgeAtlas/4.2 (public RSS research reader)'
 }});
 if(!r.ok)throw new Error('HTTP '+r.status);
 const raw=await boundedText(r,2000000);
 if(raw.length>5000000)throw new Error('订阅内容过大');
 const items=parseSource(raw,source,checkedAt,fallback);
 if(source.format==='anthropic'){
  // Enrich at most two latest official notices; only this fixed public host is allowed.
  await Promise.all(items.slice(0,2).filter(n=>!n.summary).map(async n=>{
   if(new URL(n.url).origin!=='https://www.anthropic.com')return;
   try{const page=await fetch(n.url,{signal:AbortSignal.timeout(4000)});if(page.ok)n.summary=articleDescription(await boundedText(page,1500000))||undefined;}catch{/* Keep original dated title when the article is unavailable. */}
  }));
 }
 if(!items.length)throw new Error('订阅有响应，但未解析到带有效日期、正文链接和相关内容的条目');
 return items;
}
async function mapLimit<T,R>(items:T[],limit:number,task:(item:T)=>Promise<R>):Promise<R[]>{
 const output=new Array<R>(items.length);let cursor=0;
 const workers=Array.from({length:Math.min(limit,items.length)},async()=>{while(true){const index=cursor++;if(index>=items.length)return;output[index]=await task(items[index]);}});
 await Promise.all(workers);return output;
}
async function collect(selected:FeedSource[]=sources):Promise<Payload>{
 const checkedAt=new Date().toISOString();
 const results=await mapLimit(selected,5,async source=>{
  const started=Date.now();
  try{
   let primaryError='';let items:News[]=[];
   try{items=await fetchFeed(source.url,source,checkedAt,source.kind==='官方直连'||source.kind==='媒体直连'?8500:7000,false);}
   catch(e){primaryError=errorLabel(e);}
   if(items.length){
    lastGood.set(source.name,items);
    return {items,status:{name:source.name,domain:source.domain,ok:true,count:items.length,checkedAt,latestPublishedAt:items[0]?.date,durationMs:Date.now()-started} as FeedStatus};
   }
   const alternate=fallbackUrl(source);
   if(alternate){
    try{
     const backup=await fetchFeed(alternate,source,checkedAt,8000,true);
     lastGood.set(source.name,backup);
     return {items:backup,status:{name:source.name,domain:source.domain,ok:true,count:backup.length,checkedAt,latestPublishedAt:backup[0]?.date,durationMs:Date.now()-started,fallback:true,warning:'原始订阅不可用（'+primaryError+'），已使用 Google News 索引兜底；结果可能不完整。'} as FeedStatus};
    }catch(e){
     const backupError=errorLabel(e);
     console.warn('feed_fallback_failed',source.name,primaryError,backupError);
     const stale=(lastGood.get(source.name)||[]).map(n=>({...n,stale:true}));
     return {items:stale,status:{name:source.name,domain:source.domain,ok:false,count:stale.length,error:'原订阅：'+primaryError+'；新闻索引兜底：'+backupError,checkedAt,durationMs:Date.now()-started} as FeedStatus};
    }
   }
   const stale=(lastGood.get(source.name)||[]).map(n=>({...n,stale:true}));
   console.warn('feed_failed',source.name,primaryError||'unknown');
   return {items:stale,status:{name:source.name,domain:source.domain,ok:false,count:stale.length,error:primaryError||'未获取到有效条目',checkedAt,durationMs:Date.now()-started} as FeedStatus};
  }catch(e){
   const stale=(lastGood.get(source.name)||[]).map(n=>({...n,stale:true}));
   console.warn('feed_failed',source.name,errorLabel(e));
   return {items:stale,status:{name:source.name,domain:source.domain,ok:false,count:stale.length,error:errorLabel(e),checkedAt,durationMs:Date.now()-started} as FeedStatus};
  }
 });
 const seen=new Set<string>();
 const items=results.flatMap(r=>r.items).filter(n=>{const key=(n.scope||n.domain)+'|'+canonicalUrl(n.url);if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 return {items,statuses:results.map(r=>r.status),checkedAt};
}
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,force=params.get('force')==='1',index=params.get('source');
 const headers={'Cache-Control':'private, no-store'};
 if(index!==null){
  if(!/^\d+$/.test(index)||!sources[Number(index)])return Response.json({error:'未知来源'},{status:400,headers});
  const source=sources[Number(index)],cached=feedMemory.get(source.name);
  if(cached&&cached.day===day()&&Date.now()-cached.at<(force?15000:900000))return Response.json({...cached.data,cached:true},{headers});
  let pending=feedInFlight.get(source.name);
  if(!pending){pending=collect([source]).finally(()=>feedInFlight.delete(source.name));feedInFlight.set(source.name,pending);}
  const data=await pending;
  if(data.statuses[0].ok)feedMemory.set(source.name,{at:Date.now(),day:day(),data});
  return Response.json({...data,cached:false},{headers});
 }
 // Aggregate only already collected source caches. A refresh must identify a source;
 // this prevents one request from opening every external feed and exhausting quotas.
 const snapshots=[...feedMemory.values()].map(x=>x.data);
 if(!snapshots.length)return Response.json({error:'请指定 source 索引获取来源；批量结果仅返回已采集缓存。'},{status:400,headers});
 const unique=new Map<string,News>();
 for(const cached of feedMemory.values())for(const n of cached.data.items)unique.set((n.scope||n.domain)+'|'+canonicalUrl(n.url),{...n,stale:Date.now()-cached.at>900000||n.stale});
 return Response.json({items:[...unique.values()],statuses:snapshots.flatMap(x=>x.statuses),checkedAt:new Date().toISOString(),cached:true},{headers});
}
