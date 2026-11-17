import test from 'node:test';import assert from 'node:assert/strict';
import {defaultReaderPreferences,sanitizeReaderPreferences} from '../lib/reader-preferences.ts';
import {filterPublishers,togglePublisher} from '../lib/source-selection.ts';
import type {News} from '../lib/content';
test('reader preferences restore defaults and bound persisted styles without enabling injected CSS',()=>{
 assert.deepEqual(sanitizeReaderPreferences(null),defaultReaderPreferences);
 const p=sanitizeReaderPreferences({autoTranslate:false,autoRefresh:false,theme:'url(javascript:bad)',fontScale:99,fontFamily:'url(unsafe)',density:'comfortable',showSummaries:false,reduceMotion:true});
 assert.equal(p.autoTranslate,false);assert.equal(p.autoRefresh,false);assert.equal(p.fontScale,1.2);assert.equal(p.theme,'light');assert.equal(p.fontFamily,'system');assert.equal(p.density,'comfortable');assert.equal(p.showSummaries,false);assert.equal(p.reduceMotion,true);
});
test('source multiselect distinguishes all, none, and OR selection without losing feed attribution',()=>{
 const items=[{feedId:'BBC World',source:'BBC'},{feedId:'UN News',source:'UN'},{source:'Official'}] as News[];
 assert.equal(filterPublishers(items,null),items);assert.deepEqual(filterPublishers(items,[]),[]);
 assert.deepEqual(filterPublishers(items,['BBC World','Official']),[items[0],items[2]]);
 assert.deepEqual(togglePublisher(null,'BBC World',['BBC World','UN News']),['UN News']);
 assert.deepEqual(togglePublisher(['UN News'],'BBC World',['BBC World','UN News']),['UN News','BBC World']);
 assert.deepEqual(filterPublishers(items,['missing']),[]);
});
