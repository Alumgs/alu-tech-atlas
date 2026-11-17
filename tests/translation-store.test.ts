import test from 'node:test';import assert from 'node:assert/strict';import {TranslationStore} from '../lib/translation-store.ts';
test('translations notify only matching text subscribers and reuse completed cache',async()=>{
 let calls=0,a=0,b=0;const store=new TranslationStore(async entries=>{calls++;return entries.map(e=>({text:e.text,translation:'translated '+e.text}));});
 const unsubscribe=store.subscribe('zh|one',()=>a++);store.subscribe('zh|two',()=>b++);
 store.request('one','zh');store.request('one','zh');await store.flush();assert.equal(calls,1);assert.equal(a,1);assert.equal(b,0);assert.equal(store.get('zh|one')?.translation,'translated one');
 store.request('one','zh');await store.flush();assert.equal(calls,1);unsubscribe();store.cancel();
});
test('turning automatic translation off aborts requests, drops queued work and permits clean retry',async()=>{
 let calls=0;const store=new TranslationStore((entries,signal)=>{calls++;if(calls===1)return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('cancelled')),{once:true}));return Promise.resolve(entries.map(e=>({text:e.text,translation:'done'})));});
 store.request('one','zh');const pending=store.flush();store.request('two','zh');store.setEnabled(false);await pending;
 assert.equal(store.get('zh|one'),undefined);assert.equal(calls,1);store.request('three','zh');await store.flush();assert.equal(calls,1);
 store.setEnabled(true);store.request('one','zh');await store.flush();assert.equal(calls,2);assert.equal(store.get('zh|one')?.translation,'done');store.cancel();
});
test('translation batches stay bounded and same in-flight text is not sent twice',async()=>{
 let calls=0;let release:()=>void=()=>{};const counts:number[]=[];
 const store=new TranslationStore(async entries=>{calls++;counts.push(entries.length);if(calls===1)await new Promise<void>(resolve=>release=resolve);return entries.map(e=>({text:e.text,translation:'ok'}));});
 for(let i=0;i<9;i++)store.request('item '+i,'en');const pending=store.flush();store.request('item 0','en');release();await pending;
 assert.deepEqual(counts,[4,4,1]);assert.equal(calls,3);store.cancel();
});
