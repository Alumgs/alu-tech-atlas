import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarSources} from '../lib/calendar/sources.ts';
import {calendarEvent,parseCalendar} from '../lib/calendar/parsers.ts';
import {groupCalendarEvents,eventsOnDay,calendarTitle} from '../lib/calendar/presentation.ts';
const source=(id:string)=>calendarSources.find(s=>s.id===id)!;
test('changed feed UIDs do not duplicate calendar cards; original records remain accessible',()=>{
 const e=calendarEvent(source('bls'),'uid-old','U.S. Import and Export Price Indexes','2026-11-17','08:30');
 const a={...e,id:'one'},b={...e,id:'two',key:'uid-new'},grouped=groupCalendarEvents([a,b]);
 assert.equal(grouped.length,1);assert.equal(grouped[0].relatedEvents?.length,1);
 assert.deepEqual(groupCalendarEvents(grouped),grouped);
 const differentTime={...e,id:'three',key:'third',startAt:'2026-11-17T14:00:00Z'};
 assert.equal(groupCalendarEvents([a,differentTime]).length,2);
 assert.equal(groupCalendarEvents([a,{...a,id:'four',day:'2026-11-18'}]).length,2);
 assert.equal(groupCalendarEvents([a,{...a,id:'five',title:e.title+' Revised'}]).length,2);
});
test('report and call share a card without losing call precision or revision IDs',()=>{
 const report={...calendarEvent(source('alibaba'),'earnings:september:2026','Alibaba Group Will Announce September Quarter 2026 Results on November 19, 2026','2026-11-19'),id:'release'};
 const call={...calendarEvent(source('alibaba'),'earnings:september:2026:call','Alibaba earnings conference call','2026-11-19','20:00'),id:'call'};
 const grouped=groupCalendarEvents([call,report]);assert.equal(grouped.length,1);assert.equal(grouped[0].id,'release');assert.equal(grouped[0].startAt,undefined);assert.equal(grouped[0].relatedEvents?.[0].startAt,'2026-11-19T12:00:00.000Z');assert.match(calendarTitle(grouped[0]),/2026 年 9 月/);
});
test('official multi-day political meetings cover weekends as ongoing events, not new starts',()=>{
 const nato=parseCalendar('<a href="/content/annual-session-berlin-november-20-23-2026">Annual Session | Berlin | November 20-23, 2026</a>',source('nato-pa'));
 assert.equal(nato[0].day,'2026-11-20');assert.equal(nato[0].endDay,'2026-11-23');
 assert.equal(eventsOnDay(nato,'2026-11-21').length,1);assert.equal(eventsOnDay(nato,'2026-11-24').length,0);
 const fresh={...nato[0],id:'new-meeting',day:'2026-11-22',endDay:'2026-11-23'};assert.equal(eventsOnDay([...nato,fresh],'2026-11-22').length,2);assert.equal(eventsOnDay([...nato,fresh],'2026-11-22')[0].day,'2026-11-22');
 assert.equal(parseCalendar('<a href="/content/summit-2026">Summit 2026, date TBC</a>',source('nato-pa')).length,0);
});

test('live release and verified notice share one card, retaining the source record',()=>{
 const live={...calendarEvent(source('conference-board-confidence'),'conference-board-confidence-2026-11','Consumer Confidence Index','2026-11-24','10:00'),id:'live'};
 const notice={...live,id:'notice',sourceId:'verified-notices',certainty:'official' as const,verifiedOn:'2026-11-22'};
 const [event]=groupCalendarEvents([notice,live]);
 assert.equal(groupCalendarEvents([notice,live]).length,1);
 assert.equal(event.id,'live');
 assert.equal(event.relatedEvents?.[0].id,'notice');

 const claims={...calendarEvent(source('dol-claims'),'dol-claims-2026-11-26','Initial claims','2026-11-25','08:30'),id:'claims'};
 const claimsNotice={...claims,id:'claims-notice',sourceId:'verified-notices',verifiedOn:'2026-11-22',key:'dol-claims-2026-11-25'};
 assert.equal(groupCalendarEvents([claimsNotice,claims]).length,1);
});
