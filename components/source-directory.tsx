'use client';
import {useState} from 'react';
import {sources} from '@/lib/content';
import {catalogFor,type StreamScope} from '@/lib/intelligence';
import type {UpdateResult} from '@/hooks/use-updates';
import {BilingualText,useLanguage} from './language';
export function SourceDirectory({scope,updates,onGroup}:{scope:StreamScope;updates:UpdateResult|null;onGroup?:(group:string)=>void}){
 const {t}=useLanguage(),[query,setQuery]=useState(''),[group,setGroup]=useState('全部');
 const relevant=catalogFor(scope),groups=[...new Set(relevant.map(s=>s.group))];
 const visible=relevant.filter(s=>(group==='全部'||s.group===group)&&JSON.stringify(s).toLowerCase().includes(query.toLowerCase()));
 const live=sources.filter(s=>scope==='world'?s.scope==='world':s.scope!=='world'&&(s.domain==='both'||s.domain===scope));
 return <section className="source-library" id="source-directory"><div className="section-heading"><h2>{t('专业来源库')}</h2><span>{t('主栏目与研报共用来源','Shared with research reports')}</span></div><p>{t('原始订阅、机构新闻索引、数据接口与参考入口分开标注。组内采集成功不表示每家机构都有新文章。','Direct feeds, institutional indexes, data APIs and reference links are labeled separately. Group success does not imply a new article from every institution.')}</p>
 <details className="live-source-list"><summary>{t('本视角的自动采集源','Automatic feeds in this view')} · {live.length}</summary><div className="source-catalog">{live.map(s=>{const status=updates?.statuses.find(x=>x.name===s.name);return <article key={s.name}><span className="eyebrow">{s.kind==='新闻聚合'||s.url.includes('news.google.com')?t('聚合索引'):t('原站订阅','Direct feed')}</span><h3>{s.name}</h3><p><BilingualText text={s.description}/></p><small>{status?t(status.ok?'已检查':'采集失败',status.ok?'Checked':'Fetch failed')+' · '+status.count:t('等待检查','Pending')}</small>{status?.error&&<small>{status.error}</small>}<a href={s.url} target="_blank" rel="noreferrer">{t('打开订阅源','Open feed')} ↗</a></article>;})}</div></details>
 <label className="catalog-search">{t('搜索机构或主题','Search institutions or topics')}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('例如 IDC、政策、世界模型','e.g. IDC, policy, world models')}/></label><div className="filter-row">{['全部',...groups].map(g=><button key={g} className={group===g?'selected':''} onClick={()=>setGroup(g)}>{t(g)}</button>)}</div>
 <div className="source-catalog">{visible.map(s=>{const names=live.filter(f=>f.catalogGroup===s.feedGroup).map(f=>f.name);const status=updates?.statuses.find(x=>names.includes(x.name));return <article key={s.id}><span className="eyebrow">{t(s.group)} / {t(s.mode)}</span><h3>{s.name}</h3><p><BilingualText text={s.purpose}/></p><small><BilingualText text={s.note}/></small>{s.feedGroup&&<p className="catalog-status">{t('索引组','Index group')}: {t(s.feedGroup)} · {status?(status.ok?t('已检查','Checked')+' · '+status.count:status.error):t('等待检查','Pending')}<small>{t('组内计数，非本机构单独命中数','Group total, not a count for this institution')}</small></p>}<div className="source-actions"><a href={s.url} target="_blank" rel="noreferrer">{t('访问原始资料','Original source')} ↗</a>{s.feedGroup&&onGroup&&live.some(f=>f.catalogGroup===s.feedGroup)&&<button onClick={()=>onGroup(s.feedGroup)}>{t('查看本组动态','View group news')} ↑</button>}</div></article>;})}</div>{!visible.length&&<p className="empty">{t('没有匹配来源，请调整筛选。','No matching sources. Adjust the filters.')}</p>}
 </section>;
}
