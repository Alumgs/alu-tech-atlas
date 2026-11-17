'use client';
import {createContext,useContext,useState,useEffect,useCallback,useMemo,type ReactNode} from 'react';
import {defaultReaderPreferences,sanitizeReaderPreferences,READER_KEY,type ReaderPreferences} from '@/lib/reader-preferences';
const Context=createContext<{preferences:ReaderPreferences;update:(patch:Partial<ReaderPreferences>)=>void;reset:()=>void;persisted:boolean}|null>(null);
export function ReaderPreferencesProvider({children}:{children:ReactNode}){
 const [preferences,setPreferences]=useState(defaultReaderPreferences),[ready,setReady]=useState(false),[persisted,setPersisted]=useState(true);
 useEffect(()=>{try{setPreferences(sanitizeReaderPreferences(JSON.parse(localStorage.getItem(READER_KEY)||'null')));}catch{}setReady(true);const sync=(e:StorageEvent)=>{if(e.key===READER_KEY)try{setPreferences(sanitizeReaderPreferences(JSON.parse(e.newValue||'null')));}catch{}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(READER_KEY,JSON.stringify(preferences));setPersisted(true);}catch{setPersisted(false);}},[preferences,ready]);
 useEffect(()=>{const root=document.documentElement,media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{root.dataset.readerTheme=preferences.theme==='system'?(media.matches?'dark':'light'):preferences.theme;};apply();media.addEventListener('change',apply);root.dataset.readerDensity=preferences.density;root.dataset.readerFont=preferences.fontFamily;root.dataset.readerWidth=preferences.contentWidth;root.dataset.readerMotion=preferences.reduceMotion?'reduced':'normal';root.style.setProperty('--reader-font-scale',String(preferences.fontScale));return()=>media.removeEventListener('change',apply);},[preferences]);
 const update=useCallback((patch:Partial<ReaderPreferences>)=>setPreferences(old=>sanitizeReaderPreferences({...old,...patch})),[]),reset=useCallback(()=>setPreferences(defaultReaderPreferences),[]);
 const value=useMemo(()=>({preferences,update,reset,persisted}),[preferences,update,reset,persisted]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useReaderPreferences(){const value=useContext(Context);if(!value)throw Error('ReaderPreferencesProvider missing');return value;}
