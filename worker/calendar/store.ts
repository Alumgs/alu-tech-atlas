import type {CalendarEvent,SourceState} from '../../lib/calendar/types';
import {ARCHIVE_START} from '../../lib/calendar/time.ts';
import {verifiedResult} from './verified-results.ts';
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');}
type Row={id:string;payload:string;first_seen:string;updated_at:string;last_checked:string;revision:string};
export const fromRow=(row:Row):CalendarEvent=>({...JSON.parse(row.payload),id:row.id,firstSeen:row.first_seen,updatedAt:row.updated_at,lastChecked:row.last_checked,revision:row.revision});
export async function saveEvents(db:D1Database,events:CalendarEvent[],now:string){
 let changed=0;
 // Reads/writes are grouped in bounded batches; no records are purged when a feed rolls off.
 for(let at=0;at<events.length;at+=20){
  const group=events.slice(at,at+20),statements:D1PreparedStatement[]=[];
  for(const input of group){
   if(input.day<ARCHIVE_START)continue;
   const id=await digest(input.sourceId+'|'+input.key),old=await db.prepare('SELECT * FROM calendar_events WHERE id=?').bind(id).first<Row>();
   const previous=old?fromRow(old):undefined;
   const evidence=verifiedResult(input);
   const event:CalendarEvent={...input,id,...(evidence&&{...evidence,status:'published' as const})};
   // A schedule-only refresh does not retract already evidenced results.
   if(previous?.result&&!event.result&&input.status!=='cancelled'&&previous.originalDate.slice(0,10)===input.originalDate.slice(0,10)){
    event.result=previous.result;event.resultUrl=previous.resultUrl;event.resultCheckedAt=previous.resultCheckedAt;event.status=previous.status;
   }
   const payload=JSON.stringify(event),{resultCheckedAt:_resultCheck,...meaningful}=event,revision=await digest(JSON.stringify(meaningful));
   if(old?.revision!==revision)changed++;
   statements.push(db.prepare('INSERT INTO calendar_versions(event_id,recorded_at,day,revision,payload) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM calendar_events WHERE id=? AND revision=?)').bind(id,now,event.day,revision,payload,id,revision));
   statements.push(db.prepare('INSERT INTO calendar_events(id,source_id,event_key,day,end_day,payload,revision,first_seen,updated_at,last_checked) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET day=excluded.day,end_day=excluded.end_day,payload=excluded.payload,revision=excluded.revision,updated_at=CASE WHEN calendar_events.revision!=excluded.revision THEN excluded.updated_at ELSE calendar_events.updated_at END,last_checked=excluded.last_checked').bind(id,event.sourceId,event.key,event.day,event.endDay||null,payload,revision,now,now,now));
  }
  if(statements.length)await db.batch(statements);
 }
 return changed;
}
export async function listEvents(db:D1Database,from:string,to:string){
 const rows=await db.prepare('SELECT * FROM calendar_events WHERE day<=? AND COALESCE(end_day,day)>=? ORDER BY day,source_id,id LIMIT 2001').bind(to,from).all<Row>();
 const current=rows.results.map(fromRow);
 // Include pointers at former dates so rescheduling remains visible in old calendar pages.
 const versions=await db.prepare('SELECT e.*,v.day AS former_day FROM calendar_versions v JOIN calendar_events e ON e.id=v.event_id WHERE v.day>=? AND v.day<=? AND e.day!=v.day GROUP BY e.id,v.day LIMIT 200').bind(from,to).all<Row&{former_day:string}>();
 const moved=versions.results.map(e=>({...fromRow(e),formerDay:e.former_day}));
 return {events:current.slice(0,2000),moved,truncated:current.length>2000};
}
export async function states(db:D1Database){return (await db.prepare('SELECT source_id,attempted_at,success_at,ok,count,error FROM calendar_source_state').all<SourceState>()).results;}

/** Attach evidence without overwriting a concurrent schedule change. */
export async function saveCalendarResult(db:D1Database,previous:CalendarEvent,evidence:{result:string;resultUrl:string;resultCheckedAt:string},now:string){
 if(previous.status==='cancelled'||!previous.revision)return false;
 if(previous.status==='published'&&previous.resultUrl===evidence.resultUrl&&previous.result===evidence.result)return false;
 const {firstSeen:_first,updatedAt:_updated,lastChecked:_checked,revision:_revision,...stored}=previous;
 const event={...stored,...evidence,status:'published' as const};
 const payload=JSON.stringify(event),{resultCheckedAt:_resultCheck,...meaningful}=event,revision=await digest(JSON.stringify(meaningful));
 const [,update]=await db.batch([
  db.prepare('INSERT INTO calendar_versions(event_id,recorded_at,day,revision,payload) SELECT ?,?,?,?,? FROM calendar_events WHERE id=? AND revision=?').bind(event.id,now,event.day,revision,payload,event.id,previous.revision),
  db.prepare('UPDATE calendar_events SET payload=?,revision=?,updated_at=? WHERE id=? AND revision=?').bind(payload,revision,now,event.id,previous.revision),
 ]);
 return Boolean(update.meta.changes);
}
