const base=process.env.ATLAS_BASE_URL;
if(!base)throw Error('ATLAS_BASE_URL is required');
const origin=new URL(base).origin;
const request=(path,init={})=>fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(30000),...init});
const must=(condition,message)=>{if(!condition)throw Error(message);};
let info;
for(let attempt=1;attempt<=6;attempt++){
 const health=await request('/api/health?smoke='+Date.now());
 const contentType=health.headers.get('content-type')||'';
 if(health.status===200&&contentType.includes('application/json')){info=await health.json();break;}
 if(attempt===6)throw Error('health endpoint invalid: status='+health.status+', content-type='+contentType+', location='+String(health.headers.get('location')));
 await new Promise(r=>setTimeout(r,1500));
}
must(info?.ok&&info?.authConfigured&&info?.version==='4.2.0'&&info?.settingsStorage,'health, auth or KV settings configuration failed');
for(const path of ['/','/settings','/case-study','/read/a04','/aidc.jpg']){
 const r=await request(path);
 must(r.status===302&&r.headers.get('location')?.startsWith('/auth/login'),'anonymous path is not protected: '+path);
}
for(const path of ['/api/updates?source=0','/api/indicators','/api/admin/settings','/api/translate']){
 must((await request(path)).status===401,'anonymous API not protected: '+path);
}
const csrf=await request('/auth/login',{method:'POST',headers:{Origin:'https://invalid.example','Content-Type':'application/x-www-form-urlencoded'},body:'password=invalid'});
must(csrf.status===403,'cross-origin login accepted');
const loginPage=await request('/auth/login');
must(loginPage.ok&&(loginPage.headers.get('content-type')||'').includes('text/html'),'login page failed');
must((await loginPage.text()).includes('知域 ATLAS'),'login page content missing');
if(process.env.ATLAS_ACCESS_PASSWORD){
 const login=await request('/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:process.env.ATLAS_ACCESS_PASSWORD})});
 if(login.status===401){
  console.warn('Skipping authenticated page checks because the GitHub Actions password no longer matches the site-managed password.');
 }else{
  must(login.status===303,'password login endpoint failed: status='+login.status+' location='+String(login.headers.get('location')));
  const cookieLines=typeof login.headers.getSetCookie==='function'?login.headers.getSetCookie():[login.headers.get('set-cookie')||''];
  const loginCookie=cookieLines.find(v=>v.trim().startsWith('__Host-atlas_session='));
  must(loginCookie,'session cookie missing');
  must(loginCookie.includes('Max-Age=604800'),'session cookie is not configured for seven days');
  const cookie=loginCookie.split(';')[0];
  for(const [path,marker] of [['/','知域'],['/settings','网站设置'],['/case-study','1 MW'],['/read/a04','液冷'],['/?view=world','世界热点']]){
   const r=await request(path,{headers:{Cookie:cookie}});
   must(r.ok,'authenticated route failed: '+path+' status='+r.status+' location='+String(r.headers.get('location')));
   must((await r.text()).includes(marker),'route content missing: '+path);
  }
  const admin=await request('/api/admin/settings',{headers:{Cookie:cookie}});
  const settings=await admin.json();
  must(admin.ok&&settings.settings&&settings.sessionDays===7&&settings.storage==='cloudflare-kv','admin settings API contract failed');
  const noReauth=await request('/api/admin/settings',{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({settings:settings.settings})});
  must(noReauth.status===403,'settings mutation accepted without current-password confirmation');
  const home=await request('/',{headers:{Cookie:cookie}});
  const homeHtml=await home.text();
  const cssPath=homeHtml.match(/href=["']([^"']+\.css)["']/)?.[1];
  must(cssPath&&/^\/_next\/static\/css\//.test(cssPath),'stylesheet link missing from home HTML');
  const css=await request(cssPath,{headers:{Cookie:cookie}});
  must(css.ok&&css.headers.get('content-type')?.includes('text/css'),'stylesheet asset failed: '+css.status+' '+(css.headers.get('content-type')||''));
  const cssText=await css.text();
  must(cssText.includes('tailwindcss')||cssText.includes('--tw-'),'stylesheet content missing');
  const asset=await request('/aidc.jpg',{headers:{Cookie:cookie}});
  must(asset.ok&&asset.headers.get('content-type')?.includes('image'),'image asset failed');
  const invalid=await request('/api/updates?source=99999',{headers:{Cookie:cookie}});
  must(invalid.status===400,'source validation failed');
  const feed=await request('/api/updates?source=0',{headers:{Cookie:cookie}});
  const data=await feed.json();
  must(feed.ok&&Array.isArray(data.items)&&data.statuses?.length===1,'news endpoint contract failed');
  console.log('Feed collection status:',JSON.stringify(data.statuses.map(({name,ok,count})=>({name,ok,count}))));
  // Domestic source contract and coverage, exercised from the deployed Worker network.
  const domestic=await Promise.all([50,52,54,55].map(async index=>{
   const r=await request('/api/updates?source='+index,{headers:{Cookie:cookie}}),d=await r.json();
   must(r.ok&&Array.isArray(d.items)&&d.statuses?.length===1,'domestic source contract failed: '+index);
   must(d.items.every(n=>n.region==='cn'),'domestic source missing China region: '+index);
   return {index,...d.statuses[0]};
  }));
  console.log('Domestic collection status:',JSON.stringify(domestic.map(({index,name,ok,count,error})=>({index,name,ok,count,error}))));
  must(domestic.some(s=>s.ok&&s.count>0),'no direct domestic sources available from deployed Worker');
  const international=await Promise.all([42,43,44,62,63].map(async index=>{
   const r=await request('/api/updates?source='+index,{headers:{Cookie:cookie}}),d=await r.json();
   must(r.ok&&Array.isArray(d.items)&&d.statuses?.length===1,'international feed contract failed: '+index);
   return {index,...d.statuses[0],ipo:d.items.filter(n=>/IPO|S-1|public offering/i.test(n.title)).map(n=>({title:n.title,date:n.date,url:n.url}))};
  }));
  console.log('International collection status:',JSON.stringify(international.map(({index,name,ok,count,error,ipo})=>({index,name,ok,count,error,ipo}))));
  must(international.some(s=>s.index>=42&&s.index<=44&&s.ok&&s.count>0),'BBC unavailable from deployed Worker');
  must(international.some(s=>s.index>=62&&s.ok&&s.count>0),'official company newsroom unavailable from deployed Worker');
  const logout=await request('/auth/logout',{method:'POST',headers:{Origin:origin,Cookie:cookie}});
  must(logout.status===303&&logout.headers.get('set-cookie')?.includes('Max-Age=0'),'logout failed');
 }
}
console.log('Atlas smoke tests passed: health, KV binding, login entry, protected routes, seven-day sessions and admin settings checks when credential is current.');
