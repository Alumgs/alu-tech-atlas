'use client';
import {inStream} from '@/lib/intelligence';
import {relevance} from '@/lib/relevance';
import {useMemo,useState,lazy,Suspense} from 'react';
const MarketChart=lazy(()=>import('./market-chart').then(m=>({default:m.MarketChart})));
import {Flame,Globe2,ArrowUpRight} from 'lucide-react';
import {clusterStories} from '@/lib/editorial';
import {sourceGroup,type StreamScope} from '@/lib/intelligence';
import {sources,newsTypes,type News,type Domain} from '@/lib/content';
import type {UpdateResult} from '@/hooks/use-updates';
import {NewsFeed} from './news-feed';
import {SourceDirectory} from './source-directory';
import {BilingualText,useLanguage} from './language';
export function IntelligenceStream({scope,domain,domainName,items,updates,loading,showMarketChart=false}:{scope:StreamScope;domain:Domain;domainName:string;items:News[];updates:UpdateResult|null;loading:boolean;showMarketChart?:boolean}){
 const {t}=useLanguage(),[type,setType]=useState('全部'),[group,setGroup]=useState('全部'),[publisher,setPublisher]=useState('全部');
 const groups=[...new Set(items.map(sourceGroup).filter(Boolean))];
 const filtered=useMemo(()=>items.filter(n=>inStream(n,scope)&&(type==='全部'||n.type===type)&&(group==='全部'||sourceGroup(n)===group)&&(publisher==='全部'||(n.feedId||n.source)===publisher)),[items,type,group,scope,publisher]);
 const events=useMemo(()=>clusterStories(filtered),[filtered]);
 const hot=useMemo(()=>events.filter(e=>e.heat>0&&(e.primary.summary||'').trim().length>=25&&(scope==='world'||relevance(e.primary,domain)===100)).sort((a,b)=>b.heat-a.heat||b.score-a.score).slice(0,4),[events,scope,domain]);
 const relevantSources=sources.filter(s=>scope==='world'?s.scope==='world':s.scope!=='world'&&(s.domain==='both'||s.domain===scope));
 const status=updates?.statuses.filter(x=>relevantSources.some(s=>s.name===x.name))||[];
 const types=scope==='world'?['全部','市场洞察','政策法规','社区热议']:newsTypes;
 function chooseGroup(g:string){setGroup(g);setType('全部');document.getElementById('stream-news')?.scrollIntoView({behavior:'smooth',block:'start'});}
 return <div className="intelligence-stream" id="stream-news">
 <div className="stream-summary"><div><span className="eyebrow">{scope==='world'?'WORLD BRIEFING':'INTELLIGENCE DESK'}</span><h2>{scope==='world'?t('世界热点'):domainName+' · '+t('产业动态')}</h2><p>{t('先看事件，再读原文。技术进展、市场变化与机构研究在同一处查询。','Start with events, then check the sources. Technology, market developments and institutional research in one place.')}</p></div><div className="stream-stats"><b>{events.length}<small>{t('阅读事件','events')}</small></b><b>{status.filter(s=>s.ok).length}/{relevantSources.length}<small>{t('可用来源','sources available')}</small></b><a href="#source-directory"><Globe2 size={16}/>{t('专业来源库')} ↓</a></div></div>
 {hot.length>0&&<section className="hot-rail" aria-label={t('48 小时热点','48-hour highlights')}><div className="section-heading"><h3><Flame size={18}/>{t('48 小时热点','48-hour highlights')}</h3><small>{t('本站覆盖内 · 独立来源计数与时间衰减','Within collected coverage · distinct publishers & time decay')}</small></div><div className="hot-grid">{hot.map((e,i)=><a key={e.id} href={e.primary.url} target="_blank" rel="noreferrer"><span className="eyebrow">0{i+1} / {e.sourceCount} {t('来源','sources')}</span><h4><BilingualText text={e.primary.title}/></h4><small>{e.primary.source}<ArrowUpRight size={13}/></small></a>)}</div></section>}
 {<div className="filter-row" aria-label={t('资讯类型','Content type')}>{types.map(x=><button key={x} className={type===x?'selected':''} onClick={()=>setType(x)}>{t(x)}</button>)}</div>}
 <label className="stream-publisher">{t('新闻来源','News source')} <select value={publisher} onChange={e=>setPublisher(e.target.value)}><option value="全部">{t('全部来源','All feeds')}</option>{[...new Set(items.map(n=>n.feedId||n.source))].map(name=><option key={name} value={name}>{name} · {items.filter(n=>(n.feedId||n.source)===name).length}</option>)}</select></label><p className="stream-coverage">{t('当前列表仅含实际采集成功的报道；来源库入口不代表已获取该机构文章。','Only collected reports appear here; a directory link does not imply fetched articles.')}</p>
 <details className="index-group-filter"><summary>{t('按研报机构来源筛选','Filter institutional indexes')} · {group==='全部'?t('全部'):t(group)}</summary><div className="filter-row">{['全部',...groups].map(g=><button key={g} className={group===g?'selected':''} onClick={()=>setGroup(g)}>{t(g)}</button>)}</div><p>{t('仅列出当前时间窗已有报道的机构组；完整入口见下方来源库。','Only groups with collected stories in the current time window are listed. The full directory is below.')}</p></details>
 <NewsFeed key={scope+'|'+group+'|'+publisher} items={filtered} domain={domain} domainName={scope==='world'?t('世界热点'):domainName} loading={loading} scope={scope} newsType={type} pageSize={12}/>
 {type==='市场洞察'&&scope!=='world'&&showMarketChart&&<Suspense fallback={<p>Loading…</p>}><MarketChart domain={domain}/></Suspense>}
 <SourceDirectory scope={scope} updates={updates} onGroup={chooseGroup}/>
 </div>;
}
