import test from 'node:test';
import assert from 'node:assert/strict';
import {relevantDomains,worldTopic,classifyNews,eligible,relevance} from '../lib/relevance.ts';
import {parseFeed} from '../lib/feed-parser.ts';
import type {News,FeedSource} from '../lib/content.ts';
const row=(title:string,summary=''):News=>({title,summary,source:'NVIDIA',domain:'aidc',date:'2026-10-25',url:'https://example.com/a',type:'市场洞察'});
test('generic business, networks, agency and model words cannot establish professional relevance',()=>{
 for(const title of ['Retail earnings rise','Social network launches new feature','Fashion model joins agency','Financial infrastructure expands','Agent sells property','研究报告：宏观经济展望'])assert.deepEqual(relevantDomains(row(title)),[],title);
 assert.deepEqual(relevantDomains(row('Liquid cooling for GPU data centers')),['aidc']);
 assert.deepEqual(relevantDomains(row('Humanoid robot learns grasping')),['robot']);
 assert.deepEqual(relevantDomains(row('LLM quantization reduces inference cost')),['ml']);
 assert.equal(relevance(row('New technology unveiled','GPU data center cooling update'),'aidc'),65);
});
test('world topics match words and reuse one principal category for labels and filters',()=>{
 for(const title of ['West Bank: Thousands displaced as UN warns of ethnic cleansing','UN celebrates 81 years of global cooperation'])assert.equal(worldTopic(row(title)),'国际时事');
 assert.equal(worldTopic(row('Central bank cuts interest rates')),'经济与金融');
 assert.equal(worldTopic(row('Climate scientists warn about carbon emissions')),'能源与气候');
 assert.equal(worldTopic(row('Scientists celebrate discovery')) ,'科技与科学');
 assert.equal(worldTopic(row('Hospital expands education programme')),'社会与公共政策');
 const old={...row('War displaces thousands','Trade affected'),scope:'world' as const,type:'市场洞察'};
 assert.equal(classifyNews(old).type,'国际时事');
});
test('fixed-domain feeds cannot bypass content gates; cross-domain content is routed by evidence',()=>{
 const source:FeedSource={name:'AIDC source',url:'https://example.com/rss',domain:'aidc',type:'市场洞察',description:''};
 const xml=(title:string)=>`<rss><item><title>${title}</title><link>https://example.com/a</link><pubDate>2026-10-25</pubDate></item></rss>`;
 assert.equal(parseFeed(xml('Retail earnings rise'),source,'2026-10-26').length,0);
 assert.deepEqual(parseFeed(xml('Humanoid robot learns grasping'),source,'2026-10-26').map(n=>n.domain),['robot']);
 assert.equal(eligible(row('Retail earnings rise')),false);
});
