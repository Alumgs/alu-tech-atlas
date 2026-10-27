import {sourceTier,type NewsEvent} from './editorial.ts';
import {relevance,worldTopic} from './relevance.ts';
import type {StreamScope} from './intelligence.ts';
export function selectBriefs(events:NewsEvent[],scope:StreamScope){
 const counts=new Map<string,number>();
 return events.filter(e=>{
  const n=e.primary,tier=sourceTier(n),host=new URL(n.url).hostname.replace(/^www\./,'');
  const key=tier==='aggregate'?n.source:host;
  if(n.type==='社区热议'||n.sourceKind==='社区讨论'||n.stale||n.historical||((n.summary||'').trim().length<60&&!(n.type==='政策法规'&&tier==='primary'))||e.score<({primary:60,media:65,aggregate:72,other:68}[tier])||(scope!=='world'&&relevance(n,scope)!==100)||(counts.get(key)||0)>=2)return false;
  counts.set(key,(counts.get(key)||0)+1);return true;
 }).slice(0,12);
}
/** Recommendation interleaves publishers and subjects; latest/heat views keep their explicit order. */
export function balanceWorld(events:NewsEvent[]){
 const ranked=[...events].sort((a,b)=>priority(b)-priority(a)||Date.parse(b.latestDate)-Date.parse(a.latestDate));
 const selected:NewsEvent[]=[],rest:NewsEvent[]=[],topics=new Set<string>(),publishers=new Set<string>();
 for(const e of ranked){
  const topic=worldTopic(e.primary)||'其他动态',host=new URL(e.primary.url).hostname.replace(/^www\./,'');
  if(!topics.has(topic)&&!publishers.has(host)){selected.push(e);topics.add(topic);publishers.add(host);}else rest.push(e);
 }
 const rounds:NewsEvent[][]=[];
 const counts=new Map<string,number>();
 for(const e of rest){const host=new URL(e.primary.url).hostname.replace(/^www\./,''),round=counts.get(host)||0;counts.set(host,round+1);(rounds[round]||=[]).push(e);}
 return [...selected,...rounds.flat()];
}
function priority(e:NewsEvent){return e.score+(/\bIPO\b|S-1|initial public offering|首次公开募股|上市申请/i.test(e.primary.title)?12:0);}
