export type ReaderPreferences={autoTranslate:boolean;autoRefresh:boolean;theme:'light'|'warm'|'dark'|'system';density:'compact'|'comfortable';fontScale:number;fontFamily:'system'|'serif';contentWidth:'wide'|'focused';showSummaries:boolean;showHotlist:boolean;reduceMotion:boolean};
export const READER_KEY='atlas-reader-preferences-v1';
export const defaultReaderPreferences:ReaderPreferences={autoTranslate:true,autoRefresh:true,theme:'light',density:'compact',fontScale:1,fontFamily:'system',contentWidth:'wide',showSummaries:true,showHotlist:true,reduceMotion:false};
export function sanitizeReaderPreferences(value:unknown):ReaderPreferences{
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{},number=typeof v.fontScale==='number'?v.fontScale:1;
 return {autoTranslate:v.autoTranslate!==false,autoRefresh:v.autoRefresh!==false,theme:['light','warm','dark','system'].includes(String(v.theme))?v.theme as ReaderPreferences['theme']:'light',density:v.density==='comfortable'?'comfortable':'compact',fontScale:Number.isFinite(number)?Math.max(.9,Math.min(1.2,Math.round(number*100)/100)):1,fontFamily:v.fontFamily==='serif'?'serif':'system',contentWidth:v.contentWidth==='focused'?'focused':'wide',showSummaries:v.showSummaries!==false,showHotlist:v.showHotlist!==false,reduceMotion:v.reduceMotion===true};
}
