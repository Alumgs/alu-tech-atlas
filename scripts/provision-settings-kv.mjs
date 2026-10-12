import {readFile,writeFile} from 'node:fs/promises';

const accountId=process.env.CLOUDFLARE_ACCOUNT_ID||'';
const token=process.env.CLOUDFLARE_API_TOKEN||'';
if(!accountId||!token)throw new Error('Cloudflare account ID and API token are required');
const api='https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(accountId)+'/storage/kv/namespaces';
async function call(url,init={}){
  const response=await fetch(url,{...init,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(init.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.success===false)throw new Error('Cloudflare KV API failed ('+response.status+'): '+JSON.stringify(data.errors||data));
  return data;
}
const listing=await call(api+'?per_page=1000');
let namespace=(listing.result||[]).find(item=>item.title==='ATLAS_SETTINGS');
if(!namespace){
  const created=await call(api,{method:'POST',body:JSON.stringify({title:'ATLAS_SETTINGS'})});
  namespace=created.result;
}
if(!namespace?.id)throw new Error('Cloudflare did not return a KV namespace ID');
const path='dist/server/wrangler.json';
const config=JSON.parse(await readFile(path,'utf8'));
const namespaces=Array.isArray(config.kv_namespaces)?config.kv_namespaces:[];
config.kv_namespaces=[...namespaces.filter(item=>item.binding!=='ATLAS_SETTINGS'),{binding:'ATLAS_SETTINGS',id:namespace.id}];
await writeFile(path,JSON.stringify(config,null,2)+'\n');
console.log('Provisioned ATLAS_SETTINGS KV binding:',namespace.id);
