import type {Domain, News} from './content';
import {sourceCatalog} from './source-catalog.ts';

export type StreamScope = Domain | 'world';
export {worldTopics,worldTopic} from './relevance.ts';
import {eligible} from './relevance.ts';
export function inStream(n:News, scope:StreamScope){return eligible(n)&&(scope==='world'?n.scope==='world':n.scope!=='world'&&n.domain===scope);}
export function catalogFor(scope:StreamScope){
 return sourceCatalog.filter(s=>scope==='world'?['宏观与政策','市场与媒体','机构研报'].includes(s.group):s.domains.includes(scope));
}
/** Shared by the main stream and report directory; a group status is not a site hit. */
export function sourceGroup(n:News){
 return n.catalogGroup || (n.feedId?.startsWith('研报索引 · ')?n.feedId.slice('研报索引 · '.length):'');
}
