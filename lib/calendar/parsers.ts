import type {CalendarSource,CalendarEvent} from './types';
import {beijingDay,addDays,localInstant,validDay,ARCHIVE_START} from './time.ts';
import {publicUrl} from '../url-safety.ts';
export function clean(s:string){return s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;|&#34;/gi,'"').replace(/&#39;|&#x27;/gi,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad=(v:number|string)=>String(v).padStart(2,'0');
export function englishDate(s:string,year?:number){const m=s.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:,?\s+(20\d{2}))?/i);if(!m)return '';const month=months.findIndex(x=>x.toLowerCase().startsWith(m[1].toLowerCase()));return `${m[3]||year}-${pad(month+1)}-${pad(m[2])}`;}
function base(source:CalendarSource,key:string,title:string,day:string,time='',url=source.url):CalendarEvent{
 if(!validDay(day))throw Error('来源日期无效');
 const startAt=time?localInstant(day,time,source.timezone):undefined;
 const major=/工业经济效益|GDP|CPI|Consumer Price|inflation|Employment Situation|利率|国民经济|采购经理|消费者|Quarter|Results|Presiden|FOMC|monetary policy|Personal Income/i.test(title);
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
  const label=title.startsWith('Personal Income and Outlays')?'美国个人收入与支出（含 PCE、核心 PCE） / '+title:title;
  return [base(source,title,label,day,`${pad(Number(m[1])%12+(m[3].toUpperCase()==='PM'?12:0))}:${m[2]}`)];
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
/** Chinese IR announcements: the schedule is explicit in the title, not RSS pubDate. */
function chinaIr(raw:string,source:CalendarSource){
 if(!/<rss\b/i.test(raw))throw Error('投资者公告订阅格式变化');
 return (raw.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[]).flatMap(item=>{
  const field=(name:string)=>clean((item.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'').replace(/<!\[CDATA\[|\]\]>/g,''));
  const title=field('title'),desc=field('description'),url=field('link');
  if(!/\b(?:results|financial)\b/i.test(title))return [];
  const year=Number(title.match(/20\d{2}/)?.[0]),period=title.match(/(first|second|third|fourth)\s+quarter|(?:full\s+)?(?:fiscal\s+)?year/i)?.[0].toLowerCase().replace(/\s+/g,'-');
  if(!year||!period)return [];
  const upcoming=/\bto report\b|\bwill announce\b/i.test(title),result=/\b(?:announces|reports)\b/i.test(title)&&/today announced/i.test(desc);
  const day=upcoming?englishDate(title.split(/\bon\b/i).at(-1)||'',year):result?englishDate(desc.slice(0,180)):'';
  if(!validDay(day))return [];
  const release=upcoming&&desc.match(/(?:report|release|announce)[^.]{0,135}?\bat (\d{1,2}:\d{2}\s*[ap]\.?m\.?)\s+(?:Eastern time|EST|EDT|ET)\b/i);
  const e=base(source,'earnings:'+period+':'+year,title,day,release?releaseTime(release[1]):'',url);
  e.summary=source.note+' '+(release?'预告已明确披露财报发布时间。':upcoming?'排期来自财报预告；具体发布时刻未明确，不推定为电话会时刻。':'原始结果公告明确说明当日发布。');
  if(result){e.status='published';e.result='公司已发布该报告期的官方财报。请打开原文核对数值和口径。';e.resultUrl=url;}
  return [e];
 });
}
function alibaba(raw:string,source:CalendarSource){
 const json=raw.match(/window\.__ICE_PAGE_PROPS__\s*=\s*([\s\S]*?);\s*<\/script>/)?.[1];if(!json)throw Error('阿里巴巴官方日历结构变化');
 const data=JSON.parse(json) as {upcomingEvents?:Array<Record<string,unknown>>;pastEventsDatas?:Array<Record<string,unknown>>};
 return [...(data.pastEventsDatas||[]),...(data.upcomingEvents||[])].flatMap(row=>{
  const title=String(row.documentTitle||''),stamp=Number(row.eventDate),day=englishDate(String(row.eventDateLocal||''));if(!title||!validDay(day)||!Number.isFinite(stamp))return [];
  const url=new URL('/en-US/document-'+row.documentId,source.url).href,period=title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+Quarter\s+(20\d{2})/i),key=period?'earnings:'+period[1].toLowerCase()+':'+period[2]:String(row.documentId);
  const report=base(source,key,title,day,'',url),out=[report],summary=String(row.documentSummary||'');
  // eventDate is the call time on this calendar, not the earnings release time.
  if(/Conference Call:/i.test(summary)){
   const call=base(source,key+':call','阿里巴巴财报电话会 / Alibaba earnings conference call',day,'',url);
   call.startAt=new Date(stamp).toISOString();call.day=beijingDay(call.startAt);call.originalDate=day+' '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(stamp);call.summary='官方日历公布的业绩电话会时间；财报发布另列日期，不据此推定财报上传时刻。';out.push(call);
  }
  return out;
 });
}
function tencent(raw:string,source:CalendarSource){
 return [...raw.matchAll(/<p\b[^>]*class="event-hk-time[^"\n]*"[^>]*>\s*(20\d{2})\/(\d{2})\/(\d{2}),\s*(\d{2}:\d{2})\s*<\/p>([\s\S]*?)<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m=>{
  const title=clean(m[6]),e=base(source,title.replace(/\s/g,''),title,`${m[1]}-${m[2]}-${m[3]}`,m[4]);e.summary='腾讯官网公布的业绩发布活动，采用香港时间（与北京时间相同）；不推定财报文件上传时刻。';e.importance='major';return e;
 });
}
function apec(raw:string,source:CalendarSource){
 return [...raw.matchAll(/(?:<h6\b[^>]*>|<p class="title">)([^<]+)<\/(?:h6|p)>([\s\S]{0,1800}?)(?=<\/section>|class="eyd-home-events-revamp__events-container"|$)/gi)].flatMap(m=>{
  const text=clean(m[2]),date=text.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/);if(!date)return [];
  const title=clean(m[1]),day=englishDate(date[3]+' '+date[1]+', '+date[4]),end=englishDate(date[3]+' '+date[2]+', '+date[4]);
  if(!validDay(day)||!validDay(end)||end<day)return [];
  const china=/Republic of China|Shenzhen|Beijing|Shanghai/i.test(text),e=base(source,title+'|'+date[4],title,day);e.endDay=end;e.region=china?'中国':'全球';e.country=china?'中国':'亚太';e.importance=/Leaders|CEO Summit/i.test(title)?'major':'normal';e.summary=source.note+' '+text.slice(0,260);return [e];
 });
}
export function governmentPolicy(raw:string,source:CalendarSource,url=source.url){
 const title=clean(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/[_－-]中国政府网.*$/,'');
 const body=clean(raw.match(/<div[^>]*class="[^"]*(?:pages_content|TRS_Editor)[^"]*"[^>]*>([\s\S]*?)(?:<!--|<\/body>)/i)?.[1]||raw);
 const date=body.match(/(?:自|于)\s*(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日\s*(?:起)?\s*(?:施行|实施|生效)/);
 if(!title||!date)return [];
 const day=`${date[1]}-${pad(date[2])}-${pad(date[3])}`;if(!validDay(day))return [];
 const event=base(source,url,title,day,'',url);event.summary='政策原文明确规定：'+date[0]+'。仅列生效日期，执行范围与例外请查原文。';return [event];
}
/** Rule-derived window remains tentative until a dated official release is available. */
export function lprWindow(raw:string,source:CalendarSource,today=beijingDay()){
 const text=clean(raw);if(!/每月\s*20\s*日（遇节假日顺延）/.test(text))throw Error('LPR 官方报价规则变化，停止推算');
 const day=today.slice(0,7)+'-20',e=base(source,'lpr:'+today.slice(0,7),'中国 LPR 报价窗口（规则推算，待公告）',day);
 e.certainty='tentative';e.status='tentative';e.importance='major';e.summary=source.note+' 20日仅为规则基准日，未推算调休和节假日；不作为当月已确认日期或时刻，不填入预期利率。';return [e];
}
function nato(raw:string,source:CalendarSource){
 return [...raw.matchAll(/<a\b[^>]*href="([^"<>]*\/content\/[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi)].flatMap(m=>{
  const title=clean(m[2]),date=title.match(/([A-Za-z]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2}),?\s+(20\d{2})/);if(!date||!/Session|Summit/i.test(title))return [];
  const day=englishDate(date[1]+' '+date[2]+', '+date[4]),end=englishDate(date[1]+' '+date[3]+', '+date[4]);if(!validDay(day)||!validDay(end)||end<day)return [];
  const url=new URL(m[1],source.url).href,e=base(source,url,'北约议会大会 / '+title,day,'',url);e.endDay=end;e.importance='major';e.summary=source.note+' '+title;return [e];
 });
}
function releaseTime(text:string){
 const match=text.match(/(\d{1,2}):(\d{2})\s*([ap])\.?m\.?/i);
 return match?pad(Number(match[1])%12+(match[3].toLowerCase()==='p'?12:0))+':'+match[2]:'';
}

