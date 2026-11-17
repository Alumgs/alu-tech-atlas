'use client';
import {Localized} from '@/components/language';
import {useEffect,useState,useRef} from 'react';
import {KeyRound,Palette,Save,SlidersHorizontal,LogOut} from 'lucide-react';
import {defaultSiteSettings,sanitizeSiteSettings,type SiteSettings} from '@/lib/site-settings';

export function SettingsPanel({initialSettings,settingsState,onRetry,onSaved}:{initialSettings:SiteSettings;settingsState:'loading'|'ready'|'error';onRetry:()=>void;onSaved:(settings:SiteSettings)=>void}){
  const [settings,setSettings]=useState(initialSettings);
  const passwordInput=useRef<HTMLInputElement>(null);
  const [passwordError,setPasswordError]=useState('');
  const ready=settingsState==='ready';
  const [saving,setSaving]=useState(false);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{setSettings(initialSettings);},[initialSettings]);

  function confirmCurrentPassword(){
    if(currentPassword){setPasswordError('');return true;}
    setPasswordError('请输入当前访问密码后再保存或管理账号。');
    passwordInput.current?.focus();return false;
  }

  async function saveSettings(){
    if(!ready||!confirmCurrentPassword())return;
    setSaving(true);setMessage('');setError('');
    try{
      const r=await fetch('/api/admin/settings',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({settings,currentPassword})});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'保存失败');
      const saved=sanitizeSiteSettings(payload.settings);setSettings(saved);onSaved(saved);
      setMessage('设置已保存并写入云端存储。');
    }catch(e){setError(e instanceof Error&&e.name==='TimeoutError'?'保存超时，请检查网络后重试。':e instanceof Error?e.message:'保存失败');}
    finally{setSaving(false);}
  }

  async function changePassword(){
    if(!confirmCurrentPassword())return;
    setMessage('');setError('');
    if(newPassword.length<12){setError('新密码至少需要 12 个字符。');return;}
    if(newPassword!==confirmPassword){setError('两次输入的新密码不一致。');return;}
    setSaving(true);
    try{
      const r=await fetch('/api/admin/password',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword,newPassword})});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'密码修改失败');
      setMessage('密码已修改；云端会话撤销通常在一分钟内传播到所有节点。正在返回登录页…');
      window.setTimeout(()=>window.location.assign('/auth/login'),900);
    }catch(e){setError(e instanceof Error?e.message:'密码修改失败');}
    finally{setSaving(false);}
  }

  async function logoutAll(){
    if(!confirmCurrentPassword())return;
    if(!window.confirm('确定退出所有设备吗？所有现有会话将失效。'))return;
    setSaving(true);setMessage('');setError('');
    try{
      const r=await fetch('/api/admin/logout-all',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword})});
      const payload=await r.json().catch(()=>({})) as {error?:string;settings?:SiteSettings;sessionDays?:number};
      if(!r.ok)throw new Error(payload.error||'操作失败');
      window.location.assign('/auth/login');
    }catch(e){setError(e instanceof Error?e.message:'操作失败');setSaving(false);}
  }

  const update=<K extends keyof SiteSettings>(key:K,value:SiteSettings[K])=>setSettings(s=>({...s,[key]:value}));
  return <div className="admin-settings settings-embedded">
    <div className="settings-cloud-status" role="status">{settingsState==='loading'?<Localized value="正在同步网站配置，阅读设置可直接使用。"/>:settingsState==='error'?<><Localized value="网站配置读取失败，阅读设置仍可使用。"/><button onClick={onRetry}><Localized value="重新读取"/></button></>:<Localized value="网站配置已同步。"/>}</div>
    <fieldset className="settings-cloud-fields" disabled={!ready||saving}>
    <section className="settings-card">
      <div className="settings-section-title"><SlidersHorizontal/><div><h2><Localized value={"网站内容"}/> </h2><p><Localized value={"调整品牌文字和网站公告。"}/> </p></div></div>
      <div className="settings-form-grid">
        <label><span><Localized value={"网站名称"}/> </span><input maxLength={36} value={settings.siteTitle} onChange={e=>update('siteTitle',e.target.value)} placeholder="知域"/></label>
        <label><span><Localized value={"副标题 / 网站简介"}/> </span><input maxLength={100} value={settings.tagline} onChange={e=>update('tagline',e.target.value)} placeholder="从算力基础设施到机器人与机器学习"/></label>
        <label className="settings-field-wide"><span><Localized value={"首页公告（留空则不显示）"}/> </span><textarea maxLength={240} rows={3} value={settings.announcement} onChange={e=>update('announcement',e.target.value)} placeholder="例如：本周重点关注液冷、算力网络与机器人最新进展。"/></label>
      </div>
    </section>

    <section className="settings-card">
      <div className="settings-section-title"><Palette/><div><h2><Localized value={"网站默认样式"}/> </h2><p><Localized value={"保存后作为全站默认值；本设备的阅读偏好优先生效。"}/> </p></div></div>
      <div className="settings-form-grid settings-style-grid">
        <label><span><Localized value={"主题强调色"}/> </span><div className="color-control"><input type="color" value={settings.accentColor} onChange={e=>update('accentColor',e.target.value)}/><code>{settings.accentColor}</code></div></label>
        <label><span><Localized value={"页面背景色"}/> </span><div className="color-control"><input type="color" value={settings.pageBackground} onChange={e=>update('pageBackground',e.target.value)}/><code>{settings.pageBackground}</code></div></label>
        <label><span><Localized value={"网站默认文字大小"}/> </span><select value={settings.fontScale} onChange={e=>update('fontScale',Number(e.target.value))}><option value={0.9}>较紧凑（90%）</option><option value={0.95}>略小（95%）</option><option value={1}>标准（100%）</option><option value={1.05}>略大（105%）</option><option value={1.1}>较大（110%）</option><option value={1.15}>最大（115%）</option></select></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.compactNews} onChange={e=>update('compactNews',e.target.checked)}/><span><Localized value={"紧凑资讯列表"}/> </span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.showOverviewMetrics} onChange={e=>update('showOverviewMetrics',e.target.checked)}/><span><Localized value={"显示领域总览指标条"}/> </span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.showMarketChart} onChange={e=>update('showMarketChart',e.target.checked)}/><span><Localized value={"显示市场图表"}/> </span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.enableEditorialDesk} onChange={e=>update('enableEditorialDesk',e.target.checked)}/><span><Localized value={"显示公众号精选工作台"}/> </span></label>
      </div>
      <div className="settings-preview"><span style={{background:settings.accentColor}}/><Localized value={"样式预览："}/> <b style={{color:settings.accentColor}}><Localized value={settings.siteTitle||'知域'}/><Localized value={"· 产业观察"}/> </b><span className="settings-preview-note"><Localized value={"背景色与字体比例保存后应用"}/> </span></div>
    </section>

    <section className="settings-card">
      <div className="settings-section-title"><SlidersHorizontal/><div><h2><Localized value={"精选与原文提取"}/> </h2><p><Localized value={"控制自动成刊规模与来源处理。分值是阅读优先级，不代表真实性评级。"}/> </p></div></div>
      <div className="settings-form-grid">
        <label><span><Localized value={"自动精选最低分（0–90）"}/> </span><input type="number" min={0} max={90} value={settings.minEditorialScore} onChange={e=>update('minEditorialScore',Number(e.target.value))}/></label>
        <label><span><Localized value={"每期自动精选条数（1–12）"}/> </span><input type="number" min={1} max={12} value={settings.editionSize} onChange={e=>update('editionSize',Number(e.target.value))}/></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.enableAutoTranslation} onChange={e=>update('enableAutoTranslation',e.target.checked)}/><span><Localized value={"允许内容自动翻译服务"}/></span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.enableAIEnrichment} onChange={e=>update('enableAIEnrichment',e.target.checked)}/><span><Localized value={"使用 AI 辅助中文摘要（保留支撑摘录）"}/> </span></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.allowReaderFallback} onChange={e=>update('allowReaderFallback',e.target.checked)}/><span><Localized value={"原文直连失败时使用公共 Reader 提取服务"}/> </span></label>
      </div><p><Localized value={"公共 Reader 仅处理资料目录中允许的公开文章网址；关闭后采用直连和订阅源摘要。"}/> </p>
    </section>

    <section className="settings-card settings-save-card">
      <h2><Localized value="保存网站配置"/></h2><p><Localized value="上方网站内容、默认样式与精选配置一并保存。输入当前访问密码以确认管理操作。"/></p>
      <label className="settings-password"><span><Localized value="当前访问密码"/></span><input ref={passwordInput} type="password" maxLength={256} autoComplete="current-password" value={currentPassword} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError?'settings-password-error':undefined} onChange={e=>{setCurrentPassword(e.target.value);setPasswordError('');}}/></label>
      {passwordError&&<p className="settings-error" id="settings-password-error" role="alert"><Localized value={passwordError}/></p>}
      <div className="settings-actions"><button className="settings-primary" onClick={saveSettings} disabled={saving}><Save size={16}/><Localized value={saving?'正在保存…':'保存网站设置'}/></button><button onClick={()=>setSettings(defaultSiteSettings)}><Localized value="恢复网站默认值"/></button></div>
      {message&&<p className="settings-message" role="status"><Localized value={message}/></p>}
      {error&&<p className="settings-error" role="alert"><Localized value={error}/></p>}
    </section>
    <section className="settings-card">
      <div className="settings-section-title"><KeyRound/><div><h2><Localized value={"密码与登录安全"}/> </h2><p><Localized value={"修改前需验证当前密码。新密码至少 12 位，修改后云端撤销所有设备旧会话，节点传播通常约一分钟。"}/> </p></div></div>
      <div className="settings-form-grid">
        <label><span><Localized value={"新密码（至少 12 个字符）"}/> </span><input type="password" autoComplete="new-password" minLength={12} maxLength={256} value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></label>
        <label><span><Localized value={"确认新密码"}/> </span><input type="password" autoComplete="new-password" minLength={12} maxLength={256} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></label>
      </div>
      <div className="settings-actions"><button className="settings-primary" disabled={saving} onClick={changePassword}><KeyRound size={16}/><Localized value={"修改密码并退出其他设备"}/> </button><button className="settings-danger" disabled={saving} onClick={logoutAll}><LogOut size={16}/><Localized value={"退出所有设备"}/> </button></div>
    </section>
    </fieldset>
    <p className="settings-footnote"><Localized value={"本站采用共享访问密码，管理操作需再次输入密码，请仅分享给信任的人。登录最长有效 7 天；密码与会话密钥以单条云端记录更新，全球节点撤销通常在一分钟内完成。密码哈希不会发送到浏览器。"}/> </p>
  </div>;
}
