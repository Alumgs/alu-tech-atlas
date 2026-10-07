import handler from 'vinext/server/fetch-handler';
import {configured,verifyPassword,issueSession,validSession,getCookie,sessionCookie,sameOrigin,safeReturn,type AuthEnv} from './auth';
import {loginPage} from './login';
interface Env extends AuthEnv {
 LOGIN_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>};
 FEED_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>};
 ASSETS:Fetcher;
}
function protect(response:Response){
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','private, no-store');headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');
 headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
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
  if(path==='/api/health')return protect(Response.json({ok:true,service:'alu-tech-atlas',version:'4.0.0',platform:'cloudflare-workers',authConfigured:configured(env)}));
  if(!configured(env))return protect(new Response('网站正在完成访问配置，请稍后再试。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}));
  if(path==='/auth/login'){
   if(request.method==='GET')result=html('',safeReturn(url.searchParams.get('returnTo')));
   else if(request.method==='POST'){
    if(!sameOrigin(request))return protect(new Response('请求来源不符',{status:403}));
    const limited=await env.LOGIN_LIMITER.limit({key:'atlas-login:'+ (request.headers.get('CF-Connecting-IP')||'unknown')});
    if(!limited.success)return protect(new Response('尝试过于频繁，请稍后重试。',{status:429,headers:{'Retry-After':'60'}}));
    try{
     const form=await boundedForm(request),password=form.get('password')||'',target=safeReturn(form.get('returnTo'));
     if(!await verifyPassword(password,env.ATLAS_PASSWORD_HASH!))result=html('密码不正确，请重试。',target,401);
     else result=new Response(null,{status:303,headers:{Location:target,'Set-Cookie':sessionCookie(await issueSession(env))}});
    }catch{result=html('登录请求无效，请重新输入。','/',400);}
   }else result=new Response('Method not allowed',{status:405,headers:{Allow:'GET, POST'}});
  }else if(path==='/auth/logout'){
   if(request.method!=='POST')result=new Response('Method not allowed',{status:405});
   else if(!sameOrigin(request))result=new Response('请求来源不符',{status:403});
   else result=new Response(null,{status:303,headers:{Location:'/auth/login','Set-Cookie':sessionCookie('',0)}});
  }else if(!await validSession(getCookie(request),env)){
   result=path.startsWith('/api/')?Response.json({error:'请先登录',login:'/auth/login'},{status:401}):new Response(null,{status:302,headers:{Location:'/auth/login?returnTo='+encodeURIComponent(safeReturn(path+url.search))}});
  }else{
   if(path.startsWith('/api/')&&!await env.FEED_LIMITER.limit({key:'atlas-feed:'+getCookie(request).slice(0,48)}).then(r=>r.success))return protect(Response.json({error:'请求频率过高，请稍后重试'},{status:429,headers:{'Retry-After':'60'}}));
   // Asset requests also pass through this gate. Do not expose static data or RSC modules before login.
   result=await handler.fetch(request,env,ctx);
  }
  return protect(result);
 }
};