function fedEvents(raw:string,source:CalendarSource){
 const heading=raw.match(/<title>[^<]*Calendar:\s*([A-Za-z]+)\s+(20\d{2})/i);
 if(!heading)throw Error('未识别美联储月历');
 const events:CalendarEvent[]=[];
 for(const section of raw.split(/<div class="row cal-nojs__rowTitle">/).slice(1)){
  const label=clean(section.match(/<h4[^>]*>([^<]+)<\/h4>/)?.[1]||'');
  if(label!=='Speeches'&&label!=='Beige Book')continue;
  for(const panel of section.split(/<div class="panel-body">/).slice(1)){
   const date=clean(panel.match(/<div class="col-xs-3">\s*<p>([\s\S]*?)<\/p>/)?.[1]||'');
   const day=englishDate(heading[1]+' '+date,Number(heading[2]));
   const name=clean(panel.match(/<div class="col-xs-7">\s*<p[^>]*>([\s\S]*?)<\/p>/)?.[1]||'');
   if(!/^\d{1,2}$/.test(date)||!validDay(day)||!name)continue;
   const topic=clean(panel.match(/class=['"]calendar__title['"][^>]*>([\s\S]*?)<\/p>/)?.[1]||'');
   const isBeigeBook=label==='Beige Book';
   const title=isBeigeBook?'美联储经济状况褐皮书 / Fed Beige Book':name+(topic?' · '+topic:'');
   const identity=isBeigeBook?'beige-book':name+'|'+(topic||day.slice(8));
   const event=base(source,day.slice(0,7)+'|'+identity,title,day,releaseTime(clean(panel.split('<div class="col-xs-7">')[0])));
   if(isBeigeBook||/Chair|Economic Outlook|Monetary Policy/i.test(title))event.importance='major';
   events.push(event);
  }
 }
 return events;
}

function nyse(raw:string,source:CalendarSource){
 const table=(raw.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi)||[]).find(t=>/Thanksgiving Day/.test(t));
 if(!table)throw Error('未识别 NYSE 节假日表');
 const [header,...rows]=tableGrid(table);
 const events:CalendarEvent[]=[];
 for(const [holiday,...dates] of rows){
  dates.forEach((value,index)=>{
   const year=Number(header[index+1]);
   const day=englishDate(value,year);
   if(!year||!validDay(day))return;
   const title=holiday==='Thanksgiving Day'?'NYSE 感恩节休市 / Thanksgiving Day':'NYSE 休市 · '+holiday;
   events.push({...base(source,'holiday:'+holiday+'|'+year,title,day),importance:'major'});
  });
 }
 for(const paragraph of raw.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi)||[]){
  const text=clean(paragraph);
  if(!/will close early at/i.test(text))continue;
  const time=releaseTime(text);
  if(!time)continue;
  for(const match of text.matchAll(/on\s+[A-Za-z]+,\s+([A-Za-z]+ \d{1,2}, 20\d{2})|(?:,|and)\s+[A-Za-z]+,\s+([A-Za-z]+ \d{1,2}, 20\d{2})/gi)){
   const day=englishDate(match[1]||match[2]);
   if(!validDay(day))continue;
   events.push({...base(source,'early-close:'+day,'NYSE 提前收盘 / NYSE early close',day,time),importance:'major'});
  }
 }
 return events;
}

function census(raw:string,source:CalendarSource){
 const table=raw.match(/<table\b[^>]*\bid="calendar"[^>]*>[\s\S]*?<\/table>/i)?.[0];
 if(!table)throw Error('未识别美国人口普查局排期表');
 return tableGrid(table).flatMap(([name,date,time,period])=>{
  if(!name||!date||!period)return [];
  const day=englishDate(date),at=releaseTime(time);
  if(!validDay(day)||!at)return [];
  const title=name+' · '+period;
  const event=base(source,title,title,day,at);
  if(/Durable Goods|Residential Sales|Retail Sales|Trade in Goods|Housing Starts/i.test(title))event.importance='major';
  return [event];
 });
}

function dell(raw:string,source:CalendarSource){
 return [...raw.matchAll(/<div class="event">\s*<time[^>]*>([\s\S]*?)<\/time>\s*<a href="([^"]+)"[^>]*>\s*<span class="link-heading">([^<]+)<\/span>/gi)].flatMap(match=>{
  const [,stamp,link,title]=match,day=englishDate(clean(stamp)),zone=stamp.match(/\b([ECMP][SD]T)\b/)?.[1][0];
  const zones:Record<string,string>={E:'America/New_York',C:'America/Chicago',M:'America/Denver',P:'America/Los_Angeles'};
  const time=releaseTime(stamp);
  if(!validDay(day)||!zone||!time)return [];
  const event=base({...source,timezone:zones[zone]},title,title,day,time,new URL(link,source.url).href);
  if(!/results|earnings/i.test(title))event.category='technology';
  return [event];
 });
}

