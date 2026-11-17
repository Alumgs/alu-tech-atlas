import Portal from './portal';
import {portalRoute} from '@/lib/portal-navigation';
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams,route=portalRoute(params.view,params.domain);
 return <Portal initialView={route.view} initialDomain={route.domain} initialSettingsOpen={params.settings==='1'}/>;
}
