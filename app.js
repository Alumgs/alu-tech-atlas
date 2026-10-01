
const A = window.ATLAS;
A.dynamicNews = [];

const app = document.getElementById("app");
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const fmt = (n, d=0) => Number(n).toLocaleString("zh-CN",{maximumFractionDigits:d});
const params = () => new URLSearchParams(location.search);
const state = { domain: params().get("domain") || "home", view: params().get("view") || "today" };
const views = [
  ["overview","领域总览"],["knowledge","知识手册"],["case","案例实验室"],
  ["research","科研进展"],["news","产业动态"],["companies","企业观察"],["market","市场洞察"]
];

function mergedNews(){
  const list = [...(A.dynamicNews||[]), ...(A.seedNews||[])].sort((a,b)=>(b.published_at||"").localeCompare(a.published_at||""));
  const seen = new Set();
  return list.filter(x => {
    const key = x.url || x.title;
    if(seen.has(key)) return false;
    seen.add(key); return true;
  });
}
function domainName(d){ return d==="home" ? "今日" : (A.domains[d]?.name || d); }
function getArticle(id){ return A.articles[id]; }
function hrefFor(domain, view, extra={}){
  const u = new URL(location.href);
  u.search = "";
  u.searchParams.set("domain", domain);
  u.searchParams.set("view", view);
  Object.entries(extra).forEach(([k,v]) => v!=null && u.searchParams.set(k,v));
  return u.pathname + "?" + u.searchParams.toString();
}
function nav(domain, view="overview", extra={}){
  history.pushState({}, "", hrefFor(domain,view,extra));
  state.domain = domain; state.view = view; render();
}
function setActive(){
  $$(".topnav button").forEach(b=>b.classList.toggle("active",b.dataset.domain===state.domain));
  $$("[data-mobile-go]").forEach(b=>{
    const d=b.dataset.mobileGo.split(",")[0];
    b.classList.toggle("active", d===state.domain || (state.domain==="home"&&d==="home"));
  });
}
function todayPlan(){
  const day = Math.floor(Date.now()/86400000);
  return A.studyPlan[day % A.studyPlan.length];
}
function saveRecent(id){
  const old = JSON.parse(localStorage.getItem("atlasRecent")||"[]").filter(x=>x!==id);
  localStorage.setItem("atlasRecent", JSON.stringify([id,...old].slice(0,6)));
}
function recentArticles(){
  return JSON.parse(localStorage.getItem("atlasRecent")||"[]").map(getArticle).filter(Boolean);
}
function sectionHeader(kicker,title,desc="", action=""){
  return `<div class="section-head">
    <div><span class="micro">${esc(kicker)}</span><h2>${title}</h2>${desc?`<p>${desc}</p>`:""}</div>
    ${action}
  </div>`;
}
function domainTabs(d,v){
  return `<nav class="subnav">${views.map(([id,label])=>`<button class="${id===v?"active":""}" data-go="${d},${id}">${label}</button>`).join("")}</nav>`;
}
function editorialHero({kicker,title,deck,side}){
  return `<section class="editorial-hero">
    <div class="hero-copy">
      <span class="micro">${esc(kicker)}</span>
      <h1>${title}</h1>
      <p>${deck}</p>
      <div class="hero-actions">
        <button class="button primary" data-go="aidc,knowledge">进入知识手册</button>
        <button class="button" data-go="aidc,case">打开 AI Factory Lab</button>
      </div>
    </div>
    <aside class="hero-aside">${side}</aside>
  </section>`;
}
function renderHome(){
  const p = todayPlan();
  const pa = getArticle(p.article);
  const latest = mergedNews().slice(0,4);
  const recents = recentArticles().slice(0,3);
  return `
  ${editorialHero({
    kicker:"TODAY / TECHNOLOGY ATLAS",
    title:"不是追热点。<br><em>是持续构建技术地图。</em>",
    deck:"把 AIDC、具身智能与机器学习组织成可学习、可推演、可追踪变化的一张 Atlas。每天先理解一个核心概念，再看技术世界发生了什么。",
    side:`<div class="issue-label">ISSUE 2026.10</div>
      <div class="hero-stat"><strong>26</strong><span>完整知识专题</span></div>
      <div class="hero-stat"><strong>3</strong><span>技术域统一结构</span></div>
      <div class="hero-note"><i></i> 知识正文已全部补齐 · 无空节点</div>`
  })}
  <section class="mag-grid">
    <article class="feature-card">
      <div class="feature-number">01</div>
      <span class="micro">TODAY'S STUDY · ${p.minutes} MIN</span>
      <h2>${esc(p.title)}</h2>
      <p>${esc(pa.deck)}</p>
      <div class="learning-path">${p.path.map((x,i)=>`<div><b>${String(i+1).padStart(2,"0")}</b><span>${esc(x)}</span></div>`).join("")}</div>
      <button class="text-link" data-article="${p.article}">开始今日学习 <span>→</span></button>
    </article>
    <article class="change-card">
      <span class="micro">CHANGE RADAR</span>
      <h3>今天值得注意的变化</h3>
      <div class="change-list">${latest.map(n=>`
        <a href="${n.url}" target="_blank" rel="noreferrer">
          <time>${esc((n.published_at||"").slice(5))}</time>
          <div><b>${esc(n.title)}</b><p>${esc(n.what_changed||n.facts||"")}</p></div>
          <span>↗</span>
        </a>`).join("")}</div>
    </article>
  </section>

  ${renderDomainMagazineCards()}
  ${renderSystemSpine()}
  ${renderMarket("aidc", false)}
  ${recents.length ? renderContinue(recents) : ""}
  ${renderNews(mergedNews().slice(0,8),"LATEST / VERIFIED","最近的技术变化")}
  `;
}
function renderDomainMagazineCards(){
  return `<section class="section">
    ${sectionHeader("ATLAS / THREE DOMAINS","三条主线，最终汇成一个系统","基础设施决定算力边界，模型决定智能上限，机器人把智能带回物理世界。")}
    <div class="domain-covers">${Object.entries(A.domains).map(([id,d],idx)=>`
      <article class="domain-cover" data-go="${id},overview">
        <div class="cover-top"><span>0${idx+1}</span><b>${esc(d.eyebrow)}</b></div>
        <h3>${esc(d.name)}</h3><p>${esc(d.intro)}</p>
        <div class="cover-footer"><span>${d.groups.reduce((s,g)=>s+g.items.length,0)} topics</span><span>Open atlas →</span></div>
      </article>`).join("")}
    </div>
  </section>`;
}
function renderSystemSpine(){
  const nodes = [
    ["Power","电力"],["Cooling","热管理"],["GPU","计算"],["Fabric","网络"],
    ["Models","模型"],["Agent","执行"],["World Model","预测"],["Robot","行动"]
  ];
  return `<section class="section">
    ${sectionHeader("SYSTEM SPINE","从电网到机器人动作","把跨领域知识放到同一条因果链上，而不是三个互不相干的目录。")}
    <div class="system-spine">${nodes.map((n,i)=>`<div class="spine-node"><span>${String(i+1).padStart(2,"0")}</span><b>${n[0]}</b><small>${n[1]}</small></div>`).join("")}</div>
  </section>`;
}
function renderContinue(items){
  return `<section class="section">
    ${sectionHeader("CONTINUE LEARNING","继续上次的学习")}
    <div class="compact-grid">${items.map(a=>articleTile(a,true)).join("")}</div>
  </section>`;
}
function renderDomain(d,v){
  const dom=A.domains[d];
  const count=dom.groups.reduce((s,g)=>s+g.items.length,0);
  return `
    <section class="domain-masthead">
      <div><span class="micro">${esc(dom.eyebrow)} / ATLAS</span><h1>${esc(dom.name)}</h1><p>${esc(dom.intro)}</p></div>
      <aside><strong>${count}</strong><span>核心专题</span><small>${esc(dom.accent)}</small></aside>
    </section>
    ${domainTabs(d,v)}
    ${renderView(d,v)}
  `;
}
function renderView(d,v){
  const articleId=params().get("article");
  if(v==="knowledge" && articleId && getArticle(articleId)) return renderArticle(articleId);
  if(v==="overview") return renderOverview(d);
  if(v==="knowledge") return renderKnowledge(d);
  if(v==="case") return renderCase(d);
  if(v==="market") return renderMarket(d,true);
  if(v==="companies") return renderCompanies(d);
  if(v==="research") return renderNews(mergedNews().filter(n=>n.domain===d && n.category==="科研进展"),"RESEARCH","科研进展");
  if(v==="news") return renderNews(mergedNews().filter(n=>n.domain===d && n.category==="产业动态"),"INDUSTRY","产业动态");
  return renderKnowledge(d);
}
function renderOverview(d){
  const dom=A.domains[d];
  const items=dom.groups.flatMap(g=>g.items).map(getArticle);
  const featured=items[0];
  return `<section class="section">
    ${sectionHeader("FIELD MAP","先看系统，再进入知识点","建议按分组顺序学习，也可以直接进入你当前关心的问题。")}
    <div class="overview-layout">
      <article class="overview-feature">
        <span class="micro">START HERE</span><h2>${esc(featured.title)}</h2><p>${esc(featured.deck)}</p>
        <button class="text-link" data-article="${featured.id}">阅读起点 <span>→</span></button>
      </article>
      <div class="overview-stack">${dom.groups.map((g,i)=>`
        <div class="overview-group"><b>0${i+1}</b><div><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p><span>${g.items.length} topics</span></div></div>`).join("")}
      </div>
    </div>
    ${renderKnowledge(d,true)}
  </section>`;
}
function articleTile(a,compact=false){
  return `<article class="topic-card ${compact?"compact":""}" data-article="${a.id}">
    <div class="topic-meta"><span>${esc(a.category)}</span><span>${a.readMinutes} min</span></div>
    <h3>${esc(a.title)}</h3><p>${esc(a.deck)}</p>
    <div class="topic-tags">${a.tags.slice(0,3).map(t=>`<span>${esc(t)}</span>`).join("")}</div>
    <footer><span>${esc(a.level)}</span><b>阅读专题 →</b></footer>
  </article>`;
}
function renderKnowledge(d,embedded=false){
  const dom=A.domains[d];
  return `<section class="${embedded?"":"section"} knowledge-section">
    ${embedded?"":sectionHeader("KNOWLEDGE MANUAL","不是词条，是可以系统读完的技术手册","每个节点包含原理图、关键参数、公式、工程表格、常见误区、上下游关系与来源。")}
    <div class="manual-index">${dom.groups.map((g,i)=>`
      <section class="manual-group">
        <header><span>0${i+1}</span><div><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p></div></header>
        <div class="topic-grid">${g.items.map(id=>articleTile(getArticle(id))).join("")}</div>
      </section>`).join("")}
    </div>
  </section>`;
}
function renderFlow(a){
  return `<figure class="tech-figure">
    <div class="figure-head"><span class="micro">FIGURE / SYSTEM FLOW</span><strong>${esc(a.visual.title)}</strong></div>
    <div class="flow-line">${a.visual.nodes.map((raw,i)=>{
      const [label,sub=""] = raw.split("|");
      return `<div class="flow-node"><span>${String(i+1).padStart(2,"0")}</span><b>${esc(label)}</b><small>${esc(sub)}</small></div>`;
    }).join("")}</div>
    <figcaption>${esc(a.visual.caption)}</figcaption>
  </figure>`;
}
function renderArticle(id){
  const a=getArticle(id); if(!a) return "";
  saveRecent(id);
  return `<article class="article-page">
    <a class="back-link" href="${hrefFor(a.domain,"knowledge")}" data-go="${a.domain},knowledge">← 返回 ${esc(domainName(a.domain))} 知识手册</a>
    <header class="article-hero">
      <div>
        <span class="micro">${esc(domainName(a.domain))} / ${esc(a.category)}</span>
        <h1>${esc(a.title)}</h1><p>${esc(a.deck)}</p>
        <div class="article-meta"><span>${a.readMinutes} min</span><span>${esc(a.level)}</span>${a.tags.map(t=>`<span>${esc(t)}</span>`).join("")}</div>
      </div>
      <aside>${a.quickFacts.map(f=>`<div><small>${esc(f[0])}</small><strong>${esc(f[1])}</strong><p>${esc(f[2])}</p></div>`).join("")}</aside>
    </header>

    ${a.callout?`<div class="editor-note"><span>EDITOR'S NOTE</span><p>${esc(a.callout)}</p></div>`:""}
    ${renderFlow(a)}
    ${a.compare?renderCompare(a.compare):""}

    <div class="article-body">
      <div class="article-main">
        ${a.sections.map((s,i)=>`<section class="prose-section"><span class="section-no">${String(i+1).padStart(2,"0")}</span><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p>${s.bullets?`<ul>${s.bullets.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</section>`).join("")}
      </div>
      <aside class="article-rail">
        <div class="formula-card"><span class="micro">CORE RELATION</span><pre>${esc(a.formula.expr)}</pre><p>${esc(a.formula.explanation)}</p></div>
        <div class="rail-card"><span class="micro">COMMON PITFALLS</span>${a.pitfalls.map((x,i)=>`<div class="pitfall"><b>0${i+1}</b><span>${esc(x)}</span></div>`).join("")}</div>
      </aside>
    </div>

    <section class="data-table-wrap">
      <span class="micro">ENGINEERING NOTES</span>
      <div class="table-scroll"><table><thead><tr>${a.table.headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${a.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </section>

    ${renderRelated(a)}
    ${renderSources(a)}
  </article>`;
}
function renderCompare(rows){
  return `<section class="compare-section">
    ${sectionHeader("CONCEPT MAP","四种模型到底分别解决什么问题")}
    <div class="compare-grid">${rows.map(r=>`<article><h3>${esc(r.name)}</h3><dl><dt>主要学习</dt><dd>${esc(r.learns)}</dd><dt>主要输出</dt><dd>${esc(r.returns)}</dd><dt>控制属性</dt><dd>${esc(r.control)}</dd></dl></article>`).join("")}</div>
  </section>`;
}
function renderRelated(a){
  const rel=a.related.map(getArticle).filter(Boolean).slice(0,4);
  if(!rel.length) return "";
  return `<section class="section related-section">${sectionHeader("RELATED / NEXT","继续沿知识关系往下读")}<div class="compact-grid">${rel.map(x=>articleTile(x,true)).join("")}</div></section>`;
}
function renderSources(a){
  if(!a.sources?.length) return "";
  return `<section class="sources"><span class="micro">PRIMARY / REFERENCE SOURCES</span>${a.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noreferrer"><b>${esc(s.name)}</b>${s.note?`<span>${esc(s.note)}</span>`:""}<i>↗</i></a>`).join("")}</section>`;
}
function renderCase(d){
  if(d!=="aidc"){
    const text=d==="embodied"?"下一阶段会加入机器人任务、世界模型滚动预测与策略闭环实验。":"下一阶段会加入推理服务、KV Cache 和 Agent Runtime 容量实验。";
    return `<section class="empty-state"><span class="micro">LAB / NEXT</span><h2>案例实验室正在扩展</h2><p>${text}</p></section>`;
  }
  return `<section class="lab-page">
    ${sectionHeader("AI FACTORY LAB / 100MW","把整座智算中心当成一个可计算系统","调整参数，看电力、机柜、冷却、流量和年度能耗如何联动。")}
    <div class="scenario-bar">
      <button data-preset="efficient">高效液冷</button>
      <button data-preset="balanced" class="active">100MW 基准</button>
      <button data-preset="dense">超高密度</button>
    </div>
    <div class="lab-layout">
      <aside class="lab-controls">
        ${slider("itLoad","IT Load","MW",20,300,5,100)}
        ${slider("pue","PUE","",1.05,1.5,.01,1.18)}
        ${slider("rackPower","单柜功率","kW",40,250,5,140)}
        ${slider("cduPower","CDU 单元能力","MW",.4,2.5,.1,1.2)}
        ${slider("deltaT","液冷 ΔT","℃",5,20,1,10)}
        <label class="select-control"><span>冗余策略</span><select id="redundancy"><option value="1.08">N+1</option><option value="1.15">2N 局部</option><option value="1.25">高冗余</option></select></label>
      </aside>
      <div class="lab-stage">
        <div class="lab-metrics">
          <div><small>FACILITY LOAD</small><strong id="facilityLoad">118 MW</strong><span>IT × PUE</span></div>
          <div><small>RACKS</small><strong id="rackCount">715</strong><span>计算机柜估算</span></div>
          <div><small>CDU UNITS</small><strong id="cduCount">91</strong><span>含示意冗余</span></div>
          <div><small>WATER FLOW</small><strong id="waterFlow">2,390 kg/s</strong><span>按水与 ΔT 示意</span></div>
          <div><small>ANNUAL ENERGY</small><strong id="annualEnergy">1.03 TWh</strong><span>满载等效</span></div>
        </div>

        <div class="factory-diagram">
          <div class="diagram-title"><span class="micro">LIVE SYSTEM MAP</span><b id="scenarioLabel">100MW BASELINE</b></div>
          <div class="lane power-lane"><span class="lane-label">POWER</span>${["Grid","MV","UPS / DC","Busway","Rack","GPU"].map((x,i)=>`<div class="plant-node" data-plant="p${i}"><b>${x}</b><span></span></div>`).join("")}</div>
          <div class="lane cooling-lane"><span class="lane-label">COOLING</span>${["GPU","Cold Plate","Rack Manifold","CDU","Facility Water","Heat Rejection"].map((x,i)=>`<div class="plant-node" data-plant="c${i}"><b>${x}</b><span></span></div>`).join("")}</div>
          <div class="lab-network">
            <span class="lane-label">FABRIC</span>
            <div class="fabric-spine">SPINE</div>
            <div class="fabric-grid">${Array.from({length:8},(_,i)=>`<span>GPU POD ${i+1}</span>`).join("")}</div>
          </div>
        </div>

        <section class="fault-lab">
          <div><span class="micro">FAULT INJECTION</span><h3>故障不是一个红点，而是一条传导链</h3></div>
          <div class="fault-buttons">${["CDU 故障","UPS 故障","交换机拥塞","GPU Hotspot","冷却流量不足"].map(x=>`<button data-fault="${x}">${x}</button>`).join("")}</div>
          <div id="faultPanel" class="fault-panel"><strong>正常状态</strong><p>选择故障，系统图会高亮受影响链路，并解释物理指标 → 告警 → 业务影响 → 处置动作。</p></div>
        </section>
        <div class="lab-links">
          <span>回到知识手册：</span>
          <button data-article="power">供配电</button><button data-article="cooling">液冷</button><button data-article="scaleout">AI Fabric</button><button data-article="ops">运维闭环</button>
        </div>
      </div>
    </div>
  </section>`;
}
function slider(id,label,unit,min,max,step,value){
  return `<label class="slider-control"><span><b>${label}</b><output id="${id}V">${value}${unit?` ${unit}`:""}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}
function renderMarket(d,standalone=true){
  if(d!=="aidc"){
    return `<section class="empty-state"><span class="micro">MARKET LENS</span><h2>该领域的长期数据页正在建立</h2><p>产业动态仍会每日刷新；长期市场曲线只在数据口径可核验时加入。</p></section>`;
  }
  const m=A.market.aidc;
  return `<section class="${standalone?"section": "section market-home"}">
    ${sectionHeader("MARKET LENS / SOURCE-BACKED","市场不是新闻标题，而是可追溯的数据","所有预测值与实际值分开标记，并保留报告期、来源和核验时间。")}
    <div class="market-layout">
      <article class="market-chart-card">
        <div class="market-title"><div><span class="micro">${esc(m.unit)}</span><h3>${esc(m.title)}</h3><p>${esc(m.subtitle)}</p></div><a href="${m.sourceUrl}" target="_blank" rel="noreferrer">${esc(m.source)} ↗</a></div>
        ${lineChart(m.points)}
        <footer><span>实线点：actual / estimate / forecast 依来源口径区分</span><span>核验 ${m.verifiedAt}</span></footer>
      </article>
      <div class="market-lenses">${m.lenses.map((x,i)=>`<a href="${x.url}" target="_blank" rel="noreferrer" class="lens-card"><span>0${i+1}</span><small>${esc(x.label)}</small><strong>${esc(x.value)}</strong><p>${esc(x.note)}</p><em>${esc(x.source)} ↗</em></a>`).join("")}</div>
    </div>
    ${standalone?renderNews(mergedNews().filter(n=>n.domain==="aidc"&&n.category==="市场洞察"),"MARKET UPDATES","市场更新"):""}
  </section>`;
}
function lineChart(points){
  const W=820,H=330,padX=54,padY=45;
  const max=Math.max(...points.map(p=>p.value))*1.08, min=0;
  const pts=points.map((p,i)=>({x:padX+i*(W-2*padX)/(points.length-1), y:H-padY-(p.value-min)/(max-min)*(H-2*padY),...p}));
  const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
  return `<svg class="market-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="全球数据中心用电趋势">
    <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".22"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
    ${[0,.25,.5,.75,1].map(t=>{const y=H-padY-t*(H-2*padY);return `<line x1="${padX}" x2="${W-padX}" y1="${y}" y2="${y}" class="gridline"/><text x="6" y="${y+4}" class="axis">${Math.round(max*t)}</text>`}).join("")}
    <polygon points="${padX},${H-padY} ${poly} ${W-padX},${H-padY}" fill="url(#fill)" class="area"/>
    <polyline points="${poly}" class="trend"/>
    ${pts.map(p=>`<g><circle cx="${p.x}" cy="${p.y}" r="5" class="dot ${p.kind}"/><text x="${p.x}" y="${p.y-16}" text-anchor="middle" class="value">${p.value}</text><text x="${p.x}" y="${H-16}" text-anchor="middle" class="axis">${p.label}</text></g>`).join("")}
  </svg>`;
}
function renderCompanies(d){
  const list=A.companies.filter(c=>c.domain.includes(d));
  return `<section class="section">
    ${sectionHeader("COMPANY WATCH","企业观察不是股价榜，而是技术路线跟踪","关注产品架构、基础设施路径和生态变化。")}
    <div class="company-grid">${list.map(c=>`<a class="company-card" href="${c.url}" target="_blank" rel="noreferrer"><span>${esc(c.name.slice(0,2))}</span><h3>${esc(c.name)}</h3><ul>${c.focus.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><b>Official ↗</b></a>`).join("")}</div>
  </section>`;
}
function renderNews(items,kicker,title){
  return `<section class="section news-section">
    ${sectionHeader(kicker,title,"只保留有来源、可说明“发生了什么变化”和“为什么重要”的条目。")}
    <div class="news-stack">${items.length?items.map(n=>`<article class="news-row">
      <div class="news-date"><b>${esc((n.published_at||"").slice(5))}</b><span>${esc(domainName(n.domain))}</span></div>
      <div><div class="news-tags"><span>${esc(n.category||"")}</span><span>${esc(n.technology||"")}</span></div><h3>${esc(n.title)}</h3><p>${esc(n.what_changed||n.facts||"")}</p><small>${esc(n.why_it_matters||"")}</small></div>
      <div class="news-actions">${n.related_knowledge&&getArticle(n.related_knowledge)?`<button data-article="${n.related_knowledge}">关联知识</button>`:""}<a href="${n.url}" target="_blank" rel="noreferrer">${esc(n.source||"Source")} ↗</a></div>
    </article>`).join(""):`<div class="empty-inline">暂无新的高质量条目。</div>`}</div>
  </section>`;
}

const faultInfo={
  "CDU 故障":{title:"液冷能力降级",body:"CDU 泵或换热链路异常 → 压差/流量下降 → GPU 入口温度抬升 → 热保护与降频风险。优先切换冗余 CDU、限制受影响机柜负载并检查过滤器/泵状态。",nodes:["c3","c2","c1","c0"]},
  "UPS 故障":{title:"供电路径进入降级",body:"UPS/储能故障 → 旁路或冗余路径接管 → 若公共故障点设计不当可能影响整组机柜。需要确认切换状态、剩余容量与受影响作业。",nodes:["p2","p3","p4","p5"]},
  "交换机拥塞":{title:"有效算力下降",body:"Fabric 排队/ECN/PFC 异常 → Collective 延迟上升 → GPU 等待 → step time 上升。电还在消耗，但 tokens/s 或训练吞吐下降。",nodes:[]},
  "GPU Hotspot":{title:"局部热风险",body:"冷板接触、流量分配、TIM 或芯片负载异常 → 局部温度升高 → 降频/保护。需要联动服务器遥测与液冷支路数据定界。",nodes:["c0","c1"]},
  "冷却流量不足":{title:"换热能力不足",body:"根据 Q=ṁcₚΔT，流量下降会要求更高 ΔT，否则热量无法及时带走。检查泵速、阀门、堵塞和分配不均。",nodes:["c2","c3","c4"]}
};
function calcLab(){
  const it=$("#itLoad"); if(!it) return;
  const itv=+it.value,pue=+$("#pue").value,rp=+$("#rackPower").value,cdu=+$("#cduPower").value,dt=+$("#deltaT").value,red=+$("#redundancy").value;
  const facility=itv*pue, racks=Math.ceil(itv*1000/rp), cdus=Math.ceil((itv/cdu)*red), annual=facility*8760/1000, flow=itv*1e6/(4180*dt);
  $("#itLoadV").value=`${itv} MW`; $("#pueV").value=pue.toFixed(2); $("#rackPowerV").value=`${rp} kW`; $("#cduPowerV").value=`${cdu.toFixed(1)} MW`; $("#deltaTV").value=`${dt} ℃`;
  $("#facilityLoad").textContent=`${fmt(facility,1)} MW`; $("#rackCount").textContent=fmt(racks); $("#cduCount").textContent=fmt(cdus); $("#waterFlow").textContent=`${fmt(flow)} kg/s`; $("#annualEnergy").textContent=`${annual.toFixed(2)} TWh`;
}
function applyPreset(name){
  const p={
    efficient:{itLoad:80,pue:1.10,rackPower:120,cduPower:1.5,deltaT:12,label:"HIGH EFFICIENCY LIQUID COOLING"},
    balanced:{itLoad:100,pue:1.18,rackPower:140,cduPower:1.2,deltaT:10,label:"100MW BASELINE"},
    dense:{itLoad:160,pue:1.14,rackPower:200,cduPower:2.0,deltaT:12,label:"ULTRA-DENSE AI FACTORY"}
  }[name]; if(!p) return;
  Object.entries(p).forEach(([k,v])=>{ if(k!=="label" && $("#"+k)) $("#"+k).value=v; });
  $("#scenarioLabel").textContent=p.label; calcLab();
}
function bind(){
  $$("[data-go]").forEach(el=>el.onclick=e=>{e.preventDefault(); const [d,v]=el.dataset.go.split(","); nav(d,v);});
  $$("[data-mobile-go]").forEach(el=>el.onclick=()=>{const [d,v]=el.dataset.mobileGo.split(",");nav(d,v);});
  $$("[data-article]").forEach(el=>el.onclick=e=>{e.preventDefault(); const id=el.dataset.article,a=getArticle(id); if(a) nav(a.domain,"knowledge",{article:id});});
  ["itLoad","pue","rackPower","cduPower","deltaT","redundancy"].forEach(id=>$("#"+id)?.addEventListener("input",calcLab));
  $$("[data-preset]").forEach(b=>b.onclick=()=>{$$("[data-preset]").forEach(x=>x.classList.remove("active"));b.classList.add("active");applyPreset(b.dataset.preset);});
  $$("[data-fault]").forEach(b=>b.onclick=()=>{
    $$("[data-fault]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    $$(".plant-node").forEach(n=>n.classList.remove("fault"));
    const f=faultInfo[b.dataset.fault];
    f.nodes.forEach(id=>$(`[data-plant="${id}"]`)?.classList.add("fault"));
    $("#faultPanel").innerHTML=`<strong>${esc(f.title)}</strong><p>${esc(f.body)}</p>`;
  });
  calcLab();
}
function searchAll(q){
  q=q.trim().toLowerCase(); if(!q) return [];
  const hits=[];
  Object.values(A.articles).forEach(a=>{
    const text=[a.title,a.deck,a.category,...a.tags,...a.sections.flatMap(s=>[s.title,s.body,...(s.bullets||[])])].join(" ").toLowerCase();
    if(text.includes(q)) hits.push({type:"知识",title:a.title,meta:`${domainName(a.domain)} · ${a.category}`,article:a.id});
  });
  mergedNews().forEach(n=>{
    const text=[n.title,n.company,n.technology,n.what_changed,n.facts].join(" ").toLowerCase();
    if(text.includes(q)) hits.push({type:"动态",title:n.title,meta:`${domainName(n.domain)} · ${n.category}`,url:n.url});
  });
  return hits.slice(0,18);
}
function setupGlobal(){
  $$(".topnav button").forEach(b=>b.onclick=()=>nav(b.dataset.domain,b.dataset.domain==="home"?"today":"overview"));
  $("#themeBtn").onclick=()=>{
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("atlasTheme",document.documentElement.classList.contains("dark")?"dark":"light");
  };
  if(localStorage.getItem("atlasTheme")==="dark") document.documentElement.classList.add("dark");
  const dlg=$("#searchDialog"),input=$("#globalSearch"),results=$("#searchResults");
  $("#searchBtn").onclick=()=>{dlg.showModal();setTimeout(()=>input.focus(),50);};
  $("#closeSearch").onclick=()=>dlg.close();
  input.oninput=()=>{
    const r=searchAll(input.value);
    results.innerHTML=r.map((x,i)=>`<a href="${x.url||"#"}" ${x.url?'target="_blank" rel="noreferrer"':""} data-hit="${i}"><span>${esc(x.type)}</span><b>${esc(x.title)}</b><small>${esc(x.meta)}</small></a>`).join("");
    $$("[data-hit]",results).forEach(el=>{const x=r[+el.dataset.hit]; if(x.article) el.onclick=e=>{e.preventDefault();dlg.close();const a=getArticle(x.article);nav(a.domain,"knowledge",{article:x.article});};});
  };
}
function render(){
  const p=params();
  state.domain=p.get("domain")||state.domain||"home";
  state.view=p.get("view")||state.view||(state.domain==="home"?"today":"overview");
  setActive();
  app.innerHTML=state.domain==="home"?renderHome():renderDomain(state.domain,state.view);
  bind();
  $("#footerUpdated").textContent=`内容核验：${A.meta.verifiedAt} · V${A.meta.version}`;
  window.scrollTo({top:0,behavior:"instant"});
}
window.addEventListener("popstate",render);
setupGlobal();
fetch("./data/daily.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(d?.items?.length){A.dynamicNews=d.items;render();}}).catch(()=>{});
render();
