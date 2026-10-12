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
