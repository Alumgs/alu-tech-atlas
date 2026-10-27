import test from 'node:test';
import assert from 'node:assert/strict';
import {clusterStories,selectEdition,sourceTier} from '../lib/editorial.ts';
import {publicUrl,canonicalUrl} from '../lib/url-safety.ts';
import {publicationLabel} from '../lib/publication-time.ts';
import {parseFeed} from '../lib/feed-parser.ts';
import {boundedJson,RequestError} from '../lib/http-safety.ts';
import {allowedArticleUrl} from '../lib/source-policy.ts';
import {editorialEnrich} from '../worker/editorial.ts';
import type {News,FeedSource} from '../lib/content';
const now=Date.parse('2026-10-13T10:00:00Z');
const news=(extra:Partial<News>={}):News=>({title:'NVIDIA 发布高密度液冷计算平台技术方案',url:'https://developer.nvidia.com/blog/atlas-test',date:'2026-10-13T00:00:00Z',source:'NVIDIA Developer',domain:'aidc',type:'技术研究',summary:'来源说明高密度计算平台的适用条件、系统约束和工程验证过程，具体性能应以原文注明的工作负载为准。',...extra});

test('canonical URL suppresses tracking copies while retaining article IDs and domain coverage',()=>{
 const a=news({url:'https://developer.nvidia.com/blog/atlas-test?article=1&utm_source=email#part'});
 const b=news({url:'https://developer.nvidia.com/blog/atlas-test?article=1&utm_medium=share'});
 const c=news({url:'https://developer.nvidia.com/blog/atlas-test?article=2',title:'机器人操作策略与实验基线',domain:'robot'});
 assert.equal(canonicalUrl(a.url),canonicalUrl(b.url));
 assert.equal(clusterStories([a,b,c],now).length,2);
});
test('version updates and future/malformed dates cannot be merged into a misleading current event',()=>{
 const a=news({title:'NVIDIA 发布 GPU 平台 v1 完整技术方案'});
 const b=news({title:'NVIDIA 发布 GPU 平台 v2 完整技术方案',url:'https://developer.nvidia.com/blog/version2'});
 assert.equal(clusterStories([a,b],now).length,2);
 assert.equal(clusterStories([news({date:'invalid'}),news({date:'2035-01-01'})],now).length,0);
});
test('associated reports stay visible and one publisher cannot inflate event heat',()=>{
 const a=news(),b=news({url:'https://developer.nvidia.com/blog/atlas-test-duplicate'});
 const c=news({url:'https://www.datacenterdynamics.com/en/news/atlas-test',source:'DCD'});
 const event=clusterStories([b,c,a],now)[0];
 assert.equal(event.reports.length,3);assert.equal(event.sourceCount,2);
 assert.equal(event.heat,Math.round(200*Math.pow(.5,10/24)));
});
test('official-looking labels cannot upgrade an unreviewed publisher',()=>{
 assert.equal(sourceTier(news({url:'https://unknown-publisher.com/a',source:'官方政府研究院',sourceKind:'官方直连'})),'other');
 assert.equal(sourceTier(news()),'primary');
 assert.equal(sourceTier(news({url:'https://news.google.com/rss/articles/a',source:'NVIDIA 官方'})),'aggregate');
});
test('automatic editions reject title-only and stale items and cap each publisher at two',()=>{
 const rows=Array.from({length:5},(_,i)=>news({url:'https://developer.nvidia.com/blog/article-'+i,title:'独立技术主题 '+i+' 的验证方法'}));
 rows.push(news({url:'https://www.datacenterdynamics.com/en/news/research',title:'数据中心容量规划与网络效率的独立工程研究',source:'DCD'}));
 const selected=selectEdition([...rows,news({url:'https://arxiv.org/abs/2601.99999',summary:''}),news({url:'https://arxiv.org/abs/2601.99998',stale:true})],12,0,now);
 assert.equal(selected.length,3);assert.ok(selected.every(n=>!n.stale&&(n.summary||'').length>=25));
});
test('public links reject credentials, private IP variants, internal names and unsafe protocols',()=>{
 for(const value of ['javascript:alert(1)','https://user:pass@nvidia.com/','http://127.0.0.1','http://2130706433','http://0x7f000001','http://[::1]','https://metadata.internal/a','https://nvidia.com:8080/a','https://nvidia.com/\n'])assert.equal(publicUrl(value),null,value);
 assert.equal(allowedArticleUrl('https://unreviewed-site.com/a'),null);
 assert.ok(allowedArticleUrl('https://developer.nvidia.com/blog/article'));
 assert.equal(allowedArticleUrl('https://developer.nvidia.com.attacker.com/a'),null);
});
test('RSS and Atom preserve dates and snippets, choose alternate links and reject unsafe links',()=>{
 const source:FeedSource={name:'测试来源',url:'https://arxiv.org/rss/cs.LG',domain:'ml',type:'研究论文',description:''};
 const xml='<feed><entry><title>机器学习研究 &amp; 验证</title><link rel="self" href="https://arxiv.org/api/1"/><link rel="alternate" href="https://arxiv.org/abs/2601.1?utm_source=rss"/><published>2026-01-01T00:00:00Z</published><summary><![CDATA[<p>公开实验摘要与基线</p>]]></summary></entry><entry><title>恶意链接</title><link href="javascript:alert(1)"/><published>2026-01-01</published></entry><entry><title>无可信日期</title><link href="https://arxiv.org/abs/2"/></entry></feed>';
 const rows=parseFeed(xml,source,'2026-10-13T00:00:00Z');
 assert.equal(rows.length,1);assert.equal(rows[0].url,'https://arxiv.org/abs/2601.1');assert.equal(rows[0].summary,'公开实验摘要与基线');assert.equal(rows[0].date,'2026-01-01T00:00:00.000Z');assert.equal(rows[0].feedId,source.name);
});
test('JSON byte limits cover chunked requests and malformed media types',async()=>{
 const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{"x":"'+('中'.repeat(8000))+'"}'));controller.close();}});
 const request=new Request('https://atlas.test/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'} as RequestInit);
 await assert.rejects(()=>boundedJson(request),e=>e instanceof RequestError&&e.status===413);
 await assert.rejects(()=>boundedJson(new Request('https://atlas.test',{method:'POST',body:'{}'})),e=>e instanceof RequestError&&e.status===415);
 await assert.rejects(()=>boundedJson(new Request('https://atlas.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'[]'})),e=>e instanceof RequestError&&e.status===400);
});
test('extraction refuses unknown hosts without network or model calls',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=(async()=>{calls++;throw Error('must not fetch');}) as typeof fetch;
 try{
  const result=await editorialEnrich(new Request('https://atlas.test/api/editorial/enrich',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[news({url:'https://unknown-publisher.com/a'})]})}),{AI:{run:async()=>{calls++;return {};}}});
  const data=await result.json() as {items:Array<{pageStatus:string}>;aiCount:number};
  assert.equal(calls,0);assert.equal(data.aiCount,0);assert.match(data.items[0].pageStatus,/不在自动读取目录/);
 }finally{globalThis.fetch=original;}
});
test('AI additions without source evidence are discarded while source text survives',async()=>{
 const original=globalThis.fetch,material='本次发布液冷系统工程方案，说明适用场景、部署边界、测试条件与维护要求。原文没有给出市场规模、订单金额或性能增长数值。';
 globalThis.fetch=(async()=>new Response('<html><article>'+material.repeat(8)+'</article></html>',{headers:{'Content-Type':'text/html'}})) as typeof fetch;
 try{
  const result=await editorialEnrich(new Request('https://atlas.test/api/editorial/enrich',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[news()]})}),{AI:{run:async()=>({response:JSON.stringify({items:[{id:'0',summaryZh:'已实现 999% 性能增长并收到大量订单。',evidenceQuote:material,keyPoints:[]}]})})}});
  const data=await result.json() as {items:Array<{aiEnhanced:boolean;summaryZh:string}>;aiCount:number};
  assert.equal(data.aiCount,0);assert.equal(data.items[0].aiEnhanced,false);assert.ok(!data.items[0].summaryZh.includes('999%'));
 }finally{globalThis.fetch=original;}
});
test('patched build parser bounds nesting before recursive AST traversal',async()=>{
 const {createRequire}=await import('node:module');const {readdirSync}=await import('node:fs');
 const root=new URL('../node_modules/.pnpm/',import.meta.url);
 const folder=readdirSync(root).find(name=>/^braces@3\.0\.3(?:_|$)/.test(name));
 assert.ok(folder,'patched braces dependency must be installed');
 const braces=createRequire(import.meta.url)(new URL(folder+'/node_modules/braces/index.js',root).pathname);
 assert.deepEqual(braces.expand('src/**/*.{ts,tsx}'),['src/**/*.ts','src/**/*.tsx']);
 assert.throws(()=>braces.parse('{'.repeat(300)+'a'+'}'.repeat(300)),/128-level safety limit/);
});

test('date-only sources retain calendar dates and are never displayed with an invented clock',()=>{
 assert.equal(publicationLabel('2026-10-13'),'2026-10-13（原文仅提供日期）');
 assert.ok(publicationLabel('2026-10-13T00:00:00Z').includes('08:00'));
 const source:FeedSource={name:'资料源',url:'https://arxiv.org/rss/cs.LG',domain:'ml',type:'研究论文',description:''};
 const rows=parseFeed('<rss><item><title>机器学习日期示例</title><link>https://arxiv.org/abs/2601.2</link><pubDate>2026-01-01</pubDate></item></rss>',source,'2026-10-13T00:00:00Z');
 assert.equal(rows[0].date,'2026-01-01');
});
