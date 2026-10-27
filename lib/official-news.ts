import type {FeedSource,News} from './content';
import {classifyNews,contentType} from './relevance.ts';
const clean=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/\s+/g,' ').trim();
/** Anthropic's public newsroom rows carry source dates; missing dates never get invented. */
export function parseOfficialNews(raw:string,source:FeedSource,checkedAt:string):News[]{
 const rows=raw.match(/<li\b[^>]*data-listing-row[^>]*>[\s\S]*?<\/li>/gi)||[];
 return rows.slice(0,40).flatMap(row=>{
  const path=row.match(/href="(\/news\/[a-z0-9-]+)"/i)?.[1],title=clean(row.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]||'');
  const dateText=clean(row.match(/<time\b[^>]*>([\s\S]*?)<\/time>/i)?.[1]||''),parts=dateText.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/),month=parts?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[1]):-1,stamp=parts&&month>=0?Date.UTC(Number(parts[3]),month,Number(parts[2])):NaN;
  if(!path||!title||!Number.isFinite(stamp)||stamp>Date.now()+300000)return [];
  const summary=clean(row.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1]||'').slice(0,1000),url='https://www.anthropic.com'+path;
  const type=contentType({title,url,type:/\bIPO\b|S-1|public offering|funding|raises|valuation/i.test(title)?'企业财报':'技术研究'});
  return [classifyNews({title,url,date:new Date(stamp).toISOString().slice(0,10),summary:summary||undefined,source:source.name,feedId:source.name,feed:source.name,domain:'ml',type,scope:source.scope,sourceKind:'官方直连',collectedAt:checkedAt,worldCategory:'科技与科学'})];
 });
}
export function articleDescription(html:string){
 for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
  if(!/(?:name|property)=["'](?:description|og:description)["']/i.test(tag))continue;
  const text=tag.match(/content="([^"]*)"/i)?.[1]||tag.match(/content='([^']*)'/i)?.[1];if(text)return clean(text).slice(0,1000);
 }
 return '';
}