function chicagoActivity(raw:string,source:CalendarSource){
 const body=raw.match(/<tbody\b[^>]*data-name="Chicago Fed National Activity Index[^"]*"[^>]*>([\s\S]*?)<\/tbody>/i)?.[1];
 if(!body)throw Error('芝加哥联储未返回 CFNAI 排期表');
 return tableGrid(body).flatMap(([date,period])=>{
  const day=englishDate(date||''),month=months.findIndex(value=>period?.startsWith(value))+1;
  const year=period?.match(/20\d{2}/)?.[0];
  if(!validDay(day)||!month||!year)return [];
  const key='cfnai-'+year+'-'+pad(month);
  return [{...base(source,key,'美国 '+month+' 月芝加哥联储全国活动指数 / Chicago Fed National Activity Index',day,'08:30'),importance:'major' as const}];
 });
}

function tokyoPrices(raw:string,source:CalendarSource){
 const table=(raw.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi)||[]).find(item=>/Ku-area of Tokyo/i.test(item));
 const firstYear=Number(clean(table||'').match(/20\d{2}/)?.[0]);
 if(!table||!firstYear)throw Error('日本统计局未返回东京 CPI 排期表');
 let year=firstYear;
 return tableGrid(table).flatMap(row=>{
  const [, ,period,date]=row;
  const month=months.findIndex(value=>period?.startsWith(value))+1;
  if(!month||!date)return [];
  year=Number(period.match(/20\d{2}/)?.[0]||year);
  const day=englishDate(date,year);
  if(!validDay(day))return [];
  return [base(source,'tokyo-cpi-'+year+'-'+pad(month),'日本 '+month+' 月东京都区部 CPI 初值 / Tokyo CPI',day,'08:30')];
 });
}

