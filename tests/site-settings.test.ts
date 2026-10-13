import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSiteSettings,sanitizeSiteSettings} from '../lib/site-settings.ts';

test('site settings provide safe defaults',()=>{
  assert.equal(defaultSiteSettings.siteTitle,'知域');
  assert.equal(defaultSiteSettings.fontScale,1);
  assert.equal(defaultSiteSettings.enableEditorialDesk,true);
});

test('site settings sanitize colors, text lengths and numeric scale',()=>{
  const result=sanitizeSiteSettings({
    siteTitle:'  我的 ATLAS  ',
    tagline:'x'.repeat(150),
    announcement:'行业公告',
    accentColor:'url(javascript:alert(1))',
    pageBackground:'#f4f7f8',
    fontScale:99,
    compactNews:true,
    showMarketChart:false,
    showOverviewMetrics:false,
    enableEditorialDesk:false,
  });
  assert.equal(result.siteTitle,'我的 ATLAS');
  assert.equal(result.tagline.length,100);
  assert.equal(result.announcement,'行业公告');
  assert.equal(result.accentColor,defaultSiteSettings.accentColor);
  assert.equal(result.pageBackground,'#f4f7f8');
  assert.equal(result.fontScale,1.15);
  assert.equal(result.compactNews,true);
  assert.equal(result.showMarketChart,false);
  assert.equal(result.showOverviewMetrics,false);
  assert.equal(result.enableEditorialDesk,false);
});

test('malformed site preferences fall back to validated values',()=>{
  const result=sanitizeSiteSettings(null);
  assert.deepEqual(result,defaultSiteSettings);
});
test('edition settings clamp input and preserve explicit privacy controls',()=>{
 const preferences=sanitizeSiteSettings({minEditorialScore:500,editionSize:-10,enableAIEnrichment:false,allowReaderFallback:false});
 assert.equal(preferences.minEditorialScore,90);assert.equal(preferences.editionSize,1);
 assert.equal(preferences.enableAIEnrichment,false);assert.equal(preferences.allowReaderFallback,false);
});
