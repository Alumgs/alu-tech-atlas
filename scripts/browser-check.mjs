// Authenticated UI regression. Credentials and browser session state never enter logs/artifacts.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.ATLAS_BASE_URL, password=process.env.ATLAS_ACCESS_PASSWORD;
if(!base||!password)throw Error('Browser verification requires the existing CI site configuration');
const origin=new URL(base).origin;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({baseURL:origin,viewport:{width:1440,height:900},locale:'zh-CN',reducedMotion:'reduce'});
context.setDefaultTimeout(15000);
const page=await context.newPage(),errors=[];
let documents=0,translations=0,feedRequests=0;
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(request.resourceType()==='document')documents++;if(new URL(request.url()).pathname==='/api/translate')translations++;if(new URL(request.url()).pathname==='/api/updates')feedRequests++;});
try{
 const login=await context.request.post('/auth/login',{headers:{Origin:origin},form:{password,returnTo:'/?domain=aidc&view=world'},maxRedirects:0});
 assert.equal(login.status(),303,'CI administrator login unavailable; no credentials are printed');
 // Real reports from production, already checked by the network smoke test. No synthetic news.
 const feeds=await Promise.all([42,43,44,50].map(async source=>{const response=await context.request.get('/api/updates?source='+source);assert.equal(response.status(),200);return response.json();}));
 assert.ok(feeds.filter(feed=>feed.statuses?.[0]?.ok&&feed.items?.length).length>=2,'Not enough live sources for multi-select verification');
 const snapshot={items:feeds.flatMap(feed=>feed.items||[]),statuses:feeds.flatMap(feed=>feed.statuses||[]),checkedAt:feeds.map(feed=>feed.checkedAt).filter(Boolean).sort().at(-1)};
 const preferences={autoTranslate:false,autoRefresh:false,theme:'light',density:'compact',fontScale:1,fontFamily:'system',contentWidth:'wide',showSummaries:true,showHotlist:true,reduceMotion:true};
 await context.addInitScript(({snapshot,preferences})=>{if(!localStorage.getItem('atlas-qa-seeded')){localStorage.setItem('atlas-updates-v9',JSON.stringify(snapshot));localStorage.setItem('atlas-reader-preferences-v1',JSON.stringify(preferences));localStorage.setItem('atlas-language','zh');localStorage.setItem('atlas-qa-seeded','1');}},{snapshot,preferences});
 await page.goto('/?domain=aidc&view=world',{waitUntil:'networkidle'});
 await page.locator('.event-card:visible').first().waitFor();
 assert.equal(await page.locator('.source-picker-trigger:visible').count(),1);
 await page.evaluate(()=>{window.__atlasQaMarker='same-document';});
 const initialDocuments=documents;
 const settings=()=>page.locator('.reader-settings-dialog:visible');
 await page.locator('.settings-nav-link').click();await settings().waitFor();
 assert.equal(documents,initialDocuments,'Settings performed document navigation');
 await settings().getByLabel('页面配色',{exact:false}).selectOption('dark');
 await page.waitForFunction(()=>document.documentElement.dataset.readerTheme==='dark');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(17, 28, 24)','Dark palette did not reach the actual page');
 await settings().getByLabel('信息密度',{exact:false}).selectOption('comfortable');
 await settings().getByLabel('文字大小',{exact:false}).selectOption('1.1');
 await settings().getByLabel('正文字体',{exact:false}).selectOption('serif');
 await settings().getByLabel('自动翻译外文内容',{exact:false}).uncheck();
 await page.keyboard.press('Escape');
 assert.equal(await settings().count(),0,'Escape failed to close settings');
 await page.locator('.settings-nav-link').click();await settings().waitFor();
 assert.equal(await settings().getByLabel('页面配色',{exact:false}).inputValue(),'dark');
 assert.equal(await settings().getByLabel('文字大小',{exact:false}).inputValue(),'1.1');
 assert.equal(await settings().getByLabel('自动翻译外文内容',{exact:false}).isChecked(),false);
 await settings().getByLabel('页面配色',{exact:false}).selectOption('light');
 await settings().getByLabel('信息密度',{exact:false}).selectOption('compact');
 await settings().getByLabel('文字大小',{exact:false}).selectOption('1');
 await settings().getByLabel('正文字体',{exact:false}).selectOption('system');
 await settings().getByLabel('自动翻译外文内容',{exact:false}).uncheck();
 await settings().getByLabel('自动刷新资讯',{exact:false}).uncheck();
 await settings().getByLabel('减少动画',{exact:false}).check();
 await page.keyboard.press('Escape');
 await page.locator('#stream-news-world .stream-summary>a').click();
 await page.locator('#source-directory-world').waitFor();
 const catalogBounds=await page.locator('#source-directory-world').boundingBox();assert.ok(catalogBounds&&catalogBounds.y<900,'Source directory link did not scroll to the expanded directory');
 await page.locator('#source-directory-panel-world>summary').click();
 const popup=()=>page.locator('.source-picker:visible');
 await page.locator('.source-picker-trigger:visible').click();await popup().waitFor();
 await page.waitForFunction(()=>{const box=document.querySelector('.source-picker')?.getBoundingClientRect();return box&&box.top>=0&&box.bottom<=innerHeight+1;});
 await popup().getByRole('button',{name:'清空',exact:true}).click();
 const options=popup().locator('.source-picker-options>label');const chosen=[];
 for(let i=0;i<await options.count()&&chosen.length<2;i++){const option=options.nth(i);if(Number(await option.locator('b').innerText())>0){chosen.push((await option.locator('span').innerText()).split('\n')[0]);await option.locator('input').check();}}
 assert.equal(chosen.length,2);await popup().getByRole('button',{name:'应用筛选',exact:true}).click();
 assert.match(await page.locator('.source-picker-trigger:visible').innerText(),/2.*已选/);
 await page.locator('.event-card:visible').first().waitFor();
 const allowed=snapshot.items.filter(item=>chosen.includes(item.feedId||item.source)).map(item=>new URL(item.url).href);
 assert.equal(await page.locator('.event-card:visible h3 a').evaluateAll((links,allowed)=>links.length>0&&links.every(link=>allowed.includes(link.href)),allowed),true,'Multi-source output contains a non-selected report');
 await page.locator('.source-picker-trigger:visible').click();await popup().getByRole('button',{name:'清空',exact:true}).click();await popup().getByRole('button',{name:'取消',exact:true}).click();
 assert.match(await page.locator('.source-picker-trigger:visible').innerText(),/2.*已选/,'Cancel applied the draft');
 const nav=page.getByRole('navigation',{name:'主导航',exact:true});
 await nav.getByRole('button',{name:'环球日历',exact:true}).click();
 await page.locator('main.view-calendar .gc-titlebar').waitFor();
 await page.locator('.gc-event:visible').first().waitFor();
 await nav.getByRole('button',{name:'世界热点',exact:true}).click();await page.locator('main.view-world .source-picker-trigger:visible').waitFor();
 assert.match(await page.locator('.source-picker-trigger:visible').innerText(),/2.*已选/,'Source selection was lost on a round trip');
 const samples=[];
 for(let i=0;i<6;i++){
  for(const target of ['calendar','world']){
   const elapsed=await page.evaluate(async target=>{
    const title=target==='calendar'?'环球日历':'世界热点',button=[...document.querySelectorAll('nav[aria-label="主导航"] button')].find(node=>node.textContent.trim()===title),start=performance.now();if(!button)throw Error('Navigation button missing');button.click();
    await new Promise((resolve,reject)=>{const limit=start+10000;const check=()=>{const main=document.querySelector('main.view-'+target);if(main&&main.getAttribute('aria-busy')!=='true')requestAnimationFrame(()=>requestAnimationFrame(resolve));else if(performance.now()>limit)reject(Error('Navigation commit timeout'));else requestAnimationFrame(check);};requestAnimationFrame(check);});return performance.now()-start;
   },target);samples.push({target,ms:Math.round(elapsed)});
  }
 }
 assert.equal(documents,initialDocuments,'Portal navigation reloaded the document');
 assert.equal(await page.evaluate(()=>window.__atlasQaMarker),'same-document');
 // Popover must not remain floating over another retained view.
 await page.locator('.source-picker-trigger:visible').click();await popup().waitFor();await nav.getByRole('button',{name:'环球日历',exact:true}).click();await page.locator('main.view-calendar').waitFor();
 await page.locator('.source-picker').waitFor({state:'hidden'});assert.equal(await popup().count(),0,'Source popover survived a view change');
 await nav.getByRole('button',{name:'世界热点',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await page.locator('.settings-nav-link').click();await settings().waitFor();
 const bounds=await settings().boundingBox();assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=391,'Mobile settings overflow the viewport');
 await page.keyboard.press('Escape');
 await page.locator('.source-picker-trigger:visible').click();await popup().waitFor();
 const sourceBounds=await popup().boundingBox();assert.ok(sourceBounds&&sourceBounds.x>=0&&sourceBounds.x+sourceBounds.width<=391,'Mobile source picker overflows the viewport');
 await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'Mobile page has horizontal overflow');
 const portalDocumentReloads=documents-initialDocuments;
 await page.setViewportSize({width:1440,height:900});await page.goto('/?domain=aidc&view=library',{waitUntil:'networkidle'});
 await page.locator('.wiki-entry h2 a').first().waitFor();const libraryDocuments=documents;await page.evaluate(()=>window.__atlasArticleMarker='client-route');
 await page.locator('.wiki-entry h2 a').first().click();await page.waitForURL(/\/read\//);await page.locator('main.reading h1').waitFor();
 assert.equal(documents,libraryDocuments,'Article link performed a document reload');assert.equal(await page.evaluate(()=>window.__atlasArticleMarker),'client-route');
 await page.locator('.read-header a').filter({hasText:'返回知识手册'}).click();await page.locator('main.view-library').waitFor();assert.equal(documents,libraryDocuments,'Returning from an article reloaded the document');
 assert.equal(translations,0,'Translation-off preference still issued translation requests');
 assert.equal(feedRequests,0,'Disabled background refresh fetched feeds despite an available cached snapshot');
 assert.deepEqual(errors,[],'Browser runtime errors');
 const timing={};for(const target of ['calendar','world']){const values=samples.filter(sample=>sample.target===target).map(sample=>sample.ms).sort((a,b)=>a-b);timing[target]={medianMs:Math.round((values[Math.floor((values.length-1)/2)]+values[Math.floor(values.length/2)])/2),maxMs:Math.max(...values),samples:values};}
 console.log('Browser interaction verified:',JSON.stringify({browser:'headless Chromium',viewport:'1440x900; mobile 390x844',liveReports:snapshot.items.length,sourceSelection:'two feeds, cancel and round-trip retention',settings:'dialog, Escape, persisted style controls',portalDocumentReloads,articleDocumentReloads:documents-libraryDocuments,translationRequests:translations,backgroundFeedRequests:feedRequests,warmNavigation:timing}));
}finally{
 await context.request.post('/auth/logout',{headers:{Origin:origin}}).catch(()=>{});
 await context.close();await browser.close();
}
