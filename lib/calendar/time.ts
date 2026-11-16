export const ARCHIVE_START='2026-11-01';
export const beijingDay=(value:Date|number|string=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
export function addDays(day:string,delta:number){return new Date(Date.parse(day+'T12:00:00Z')+delta*86400000).toISOString().slice(0,10);}
export function validDay(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
export function localInstant(day:string,time:string,zone:string){
 const m=time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);if(!validDay(day)||!m||Number(m[1])>23||Number(m[2])>59)throw Error('Invalid source time');
 const target=Date.parse(day+'T'+m[1].padStart(2,'0')+':'+m[2]+':'+(m[3]||'00')+'Z');let utc=target;
 for(let i=0;i<3;i++){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(utc));const v=Object.fromEntries(parts.map(p=>[p.type,p.value]));const local=Date.parse(`${v.year}-${v.month}-${v.day}T${v.hour}:${v.minute}:${v.second}Z`);const diff=target-local;utc+=diff;if(!diff)break;}
 return new Date(utc).toISOString();
}
export function calendarWindow(month:string|null,today=beijingDay()){
 if(!month)return {from:today,to:addDays(today,6)};
 if(!/^\d{4}-\d{2}$/.test(month)||!validDay(month+'-01')||month<'2026-11'||month>today.slice(0,7))throw Error('历史月份需从 2026 年 11 月至今选择。');
 const from=month+'-01',end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10);
 return {from,to:end<today?end:today};
}