function ecbMoney(raw:string,source:CalendarSource){
 const text=clean(raw);
 if(!/Weekly schedule of public speaking engagements and other activities/i.test(text))throw Error('欧洲央行未返回官方周历');
 return [...raw.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].flatMap(([,date,body])=>{
  if(!/Monetary developments in the euro area/i.test(clean(body)))return [];
  const stamp=clean(date).match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})\b/);
  const day=stamp?englishDate(stamp[2]+' '+stamp[1],Number(stamp[3])):'';
  const time=clean(body).match(/Time:\s*(\d{1,2}:\d{2})/i)?.[1];
  if(!validDay(day)||!time)throw Error('欧洲央行 M3 公布时点无法解析');
  return [{...base(source,'ecb-m3-'+day.slice(0,7),'欧元区 M3 与信贷数据 / Euro area M3 and credit',day,time),importance:'major' as const}];
 });
}

function consumerConfidence(raw:string,source:CalendarSource){
 const text=clean(raw);
 const previous=text.match(/Source:\s*([A-Za-z]+)\s+(20\d{2})\s+Consumer Confidence Survey/i);
 const next=text.match(/The next release is\s+([A-Za-z]+),\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\s+at\s+(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)\s+ET\b/i);
 if(!previous||!next)throw Error('谘商会未返回可核对的发布日期');
 const [,weekday,month,date,explicitYear,clock]=next;
 const year=Number(explicitYear||previous[2])+(explicitYear||months.indexOf(month)>months.indexOf(previous[1])?0:1);
 const day=englishDate(month+' '+date,year);
 const time=releaseTime(clock.replace(/^(\d{1,2})(?!\d|:)/,'$1:00'));
 if(!validDay(day)||!time||new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',timeZone:'UTC'})!==weekday)throw Error('谘商会排期日期与星期不一致');
 return [base(source,'conference-board-confidence-'+day.slice(0,7),'美国 '+Number(day.slice(5,7))+' 月谘商会消费者信心指数 / US Consumer Confidence Index',day,time)];
}

function weeklyUsRelease(raw:string,source:CalendarSource){
 const claims=source.parser==='dol-claims';
 const text=clean(raw);
 const standard=claims?text.match(/published each week on Thursday morning at (\d{1,2}:\d{2}\s*[ap]m) EST/i):text.match(/standard release time and day of the week will be at (\d{1,2}:\d{2}\s*[ap]\.m\.) eastern time on Wednesday/i);
 const table=(raw.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi)||[]).find(item=>{
  const heading=clean(item);
  return claims?/Release Date Release Time/i.test(heading):/Data for the week ending Alternate release date/i.test(heading);
 });
 if(!standard||!table)throw Error('周报缺少常规发布时间或节假日排期');
 const time=releaseTime(standard[1]),exceptions=new Map<string,{day:string;time:string}>();
 for(const row of tableGrid(table).slice(1)){
  const day=englishDate(row[claims?0:1]||''),at=releaseTime(row[claims?1:3]||'');
  if(!validDay(day)||!at)continue;
  const weekday=new Date(day+'T12:00:00Z').getUTCDay();
  const dataDate=englishDate(row[0]||'');
  if(!claims&&!validDay(dataDate))continue;
  const original=claims?addDays(day,4-weekday):addDays(dataDate,5);
  exceptions.set(original,{day,time:at});
 }
 const events:CalendarEvent[]=[];
 const now=beijingDay();
 for(let offset=0;offset<=15;offset++){
  const regular=addDays(now,offset);
  if(new Date(regular+'T12:00:00Z').getUTCDay()!==(claims?4:3))continue;
  const {day,time:at}=exceptions.get(regular)||{day:regular,time};
  const title=claims?'美国上周初请失业金人数 / US initial jobless claims':'美国 EIA 原油库存周报 / EIA Weekly Petroleum Status Report';
  events.push({...base(source,source.id+'-'+regular,title,day,at),importance:'major'});
 }
 return events;
}

