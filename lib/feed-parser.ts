import type {News,Domain,FeedSource} from './content';
import {publicUrl,canonicalUrl} from './url-safety.ts';
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
export function parseFeed(raw:string,source:FeedSource,checkedAt:string,fallback=false):News[]{
 const blocks=raw.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry\s*>/gi)||[];
 if(!blocks.length&&!/<(?:rss|feed|rdf:rdf)\b/i.test(raw))throw new Error('响应内容不是 RSS/Atom/XML');
 const results:News[]=[];
 for(const b of blocks.slice(0,180)){
  const title=tag(b,'title').slice(0,350),url=itemLink(b);
  const rawDate=tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')||tag(b,'dc:date')||tag(b,'date')||tag(b,'dcterms:created');
  const time=Date.parse(rawDate);
  if(!title||!publicUrl(url)||!Number.isFinite(time)||time>Date.now()+300000)continue;
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
   title,url:canonicalUrl(url),date:/^\d{4}-\d{2}-\d{2}$/.test(rawDate)?rawDate:new Date(time).toISOString(),source:sourceTag||source.name,feedId:source.name,feed:fallback?'Google News · 兜底索引':source.name,
   language:source.language,sourceKind,region:/中国|国内|工信部|信通院|华为|昇腾|浪潮|中科曙光|新华三|寒武纪|中际旭创|英维克|润泽科技|数据港|宇树|优必选|智元|傅立叶|埃斯顿|汇川|绿的谐波|三花智控|智源|上海人工智能实验室|北京人形|阿里|通义|千问|百度|文心|腾讯|字节|豆包|智谱|月之暗面|科大讯飞|商汤|深度求索|DeepSeek|Qwen|Unitree|UBTECH|MiniMax|Kimi/i.test(context)?'cn':undefined,
   domain,type,summary:description||undefined,collectedAt:checkedAt,topics:world?['world']:[]
  });
 }
 return results.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,120);
}

