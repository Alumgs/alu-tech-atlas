'use client';
import {inStream} from '@/lib/intelligence';
import {relevance} from '@/lib/relevance';
import {useMemo,useState,lazy,Suspense,memo,useRef} from 'react';
const MarketChart=lazy(()=>import('./market-chart').then(m=>({default:m.MarketChart})));
import {Flame,Globe2,ArrowUpRight} from 'lucide-react';
import {clusterStories} from '@/lib/editorial';
import {sourceGroup,type StreamScope} from '@/lib/intelligence';
import {sources,newsTypes,type News,type Domain} from '@/lib/content';
import type {UpdateResult} from '@/hooks/use-updates';
import {SourcePicker} from './source-picker';
import {filterPublishers,publisherKey,type PublisherSelection} from '@/lib/source-selection';
import {useReaderPreferences} from './reader-preferences';
import {NewsFeed} from './news-feed';
import {SourceDirectory} from './source-directory';
import {BilingualText,useLanguage} from './language';
export function IntelligenceStream({scope,domain,domainName,items,updates,loading,showMarketChart=false,active=true}:{active?:boolean;scope:StreamScope;domain:Domain;domainName:string;items:News[];updates:UpdateResult|null;loading:boolean;showMarketChart?:boolean}){
 const {t}=useLanguage(),[type,setType]=useState('全部'),[group,setGroup]=useState('全部'),[publishers,setPublishers]=useState<PublisherSelection>(null);
 const {preferences}=useReaderPreferences(),[directoryOpen,setDirectoryOpen]=useState(false),[coverageOpen,setCoverageOpen]=useState(false);
 const groups=useMemo(()=>[...new Set(items.map(sourceGroup).filter(Boolean))],[items]);
 const candidates=useMemo(()=>items.filter(n=>inStream(n,scope)&&(type==='全部'||n.type===type)&&(group==='全部'||sourceGroup(n)===group)),[items,type,group,scope]);
 const filtered=useMemo(()=>filterPublishers(candidates,publishers),[candidates,publishers]);
 const events=useMemo(()=>clusterStories(filtered),[filtered]);
 const hot=useMemo(()=>!preferences.showHotlist?[]:events.filter(e=>e.heat>0&&(e.primary.summary||'').trim().length>=25&&(scope==='world'||relevance(e.primary,domain)===100)).sort((a,b)=>b.heat-a.heat||b.score-a.score).slice(0,4),[events,scope,domain,preferences.showHotlist]);
 const relevantSources=sources.filter(s=>scope==='world'?s.scope==='world':s.scope!=='world'&&(s.domain==='both'||s.domain===scope));
 const sourceOptions=useMemo(()=>{const counts=new Map<string,number>();for(const item of candidates){const key=publisherKey(item);counts.set(key,(counts.get(key)||0)+1);}return [...new Set([...relevantSources.map(s=>s.name),...counts.keys(),...(publishers||[])])].map(name=>({name,count:counts.get(name)||0,ok:updates?.statuses.find(s=>s.name===name)?.ok}));},[candidates,updates,scope,publishers]);
 const status=updates?.statuses.filter(x=>relevantSources.some(s=>s.name===x.name))||[];
 const types=scope==='world'?['全部','市场洞察','政策法规','社区热议']:newsTypes;
 function chooseGroup(g:string){setGroup(g);setType('全部');document.getElementById('stream-news-'+scope)?.scrollIntoView({behavior:'smooth',block:'start'});}
 return <div className="intelligence-stream" id={'stream-news-'+scope}>
 <div className="stream-summary"><span>{events.length} {t('个事件','events')} · {t('来源','Sources')} {status.filter(s=>s.ok).length}/{relevantSources.length}</span><a href={'#source-directory-'+scope} onClick={()=>{setDirectoryOpen(true);}}><Globe2 size={13}/>{t('专业来源库','Source directory')}</a></div>
 {scope==='world'&&<details open={coverageOpen} onToggle={e=>setCoverageOpen(e.currentTarget.open)} className="world-coverage" aria-label="世界来源覆盖"><summary>{t('来源覆盖与状态','Source coverage & health')} · {status.filter(s=>s.ok).length}/{relevantSources.length}{status.some(s=>!s.ok)&&<small> · {status.filter(s=>!s.ok).length} {t('个来源暂不可用','temporarily unavailable')}</small>}</summary><div>{coverageOpen&&relevantSources.filter(s=>/BBC|UN News|联合国|Anthropic|The Verge|中新网|同花顺/.test(s.name)).map(s=>{const state=status.find(x=>x.name===s.name),count=items.filter(n=>n.feedId===s.name).length;return <button key={s.name} className={publishers?.includes(s.name)?'selected':''} onClick={()=>setPublishers(old=>old===null?[s.name]:old.includes(s.name)?old.filter(name=>name!==s.name):[...old,s.name])}>{s.name} <b>{count}</b><small>{!state?t('待检查','Pending'):state.ok?t('已采集','Fetched'):t('采集失败','Fetch failed')}</small></button>;})}</div><small>{t('数量受当前地区、时间和搜索条件限制；采集失败可在来源库查看原因。','Counts reflect region, time and search filters; source errors appear in the directory.')}</small></details>}
 {hot.length>0&&<section className="hot-rail" aria-label={t('48 小时热点','48-hour highlights')}><div className="section-heading"><h3><Flame size={18}/>{t('48 小时热点','48-hour highlights')}</h3><small>{t('本站覆盖内 · 独立来源计数与时间衰减','Within collected coverage · distinct publishers & time decay')}</small></div><div className="hot-grid">{hot.map((e,i)=><a key={e.id} href={e.primary.url} target="_blank" rel="noreferrer"><span className="eyebrow">0{i+1} / {e.sourceCount} {t('来源','sources')}</span><h4><BilingualText text={e.primary.title}/></h4><small>{e.primary.source}<ArrowUpRight size={13}/></small></a>)}</div></section>}
 {<div className="filter-row stream-types" aria-label={t('资讯类型','Content type')}>{types.map(x=><button key={x} className={type===x?'selected':''} onClick={()=>setType(x)}>{t(x)}</button>)}</div>}
 <SourcePicker active={active} options={sourceOptions} value={publishers} onApply={setPublishers}/>
 <details className="index-group-filter"><summary>{t('按研报机构来源筛选','Filter institutional indexes')} · {group==='全部'?t('全部'):t(group)}</summary><div className="filter-row">{['全部',...groups].map(g=><button key={g} className={group===g?'selected':''} onClick={()=>setGroup(g)}>{t(g)}</button>)}</div><p>{t('仅列出当前时间窗已有报道的机构组；完整入口见下方来源库。','Only groups with collected stories in the current time window are listed. The full directory is below.')}</p></details>
 <NewsFeed active={active} filterKey={JSON.stringify([group,publishers,type])} clustered={events} items={filtered} domain={domain} domainName={scope==='world'?t('世界热点'):domainName} loading={loading} scope={scope} newsType={type} pageSize={12}/>
 {type==='市场洞察'&&scope!=='world'&&showMarketChart&&<Suspense fallback={<p>Loading…</p>}><MarketChart domain={domain}/></Suspense>}
 <details className="stream-source-directory" id={'source-directory-panel-'+scope} open={directoryOpen} onToggle={e=>setDirectoryOpen(e.currentTarget.open)}><summary>{t('专业来源库','Source directory')}</summary>{directoryOpen&&<SourceDirectory scope={scope} updates={updates} onGroup={chooseGroup}/>}</details>
 </div>;
}

/** Retain each stream's filters and last visible inputs; hidden streams do no feed work. */
export const RetainedStream=memo(function RetainedStream({active,...incoming}:Parameters<typeof IntelligenceStream>[0]&{active:boolean}){
 const retained=useRef(incoming);if(active){const old=retained.current.items,items=incoming.items===old||incoming.items.length===old.length&&incoming.items.every((item,index)=>item===old[index])?old:incoming.items;retained.current={...incoming,items};}
 return <section hidden={!active}><IntelligenceStream {...retained.current} active={active}/></section>;
},(previous,next)=>!previous.active&&!next.active||(Object.keys(next) as Array<keyof typeof next>).every(key=>Object.is(previous[key],next[key])));
