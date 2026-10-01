import { writeFile } from 'node:fs/promises';

const sources = [
  {domain:'ml', category:'产业动态', name:'OpenAI News', url:'https://openai.com/news/rss.xml'},
  {domain:'aidc', category:'产业动态', name:'NVIDIA Blog', url:'https://blogs.nvidia.com/feed/'},
  {domain:'embodied', category:'科研进展', name:'NVIDIA Blog', url:'https://blogs.nvidia.com/feed/'}
];

const keywords = {
  aidc:['data center','data centre','ai factory','liquid cooling','rack','network','ethernet','power','vdc','spectrum','nvlink'],
  embodied:['robot','robotics','physical ai','world model','cosmos','simulation','vla','isaac','gr00t'],
  ml:['agent','model','reasoning','inference','api','codex','gpt','training','small model','runtime']
};

function decode(s=''){
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
}
function tag(block,name){ return (block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'))||[])[1]||''; }
function linkOf(block){ return decode(tag(block,'link')) || ((block.match(/<link[^>]+href=["']([^"']+)/i)||[])[1]||''); }
function parseRSS(xml){
  const blocks=[...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map(m=>m[0]);
  return blocks.slice(0,30).map(b=>({
    title:decode(tag(b,'title')), url:linkOf(b),
    date:decode(tag(b,'pubDate')||tag(b,'published')||tag(b,'updated')),
    summary:decode(tag(b,'description')||tag(b,'summary')||tag(b,'content'))
  })).filter(x=>x.title&&x.url);
}
function score(item,domain){
  const t=(item.title+' '+item.summary).toLowerCase();
  return keywords[domain].reduce((s,k)=>s+(t.includes(k)?1:0),0);
}
async function fetchText(url){
  const r=await fetch(url,{headers:{'user-agent':'TechnologyAtlasBot/3.0'}});
  if(!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

const all=[];
for(const s of sources){
  try{
    const xml=await fetchText(s.url);
    for(const item of parseRSS(xml)){
      const sc=score(item,s.domain);
      if(sc<1) continue;
      all.push({
        domain:s.domain, category:s.category, technology:'自动分类',
        company:s.name.includes('OpenAI')?'OpenAI':s.name.includes('NVIDIA')?'NVIDIA':'',
        published_at:item.date?new Date(item.date).toISOString().slice(0,10):new Date().toISOString().slice(0,10),
        verified_at:new Date().toISOString().slice(0,10),
        title:item.title, facts:item.summary.slice(0,260),
        what_changed:'来自官方源的新条目；自动刷新层负责发现，不自动改写主知识手册。',
        why_it_matters:'高价值变化应经过人工核验后再进入长期知识图谱。',
        source:s.name, url:item.url, score:sc
      });
    }
  }catch(e){ console.warn('source failed:',s.name,e.message); }
}
const dedup=[...new Map(all.sort((a,b)=>b.published_at.localeCompare(a.published_at)||b.score-a.score).map(x=>[x.url,x])).values()].slice(0,30);
await writeFile(new URL('../data/daily.json',import.meta.url),JSON.stringify({updated_at:new Date().toISOString(),items:dedup},null,2)+'\n');
console.log(`wrote ${dedup.length} items`);
