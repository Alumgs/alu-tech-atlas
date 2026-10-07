'use client';
import {useState,useEffect,useRef,useCallback,startTransition} from 'react';
import {sources,type News,type Domain} from '@/lib/content';
export type FeedStatus={name:string;ok:boolean;count:number;error?:string;checkedAt:string;latestPublishedAt?:string;durationMs?:number};
export type UpdateResult={items:News[];statuses:FeedStatus[];checkedAt:string;cached?:boolean};
const KEY='atlas-updates-v4';
const day=(value=Date.now())=>new Date(value).toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'});
export function mergeItems(items:News[]){
 const unique=new Map<string,News>();
 for(const n of items){const key=n.domain+'|'+n.url,old=unique.get(key);if(!old||old.stale&&!n.stale)unique.set(key,n);}
 return [...unique.values()].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,5000);
}
export function useUpdates(domain:Domain){
 const [data,setData]=useState<UpdateResult|null>(null),[loading,setLoading]=useState(false),[progress,setProgress]=useState(0),[added,setAdded]=useState(0),[error,setError]=useState(''),[isOld,setIsOld]=useState(false);
 const current=useRef<UpdateResult|null>(null),active=useRef(false),abort=useRef<AbortController|null>(null),domainRef=useRef(domain),lastAttempt=useRef(0);
 domainRef.current=domain;
 const refresh=useCallback(async(force=false)=>{
  if(active.current)return;active.current=true;abort.current=new AbortController();const signal=abort.current.signal;lastAttempt.current=Date.now();setLoading(true);setProgress(0);setAdded(0);setError('');
  const previous=current.current;const oldKeys=new Set(previous?.items.map(n=>n.domain+n.url)||[]);
  // Keep per-feed copies until final deduplication so a failed duplicate cannot hide a fresh item.
  const perFeed=new Map<string,News[]>();for(const n of previous?.items||[]){const key=n.feed||'';perFeed.set(key,[...(perFeed.get(key)||[]),{...n,stale:true}]);}
  const statuses:FeedStatus[]=[];const order=sources.map((s,index)=>({s,index})).sort((a,b)=>Number(b.s.domain===domainRef.current)-Number(a.s.domain===domainRef.current));
  let cursor=0,complete=0,lastPaint=0;
  const publish=()=>{const items=mergeItems([...perFeed.values()].flat());const result={items,statuses:[...statuses],checkedAt:new Date().toISOString()};current.current=result;startTransition(()=>{setData(result);setProgress(complete);setAdded(items.filter(n=>!n.stale&&!oldKeys.has(n.domain+n.url)).length);setIsOld(!statuses.some(s=>s.ok));});};
  const worker=async()=>{while(cursor<order.length&&!signal.aborted){const {s,index}=order[cursor++];try{
   const response=await fetch('/api/updates?source='+index+(force?'&force=1':''),{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(18000)])});if(response.status===401){abort.current?.abort();window.location.assign('/auth/login?returnTo='+encodeURIComponent(location.pathname+location.search));return;}if(!response.ok)throw Error('HTTP '+response.status);
   const result:UpdateResult=await response.json();if(!Array.isArray(result.items)||!result.statuses?.[0])throw Error('无效响应');statuses.push(result.statuses[0]);if(result.statuses[0].ok)perFeed.set(s.name,result.items);
  }catch{if(signal.aborted)return;statuses.push({name:s.name,ok:false,count:0,error:'连接超时或暂不可用',checkedAt:new Date().toISOString()});}
  complete++;if(Date.now()-lastPaint>500||complete===order.length){publish();lastPaint=Date.now();}
  }};
  try{await Promise.all([worker(),worker(),worker(),worker()]);if(!signal.aborted){publish();const snapshot=current.current;if(snapshot){const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(snapshot));}catch{}};if('requestIdleCallback' in window)window.requestIdleCallback(persist,{timeout:2000});else setTimeout(persist,0);}if(!statuses.some(s=>s.ok))setError(current.current?.items.length?'本次联网未成功，保留上次缓存。':'本次联网未成功，暂无可用缓存。请稍后重试。');}}
  finally{if(abort.current?.signal===signal){active.current=false;if(!signal.aborted)setLoading(false);}}
 },[]);
 useEffect(()=>{
  let saved:UpdateResult|null=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
  if(saved&&Array.isArray(saved.items)&&Array.isArray(saved.statuses)){current.current=saved;setData(saved);setIsOld(true);const recent=Date.now()-Date.parse(saved.checkedAt)<15*60000&&day(Date.parse(saved.checkedAt))===day();if(recent&&saved.statuses.length===sources.length&&saved.statuses.some(s=>s.ok)){setIsOld(false);setProgress(sources.length);lastAttempt.current=Date.parse(saved.checkedAt);}else void refresh();}else void refresh();
  const check=()=>{if(document.visibilityState==='visible'&&(Date.now()-lastAttempt.current>15*60000||day(lastAttempt.current)!==day()))void refresh();};
  const timer=setInterval(check,60000);document.addEventListener('visibilitychange',check);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',check);abort.current?.abort();active.current=false;};
 },[refresh]);
 return {data,loading,progress,added,error,isOld,refresh};
}
