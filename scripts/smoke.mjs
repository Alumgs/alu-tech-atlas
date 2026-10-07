const base=process.env.ATLAS_BASE_URL;
if(!base)throw Error('ATLAS_BASE_URL is required');
const origin=new URL(base).origin;
const request=(path,init={})=>fetch(new URL(path,base),{redirect:'manual',...init});
const must=(condition,message)=>{if(!condition)throw Error(message);};
const health=await request('/api/health');const info=await health.json();must(info.ok&&info.authConfigured&&info.version==='4.0.0','health or auth configuration failed');
for(const path of ['/','/case-study','/read/a04','/aidc.jpg']){const r=await request(path);must(r.status===302&&r.headers.get('location')?.startsWith('/auth/login'),'anonymous path is not protected: '+path);}
for(const path of ['/api/updates?source=0','/api/indicators']){must((await request(path)).status===401,'anonymous API not protected: '+path);}
const csrf=await request('/auth/login',{method:'POST',headers:{Origin:'https://invalid.example','Content-Type':'application/x-www-form-urlencoded'},body:'password=invalid'});must(csrf.status===403,'cross-origin login accepted');
if(process.env.ATLAS_ACCESS_PASSWORD){
 const login=await request('/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:process.env.ATLAS_ACCESS_PASSWORD})});
 must(login.status===303,'password login failed');const cookie=login.headers.get('set-cookie')?.split(';')[0];must(cookie,'session cookie missing');
 for(const [path,marker] of [['/','知域'],['/case-study','1 MW'],['/read/a04','液冷']]){const r=await request(path,{headers:{Cookie:cookie}});must(r.ok,'route failed: '+path);must((await r.text()).includes(marker),'route content missing: '+path);}
 const asset=await request('/aidc.jpg',{headers:{Cookie:cookie}});must(asset.ok&&asset.headers.get('content-type')?.includes('image'),'image asset failed');
 const invalid=await request('/api/updates?source=99999',{headers:{Cookie:cookie}});must(invalid.status===400,'source validation failed');
 const feed=await request('/api/updates?source=0',{headers:{Cookie:cookie}});const data=await feed.json();must(feed.ok&&Array.isArray(data.items)&&data.statuses?.length===1,'news endpoint contract failed');
 console.log('Feed collection status:',JSON.stringify(data.statuses.map(({name,ok,count})=>({name,ok,count}))));
 const logout=await request('/auth/logout',{method:'POST',headers:{Origin:origin,Cookie:cookie}});must(logout.status===303&&logout.headers.get('set-cookie')?.includes('Max-Age=0'),'logout failed');
}
console.log('Atlas smoke tests passed: auth, protected pages/assets/APIs, login, content routes and logout.');
