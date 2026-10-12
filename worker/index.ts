import handler from 'vinext/server/fetch-handler';
import {configured,verifyPassword,hashPassword,issueSession,validSession,getCookie,sessionCookie,sameOrigin,safeReturn,type AuthEnv} from './auth';
import {loginPage} from './login';
import {defaultSiteSettings,sanitizeSiteSettings} from '../lib/site-settings';
interface Env extends AuthEnv {
 LOGIN_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>};
 FEED_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>};
 ASSETS:Fetcher;
 ATLAS_SETTINGS?:KVNamespace;
}
function protect(response:Response){
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','private, no-store');headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');
 headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

const randomSecret=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function effectiveAuthEnv(env:Env):Promise<AuthEnv>{
 if(!env.ATLAS_SETTINGS)return env;
 try{
  const [passwordHash,sessionSecret]=await Promise.all([env.ATLAS_SETTINGS.get('auth-password-hash'),env.ATLAS_SETTINGS.get('auth-session-secret')]);
  return {...env,ATLAS_PASSWORD_HASH:passwordHash||env.ATLAS_PASSWORD_HASH,ATLAS_SESSION_SECRET:sessionSecret||env.ATLAS_SESSION_SECRET};
 }catch{
  // Do not silently fall back to old credentials when cloud settings storage is unhealthy.
  return {...env,ATLAS_PASSWORD_HASH:'',ATLAS_SESSION_SECRET:''};
 }
}
async function readBody(request:Request){
 const length=Number(request.headers.get('Content-Length')||0);
 if(length>20000)throw new Error('请求内容过大');
 const value=await request.json();
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('请求格式无效');
 return value as Record<string,unknown>;
}
const json=(value:unknown,status=200,headers:HeadersInit={})=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store',...Object.fromEntries(new Headers(headers))}});
async function adminApi(request:Request,env:Env,authEnv:AuthEnv){
 const path=new URL(request.url).pathname,kv=env.ATLAS_SETTINGS;
 if(!kv)return json({error:'设置存储尚未配置，请检查 Cloudflare KV 绑定。'},503);
 if(request.method==='GET'&&path==='/api/admin/settings'){
  try{
   const raw=await kv.get('public-settings');
   let settings=defaultSiteSettings;
   if(raw){try{settings=sanitizeSiteSettings(JSON.parse(raw));}catch{}}
   return json({settings,sessionDays:7,storage:'cloudflare-kv'});
  }catch{return json({error:'读取云端设置失败，请稍后重试。'},503);}
 }
 if(request.method!=='POST')return json({error:'请求方法不支持。'},405,{Allow:'GET, POST'});
 if(!sameOrigin(request))return json({error:'请求来源不符。'},403);
 let body:Record<string,unknown>;
 try{body=await readBody(request);}catch(e){return json({error:e instanceof Error?e.message:'请求格式无效。'},400);}
 if(path==='/api/admin/settings'){
  const settings=sanitizeSiteSettings(body.settings);
  try{await kv.put('public-settings',JSON.stringify(settings));return json({ok:true,settings});}
  catch{return json({error:'保存设置失败，请检查 KV 存储权限或稍后重试。'},503);}
 }
 if(path==='/api/admin/password'){
  const current=typeof body.currentPassword==='string'?body.currentPassword:'';
  const next=typeof body.newPassword==='string'?body.newPassword:'';
  if(next.length<12||next.length>256)return json({error:'新密码必须为 12–256 个字符。'},400);
  if(!await verifyPassword(current,authEnv.ATLAS_PASSWORD_HASH||''))return json({error:'当前密码不正确。'},401);
  try{
   await kv.put('auth-password-hash',await hashPassword(next));
   await kv.put('auth-session-secret',randomSecret());
   return json({ok:true,reauthenticate:true},200,{'Set-Cookie':sessionCookie('',0)});
  }catch{return json({error:'密码保存失败，请稍后重试。'},503);}
 }
 if(path==='/api/admin/logout-all'){
  try{
   await kv.put('auth-session-secret',randomSecret());
   return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)});
  }catch{return json({error:'会话撤销失败，请稍后重试。'},503);}
 }
 return json({error:'未知管理接口。'},404);
}

