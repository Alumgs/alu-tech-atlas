'use client';
import {createContext,useContext,useEffect,useRef,useState,useCallback,type ReactNode} from 'react';
export type Language='zh'|'en'|'both';
type Translation={translation?:string;error?:string};
type LanguageState={language:Language;setLanguage:(l:Language)=>void;t:(zh:string,en?:string)=>string;lookup:(text:string,target:'zh'|'en')=>Translation|undefined;request:(text:string,target:'zh'|'en')=>void};
const dictionary:Record<string,string>={
 '宏观与政策':'Macro & policy','企业披露':'Corporate filings','市场与媒体':'Markets & media','机构研报':'Institutional research','模型与评测':'Models & benchmarks','开发工具':'Developer tools','科研与学术':'Research & academia','技术与标准':'Technology & standards','公开索引':'Public index','参考入口':'Reference link','数据接口':'Data API','产业研究机构':'Industry research','投行与咨询':'Investment banks & consulting','全球资产配置':'Global asset allocation','私募与产业资本':'Private & industrial capital','机器人开放研究':'Open robotics research','披露与政策':'Filings & policy','前沿 AI 研究':'Frontier AI research','中国 AI 研究':'China AI research','开放模型与工具':'Open models & tools','评测与学术':'Benchmarks & academia','财经媒体':'Financial media','基础':'Fundamentals','进阶':'Advanced','全部方向':'All disciplines','全部难度':'All levels','软件':'Software','硬件':'Hardware','大模型':'Large models','小模型':'Small models','智能体':'Agents','企业概览':'Company overview','技术进展':'Technology updates','财务披露':'Financial disclosures','专业知识 · 可靠来源 · 持续探索':'Knowledge · Sources · Discovery',
 '领域总览':'Overview','知识手册':'Handbook','产业动态':'Industry news','企业观察':'Companies','案例研习':'Case studies','研报中心':'Research desk','世界热点':'World briefing','AIDC 智算中心':'AI data centers','机器人与具身智能':'Robotics & embodied AI','机器学习':'Machine learning','信息源':'Sources','设置':'Settings','刷新资讯':'Refresh news','正在联网更新':'Refreshing','导出本领域研报':'Export research report','全部':'All','全部主题':'All topics','全球':'Global','中国区':'China','今日':'Today','近 7 天':'7 days','近 30 天':'30 days','近 90 天':'90 days','全部资料库':'Archive','技术研究':'Technology','研究论文':'Papers','市场洞察':'Market insight','企业财报':'Financial filings','产品发布':'Product launches','政策法规':'Policy & regulation','推荐':'Recommended','最新':'Latest','热度':'Trending','收藏':'Saved','已收藏':'Saved','只看未读':'Unread only','含量化信息':'With figures','一手资料':'Primary source','专业媒体':'Specialist media','聚合索引':'News index','其他来源':'Other source','全部来源层级':'All source tiers','液冷与能源':'Cooling & energy','芯片与服务器':'Chips & servers','网络与存储':'Networks & storage','人形机器人':'Humanoids','仿真与世界模型':'Simulation & world models','操作与控制':'Manipulation & control','模型与训练':'Models & training','推理与部署':'Inference & deployment','智能体与应用':'Agents & applications','资讯':'News','手册':'Learn','企业':'Companies','研报':'Reports','更多':'More','北京时间':'Beijing time','搜索结果':'Search results','国际时事':'World affairs','科技与科学':'Science & technology','社会与公共政策':'Society & policy','经济与金融':'Economy & finance','能源与气候':'Energy & climate','专业来源库':'Source directory','来源与更新状态':'Source health','来源与报道时间线':'Sources & reporting timeline','资料库':'Archive','旧缓存':'Old cache','已读':'Read','阅读专题':'Read article','本期深读':'Featured reading','产业快讯':'Industry briefs','世界模型':'World models','查看':'View','加载更多':'Load more','退出登录':'Sign out',
};
const Context=createContext<LanguageState|null>(null);
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>('zh'),[results,setResults]=useState<Record<string,Translation>>({});
 const values=useRef<Record<string,Translation>>({}),pending=useRef(new Map<string,{text:string;target:'zh'|'en'}>()),busy=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{try{const l=localStorage.getItem('atlas-language');if(l==='zh'||l==='en'||l==='both')setLanguage(l);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'zh-CN';try{localStorage.setItem('atlas-language',language);}catch{}},[language]);
 const flush=useCallback(async()=>{
  if(busy.current)return;busy.current=true;
  try{while(pending.current.size){
   const first=[...pending.current.values()][0],batch=[...pending.current.entries()].filter(([,v])=>v.target===first.target).slice(0,4);
   for(const [key] of batch)pending.current.delete(key);
   try{
    const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target:first.target,texts:batch.map(([,v])=>v.text)}),signal:AbortSignal.timeout(28000)});
    if(!r.ok)throw Error('unavailable');const data=await r.json() as {items?:Array<{text:string;translation?:string}>};
    for(const [key,v] of batch){const match=data.items?.find((x:{text:string})=>x.text===v.text);values.current[key]=match?.translation?{translation:match.translation}:{error:'Translation unavailable'};}
   }catch{for(const [key] of batch)values.current[key]={error:'Translation unavailable'};}
   setResults({...values.current});
  }}finally{busy.current=false;}
 },[]);
 const request=useCallback((text:string,target:'zh'|'en')=>{const key=target+'|'+text;if(!text.trim()||text.length>2500||values.current[key]||pending.current.has(key))return;pending.current.set(key,{text,target});if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>void flush(),100);},[flush]);
 function t(zh:string,en=dictionary[zh]||zh){return language==='zh'?zh:language==='en'?en:zh===en?zh:zh+' / '+en;}
 return <Context.Provider value={{language,setLanguage,t,lookup:(text,target)=>results[target+'|'+text],request}}>{children}</Context.Provider>;
}
export function useLanguage(){const value=useContext(Context);if(!value)throw Error('LanguageProvider missing');return value;}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <div className="language-switch" role="group" aria-label="Language / 语言">{([['zh','中文'],['en','EN'],['both','中 / EN']] as const).map(([value,label])=><button type="button" key={value} aria-pressed={language===value} className={language===value?'selected':''} onClick={()=>setLanguage(value)}>{label}</button>)}</div>;}
/** Original is always available. Long handbook paragraphs are split at source boundaries. */
export function BilingualText({text}:{text:string}){
 const {language,lookup,request,t}=useLanguage(),ref=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 const source=/[\u3400-\u9fff]/.test(text)?'zh':'en',target=language==='en'?'en':language==='zh'?'zh':source==='zh'?'en':'zh';
 const needs=language==='both'||source!==target,result=lookup(text,target);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'120px'});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(visible&&needs)request(text,target);},[visible,needs,text,target,request]);
 const translated=result?.translation;
 return <span ref={ref} className="bilingual-text">{language==='both'?<><span lang={source==='zh'?'zh-CN':'en'}>{text}</span>{translated&&translated!==text?<span className="translation-line" lang={target==='zh'?'zh-CN':'en'}>{translated}</span>:<small className="translation-note">{result?.error?t('翻译暂不可用，保留原文','Translation unavailable; original retained'):t('正在准备对照译文…','Preparing translation…')}</small>}</>:<>{needs&&translated?translated:text}{needs&&!translated&&<small className="translation-note">{result?.error?t('翻译暂不可用，显示原文','Translation unavailable; showing original'):t('原文 · 翻译中…','Original · translating…')}</small>}{needs&&translated&&<span className="translation-note">{t('机器翻译','Machine translation')}</span>}</>}</span>;
}
export function ReadingLanguage(){return <div className="reading-language"><LanguageSwitch/><small>译文由机器生成，请结合原文核对 / Machine translation; check the original.</small></div>;}

export function Localized({value}:{value:ReactNode}){
 const {t,language}=useLanguage();
 if(typeof value!=='string'||!/[\u3400-\u9fff]/.test(value))return <>{value}</>;
 if(dictionary[value])return <>{t(value)}</>;
 if(language==='zh')return <>{value}</>;
 return <BilingualText text={value}/>;
}
