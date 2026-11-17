// Independent network path for official publishers that block edge data centers.
// Credentials remain in CI; neither cookies nor passwords are logged.
const base=process.env.ATLAS_BASE_URL||'https://alu-tech-atlas.alumgs-lab-b74ee9.workers.dev';
const password=process.env.ATLAS_ACCESS_PASSWORD;
if(!password)throw Error('Missing CI calendar administrator credential');
const origin=new URL(base).origin;
const sources=[{id:'bls',url:'https://www.bls.gov/schedule/news_release/bls.ics',valid:text=>text.includes('BEGIN:VCALENDAR')&&text.includes('Bureau of Labor Statistics')},{id:'eu-council',url:'https://www.consilium.europa.eu/en/meetings/calendar/',valid:text=>text.includes('gsc-excerpt-item__title')&&text.includes('/en/meetings/')}];
const snapshots=await Promise.allSettled(sources.map(async source=>{
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch(source.url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':source.id==='bls'?'AtlasCalendar/1.0 (public official release calendar)':'Mozilla/5.0','Accept':'text/html,text/calendar;q=0.9'}});
   if(!r.ok)throw Error(source.id+' official HTTP '+r.status);
   const raw=await r.text();if(raw.length>800000||!source.valid(raw))throw Error(source.id+' invalid official calendar');return {id:source.id,raw};
  }catch(error){if(attempt===2)throw error;}
 }
 throw Error('No official snapshot');
}));
const login=await fetch(new URL('/auth/login',base),{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password})});
if(login.status!==303)throw Error('Calendar runner cannot verify current administrator');
const cookie=login.headers.getSetCookie().find(x=>x.startsWith('__Host-atlas_session='))?.split(';')[0];
if(!cookie)throw Error('Calendar runner session missing');
const failures=[];
try{
 for(let i=0;i<snapshots.length;i++){
  const snapshot=snapshots[i];if(snapshot.status==='rejected'){failures.push(sources[i].id+': '+String(snapshot.reason));continue;}
  const {id,raw}=snapshot.value;
  const r=await fetch(new URL('/api/calendar/import',base),{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({source:id,raw,currentPassword:password}),signal:AbortSignal.timeout(90000)});
  const result=await r.json();if(!r.ok||!result.ok){failures.push(id+' import HTTP '+r.status);continue;}
  console.log('Official calendar synchronized:',JSON.stringify({source:id,count:result.count,changed:result.changed}));
 }
}finally{await fetch(new URL('/auth/logout',base),{method:'POST',headers:{Cookie:cookie,Origin:origin}}).catch(()=>{});}
if(failures.length)throw Error(failures.join('; '));
