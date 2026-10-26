import type {Domain, News} from './content';
import {sourceCatalog} from './source-catalog.ts';

export type StreamScope = Domain | 'world';
export const worldTopics:Array<[string,string,RegExp]>=[
 ['国际时事','World affairs',/war|conflict|election|diploma|peace|government|战争|冲突|选举|外交|国际|停火/i],
 ['经济与金融','Economy & finance',/econom|inflation|rate|bank|trade|tariff|market|经济|通胀|利率|银行|贸易|关税|金融/i],
 ['能源与气候','Energy & climate',/energy|oil|gas|climate|carbon|electric|power|能源|石油|天然气|气候|电力|碳排/i],
 ['科技与科学','Technology & science',/technolog|science|research|space|chip|\bAI\b|科技|科学|研究|太空|芯片|人工智能/i],
 ['社会与公共政策','Society & policy',/health|education|policy|law|population|humanitarian|健康|教育|政策|法律|人口|人道/i],
];
export function inStream(n:News, scope:StreamScope){return scope==='world'?n.scope==='world':n.scope!=='world'&&n.domain===scope;}
export function catalogFor(scope:StreamScope){
 return sourceCatalog.filter(s=>scope==='world'?['宏观与政策','市场与媒体','机构研报'].includes(s.group):s.domains.includes(scope));
}
/** Shared by the main stream and report directory; a group status is not a site hit. */
export function sourceGroup(n:News){
 return n.catalogGroup || (n.feedId?.startsWith('研报索引 · ')?n.feedId.slice('研报索引 · '.length):'');
}
