import {sources,type News,type Domain} from '@/lib/content';
export const dynamic='force-dynamic';
type FeedStatus={name:string;domain:string;ok:boolean;count:number;error?:string;checkedAt:string;latestPublishedAt?:string;durationMs?:number};
type Payload={items:News[];statuses:FeedStatus[];checkedAt:string};
let memory:{at:number;day:string;data:Payload}|undefined;
const feedMemory=new Map<string,{at:number;day:string;data:Payload}>();
const lastGood=new Map<string,News[]>();
const day=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});
function clean(s:string){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),1114111))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(Math.min(parseInt(n,16),1114111))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();}
function tag(s:string,n:string){return clean(s.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'>','i'))?.[1]||'');}
async function collect(selected=sources):Promise<Payload>{
 const checkedAt=new Date().toISOString();
 const results=await Promise.all(selected.map(async source=>{
  const started=Date.now();
  try{
   const r=await fetch(source.url,{cache:'no-store',signal:AbortSignal.timeout(source.kind==='官方直连'||source.kind==='媒体直连'?12000:8000),headers:{'Cache-Control':'no-cache','Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml','User-Agent':'KnowledgeAtlas/2.0 (+RSS research reader)'}});
   if(!r.ok)throw new Error('来源响应 '+r.status);
   const raw=await r.text();if(raw.length>5000000)throw new Error('内容过大');
   const blocks=raw.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[];
   if(!blocks.length&&!/<(?:rss|feed)\b/i.test(raw))throw new Error('格式不匹配');
   const items:News[]=blocks.slice(0,160).flatMap(b=>{
    const title=tag(b,'title'),atomLink=b.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const url=tag(b,'link')||clean(atomLink||'');
    const time=Date.parse(tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')||tag(b,'dc:date'));
    if(!title||!/^https?:\/\//i.test(url)||!Number.isFinite(time)||time>Date.now()+300000)return [];
    const context=title+' '+tag(b,'description')+' '+tag(b,'summary');
    const world=/world.model|世界模型|cosmos|v-jepa|genie|dreamerv?3/i.test(context);
    const robot=/robot|humanoid|isaac|gr00t|embodied|manipulat|机器人|具身/i.test(context)||world;
    const aidc=/financial|earnings|quarter.*results|data cent|datacent|AI factor|Blackwell|Rubin|network|GPU|cooling|液冷|智算|服务器|数据中心|算力|昇腾|光模块|液冷|超节点|semiconductor|chip|infrastructure/i.test(context);
    const ml=/language model|LLM|agent|inference|fine.tun|quantiz|distill|machine learn|大模型|智能体|小模型|模型|人工智能|深度学习|推理|开源|通义|千问|DeepSeek|artificial intelligence|\bAI\b/i.test(context);
    const domains:Domain[]=source.domain==='both'?([...aidc?['aidc' as Domain]:[],...robot?['robot' as Domain]:[],...ml?['ml' as Domain]:[]]):[source.domain as Domain];
    const type=/financial|earnings|quarter.*results|财报|营收|业绩/i.test(title)?'企业财报':source.type==='研究论文'?'研究论文':/发布|推出|launch|introduc|release/i.test(title)&&source.type!=='市场洞察'?'产品发布':source.type;
    return domains.map(domain=>({title:title.slice(0,350),url,date:new Date(time).toISOString(),source:tag(b,'source')||source.name,feed:source.name,language:source.language,sourceKind:source.kind||(source.url.includes('news.google.com')?'新闻聚合':undefined),region:/中国|国内|工信部|信通院|华为|昇腾|浪潮|中科曙光|新华三|寒武纪|中际旭创|英维克|润泽科技|数据港|宇树|优必选|智元|傅利叶|埃斯顿|汇川|绿的谐波|三花智控|智源|上海人工智能实验室|北京人形|阿里|通义|千问|百度|文心|腾讯|字节|豆包|智谱|月之暗面|科大讯飞|商汤|深度求索|DeepSeek|Qwen|Unitree|UBTECH|MiniMax|Kimi/i.test(context)?'cn' as const:undefined,domain,type,collectedAt:checkedAt,topics:world?['world']:[]}));
   }).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,120);
   lastGood.set(source.name,items);
   return {items,status:{name:source.name,domain:source.domain,ok:true,count:items.length,checkedAt,latestPublishedAt:items[0]?.date,durationMs:Date.now()-started} as FeedStatus};
  }catch(e){
   const items=(lastGood.get(source.name)||[]).map(n=>({...n,stale:true}));
   console.warn('feed_failed',source.name,e instanceof Error?e.message:'unknown');
   return {items,status:{name:source.name,domain:source.domain,ok:false,count:items.length,error:e instanceof Error&&e.message.startsWith('来源响应')?e.message:'连接失败、超时或格式暂不可用',checkedAt} as FeedStatus};
  }
 }));
 const seen=new Set<string>();const items=results.flatMap(r=>r.items).filter(n=>{const key=n.domain+n.url;if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
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
 // Never share an in-flight fetch between Worker request lifetimes.
 const data=await collect();if(data.statuses.some(s=>s.ok))memory={at:Date.now(),day:day(),data};
 return Response.json({...data,cached:false},{headers});
}