const html=(message='',target='/',status=200)=>new Response(loginPage(message,target),{status,headers:{'Content-Type':'text/html; charset=utf-8'}});
async function boundedForm(request:Request){
 if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))throw Error('type');
 const reader=request.body?.getReader();if(!reader)throw Error('body');let bytes=0;let text='';const decoder=new TextDecoder();
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>4096){await reader.cancel();throw Error('size');}text+=decoder.decode(value,{stream:true});}
 text+=decoder.decode();return new URLSearchParams(text);
}
export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext){
  const url=new URL(request.url),path=url.pathname;
  let result:Response;
  const authEnv=await effectiveAuthEnv(env);
  if(path==='/api/health')return protect(Response.json({ok:true,service:'alu-tech-atlas',version:'4.0.0',platform:'cloudflare-workers',authConfigured:configured(authEnv),settingsStorage:Boolean(env.ATLAS_SETTINGS)}));
  if(!configured(authEnv))return protect(new Response('网站正在完成访问配置，请稍后再试。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}));
  if(path==='/auth/login'){
   if(request.method==='GET')result=html('',safeReturn(url.searchParams.get('returnTo')));
   else if(request.method==='POST'){
    if(!sameOrigin(request))return protect(new Response('请求来源不符',{status:403}));
    const limited=await env.LOGIN_LIMITER.limit({key:'atlas-login:'+ (request.headers.get('CF-Connecting-IP')||'unknown')});
    if(!limited.success)return protect(new Response('尝试过于频繁，请稍后重试。',{status:429,headers:{'Retry-After':'60'}}));
    try{
     const form=await boundedForm(request),password=form.get('password')||'',target=safeReturn(form.get('returnTo'));
     if(!await verifyPassword(password,authEnv.ATLAS_PASSWORD_HASH!))result=html('密码不正确，请重试。',target,401);
     else result=new Response(null,{status:303,headers:{Location:target,'Set-Cookie':sessionCookie(await issueSession(authEnv))}});
    }catch{result=html('登录请求无效，请重新输入。','/',400);}
   }else result=new Response('Method not allowed',{status:405,headers:{Allow:'GET, POST'}});
  }else if(path==='/auth/logout'){
   if(request.method!=='POST')result=new Response('Method not allowed',{status:405});
   else if(!sameOrigin(request))result=new Response('请求来源不符',{status:403});
   else result=new Response(null,{status:303,headers:{Location:'/auth/login','Set-Cookie':sessionCookie('',0)}});
  }else if(!await validSession(getCookie(request),authEnv)){
   result=path.startsWith('/api/')?Response.json({error:'请先登录',login:'/auth/login'},{status:401}):new Response(null,{status:302,headers:{Location:'/auth/login?returnTo='+encodeURIComponent(safeReturn(path+url.search))}});
  }else{
   if(path.startsWith('/api/admin/')){
    const limited=await env.FEED_LIMITER.limit({key:'atlas-admin:'+getCookie(request).slice(0,48)});
    result=limited.success?await adminApi(request,env,authEnv):json({error:'请求频率过高，请稍后重试。'},429,{'Retry-After':'60'});
   }else if(path.startsWith('/_next/static/')||path==='/favicon.svg'){
    result=await env.ASSETS.fetch(request);
   }else if(path.startsWith('/api/')&&!await env.FEED_LIMITER.limit({key:'atlas-feed:'+getCookie(request).slice(0,48)}).then(r=>r.success)){
    result=Response.json({error:'请求频率过高，请稍后重试'},{status:429,headers:{'Retry-After':'60'}});
   }else{
    result=await handler.fetch(request,env,ctx);
   }
  }
  return protect(result);
 }
};
