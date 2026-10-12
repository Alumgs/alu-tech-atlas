'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowDownWideNarrow,ArrowUpRight,Check,Download,Filter,Sparkles,Star,Trash2} from 'lucide-react';
import type {Domain,News} from '@/lib/content';
import {rankNews,scoreNews,scoreReasons} from '@/lib/editorial';

type EditorialDeskProps={domain:Domain;domainName:string;items:News[];scopeLabel:string;editionType:string};
const selectionLimit=12;
function sourceClass(n:News){
  const kind=String(n.sourceKind||'');
  const source=String(n.source||'')+' '+String(n.feed||'');
  if(/官方直连|官方来源|primary|first.party/i.test(kind)||/官方|政府|部委|研究院|nvidia developer|investor relations|sec edgar|arxiv/i.test(source))return '官方/一手';
  if(/媒体直连|专业媒体|独立媒体/i.test(kind))return '专业媒体';
  if(/新闻聚合|聚合/i.test(kind)||/news.google.com/i.test(n.url))return '新闻聚合';
  return '其他来源';
}
function shortDate(value:string){const time=Date.parse(value);return Number.isFinite(time)?new Date(time).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'时间未提供';}
export function EditorialDesk({domain,domainName,items,scopeLabel,editionType}:EditorialDeskProps){
  const [selected,setSelected]=useState<string[]>([]);
  const [loadedDomain,setLoadedDomain]=useState('');
  const [search,setSearch]=useState('');
  const [source,setSource]=useState('全部来源');
  const [type,setType]=useState('全部类型');
  const [minScore,setMinScore]=useState(25);
  const [sort,setSort]=useState<'score'|'date'>('score');
  const [onlySelected,setOnlySelected]=useState(false);
  const [visibleLimit,setVisibleLimit]=useState(10);
  const [title,setTitle]=useState('');
  const [lead,setLead]=useState('');
  const [notice,setNotice]=useState('');
  const [exporting,setExporting]=useState(false);
  const storeKey='atlas-wechat-selection-v1:'+domain+':'+editionType;
  const defaultTitle='知域 ATLAS｜'+domainName+editionType+' · '+new Date().toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'});

  const ranked=useMemo(()=>rankNews(items),[items]);
  const rankedByDate=useMemo(()=>[...ranked].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)),[ranked]);
  const duplicateCount=Math.max(0,items.length-ranked.length);
  const types=useMemo(()=>['全部类型',...Array.from(new Set(ranked.map(n=>n.type).filter(Boolean))).sort()], [ranked]);
  const filtered=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase();
    const rows=(sort==='date'?rankedByDate:ranked).filter(n=>
      (source==='全部来源'||sourceClass(n)===source) &&
      (type==='全部类型'||n.type===type) &&
      scoreNews(n)>=minScore &&
      (!onlySelected||selected.includes(n.url)) &&
      (!q||(n.title+' '+n.source+' '+n.summary+' '+n.type).toLocaleLowerCase().includes(q))
    );
    return rows;
  },[ranked,rankedByDate,search,source,type,minScore,sort,onlySelected,selected]);
  const selectedItems=useMemo(()=>ranked.filter(n=>selected.includes(n.url)).slice(0,selectionLimit),[ranked,selected]);
  const topSourceCount=selectedItems.filter(n=>sourceClass(n)==='官方/一手').length;

  useEffect(()=>{
    setLoadedDomain('');
    let saved:string|null=null;
    try{saved=localStorage.getItem(storeKey);}catch{}
    if(saved!==null){
      try{const parsed=JSON.parse(saved);setSelected(Array.isArray(parsed)?parsed.filter((x:unknown)=>typeof x==='string').slice(0,selectionLimit):[]);}catch{setSelected([]);}
      setLoadedDomain(domain);
    }else{
      setSelected([]);
      setLoadedDomain('new:'+domain);
    }
    setTitle('');
    setLead('');
    setNotice('');
  },[domain,domainName,storeKey]);

  useEffect(()=>{
    if(loadedDomain!=='new:'+domain||!ranked.length)return;
    const eligible=ranked.filter(n=>!n.stale&&!n.historical&&scoreNews(n)>=34);
    const picks=(eligible.length?eligible:ranked).slice(0,6).map(n=>n.url);
    setSelected(picks);
    setLoadedDomain(domain);
  },[loadedDomain,domain,ranked]);

  useEffect(()=>{
    if(loadedDomain!==domain)return;
    try{localStorage.setItem(storeKey,JSON.stringify(selected.slice(0,selectionLimit)));}catch{}
  },[selected,loadedDomain,domain,storeKey]);

  function toggle(url:string){
    setNotice('');
    if(selected.includes(url)){setSelected(selected.filter(x=>x!==url));return;}
    if(selected.length>=selectionLimit){setNotice('微信公众号稿件一次最多精选 12 条，请先移除部分内容。');return;}
    setSelected([...selected,url]);
  }
  function autoSelect(){
    const eligible=ranked.filter(n=>!n.stale&&!n.historical&&scoreNews(n)>=34);
    const picks=(eligible.length?eligible:ranked).slice(0,6).map(n=>n.url);
    setSelected(picks);
    setNotice('已按时效、来源类别、内容类型与摘要完整度生成候选精选；请检查原文后再发布。');
  }
  function addVisible(){
    const urls=filtered.slice(0,visibleLimit).map(n=>n.url);
    const next=Array.from(new Set([...selected,...urls])).slice(0,selectionLimit);
    setSelected(next);
    setNotice(next.length>=selectionLimit?'已达到 12 条上限。':'已将当前可见条目加入精选。');
  }
  async function exportDocx(){
    if(exporting)return;
    if(!selectedItems.length){setNotice('当前筛选范围内没有可导出的已选内容。请调整时间范围或重新选择条目。');return;}
    setExporting(true);setNotice('');
    try{
      const response=await fetch('/api/editorial/enrich',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain,editionType,items:selectedItems.map(n=>({url:n.url,title:n.title,date:n.date,source:n.source,type:n.type,summary:(n.summary||'').slice(0,450),language:n.language||''}))}),signal:AbortSignal.timeout(45000)});
      if(response.status===401){window.location.assign('/auth/login?returnTo='+encodeURIComponent(location.pathname+location.search));return;}
      if(!response.ok)throw new Error('逐条读取新闻网页失败，暂时无法生成完整成刊');
      const enrichment=await response.json() as {items:Array<{url:string;pageTitle?:string;pageDescription?:string;pageExcerpt?:string;pageFetchedAt?:string;pageStatus?:string;translatedTitle?:string;summaryZh?:string;keyPoints?:string[];aiEnhanced?:boolean}>;aiCount?:number;notice?:string};
      const enrichedItems=selectedItems.map(n=>({...n,...(enrichment.items||[]).find(x=>x.url===n.url)}));
      const {downloadWechatDocx}=await import('@/lib/wechat-docx');
      const filename=downloadWechatDocx({title:title.trim()||defaultTitle,brand:'知域 ATLAS',domainName,editionType,scopeLabel,lead,items:enrichedItems,generatedAt:new Date().toISOString()});
      const aiCount=enrichment.aiCount||0;
      setNotice('DOCX 已生成：'+filename+'。'+selectedItems.length+' 条逐篇抓取完成；'+aiCount+'/'+selectedItems.length+' 条生成了 AI 中文标题、摘要和要点。'+(enrichment.notice?' '+enrichment.notice:'')+' 下载后可在 Word 中继续编辑。');
    }catch(e){
      setNotice((e instanceof Error?e.message:'DOCX 生成失败')+'。请检查网络或稍后重试；系统不会把仅有标题的内容冒充全文总结。');
    }finally{setExporting(false);}
  }

  return <section className="editorial-desk" aria-label="微信公众号精选工作台">
    <div className="editorial-head">
      <div><span className="eyebrow"><Sparkles size={14}/> EDITORIAL DESK / 精选与成刊</span><h2>公众号精选工作台</h2><p>先筛选，再编排。导出时逐条读取原网页，提取页面信息，并生成中文标题、摘要与要点；日报、周报、月报按当前时间筛选范围成刊。</p></div>
      <button className="primary-button" onClick={exportDocx} disabled={exporting||selectedItems.length===0}><Download size={16}/>{exporting?'正在生成 DOCX…':'生成公众号 DOCX（'+selectedItems.length+' 条）'}</button>
    </div>
    <div className="editorial-stats">
      <div><strong>{ranked.length}</strong><span>去重候选</span></div>
      <div><strong>{selectedItems.length}<small> / {selectionLimit}</small></strong><span>当前范围已选</span></div>
      <div><strong>{topSourceCount}</strong><span>一手/官方来源</span></div>
      <div><strong>{duplicateCount}</strong><span>标题/链接重复抑制</span></div>
    </div>
    <div className="editorial-note"><Check size={16}/><span>规则化初筛（非模型事实核验） · 当前范围：{scopeLabel||'按上方资讯筛选'}</span><span className="editorial-note-tail">分值越高越优先，不代表真实性评级</span></div>
    <div className="editorial-controls">
      <label className="editorial-search"><span>搜索候选</span><input type="search" value={search} onChange={e=>{setSearch(e.target.value);setVisibleLimit(10);}} placeholder="标题、来源、内容关键词"/></label>
      <label><span>来源层级</span><select value={source} onChange={e=>setSource(e.target.value)}>{['全部来源','官方/一手','专业媒体','新闻聚合','其他来源'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label><span>内容类型</span><select value={type} onChange={e=>setType(e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="editorial-score-filter"><span>最低优先级分数：<b>{minScore}</b></span><input type="range" min="0" max="80" step="5" value={minScore} onChange={e=>{setMinScore(Number(e.target.value));setVisibleLimit(10);}}/></label>
      <label><span>排序</span><select value={sort} onChange={e=>setSort(e.target.value as 'score'|'date')}><option value="score">精选优先</option><option value="date">最新发布</option></select></label>
      <label className="editorial-check"><input type="checkbox" checked={onlySelected} onChange={e=>setOnlySelected(e.target.checked)}/>只看已选</label>
    </div>
    <div className="editorial-actions">
      <span><Filter size={15}/> 当前显示 {filtered.length} 条候选</span>
      <div><button onClick={autoSelect}><Sparkles size={15}/>自动精选 6 条</button><button onClick={addVisible}><Check size={15}/>选择当前前 {Math.min(visibleLimit,filtered.length)} 条</button><button onClick={()=>{setSelected([]);setNotice('已清空本领域精选列表。');}}><Trash2 size={15}/>清空</button><button onClick={()=>setSort(sort==='score'?'date':'score')}><ArrowDownWideNarrow size={15}/>{sort==='score'?'改按时间':'改按优先级'}</button></div>
    </div>
    <div className="editorial-items">
      {filtered.slice(0,visibleLimit).map(n=>{
        const picked=selected.includes(n.url);
        const score=scoreNews(n);
        const reasons=scoreReasons(n);
        return <article className={'editorial-item '+(picked?'picked':'')} key={n.domain+':'+n.url}>
          <label className="editorial-pick" aria-label={(picked?'取消精选 ':'加入精选 ')+n.title}><input type="checkbox" checked={picked} onChange={()=>toggle(n.url)}/><span>{picked?<Check size={14}/>:<Star size={14}/>}</span></label>
          <div className="editorial-item-main">
            <div className="editorial-item-meta"><span className="tag">{n.type}</span><span>{sourceClass(n)}</span><time>{shortDate(n.date)}</time>{(n.stale||n.historical)&&<em>历史/缓存</em>}</div>
            <h3>{n.title}<a href={n.url} target="_blank" rel="noreferrer" aria-label="打开原文"><ArrowUpRight size={15}/></a></h3>
            {n.summary&&<p>{n.summary}</p>}
            <div className="editorial-reasons">{reasons.map(reason=><span key={reason}>{reason}</span>)}</div>
            <small>{n.source}{n.feed&&n.feed!==n.source?' · 订阅：'+n.feed:''}</small>
          </div>
          <div className="editorial-score" title="基于公开字段的规则排序，不代表事实验证"><strong>{score}</strong><span>优先级</span><i><b style={{width:score+'%'}}/></i></div>
        </article>;
      })}
      {!filtered.length&&<div className="editorial-empty">没有匹配候选。可降低分数阈值、调整来源/类型，或扩大资讯时间范围。</div>}
      {filtered.length>visibleLimit&&<button className="editorial-more" onClick={()=>setVisibleLimit(n=>n+10)}>显示更多候选（{visibleLimit} / {filtered.length}）</button>}
    </div>
    <details className="editorial-copy-settings"><summary>编辑微信公众号标题与导语</summary><div className="editorial-copy-fields"><label><span>公众号文章标题</span><input value={title||defaultTitle} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="输入文章标题"/></label><label><span>导语 / 编者按（留空自动生成）</span><textarea value={lead} onChange={e=>setLead(e.target.value)} rows={3} placeholder="可编辑导语；留空时根据已选条目自动生成，不会补写未经来源支持的事实。"/></label></div></details>
    {notice&&<p className="editorial-message" role="status">{notice}</p>}
    <p className="editorial-footnote">导出文件采用标准 Office Open XML DOCX，可编辑标题、段落及来源链接。导出内容按优先级排序，包含发布前核查清单；建议确认原文、版权和事实后再发布到公众号。</p>
  </section>;
}
