'use client';
import {useCallback,useEffect,useMemo,useRef,useState,memo} from 'react';
import {ArrowLeft,ArrowUpRight,CalendarDays,Check,ChevronLeft,ChevronRight,Clock3,Download,Globe2,History,RefreshCw,ShieldCheck,TrendingUp} from 'lucide-react';
import {BilingualText,LanguageSwitch,useLanguage} from './language';
import {categoryNames,type CalendarEvent,type CalendarPayload,type CalendarCategory} from '@/lib/calendar/types';
import {beijingDay,addDays} from '@/lib/calendar/time';
import {useReaderPreferences} from './reader-preferences';
import {calendarTitle,eventsOnDay} from '@/lib/calendar/presentation';
import './global-calendar.css';
type Moved=CalendarEvent&{formerDay:string};
type Payload=CalendarPayload&{months:string[];moved:Moved[];truncated:boolean;rawCount:number;mergedCount:number};
type Version={sequence:number;recorded_at:string;day:string;payload:CalendarEvent};
const statusNames={scheduled:['已排期','Scheduled'],tentative:['暂定','Tentative'],published:['已有官方材料','Official material available'],cancelled:['已取消','Cancelled']} as const;
const formatAt=(s?:string)=>s?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(s)):'—';
const timeLabel=(e:CalendarEvent)=>e.startAt?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(e.startAt)):'';
export const GlobalCalendar=memo(function GlobalCalendar({embedded=false,active:visible=true,onBack,query=''}:{embedded?:boolean;active?:boolean;onBack?:()=>void;query?:string}){
 const {t}=useLanguage(),{preferences}=useReaderPreferences();
 const [today,setToday]=useState(beijingDay()),[mode,setMode]=useState<'future'|'past'>('future'),[month,setMonth]=useState(beijingDay().slice(0,7));
 const [data,setData]=useState<Payload|null>(null),[selectedDay,setSelectedDay]=useState(beijingDay()),[selectedId,setSelectedId]=useState('');
 const [category,setCategory]=useState('all'),[region,setRegion]=useState('all'),[major,setMajor]=useState(false),[sourcePanel,setSourcePanel]=useState(false);
 const [loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[progress,setProgress]=useState(0),[refreshTotal,setRefreshTotal]=useState(0),[error,setError]=useState(''),[detail,setDetail]=useState<{event:CalendarEvent;versions:Version[]}|null>(null),[checking,setChecking]=useState(false);
 const visibleRef=useRef(visible);visibleRef.current=visible;
 const cache=useRef(new Map<string,Payload>()),inflight=useRef(new Map<string,Promise<Payload|null>>());
 const active=useRef(false),detailRequest=useRef(0),range=useRef({mode,month});range.current={mode,month};
 const load=useCallback(async()=>{
  const {mode,month}=range.current,key=mode==='past'?'month:'+month:'future:'+beijingDay();
  const existing=inflight.current.get(key);if(existing)return existing.then(json=>{if(json&&range.current.mode===mode&&(mode==='future'||range.current.month===month)){setData(json);setToday(json.today);}return json;});
  const pending=(async()=>{
   const response=await fetch('/api/calendar'+(mode==='past'?'?month='+month:''),{cache:'no-store',signal:AbortSignal.timeout(20000)});
   if(response.status===401){location.assign('/auth/login?returnTo='+encodeURIComponent('/?domain=aidc&view=calendar'));return null;}
   const json=await response.json() as Payload&{error?:string};if(!response.ok)throw Error(json.error||'读取失败');
   cache.current.set(key,json);if(cache.current.size>6)cache.current.delete(cache.current.keys().next().value!);
   if(range.current.mode===mode&&(mode==='future'||range.current.month===month)){setData(json);setToday(json.today);}return json as Payload;
  })().finally(()=>inflight.current.delete(key));inflight.current.set(key,pending);return pending;
 },[]);
 const refresh=useCallback(async(force=false,snapshot?:Payload|null)=>{
  if(active.current||!visibleRef.current)return;active.current=true;setRefreshing(true);setError('');setProgress(0);
  try{
   snapshot=snapshot||await load();if(!snapshot)return;
   const due=snapshot.sources.filter(s=>force||!s.state?.attempted_at||Date.now()-Date.parse(s.state.attempted_at)>15*60000);
   setRefreshTotal(due.length);
   for(let i=0;i<due.length&&visibleRef.current;i+=3){
    const response=await fetch('/api/calendar/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sources:due.slice(i,i+3).map(s=>s.id),force}),signal:AbortSignal.timeout(60000)});
    if(!response.ok){const body=await response.json() as {error?:string};throw Error(body.error||'来源更新失败');}
    setProgress(Math.min(i+3,due.length));await load();
   }
  }catch(e){setError(e instanceof Error?e.message:'更新失败，保留已存事件。');}
  finally{setRefreshing(false);active.current=false;setLoading(false);}
 },[load]);
 // One snapshot request per activation/range. Hidden calendars retain their state.
 useEffect(()=>{
  if(!visible)return;let alive=true;
  const key=mode==='past'?'month:'+month:'future:'+beijingDay(),saved=cache.current.get(key);
  setData(saved||null);setLoading(!saved);
  void load().then(snapshot=>{if(alive&&preferences.autoRefresh)void refresh(false,snapshot);}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});
  return()=>{alive=false;};
 },[visible,mode,month,load,refresh,preferences.autoRefresh]);
 useEffect(()=>{setSelectedId('');setDetail(null);detailRequest.current++;setSelectedDay(mode==='future'?today:month===today.slice(0,7)?today:month+'-01');},[mode,month,today]);
 useEffect(()=>{const onVisible=()=>{if(preferences.autoRefresh&&visibleRef.current&&document.visibilityState==='visible')void refresh(false);};document.addEventListener('visibilitychange',onVisible);return()=>document.removeEventListener('visibilitychange',onVisible);},[refresh,preferences.autoRefresh]);
 const filtered=useMemo(()=>(data?.events||[]).filter(e=>(category==='all'||e.category===category)&&(region==='all'||(region==='中国'?e.region==='中国':e.region!=='中国'))&&(!major||e.importance==='major')&&(!query.trim()||[e.title,calendarTitle(e),e.summary,e.country,e.sourceName,...(e.relatedEvents||[]).map(member=>member.title)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))).sort((a,b)=>a.day.localeCompare(b.day)||(a.startAt||'99').localeCompare(b.startAt||'99')||Number(b.importance==='major')-Number(a.importance==='major')),[data,category,region,major,query]);
 const days=useMemo(()=>{if(mode==='future')return Array.from({length:7},(_,i)=>addDays(today,i));const start=month+'-01',count=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();return Array.from({length:count},(_,i)=>addDays(start,i));},[mode,month,today]);
 const dayEvents=eventsOnDay(filtered,selectedDay),moved=(data?.moved||[]).filter(e=>e.formerDay===selectedDay);
 const selectedGroup=data?.events.find(e=>e.id===selectedId||e.relatedEvents?.some(member=>member.id===selectedId));
 const selected=detail?.event||selectedGroup;
 function closeDetail(){setSelectedId('');setDetail(null);detailRequest.current++;}
 async function openEvent(e:CalendarEvent){
  const id=++detailRequest.current;setSelectedId(e.id);setDetail({event:e,versions:[]});setChecking(true);
  const read=async()=>{const response=await fetch('/api/calendar?id='+e.id,{cache:'no-store',signal:AbortSignal.timeout(20000)});const body=await response.json() as {event:CalendarEvent;versions:Version[];error?:string};if(!response.ok)throw Error(body.error);if(id===detailRequest.current)setDetail(body);};
  // Show the stored record and history independently of slow external verification.
  const initial=read().catch(err=>{if(id===detailRequest.current)setError(String(err.message));});
  try{
   const check=await fetch('/api/calendar/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:e.id}),signal:AbortSignal.timeout(90000)});
   if(!check.ok)throw Error('单条事件核验失败，请稍后再试。');
   const checked=await check.json() as {warning?:string};if(checked.warning&&id===detailRequest.current)setError(t('本次来源核验失败，保留已存记录：','Source check failed; keeping stored record: ')+checked.warning);
   await initial;if(id===detailRequest.current){await read();await load();}
  }catch(err){if(id===detailRequest.current)setError(err instanceof Error?err.message:'单条核验失败，保留已有记录。');}finally{if(id===detailRequest.current)setChecking(false);}
 }
 function changeMode(next:'future'|'past'){setMode(next);setCategory('all');setRegion('all');}
 function moveMonth(delta:number){const date=new Date(month+'-15T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+delta);const next=date.toISOString().slice(0,7);if(next>='2026-11'&&next<=today.slice(0,7))setMonth(next);}
 function download(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Atlas-Calendar-'+(mode==='past'?month:today)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const hasFailures=data?.sources.some(s=>s.state?.ok===0&&s.state?.attempted_at);
 return <div className={"global-calendar"+(embedded?" gc-embedded":"")}>
  {!embedded&&<header className="gc-header"><a href="/?domain=aidc&view=world" className="gc-back"><ArrowLeft size={17}/>{t('世界热点','World briefing')}</a><a href="/" className="gc-brand">知域 <span>ATLAS</span></a><LanguageSwitch/></header>}
  <div className="gc-shell">
   <div className="gc-titlebar"><div><h1><CalendarDays size={21}/>{t('环球日历','Global calendar')}</h1><span>{t('未来一周 · 2026.11 起归档','One week ahead · archive from Nov 2026')}</span></div><div><small>{t('北京时间 UTC+8','Beijing UTC+8')}</small>{embedded&&<button className="gc-back-button" onClick={onBack}><ArrowLeft size={14}/>{t('世界热点','World briefing')}</button>}</div></div>
   <div className="gc-controlbar"><div className="gc-mode"><button aria-pressed={mode==='future'} onClick={()=>changeMode('future')}><CalendarDays size={16}/>{t('未来七天','Next 7 days')}</button><button aria-pressed={mode==='past'} onClick={()=>changeMode('past')}><History size={16}/>{t('往期追溯','Archive')}</button></div><div className="gc-control-actions"><button onClick={()=>setSourcePanel(!sourcePanel)} aria-expanded={sourcePanel}><Globe2 size={15}/>{t('来源与覆盖','Sources')} {data?.sources.filter(s=>s.state?.ok===1).length||0}/{data?.sources.length||'—'}</button><button onClick={()=>void refresh(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing?'gc-spin':''}/>{refreshing?t('正在核验','Checking')+' '+progress+'/'+refreshTotal:t('核验更新','Check updates')}</button><button onClick={download} disabled={!data} aria-label={t('导出当前日历','Export current calendar')}><Download size={16}/></button></div></div>
   {error&&<div className="gc-alert" role="alert">{error}</div>}
   {sourcePanel&&<section className="gc-sources"><h2>{t('实际来源覆盖','Actual source coverage')}</h2><p>{t('下方状态表示排期核验结果，不代表每个国家或公司都有日程。零条记录与采集失败分别标注。','States describe schedule checks, not universal coverage. Zero entries and failed fetches are distinct.')}</p><div>{data?.sources.map(s=><article key={s.id}><div><a href={s.url} target="_blank" rel="noreferrer">{s.name}<ArrowUpRight size={13}/></a><span>{s.level==='official'?t('官方','Official'):t('机构日历','Institutional')}</span></div><p><BilingualText text={s.note}/></p><small>{!s.state?.attempted_at?t('待核验','Pending'):s.state.ok?(s.state.error?t('备用快照','Fallback snapshot'):t('成功','Checked'))+' · '+s.state.count+' '+t('条已归档排期','archived schedules'):t('失败','Failed')+' · '+s.state.error}</small>{s.state?.ok===1&&s.state.error&&<small>{s.state.error}</small>}<small>{t('上次成功','Last success')} {formatAt(s.state?.success_at||undefined)}</small></article>)}</div></section>}
   <div className="gc-period"><div><h2>{mode==='future'?today.replaceAll('-','.')+' — '+addDays(today,6).slice(5).replace('-','.'):month.replace('-',' / ')}</h2></div>{mode==='past'?<div className="gc-month"><button onClick={()=>moveMonth(-1)} disabled={month==='2026-11'} aria-label={t('上个月','Previous month')}><ChevronLeft size={18}/></button><input type="month" min="2026-11" max={today.slice(0,7)} value={month} aria-label={t('历史月份','Archive month')} onChange={e=>{if(e.target.value>='2026-11'&&e.target.value<=today.slice(0,7))setMonth(e.target.value);}}/><button onClick={()=>moveMonth(1)} disabled={month>=today.slice(0,7)} aria-label={t('下个月','Next month')}><ChevronRight size={18}/></button></div>:<span className="gc-range-count">{filtered.length} {t('个事件','events')} · {days.filter(day=>eventsOnDay(filtered,day).length>0).length}/{days.length} {t('天有安排','days covered')}{!!data?.mergedCount&&<small> · {t('已合并','Merged')} {data.mergedCount} {t('条重复或关联安排','duplicate / related entries')}</small>}</span>}</div>
   <div className="gc-filters"><div>{[['all','全部'],...Object.entries(categoryNames).map(([key,value])=>[key,value[0]])].map(([key,label])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{key==='all'?t('全部','All'):t(...categoryNames[key as CalendarCategory])}</button>)}</div><div><div className="gc-region" aria-label={t('地区','Region')}>{[['all',t('全球','Global')],['中国',t('中国','China')],['其他',t('国际','International')]].map(([key,label])=><button key={key} aria-pressed={region===key} onClick={()=>setRegion(key)}>{label}<small>{(data?.events||[]).filter(e=>key==='all'||(key==='中国'?e.region==='中国':e.region!=='中国')).length}</small></button>)}</div><label><input type="checkbox" checked={major} onChange={e=>setMajor(e.target.checked)}/>{t('只看重大','Major only')}</label></div></div>
   <div className={'gc-grid '+(mode==='past'?'gc-month-grid':'gc-week-grid')} aria-label={t('事件日历','Event calendar')}>
    {mode==='past'&&Array.from({length:(new Date(month+'-01T12:00Z').getUTCDay()+6)%7},(_,i)=><div className="gc-pad" key={'pad'+i}/>)}
    {days.map(day=>{const events=eventsOnDay(filtered,day),ongoing=events.filter(e=>e.day<day).length,futureArchive=mode==='past'&&day>today;return <button key={day} className={'gc-date '+(day===today?'gc-today':'')} disabled={futureArchive} aria-pressed={selectedDay===day} onClick={()=>{setSelectedDay(day);setSelectedId('');setDetail(null);detailRequest.current++;}}><span className="gc-date-top"><small>{new Intl.DateTimeFormat('zh-CN',{weekday:'short',timeZone:'UTC'}).format(new Date(day+'T12:00Z'))}</small>{day===today&&<em>{t('今天','Today')}</em>}</span><b>{Number(day.slice(8))}</b><div className="gc-cell-events">{events.slice(0,3).map(e=><span key={e.id} className={'gc-cell-item gc-cat-'+e.category}>{e.day<day&&<em>{t('持续','Ongoing')}</em>}<BilingualText text={calendarTitle(e)}/></span>)}{events.length>3&&<small>+{events.length-3} {t('项','more')}</small>}</div><span className="gc-day-count">{events.length?events.length+' '+t('项','events'):'—'}{ongoing>0&&<small> · {ongoing} {t('项持续中','ongoing')}</small>}</span>{!events.length&&<span className="gc-cell-empty">{futureArchive?'—':loading&&!data?t('读取中…','Loading…'):t('暂无已核验排期','No verified entries')}</span>}</button>})}
   </div>

   <div className={'gc-content '+(selected?'gc-has-detail':'')}><section className="gc-agenda"><div className="gc-section-title"><h2>{selectedDay.slice(5).replace('-',' / ')} <span>{t('当日大事','Daily agenda')}</span></h2><small>{dayEvents.length} {t('项','events')}</small></div>
    {loading&&!data?<p className="gc-empty">{t('正在读取日历…','Loading calendar…')}</p>:!dayEvents.length&&!moved.length?<div className="gc-empty"><CalendarDays size={28}/><p>{t('当前筛选下暂无已核验事件','No verified events match these filters.')}</p><small>{hasFailures?t('部分来源核验失败，可展开来源与覆盖查看。','Some feeds failed. Check source coverage.'):t('此处为空不代表当天没有全球事件。','An empty day does not prove no events are scheduled.')}</small></div>:null}
    {dayEvents.map(e=><button key={e.id} className={'gc-event '+(selectedId===e.id?'gc-event-active':'')} onClick={()=>void openEvent(e)}><div className="gc-event-time">{timeLabel(e)||t('时间未定','Time TBC')}<small>{e.startAt?'UTC+8':t('原站日期','Source date')}</small></div><div className="gc-event-body"><div className="gc-event-tags"><span className={'gc-category gc-cat-'+e.category}>{t(...categoryNames[e.category])}</span><span>{e.country}</span>{e.endDay&&e.endDay!==e.day&&<span>{e.day.slice(5)} — {e.endDay.slice(5)}</span>}{e.importance==='major'&&<span><TrendingUp size={11}/>{t('重大','Major')}</span>}</div><h3><BilingualText text={calendarTitle(e)}/></h3><div className="gc-event-foot">{e.day<selectedDay&&<span className="gc-ongoing">{t('持续中','Ongoing')}</span>}{!!e.relatedEvents?.length&&<span>{t('含关联安排','Related entries')} +{e.relatedEvents.length}</span>}<span>{e.sourceName}</span><span>{t(statusNames[e.status][0],statusNames[e.status][1])}</span></div></div><ChevronRight size={16}/></button>)}
    {moved.map(e=><button className="gc-moved" key={e.id+e.formerDay} onClick={()=>void openEvent(e)}><History size={15}/><span><BilingualText text={e.title}/><small>{t('已改期至','Moved to')} {e.day}</small></span></button>)}
   </section>
   <aside className="gc-detail" aria-live="polite" hidden={!selected}>{selected?<><div className="gc-detail-eyebrow"><button className="gc-detail-close" onClick={closeDetail} aria-label={t('关闭事件档案','Close event record')}>×</button><span>{t('事件档案','EVENT RECORD')}</span><span>{checking?<><RefreshCw size={12} className="gc-spin"/>{t('核验最新进展','Checking updates')}</>:<><Check size={12}/>{t('已读取档案','Record loaded')}</>}</span></div><h2><BilingualText text={selected.title}/></h2><div className="gc-detail-facts"><span><Clock3 size={14}/>{selected.day} {timeLabel(selected)||t('具体时刻未公布','Exact time unannounced')}</span><span>{t('原始安排','Original schedule')}: {selected.originalDate} · {selected.timezone}</span><span><ShieldCheck size={14}/>{selected.certainty==='official'?t('官方排期','Official schedule'):selected.certainty==='institutional'?t('机构日历 · 待当地官方复核','Institutional calendar · official verification needed'):t('暂定日期','Tentative date')}</span></div><p className="gc-detail-summary"><BilingualText text={selected.summary}/></p><div className="gc-result"><h3>{t('最新进展','Latest progress')}</h3><p><BilingualText text={selected.result||(selected.status==='cancelled'?'来源已明确取消此事件。':selected.day<today?'计划日期已过，结果尚待核实；不自动视为已完成。':'按来源公布的计划等待发生；日期可能调整。')}/></p>{selected.resultUrl&&<a href={selected.resultUrl} target="_blank" rel="noreferrer">{t('查看发布材料','Release materials')}<ArrowUpRight size={13}/></a>}</div><div className="gc-original-links"><a href={selected.url} target="_blank" rel="noreferrer">{t('事件原始依据','Original event source')}<ArrowUpRight size={14}/></a><a href={selected.sourceUrl} target="_blank" rel="noreferrer">{t('来源日历','Source calendar')}<ArrowUpRight size={14}/></a></div>{selectedGroup?.relatedEvents&&<details className="gc-related"><summary>{t('关联安排与原始记录','Activities and source records')} · {1+selectedGroup.relatedEvents.length}</summary>{[selectedGroup,...selectedGroup.relatedEvents].map(member=><button key={member.id} onClick={()=>void openEvent(member)}><span><BilingualText text={member.title}/></span><small>{timeLabel(member)||t('时刻未定','Time TBC')} · {member.sourceName}</small></button>)}</details>}<h3 className="gc-history-title"><History size={15}/>{t('变更追溯','Revision history')}</h3><div className="gc-timeline">{detail?.versions.length?detail.versions.map((v,i)=><div key={v.sequence}><small>{formatAt(v.recorded_at)}</small><p>{i===detail.versions.length-1?t('首次收录','First recorded'):t('资料更新','Record updated')} · {v.payload.day} {v.payload.startAt?timeLabel(v.payload):t('时刻未定','Time TBC')} · {t(statusNames[v.payload.status][0],statusNames[v.payload.status][1])}</p>{v.payload.result&&<small><BilingualText text={v.payload.result}/></small>}</div>):<p className="gc-note">{t('正在读取修改记录…','Loading revision history…')}</p>}</div><div className="gc-detail-check"><span>{t('最近核验','Last verified')} {formatAt(selected.lastChecked)}</span><span>{t('首次收录','First recorded')} {formatAt(selected.firstSeen)}</span></div></>:<div className="gc-detail-placeholder"><Globe2 size={38}/><h3>{t('每个日期，都有来历。','Every date has a source.')}</h3><p>{t('点击一项事件，核验原始安排、查看最新进展，并追溯每一次改期与资料更新。','Open an event to verify its schedule, inspect progress and follow revisions.')}</p></div>}</aside>
   </div>
   <details className="gc-notes"><summary>{t('时间口径、归档与参考日历','Time, archives & reference calendars')}</summary><p><a href="https://www.consilium.europa.eu/en/meetings/calendar/" target="_blank" rel="noreferrer">{t('欧盟理事会官方日历 ↗','EU Council official calendar ↗')}</a> · {t('自动采集访问受限，仅作参考入口，不计入自动来源。','Automated access restricted; reference link only, excluded from automatic source counts.')}</p><p>{t('历史从 2026 年 11 月起持续保存，不设置滚动删除期限；历史补录仅包括能够核验到的记录，并非完整全球档案。','Records persist from November 2026 without rolling deletion. Historical backfill includes verifiable entries, not a complete global archive.')}</p><p>{t('精确时刻转换为北京时间；只有日期的排期保留原站日期。重大标签用于阅读排序，不代表投资建议或结果预测。','Exact timestamps use Beijing time. Date-only schedules retain their source date. Major labels indicate reading priority, not forecasts.')}</p></details>
  </div>
 </div>;
},(previous,next)=>previous.active===false&&next.active===false);
