const encoder=new TextEncoder();
export const COOKIE='__Host-atlas_session';
export const SESSION_SECONDS=12*60*60;
export type AuthEnv={ATLAS_PASSWORD_HASH?:string;ATLAS_SESSION_SECRET?:string};
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>new Uint8Array(value.match(/../g)!.map(b=>parseInt(b,16)));
export function configured(env:AuthEnv){return /^pbkdf2-sha256\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(env.ATLAS_PASSWORD_HASH||'')&&(env.ATLAS_SESSION_SECRET?.length||0)>=32;}
export async function verifyPassword(password:string,stored:string){
 const [scheme,rounds,salt,expected]=stored.split('$');
 if(scheme!=='pbkdf2-sha256'||rounds!=='100000'||!salt||!expected||password.length>256)return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:unhex(salt)},key,256));
 let diff=actual.length^expected.length;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^expected.charCodeAt(i);return diff===0;
}
async function key(env:AuthEnv){return crypto.subtle.importKey('raw',encoder.encode(env.ATLAS_SESSION_SECRET!+':'+env.ATLAS_PASSWORD_HASH!),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function issueSession(env:AuthEnv,now=Date.now()){
 const payload=`${Math.floor(now/1000)+SESSION_SECONDS}.${crypto.randomUUID()}`;
 return payload+'.'+hex(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(payload)));
}
export async function validSession(value:string,env:AuthEnv,now=Date.now()){
 if(!configured(env)||value.length>180)return false;
 const parts=value.split('.');if(parts.length!==3||!/^\d{10}$/.test(parts[0])||!/^[-a-f0-9]{36}$/.test(parts[1])||!/^([a-f0-9]{64})$/.test(parts[2]))return false;
 const exp=Number(parts[0]),current=Math.floor(now/1000);if(exp<=current||exp>current+SESSION_SECONDS)return false;
 return crypto.subtle.verify('HMAC',await key(env),unhex(parts[2]),encoder.encode(parts[0]+'.'+parts[1]));
}
export function getCookie(request:Request){return (request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
export function sessionCookie(value:string,age=SESSION_SECONDS){return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
export function sameOrigin(request:Request){return request.headers.get('Origin')===new URL(request.url).origin;}
export function safeReturn(value:string|null){if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return '/';return value.startsWith('/auth/')?'/':value;}
