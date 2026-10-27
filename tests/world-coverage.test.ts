import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOfficialNews,articleDescription} from '../lib/official-news.ts';
import {sources,type News} from '../lib/content.ts';
import {eligible,worldTopic} from '../lib/relevance.ts';
import {balanceWorld,selectBriefs} from '../lib/selection.ts';
import {clusterStories} from '../lib/editorial.ts';
test('dated official IPO notices reach both scopes and retain the calendar date',()=>{
 const html='<ul><li data-listing-row="1"><a href="/news/s1-sec"><h3>Anthropic files S-1 for proposed initial public offering</h3></a><time>Oct 26, 2026</time></li><li data-listing-row="2"><a href="/news/unknown"><h3>Undated</h3></a></li></ul>';
 for(const name of ['Anthropic · 官方新闻室','Anthropic · 世界公司动态']){
  const rows=parseOfficialNews(html,sources.find(s=>s.name===name)!,'2026-10-27');
  assert.equal(rows.length,1);assert.equal(rows[0].date,'2026-10-26');assert.ok(eligible(rows[0]));assert.equal(worldTopic(rows[0]),'经济与金融');assert.equal(rows[0].url,'https://www.anthropic.com/news/s1-sec');
 }
 assert.equal(articleDescription('<meta property="og:description" content="Filed an S-1 &amp; announced plans.">'),'Filed an S-1 & announced plans.');
});
test('world recommendations expose international coverage alongside dense domestic financial alerts',()=>{
 const n=(i:number,props:Partial<News>={}):News=>({title:'金融市场上涨 '+i,source:'同花顺',url:'https://news.10jqka.com.cn/'+i,date:'2026-10-26T01:00:00Z',domain:'aidc',scope:'world',type:'市场洞察',summary:'A source summary with enough detail about the specific reported development and its context.',region:'cn',...props});
 const items=[...Array.from({length:20},(_,i)=>n(i)),n(30,{title:'Diplomats agree ceasefire',source:'BBC',url:'https://bbc.com/a',type:'国际时事',region:undefined}),n(31,{title:'Scientists discover new planet',source:'BBC',url:'https://bbc.com/b',type:'科技与科学',region:undefined}),n(32,{title:'Anthropic files S-1 for IPO',source:'Anthropic',url:'https://anthropic.com/a',type:'企业财报',region:undefined})];
 const events=clusterStories(items,Date.parse('2026-10-27'));
 const first=balanceWorld(events).slice(0,12);assert.ok(first.some(e=>e.primary.source==='BBC'));assert.ok(first.some(e=>e.primary.source==='Anthropic'));assert.ok(first.some(e=>e.primary.source==='同花顺'));
 assert.ok(selectBriefs(balanceWorld(events),'world').some(e=>e.primary.source==='BBC'));
});
