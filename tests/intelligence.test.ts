import test from 'node:test';
import assert from 'node:assert/strict';
import {inStream,sourceGroup,catalogFor} from '../lib/intelligence.ts';
import {parseFeed} from '../lib/feed-parser.ts';
import {clusterStories} from '../lib/editorial.ts';
import {sources,type News,type FeedSource} from '../lib/content.ts';
import {translateText} from '../worker/translate.ts';
const request=(body:unknown)=>new Request('https://atlas.test/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const news=(props:Partial<News>={}):News=>({title:'Central bank changes monetary policy',source:'BBC',url:'https://bbc.com/a',date:'2026-10-25T00:00:00Z',domain:'aidc',type:'政策法规',...props});

test('world news bypasses AI keyword gates and cannot enter professional streams',()=>{
 const source:FeedSource={name:'World',domain:'both',url:'https://bbc.com/rss',scope:'world',type:'国际时事',description:'World news'};
 const rss='<rss><channel><item><title>Diplomats agree a ceasefire</title><link>https://bbc.com/news/a</link><pubDate>Sun, 25 Oct 2026 00:00:00 GMT</pubDate><description>Delegates agreed to resume talks.</description></item></channel></rss>';
 const global=parseFeed(rss,source,'2026-10-26T00:00:00Z');
 assert.equal(global.length,1);assert.equal(inStream(global[0],'world'),true);
 for(const domain of ['aidc','robot','ml'] as const)assert.equal(inStream(global[0],domain),false);
 assert.equal(parseFeed(rss,{...source,scope:undefined},'2026-10-26T00:00:00Z').length,0);
 assert.equal(clusterStories([news(),news({scope:'world'})],Date.parse('2026-10-26')).length,2);
});
test('institution index provenance survives parsing and uses the shared directory',()=>{
 const source=sources.find(s=>s.catalogGroup==='前沿 AI 研究')!;
 const rows=parseFeed('<rss><channel><item><title>AI agent model research</title><link>https://openai.com/research/example</link><pubDate>Sun, 25 Oct 2026 00:00:00 GMT</pubDate></item></channel></rss>',source,'2026-10-26');
 assert.ok(rows.length);assert.equal(sourceGroup(rows[0]),source.catalogGroup);
 assert.ok(catalogFor('ml').some(s=>s.feedGroup===source.catalogGroup));
 assert.ok(catalogFor('world').every(s=>['宏观与政策','市场与媒体','机构研报'].includes(s.group)));
});
test('translation validates input before model calls and keeps source text on failure',async()=>{
 let calls=0;const AI={run:async()=>{calls++;return {translated_text:'Translated 99 MW'};}};
 assert.equal((await translateText(request({target:'xx',texts:['hello']}),{AI})).status,400);
 assert.equal((await translateText(request({target:'en',texts:Array(9).fill('a')}),{AI})).status,400);
 assert.equal(calls,0);
 const r=await translateText(request({target:'en',texts:['液冷负载 12 MW']}),{AI});
 const data=await r.json() as {items:Array<{text:string;translation?:string;error?:string}>};
 assert.equal(data.items[0].text,'液冷负载 12 MW');assert.equal(data.items[0].translation,undefined);assert.ok(data.items[0].error);
});
test('translation reuses content-hash cache and never changes numeric evidence',async()=>{
 let calls=0;const values=new Map<string,string>();
 const store={get:async(key:string)=>values.get(key)||null,put:async(key:string,value:string)=>{values.set(key,value);}};
 const AI={run:async()=>{calls++;return {translated_text:'Liquid cooling load 12 MW'};}};
 const env={AI,ATLAS_SETTINGS:store as unknown as KVNamespace};
 const body={target:'en',texts:['液冷负载 12 MW']};
 for(let i=0;i<2;i++){
  const r=await translateText(request(body),env);const d=await r.json() as {items:Array<{translation?:string}>};
  assert.equal(d.items[0].translation,'Liquid cooling load 12 MW');
 }
 assert.equal(calls,1);assert.equal(values.size,1);
 const absent=await translateText(request(body),{});assert.equal(absent.status,503);
});
