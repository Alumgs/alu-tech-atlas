import {sourceTier,type NewsEvent} from './editorial.ts';
import {relevance} from './relevance.ts';
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
