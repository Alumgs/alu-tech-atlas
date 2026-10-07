import type {Indicators} from '@/lib/indicators';
export const dynamic='force-dynamic';
let cache:{at:number;data:Indicators}|undefined;
async function read(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json,text/csv'},cache:'no-store'});if(!r.ok)throw Error('来源响应 '+r.status);return r;}
export async function GET(request:Request){
 const force=new URL(request.url).searchParams.get('force')==='1';
 if(!force&&cache&&Date.now()-cache.at<3600000)return Response.json({...cache.data,cached:true});
 const data:Indicators={checkedAt:new Date().toISOString(),indicators:[],models:[],statuses:[]};
 const tasks=[
 ['World Bank',async()=>{
  const r=await read('https://api.worldbank.org/v2/country/CHN;USA/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=30&date=2020:'+new Date().getUTCFullYear());const payload:any=await r.json();if(!Array.isArray(payload?.[1]))throw Error('数据格式变化');
  for(const id of ['CHN','USA']){const rows=payload[1].filter((x:any)=>x.countryiso3code===id&&typeof x.value==='number').sort((a:any,b:any)=>Number(b.date)-Number(a.date));if(!rows.length)continue;const x=rows[0];data.indicators.push({id:'gdp-'+id,name:(id==='CHN'?'中国':'美国')+'实际 GDP 年增长',value:x.value,unit:'%',period:x.date,source:'World Bank · WDI',url:'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations='+id,note:'年度数据；按不变价计算，可能修订。用于宏观背景，不能当作 AI 市场增速。',history:rows.reverse().map((x:any)=>({period:x.date,value:x.value}))});}
  if(!data.indicators.some(x=>x.id.startsWith('gdp-')))throw Error('暂无有效观察值');
 }],
 ['FRED',async()=>{
  const r=await read('https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10&cosd='+new Date(Date.now()-90*86400000).toISOString().slice(0,10));const csv=await r.text();const rows=csv.trim().split('\n').slice(1).map(l=>l.trim().split(',')).filter(([d,v])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&v!==''&&v!=='.'&&Number.isFinite(Number(v)));const last=rows.at(-1);if(!last)throw Error('暂无有效观察值');data.indicators.push({id:'dgs10',name:'美国 10 年期国债收益率',value:Number(last[1]),unit:'%',period:last[0],source:'FRED · DGS10',url:'https://fred.stlouisfed.org/series/DGS10',note:'日度观察；非逐笔行情。融资环境参考，不是企业融资利率。',history:rows.slice(-30).map(([d,v])=>({period:d,value:Number(v)}))});
 }],
 ['OpenRouter',async()=>{
  const r=await read('https://openrouter.ai/api/v1/models');const payload:any=await r.json();if(!Array.isArray(payload?.data))throw Error('数据格式变化');
  const selected=payload.data.filter((m:any)=>m.id&&m.name&&m.context_length>0&&!m.id.endsWith(':free')).sort((a:any,b:any)=>(b.created||0)-(a.created||0)).slice(0,16);
  const price=(p:unknown)=>typeof p==='string'&&p.trim()!==''&&Number.isFinite(Number(p))&&Number(p)>=0?Number(p)*1e6:null;
  data.models=selected.map((m:any)=>({id:m.id,name:m.name,context:m.context_length,input:price(m.pricing?.prompt),output:price(m.pricing?.completion),url:'https://openrouter.ai/'+m.id}));if(!data.models.length)throw Error('暂无模型数据');
 }]
 ] as const;
 await Promise.all(tasks.map(async([name,run])=>{try{await run();data.statuses.push({name,ok:true});}catch(e){data.statuses.push({name,ok:false,error:e instanceof Error&&/^(来源响应|数据格式|暂无)/.test(e.message)?e.message:'连接超时或暂不可用'});}}));
 data.indicators.sort((a,b)=>a.id.localeCompare(b.id));
 if(data.statuses.every(s=>s.ok))cache={at:Date.now(),data};
 return Response.json(data,{headers:{'Cache-Control':'private, no-store'}});
}
