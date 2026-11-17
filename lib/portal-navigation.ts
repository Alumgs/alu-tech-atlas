import type {Domain} from './content';
export const portalViews=['overview','library','news','companies','cases','research','world','calendar'] as const;
export type PortalView=typeof portalViews[number];
export function portalRoute(view:unknown,domain:unknown,fallback:PortalView='overview'):{view:PortalView;domain:Domain}{
 return {view:typeof view==='string'&&portalViews.includes(view as PortalView)?view as PortalView:fallback,domain:domain==='robot'||domain==='ml'?domain:'aidc'};
}
