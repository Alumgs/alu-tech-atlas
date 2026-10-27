import {parseFeed} from './feed-parser.ts';
import {classifyNews,relevantDomains} from './relevance.ts';
import {publicUrl,canonicalUrl} from './url-safety.ts';
import type {FeedSource,News} from './content';
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};
const plain=(v:unknown)=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim():'';
export function parseSource(raw:string,source:FeedSource,checkedAt:string,fallback=false):News[]{
 if(!source.format)return parseFeed(raw,source,checkedAt,fallback);
 const payload=obj(JSON.parse(raw)),data=source.format==='zhihu'?payload.data:obj(payload.data).list;
 if(!Array.isArray(data))throw Error('来源 JSON 格式无效');
 return data.slice(0,100).flatMap(value=>{
  const item=obj(value),entry=source.format==='zhihu'?obj(item.target):item;
  const title=plain(entry.title).slice(0,350),summary=plain(source.format==='zhihu'?entry.excerpt:entry.digest||entry.short).slice(0,1000);
  // Zhihu question IDs exceed JS safe integers: recover the exact ID from its string URL.
  const id=typeof entry.url==='string'?entry.url.match(/questions\/(\d+)/)?.[1]:undefined;
  const url=source.format==='zhihu'?(id?'https://www.zhihu.com/question/'+id:''):entry.url;
  const stamp=Number(source.format==='zhihu'?entry.created:entry.ctime)*1000;
  if(!title||!publicUrl(url)||!Number.isFinite(stamp)||stamp<=0||stamp>Date.now()+300000)return [];
  const domains=source.scope==='world'?['aidc' as const]:relevantDomains({title,summary});
  return domains.map(domain=>classifyNews({title,summary,url:canonicalUrl(String(url)),date:new Date(stamp).toISOString(),source:source.name,feedId:source.name,feed:source.name,domain,type:source.type,scope:source.scope,region:source.region,language:source.language,sourceKind:source.format==='zhihu'?'社区讨论':source.kind,collectedAt:checkedAt,worldCategory:source.format==='ths'?'经济与金融':'国内热议'}));
 });
}
