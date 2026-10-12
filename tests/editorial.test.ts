import test from 'node:test';
import assert from 'node:assert/strict';
import {dedupeStories,rankNews,scoreNews} from '../lib/editorial.ts';
import type {News} from '../lib/content';

const item=(overrides:Partial<News>={}):News=>({
  title:'AIDC 液冷系统发布技术方案',
  url:'https://example.com/a',
  date:'2026-10-11T09:00:00+08:00',
  source:'官方技术中心',
  sourceKind:'官方直连',
  domain:'aidc',
  type:'技术研究',
  summary:'官方材料详细说明液冷系统部署条件、设计参数与验证范围。',
  ...overrides,
});

test('editorial score is bounded and prioritizes fresh primary-source research',()=>{
  const strong=item();
  const weak=item({title:'旧活动回顾',url:'https://example.com/b',date:'2025-01-01',source:'新闻聚合',sourceKind:'新闻聚合',type:'行业活动',summary:'',stale:true,historical:true});
  assert.ok(scoreNews(strong)>=0&&scoreNews(strong)<=100);
  assert.ok(scoreNews(strong)>scoreNews(weak));
});

test('duplicate suppression prefers stronger sources and keeps unrelated items',()=>{
  const preferred=item({url:'https://example.com/official',source:'官方技术中心',sourceKind:'官方直连'});
  const duplicate=item({url:'https://example.com/media',title:'AIDC液冷系统发布技术方案！',source:'新闻聚合',sourceKind:'新闻聚合'});
  const distinct=item({url:'https://example.com/distinct',title:'GPU 集群互联带宽与拓扑设计',source:'专业媒体',sourceKind:'媒体直连',type:'市场洞察'});
  const result=dedupeStories([duplicate,distinct,preferred]);
  assert.ok(result.some(n=>n.url===preferred.url));
  assert.ok(!result.some(n=>n.url===duplicate.url));
  assert.ok(result.some(n=>n.url===distinct.url));
  assert.equal(rankNews([duplicate,preferred]).length,1);
});
