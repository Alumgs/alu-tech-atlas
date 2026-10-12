import type {News, Domain} from './content';

export type WeChatDocxInput = {
  title: string;
  brand?: string;
  domainName: string;
  lead?: string;
  closing?: string;
  items: News[];
  generatedAt?: string;
};

const enc = new TextEncoder();
const xml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const stamp = (value: string) => {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: false}) : '发布时间未核实';
};
const safeUrl = (url: string) => /^https?:\/\//i.test(url) ? url : '';

function run(text: string, options = '') {
  return '<w:r>' + (options ? '<w:rPr>' + options + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + xml(text) + '</w:t></w:r>';
}
function paragraph(text: string, style = 'Normal', align = '') {
  const pPr = '<w:pPr>' + '<w:pStyle w:val="' + style + '"/>' + (align ? '<w:jc w:val="' + align + '"/>' : '') + '</w:pPr>';
  return '<w:p>' + pPr + run(text) + '</w:p>';
}
function linkParagraph(label: string, rid: string) {
  return '<w:p><w:pPr><w:pStyle w:val="SourceLink"/></w:pPr><w:hyperlink r:id="' + rid + '"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t xml:space="preserve">' + xml(label) + '</w:t></w:r></w:hyperlink></w:p>';
}
function sourceAdvice(n: News) {
  if (n.type === '研究论文') return '阅读建议：核对研究方法、基线、数据集、实验条件与可复现性。';
  if (n.type === '企业财报') return '阅读建议：核对报告期、会计口径、分部边界、现金流与原始披露。';
  if (n.type === '产品发布') return '阅读建议：核对正式可用时间、支持范围、版本、定价及限制条件。';
  if (n.type === '市场洞察') return '阅读建议：区分已发生事实、分析观点与预测，并回到原始数据核验。';
  return '阅读建议：正式发布前请打开原文，复核关键数字、时间和适用范围。';
}

export function createWechatDocxBlob(input: WeChatDocxInput): Blob {
  const picked = input.items.slice(0, 30);
  const generated = input.generatedAt || new Date().toISOString();
  const typeNames = [...new Set(picked.map(n => n.type).filter(Boolean))];
  const autoLead = '本期围绕' + input.domainName + '，从知域 ATLAS 当前资讯池中整理出 ' + picked.length +
    ' 条值得进一步阅读的动态，涉及' + (typeNames.join('、') || '行业资讯') + '。下文保留来源、发布时间与原文入口，便于继续核查与编辑。';
  const lead = (input.lead || '').trim() || autoLead;
  const closing = (input.closing || '').trim() || '说明：本文由知域 ATLAS 基于当前公开资讯索引辅助编排。规则化筛选用于提高阅读效率，不等同于事实核验或投资建议；关键数据、事件进展和原文语境请以原始来源为准。';
  const relationships: string[] = [];
  const body: string[] = [];
  const brand = input.brand || '知域 ATLAS';
  body.push(paragraph(input.title.trim() || (input.domainName + '精选观察'), 'Title', 'center'));
  body.push(paragraph(brand + ' · ' + input.domainName + ' · ' + new Date(generated).toLocaleDateString('zh-CN', {timeZone:'Asia/Shanghai'}), 'Subtitle', 'center'));
  body.push(paragraph('本期精选 ' + picked.length + ' 条 · 原文时间均按北京时间展示', 'Metadata', 'center'));
  body.push(paragraph('导读', 'Heading1'));
  body.push(paragraph(lead));
  body.push(paragraph('编辑提示：以下内容按来源、类型与时效进行规则化初筛；如果摘要不完整，请以原文为准，不要把标题推断扩展为已证实事实。', 'Callout'));
  body.push(paragraph('本期精选', 'Heading1'));
  picked.forEach((n, index) => {
    body.push(paragraph(String(index + 1).padStart(2, '0') + '｜' + n.title, 'Heading2'));
    body.push(paragraph('发布时间：' + stamp(n.date) + '　｜　类型：' + (n.type || '产业动态') + '　｜　来源：' + (n.source || '来源未标注'), 'Metadata'));
    const summary = (n.summary || '').trim() || '当前资讯索引未提供足够正文摘要。发布前请打开原文，补充事件背景、关键参数与适用范围。';
    body.push(paragraph('核心信息：' + summary));
    body.push(paragraph(sourceAdvice(n), 'Callout'));
    const url = safeUrl(n.url);
    if (url) {
      const rid = 'rId' + (relationships.length + 2);
      relationships.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + xml(url) + '" TargetMode="External"/>');
      body.push(linkParagraph('阅读原始资料：' + url, rid));
    }
    body.push(paragraph(''));
  });
  body.push(paragraph('结语与发布前核查', 'Heading1'));
  body.push(paragraph(closing));
  body.push(paragraph('发布前清单：核对原文链接与发布日期；将观点和预测与事实区分；检查图片版权与引用规范；确认涉及财务数字的币种、报告期及计算口径。', 'Normal'));
  body.push(paragraph('来源索引', 'Heading1'));
  picked.forEach((n, index) => {
    body.push(paragraph((index + 1) + '. ' + n.title, 'Normal'));
    const url = safeUrl(n.url);
    if (url) {
      const rid = 'rId' + (relationships.length + 2);
      relationships.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + xml(url) + '" TargetMode="External"/>');
      body.push(linkParagraph(url, rid));
    } else body.push(paragraph('原文链接未提供', 'Metadata'));
  });
  const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' +
    body.join('') +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>';
  const stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/><w:lang w:val="zh-CN" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:eastAsia="Microsoft YaHei"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:before="240" w:after="260"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:color w:val="17394B"/><w:sz w:val="34"/><w:rFonts w:eastAsia="Microsoft YaHei"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="100"/></w:pPr><w:rPr><w:color w:val="0B806A"/><w:sz w:val="22"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="180"/><w:ind w:left="0"/></w:pPr><w:rPr><w:b/><w:color w:val="0B806A"/><w:sz w:val="28"/><w:rFonts w:eastAsia="Microsoft YaHei"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="280" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="17394B"/><w:sz w:val="24"/><w:rFonts w:eastAsia="Microsoft YaHei"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Metadata"><w:name w:val="Metadata"/><w:rPr><w:color w:val="6B7C86"/><w:sz w:val="19"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Callout"><w:name w:val="Callout"/><w:pPr><w:ind w:left="240" w:right="120"/><w:spacing w:before="100" w:after="180"/></w:pPr><w:rPr><w:color w:val="526B75"/><w:sz w:val="20"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="SourceLink"><w:name w:val="Source Link"/><w:pPr><w:spacing w:after="100"/></w:pPr><w:rPr><w:color w:val="0B806A"/><w:sz w:val="18"/></w:rPr></w:style>' +
    '<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="0B806A"/><w:u w:val="single"/></w:rPr></w:style></w:styles>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    relationships.join('') + '</Relationships>';
  const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
  const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
  const core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    '<dc:title>' + xml(input.title || input.domainName + '精选观察') + '</dc:title><dc:creator>' + xml(brand) + '</dc:creator><dc:subject>微信公众号图文初稿</dc:subject><dcterms:created xsi:type="dcterms:W3CDTF">' + xml(new Date(generated).toISOString()) + '</dcterms:created></cp:coreProperties>';
  const files: Record<string, string> = {
    '[Content_Types].xml': contentTypes, '_rels/.rels': rootRels,
    'word/document.xml': documentXml, 'word/styles.xml': stylesXml,
    'word/_rels/document.xml.rels': rels, 'docProps/core.xml': core,
  };
  return new Blob([makeZip(files)], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}

