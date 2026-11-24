import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {calendarSources} from '../lib/calendar/sources.ts';
import {parseCalendar,calendarEvent,lprWindow} from '../lib/calendar/parsers.ts';
import {calendarWindow,localInstant,beijingDay} from '../lib/calendar/time.ts';
import {saveCalendarResult,saveEvents,listEvents} from '../worker/calendar/store.ts';
import {blsResultLink,nbsResultLink,resultEvidence} from '../worker/calendar/results.ts';
const source=(id:string)=>calendarSources.find(s=>s.id===id)!;
test('forward window is exactly seven Beijing days and archive has no rolling lower bound',()=>{
 assert.deepEqual(calendarWindow(null,'2026-11-16'),{from:'2026-11-16',to:'2026-11-22'});
 assert.deepEqual(calendarWindow(null,'2026-11-22',true),{from:'2026-11-23',to:'2026-11-29'});
 assert.deepEqual(calendarWindow(null,'2026-12-28',true),{from:'2027-01-04',to:'2027-01-10'});
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
test('Chinese IR uses announced report dates and resolves results regardless of RSS ordering',()=>{
 const schedule='<item><title>Baidu to Report Third Quarter 2026 Financial Results on November 16, 2026</title><link>https://ir.baidu.com/schedule</link><pubDate>Tue, 27 Oct 2026 05:00:00 -0400</pubDate></item>';
 const result='<item><title>Baidu Announces Third Quarter 2026 Results</title><link>https://ir.baidu.com/result</link><description>BEIJING, Nov. 16, 2026 -- Baidu today announced its unaudited financial results.</description></item>';
 for(const items of [schedule+result,result+schedule]){const e=parseCalendar('<rss><channel>'+items+'</channel></rss>',source('baidu'));assert.equal(e.length,1);assert.equal(e[0].day,'2026-11-16');assert.equal(e[0].status,'published');assert.equal(e[0].resultUrl,'https://ir.baidu.com/result');}
 const netease=parseCalendar('<rss><item><title>NetEase to Report Third Quarter 2026 Financial Results on November 19</title><link>https://ir.netease.com/report</link><pubDate>Thu, 05 Nov 2026 03:30:00 -0500</pubDate></item></rss>',source('netease'));
 assert.equal(netease[0].day,'2026-11-19');assert.equal(netease[0].startAt,undefined);
 assert.equal(parseCalendar('<rss><item><title>Company Results</title><pubDate>Thu, 19 Nov 2026</pubDate></item></rss>',source('jd')).length,0);
});
test('Alibaba separates release date from the explicitly timed earnings call',()=>{
 const raw='<script>window.__ICE_PAGE_PROPS__='+JSON.stringify({upcomingEvents:[{documentId:'123',eventDate:Date.parse('2026-11-19T12:00:00Z'),eventDateLocal:'November 19, 2026',documentPublishTime:Date.parse('2026-11-06T00:00Z'),documentTitle:'Alibaba Group Will Announce September Quarter 2026 Results on November 19, 2026',documentSummary:'Conference Call: November 19, 2026 8:00 p.m. Hong Kong Time'}]})+';</script>';
 const events=parseCalendar(raw,source('alibaba'));assert.equal(events.length,2);assert.equal(events[0].day,'2026-11-19');assert.equal(events[0].startAt,undefined);assert.equal(events[1].startAt,'2026-11-19T12:00:00.000Z');assert.notEqual(events[0].key,events[1].key);
});
test('APEC preserves multi-day host-China events and government policy uses effective dates',()=>{
 const raw='<h6>APEC CEO Summit</h6><div><p>17 - 18 November 2026</p></div><div><p>Shenzhen, People&#39;s Republic of China</p></div></section>';
 const events=parseCalendar(raw,source('apec'));assert.equal(events[0].day,'2026-11-17');assert.equal(events[0].endDay,'2026-11-18');assert.equal(events[0].region,'中国');
 const policy=parseCalendar('<title>某条例_中国政府网</title><div class="pages_content">发布日期：2026年11月10日。本条例自2026年12月1日起施行。<!-- footer -->',source('gov-policy'));
 assert.equal(policy[0].day,'2026-12-01');assert.equal(policy[0].category,'policy');assert.equal(policy[0].startAt,undefined);
 assert.equal(parseCalendar('<title>政策发布</title><p>2026年11月10日，组织实施工作。</p>',source('gov-policy')).length,0);
});

test('LPR rule windows never become official dates or fabricate holiday adjustments',()=>{
 const e=lprWindow('每月20日（遇节假日顺延）',source('lpr'),'2026-11-17')[0];assert.equal(e.day,'2026-11-20');assert.equal(e.certainty,'tentative');assert.equal(e.status,'tentative');assert.equal(e.startAt,undefined);
 assert.throws(()=>lprWindow('规则已改为不定期公布',source('lpr'),'2026-11-17'));
});

test('market holiday and early close have distinct dates and only the close has a clock',()=>{
 const raw='<table><tr><th>Holiday</th><th>2026</th></tr><tr><th>Thanksgiving Day</th><td>Thursday, November 26***</td></tr></table><p>Each market will close early at 1:00 p.m. on Friday, November 27, 2026.</p>';
 const [closed,early]=parseCalendar(raw,source('nyse'));
 assert.equal(closed.day,'2026-11-26');assert.equal(closed.startAt,undefined);
 assert.equal(early.day,'2026-11-28');assert.equal(early.originalDate,'2026-11-27 13:00');
});

test('verified release evidence survives refresh, but a stale verification cannot replace a rescheduled record',async()=>{
 const {db,sql}=database();
 try{
  const sourceEvent=calendarEvent(source('bls'),'import-oct','U.S. Import and Export Price Indexes','2026-11-17','08:30');
  await saveEvents(db,[sourceEvent],'2026-11-24T00:00:00Z');
  const window=()=>listEvents(db,'2026-11-01','2026-11-30');
  const original=(await window()).events[0];
  assert.equal(original.status,'published');
  assert.equal(original.resultUrl,blsResultLink(sourceEvent));
  const moved=calendarEvent(source('bls'),sourceEvent.key,sourceEvent.title,'2026-11-18','08:30');
  await saveEvents(db,[moved],'2026-11-24T00:01:00Z');
  assert.equal(await saveCalendarResult(db,original,{result:'Stale evidence',resultUrl:original.resultUrl!,resultCheckedAt:'2026-11-24'},'2026-11-24T00:02:00Z'),false);
  assert.equal((await window()).events[0].status,'scheduled');
  const refreshed=(await window()).events[0];
  const evidence={result:'Archived',resultUrl:blsResultLink(refreshed)!,resultCheckedAt:'2026-11-24'};
  assert.equal(await saveCalendarResult(db,refreshed,evidence,'2026-11-24T00:03:00Z'),true);
  await saveEvents(db,[moved],'2026-11-24T00:04:00Z');
  assert.equal((await window()).events[0].resultUrl,evidence.resultUrl);
 }finally{sql.close();}
});
