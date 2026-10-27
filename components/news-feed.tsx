'use client';
import {relevance} from '@/lib/relevance';
import {selectBriefs} from '@/lib/selection';
import {Localized} from '@/components/language';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,Bookmark,Check,Download,Flame,ListFilter,Upload} from 'lucide-react';
import type {Domain,News} from '@/lib/content';
import {clusterStories,scoreReasons,sourceTier,tierLabels,type SourceTier,type NewsEvent} from '@/lib/editorial';
import {canonicalUrl,publicUrl} from '@/lib/url-safety';
import {BilingualText,useLanguage} from './language';
import {inStream,worldTopics,worldTopic,type StreamScope} from '@/lib/intelligence';
import {publicationLabel} from '@/lib/publication-time';

type Reading={saved:News[];read:string[]};
const emptyReading:Reading={saved:[],read:[]},storageKey='atlas-reading-v2';
const moment=publicationLabel;
const identity=(n:News)=>(n.scope||n.domain)+'|'+canonicalUrl(n.url);
function safeReading(value:unknown):Reading{
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const saved=Array.isArray(v.saved)?v.saved.slice(0,200).flatMap(x=>{
  if(!x||typeof x!=='object')return [];const n=x as Record<string,unknown>;
  if(typeof n.title!=='string'||!n.title||!publicUrl(n.url)||typeof n.date!=='string'||!Number.isFinite(Date.parse(n.date))||!['aidc','robot','ml'].includes(String(n.domain)))return [];
  return [{title:n.title.slice(0,350),url:canonicalUrl(String(n.url)),date:n.date,source:String(n.source||'来源未标注').slice(0,120),type:String(n.type||'产业动态').slice(0,40),domain:n.domain as Domain,summary:typeof n.summary==='string'?n.summary.slice(0,1000):undefined,scope:n.scope==='world'?'world' as const:undefined,catalogGroup:typeof n.catalogGroup==='string'?n.catalogGroup.slice(0,80):undefined,sourceKind:typeof n.sourceKind==='string'?n.sourceKind.slice(0,30):undefined,historical:n.historical===true,stale:n.stale===true,region:n.region==='cn'?'cn' as const:undefined}];
 }):[];
 return {saved:[...new Map(saved.map(n=>[identity(n),n])).values()],read:Array.isArray(v.read)?v.read.filter((x):x is string=>typeof x==='string'&&x.length<=2100).slice(-6000):[]};
}
const topics:Record<Domain,Array<[string,RegExp]>>={
 aidc:[['液冷与能源',/cooling|liquid|power|energy|液冷|冷却|供电|能源|用电/i],['芯片与服务器',/gpu|chip|semiconductor|blackwell|rubin|服务器|芯片|昇腾/i],['网络与存储',/network|interconnect|storage|rdma|nvlink|光模块|互联|存储|网络/i]],
 robot:[['人形机器人',/humanoid|人形|人型|unitree|宇树|优必选|figure|optimus/i],['仿真与世界模型',/simulation|isaac|world.model|cosmos|genie|仿真|世界模型/i],['操作与控制',/manipulat|grasp|control|运动控制|抓取|操作|机械臂/i]],
 ml:[['模型与训练',/training|pretrain|language.model|llm|训练|大模型|预训练|架构/i],['推理与部署',/inference|quantiz|distill|serving|推理|部署|量化|蒸馏/i],['智能体与应用',/agent|rag|tool|智能体|应用|检索增强|工具调用/i]]
};
export function NewsFeed({items,domain,domainName,loading,query='',newsType='全部',region='all',pageSize=24,scope=domain}:{items:News[];domain:Domain;domainName:string;loading:boolean;query?:string;newsType?:string;region?:string;pageSize?:number;scope?:StreamScope}){
 const {t}=useLanguage();
 const topicList=scope==='world'?worldTopics.map(([zh,,re])=>[zh,re] as [string,RegExp]):topics[domain];
 const [reading,setReading]=useState<Reading>(emptyReading),[ready,setReady]=useState(false),[sort,setSort]=useState('score'),[selectedOnly,setSelectedOnly]=useState(true),[tier,setTier]=useState('all'),[topic,setTopic]=useState('all');
 const [savedOnly,setSavedOnly]=useState(false),[unreadOnly,setUnreadOnly]=useState(false),[numbersOnly,setNumbersOnly]=useState(false),[limit,setLimit]=useState(pageSize),[notice,setNotice]=useState(''),[ascending,setAscending]=useState(false);
 const importRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{setReading(safeReading(JSON.parse(localStorage.getItem(storageKey)||'{}')));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(storageKey,JSON.stringify(reading));}catch{setNotice('本机存储空间不足，请导出阅读备份。');}},[reading,ready]);
 useEffect(()=>{setLimit(pageSize);setTopic('all');},[scope,pageSize]);
 useEffect(()=>{setLimit(pageSize);},[selectedOnly,sort,tier,topic,savedOnly,unreadOnly,numbersOnly,query,newsType,region,pageSize]);
 const pool=useMemo(()=>savedOnly?reading.saved.filter(n=>inStream(n,scope)&&(newsType==='全部'||n.type===newsType)&&(region==='all'||n.region==='cn')&&(!query||(n.title+' '+n.source+' '+n.summary).toLowerCase().includes(query.toLowerCase()))):items.filter(n=>inStream(n,scope)),[items,savedOnly,reading.saved,domain,newsType,region,query,scope]);
 const events=useMemo(()=>clusterStories(pool),[pool]);
 const keys=(event:NewsEvent)=>event.reports.map(identity);
 const isSaved=(event:NewsEvent)=>reading.saved.some(n=>keys(event).includes(identity(n)));
 const isRead=(event:NewsEvent)=>keys(event).some(k=>reading.read.includes(k));
 const related=events.filter(event=>
  (tier==='all'||event.reports.some(n=>sourceTier(n)===tier))&&
  (topic==='all'||(scope==='world'?worldTopic(event.primary)===topic:topicList.find(([name])=>name===topic)?.[1].test(event.primary.title+' '+(event.primary.summary||''))))&&
  (!unreadOnly||!isRead(event))&&
  (!numbersOnly||/\d+(?:\.\d+)?\s*(?:%|％|亿|万|mw|gw|kw|twh|参数|亿美元)|同比|环比|吞吐|时延|出货|订单/i.test(event.primary.title+' '+(event.primary.summary||'')))
 ).sort((a,b)=>sort==='date'?Date.parse(b.latestDate)-Date.parse(a.latestDate):sort==='heat'?b.heat-a.heat||b.score-a.score:(scope==='world'?0:relevance(b.primary,domain)-relevance(a.primary,domain))||b.score-a.score||Date.parse(b.latestDate)-Date.parse(a.latestDate));
 const selected=selectBriefs(related,scope);
 const filtered=selectedOnly&&!savedOnly?selected:related;
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
  <div className="event-feed-heading"><div><span className="eyebrow">INDUSTRY BRIEF / <Localized value={savedOnly?'我的收藏':'行业脉络'}/></span><h2>{savedOnly?t('收藏资料','Saved reading'):domainName+' · '+t('事件精选','Event briefs')}</h2><p>{savedOnly?t('本机保存的资料快照，保留原文日期，可导出备份。','Local snapshots with original dates; backups are available.'):t('报道','Reports')+' '+pool.length+' → '+t('阅读事件','Events')+' '+events.length+' · '+t('每条均保留原文来源与时间线','Each event keeps its sources and reporting timeline')}</p></div><span className="event-count">{filtered.length}<small><Localized value={"阅读事件"}/> </small></span></div>
  <div className="event-toolbar"><div className="event-sort" role="group" aria-label="内容范围">{[[true,'精选','Selected'],[false,'全部相关动态','All relevant updates']].map(([value,zh,en])=><button key={String(value)} className={selectedOnly===value?'selected':''} aria-pressed={selectedOnly===value} onClick={()=>setSelectedOnly(value as boolean)}>{t(zh as string,en as string)} {value?selected.length:related.length}</button>)}</div>
   <div className="event-sort" role="group" aria-label="资讯排序">{[['score','推荐'],['date','最新'],['heat','热度']].map(([key,label])=><button key={key} className={sort===key?'selected':''} aria-pressed={sort===key} onClick={()=>setSort(key)}>{key==='heat'&&<Flame size={14}/>} {t(label)}</button>)}</div>
   <label><ListFilter size={14}/><select aria-label="按来源层级筛选" value={tier} onChange={e=>setTier(e.target.value)}><option value="all">{t('全部来源层级')}</option>{(Object.keys(tierLabels) as SourceTier[]).map(key=><option value={key} key={key}>{t(tierLabels[key])}</option>)}</select></label>
   <button aria-pressed={savedOnly} className={savedOnly?'selected':''} onClick={()=>setSavedOnly(!savedOnly)}><Bookmark size={14}/>{t('收藏')}</button>
   <label className="event-toggle"><input type="checkbox" checked={unreadOnly} onChange={e=>setUnreadOnly(e.target.checked)}/>{t('只看未读')}</label>
   <label className="event-toggle"><input type="checkbox" checked={numbersOnly} onChange={e=>setNumbersOnly(e.target.checked)}/>{t('含量化信息')}</label>
  </div>
  <p className="selection-explanation">{selectedOnly?t('精选：摘要与来源达到门槛（官方政策原文可仅有标题）；每个发布方最多 2 条，最多 12 个事件。','Selected: source and material thresholds; at most 2 per publisher and 12 events.'):t('全部相关动态：保留所有通过主题检查的报道，包括标题快讯和社区讨论。','All relevant reports, including short alerts and community discussions.')}</p><div className="event-topics"><button className={topic==='all'?'selected':''} onClick={()=>setTopic('all')}>{t('全部主题')}</button>{topicList.map(([name])=><button className={topic===name?'selected':''} key={name} onClick={()=>setTopic(name)}>{t(name)}</button>)}</div>
  <div className="event-list">{filtered.slice(0,limit).map((event,index)=>{
   const n=event.primary,saved=isSaved(event),readBefore=isRead(event);
   return <article key={event.id} className={'event-card '+(index===0&&sort==='score'?'event-lead ':'')+(readBefore?'event-read':'')}>
    <div className="event-number">{String(index+1).padStart(2,'0')}</div><div className="event-card-body">
     <div className="event-meta"><span className={'source-tier tier-'+sourceTier(n)}>{t(tierLabels[sourceTier(n)])}</span><span>{t(scope==='world'?(worldTopic(n)||'其他动态'):n.type)}</span><time dateTime={event.latestDate}>{moment(event.latestDate)}</time>{n.stale&&<em><Localized value={"旧缓存"}/> </em>}{n.historical&&<em><Localized value={"资料库"}/> </em>}{readBefore&&<span><Check size={12}/><Localized value={"已读"}/> </span>}</div>
     <h3><a href={n.url} target="_blank" rel="noreferrer" onClick={()=>read(event)}><BilingualText text={n.title}/></a><ArrowUpRight size={17} aria-hidden/></h3>
     <p className="event-summary"><BilingualText text={n.summary||'订阅源仅提供标题；尚无可用摘要，请打开原文核对。'}/></p>
     <div className="event-reasons">{scoreReasons(n).map(reason=><span key={reason}>{t(reason)}</span>)}<span>{event.sourceCount}<Localized value={"个关联来源"}/> </span>{sort==='heat'&&<span title="48 小时内同一来源只计一次，24 小时权重减半"><Flame size={12}/>{event.heat}<Localized value={"热度"}/> </span>}</div>
     <div className="event-bottom"><small>{n.source}<Localized value={"· 原始订阅摘要 · 优先级"}/> {event.score}</small><button className={saved?'selected':''} onClick={()=>save(event)} aria-pressed={saved} aria-label={(saved?'取消收藏 ':'收藏 ')+n.title}><Bookmark size={15}/>{saved?t('已收藏'):t('收藏')}</button></div>
     <details className="event-sources"><summary><Localized value={"来源与报道时间线 ·"}/> {event.reports.length}<Localized value={"篇"}/> </summary><button className="event-timeline-sort" onClick={()=>setAscending(!ascending)}><Localized value={ascending?'改为最新在前':'改为最早在前'}/></button>{(ascending?[...event.reports].reverse():event.reports).map(report=><div key={report.url}><time>{moment(report.date)}</time><a href={report.url} target="_blank" rel="noreferrer" onClick={()=>read(event)}>{report.source} · {report.title}<ArrowUpRight size={12}/></a><small>{tierLabels[sourceTier(report)]}<Localized value={report.stale?' · 旧缓存':''}/></small></div>)}</details>
    </div>
   </article>;
  })}</div>
  {!filtered.length&&<div className="editorial-empty"><Localized value={loading&&!savedOnly?'正在采集公开来源，成功后自动显示。':'暂无匹配事件，可扩大时间范围、切换来源层级或取消未读筛选。'}/></div>}
  {filtered.length>limit&&<button className="editorial-more" onClick={()=>setLimit(n=>n+pageSize)}><Localized value={"加载更多（"}/> {limit} / {filtered.length}<Localized value={"个事件）"}/> </button>}
  <details className="event-method"><summary><Localized value={"筛选方法与阅读备份"}/> </summary><p><Localized value={"精选要求有来源摘要和足够的资料优先级，专业栏目标题直接相关；最多12个事件、同一发布方最多2条。社区热议仅进入全部相关动态。先按标题与摘要核验领域相关性；来源名称与订阅栏目不作为相关性证据。世界主题优先依据标题，摘要仅在标题无法分类时补充，标签与筛选共用同一分类结果。通过后再按原文时效、来源域名、资料类型和摘要完整度计算，不是事实真实性评级。链接先去除追踪参数，再保守合并近似标题；不同版本号、季度或量化结果保留为独立进展。含量化信息仅按关键词筛选。热度仅统计本站已采集报道：48 小时内每个关联来源只计一次，24 小时权重减半。预印本不等于同行评审，厂商说明不等于独立评测。"}/> </p><p><Localized value={"收藏与阅读记录只保存在当前浏览器，最多保存 200 条收藏。备份文件可在其他设备导入，导入不会覆盖已有记录。"}/> </p><div><button onClick={backup}><Download size={14}/><Localized value={"导出阅读备份"}/> </button><button onClick={()=>importRef.current?.click()}><Upload size={14}/><Localized value={"导入备份"}/> </button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)void restore(f);}}/></div></details>
  {notice&&<p role="status" className="editorial-message">{notice}</p>}
 </section>;
}