function makeZip(files: Record<string, string>): Uint8Array {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c >>> 0;
  }
  const crc32 = (data: Uint8Array) => {
    let c = 0xffffffff;
    for (const b of data) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const u16 = (n: number) => Uint8Array.of(n & 255, (n >>> 8) & 255);
  const u32 = (n: number) => Uint8Array.of(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);
  const join = (parts: Uint8Array[]) => {
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { out.set(part, offset); offset += part.length; }
    return out;
  };
  const dt = new Date();
  const dosTime = (dt.getHours() << 11) | (dt.getMinutes() << 5) | Math.floor(dt.getSeconds() / 2);
  const dosDate = ((Math.max(1980, dt.getFullYear()) - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate();
  const local: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const filename = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const header = join([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), filename]);
    local.push(header, data);
    const directory = join([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), filename]);
    central.push(directory);
    offset += header.length + data.length;
  }
  const centralBytes = join(central);
  const end = join([u32(0x06054b50), u16(0), u16(0), u16(Object.keys(files).length), u16(Object.keys(files).length), u32(centralBytes.length), u32(offset), u16(0)]);
  return join([...local, centralBytes, end]);
}

export function downloadWechatDocx(input: WeChatDocxInput): string {
  const blob = createWechatDocxBlob(input);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Shanghai'}).replace(/-/g, '');
  anchor.href = url;
  anchor.download = '知域ATLAS_公众号精选_' + date + '.docx';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  return anchor.download;
}
