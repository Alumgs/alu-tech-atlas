import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSource} from '../lib/domestic-feeds.ts';
import {sources,type News} from '../lib/content.ts';
import {worldTopic} from '../lib/relevance.ts';
import {selectBriefs} from '../lib/selection.ts';
import {clusterStories} from '../lib/editorial.ts';
const now='2026-10-27T01:00:00Z';
test('domestic financial JSON retains source timestamp and routes to China economy',()=>{
 const source=sources.find(s=>s.format==='ths')!;
 const rows=parseSource(JSON.stringify({data:{list:[{title:'沪指上涨，银行板块拉升',digest:'金融市场资讯',url:'https://news.10jqka.com.cn/20261026/c1.shtml',ctime:1793000000}]}}),source,now);
 assert.equal(rows.length,1);assert.equal(rows[0].region,'cn');assert.equal(worldTopic(rows[0]),'经济与金融');assert.notEqual(rows[0].date,now);
});
test('Zhihu exact URL IDs, discussion label and question dates survive JSON parsing',()=>{
 const source=sources.find(s=>s.format==='zhihu')!;
 const rows=parseSource(JSON.stringify({data:[{target:{id:2098093756930942177,title:'如何评价这场足球比赛？',url:'https://api.zhihu.com/questions/2098093756930942177',created:1793000000,excerpt:'讨论比赛'}}]}),source,now);
 assert.equal(rows[0].url,'https://www.zhihu.com/question/2098093756930942177');assert.equal(rows[0].type,'社区热议');assert.equal(rows[0].region,'cn');assert.equal(worldTopic(rows[0]),'国内热议');
});
test('government policy form remains independent from economic or technology topic',()=>{
 const source=sources.find(s=>s.name==='中国政府网 · 政策原文')!;
 const rows=parseSource('<rss><item><title>国务院关于人工智能产业发展的指导意见</title><link>https://www.gov.cn/zhengce/content/1.htm</link><pubDate>2026-10-26</pubDate><description>推进科技创新与人工智能。</description></item></rss>',source,now);
 assert.equal(rows[0].type,'政策法规');assert.equal(worldTopic(rows[0]),'科技与科学');assert.equal(rows[0].region,'cn');
});
test('briefs exclude short alerts and community posts and cap publisher concentration',()=>{
 const material=(i:number,props:Partial<News>={}):News=>({title:'GPU data center '+i,url:'https://nvidia.com/a/'+i,date:'2026-10-26T00:00:00Z',source:'NVIDIA',type:'技术研究',domain:'aidc',summary:'A detailed source description about GPU data center deployments and cooling performance.',...props});
 const events=clusterStories([material(1),material(2),material(3),material(4,{summary:'Short'}),material(5,{type:'社区热议'})],Date.parse(now));
 assert.equal(events.length,5);assert.equal(selectBriefs(events,'aidc').length,2);
});
