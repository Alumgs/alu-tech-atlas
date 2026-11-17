'use client';
import {useMemo,useState,useEffect} from 'react';
import {Globe2,Search,Check} from 'lucide-react';
import {Popover,PopoverTrigger,PopoverContent} from './ui/popover';
import {useLanguage} from './language';
import {togglePublisher,type PublisherSelection} from '@/lib/source-selection';
export type SourceOption={name:string;count:number;ok?:boolean};
export function SourcePicker({options,value,onApply,active=true}:{active?:boolean;options:SourceOption[];value:PublisherSelection;onApply:(value:PublisherSelection)=>void}){
 const {t}=useLanguage(),[open,setOpen]=useState(false),[draft,setDraft]=useState<PublisherSelection>(null),[query,setQuery]=useState('');
 useEffect(()=>{if(!active)setOpen(false);},[active]);
 const all=useMemo(()=>options.map(option=>option.name),[options]),shown=options.filter(option=>option.name.toLowerCase().includes(query.trim().toLowerCase()));
 const selected=draft===null?all.length:draft.length;
 return <Popover open={open} onOpenChange={next=>{setOpen(next);if(next){setDraft(value===null?null:[...value]);setQuery('');}}}><PopoverTrigger asChild><button className={'source-picker-trigger '+(value!==null?'selected':'')} aria-label={t('多选新闻来源','Select multiple news sources')}><Globe2 size={14}/>{t('新闻来源','News sources')} · {value===null?t('全部','All'):value.length===0?t('未选择','None'):value.length+' '+t('个已选','selected')}</button></PopoverTrigger>
 <PopoverContent className="source-picker" align="start" aria-label={t('选择新闻来源','Choose news sources')}><header><h3>{t('选择新闻来源','Choose news sources')}</h3><small>{t('已选','Selected')} {selected}/{all.length}</small></header><label className="source-picker-search"><Search size={14}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('搜索来源','Search sources')} aria-label={t('搜索新闻来源','Search news sources')}/></label><div className="source-picker-actions"><button onClick={()=>setDraft(null)}>{t('全选','Select all')}</button><button onClick={()=>setDraft([])}>{t('清空','Clear')}</button><span>{t('勾选后点击应用','Choose, then apply')}</span></div>
 <div className="source-picker-options">{shown.map(option=>{const checked=draft===null||draft.includes(option.name);return <label key={option.name}><input type="checkbox" checked={checked} onChange={()=>setDraft(old=>togglePublisher(old,option.name,all))}/><span>{option.name}<small>{option.ok===false?t('暂不可用','Unavailable'):option.count===0?t('当前范围无报道','No reports in this range'):''}</small></span><b>{option.count}</b></label>;})}{!shown.length&&<p>{t('没有匹配来源','No matching sources')}</p>}</div>
 <footer><button onClick={()=>setOpen(false)}>{t('取消','Cancel')}</button><button className="source-picker-apply" onClick={()=>{onApply(draft);setOpen(false);}}><Check size={14}/>{t('应用筛选','Apply')}</button></footer></PopoverContent></Popover>;
}
