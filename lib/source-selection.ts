import type {News} from './content';
export type PublisherSelection=string[]|null;
export const publisherKey=(item:News)=>item.feedId||item.source;
export function filterPublishers(items:News[],selection:PublisherSelection){if(selection===null)return items;const chosen=new Set(selection);return items.filter(item=>chosen.has(publisherKey(item)));}
export function togglePublisher(selection:PublisherSelection,name:string,all:string[]):string[]{const next=new Set(selection===null?all:selection);if(next.has(name))next.delete(name);else next.add(name);return [...next];}
