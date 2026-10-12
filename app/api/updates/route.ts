import {sources,type News,type Domain,type FeedSource} from '@/lib/content';
export const dynamic='force-dynamic';

type FeedStatus={name:string;domain:string;ok:boolean;count:number;error?:string;warning?:string;fallback?:boolean;checkedAt:string;latestPublishedAt?:string;durationMs?:number};
type Payload={items:News[];statuses:FeedStatus[];checkedAt:string};
let memory:{at:number;day:string;data:Payload}|undefined;
const feedMemory=new Map<string,{at:number;day:string;data:Payload}>();
const lastGood=new Map<string,News[]>();
const day=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});

function decode(s:string){
 return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;|&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>{const c=Number(n);return c>=0&&c<=1114111?String.fromCodePoint(c):' ';}).replace(/&#x([0-9a-f]+);/gi,(_,n)=>{const c=parseInt(n,16);return c>=0&&c<=1114111?String.fromCodePoint(c):' ';});
}
function clean(s:string){
 const markup=s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ').replace(/<[^>]*>/g,' ');
 return decode(markup).replace(/[\t\f\v ]+/g,' ').replace(/\s*\n\s*/g,' ').trim();
}
function tag(s:string,n:string){
 return clean(s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'\\s*>','i'))?.[1]||'');
}
function attrs(s:string){const out:Record<string,string>={};for(const m of s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))out[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]??'');return out;}
function itemLink(block:string){
 const linkTags=[...block.matchAll(/<link\b([^>]*)\/?>/gi)].map(m=>attrs(m[1]));
 const hrefs=linkTags.filter(a=>a.href);
 const preferred=hrefs.find(a=>(a.rel||'').toLowerCase()==='alternate')||hrefs.find(a=>!(a.rel||'').toLowerCase().split(/\s+/).includes('self'))||hrefs[0];
 const textLink=tag(block,'link');
 const value=/^https?:\/\//i.test(textLink)?textLink:preferred?.href||'';
 return decode(value).trim();
}
function parseFeed(raw:string,source:FeedSource,checkedAt:string,fallback=false):News[]{
 const blocks=raw.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry\s*>/gi)||[];
 if(!blocks.length&&!/<(?:rss|feed|rdf:rdf)\b/i.test(raw))throw new Error('响应内容不是 RSS/Atom/XML');
 const results:News[]=[];
 for(const b of blocks.slice(0,180)){
  const title=tag(b,'title').slice(0,350),url=itemLink(b);
  const rawDate=tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')||tag(b,'dc:date')||tag(b,'date')||tag(b,'dcterms:created');
  const time=Date.parse(rawDate);
  if(!title||!/^https?:\/\//i.test(url)||!Number.isFinite(time)||time>Date.now()+300000)continue;
  const rawDescription=tag(b,'description')||tag(b,'summary')||tag(b,'content:encoded')||tag(b,'content')||'';
  const description=clean(rawDescription).slice(0,1000);
  const context=(title+' '+description).slice(0,1800);
  const world=/world.model|世界模型|cosmos|v-jepa|genie|dreamerv?3/i.test(context);
  const robot=/robot|humanoid|isaac|gr00t|embodied|manipulat|机器人|具身/i.test(context)||world;
  const aidc=/financial|earnings|quarter.*results|data cent|datacent|AI factor|Blackwell|Rubin|network|GPU|cooling|液冷|智算|服务器|数据中心|算力|昇腾|光模块|超节点|semiconductor|chip|infrastructure/i.test(context);
  const ml=/language model|LLM|agent|inference|fine.tun|quantiz|distill|machine learn|大模型|智能体|小模型|模型|人工智能|深度学习|推理|开源|通义|千问|DeepSeek|artificial intelligence|\bAI\b/i.test(context);
  const domains:Domain[]=source.domain==='both'?([...aidc?['aidc' as Domain]:[],...robot?['robot' as Domain]:[],...ml?['ml' as Domain]:[]]):[source.domain as Domain];
  const type=/financial|earnings|quarter.*results|财报|营收|业绩/i.test(title)?'企业财报':source.type==='研究论文'?'研究论文':/发布|推出|launch|introduc|release/i.test(title)&&source.type!=='市场洞察'?'产品发布':source.type;
  if(!domains.length)continue;
  const sourceTag=tag(b,'source');
  const sourceKind=fallback?'新闻聚合':source.kind||(source.url.includes('news.google.com')?'新闻聚合':undefined);
  for(const domain of domains)results.push({
   title,url,date:new Date(time).toISOString(),source:sourceTag||source.name,feed:fallback?'Google News · 兜底索引':source.name,
   language:source.language,sourceKind,region:/中国|国内|工信部|信通院|华为|昇腾|浪潮|中科曙光|新华三|寒武纪|中际旭创|英维克|润泽科技|数据港|宇树|优必选|智元|傅立叶|埃斯顿|汇川|绿的谐波|三花智控|智源|上海人工智能实验室|北京人形|阿里|通义|千问|百度|文心|腾讯|字节|豆包|智谱|月之暗面|科大讯飞|商汤|深度求索|DeepSeek|Qwen|Unitree|UBTECH|MiniMax|Kimi/i.test(context)?'cn':undefined,
   domain,type,summary:description||undefined,collectedAt:checkedAt,topics:world?['world']:[]
  });
 }
 return results.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,120);
}

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
  'User-Agent':'KnowledgeAtlas/4.1 (public RSS research reader)'
 }});
 if(!r.ok)throw new Error('HTTP '+r.status);
 const raw=await r.text();
 if(raw.length>5000000)throw new Error('订阅内容过大');
 const items=parseFeed(raw,source,checkedAt,fallback);
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
 const items=results.flatMap(r=>r.items).filter(n=>{const key=n.domain+'|'+n.url;if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 return {items,statuses:results.map(r=>r.status),checkedAt};
}
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,force=params.get('force')==='1',index=params.get('source');
 const headers={'Cache-Control':'private, no-store'};
 if(index!==null){
  if(!/^\d+$/.test(index)||!sources[Number(index)])return Response.json({error:'未知来源'},{status:400,headers});
  const source=sources[Number(index)],cached=feedMemory.get(source.name);
  if(!force&&cached&&cached.day===day()&&Date.now()-cached.at<3600000)return Response.json({...cached.data,cached:true},{headers});
  const data=await collect([source]);
  if(data.statuses[0].ok)feedMemory.set(source.name,{at:Date.now(),day:day(),data});
  return Response.json({...data,cached:false},{headers});
 }
 if(!force&&memory&&memory.day===day()&&Date.now()-memory.at<60000)return Response.json({...memory.data,cached:true},{headers});
 const data=await collect();
 if(data.statuses.some(s=>s.ok))memory={at:Date.now(),day:day(),data};
 return Response.json({...data,cached:false},{headers});
}
