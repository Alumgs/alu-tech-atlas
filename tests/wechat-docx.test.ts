import test from 'node:test';
import assert from 'node:assert/strict';
import {createWechatDocxBlob} from '../lib/wechat-docx.ts';

test('creates a real OpenXML docx archive with editable Chinese article content', async () => {
  const blob = createWechatDocxBlob({
    title: 'AIDC 产业观察｜液冷与算力',
    domainName: 'AIDC 智算中心',
    lead: '从精选动态出发，保留原始来源。',
    items: [{
      title: '液冷系统与高密度算力部署',
      url: 'https://example.com/report?a=1&b=2',
      date: '2026-10-10T08:00:00+08:00',
      source: '测试官方来源',
      domain: 'aidc',
      type: '技术研究',
      summary: '正文摘要中包含关键条件与验证范围。',
    }],
    generatedAt: '2026-10-12T00:00:00.000Z',
  });
  assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  const archiveText = new TextDecoder().decode(bytes);
  assert.ok(archiveText.includes('[Content_Types].xml'));
  assert.ok(archiveText.includes('液冷系统与高密度算力部署'));
  assert.ok(archiveText.includes('https://example.com/report?a=1&amp;b=2'));
  assert.ok(archiveText.includes('来源索引'));
});

test('Word export includes page-read status and links to the fetched canonical page', async () => {
  const blob=createWechatDocxBlob({title:'ATLAS 周报',editionType:'周报',domainName:'AIDC 智算中心',items:[{title:'原始标题',url:'https://news.example.com/redirect',pageUrl:'https://news.example.com/article',pageTitle:'网页实际标题',pageStatus:'网页正文已读取',pageFetchedAt:'2026-10-12T08:00:00+08:00',date:'2026-10-12T08:00:00+08:00',source:'测试来源',domain:'aidc',type:'技术研究',summary:'订阅摘要',summaryZh:'这是中文摘要。',aiEnhanced:true}],generatedAt:'2026-10-12T00:00:00.000Z'});
  const text=new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()));
  assert.ok(text.includes('网页实际标题'));
  assert.ok(text.includes('网页正文已读取'));
  assert.ok(text.includes('https://news.example.com/article'));
  assert.ok(text.includes('ATLAS 周报'));
});
test('DOCX excludes duplicate tracking links, escapes XML and preserves supporting reports',async()=>{
 const item={title:'来源标题\u0000<script>text</script>',url:'https://example.com/a?utm_source=mail',date:'2026-10-13T00:00:00Z',source:'来源',domain:'aidc' as const,type:'技术研究',summary:'可信材料摘要',evidenceQuote:'仅保留来源已提供的文字',relatedReports:[{title:'同一报道',url:'https://example.org/a',date:'2026-10-13T00:00:00Z',source:'另一个来源',domain:'aidc' as const,type:'技术研究'}]};
 const blob=createWechatDocxBlob({title:'工程观察',domainName:'AIDC',items:[item,{...item,url:'https://example.com/a?utm_source=share'}]});
 const xml=new TextDecoder().decode(await blob.arrayBuffer());
 assert.ok(xml.includes('本期精选 1 条'));assert.ok(xml.includes('&lt;script&gt;'));assert.ok(!xml.includes('来源标题\u0000'));
 assert.ok(xml.includes('支撑摘录'));assert.ok(xml.includes('https://example.org/a'));
});
