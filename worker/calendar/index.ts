import {groupCalendarEvents} from '../../lib/calendar/presentation.ts';
import {nbsResultLink,resultEvidence} from './results.ts';
import {calendarSources} from '../../lib/calendar/sources.ts';
import {parseCalendar,calendarEvent,clean,englishDate,governmentPolicy} from '../../lib/calendar/parsers.ts';
import {beijingDay,addDays,calendarWindow,ARCHIVE_START,localInstant} from '../../lib/calendar/time.ts';
import type {CalendarEvent,CalendarSource} from '../../lib/calendar/types';
import {boundedText,boundedJson} from '../../lib/http-safety.ts';
import {saveEvents,states,fromRow} from './store.ts';
import {listEvents} from './store.ts';
export type CalendarEnv={CALENDAR_DB?:WorkerBindings['CALENDAR_DB']};
async function sourceText(url:string,allowed:string[]){
 const target=new URL(url);if(!allowed.includes(target.origin)||target.protocol!=='https:')throw Error('来源地址不在允许范围');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
 try{
  let current=target;
  for(let redirects=0;redirects<4;redirects++){
   const r=await fetch(current,{redirect:'manual',signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; AtlasCalendar/1.0; public schedules)','Accept':'text/html,application/json,text/calendar,application/rss+xml;q=0.9'}});
   if(r.status>=300&&r.status<400){const next=new URL(r.headers.get('Location')||'',current);if(next.origin!==target.origin)throw Error('来源重定向到其他站点');current=next;continue;}
   if(!r.ok)throw Error('HTTP '+r.status);return await boundedText(r,2500000);
  }
  throw Error('来源重定向次数过多');
 }finally{clearTimeout(timer);}
}
async function enrichQ4(events:CalendarEvent[],source:CalendarSource){
 const candidate=events.filter(e=>e.day>=addDays(beijingDay(),-31)).slice(0,3);
 for(const e of candidate){try{
  const raw=await sourceText(e.url,[new URL(source.url).origin]);
  const date=englishDate(clean(raw.match(/class="module_date-text"[^>]*>([\s\S]*?)<\/span>/i)?.[1]||''));
  const tm=clean(raw.match(/class="module_time-text"[^>]*>([\s\S]*?)<\/span>/i)?.[1]||'').match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(EST|EDT|ET|PST|PDT|PT|GMT|UTC)/i);
  if(date&&tm){const hour=Number(tm[1])%12+(tm[3].toUpperCase()==='PM'?12:0),time=String(hour).padStart(2,'0')+':'+tm[2],zone=/^E/.test(tm[4])?'America/New_York':/^P/.test(tm[4])?'America/Los_Angeles':'UTC';e.startAt=localInstant(date,time,zone);e.day=beijingDay(e.startAt);e.originalDate=date+' '+time;e.timezone=zone;}
 }catch{/* Retain date-only listing if the details are unavailable. */}}
}
async function collect(source:CalendarSource){
 let url=source.url;
 if(source.parser==='eurostat'){const today=beijingDay();url=new URL('/eurostat/o/calendars/eventsJson',source.url).href+'?start='+encodeURIComponent(ARCHIVE_START+'T00:00:00+01:00')+'&end='+encodeURIComponent(addDays(today,90)+'T00:00:00+01:00')+'&isEuroindicator=true';}
 let raw:string;
 try{raw=await sourceText(url,[new URL(source.url).origin]);}
 catch(error){
  if(source.id!=='bls')throw error;
  // Public BLS-maintained alternate host, not a third-party proxy.
  raw=await sourceText('https://blsmon1.bls.gov/schedule/news_release/bls.ics',['https://blsmon1.bls.gov']);
 }
 if(source.parser==='gov-policy'){
  if(!/<rss\b/i.test(raw))throw Error('政府政策订阅格式变化');
  const links=[...raw.matchAll(/<link>\s*(https:\/\/www\.gov\.cn\/zhengce\/content\/[^<]+)<\/link>/gi)].map(m=>m[1]);
  const events=(await Promise.all([...new Set(links)].slice(0,6).map(async link=>{
   const page=await sourceText(link,['https://www.gov.cn']);return governmentPolicy(page,source,link);
  }))).flat();return events.filter(e=>e.day>=ARCHIVE_START);
 }
 let events=parseCalendar(raw,source);
 if(!events.length&&!/<rss\b/i.test(raw))throw Error('未识别到有效日程，需核查源站格式');
 if(source.parser==='q4')await enrichQ4(events,source);
 // Upcoming FOMC minutes are separately stated by the Fed; do not infer them from a fixed recurrence.
 if(source.id==='fed'){
  try{const page=await sourceText('https://www.federalreserve.gov/monetarypolicy.htm',['https://www.federalreserve.gov']);const upcoming=page.split('Upcoming Dates')[1]?.split('Monetary Policy Principles')[0]||'';for(const m of clean(upcoming).matchAll(/(Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+(\d{1,2})\s+FOMC Minutes\s+Meeting of\s+([A-Za-z.]+)\s+(\d{1,2})-(\d{1,2})/gi)){const year=new Date().getUTCFullYear(),day=englishDate(m[1].replace('.','')+' '+m[2],year),meetingMonth=englishDate(m[3].replace('.','')+' '+m[4],year).slice(5,7);if(day)events.push(calendarEvent(source,`minutes-${year}-${Number(meetingMonth)}`,'FOMC 会议纪要 / Meeting minutes',day));}}catch{/* Main calendar remains useful. */}
 }
 return events;
}
export async function refreshSources(db:D1Database,ids:string[],force=false){
 return await Promise.all(ids.map(async id=>{
  const source=calendarSources.find(s=>s.id===id);if(!source)return {id,ok:false,error:'未知来源'};
  const now=new Date().toISOString(),owner=crypto.randomUUID(),ms=Date.now();
  // DB lease coalesces browser/cron work; force still honors a 30-second minimum.
  const lease=await db.prepare('INSERT INTO calendar_source_state(source_id,lease_until,lease_owner) VALUES(?,?,?) ON CONFLICT(source_id) DO UPDATE SET lease_until=excluded.lease_until,lease_owner=excluded.lease_owner WHERE calendar_source_state.lease_until<? AND (calendar_source_state.attempted_at IS NULL OR calendar_source_state.attempted_at<?)').bind(id,ms+90000,owner,ms,new Date(ms-(force?30000:900000)).toISOString()).run();
  if(!lease.meta.changes)return {id,skipped:true};
  try{
   const events=await collect(source),changed=await saveEvents(db,events,now);
   await db.prepare('UPDATE calendar_source_state SET attempted_at=?,success_at=?,ok=1,count=?,error=NULL,lease_until=0,lease_owner=NULL WHERE source_id=? AND lease_owner=?').bind(now,now,events.length,id,owner).run();
   console.log(JSON.stringify({event:'calendar_source',id,ok:true,count:events.length,changed}));return {id,ok:true,count:events.length,changed};
  }catch(error){
   if(id==='bls'){
    const recent=await db.prepare('SELECT success_at,count FROM calendar_source_state WHERE source_id=?').bind(id).first<{success_at:string|null;count:number}>();
    if(recent?.success_at&&Date.now()-Date.parse(recent.success_at)<3600000){
     const warning='云端直连受限，使用独立核验任务最近成功同步的官方快照。';
     await db.prepare('UPDATE calendar_source_state SET attempted_at=?,ok=1,error=?,lease_until=0,lease_owner=NULL WHERE source_id=? AND lease_owner=?').bind(now,warning,id,owner).run();
     return {id,ok:true,cached:true,count:recent.count,warning};
    }
   }
   const message=error instanceof Error?error.message.slice(0,160):'采集失败';await db.prepare('UPDATE calendar_source_state SET attempted_at=?,ok=0,error=?,lease_until=0,lease_owner=NULL WHERE source_id=? AND lease_owner=?').bind(now,message,id,owner).run();console.warn(JSON.stringify({event:'calendar_source',id,ok:false,error:message}));return {id,ok:false,error:message};}
 }));
}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function calendarApi(request:Request,env:CalendarEnv){
 const db=env.CALENDAR_DB;if(!db)return json({error:'日历存储未配置。'},503);
 const url=new URL(request.url);
 try{
  if(request.method==='POST'&&url.pathname==='/api/calendar/check'){
   const body=await boundedJson(request),id=typeof body.id==='string'?body.id:'';
   if(!/^[a-f0-9]{64}$/.test(id))return json({error:'事件编号无效。'},400);
   let row=await db.prepare('SELECT * FROM calendar_events WHERE id=?').bind(id).first<Parameters<typeof fromRow>[0]>();if(!row)return json({error:'事件不存在。'},404);
   const checks=await refreshSources(db,[fromRow(row).sourceId],true);
   const sourceError=checks.find(r=>'error' in r)?.error;
   row=await db.prepare('SELECT * FROM calendar_events WHERE id=?').bind(id).first<Parameters<typeof fromRow>[0]>();
   if(row){const event=fromRow(row);if(event.day<=beijingDay()){
    try{
     let resultUrl=event.resultUrl;
     if(event.sourceId==='nbs'){const index=await sourceText('https://www.stats.gov.cn/sj/zxfb/',['https://www.stats.gov.cn']);resultUrl=nbsResultLink(index,event)||undefined;}
     const allowed=['https://www.bls.gov','https://www.stats.gov.cn'];
     if(resultUrl&&allowed.includes(new URL(resultUrl).origin)){
      const page=await sourceText(resultUrl,allowed),evidence=resultEvidence(page,event);
      if(evidence){const {firstSeen:_f,lastChecked:_l,updatedAt:_u,revision:_r,...current}=event;await saveEvents(db,[{...current,result:evidence.text,resultUrl,status:'published'}],new Date().toISOString());}
     }
    }catch(e){console.warn(JSON.stringify({event:'calendar_result_check',id,error:String(e)}));}
   }}
   return json({ok:true,warning:sourceError||null});
  }
  if(request.method==='POST'&&url.pathname==='/api/calendar/refresh'){
   const body=await boundedJson(request),ids=Array.isArray(body.sources)?body.sources:[];
   if(ids.length<1||ids.length>3||ids.some(x=>typeof x!=='string'||!calendarSources.some(s=>s.id===x)))return json({error:'每次请选择 1–3 个有效来源。'},400);
   return json({results:await refreshSources(db,[...new Set(ids)] as string[],body.force===true)});
  }
  if(request.method!=='GET')return json({error:'不支持的请求方法。'},405);
  const id=url.searchParams.get('id');
  if(id){
   if(!/^[a-f0-9]{64}$/.test(id))return json({error:'事件编号无效。'},400);
   const row=await db.prepare('SELECT * FROM calendar_events WHERE id=?').bind(id).first<Parameters<typeof fromRow>[0]>();if(!row)return json({error:'事件不存在。'},404);
   const versions=await db.prepare('SELECT sequence,recorded_at,day,payload FROM calendar_versions WHERE event_id=? ORDER BY sequence DESC LIMIT 100').bind(id).all<{sequence:number;recorded_at:string;day:string;payload:string}>();
   return json({event:fromRow(row),versions:versions.results.map(v=>({...v,payload:JSON.parse(v.payload)}))});
  }
  const today=beijingDay(),window=calendarWindow(url.searchParams.get('month'),today),[data,status]=await Promise.all([listEvents(db,window.from,window.to),states(db)]);
  const months=await db.prepare('SELECT DISTINCT substr(day,1,7) AS month FROM calendar_events WHERE day>=? AND day<=? ORDER BY month DESC').bind(ARCHIVE_START,today).all<{month:string}>();
  const grouped=groupCalendarEvents(data.events),coverage=Array.from({length:Math.round((Date.parse(window.to)-Date.parse(window.from))/86400000)+1},(_,i)=>{const day=addDays(window.from,i),events=grouped.filter(e=>e.day<=day&&(e.endDay||e.day)>=day);return {day,total:events.length,starting:events.filter(e=>e.day===day).length,ongoing:events.filter(e=>e.day<day).length};});
  return json({...data,events:grouped,coverage,rawCount:data.events.length,mergedCount:data.events.length-grouped.length,...window,today,archiveStart:ARCHIVE_START,storage:'cloudflare-d1',months:months.results.map(x=>x.month),sources:calendarSources.map(s=>({...s,state:status.find(x=>x.source_id===s.id)}))});
 }catch(error){console.error(JSON.stringify({event:'calendar_api',error:String(error)}));return json({error:error instanceof Error?error.message:'读取日历失败。'},url.searchParams.has('month')?400:503);}
}
export async function scheduledCalendar(env:CalendarEnv){if(!env.CALENDAR_DB)return;for(let i=0;i<calendarSources.length;i+=3)await refreshSources(env.CALENDAR_DB,calendarSources.slice(i,i+3).map(s=>s.id));}

/** Administrator-confirmed fallback for official BLS snapshots collected by our trusted CI runner. */
export async function importBlsSnapshot(db:D1Database,raw:string){
 const source=calendarSources.find(s=>s.id==='bls')!,events=parseCalendar(raw,source);
 if(!events.length)throw Error('官方日历快照没有有效条目。');
 const now=new Date().toISOString(),changed=await saveEvents(db,events,now);
 await db.prepare('INSERT INTO calendar_source_state(source_id,attempted_at,success_at,ok,count,error) VALUES(?,?,?,1,?,NULL) ON CONFLICT(source_id) DO UPDATE SET attempted_at=excluded.attempted_at,success_at=excluded.success_at,ok=1,count=excluded.count,error=NULL').bind('bls',now,now,events.length).run();
 return {ok:true,count:events.length,changed};
}
