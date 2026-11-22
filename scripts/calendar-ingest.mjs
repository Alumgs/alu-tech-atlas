// Separate network path for public BLS schedules when the publisher blocks edge data centers.
// Credentials remain inside the CI environment; neither cookies nor passwords are printed.
const base=process.env.ATLAS_BASE_URL||'https://alu-tech-atlas.alumgs-lab-b74ee9.workers.dev';
const password=process.env.ATLAS_ACCESS_PASSWORD;
if(!password)throw Error('Missing CI calendar administrator credential');
const origin=new URL(base).origin;
let raw='';
for(let attempt=0;attempt<3;attempt++){
 try{
  const r=await fetch('https://www.bls.gov/schedule/news_release/bls.ics',{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'AtlasCalendar/1.0 (public official release calendar)'}});
  if(!r.ok)throw Error('Official BLS HTTP '+r.status);
  const text=await r.text();if(text.length>800000||!text.includes('BEGIN:VCALENDAR')||!text.includes('Bureau of Labor Statistics'))throw Error('Invalid official calendar');raw=text;break;
 }catch(error){if(attempt===2)throw error;}
}
const login=await fetch(new URL('/auth/login',base),{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password})});
if(login.status!==303)throw Error('Calendar runner cannot verify site administrator; current credential may have changed');
const cookie=login.headers.getSetCookie().find(x=>x.startsWith('__Host-atlas_session='))?.split(';')[0];
if(!cookie)throw Error('Calendar runner session missing');
try{
 const r=await fetch(new URL('/api/calendar/import',base),{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({source:'bls',raw,currentPassword:password}),signal:AbortSignal.timeout(90000)});
 const result=await r.json();if(!r.ok||!result.ok)throw Error('Calendar fallback sync failed: HTTP '+r.status);
 if(process.argv.includes('--verified-notices')){
  const notices=await fetch(new URL('/api/calendar/import',base),{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({source:'verified-notices',currentPassword:password}),signal:AbortSignal.timeout(90000)});
  const edition=await notices.json();
  if(!notices.ok||!edition.ok)throw Error('Verified notice sync failed: HTTP '+notices.status);
  console.log('Verified notices synchronized:',JSON.stringify({count:edition.count,changed:edition.changed}));
 }
 console.log('Official BLS calendar synchronized:',JSON.stringify({count:result.count,changed:result.changed}));
}finally{
 await fetch(new URL('/auth/logout',base),{method:'POST',headers:{Cookie:cookie,Origin:origin}}).catch(()=>{});
}