export function parseCalendar(raw:string,source:CalendarSource):CalendarEvent[]{
 let events:CalendarEvent[]=[];
 switch(source.parser){case 'cfnai':events=chicagoActivity(raw,source);break;case 'tokyo-cpi':events=tokyoPrices(raw,source);break;case 'ecb-m3':events=ecbMoney(raw,source);break;case 'consumer-confidence':events=consumerConfidence(raw,source);break;case 'dol-claims':case 'eia-petroleum':events=weeklyUsRelease(raw,source);break;case 'fed-events':events=fedEvents(raw,source);break;case 'nyse':events=nyse(raw,source);break;case 'census':events=census(raw,source);break;case 'dell':events=dell(raw,source);break;case 'nato':events=nato(raw,source);break;case 'lpr':events=lprWindow(raw,source);break;case 'china-ir':events=chinaIr(raw,source);break;case 'alibaba':events=alibaba(raw,source);break;case 'tencent':events=tencent(raw,source);break;case 'apec':events=apec(raw,source);break;case 'gov-policy':events=governmentPolicy(raw,source);break;case 'ics':events=ics(raw,source);break;case 'nbs':events=nbs(raw,source);break;case 'bea':events=bea(raw,source);break;case 'fed':events=fed(raw,source);break;case 'ecb':events=ecb(raw,source);break;case 'elections':events=elections(raw,source);break;case 'microsoft':events=microsoft(raw,source);break;case 'eurostat':events=eurostat(raw,source);break;case 'q4':events=q4(raw,source);break;case 'boe':events=boe(raw,source);break;case 'boj':events=boj(raw,source);break;case 'amd':events=amd(raw,source);break;default:throw Error('该来源需专用活动适配器');}
 const unique=new Map<string,CalendarEvent>();for(const e of events){if(e.day>=ARCHIVE_START&&e.title&&publicUrl(e.url)){if(source.parser!=='china-ir'||unique.get(e.key)?.status!=='published'||e.status==='published')unique.set(e.key,e);}}return [...unique.values()];
}
export {base as calendarEvent};
