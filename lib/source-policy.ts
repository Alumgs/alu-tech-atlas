import {sources,curated,companies} from './content.ts';
import {sourceCatalog} from './source-catalog.ts';
import {publicUrl,sameHostFamily} from './url-safety.ts';

// Automatic extraction is limited to the reviewed source directory. Unknown
// publishers retain their RSS metadata and original link, without server fetches.
const hosts=new Set([...sources,...sourceCatalog,...curated,...companies].flatMap(s=>{
  const url=publicUrl(s.url);return url?[url.hostname]:[];
}));
for(const host of ['arxiv.org','blogs.nvidia.com','developer.nvidia.com','nvidianews.nvidia.com','mp.weixin.qq.com'])hosts.add(host);
export function allowedArticleUrl(value:unknown):URL|null{
  const url=publicUrl(value);
  return url&&[...hosts].some(host=>sameHostFamily(url.hostname,host))?url:null;
}
