'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,CheckCircle2,KeyRound,Palette,Save,ShieldCheck,SlidersHorizontal,LogOut} from 'lucide-react';
import {defaultSiteSettings,type SiteSettings} from '@/lib/site-settings';

export function SettingsPanel(){
  const [settings,setSettings]=useState<SiteSettings>(defaultSiteSettings);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [sessionDays,setSessionDays]=useState(7);

  useEffect(()=>{
    let alive=true;
    fetch('/api/admin/settings',{cache:'no-store'}).then(async r=>{
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'读取设置失败');
      if(alive){setSettings({...defaultSiteSettings,...payload.settings});setSessionDays(payload.sessionDays||7);}
    }).catch(e=>{if(alive)setError(e instanceof Error?e.message:'读取设置失败');}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[]);

  async function saveSettings(){
    setSaving(true);setMessage('');setError('');
    try{
      const r=await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings})});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'保存失败');
      setSettings({...defaultSiteSettings,...payload.settings});
      setMessage('设置已保存并写入云端存储。');
    }catch(e){setError(e instanceof Error?e.message:'保存失败');}
    finally{setSaving(false);}
  }

  async function changePassword(){
    setMessage('');setError('');
    if(newPassword.length<12){setError('新密码至少需要 12 个字符。');return;}
    if(newPassword!==confirmPassword){setError('两次输入的新密码不一致。');return;}
    setSaving(true);
    try{
      const r=await fetch('/api/admin/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword,newPassword})});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'密码修改失败');
      setMessage('密码已修改，所有设备的旧登录会话已撤销。正在返回登录页…');
      window.setTimeout(()=>window.location.assign('/auth/login'),900);
    }catch(e){setError(e instanceof Error?e.message:'密码修改失败');}
    finally{setSaving(false);}
  }

  async function logoutAll(){
    if(!window.confirm('确定退出所有设备吗？所有现有会话将失效。'))return;
    setSaving(true);setMessage('');setError('');
    try{
      const r=await fetch('/api/admin/logout-all',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'操作失败');
      window.location.assign('/auth/login');
    }catch(e){setError(e instanceof Error?e.message:'操作失败');setSaving(false);}
  }

  const update=<K extends keyof SiteSettings>(key:K,value:SiteSettings[K])=>setSettings(s=>({...s,[key]:value}));
  return <main className="admin-settings">
    <header className="settings-page-header">
      <a href="/?domain=aidc&view=overview"><ArrowLeft size={17}/> 返回网站</a>
      <span className="settings-secure"><ShieldCheck size={16}/> 管理员设置</span>
    </header>
    <section className="settings-hero">
      <span className="eyebrow">ATLAS / SITE ADMINISTRATION</span>
      <h1>网站设置</h1>
      <p>管理网站展示、视觉样式、登录密码与会话安全。配置保存在云端，不随普通代码发布覆盖。</p>
      <div className="settings-session"><CheckCircle2 size={17}/> 登录有效期：<b>{sessionDays} 天</b><span> · 可随时通过退出所有设备撤销登录</span></div>
    </section>

    {loading?<div className="settings-card">正在读取云端设置…</div>:<>
    <section className="settings-card">
      <div className="settings-section-title"><SlidersHorizontal/><div><h2>网站内容</h2><p>调整品牌文字和网站公告。</p></div></div>
      <div className="settings-form-grid">
        <label><span>网站名称</span><input maxLength={36} value={settings.siteTitle} onChange={e=>update('siteTitle',e.target.value)} placeholder="知域"/></label>
        <label><span>副标题 / 网站简介</span><input maxLength={100} value={settings.tagline} onChange={e=>update('tagline',e.target.value)} placeholder="从算力基础设施到机器人与机器学习"/></label>
        <label className="settings-field-wide"><span>首页公告（留空则不显示）</span><textarea maxLength={240} rows={3} value={settings.announcement} onChange={e=>update('announcement',e.target.value)} placeholder="例如：本周重点关注液冷、算力网络与机器人最新进展。"/></label>
      </div>
    </section>

    <section className="settings-card">
      <div className="settings-section-title"><Palette/><div><h2>样式与展示</h2><p>样式变更即时应用于网站主页面；颜色仅接受标准 HEX 色值。</p></div></div>
      <div className="settings-form-grid settings-style-grid">
        <label><span>主题强调色</span><div className="color-control"><input type="color" value={settings.accentColor} onChange={e=>update('accentColor',e.target.value)}/><code>{settings.accentColor}</code></div></label>
        <label><span>页面背景色</span><div className="color-control"><input type="color" value={settings.pageBackground} onChange={e=>update('pageBackground',e.target.value)}/><code>{settings.pageBackground}</code></div></label>
        <label><span>整体文字大小</span><select value={settings.fontScale} onChange={e=>update('fontScale',Number(e.target.value))}><option value={0.9}>较紧凑（90%）</option><option value={0.95}>略小（95%）</option><option value={1}>标准（100%）</option><option value={1.05}>略大（105%）</option><option value={1.1}>较大（110%）</option><option value={1.15}>最大（115%）</option></select></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.compactNews} onChange={e=>update('compactNews',e.target.checked)}/><span>紧凑资讯列表</span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.showOverviewMetrics} onChange={e=>update('showOverviewMetrics',e.target.checked)}/><span>显示领域总览指标条</span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.showMarketChart} onChange={e=>update('showMarketChart',e.target.checked)}/><span>显示市场图表</span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.enableEditorialDesk} onChange={e=>update('enableEditorialDesk',e.target.checked)}/><span>显示公众号精选工作台</span></label>
      </div>
      <div className="settings-preview"><span style={{background:settings.accentColor}}/>样式预览：<b style={{color:settings.accentColor}}>{settings.siteTitle||'知域'} · 产业观察</b><span className="settings-preview-note">背景色与字体比例保存后应用</span></div>
      <div className="settings-actions"><button className="settings-primary" onClick={saveSettings} disabled={saving}><Save size={16}/>{saving?'正在保存…':'保存网站设置'}</button><button onClick={()=>setSettings(defaultSiteSettings)}>恢复默认值</button></div>
    </section>

    <section className="settings-card">
      <div className="settings-section-title"><KeyRound/><div><h2>密码与登录安全</h2><p>修改前需验证当前密码。新密码至少 12 位，修改后所有设备旧会话失效。</p></div></div>
      <div className="settings-form-grid">
        <label><span>当前密码</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} /></label>
        <label><span>新密码（至少 12 个字符）</span><input type="password" autoComplete="new-password" minLength={12} maxLength={256} value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></label>
        <label><span>确认新密码</span><input type="password" autoComplete="new-password" minLength={12} maxLength={256} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></label>
      </div>
      <div className="settings-actions"><button className="settings-primary" disabled={saving||!currentPassword||!newPassword||!confirmPassword} onClick={changePassword}><KeyRound size={16}/>修改密码并退出其他设备</button><button className="settings-danger" disabled={saving} onClick={logoutAll}><LogOut size={16}/>退出所有设备</button></div>
    </section>
    </>}
    {message&&<p className="settings-message" role="status">{message}</p>}
    {error&&<p className="settings-error" role="alert">{error}</p>}
    <p className="settings-footnote">安全说明：设置接口由 Worker 服务端验证登录状态及请求来源；密码仅存储为 PBKDF2-SHA256 哈希。云端设置使用独立 KV 存储，不会暴露密码哈希给浏览器。</p>
  </main>;
}
