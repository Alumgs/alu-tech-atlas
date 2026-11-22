export type CalendarCategory='macro'|'central-bank'|'politics'|'earnings'|'technology'|'policy'|'market';
export const categoryNames:Record<CalendarCategory,[string,string]>={market:['市场与交易','Markets & trading'],policy:['政策生效','Policy effective dates'],macro:['经济数据','Economic data'],'central-bank':['央行与政策','Central banks'],politics:['政治与选举','Politics & elections'],earnings:['公司财报','Company earnings'],technology:['科技与产业','Technology & industry']};
export type CalendarStatus='scheduled'|'tentative'|'published'|'cancelled';
export type CalendarEvent={
 id:string;sourceId:string;sourceName:string;sourceUrl:string;url:string;key:string;
 title:string;category:CalendarCategory;region:string;country:string;importance:'major'|'normal';
 day:string;endDay?:string;startAt?:string;originalDate:string;timezone:string;
 certainty:'official'|'institutional'|'tentative';status:CalendarStatus;summary:string;
 result?:string;resultUrl?:string;resultCheckedAt?:string;
 verifiedOn?:string;
 relatedEvents?:CalendarEvent[];
 firstSeen?:string;lastChecked?:string;updatedAt?:string;revision?:string;
};
export type CalendarSource={id:string;name:string;url:string;parser:'ics'|'nbs'|'bea'|'fed'|'ecb'|'elections'|'q4'|'microsoft'|'eurostat'|'boe'|'boj'|'amd'|'china-ir'|'alibaba'|'tencent'|'apec'|'gov-policy'|'lpr'|'nato'|'fed-events'|'nyse'|'census'|'dell';category:CalendarCategory;region:string;country:string;timezone:string;level:'official'|'institutional';note:string};
export type SourceState={source_id:string;attempted_at:string|null;success_at:string|null;ok:number;count:number;error:string|null};
export type CalendarPayload={events:CalendarEvent[];sources:Array<CalendarSource&{state?:SourceState}>;today:string;from:string;to:string;archiveStart:string;storage:string};
