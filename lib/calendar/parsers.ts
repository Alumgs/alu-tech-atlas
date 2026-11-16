import type {CalendarSource,CalendarEvent} from './types';
import {beijingDay,localInstant,validDay,ARCHIVE_START} from './time.ts';
import {publicUrl} from '../url-safety.ts';
export function clean(s:string){return s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&#x27;/gi,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad=(v:number|string)=>String(v).padStart(2,'0');
export function englishDate(s:string,year?:number){const m=s.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:,?\s+(20\d{2}))?/i);if(!m)return '';const month=months.findIndex(x=>x.toLowerCase().startsWith(m[1].toLowerCase()));return `${m[3]||year}-${pad(month+1)}-${pad(m[2])}`;}
function base(source:CalendarSource,key:string,title:string,day:string,time='',url=source.url):CalendarEvent{
 if(!validDay(day))throw Error('来源日期无效');
 const startAt=time?localInstant(day,time,source.timezone):undefined;
 const major=/GDP|CPI|Consumer Price|inflation|Employment Situation|利率|国民经济|采购经理|消费者|Quarter|Results|Presiden|FOMC|monetary policy|Personal Income/i.test(title);
 return {id:'',sourceId:source.id,sourceName:source.name,sourceUrl:source.url,key,title:clean(title).slice(0,350),url:publicUrl(url)?url:source.url,category:source.category,region:source.region,country:source.country,importance:major?'major':'normal',day:startAt?beijingDay(startAt):day,startAt,originalDate:day+(time?' '+time:''),timezone:source.timezone,certainty:source.level,status:'scheduled',summary:source.note};
}
function ics(raw:string,source:CalendarSource){
 const input=raw.replace(/\r?\n[ \t]/g,''),blocks=input.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)||[];
 if(!/BEGIN:VCALENDAR/.test(input))throw Error('并非有效 iCalendar');
 return blocks.flatMap(block=>{
  const field=(name:string)=>block.match(new RegExp('^'+name+'(?:;[^:]+)?:([^\\r\\n]*)','m'))?.[1]?.replace(/\\n/g,' ').replace(/\\([,;\\])/g,'$1')||'';
  const start=field('DTSTART'),title=field('SUMMARY');if(!start||!title||/RRULE:/.test(block))return [];
  const m=start.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return [];
  const tz=block.match(/^DTSTART;[^\n]*TZID=([^:;]+)[:;]/m)?.[1]||source.timezone;
  const zone=tz==='US-Eastern'?'America/New_York':tz;
  const event=base({...source,timezone:m[7]?'UTC':zone},field('UID')||title+'|'+start,clean(title),`${m[1]}-${m[2]}-${m[3]}`,m[4]?`${m[4]}:${m[5]}`:'',field('URL')||source.url);
  const desc=field('DESCRIPTION');if(desc)event.summary=clean(desc).slice(0,1000);
  if(field('STATUS')==='CANCELLED')event.status='cancelled';
  if(source.id==='bls'){
   const slug=/Consumer Price Index/.test(title)?'cpi':/Employment Situation/.test(title)?'empsit':/Producer Price Index/.test(title)?'ppi':/Job Openings/.test(title)?'jolts':'';
   if(slug)event.resultUrl=`https://www.bls.gov/news.release/${slug}.nr0.htm`;
  }
  return [event];
 });
}
/** Expand row/column spans before assigning month columns in the official NBS Word table. */
export function tableGrid(table:string){const grid:string[][]=[];let ri=0;for(const row of table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[]){grid[ri]||=[];let ci=0;for(const m of row.matchAll(/<t[dh]\b([^>]*)>([\s\S]*?)<\/t[dh]>/gi)){while(grid[ri][ci]!==undefined)ci++;const rs=Math.min(30,Number(m[1].match(/rowspan=["']?(\d+)/i)?.[1]||1)),cs=Math.min(20,Number(m[1].match(/colspan=["']?(\d+)/i)?.[1]||1));for(let r=0;r<rs;r++){grid[ri+r]||=[];for(let c=0;c<cs;c++)grid[ri+r][ci+c]=clean(m[2]);}ci+=cs;}ri++;}return grid;}
function nbs(raw:string,source:CalendarSource){
 const text=clean(raw),year=Number(text.match(/(20\d{2})年国家统计局主要统计信息发布日程/)?.[1]);if(!year)throw Error('未识别国家统计局年度日程标题');
 const table=(raw.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi)||[]).find(t=>/国民经济运行/.test(t));if(!table)throw Error('未识别日程表');
 const grid=tableGrid(table),events:CalendarEvent[]=[];
 grid.forEach((row,i)=>{if(!/^\d+$/.test(row[0]||'')||!row[1]||!row.slice(2).some(x=>/\d+\/[一二三四五六日]/.test(x)))return;
  for(let month=1;month<=12;month++){
   const value=row[month+1]||'',time=(grid[i+1]?.[month+1]||'').match(/\b\d{1,2}:\d{2}\b/)?.[0]||'';
   [...value.matchAll(/(\d{1,2})\/[一二三四五六日]/g)].forEach((m,k)=>{const day=`${year}-${pad(month)}-${pad(m[1])}`;events.push(base(source,`${year}-${month}|${row[1]}|${k}`,row[1],day,time));});
  }
 });return events;
}
function bea(raw:string,source:CalendarSource){
 const year=Number(clean(raw).match(/Year\s*(20\d{2})/)?.[1]||new Date().getUTCFullYear());
 return (raw.match(/<tr\b[^>]*class="scheduled-releases[^>]*>[\s\S]*?<\/tr>/gi)||[]).flatMap(row=>{
  const title=clean(row.match(/<td[^>]*class="release-title[^>]*>([\s\S]*?)<\/td>/i)?.[1]||''),day=englishDate(clean(row.match(/class="release-date"[^>]*>([\s\S]*?)<\/div>/i)?.[1]||''),year),m=clean(row).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if(!title||!day||!m)return [];
  return [base(source,title,title,day,`${pad(Number(m[1])%12+(m[3].toUpperCase()==='PM'?12:0))}:${m[2]}`)];
 });
}
function fed(raw:string,source:CalendarSource){
 const events:CalendarEvent[]=[];
 for(const section of raw.split(/(?=20\d{2} FOMC Meetings)/)){
  const year=Number(section.match(/(20\d{2}) FOMC Meetings/)?.[1]);if(!year)continue;
  const pieces=section.split(/(?=<div class="(?:fomc-meeting--shaded )?row fomc-meeting")/);
  for(const piece of pieces){const monthText=clean(piece.match(/fomc-meeting__month[^>]*>([\s\S]*?)<\/div>/)?.[1]||''),month=months.indexOf(monthText)+1,days=clean(piece.match(/fomc-meeting__date[^>]*>([\s\S]*?)<\/div>/)?.[1]||'').match(/\d+/g);if(!month||!days?.length)continue;
   const first=`${year}-${pad(month)}-${pad(days[0])}`,last=`${year}-${pad(month)}-${pad(days.at(-1)!)}`;const e=base(source,`meeting-${year}-${month}`,'FOMC 货币政策会议 / Monetary policy meeting',first);e.endDay=last;
   const statement=piece.match(/href="([^"<>]*\/pressreleases\/monetary\d+a\.htm)"/i)?.[1];if(statement){e.status='published';e.resultUrl=new URL(statement,source.url).href;e.result='官方已公布政策声明；具体利率与措辞请查看原文。';}
   events.push(e);
   const released=piece.match(/Released ([A-Za-z]+ \d{1,2}, 20\d{2})/);if(released){const day=englishDate(released[1]);const link=piece.match(/href="([^"<>]*fomcminutes\d+\.htm)"/i)?.[1];const minutes=base(source,`minutes-${year}-${month}`,'FOMC 会议纪要 / Meeting minutes',day);if(link){minutes.status='published';minutes.resultUrl=new URL(link,source.url).href;minutes.result='官方会议纪要已发布，查看原文。';}events.push(minutes);}
  }
 }
 return events;
}
function ecb(raw:string,source:CalendarSource){return [...raw.matchAll(/<dt\b[^>]*>\s*(\d{2})\/(\d{2})\/(20\d{2})\s*<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].map((m,i)=>base(source,clean(m[4]).replace(/\([^)]*\)/g,'').trim()+'|'+m[3]+'|'+m[2],clean(m[4]),`${m[3]}-${m[2]}-${m[1]}`));}
function elections(raw:string,source:CalendarSource){return (raw.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[]).flatMap(row=>{
 const links=[...row.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)],eventLink=links.find(m=>/\/elections\/id\/\d+/.test(m[1])),country=links.find(m=>/\/countries\/id\/\d+/.test(m[1]));
 const day=englishDate(clean(row));if(!eventLink||!day)return [];
 const e=base(source,eventLink[1],`${clean(country?.[2]||'')} · ${clean(eventLink[2])}`,day,'',new URL(eventLink[1],source.url).href);e.country=clean(country?.[2]||'全球');e.region='全球';e.summary='IFES 机构日历；投票、初步计票和正式认证为不同阶段。请查看原始记录及当地选举机关。';if(/\(t\)/.test(clean(row))){e.certainty='tentative';e.status='tentative';}return [e];
 });}
function microsoft(raw:string,source:CalendarSource){
 const encoded=raw.match(/eventsData="([\s\S]*?)"/i)?.[1];if(!encoded)throw Error('未识别 Microsoft 官方活动数据');const data=JSON.parse(clean(encoded)) as {Events?:Array<{EventID:string;EventName:string;EventType:string;DateTime:{UTC:string};Webcast?:string}>};
 return (data.Events||[]).flatMap(row=>{const at=row.DateTime?.UTC;if(!at||!row.EventName)return [];const stamp=new Date(at+'Z').toISOString();const e=base(source,row.EventID,row.EventName,stamp.slice(0,10));e.startAt=stamp;e.day=beijingDay(stamp);e.originalDate=at+' UTC';e.timezone='UTC';if(row.Webcast)e.url=new URL(row.Webcast,source.url).href;if(!/earnings|financial|results/i.test(row.EventName))e.category='technology';return [e];});
}
function eurostat(raw:string,source:CalendarSource){const data=JSON.parse(raw) as Array<Record<string,unknown>>;if(!Array.isArray(data))throw Error('Eurostat 日历格式变化');return data.flatMap(row=>{
 const title=String(row.title||''),start=String(row.start||'');if(!title||!/^20\d{2}-\d{2}-\d{2}/.test(start))return [];
 const day=start.slice(0,10),hasZone=/[Zz]$|[+-]\d{2}:?\d{2}$/.test(start),time=start.match(/T(\d{2}:\d{2})/)?.[1];const e=base(source,String(row.recordid||row.id||title+'|'+day.slice(0,7)),title+(row.period?' · '+String(row.period):''),day,!hasZone&&time?time:'',typeof row.url==='string'?new URL(row.url,source.url).href:source.url);if(hasZone){e.startAt=new Date(start).toISOString();e.day=beijingDay(e.startAt);e.originalDate=start;e.timezone='UTC';}return [e];});}

function q4(raw:string,source:CalendarSource){
 if(!/<rss\b/i.test(raw))throw Error('不是官方活动订阅');
 return (raw.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[]).flatMap(row=>{
  const tag=(name:string)=>clean(row.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1]||'').replace(/<!\[CDATA\[|\]\]>/g,'');
  const title=tag('title'),m=title.match(/^(\d{1,2})\/(\d{1,2})\/(20\d{2})\s*:\s*(.*)/);if(!m)return [];
  const event=base(source,tag('guid')||tag('link'),m[4],`${m[3]}-${pad(m[1])}-${pad(m[2])}`,'',tag('link'));
  if(!/quarter|results|earnings|financial/i.test(event.title))event.category='technology';return [event];
 });
}
function boe(raw:string,source:CalendarSource){
 const events:CalendarEvent[]=[];
 for(const part of raw.split(/(?=<h2>20\d{2} confirmed dates)/)){
  const year=Number(part.match(/<h2>(20\d{2}) confirmed dates/)?.[1]);if(!year)continue;
  for(const row of part.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[]){const text=clean(row),m=text.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday)\s+(\d{1,2})\s+([A-Za-z]+)/);if(!m)continue;const month=months.indexOf(m[2])+1;if(!month)continue;events.push(base(source,`mpc-${year}-${month}`,'英国央行 MPC 利率决议与会议纪要 / MPC announcement',`${year}-${pad(month)}-${pad(m[1])}`));}
 }return events;
}
function boj(raw:string,source:CalendarSource){
 const events:CalendarEvent[]=[];
 for(const part of raw.split(/(?=<h2 id="p20\d{2}">)/)){
  const year=Number(part.match(/<h2 id="p(20\d{2})">/)?.[1]);if(!year)continue;
  for(const row of part.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[]){const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1]);if(!cells.length)continue;
   const first=englishDate(clean(cells[0]),year);if(!first)continue;
   const meeting=base(source,`mpm-${first.slice(0,7)}`,'日本银行货币政策会议 / Monetary policy meeting',first);const nums=clean(cells[0]).split('[')[0].match(/\b\d{1,2}\b/g);if(nums&&nums.length>1)meeting.endDay=first.slice(0,8)+pad(nums.at(-1)!);events.push(meeting);
   for(const [i,title] of [[2,'日本银行意见摘要 / Summary of Opinions'],[3,'日本银行会议纪要 / MPM Minutes']] as const){const day=englishDate(clean(cells[i]||''),year);if(day)events.push(base(source,`mpm-${first.slice(0,7)}-${i}`,title,day));}
  }
 }return events;
}

function amd(raw:string,source:CalendarSource){return (raw.match(/<article\b[^>]*class="media"[^>]*>[\s\S]*?<\/article>/gi)||[]).flatMap(row=>{
 const title=clean(row.match(/class="media-heading"[^>]*>([\s\S]*?)<\/(?:h3|div)>/i)?.[1]||''),date=englishDate(clean(row));if(!title||!date)return [];
 const link=row.match(/href="([^"<>]*ir-calendar\/detail[^"<>]*)"/i)?.[1],tm=clean(row).match(/(\d{1,2}):(\d{2})\s*(am|pm)\s*(PST|PDT|EST|EDT)/i);
 const zone=tm&&/^E/.test(tm[4])?'America/New_York':'America/Los_Angeles',time=tm?`${pad(Number(tm[1])%12+(tm[3].toLowerCase()==='pm'?12:0))}:${tm[2]}`:'';
 const e=base({...source,timezone:zone},title+'|'+date.slice(0,4),title,date,time,link?new URL(link,source.url).href:source.url);if(!/financial|results|earnings/i.test(title))e.category='technology';return [e];
});}
export function parseCalendar(raw:string,source:CalendarSource):CalendarEvent[]{
 let events:CalendarEvent[]=[];
 switch(source.parser){case 'ics':events=ics(raw,source);break;case 'nbs':events=nbs(raw,source);break;case 'bea':events=bea(raw,source);break;case 'fed':events=fed(raw,source);break;case 'ecb':events=ecb(raw,source);break;case 'elections':events=elections(raw,source);break;case 'microsoft':events=microsoft(raw,source);break;case 'eurostat':events=eurostat(raw,source);break;case 'q4':events=q4(raw,source);break;case 'boe':events=boe(raw,source);break;case 'boj':events=boj(raw,source);break;case 'amd':events=amd(raw,source);break;default:throw Error('该来源需专用活动适配器');}
 const unique=new Map<string,CalendarEvent>();for(const e of events){if(e.day>=ARCHIVE_START&&e.title&&publicUrl(e.url))unique.set(e.key,e);}return [...unique.values()];
}
export {base as calendarEvent};
