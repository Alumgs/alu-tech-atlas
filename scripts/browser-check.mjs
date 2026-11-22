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
let documents=0,translations=0,feedRequests=0,adminReads=0;
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(request.resourceType()==='document')documents++;if(new URL(request.url()).pathname==='/api/admin/settings'&&request.method()==='GET')adminReads++;if(new URL(request.url()).pathname==='/api/translate')translations++;if(new URL(request.url()).pathname==='/api/updates')feedRequests++;});
try{
 const login=await context.request.post('/auth/login',{headers:{Origin:origin},form:{password,returnTo:'/?domain=aidc&view=world'},maxRedirects:0});
 assert.equal(login.status(),303,'CI administrator login unavailable; no credentials are printed');
 // Real reports from production, already checked by the network smoke test. No synthetic news.
 const feeds=await Promise.all([42,43,44,50].map(async source=>{const response=await context.request.get('/api/updates?source='+source);assert.equal(response.status(),200);return response.json();}));
 assert.ok(feeds.filter(feed=>feed.statuses?.[0]?.ok&&feed.items?.length).length>=2,'Not enough live sources for multi-select verification');
 const snapshot={items:feeds.flatMap(feed=>feed.items||[]),statuses:feeds.flatMap(feed=>feed.statuses||[]),checkedAt:feeds.map(feed=>feed.checkedAt).filter(Boolean).sort().at(-1)};
 const preferences={autoTranslate:false,autoRefresh:false,theme:'light',density:'compact',fontScale:1,fontFamily:'system',contentWidth:'wide',showSummaries:true,showHotlist:true,reduceMotion:true};
 await context.addInitScript(({snapshot,preferences})=>{if(!localStorage.getItem('atlas-qa-seeded')){localStorage.setItem('atlas-updates-v9',JSON.stringify(snapshot));localStorage.setItem('atlas-reader-preferences-v1',JSON.stringify(preferences));localStorage.setItem('atlas-language','zh');localStorage.setItem('atlas-qa-seeded','1');}},{snapshot,preferences});
 const cloudResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/admin/settings'&&response.request().method()==='GET');
 await page.goto('/?domain=aidc&view=world',{waitUntil:'networkidle'});
 const cloudSnapshot=await (await cloudResponse).json();
 await page.locator('.event-card:visible').first().waitFor();
 assert.equal(await page.locator('.source-picker-trigger:visible').count(),1);
 await page.evaluate(()=>{window.__atlasQaMarker='same-document';window.__atlasNavigationBannerSeen=false;new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.navigation-progress')||node.querySelector?.('.navigation-progress')))))window.__atlasNavigationBannerSeen=true;}).observe(document.body,{childList:true,subtree:true});});
 const initialDocuments=documents;
 const settings=()=>page.locator('.reader-settings-dialog:visible');
 await page.locator('.settings-nav-link').click();await settings().waitFor();
 assert.equal(documents,initialDocuments,'Settings performed document navigation');
 assert.equal(await settings().getByRole('tab').count(),0,'Settings still require switching between tabs');
 await settings().getByLabel('网站名称',{exact:true}).waitFor();assert.equal(adminReads,1,'Opening settings fetched configuration again');
 await settings().getByLabel('页面配色',{exact:false}).selectOption('dark');
 await page.waitForFunction(()=>document.documentElement.dataset.readerTheme==='dark');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(17, 28, 24)','Dark palette did not reach the actual page');
 await settings().getByLabel('信息密度',{exact:false}).selectOption('comfortable');
 await settings().locator('.settings-reading').getByLabel('文字大小',{exact:false}).selectOption('1.1');
 await settings().getByLabel('正文字体',{exact:false}).selectOption('serif');
 await settings().getByLabel('自动翻译外文内容',{exact:false}).uncheck();
 await page.keyboard.press('Escape');
 assert.equal(await settings().count(),0,'Escape failed to close settings');
 await page.locator('.settings-nav-link').click();await settings().waitFor();
 assert.equal(await settings().getByLabel('页面配色',{exact:false}).inputValue(),'dark');
 assert.equal(await settings().locator('.settings-reading').getByLabel('文字大小',{exact:false}).inputValue(),'1.1');
 assert.equal(await settings().getByLabel('自动翻译外文内容',{exact:false}).isChecked(),false);
 await settings().getByLabel('页面配色',{exact:false}).selectOption('light');
 await settings().getByLabel('信息密度',{exact:false}).selectOption('compact');
 await settings().locator('.settings-reading').getByLabel('文字大小',{exact:false}).selectOption('1');
 await settings().getByLabel('正文字体',{exact:false}).selectOption('system');
 await settings().getByLabel('自动翻译外文内容',{exact:false}).uncheck();
 await settings().getByLabel('自动刷新资讯',{exact:false}).uncheck();
 await settings().getByLabel('减少动画',{exact:false}).check();
 assert.equal(adminReads,1,'Reopening settings refetched configuration');
 const saveButton=settings().getByRole('button',{name:'保存网站设置',exact:true});
 assert.equal(await saveButton.isEnabled(),true,'Save is silently disabled before password entry');await saveButton.click();
 await settings().locator('#settings-password-error').waitFor();assert.equal(await settings().getByLabel('当前访问密码',{exact:true}).evaluate(input=>document.activeElement===input),true,'Missing-password validation did not focus the field');
 // Only the browser save responses are stubbed: shared settings and account credentials stay unchanged.
 let saveAttempts=0;await page.route('**/api/admin/settings',async route=>{if(route.request().method()!=='POST')return route.continue();const body=route.request().postDataJSON();assert.equal(body.currentPassword,'ui-regression-password');saveAttempts++;await route.fulfill({status:saveAttempts===1?403:200,json:saveAttempts===1?{error:'回归验证：密码不正确。'}:{ok:true,settings:body.settings}});});
 await settings().getByLabel('当前访问密码',{exact:true}).fill('ui-regression-password');await settings().getByLabel('网站名称',{exact:true}).fill('知域 UI 验证');
 await saveButton.click();await settings().getByRole('alert').filter({hasText:'密码不正确'}).waitFor();assert.equal(await saveButton.isEnabled(),true,'Failed save left the button locked');
 await saveButton.click();await settings().getByRole('status').filter({hasText:'设置已保存'}).waitFor();assert.match(await page.locator('.site-header .brand').innerText(),/知域 UI 验证/);assert.equal(saveAttempts,2);
 await page.keyboard.press('Escape');await page.locator('.settings-nav-link').click();await settings().waitFor();assert.equal(await settings().getByLabel('网站名称',{exact:true}).inputValue(),'知域 UI 验证');assert.equal(await settings().getByLabel('当前访问密码',{exact:true}).inputValue(),'','Password survived closing the dialog');assert.equal(adminReads,1);await page.keyboard.press('Escape');
 await page.unroute('**/api/admin/settings');
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
 await page.locator('.site-header').getByRole('button',{name:'信息源',exact:true}).click();
 const sourceDialog=page.getByRole('dialog');
 await sourceDialog.getByText('环球日历来源',{exact:false}).click();
 await sourceDialog.getByText('芝加哥联储 CFNAI',{exact:true}).waitFor();
 await sourceDialog.getByText('重庆市政府新闻发布会',{exact:true}).waitFor();
 await page.keyboard.press('Escape');
 await sourceDialog.waitFor({state:'hidden'});
 const nav=page.getByRole('navigation',{name:'主导航',exact:true});
 await nav.getByRole('button',{name:'环球日历',exact:true}).click();
 await page.locator('main.view-calendar .gc-titlebar').waitFor();
 await page.locator('.gc-event:visible').first().waitFor();
 const nextWeekResponse=page.waitForResponse(response=>new URL(response.url()).searchParams.get('period')==='next-week'&&new URL(response.url()).pathname==='/api/calendar');
 await page.getByRole('button',{name:'下周',exact:true}).click();
 const nextWeekPayload=await (await nextWeekResponse).json();
 assert.equal(nextWeekPayload.coverage.length,7);assert.equal(new Date(nextWeekPayload.from+'T00:00:00Z').getUTCDay(),1);
 const agenda=page.locator('.gc-agenda');
 await agenda.locator('.gc-event-focus').first().waitFor();
 assert.equal(await agenda.locator('.gc-event-focus').count(),await agenda.locator('.gc-event').count());
 if(nextWeekPayload.from==='2026-11-23'){
  const etf=agenda.locator('.gc-event').filter({hasText:'沪深首批主动 ETF'});
  await etf.locator('.gc-event-focus').waitFor();
  assert.match(await etf.locator('.gc-event-focus').innerText(),/关注.*折溢价/);
  await page.locator('.site-header').getByRole('button',{name:'EN',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.lang==='en');
  assert.match(await etf.locator('.gc-event-focus').innerText(),/Focus.*first-day turnover/);
  await page.locator('.site-header').getByRole('button',{name:'中文',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.lang==='zh-CN');
 }
 await page.getByRole('button',{name:'未来七天',exact:true}).click();

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
 assert.equal(await page.evaluate(()=>window.__atlasNavigationBannerSeen),false,'Navigation flashed a progress banner');
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
 // A pending/failed cloud request must not hide or disable device reading preferences.
 const failedPage=await context.newPage();failedPage.on('pageerror',error=>errors.push(error.message));let releaseCloud;const pendingCloud=new Promise(resolve=>{releaseCloud=resolve;});let cloudAttempts=0;
 await failedPage.route('**/api/admin/settings',async route=>{cloudAttempts++;if(cloudAttempts===1){await pendingCloud;await route.fulfill({status:503,json:{error:'暂时无法读取'}});}else await route.fulfill({status:200,json:cloudSnapshot});});
 await failedPage.goto('/?domain=aidc&view=world&settings=1',{waitUntil:'domcontentloaded'});const failedDialog=failedPage.locator('.reader-settings-dialog:visible');await failedDialog.waitFor();
 assert.equal(await failedDialog.getByLabel('页面配色',{exact:false}).isEnabled(),true,'Pending cloud request blocked reading controls');assert.equal(await failedDialog.getByLabel('网站名称',{exact:true}).isDisabled(),true,'Unloaded defaults can overwrite existing configuration');releaseCloud();
 await failedDialog.getByRole('button',{name:'重新读取',exact:true}).waitFor();await failedDialog.getByRole('button',{name:'重新读取',exact:true}).click();await failedPage.waitForFunction(()=>!document.querySelector('.settings-cloud-fields')?.disabled);assert.equal(cloudAttempts,2);
 await failedDialog.getByRole('button',{name:'保存网站设置',exact:true}).click();await failedDialog.locator('#settings-password-error').waitFor();await failedPage.close();
 assert.deepEqual((await (await context.request.get('/api/admin/settings')).json()).settings,cloudSnapshot.settings,'UI regression mutated shared cloud configuration');
 assert.deepEqual(errors,[],'Browser runtime errors');
 const timing={};for(const target of ['calendar','world']){const values=samples.filter(sample=>sample.target===target).map(sample=>sample.ms).sort((a,b)=>a-b);timing[target]={medianMs:Math.round((values[Math.floor((values.length-1)/2)]+values[Math.floor(values.length/2)])/2),maxMs:Math.max(...values),samples:values};}
 console.log('Browser interaction verified:',JSON.stringify({browser:'headless Chromium',viewport:'1440x900; mobile 390x844',liveReports:snapshot.items.length,sourceSelection:'two feeds, cancel and round-trip retention',settings:'unified panel, cached configuration, missing-password validation, failed/successful save responses, read retry, mobile, persisted style controls',portalDocumentReloads,articleDocumentReloads:documents-libraryDocuments,translationRequests:translations,backgroundFeedRequests:feedRequests,warmNavigation:timing}));
}finally{
 await context.request.post('/auth/logout',{headers:{Origin:origin}}).catch(()=>{});
 await context.close();await browser.close();
}
