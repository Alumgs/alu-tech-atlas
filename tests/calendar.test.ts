import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {calendarSources} from '../lib/calendar/sources.ts';
import {parseCalendar,calendarEvent} from '../lib/calendar/parsers.ts';
import {calendarWindow,localInstant,beijingDay} from '../lib/calendar/time.ts';
import {saveEvents,listEvents} from '../worker/calendar/store.ts';
import {nbsResultLink,resultEvidence} from '../worker/calendar/results.ts';
const source=(id:string)=>calendarSources.find(s=>s.id===id)!;
test('forward window is exactly seven Beijing days and archive has no rolling lower bound',()=>{
 assert.deepEqual(calendarWindow(null,'2026-11-16'),{from:'2026-11-16',to:'2026-11-22'});
 assert.deepEqual(calendarWindow('2026-11','2030-03-02'),{from:'2026-11-01',to:'2026-11-30'});
 assert.throws(()=>calendarWindow('2026-10','2026-11-16'));
 assert.throws(()=>calendarWindow('2026-12','2026-11-16'));
});
test('time zone conversion honors DST and shifts US evening calls to next Beijing day',()=>{
 assert.equal(localInstant('2026-11-17','17:00','America/New_York'),'2026-11-17T22:00:00.000Z');
 assert.equal(beijingDay(localInstant('2026-11-17','17:00','America/New_York')),'2026-11-18');
 assert.equal(localInstant('2026-07-17','08:30','America/New_York'),'2026-07-17T12:30:00.000Z');
});
test('ICS UID survives rescheduling and date-only events do not acquire midnight times',()=>{
 const input=(day:string)=>`BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:abc-1\nDTSTART;TZID=US-Eastern:${day}T083000\nSUMMARY:Consumer Price Index\nEND:VEVENT\nBEGIN:VEVENT\nUID:abc-2\nDTSTART;VALUE=DATE:20261120\nSUMMARY:Election date\nEND:VEVENT\nEND:VCALENDAR`;
 const first=parseCalendar(input('20261116'),source('bls')),moved=parseCalendar(input('20261117'),source('bls'));
 assert.equal(first[0].key,moved[0].key);assert.notEqual(first[0].day,moved[0].day);assert.equal(first[1].startAt,undefined);assert.equal(first[1].day,'2026-11-20');
});
test('Q4 activity date comes from event title, never RSS publication or build timestamps',()=>{
 const raw='<rss><channel><lastBuildDate>Tue, 17 Nov 2026 17:00:00 -0500</lastBuildDate><item><title>11/17/2026 : NVIDIA Financial Results</title><guid>stable</guid><pubDate>Wed, 28 Oct 2026 17:00:15 -0400</pubDate><link>https://investor.nvidia.com/event</link></item></channel></rss>';
 const events=parseCalendar(raw,source('nvidia'));assert.equal(events.length,1);assert.equal(events[0].day,'2026-11-17');assert.equal(events[0].startAt,undefined);
 assert.equal(parseCalendar('<rss><channel></channel></rss>',source('meta')).length,0);
});
test('NBS table spans preserve month/time columns and official preliminary status',()=>{
 const cells=Array.from({length:12},(_,i)=>`<td>${i===10?'16/一':'……'}</td>`).join('');
 const times=Array.from({length:12},(_,i)=>`<td>${i===10?'10:00':''}</td>`).join('');
 const raw=`<h1>2026年国家统计局主要统计信息发布日程</h1><table><tr><td rowspan="2">1</td><td rowspan="2">国民经济运行情况</td>${cells}</tr><tr>${times}</tr></table>`;
 const events=parseCalendar(raw,source('nbs'));assert.equal(events.length,1);assert.equal(events[0].day,'2026-11-16');assert.equal(events[0].startAt,'2026-11-16T02:00:00.000Z');
});
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0001_calendar.sql',import.meta.url),'utf8'));
 const prepare=(query:string)=>{
  const statement=sql.prepare(query);let args:Array<string|number|null>=[];
  const wrapper={async raw(){throw Error('Raw queries are not used by calendar storage');},bind(...values:Array<string|number|null>){args=values;return wrapper;},async first(){return statement.get(...args)||null;},async all(){return {success:true,meta:{changes:0,duration:0,size_after:0,rows_read:0,rows_written:0,last_row_id:0,changed_db:false},results:statement.all(...args)};},async run(){const info=statement.run(...args);return {success:true,meta:{changes:Number(info.changes),duration:0,size_after:0,rows_read:0,rows_written:0,last_row_id:0,changed_db:true},results:[]};}};
  return wrapper;
 };
 const db={prepare,async exec(query:string){sql.exec(query);return {count:0,duration:0};},withSession(){throw Error('Not used by calendar storage');},async dump(){return new ArrayBuffer(0);},async batch(statements:Array<{run():Promise<unknown>}>){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}} as D1Database;
 return {db,sql};
}
test('persistent archive is idempotent, preserves rescheduling pointers and retains evidence after feed rolloff',async()=>{
 const {db,sql}=database(),event=calendarEvent(source('bls'),'stable-cpi','Consumer Price Index','2026-11-16','08:30');
 await saveEvents(db,[event],'2026-11-01T00:00:00Z');await saveEvents(db,[event],'2026-11-02T00:00:00Z');
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM calendar_versions').get()?.n,1);
 await saveEvents(db,[{...event,day:'2026-12-01',originalDate:'2026-12-01 08:30',result:'Official result published.',status:'published'}],'2026-11-03T00:00:00Z');
 await saveEvents(db,[],'2026-11-04T00:00:00Z');
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM calendar_events').get()?.n,1);
 const oldMonth=await listEvents(db,'2026-11-01','2026-11-30');assert.equal(oldMonth.events.length,0);assert.equal(oldMonth.moved[0].formerDay,'2026-11-16');
 const combined=await listEvents(db,'2026-11-01','2026-12-31');assert.equal(combined.moved.length,1);
 await saveEvents(db,[{...event,day:'2026-12-01',originalDate:'2026-12-01 08:30'}],'2026-11-05T00:00:00Z');
 const current=await listEvents(db,'2026-12-01','2026-12-31');assert.equal(current.events[0].result,'Official result published.');assert.equal(current.events[0].status,'published');sql.close();
});
test('elapsed time alone cannot create a result and newer releases cannot overwrite historical release results',()=>{
 const event=calendarEvent(source('bls'),'cpi-nov','Consumer Price Index','2026-11-16','08:30');
 assert.equal(event.status,'scheduled');
 assert.equal(resultEvidence('<meta name="date" content="2026-12-16"><pre>A much newer report with a long enough body and unrelated period.</pre>',event),null);
 const old=resultEvidence('<meta name="date" content="2026-11-16"><pre>Consumer price index: verified original source report with original values and unchanged measurement definitions.</pre>',event);assert.ok(old?.text);
 assert.equal(nbsResultLink('<a href="./202611/t20261116_123.html">10月份国民经济运行总体平稳</a>',calendarEvent(source('nbs'),'nov','国民经济运行情况','2026-11-16')),'https://www.stats.gov.cn/sj/zxfb/202611/t20261116_123.html');
});
