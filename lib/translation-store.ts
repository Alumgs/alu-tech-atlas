export type Translation={translation?:string;error?:string};
type Target='zh'|'en';
type Entry={text:string;target:Target};
/** Per-provider cache. Only subscribers to a changed text are notified. */
export class TranslationStore{
 private values=new Map<string,Translation>();private listeners=new Map<string,Set<()=>void>>();private pending=new Map<string,Entry>();private running=new Set<string>();private busy=false;private enabled=true;private controller:AbortController|null=null;private timer:ReturnType<typeof setTimeout>|undefined;
 private transport:(entries:Entry[],signal:AbortSignal)=>Promise<Array<{text:string;translation?:string}>>;
 constructor(transport:(entries:Entry[],signal:AbortSignal)=>Promise<Array<{text:string;translation?:string}>>){this.transport=transport;}
 key(text:string,target:Target){return target+'|'+text;}
 get=(key:string)=>this.values.get(key);
 subscribe=(key:string,listener:()=>void)=>{const set=this.listeners.get(key)||new Set();set.add(listener);this.listeners.set(key,set);return()=>{set.delete(listener);if(!set.size){this.listeners.delete(key);this.pending.delete(key);}};};
 setEnabled(enabled:boolean){if(enabled&&!this.enabled)for(const [key,value]of this.values)if(value.error){this.values.delete(key);for(const listener of this.listeners.get(key)||[])listener();}this.enabled=enabled;if(!enabled)this.cancel();}
 cancel=()=>{this.pending.clear();if(this.timer)clearTimeout(this.timer);this.controller?.abort();};
 request=(text:string,target:Target)=>{const key=this.key(text,target);if(!this.enabled||!text.trim()||text.length>2500||this.values.has(key)||this.pending.has(key)||this.running.has(key)&&!this.controller?.signal.aborted)return;this.pending.set(key,{text,target});if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>void this.flush(),100);};
 async flush(){
  if(this.busy||!this.enabled)return;this.busy=true;
  try{while(this.enabled&&this.pending.size){
   const first=this.pending.values().next().value!,batch=[...this.pending].filter(([,entry])=>entry.target===first.target).slice(0,4),controller=new AbortController();this.controller=controller;
   for(const [key]of batch){this.pending.delete(key);this.running.add(key);}
   try{const data=await this.transport(batch.map(([,entry])=>entry),controller.signal);if(!controller.signal.aborted&&this.enabled)for(const [key,entry]of batch)this.publish(key,data.find(item=>item.text===entry.text)?.translation);}
   catch{if(!controller.signal.aborted&&this.enabled)for(const [key]of batch)this.publish(key);}
   finally{for(const [key]of batch)this.running.delete(key);}
  }}finally{this.busy=false;this.controller=null;}
 }
 private publish(key:string,translation?:string){this.values.set(key,translation?{translation}:{error:'Translation unavailable'});for(const listener of this.listeners.get(key)||[])listener();if(this.values.size>512)for(const old of this.values.keys()){if(!this.listeners.has(old)){this.values.delete(old);break;}}}
}
