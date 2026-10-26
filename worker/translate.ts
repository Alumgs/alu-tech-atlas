import {boundedJson,RequestError} from '../lib/http-safety.ts';
import type {EditorialAI} from './editorial';

type Store=Pick<KVNamespace,'get'|'put'>;
export type TranslationEnv={AI?:EditorialAI;ATLAS_SETTINGS?:Store};
const headers={'Cache-Control':'private, no-store'};
export function numericTokens(text:string){return text.replace(/,/g,'').match(/\d+(?:\.\d+)?/g)||[];}
export async function translateText(request:Request,env:TranslationEnv){
 let body:Record<string,unknown>;
 try{body=await boundedJson(request,40000);}catch(e){return Response.json({error:e instanceof Error?e.message:'Invalid JSON'},{status:e instanceof RequestError?e.status:400,headers});}
 if(!['zh','en'].includes(String(body.target))||!Array.isArray(body.texts)||!body.texts.length||body.texts.length>8||body.texts.some(x=>typeof x!=='string'||!x.trim()||x.length>2500)||body.texts.join('').length>10000)return Response.json({error:'Send 1–8 texts (≤2500 characters each, ≤10000 total), target zh or en.'},{status:400,headers});
 if(!env.AI)return Response.json({error:'Translation is unavailable. Original text retained.'},{status:503,headers});
 const texts=body.texts as string[],target=body.target as 'zh'|'en';
 const output=new Array<{text:string;translation?:string;error?:string}>(texts.length);let cursor=0;
 await Promise.all(Array.from({length:Math.min(3,texts.length)},async()=>{
  while(cursor<texts.length){const i=cursor++,text=texts[i];
   const source=/[\u3400-\u9fff]/.test(text)?'zh':'en';
   if(source===target){output[i]={text,translation:text};continue;}
   try{
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(target+'|'+text));
    const key='translation-v1:'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    const cached=await env.ATLAS_SETTINGS?.get(key);
    if(cached){output[i]={text,translation:cached};continue;}
    let timer:ReturnType<typeof setTimeout>|undefined;
    let result:unknown;
    try{result=await Promise.race([env.AI!.run('@cf/meta/m2m100-1.2b',{text,source_lang:source==='zh'?'chinese':'english',target_lang:target==='zh'?'chinese':'english'}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Translation timed out')),12000);})]);}
    finally{if(timer)clearTimeout(timer);}
    const translation=result&&typeof result==='object'&&'translated_text' in result?String(result.translated_text).trim():'';
    // Never silently replace a number with a hallucinated measurement.
    if(!translation||translation.length>12000||numericTokens(translation).join('|')!==numericTokens(text).join('|'))throw Error('Translation validation failed');
    if(env.ATLAS_SETTINGS)await env.ATLAS_SETTINGS.put(key,translation,{expirationTtl:2592000}).catch(()=>{});
    output[i]={text,translation};
   }catch{output[i]={text,error:'Translation unavailable; original retained.'};}
  }
 }));
 return Response.json({items:output,machineTranslated:true}, {headers});
}
