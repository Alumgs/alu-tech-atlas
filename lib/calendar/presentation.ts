import type {CalendarEvent} from './types';
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu,'');
const noticeAliases:Record<string,string>={
 'dol-claims-2026-11-25':'dol-claims-2026-11-26',
 'ecb-m3-2026-10':'ecb-m3-2026-11',
};
const promotedSourceIds=new Set(['cfnai','tokyo-cpi','ecb-m3','conference-board-confidence','dol-claims','eia-petroleum']);

export function calendarGroupKey(e:CalendarEvent){
 const key=noticeAliases[e.key]&&e.sourceId==='verified-notices'?noticeAliases[e.key]:e.key;
 if(promotedSourceIds.has(e.sourceId)||(e.sourceId==='verified-notices'&&[...promotedSourceIds].some(id=>key.startsWith(id+'-'))))return 'release|'+key;
 if(e.category==='politics'&&(/^(Spain|西班牙)$/i.test(e.country))&&/general election|议会大选/i.test(e.title))return 'spain-general-election|'+e.day;
 // Explicit activity family only. Other events retain dates, times and periods.
 if(e.sourceId==='alibaba'&&e.key.startsWith('earnings:'))return [e.sourceId,e.key.replace(/:call$/,''),e.day].join('|');
 return [e.country,e.category,e.day,e.endDay||e.day,e.startAt||'date-only',normalize(e.title)].join('|');
}
export function groupCalendarEvents(input:CalendarEvent[]):CalendarEvent[]{
 const groups=new Map<string,CalendarEvent[]>(),seen=new Set<string>();
 for(const root of input)for(const item of [root,...(root.relatedEvents||[])]){
  const {relatedEvents:_related,...event}=item;if(seen.has(event.id||event.sourceId+'|'+event.key))continue;seen.add(event.id||event.sourceId+'|'+event.key);
  const key=calendarGroupKey(event);groups.set(key,[...(groups.get(key)||[]),event]);
 }
 return [...groups.values()].map(members=>{
  const preferLive=calendarGroupKey(members[0]).startsWith('release|');
  members.sort((a,b)=>(preferLive?Number(Boolean(a.verifiedOn))-Number(Boolean(b.verifiedOn)):0)||Number(a.key.endsWith(':call'))-Number(b.key.endsWith(':call'))||Number(a.certainty!=='official')-Number(b.certainty!=='official')||Number(a.status==='cancelled')-Number(b.status==='cancelled')||(b.lastChecked||'').localeCompare(a.lastChecked||'')||a.id.localeCompare(b.id));
  return {...members[0],...(members.length>1?{relatedEvents:members.slice(1)}:{})};
 }).sort((a,b)=>a.day.localeCompare(b.day)||(a.startAt||'99').localeCompare(b.startAt||'99')||a.title.localeCompare(b.title));
}
export function calendarTitle(e:CalendarEvent){
 const company:Record<string,string>={jd:'京东',netease:'网易',baidu:'百度',pdd:'拼多多',alibaba:'阿里巴巴','li-auto':'理想汽车'};
 const year=e.title.match(/20\d{2}/)?.[0],quarter=e.title.match(/(first|second|third|fourth)\s+quarter/i)?.[1]?.toLowerCase();
 if(company[e.sourceId]&&year&&quarter)return `${company[e.sourceId]} ${year} 年第${{first:'一',second:'二',third:'三',fourth:'四'}[quarter]}季度财报`;
 if(e.sourceId==='alibaba'&&/September Quarter (20\d{2})/i.test(e.title))return `阿里巴巴截至 ${year} 年 9 月季度财报`;
 return e.title;
}
export function eventsOnDay(events:CalendarEvent[],day:string){return events.filter(e=>e.day<=day&&(e.endDay||e.day)>=day).sort((a,b)=>Number(a.day<day)-Number(b.day<day)||Number(b.importance==='major')-Number(a.importance==='major')||(a.startAt||'99').localeCompare(b.startAt||'99'));}

/** Prefer distinct event types when space is limited to three cards. */
export function calendarDayPreview(events:CalendarEvent[]){
 const eligible=events.filter(event=>event.status!=='cancelled');
 const ordered=eligible.some(event=>event.importance==='major')
  ?[...eligible.filter(event=>event.importance==='major'),...eligible.filter(event=>event.importance!=='major')]
  :eligible;
 const picked:CalendarEvent[]=[];
 for(const event of ordered){
  if(picked.some(item=>item.category===event.category))continue;
  picked.push(event);
  if(picked.length===3)return picked;
 }
 return [...picked,...eligible.filter(event=>!picked.includes(event))].slice(0,3);
}
