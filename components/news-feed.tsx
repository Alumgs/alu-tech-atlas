'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,Bookmark,Check,Download,Flame,ListFilter,Upload} from 'lucide-react';
import type {Domain,News} from '@/lib/content';
import {clusterStories,scoreReasons,sourceTier,tierLabels,type SourceTier,type NewsEvent} from '@/lib/editorial';
import {canonicalUrl,publicUrl} from '@/lib/url-safety';
import {publicationLabel} from '@/lib/publication-time';

type Reading={saved:News[];read:string[]};
const emptyReading:Reading={saved:[],read:[]},storageKey='atlas-reading-v2';
const moment=publicationLabel;
const identity=(n:News)=>n.domain+'|'+canonicalUrl(n.url);
function safeReading(value:unknown):Reading{
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const saved=Array.isArray(v.saved)?v.saved.slice(0,200).flatMap(x=>{
  if(!x||typeof x!=='object')return [];const n=x as Record<string,unknown>;
  if(typeof n.title!=='string'||!n.title||!publicUrl(n.url)||typeof n.date!=='string'||!Number.isFinite(Date.parse(n.date))||!['aidc','robot','ml'].includes(String(n.domain)))return [];
  return [{title:n.title.slice(0,350),url:canonicalUrl(String(n.url)),date:n.date,source:String(n.source||'来源未标注').slice(0,120),type:String(n.type||'产业动态').slice(0,40),domain:n.domain as Domain,summary:typeof n.summary==='string'?n.summary.slice(0,1000):undefined,sourceKind:typeof n.sourceKind==='string'?n.sourceKind.slice(0,30):undefined,historical:n.historical===true,stale:n.stale===true,region:n.region==='cn'?'cn' as const:undefined}];
 }):[];
 return {saved:[...new Map(saved.map(n=>[identity(n),n])).values()],read:Array.isArray(v.read)?v.read.filter((x):x is string=>typeof x==='string'&&x.length<=2100).slice(-6000):[]};
}
const topics:Record<Domain,Array<[string,RegExp]>>={
 aidc:[['液冷与能源',/cooling|liquid|power|energy|液冷|冷却|供电|能源|用电/i],['芯片与服务器',/gpu|chip|semiconductor|blackwell|rubin|服务器|芯片|昇腾/i],['网络与存储',/network|interconnect|storage|rdma|nvlink|光模块|互联|存储|网络/i]],
 robot:[['人形机器人',/humanoid|人形|人型|unitree|宇树|优必选|figure|optimus/i],['仿真与世界模型',/simulation|isaac|world.model|cosmos|genie|仿真|世界模型/i],['操作与控制',/manipulat|grasp|control|运动控制|抓取|操作|机械臂/i]],
 ml:[['模型与训练',/training|pretrain|language.model|llm|训练|大模型|预训练|架构/i],['推理与部署',/inference|quantiz|distill|serving|推理|部署|量化|蒸馏/i],['智能体与应用',/agent|rag|tool|智能体|应用|检索增强|工具调用/i]]
};
export function NewsFeed({items,domain,domainName,loading,query='',newsType='全部',region='all',pageSize=24}:{items:News[];domain:Domain;domainName:string;loading:boolean;query?:string;newsType?:string;region?:string;pageSize?:number}){
 const [reading,setReading]=useState<Reading>(emptyReading),[ready,setReady]=useState(false),[sort,setSort]=useState('score'),[tier,setTier]=useState('all'),[topic,setTopic]=useState('all');
 const [savedOnly,setSavedOnly]=useState(false),[unreadOnly,setUnreadOnly]=useState(false),[numbersOnly,setNumbersOnly]=useState(false),[limit,setLimit]=useState(pageSize),[notice,setNotice]=useState(''),[ascending,setAscending]=useState(false);
 const importRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{setReading(safeReading(JSON.parse(localStorage.getItem(storageKey)||'{}')));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(storageKey,JSON.stringify(reading));}catch{setNotice('本机存储空间不足，请导出阅读备份。');}},[reading,ready]);
 useEffect(()=>{setLimit(pageSize);setTopic('all');},[domain,pageSize]);
 useEffect(()=>{setLimit(pageSize);},[sort,tier,topic,savedOnly,unreadOnly,numbersOnly,query,newsType,region,pageSize]);
 const pool=useMemo(()=>savedOnly?reading.saved.filter(n=>n.domain===domain&&(newsType==='全部'||n.type===newsType)&&(region==='all'||n.region==='cn')&&(!query||(n.title+' '+n.source+' '+n.summary).toLowerCase().includes(query.toLowerCase()))):items,[items,savedOnly,reading.saved,domain,newsType,region,query]);
 const events=useMemo(()=>clusterStories(pool),[pool]);
 const keys=(event:NewsEvent)=>event.reports.map(identity);
 const isSaved=(event:NewsEvent)=>reading.saved.some(n=>keys(event).includes(identity(n)));
 const isRead=(event:NewsEvent)=>keys(event).some(k=>reading.read.includes(k));
 const filtered=events.filter(event=>
  (tier==='all'||event.reports.some(n=>sourceTier(n)===tier))&&
  (topic==='all'||topics[domain].find(([name])=>name===topic)?.[1].test(event.primary.title+' '+(event.primary.summary||'')))&&
  (!unreadOnly||!isRead(event))&&
  (!numbersOnly||/\d+(?:\.\d+)?\s*(?:%|％|亿|万|mw|gw|kw|twh|参数|亿美元)|同比|环比|吞吐|时延|出货|订单/i.test(event.primary.title+' '+(event.primary.summary||'')))
 ).sort((a,b)=>sort==='date'?Date.parse(b.latestDate)-Date.parse(a.latestDate):sort==='heat'?b.heat-a.heat||b.score-a.score:b.score-a.score||Date.parse(b.latestDate)-Date.parse(a.latestDate));
 function save(event:NewsEvent){
  setNotice('');const ids=keys(event);
  setReading(old=>({read:old.read,saved:isSaved(event)?old.saved.filter(n=>!ids.includes(identity(n))):[event.primary,...old.saved].slice(0,200)}));
 }
 function read(event:NewsEvent){setReading(old=>({...old,read:[...new Set([...old.read,...keys(event)])].slice(-6000)}));}
 function backup(){
  const blob=new Blob([JSON.stringify({schema:2,...reading},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='知域ATLAS_阅读备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function restore(file:File){
  try{if(file.size>1000000)throw Error('备份文件需小于 1 MB。');const parsed=JSON.parse(await file.text());if(parsed?.schema!==2)throw Error('不是受支持的知域阅读备份。');const data=safeReading(parsed);setReading(old=>safeReading({saved:[...data.saved,...old.saved],read:[...old.read,...data.read]}));setNotice('已合并收藏与阅读记录。');}
  catch(e){setNotice(e instanceof Error?e.message:'备份无法读取。');}finally{if(importRef.current)importRef.current.value='';}
 }
 return <section className="event-feed" aria-label="按事件整理的产业资讯">
  <div className="event-feed-heading"><div><span className="eyebrow">INDUSTRY BRIEF / {savedOnly?'我的收藏':'行业脉络'}</span><h2>{savedOnly?'收藏资料':domainName+' · 事件精选'}</h2><p>{savedOnly?'本机保存的资料快照，保留原文日期，可导出备份。':pool.length+' 条报道整理为 '+events.length+' 个阅读事件，相关原文保留在每条的来源时间线中。'}</p></div><span className="event-count">{filtered.length}<small>阅读事件</small></span></div>
  <div className="event-toolbar">
   <div className="event-sort" role="group" aria-label="资讯排序">{[['score','推荐'],['date','最新'],['heat','热度']].map(([key,label])=><button key={key} className={sort===key?'selected':''} aria-pressed={sort===key} onClick={()=>setSort(key)}>{key==='heat'&&<Flame size={14}/>} {label}</button>)}</div>
   <label><ListFilter size={14}/><select aria-label="按来源层级筛选" value={tier} onChange={e=>setTier(e.target.value)}><option value="all">全部来源层级</option>{(Object.keys(tierLabels) as SourceTier[]).map(key=><option value={key} key={key}>{tierLabels[key]}</option>)}</select></label>
   <button aria-pressed={savedOnly} className={savedOnly?'selected':''} onClick={()=>setSavedOnly(!savedOnly)}><Bookmark size={14}/>收藏</button>
   <label className="event-toggle"><input type="checkbox" checked={unreadOnly} onChange={e=>setUnreadOnly(e.target.checked)}/>只看未读</label>
   <label className="event-toggle"><input type="checkbox" checked={numbersOnly} onChange={e=>setNumbersOnly(e.target.checked)}/>含量化信息</label>
  </div>
  <div className="event-topics"><button className={topic==='all'?'selected':''} onClick={()=>setTopic('all')}>全部主题</button>{topics[domain].map(([name])=><button className={topic===name?'selected':''} key={name} onClick={()=>setTopic(name)}>{name}</button>)}</div>
  <div className="event-list">{filtered.slice(0,limit).map((event,index)=>{
   const n=event.primary,saved=isSaved(event),readBefore=isRead(event);
   return <article key={event.id} className={'event-card '+(index===0&&sort==='score'?'event-lead ':'')+(readBefore?'event-read':'')}>
    <div className="event-number">{String(index+1).padStart(2,'0')}</div><div className="event-card-body">
     <div className="event-meta"><span className={'source-tier tier-'+sourceTier(n)}>{tierLabels[sourceTier(n)]}</span><span>{n.type}</span><time dateTime={event.latestDate}>{moment(event.latestDate)}</time>{n.stale&&<em>旧缓存</em>}{n.historical&&<em>资料库</em>}{readBefore&&<span><Check size={12}/>已读</span>}</div>
     <h3><a href={n.url} target="_blank" rel="noreferrer" onClick={()=>read(event)}>{n.title}<ArrowUpRight size={17}/></a></h3>
     <p className="event-summary">{n.summary||'订阅源仅提供标题；尚无可用摘要，请打开原文核对。'}</p>
     <div className="event-reasons">{scoreReasons(n).map(reason=><span key={reason}>{reason}</span>)}<span>{event.sourceCount} 个关联来源</span>{sort==='heat'&&<span title="48 小时内同一来源只计一次，24 小时权重减半"><Flame size={12}/>{event.heat} 热度</span>}</div>
     <div className="event-bottom"><small>{n.source} · 原始订阅摘要 · 优先级 {event.score}</small><button className={saved?'selected':''} onClick={()=>save(event)} aria-pressed={saved} aria-label={(saved?'取消收藏 ':'收藏 ')+n.title}><Bookmark size={15}/>{saved?'已收藏':'收藏'}</button></div>
     <details className="event-sources"><summary>来源与报道时间线 · {event.reports.length} 篇</summary><button className="event-timeline-sort" onClick={()=>setAscending(!ascending)}>{ascending?'改为最新在前':'改为最早在前'}</button>{(ascending?[...event.reports].reverse():event.reports).map(report=><div key={report.url}><time>{moment(report.date)}</time><a href={report.url} target="_blank" rel="noreferrer" onClick={()=>read(event)}>{report.source} · {report.title}<ArrowUpRight size={12}/></a><small>{tierLabels[sourceTier(report)]}{report.stale?' · 旧缓存':''}</small></div>)}</details>
    </div>
   </article>;
  })}</div>
  {!filtered.length&&<div className="editorial-empty">{loading&&!savedOnly?'正在采集公开来源，成功后自动显示。':'暂无匹配事件，可扩大时间范围、切换来源层级或取消未读筛选。'}</div>}
  {filtered.length>limit&&<button className="editorial-more" onClick={()=>setLimit(n=>n+pageSize)}>加载更多（{limit} / {filtered.length} 个事件）</button>}
  <details className="event-method"><summary>筛选方法与阅读备份</summary><p>推荐排序按原文时效、来源域名、资料类型和摘要完整度计算，不是事实真实性评级。链接先去除追踪参数，再保守合并近似标题；不同版本号、季度或量化结果保留为独立进展。含量化信息仅按关键词筛选。热度仅统计本站已采集报道：48 小时内每个关联来源只计一次，24 小时权重减半。预印本不等于同行评审，厂商说明不等于独立评测。</p><p>收藏与阅读记录只保存在当前浏览器，最多保存 200 条收藏。备份文件可在其他设备导入，导入不会覆盖已有记录。</p><div><button onClick={backup}><Download size={14}/>导出阅读备份</button><button onClick={()=>importRef.current?.click()}><Upload size={14}/>导入备份</button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)void restore(f);}}/></div></details>
  {notice&&<p role="status" className="editorial-message">{notice}</p>}
 </section>;
}
