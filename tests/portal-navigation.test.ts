import test from 'node:test';
import assert from 'node:assert/strict';
import {portalRoute} from '../lib/portal-navigation.ts';
test('direct calendar URLs and popstate share validated first-render routing',()=>{
 assert.deepEqual(portalRoute('calendar','aidc'),{view:'calendar',domain:'aidc'});
 assert.deepEqual(portalRoute('world','ml'),{view:'world',domain:'ml'});
 assert.deepEqual(portalRoute(['calendar'],'invalid','news'),{view:'news',domain:'aidc'});
 assert.deepEqual(portalRoute(undefined,undefined),{view:'overview',domain:'aidc'});
});
