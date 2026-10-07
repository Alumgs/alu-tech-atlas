'use client';
import {useState} from 'react';
import type {Article} from '@/lib/content';
import {concepts} from '@/lib/concepts';
export function WikiLibrary({articles}:{articles:Article[]}){
 const [query,setQuery]=useState('');const q=query.trim().toLowerCase();
 const hits=articles.filter(a=>JSON.stringify([a,concepts.filter(c=>c.article===a.id)]).toLowerCase().includes(q));
 return <div className="wiki-library"><label className="wiki-search"><span>查找知识点</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入术语、缩写或问题，如 CDU、KV Cache、逆运动学…"/><small>搜索标题、术语与正文 · {hits.length} 个专题</small></label><div className="wiki-index"><aside><b>专题目录</b>{hits.map(a=><a key={a.id} href={'#wiki-'+a.id}>{a.category} · {a.title}</a>)}</aside><div>{hits.map(a=>{const terms=concepts.filter(c=>c.article===a.id);return <article id={'wiki-'+a.id} key={a.id} className="wiki-entry"><span className="eyebrow">{a.category} / {a.level}</span><h2><a href={'/read/'+a.id}>{terms[0]?.term||a.title}</a></h2><p>{terms[0]?.definition||a.summary}</p><div className="wiki-alias">{terms[0]?.alias}</div><div className="wiki-sections">{a.sections.map((s,i)=><a key={s.title} href={'/read/'+a.id+'#section-'+i}>{s.title}</a>)}{terms.map(c=><a key={c.slug} href={'/read/'+a.id+'#'+c.slug}>词条详解：{c.term}</a>)}</div><details><summary>展开工作原理</summary><p>{terms[0]?.mechanism||a.sections[0].text}</p></details><div className="wiki-links"><a href={'/read/'+a.id}>阅读全文与算例 →</a><a href={a.source} target="_blank" rel="noreferrer">{a.sourceName} ↗</a></div></article>})}{!hits.length&&<div className="empty">当前筛选中没有匹配词条，请尝试其他术语或重置分类。</div>}</div></div></div>
}
