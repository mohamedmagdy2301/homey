// =================== UI ===================
// line icons (24×24, stroked with currentColor)
const ICONS={home:"M3 10.5 12 3l9 7.5M5 9v11h14V9M10 20v-6h4v6",chev:"m6 9 6 6 6-6",eye:"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  ruler:"M3 8h18v8H3zM7 8v3M11 8v4M15 8v3M19 8v4",square:"M4 4v16h16L4 4ZM8 12v4h4Z",building:"M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2",
  sliders:"M4 7h8M16 7h4M4 17h4M12 17h8M14 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM10 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",undo:"M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h4",redo:"M9 14l-5-5 5-5M4 9h11a5 5 0 0 1 0 10h-4",reset:"M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4",
  x:"M6 6l12 12M18 6 6 18",plus:"M12 5v14M5 12h14",minus:"M5 12h14",print:"M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",dot:"M12 12h.01",
  stove:"M4 3h16v18H4zM4 8h16M8 5.5h.01M12 5.5h.01M9 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0",addbox:"M4 4h16v16H4zM12 8v8M8 12h8",dims:"M5 19 19 5M5 19v-5M5 19h5M19 5h-5M19 5v5",
  cabinet:"M4 3h16v18H4zM12 3v18M9.5 11v2M14.5 11v2",grid:"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",plan:"M3 3h18v18H3zM3 12h7M14 3v6M14 21v-5",
  height:"M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4",palette:"M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.9-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5ZM7.5 11.5h.01M10 7.5h.01M15 7.5h.01",
  utility:"M9 3S4 9 4 13a5 5 0 0 0 10 0c0-4-5-10-5-10ZM19 3l-2.5 5h4L18 13",steps:"M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9",
  coins:"M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5",
  folder:"M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z",bath:"M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2",
  lamp:"M3 4h18M6 4v3h12V4M12 7v4M9 14a3 3 0 0 0 6 0Z",sofa:"M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM5 18v2M19 18v2",
  roller:"M4 4h13v5H4zM17 6.5h3V12h-8v3M11 15h2v6h-2z",tiles:"M4 4h16v16H4zM4 10h16M4 15h16M10 4v6M14 10v5M9 15v5"};
function ico(n,s){ s=s||20; return `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="${ICONS[n]||ICONS.dot}"/></svg>`; }
document.querySelectorAll("[data-ico]").forEach(el=>{ el.outerHTML=ico(el.dataset.ico,+el.dataset.s||20); });
const TABICO={"الأجهزة":"stove","➕ أجهزة":"addbox","مقاسات الأجهزة":"dims","التخزين":"cabinet","الوحدات":"grid","الأوضة":"plan","الارتفاعات":"height","الشكل":"palette","العرض":"eye",
  "المية والكهربا":"utility","خطوات التنفيذ":"steps","التكلفة":"coins","المشاريع":"folder","الحمام":"bath","السقف":"lamp","الأثاث":"sofa","الدهان والأرضية":"roller","التشطيب":"tiles"};
const tabLabel=t=>t==="➕ أجهزة"?"أجهزة إضافية":t;
// phone < 760 ≤ tablet < 1180 ≤ desktop (same breakpoints as the CSS)
const MQ={tab:matchMedia("(min-width:760px)"),desk:matchMedia("(min-width:1180px)")};
const panel=document.getElementById("panel"), stage=document.getElementById("stage");
let panelOpen=false;
function setPanel(o){ panelOpen=o; panel.classList.toggle("open",o); if(!o) panel.classList.remove("full"); document.body.classList.toggle("panel-open",o); document.getElementById("stats").style.display=(o&&!MQ.tab.matches)?"none":"flex"; resize(); }
document.getElementById("open").onclick=()=>setPanel(!panelOpen);
document.getElementById("fab").onclick=()=>setPanel(true);
document.getElementById("aptBtn").onclick=()=>openApt();
MQ.tab.addEventListener&&MQ.tab.addEventListener("change",()=>setPanel(panelOpen));
document.getElementById("drawBtn").onclick=()=>openDraw();
document.getElementById("projBtn").onclick=()=>openSheet();
// phone bottom sheet: tap the handle to expand, drag down to shrink or close, drag up to expand
(function(){ const g=document.getElementById("grab"); let y0=null, moved=false;
  const reset=()=>{ panel.style.transition=""; panel.style.transform=""; };
  g.addEventListener("pointerdown",e=>{ if(MQ.tab.matches) return; y0=e.clientY; moved=false; g.setPointerCapture(e.pointerId); });
  g.addEventListener("pointermove",e=>{ if(y0==null) return; const dy=e.clientY-y0; if(Math.abs(dy)>6) moved=true; if(dy>0){ panel.style.transition="none"; panel.style.transform=`translateY(${dy}px)`; } });
  g.addEventListener("pointerup",e=>{ if(y0==null) return; const dy=e.clientY-y0; y0=null; reset();
    if(!moved){ panel.classList.toggle("full"); return; }
    if(dy>70){ if(panel.classList.contains("full")) panel.classList.remove("full"); else setPanel(false); } else if(dy<-40) panel.classList.add("full"); });
  g.addEventListener("pointercancel",()=>{ y0=null; reset(); });
})();
// Ctrl+Z = undo, Ctrl+Y / Ctrl+Shift+Z = redo, Esc = close the top-most layer (the wizard keeps its own ✕ so work isn't lost by accident)
addEventListener("keydown",e=>{ const tg=e.target, typing=tg&&(tg.tagName==="TEXTAREA"||(tg.tagName==="INPUT"&&!["range","checkbox","color"].includes(tg.type)));
  if((e.ctrlKey||e.metaKey)&&e.code==="KeyZ"&&!e.shiftKey&&!typing&&document.getElementById("apt").style.display==="flex"){ e.preventDefault(); aptUndo(); return; } /* the apartment screen has its own undo */
  if((e.ctrlKey||e.metaKey)&&(e.code==="KeyZ"||e.code==="KeyY")&&!typing&&!WIZ&&!APT3D&&document.getElementById("apt").style.display!=="flex"){ e.preventDefault(); document.getElementById(e.code==="KeyY"||e.shiftKey?"redo":"undo").click(); return; }
  if(e.key!=="Escape") return; const vis=id=>document.getElementById(id).style.display==="flex";
  if(vis("shot")) document.getElementById("shot").style.display="none"; else if(vis("draw")) document.getElementById("dclose").click();
  else if(vis("home")) closeHome(); else if(vis("sheet")) closeSheet(); else if(vis("apt")) closeApt(); else if(!WIZ&&panelOpen&&!MQ.desk.matches) setPanel(false); });
document.getElementById("wizClose").onclick=()=>closeWizard(false);
document.getElementById("wizBack").onclick=()=>{ if(WIZ&&WIZ.step>0){ WIZ.step--; renderWiz(); } };
document.getElementById("wizNext").onclick=()=>{ if(!WIZ) return; if(WIZ.step<WSTEPS.length-1){ WIZ.step++; renderWiz(); document.getElementById("wizBody").scrollTop=0; } else closeWizard(true); };
document.getElementById("dclose").onclick=()=>{ document.getElementById("draw").style.display="none"; DRAW_DOC=false; };
document.getElementById("dprint").onclick=()=>{ try{ window.print(); }catch(e){} };
document.getElementById("close").onclick=()=>setPanel(false);
const hist=[], redo=[]; function pushHist(){ hist.push(JSON.stringify(cfg)); if(hist.length>60) hist.shift(); redo.length=0; histBtns(); } /* a new change drops whatever could be redone */
function clearHist(){ hist.length=0; redo.length=0; histBtns(); }
function histBtns(){ document.getElementById("undo").disabled=!hist.length; document.getElementById("redo").disabled=!redo.length; }
document.getElementById("undo").onclick=()=>{ if(!hist.length) return; redo.push(JSON.stringify(cfg)); cfg=JSON.parse(hist.pop()); histBtns(); build(); renderControls(); };
document.getElementById("redo").onclick=()=>{ if(!redo.length) return; hist.push(JSON.stringify(cfg)); cfg=JSON.parse(redo.pop()); histBtns(); build(); renderControls(); };
histBtns();
document.getElementById("reset").onclick=()=>{ pushHist(); const t=cfg.template||"mine"; const keep={roomW:cfg.roomW,roomL:cfg.roomL,dimsOn:cfg.dimsOn,plaster:cfg.plaster,tileT:cfg.tileT,ceil:cfg.ceil}; cfg=newCfg(t); if(t!=="mine"){ Object.assign(cfg,keep); applyTemplate(cfg,t,true); } SEL=null; build(); renderControls(); };

function fill(sel,obj,val){ sel.innerHTML=""; for(const [k,v] of Object.entries(obj)){const o=document.createElement("option");o.value=k;o.textContent=v.name;sel.appendChild(o);} sel.value=val; }
const viewSel=document.getElementById("view"); fill(viewSel,VIEWS,"out"); viewSel.onchange=()=>setView(viewSel.value);

let tab=Object.keys(SCHEMA)[0];
const tabsEl=document.getElementById("tabs"); let ctlEl=document.getElementById("controls");
function tabsFor(){ if(cfg.roomType==="room") return ["الأثاث","الأوضة","السقف","الدهان والأرضية","المية والكهربا","الشكل","العرض","الوحدات","خطوات التنفيذ","المشاريع"]; if(cfg.roomType==="hall") return ["الأوضة","السقف","الدهان والأرضية","الشكل","العرض","المشاريع"]; return cfg.roomType==="bath"?["الحمام","الأوضة","السقف","التشطيب","المية والكهربا","الشكل","العرض","الوحدات","خطوات التنفيذ","المشاريع"]:Object.keys(SCHEMA).filter(t=>!["الحمام","التشطيب","الأثاث","الدهان والأرضية","السقف"].includes(t)).flatMap(t=>t==="الارتفاعات"?[t,"السقف"]:[t]); }
// tabs grouped in the order the work happens; each group shows only the tabs this room type has (a tab missing from every group falls into "التصميم")
const TGROUPS=[{k:"size",n:"المقاسات",ico:"ruler",t:["الأوضة","الارتفاعات","الأبواب والشبابيك"]},
  {k:"design",n:"التصميم",ico:"palette",t:["الأجهزة","➕ أجهزة","مقاسات الأجهزة","التخزين","الوحدات","الشكل","السقف","العرض","الأثاث","الدهان والأرضية","الحمام","التشطيب"]},
  {k:"do",n:"التنفيذ",ico:"steps",t:["المية والكهربا","خطوات التنفيذ","التكلفة"]},{k:"proj",n:"المشاريع",ico:"folder",t:["المشاريع"]}];
function tabGroups(){ const have=tabsFor(), known=TGROUPS.flatMap(g=>g.t);
  return TGROUPS.map(g=>({k:g.k,n:g.n,ico:g.ico,tabs:have.filter(t=>g.t.includes(t)||(g.k==="design"&&!known.includes(t)))})).filter(g=>g.tabs.length); }
const tabLast={}; /* last tab opened in each group (this session only, not saved in cfg) */
// rough link from a warning's text to the tab that fixes it: an explicit "من تاب X" wins, then the first matching rule, else the room type's main tab
const WARNTAB=[[/محطوط على حيطة|سخان الغاز/,"➕ أجهزة"],[/تمديد|صرف|المية|لوحة الكهربا|خطر/,"المية والكهربا"],[/أعمق من الرخامة|عن الرخامة|بالمقاس ده/,"مقاسات الأجهزة"],
  [/الدولاب العلوي|أعلى من الرخامة/,"الارتفاعات"],[/تداخل بين الوحدة/,"الوحدات"],[/دولاب الركن|ركن ميت|عليها رخامة/,"التخزين"],[/يتفتح|باب التلاجة|مثلث العمل|اتنقل لـ|مش لاقي مكان|جنب البوتاجاز|في ركن/,"الأجهزة"],
  [/الجزيرة|ممر|التجويف|الطرقة|من غير شباك|الباب هيخبط/,"الأوضة"],[/راكب على|الشاور|قدام|لازقة|للحركة|لازم 20 سم/,"الحمام"],[/السرير|السفرة|الشاشة|الكرسي|قافل|برة حدود|راكب على|الدولاب|أقسام|قدام/,"الأثاث"]];
function warnTab(w){ const have=tabsFor(), m=/تاب (المية والكهربا|[^\s،.]+)/.exec(w); if(m&&have.includes(m[1])) return m[1];
  for(const [re,t] of WARNTAB) if(re.test(w)&&have.includes(t)) return t; return have[0]; }
function warnTabs(){ const n={}; for(const w of new Set((typeof STATS!=="undefined"&&STATS.warn)||[])){ const t=warnTab(w); n[t]=(n[t]||0)+1; } return n; }
/* refresh the warning dots only (runs after every build) */
function tabWarn(){ const n=warnTabs(), mark=(b,c)=>{ b.classList.toggle("warn",c>0); const s=b.querySelector(".sr"); if(s) s.textContent=c>0?`، فيه ${c} ${c>1?"ملاحظات":"ملاحظة"}`:""; };
  tabsEl.querySelectorAll("button[data-t]").forEach(b=>mark(b,n[b.dataset.t]||0));
  tabsEl.querySelectorAll("button[data-g]").forEach(b=>mark(b,[...tabsEl.querySelectorAll(`.tsec[data-g="${b.dataset.g}"] button[data-t]`)].reduce((s,x)=>s+(n[x.dataset.t]||0),0))); }
function renderTabs(){ tabsEl.innerHTML=""; if(!tabsFor().includes(tab)) tab=tabsFor()[0];
  const groups=tabGroups(), cur=groups.find(g=>g.tabs.includes(tab))||groups[0]; tabLast[cur.k]=tab;
  const go=t=>{tab=t;renderTabs();renderControls();ctlEl.scrollTop=0;};
  const gr=document.createElement("div"); gr.className="seg tgrp"; gr.setAttribute("aria-label","مراحل الشغل"); tabsEl.appendChild(gr);
  for(const g of groups){ const b=document.createElement("button"); b.type="button"; b.dataset.g=g.k; b.innerHTML=ico(g.ico,16)+`<span>${g.n}</span><i class="wdot" aria-hidden="true"></i><span class="sr"></span>`; if(g===cur){ b.className="on"; b.setAttribute("aria-current","step"); }
    b.onclick=()=>{ if(g===cur) return; go(g.tabs.includes(tabLast[g.k])?tabLast[g.k]:g.tabs[0]); }; gr.appendChild(b); }
  for(const g of groups){ const sec=document.createElement("div"); sec.className="tsec"+(g===cur?" on":"")+(g.tabs.length<2?" one":""); sec.dataset.g=g.k; sec.setAttribute("role","group"); sec.setAttribute("aria-label",g.n);
    const h=document.createElement("div"); h.className="tsh"; h.textContent=g.n; h.setAttribute("aria-hidden","true"); sec.appendChild(h);
    for(const t of g.tabs){ const b=document.createElement("button"); b.type="button"; b.dataset.t=t; b.innerHTML=ico(TABICO[t],18)+`<span>${tabLabel(t)}</span><i class="wdot" aria-hidden="true"></i><span class="sr"></span>`; b.className=t===tab?"on":""; if(t===tab) b.setAttribute("aria-current","page");
      b.onclick=()=>go(t); sec.appendChild(b); }
    tabsEl.appendChild(sec); }
  tabWarn();
  document.getElementById("ptitle").textContent=tabLabel(tab);
  // keep the active tab visible without scrollIntoView (that can scroll the whole page while the sheet is hidden)
  const on=tabsEl.querySelector("button[data-t].on"), row=on&&on.parentNode; if(on&&panelOpen){ const r=on.getBoundingClientRect(), p=row.getBoundingClientRect(), q=tabsEl.getBoundingClientRect();
    if(r.left<p.left) row.scrollBy(r.left-p.left-24,0); else if(r.right>p.right) row.scrollBy(r.right-p.right+24,0);
    if(r.top<q.top) tabsEl.scrollBy(0,r.top-q.top-30); else if(r.bottom>q.bottom) tabsEl.scrollBy(0,r.bottom-q.bottom+8); } }
function renderControls(){
  ctlEl.innerHTML="";
  let acts=null;
  for(const c of SCHEMA[tab]){
    if(c.t!=="action") acts=null;
    if(c.t==="head"){ const h=document.createElement("div"); h.className="head"; h.textContent=c.l; ctlEl.appendChild(h); continue; }
    if(c.t==="range"){ const mn=(c.k==="roomW"||c.k==="roomL")?roomDimMin(c.k):c.min; rangeField(ctlEl,c.l,()=>cfg[c.k],v=>{ cfg[c.k]=v; },mn,c.max,c.step,c.u,()=>renderControls()); continue; }
    if(c.t==="select"){ const el=choice(c.o,c.k==="style"?(cfg.style||"light"):cfg[c.k],v=>{ pushHist(); if(c.k==="style"){ cfg.style=v; Object.assign(cfg,STYLES[v]); if(cfg.handles!=="none") cfg.handles=["#c6a25a","#c9a45c","#b8925a"].includes(cfg.cHandle)?"gold":"black"; /* the style's handle color picks the handle finish */ build(); renderControls(); return; } cfg[c.k]=v; build(); renderControls(); },c.l);
      fieldRow(ctlEl,c.l,el); continue; }
    if(c.t==="action"){ if(!acts){ acts=document.createElement("div"); acts.className="ctl act1"; acts.style.flexDirection="column"; ctlEl.appendChild(acts); }
      const b=document.createElement("button"); b.className="btn wide"; b.textContent=c.l; b.onclick=c.fn; acts.appendChild(b); continue; }
    let el;
    if(c.t==="toggle"){ el=document.createElement("label"); el.className="sw"; const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!cfg[c.k]; cb.setAttribute("aria-label",c.l);
      cb.onchange=()=>{pushHist(); cfg[c.k]=cb.checked; build();}; el.append(cb,document.createElement("i")); }
    if(c.t==="color"){ el=document.createElement("input"); el.type="color"; el.value=cfg[c.k]; el.setAttribute("aria-label",c.l); el.addEventListener("click",pushHist); el.oninput=()=>{cfg[c.k]=el.value; build();}; }
    if(c.t==="num"){ el=document.createElement("label"); el.className="money"; const n=document.createElement("input"); n.type="text"; n.inputMode="decimal"; n.autocomplete="off"; n.placeholder="0"; n.value=cfg[c.k]||""; n.setAttribute("aria-label",c.l);
      n.onchange=()=>{ const v=n.value.trim()===""?0:parseNum(n.value,"جنيه",true); if(isNaN(v)){ n.value=cfg[c.k]||""; return; } pushHist(); cfg[c.k]=Math.max(0,v); renderControls(); }; const u=document.createElement("small"); u.textContent="جنيه"; el.append(n,u); }
    const row=fieldRow(ctlEl,c.l,el); if(c.t==="toggle") row.querySelector("label").onclick=()=>el.querySelector("input").click();
  }
  if(SCHEMA[tab].some(c=>c.t==="num"&&PRICE_KEYS.includes(c.k))) priceDefBox();
  if(tab==="مقاسات الأجهزة"){ const n=document.createElement("div"); n.className="note"; n.textContent="المقاس = العرض × العمق. المسافات الجانبية بتتساب فاضية للتهوية والمواسير والسلوك، وبتتحسب من طول الرخامة."; ctlEl.insertBefore(n,ctlEl.firstChild); }
  if(tab==="الوحدات"){ customBox(); unitsBox(); }
  if(tab==="➕ أجهزة") appsBox();
  if(tab==="خطوات التنفيذ") stepsBox();
  if(tab==="الأوضة") roomBox();
  if(tab==="الحمام") bathBox();
  if(tab==="السقف") ceilBox();
  if(tab==="الأثاث") furnBox();
  if(tab==="الدهان والأرضية") roomFinishBox();
  if(tab==="التشطيب") finishBox();
  if(tab==="الأجهزة") placeBox();
  if(tab==="التخزين") wallsBox();
  if(tab==="المشاريع") projectsBox();
  if(tab==="المية والكهربا"){ const n=document.createElement("div"); n.className="note"; n.textContent="المخارج الموجودة متحددة تقريبًا من الصور، قيسها بالمتر وعدّلها. النقط الملونة هي اللي محتاجها التصميم: أزرق مية، كحلي صرف، برتقالي كهربا، أصفر غاز. الرمادي هو الموجود دلوقتي.";
    ctlEl.insertBefore(n,ctlEl.firstChild);
    const cnt=k=>POINTS.filter(p=>p.type===k).length; const d=document.createElement("div"); d.className="sum";
    const ws=(STATS.warn||[]).filter(w=>/تمديد|بعيدة/.test(w));
    d.innerHTML=`🔌 ${cnt("socket")} بريزة • 💧 ${cnt("water")} تغذية مية • 🕳 ${cnt("drain")} صرف • 🔥 ${cnt("gas")} غاز`+(ws.length?`<hr>${ws.join("<br>")}`:`<hr>كل الأجهزة قريبة من المخارج الموجودة ✓`);
    ctlEl.appendChild(d); waterBox(); }
  if(tab==="التكلفة") ctlEl.appendChild(costBox());


}
const DETACHABLE=new Set(["base","upper","tall","shelf"]);
function unitToCustom(u){ // a plain box-shaped auto unit -> an independent, freely editable cfg.custom item with the same footprint
  const type=u.kind==="base"?"lower":u.kind, valid=(FRONTS[type==="lower"?"base":type]||[]).map(([v])=>v);
  const front=type==="shelf"?"open":(valid.includes(u.front)?u.front:"auto");
  return {id:"c"+Math.random().toString(36).slice(2,7),type,wall:u.wall,pos:Math.round(u.a0*100),w:Math.round((u.a1-u.a0)*100),d:Math.round(u.depth*100),
    h:type==="lower"?90:Math.round((u.y1-u.y0)*100),y:Math.round(u.y0*100),front,n:"",shelves:3,acc:u.acc||""};
}
function detachUnit(u){ const c=unitToCustom(u);
  if(u.movable&&u.movable.obj==="custom") cfg.custom=cfg.custom.filter(x=>x.id!==u.movable.id);
  else cfg.hiddenUnits=[...(cfg.hiddenUnits||[]),u.id];
  cfg.custom=[...(cfg.custom||[]),c]; return c.id; }
function splitUnit(u){ const base=unitToCustom(u), w1=Math.max(15,Math.floor(base.w/2)), w2=Math.max(15,base.w-w1);
  const c1={...base,id:"c"+Math.random().toString(36).slice(2,7),w:w1}, c2={...base,id:"c"+Math.random().toString(36).slice(2,7),pos:base.pos+w1,w:w2};
  if(u.movable&&u.movable.obj==="custom") cfg.custom=cfg.custom.filter(x=>x.id!==u.movable.id);
  else cfg.hiddenUnits=[...(cfg.hiddenUnits||[]),u.id];
  cfg.custom=[...(cfg.custom||[]),c1,c2]; return c1.id; }
function unitsBox(){
  const n=document.createElement("div"); n.className="note"; n.textContent="دوس على أي دولاب في الـ3D وهيتحدد هنا، أو اختار من القايمة. غيّر نوع الواجهة لكل وحدة لوحدها. 🗑 بتشيل الوحدة (مكانها هيفضل فاضي)، ✏️ بتفصلها عشان تعدل مقاسها وشكلها لوحدها، ➗ بتقسمها لوحدتين جنب بعض.";
  ctlEl.appendChild(n);
  let lastWall=null;
  for(const u of UNITS){
    if(u.wall!==lastWall){ const h=document.createElement("div"); h.className="head"; h.textContent=WALLS[u.wall].name; ctlEl.appendChild(h); lastWall=u.wall; }
    const r=document.createElement("div"); r.className="urow"+(u.id===SEL?" sel":""); r.dataset.uid=u.id;
    const w=Math.round((u.a1-u.a0)*100), hh=Math.round((u.y1-u.y0)*100);
    r.innerHTML=`<span class="n">${u.n}</span><span class="t">${u.label||KN[u.kind]||u.kind}<small>عرض ${w} • ارتفاع ${hh} • عمق ${Math.round(u.depth*100)} سم</small></span>`;
    r.querySelector(".t").onclick=()=>{ selectUnit(u.id,false); renderControls(); const rr=ctlEl.querySelector(`[data-uid="${u.id}"]`); if(rr) rr.scrollIntoView({block:"nearest"}); };
    if(CABK.has(u.kind)&&!cfg.openCab){ const ob=document.createElement("button"); ob.className="btn"+(OPENSET.has(u.id)?" on":""); ob.textContent="🚪"; ob.setAttribute("aria-label","افتح الدولاب"); ob.onclick=()=>{ OPENSET.has(u.id)?OPENSET.delete(u.id):OPENSET.add(u.id); SEL=u.id; build(); renderControls(); }; r.appendChild(ob); }
    const customEntry=u.movable&&u.movable.obj==="custom"?(cfg.custom||[]).find(x=>x.id===u.movable.id):null, isCorner45=customEntry&&["corner45","cornerCut","cornerRound"].includes(customEntry.shape);
    const opts=isCorner45?null:FRONTS[u.kind];
    if(opts){ const sel=document.createElement("select"); for(const [v,t] of opts){ const o=document.createElement("option"); o.value=v; o.textContent=t; sel.appendChild(o); }
        const cur=cfg.units[u.id]; sel.value=(typeof cur==="string"?cur:(cur&&cur.front))||(u.kind==="sink"?"doors":"auto");
      sel.onchange=()=>{ pushHist(); setUnitOpt(u.id,{front:sel.value}); SEL=u.id; build(); };
      r.appendChild(sel);
      if(u.id===SEL && !u.movable){ const det=document.createElement("div"); det.className="det"; const o=unitOpt(u.id);
        const mk=(opts,val,fn,lab)=>{ const s2=document.createElement("select"); s2.setAttribute("aria-label",lab); for(const [v,t] of opts){ const oo=document.createElement("option"); oo.value=v; oo.textContent=t; s2.appendChild(oo);} s2.value=val; s2.onchange=()=>{ pushHist(); fn(s2.value); build(); renderControls(); }; det.appendChild(s2); };
        mk([["","العدد: تلقائي"],["1","ضلفة/درج واحد"],["2","2"],["3","3"],["4","4"]],o.n||"",v=>setUnitOpt(u.id,{n:v}),"العدد");
        mk([["","الرفوف: تلقائي"],["1","رف 1"],["2","2 رف"],["3","3 رفوف"],["4","4 رفوف"],["5","5 رفوف"]],o.shelves||"",v=>setUnitOpt(u.id,{shelves:v}),"الرفوف");
        mk(ACCS.map(([k,t])=>[k,k?t:"إكسسوار: من غير"]),o.acc||"",v=>setUnitOpt(u.id,{acc:v}),"إكسسوار");
        r.appendChild(det); } }
    const acts=document.createElement("div"); acts.className="uacts";
    const del=document.createElement("button"); del.className="btn danger"; del.textContent="🗑"; del.setAttribute("aria-label","احذف الوحدة");
    del.onclick=()=>{ pushHist();
      if(u.movable&&u.movable.obj==="apps") cfg.apps=cfg.apps.filter(x=>x.id!==u.movable.id);
      else if(u.movable&&u.movable.obj==="custom") cfg.custom=cfg.custom.filter(x=>x.id!==u.movable.id);
      else cfg.hiddenUnits=[...(cfg.hiddenUnits||[]),u.id];
      if(SEL===u.id) SEL=null; build(); renderControls(); hint("اتشالت الوحدة ✓"); };
    acts.appendChild(del);
    if(DETACHABLE.has(u.kind)&&!u.movable){ const ed=document.createElement("button"); ed.className="btn"; ed.textContent="✏️ تعديل حر"; ed.setAttribute("aria-label","افصل الوحدة وعدّلها لوحدها");
      ed.onclick=()=>{ pushHist(); const id=detachUnit(u); SEL=id; OPENC.add(id); build(); renderControls(); hint("بقت وحدة مستقلة، عدّلها من كارت الوحدات الإضافية ✓"); }; acts.appendChild(ed); }
    if(DETACHABLE.has(u.kind)&&!isCorner45){ const sp=document.createElement("button"); sp.className="btn"; sp.textContent="➗ قسّم"; sp.setAttribute("aria-label","قسم الوحدة لوحدتين");
      sp.onclick=()=>{ pushHist(); const id=splitUnit(u); SEL=id; build(); renderControls(); hint("اتقسمت لوحدتين ✓"); }; acts.appendChild(sp); }
    r.appendChild(acts);
    ctlEl.appendChild(r);
  }
  const b=document.createElement("button"); b.className="btn"; b.style.marginTop="10px"; b.textContent="رجّع كل الوحدات تلقائي";
  b.onclick=()=>{ pushHist(); cfg.units={}; build(); }; ctlEl.appendChild(b);
  if((cfg.hiddenUnits||[]).length){ const rb=document.createElement("button"); rb.className="btn"; rb.style.marginTop="8px"; rb.textContent="↩️ رجّع كل الوحدات المحذوفة";
    rb.onclick=()=>{ pushHist(); cfg.hiddenUnits=[]; build(); renderControls(); }; ctlEl.appendChild(rb); }
}
function fieldRow(parent,label,el,out){ const row=document.createElement("div"); row.className="ctl"+(el.kind==="stack"?" stack":""); const lb=document.createElement("label"); lb.textContent=label; row.appendChild(lb); row.appendChild(el); if(out) row.appendChild(out); parent.appendChild(row); return row; }
// one picker for every option list: a switch for yes/no, segmented buttons for a few short options, a dropdown otherwise
function choice(opts,val,onPick,label){ val=val==null?"":String(val);
  const yes=opts.length===2&&opts.find(([,t])=>/^أيوه/.test(t)), no=opts.length===2&&opts.find(([,t])=>/^لأ/.test(t));
  if(yes&&no){ const w=document.createElement("label"); w.className="sw"; const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=val===String(yes[0]); if(label) cb.setAttribute("aria-label",label);
    cb.onchange=()=>onPick(String(cb.checked?yes[0]:no[0])); w.append(cb,document.createElement("i")); w.kind="inline"; return w; }
  const tot=opts.reduce((s,[,t])=>s+String(t).length,0);
  if(opts.length>=2&&opts.length<=4&&opts.every(([,t])=>String(t).length<=16)&&tot<=40){ const g=document.createElement("div"); g.className="seg"; g.setAttribute("role","radiogroup"); if(label) g.setAttribute("aria-label",label);
    for(const [v,t] of opts){ const b=document.createElement("button"); b.type="button"; b.textContent=t; b.setAttribute("role","radio"); b.setAttribute("aria-checked",String(v)===val); if(String(v)===val) b.className="on";
      b.onclick=()=>{ if(String(v)===val) return; val=String(v); g.querySelectorAll("button").forEach(x=>{ const on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-checked",on); }); onPick(val); }; g.appendChild(b); }
    g.kind=opts.length<=2&&tot<=14?"inline":"stack"; return g; }
  const el=document.createElement("select"); for(const [v,t] of opts){ const o=document.createElement("option"); o.value=v; o.textContent=t; el.appendChild(o); } el.value=val; if(label) el.setAttribute("aria-label",label);
  el.onchange=()=>onPick(el.value); el.kind="inline"; return el; }
function objSelect(parent,obj,k,label,opts,after){ fieldRow(parent,label,choice(opts,obj[k],v=>{ pushHist(); obj[k]=v; if(after) after(); build(); UI_REFRESH(); },label)); }
// number box with −/+ ; onLive (optional) = change without re-rendering the panel, which lets a held button repeat
function numIn(val,min,max,unit,onSet,step,onLive,label,onEnd){ step=step||1; const w=document.createElement("span"); w.className="numw"; const n=document.createElement("input"); n.type="text"; n.inputMode="decimal"; n.autocomplete="off"; n.spellcheck=false; n.className="num"; n.value=val; if(label) n.setAttribute("aria-label",label);
  /* text, not type=number, so Arabic digits, "٫" and units like "2.5م" can be typed; cur = the last value that was set */
  let cur=+val||0; const now=()=>{ const v=parseNum(n.value,unit); return isNaN(v)?cur:v; };
  const u=document.createElement("small"); u.textContent=unit||""; n.onchange=()=>{ let v=parseNum(n.value,unit); if(isNaN(v)){ n.value=cur; return; } v=Math.max(min,Math.min(max,v)); n.value=cur=v; onSet(v); };
  n.onkeydown=e=>{ if(e.key==="Enter") n.blur(); else if(e.key==="ArrowUp"||e.key==="ArrowDown"){ e.preventDefault(); (e.key==="ArrowUp"?bp:bm).click(); } };
  const mk=(d,ic,lab)=>{ const b=document.createElement("button"); b.type="button"; b.className="stb"; b.innerHTML=ico(ic,16); b.setAttribute("aria-label",lab+(label?" "+label:"")); let t0=null, t=null;
    const next=()=>+Math.max(min,Math.min(max,now()+d*step)).toFixed(3), moves=()=>next()!==now(); /* no undo step when + is pressed at the max (or − at the min) */
    const once=()=>{ const v=next(); if(v===now()) return; if(onLive) onLive(v); else { n.value=cur=v; onSet(v); } };
    const stop=()=>{ const held=t0||t; clearTimeout(t0); clearInterval(t); t0=t=null; if(held&&onEnd) onEnd(); };
    b.addEventListener("pointerdown",e=>{ if(e.button) return; e.preventDefault(); if(onLive){ if(!moves()) return; pushHist(); LIVE_HELD=true; once(); t0=setTimeout(()=>{ t=setInterval(once,70); },400); } else once(); });
    for(const ev of ["pointerup","pointerleave","pointercancel"]) b.addEventListener(ev,stop);
    b.addEventListener("click",e=>{ if(e.detail===0){ if(onLive&&moves()) pushHist(); once(); if(onEnd) onEnd(); } }); // keyboard Enter/Space
    return b; };
  const bm=mk(-1,"minus","قلّل"), bp=mk(1,"plus","زوّد"); w.append(bm,n,u,bp); w.set=v=>{ n.value=cur=v; }; return w; }
// live changes (slider drag, held −/+): at most one light build per frame, run by the render loop just before it draws (SLIDING skips the panel refresh);
// when the finger lifts (or after a pause, for the keyboard) one full build brings back the panel and the rest
let LIVE=false, LIVE_SINCE=false, LIVE_HELD=false, liveT=null;
function liveBuild(){ LIVE=LIVE_SINCE=true; poke(); clearTimeout(liveT); if(!LIVE_HELD) liveT=setTimeout(settleBuild,400); }
function liveEnd(){ LIVE_HELD=false; clearTimeout(liveT); liveT=setTimeout(settleBuild,150); }
for(const ev of ["pointerup","pointercancel"]) addEventListener(ev,()=>{ if(LIVE_HELD) liveEnd(); },{capture:true,passive:true}); /* a mouse let go outside the slider */
function flushLive(){ if(!LIVE) return; LIVE=false; renderer.shadowMap.autoUpdate=false; /* shadows stay as they were until the motion ends */ SLIDING=true; try{ build(); } finally{ SLIDING=false; } }
function settleBuild(){ clearTimeout(liveT); liveT=null; LIVE=false; renderer.shadowMap.autoUpdate=true; if(!LIVE_SINCE||LIVE_HELD) return; LIVE_SINCE=false;
  const a=document.activeElement, lab=a&&a.getAttribute&&a.getAttribute("aria-label"), tp=a&&a.type; build();
  if(a&&lab&&!a.isConnected) for(const e of document.querySelectorAll("[aria-label]")) if(e.getAttribute("aria-label")===lab&&e.type===tp&&e.offsetParent){ e.focus({preventScroll:true}); break; } } /* the panel may have been redrawn: keep keyboard focus on the same control */
// a measurement: label + stepper on the first line, a full-width slider under it
function rangeField(parent,label,get,set,min,max,step,unit,commit){ step=step||1;
  const row=document.createElement("div"); row.className="ctl rng"; const lb=document.createElement("label"); lb.textContent=label;
  const sl=document.createElement("input"); sl.type="range"; sl.min=min; sl.max=max; sl.step=step; sl.value=+get(); sl.setAttribute("aria-label",label);
  const fill=()=>sl.style.setProperty("--p",Math.max(0,Math.min(100,(+sl.value-min)/((max-min)||1)*100))+"%");
  const live=v=>{ set(v); sl.value=v; out.set(v); fill(); liveBuild(); };
  const out=numIn(get(),min,max,unit,v=>{ pushHist(); set(v); sl.value=v; fill(); LIVE=false; build(); commit(); },step,live,label,liveEnd);
  sl.addEventListener("pointerdown",()=>{ pushHist(); LIVE_HELD=true; }); sl.addEventListener("keydown",pushHist); sl.oninput=()=>live(+sl.value); fill();
  for(const ev of ["pointerup","pointercancel","change"]) sl.addEventListener(ev,liveEnd);
  row.append(lb,out,sl); parent.appendChild(row); return row; }
function objRange(parent,obj,k,label,min,max,step){ if(obj[k]==null) obj[k]=min; rangeField(parent,label,()=>obj[k],v=>{ obj[k]=v; },min,Math.max(min+1,max),step||1,"سم",()=>UI_REFRESH()); }
// cards for added items fold to one line; the ones you just added or picked in 3D stay open
const OPENC=new Set();
function foldCard(card,hd,key){ card.dataset.key=key; const open=OPENC.has(key); card.classList.toggle("closed",!open);
  const t=document.createElement("button"); t.type="button"; t.className="fold"; t.innerHTML=ico("chev",18); t.setAttribute("aria-label","افتح أو اقفل التفاصيل"); t.setAttribute("aria-expanded",open);
  hd.addEventListener("click",e=>{ if(e.target.closest("button:not(.fold),select,input")) return; const o=!OPENC.has(key); o?OPENC.add(key):OPENC.delete(key); card.classList.toggle("closed",!o); t.setAttribute("aria-expanded",o); });
  hd.prepend(t); }
const shortWall=w=>String(WNAME[w]||(WALLS[w]&&WALLS[w].name)||w).replace(/^الحيطة /,"");
const WALLOPT_SHORT=()=>W4.map(w=>[w,shortWall(w)]);
// quick-add bar: pick the wall once, then one tap per item
const ADDW={};
function chipAdder(parent,id,items,onAdd,defWall,title){ const box=document.createElement("div"); box.className="adder";
  if(defWall){ if(!ADDW[id]) ADDW[id]=defWall; const l=document.createElement("div"); l.className="adder-l"; l.textContent=title||"هيتضاف على الحيطة:"; box.appendChild(l);
    const s=choice(WALLOPT_SHORT(),ADDW[id],v=>{ ADDW[id]=v; },"الحيطة"); box.appendChild(s); }
  else if(title){ const l=document.createElement("div"); l.className="adder-l"; l.textContent=title; box.appendChild(l); }
  const ch=document.createElement("div"); ch.className="chips";
  for(const [k,t] of items){ const b=document.createElement("button"); b.type="button"; b.className="chipbtn"; b.innerHTML=ico("plus",16)+`<span>${t}</span>`; b.onclick=()=>onAdd(k,ADDW[id]); ch.appendChild(b); }
  box.appendChild(ch); parent.appendChild(box); return box; }
function appsBox(){
  const n=document.createElement("div"); n.className="note"; n.textContent="ضيف أي جهاز تاني وحدد مكانه ومقاسه. الأجهزة اللي على الحيطة الشمال بتدخل في ترتيبها، وكل الأجهزة تقدر تسحبها بصباعك في الـ3D.";
  ctlEl.appendChild(n);
  chipAdder(ctlEl,"apps",Object.entries(APPS).map(([k,v])=>[k,v.n]),k=>{ pushHist(); const T=APPS[k], id="a"+Math.random().toString(36).slice(2,7);
    const lo=locOpts(T.cls), loc=T.cls==="wall"?"RT":(lo[0]?lo[0][0]:"L"); const pos=Math.max(0,Math.round((wlen(W4.includes(loc)?loc:"L")*100-T.w)/2));
    cfg.apps=[...(cfg.apps||[]),{id,type:k,w:T.w,d:T.d,h:T.h,y:T.y||0,loc,pos}]; OPENC.add(id); build(); renderControls(); hint(`اتضاف ${T.n} ✓`); },null,"دوس على الجهاز عشان تضيفه:");
  for(const a of cfg.apps||[]){ const T=APPS[a.type]; if(!T) continue; const card=document.createElement("div"); card.className="card";
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${T.n}</b><small>${a.w}×${a.d}×${a.h}</small>`; const del=document.createElement("button"); del.className="btn danger"; del.textContent="🗑 شيل";
    del.onclick=()=>{ pushHist(); cfg.apps=cfg.apps.filter(x=>x.id!==a.id); build(); renderControls(); }; hd.appendChild(del); card.appendChild(hd); foldCard(card,hd,a.id);
    objSelect(card,a,"loc","المكان",locOpts(T.cls));
    const inRun=(T.cls==="slot"||T.cls==="tall")&&((cfg.wallCfg[a.loc]||{}).type==="counter"||String(a.loc).startsWith("N:"));
    if(inRun){ const nn=document.createElement("div"); nn.className="note"; nn.textContent="مكانه بيتحدد من ترتيب الأجهزة على الحيطة. اسحبه بصباعك في الـ3D عشان تغيّر ترتيبه."; card.appendChild(nn); }
    else objRange(card,a,"pos","بعده عن الركن",0,Math.round(wallLen(a.loc)*100)-a.w,1);
    objRange(card,a,"w","العرض",15,200,1); objRange(card,a,"d","العمق",5,90,1);
    objRange(card,a,"h","الارتفاع",10,Math.round(H*100),1);
    if(T.cls==="wall") objRange(card,a,"y","ارتفاعه من الأرض",20,Math.round(H*100)-a.h,1);
    ctlEl.appendChild(card); }
}
function customBox(){
  const h=document.createElement("div"); h.className="head"; h.textContent="➕ وحدات تخزين إضافية"; ctlEl.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="ضيف دولاب أو أرفف في أي حيطة بالمقاس اللي عايزه. لو عايز تصمم الحيطة اليمين كلها بنفسك، خليها 'فاضية' من تاب التخزين. تقدر تسحب أي وحدة بصباعك.";
  ctlEl.appendChild(n);
  chipAdder(ctlEl,"custom",[["lower","دولاب سفلي برخامة"],["upper","دولاب علوي"],["tall","دولاب طول من الأرض"],["shelf","أرفف مفتوحة"]],(t,wall)=>{ pushHist(); const id="c"+Math.random().toString(36).slice(2,7);
    const c={id,type:t,wall:wall||"RT",pos:Math.max(0,Math.min(100,Math.round(wallLen(wall||"RT")*100)-60)),w:60,d:t==="shelf"?25:t==="upper"?35:(t==="tall"?40:35),h:t==="tall"?Math.round(H*100)-1:t==="upper"?72:90,y:t==="upper"?cfg.uStart:130,front:t==="shelf"?"open":(t==="tall"?"auto":"doors"),n:"",shelves:3,acc:""};
    cfg.custom=[...(cfg.custom||[]),c]; SEL=id; OPENC.add(id); build(); renderControls(); hint("اتضافت الوحدة ✓"); },"RT");
  const TN={lower:"دولاب سفلي",upper:"دولاب علوي",tall:"دولاب طول",shelf:"أرفف مفتوحة"};
  for(const c of cfg.custom||[]){ const u=UNITS.find(x=>x.id===c.id); const card=document.createElement("div"); card.className="card"+(c.id===SEL?" sel":"");
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<span class="n">${u?u.n:"?"}</span><b>${TN[c.type]}</b><small>${shortWall(c.wall)} • ${c.w} سم</small>`;
    const del=document.createElement("button"); del.className="btn danger"; del.textContent="🗑 شيل"; del.onclick=()=>{ pushHist(); cfg.custom=cfg.custom.filter(x=>x.id!==c.id); build(); renderControls(); };
    hd.appendChild(del);
    if(c.shape==="corner45"){ c.shape="cornerCut"; if(c.cutA==null) c.cutA=c.cutSize||30; if(c.cutD==null) c.cutD=c.cutSize||30; } // one-time upgrade from the old fixed-45° field
    const isCornerShape=c.shape==="cornerCut"||c.shape==="cornerRound";
    if(u&&!isCornerShape){ const sp=document.createElement("button"); sp.className="btn"; sp.textContent="➗"; sp.setAttribute("aria-label","قسم الوحدة لوحدتين");
      sp.onclick=e=>{ e.stopPropagation(); pushHist(); const id=splitUnit(u); SEL=id; build(); renderControls(); hint("اتقسمت لوحدتين ✓"); }; hd.appendChild(sp); }
    hd.onclick=e=>{ if(!e.target.closest("button")) selectUnit(c.id,false); }; card.appendChild(hd); foldCard(card,hd,c.id);
    objSelect(card,c,"wall","الحيطة",W4OPT());
    objRange(card,c,"pos","بعدها عن الركن",0,Math.round(wallLen(c.wall)*100)-c.w,1);
    objRange(card,c,"w","العرض",15,250,1); objRange(card,c,"d","العمق",10,70,1);
    if(c.type!=="lower") objRange(card,c,"h","الارتفاع",15,Math.round(H*100),1);
    if(c.type==="upper"||c.type==="shelf") objRange(card,c,"y","بتبدأ من ارتفاع",20,Math.round(H*100)-20,1);
    if(c.type==="lower"||c.type==="tall") objSelect(card,c,"shape","الشكل",[["rect","مستطيل عادي"],["cornerCut","ركن مقطوع (أي زاوية)"],["cornerRound","ركن دائري (زاوية مدورة)"]]);
    if(isCornerShape){ if(!c.cutSide) c.cutSide="a1";
      objSelect(card,c,"cutSide","الجنب اللي بيتقطع",[["a1","الآخر (بعيد عن أول الحيطة)"],["a0","الأول (قريب من أول الحيطة)"]]);
      if(c.shape==="cornerRound"){ if(!c.bulge) c.bulge="in"; objSelect(card,c,"bulge","اتجاه الدورة",[["in","لجوه (مقصوص)"],["out","لبرة (بارز)"]]); }
      const bulgeOut=c.shape==="cornerRound"&&c.bulge==="out";
      objRange(card,c,"cutA","المقطوع من العرض",10,bulgeOut?60:Math.max(11,c.w-20),1);
      objRange(card,c,"cutD","المقطوع من العمق",10,bulgeOut?60:Math.max(11,c.d-10),1);
      const cn=document.createElement("div"); cn.className="note";
      cn.textContent=bulgeOut?"الركن هيبرز لبرة عن مقاس الوحدة العادي، زي كرسي/ركنة دائرية طالعة.":c.shape==="cornerRound"?"واجهة الوحدة هتتدوّر من الركن ده. زوّد الفرق بين 'من العرض' و'من العمق' عشان الدورة تبقى بيضاوي مش نص دايرة.":"واجهة الوحدة هتتقطع بخط مايل من الركن ده. خلّي 'من العرض' و'من العمق' متساويين عشان الزاوية تطلع بالظبط 45°، أو فرّق بينهم لزاوية تانية.";
      card.appendChild(cn);
    } else {
      if(c.type!=="shelf"){ objSelect(card,c,"front","الواجهة",(c.type==="lower"?FRONTS.base:c.type==="upper"?FRONTS.upper:FRONTS.tall));
        objSelect(card,c,"n","عدد الضلف / الأدراج",[["","تلقائي"],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"]]); }
      if(c.type==="shelf"||c.front==="open") objSelect(card,c,"shelves","عدد الرفوف",[["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"]]);
      objSelect(card,c,"acc","إكسسوار",ACCS);
    }
    ctlEl.appendChild(card); }
  const h2=document.createElement("div"); h2.className="head"; h2.textContent="🗄 كل الوحدات"; ctlEl.appendChild(h2);
}
// ======== room / walls / placement editors ========
var WIZ=null;
let UI_REFRESH=()=>renderControls();
const FT={cut:"قص ركن (أوضة L / حيطة مايلة)",railing:"سور بلكونة (مفتوح لبرة)",window:"شباك",door:"باب",opening:"فتحة من غير باب",column:"كتف / عمود / بروز",shaft:"ماسورة صاعدة (شفت)",stack:"عمود صرف 4 بوصة",beam:"كمرة في السقف",niche:"تجويف في الحيطة",corridor:"فجوة برة جنب الباب"};
const WTYPE=[["counter","دواليب ورخامة (للأجهزة)"],["shallow","دواليب ضحلة برخامة"],["pantry","دولاب طول للسقف"],["shelves","أرفف مفتوحة"],["bar","بار فطار"],["none","فاضية"]];
const W4OPT=()=>W4.map(w=>[w,WNAME[w]]);
const measLen=w=>(w==="W"||w==="D")?cfg.roomW:cfg.roomL;
function defFeat(type,wall){
  const L=measLen(wall), id=type[0]+Math.random().toString(36).slice(2,6);
  const d={window:{w:80,y:100,h:120},door:{w:80,y:0,h:210,d:cfg.roomType==="bath"?75:45},opening:{w:100,y:0,h:210,d:45},column:{w:40,d:30},shaft:{w:25,d:25},stack:{w:15,d:15},railing:{w:L,h:110,y:0},cut:{w:10},beam:{w:L,h:40,d:25},niche:{w:80,d:60,y:0,h:0,use:"none"},corridor:{w:80,d:90,use:"none",water:false}}[type];
  return {id,type,wall,pos:type==="beam"?0:Math.max(0,Math.round((L-d.w)/2)),y:0,h:0,d:0,...d};
}
function featCard(parent,f,onDel){
  const card=document.createElement("div"); card.className="card";
  if(f.type==="cut"){ if(f.a==null){ f.a=Math.round(cfg.roomW*0.4); f.b=Math.round(cfg.roomL*0.4); f.corner=f.corner||"WL"; f.shape=f.shape||"rect"; }
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${FT.cut}</b>`; const del=document.createElement("button"); del.className="btn danger"; del.textContent="🗑 شيل"; del.onclick=onDel; hd.appendChild(del); card.appendChild(hd); foldCard(card,hd,f.id);
    objSelect(card,f,"corner","أنهي ركن",[["WL","القدامي الشمال"],["WR","القدامي اليمين"],["DL","اللي ورا الشمال"],["DR","اللي ورا اليمين"]]);
    objSelect(card,f,"shape","الشكل",[["rect","ركن مقصوص (الأوضة L)"],["diag","حيطة مايلة (ركن مشطوف)"]]);
    objRange(card,f,"a","المقصوص من العرض",20,Math.max(21,cfg.roomW-40),1); objRange(card,f,"b","المقصوص من الطول",20,Math.max(21,cfg.roomL-40),1);
    const n=document.createElement("div"); n.className="note"; n.textContent="الجزء ده بيبقى برة الأوضة: مفيش فيه أرضية ولا دواليب ولا أثاث، والحيطان بتلف حواليه."; card.appendChild(n); parent.appendChild(card); return; }
  const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${FT[f.type]}</b><small>${shortWall(f.wall)} • ${f.w} سم</small>`;
  const del=document.createElement("button"); del.className="btn danger"; del.textContent="🗑 شيل"; del.onclick=onDel; hd.appendChild(del); card.appendChild(hd); foldCard(card,hd,f.id);
  objSelect(card,f,"wall","على أنهي حيطة",W4OPT());
  const L=measLen(f.wall);
  objRange(card,f,"pos","بعده عن أول الحيطة",0,Math.max(1,L-(f.w||0)),1);
  objRange(card,f,"w",f.type==="beam"?"طولها":"العرض",5,L,1);
  if(f.type==="railing") objRange(card,f,"h","ارتفاع السور",80,130,1);
  if(f.type==="window"){ objRange(card,f,"y","ارتفاع الجلسة من الأرض",0,250,1); objRange(card,f,"h","ارتفاع الشباك",20,250,1); }
  if(f.type==="door"||f.type==="opening"){ objRange(card,f,"h","الارتفاع",150,260,1); objRange(card,f,"d","مساحة فاضية قدامه",0,120,1); }
  if(f.type==="column"||(f.type==="shaft"||f.type==="stack")) objRange(card,f,"d","بارز قد إيه من الحيطة",2,150,1);
  if(f.type==="door"&&cfg.roomType==="bath"){ const n=document.createElement("div"); n.className="note"; n.textContent="المساحة قدام الباب = قد عرض الباب لو بيفتح لجوه، أو 0 لو بيفتح لبرة."; card.appendChild(n); }
  if(f.type==="beam"){ objRange(card,f,"h","نازلة قد إيه من السقف",5,100,1); objRange(card,f,"d","عرضها من الحيطة",5,150,1); }
  if(f.type==="niche"){ objRange(card,f,"d","العمق",5,120,1); objRange(card,f,"y","بيبدأ من ارتفاع",0,200,1); objRange(card,f,"h","الارتفاع (0 = للسقف)",0,300,1); }
  if(f.type==="corridor") objRange(card,f,"d","العمق لبرة",30,150,1);
  if(f.type==="niche"||f.type==="corridor"){
    const id="N:"+f.id, cur=cfg.place.f===id?"fridge":cfg.place.w===id?"washer":(f.use||"none");
    const hold={v:cur};
    objSelect(card,hold,"v","جواها",[["fridge","التلاجة"],["washer","الغسالة"],["pantry","دولاب تخزين"],["shelves","أرفف"],["none","فاضي"]],()=>setNicheUse(f,hold.v));
    const tw={v:f.water?"1":""}; objSelect(card,tw,"v","فيها مخرج مية؟",[["","لأ"],["1","أيوه"]],()=>{ f.water=!!tw.v; });
  }
  parent.appendChild(card);
}
function firstCounter(){ return W4.find(w=>(cfg.wallCfg[w]||{}).type==="counter")||"L"; }
function setNicheUse(f,v){ const id="N:"+f.id;
  if(v==="fridge"){ cfg.place.f=id; if(cfg.place.w===id) cfg.place.w=firstCounter(); }
  else if(v==="washer"){ cfg.place.w=id; if(cfg.place.f===id) cfg.place.f=firstCounter(); }
  else { if(cfg.place.f===id) cfg.place.f=firstCounter(); if(cfg.place.w===id) cfg.place.w=firstCounter(); f.use=v; } }
function featuresEditor(parent,types){
  chipAdder(parent,"feat:"+types.join(),types.map(t=>[t,FT[t]]),(t,w)=>{ pushHist(); const f=defFeat(t,w); cfg.feats=[...(cfg.feats||[]),f]; OPENC.add(f.id); build(); UI_REFRESH(); hint(`اتضاف ${FT[t]} ✓`); },
    types.includes("door")?"D":types.includes("window")?"W":"L");
  for(const f of (cfg.feats||[]).filter(x=>types.includes(x.type))) featCard(parent,f,()=>{ pushHist(); cfg.feats=cfg.feats.filter(x=>x!==f); if(cfg.place.f==="N:"+f.id) cfg.place.f=firstCounter(); if(cfg.place.w==="N:"+f.id) cfg.place.w=firstCounter(); build(); UI_REFRESH(); });
}
// edit=true: the live plan in the room tab and the wizard (see bindPlan); the drawings document and print get the plain picture
function planSVG(edit){
  const S=Math.min(300/Math.max(RW,0.1),380/Math.max(RL,0.1),120), m=34, W=RW*S+2*m, Hh=RL*S+2*m+10, X=x=>m+x*S, Z=z=>m+z*S;
  let s=`<svg viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" font-family="Tahoma,Arial" font-size="11" ${edit?`class="pedit" data-s="${S}" data-m="${m}" `:""}style="width:100%;max-height:48vh;display:block"><rect x="${X(0)}" y="${Z(0)}" width="${RW*S}" height="${RL*S}" fill="#fff" stroke="#30343a" stroke-width="5"/>`;
  for(const u of [...UNITS].sort((a,b)=>(b.ft==="rug")-(a.ft==="rug"))){ if(u.y0>=1) continue; const hp=W4.includes(u.wall)||u.wall==="IS"||u.wall==="FR"; if(!hp&&!String(u.wall).startsWith("N:")) continue;
    let r; if(u.wall==="FR") r=unitRect(u); else if(W4.includes(u.wall)) r=rectAO(u.wall,u.a0,u.a1,0,u.depth); else { const fr=frameOf(u.wall); const dr=dirOf(u.f), b=u.back, e=u.back+u.depth*dr; r=alongZ(u.f)?{x0:Math.min(b,e),x1:Math.max(b,e),z0:u.a0,z1:u.a1}:{x0:u.a0,x1:u.a1,z0:Math.min(b,e),z1:Math.max(b,e)}; }
    s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*S}" height="${(r.z1-r.z0)*S}" fill="${UC[u.kind]||"#eee"}" stroke="#8a8f95" stroke-width="0.8"/>`; }
  for(const f of FEATS){ const L=f.wall;
    if(f.type==="window"){ const r=rectAO(L,f.a0,f.a1,-0.02,0.04); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${Math.max(3,(r.x1-r.x0)*S)}" height="${Math.max(3,(r.z1-r.z0)*S)}" fill="#6fb6e0"/>`; }
    if(f.type==="door"||f.type==="opening"){ const r=rectAO(L,f.a0,f.a1,-0.06,0.03); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${Math.max(4,(r.x1-r.x0)*S)}" height="${Math.max(4,(r.z1-r.z0)*S)}" fill="#fff"/>`;
      const [hx,hz]=aoToXZ(L,f.a1,0), [ex,ez]=aoToXZ(L,f.a1,f.a1-f.a0), [sx,sz]=aoToXZ(L,f.a0,0); if(f.type==="door") s+=`<path d="M${X(sx)} ${Z(sz)} A${(f.a1-f.a0)*S} ${(f.a1-f.a0)*S} 0 0 ${L==="W"||L==="RT"?1:0} ${X(ex)} ${Z(ez)} L${X(hx)} ${Z(hz)}" fill="none" stroke="#a9adb2" stroke-dasharray="3 2"/>`;
      const r2=rectAO(L,f.a0-0.03,f.a1+0.03,0,Math.max(0.05,f.dep)); s+=`<rect x="${X(r2.x0)}" y="${Z(r2.z0)}" width="${(r2.x1-r2.x0)*S}" height="${(r2.z1-r2.z0)*S}" fill="#e07b00" opacity="0.08"/>`; }
    if(f.type==="column"||(f.type==="shaft"||f.type==="stack")){ const r=rectAO(L,f.a0,f.a1,0,f.dep); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*S}" height="${(r.z1-r.z0)*S}" fill="#b9b3a8" stroke="#30343a"/>`; }
    if(f.type==="beam"){ const r=rectAO(L,f.a0,f.a1,0,f.dep); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*S}" height="${(r.z1-r.z0)*S}" fill="none" stroke="#8a5a2b" stroke-dasharray="4 3"/>`; }
    if(f.type==="niche"){ const r=rectAO(L,f.a0,f.a1,0,-f.dep); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*S}" height="${(r.z1-r.z0)*S}" fill="#f3efe6" stroke="#30343a" stroke-dasharray="3 2"/>`; }
    if(f.type==="corridor"){ const r=rectAO(L,f.a0,f.a1,-0.1,-0.1-f.dep); s+=`<rect x="${X(r.x0)}" y="${Z(r.z0)}" width="${(r.x1-r.x0)*S}" height="${(r.z1-r.z0)*S}" fill="#f3efe6" stroke="#30343a" stroke-dasharray="3 2"/><text x="${X((r.x0+r.x1)/2)}" y="${Z((r.z0+r.z1)/2)+4}" text-anchor="middle" font-size="9" fill="#555">برة</text>`; }
  }
  for(const k of CUTS){ const cx=k.c[1]==="L"?0:RW, cz=k.c[0]==="W"?0:RL; const pts=k.diag?[[cx,cz],[k.c[1]==="L"?k.a:RW-k.a,cz],[cx,k.c[0]==="W"?k.b:RL-k.b]]:[[k.x0,k.z0],[k.x1,k.z0],[k.x1,k.z1],[k.x0,k.z1]]; s+=`<polygon points="${pts.map(([x,z])=>X(x)+","+Z(z)).join(" ")}" fill="#e9ecef" stroke="#30343a" stroke-width="4"/><text x="${X((k.x0+k.x1)/2)}" y="${Z((k.z0+k.z1)/2)+4}" text-anchor="middle" font-size="9" fill="#888">برة</text>`; }
  if(cfg.roomType==="bath"&&BATH_DRAIN) s+=`<circle cx="${X(BATH_DRAIN[0])}" cy="${Z(BATH_DRAIN[1])}" r="5" fill="#1b3a5c"/><text x="${X(BATH_DRAIN[0])}" y="${Z(BATH_DRAIN[1])+15}" text-anchor="middle" font-size="9" fill="#1b3a5c">صفاية</text>`;
  if(TRI&&cfg.roomType!=="bath"){ const P=TRI.P; s+=`<polygon points="${["s","t","f"].map(k=>X(P[k][0])+","+Z(P[k][1])).join(" ")}" fill="#e07b00" fill-opacity="0.08" stroke="#e07b00" stroke-width="1.5" stroke-dasharray="5 3"/>`; for(const [k,n] of [["s","حوض"],["t","بوتاجاز"],["f","تلاجة"]]) s+=`<circle cx="${X(P[k][0])}" cy="${Z(P[k][1])}" r="4" fill="#e07b00"/><text x="${X(P[k][0])}" y="${Z(P[k][1])-7}" text-anchor="middle" font-size="9" fill="#a35400">${n}</text>`; }
  if(cfg.island.on){ const iw=cfg.island.w/100, idp=cfg.island.d/100, cx=RW/2, cz=cfg.island.pos/100; s+=`<rect x="${X(cx-idp/2)}" y="${Z(cz-iw/2)}" width="${idp*S}" height="${iw*S}" fill="#ece7dc" stroke="#555"/>`; }
  s+=`<text x="${X(RW/2)}" y="${Z(0)-12}" text-anchor="middle" fill="#2d5f7a">القدامية • ${Math.round(RW*100)} سم</text><text x="${X(RW/2)}" y="${Z(RL)+22}" text-anchor="middle" fill="#2d5f7a">اللي ورا</text>`;
  s+=`<text x="${X(0)-8}" y="${Z(RL/2)}" text-anchor="middle" fill="#2d5f7a" transform="rotate(-90 ${X(0)-8} ${Z(RL/2)})">الشمال • ${Math.round(RL*100)} سم</text><text x="${X(RW)+10}" y="${Z(RL/2)}" text-anchor="middle" fill="#2d5f7a" transform="rotate(90 ${X(RW)+10} ${Z(RL/2)})">اليمين</text>`;
  if(edit){ if(PLAN_WALL){ const [ax,az]=aoToXZ(PLAN_WALL,0,0), [bx,bz]=aoToXZ(PLAN_WALL,wlen(PLAN_WALL),0); s+=`<line class="pwall" x1="${X(ax)}" y1="${Z(az)}" x2="${X(bx)}" y2="${Z(bz)}"/>`; }
    const d=PLAN_DRAG&&PLAN_DRAG.moved&&FEATS.find(f=>f.id===PLAN_DRAG.f.id);
    if(d){ const o=-16/S, [ax,az]=aoToXZ(d.wall,0,o), [bx,bz]=aoToXZ(d.wall,d.a0,o), r=rectAO(d.wall,d.a0,d.a1,-0.08,d.type==="column"||d.type==="shaft"||d.type==="stack"?d.dep:0.08);
      s+=`<rect class="pdrag" x="${X(r.x0)-2}" y="${Z(r.z0)-2}" width="${(r.x1-r.x0)*S+4}" height="${(r.z1-r.z0)*S+4}" rx="3"/><line class="pdim" x1="${X(ax)}" y1="${Z(az)}" x2="${X(bx)}" y2="${Z(bz)}"/><circle class="pdimd" cx="${X(ax)}" cy="${Z(az)}" r="3"/><circle class="pdimd" cx="${X(bx)}" cy="${Z(bz)}" r="3"/>`; } }
  return s+"</svg>";
}
function roomBox(){
  const top=document.createElement("div"); top.innerHTML=`<div class="sum" id="roomSum"></div><div id="roomPlan" class="planbox"></div>`; ctlEl.insertBefore(top,ctlEl.firstChild);
  const act=document.createElement("div"); act.className="act"; const b1=document.createElement("button"); b1.className="btn main"; b1.textContent="🧭 المعالج خطوة بخطوة"; b1.onclick=()=>openWizard(false);
  const b2=document.createElement("select"); b2.setAttribute("aria-label","غيّر القالب"); b2.innerHTML=`<option value="">🔁 غيّر القالب…</option>`+Object.entries(cfg.roomType==="bath"?BTEMPLATES:cfg.roomType==="hall"?HTEMPLATES:cfg.roomType==="room"?RTEMPLATES:TEMPLATES).filter(([k,v])=>cfg.roomType!=="room"||(v.rtype==="shop")===isShop(cfg)).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("");
  b2.onchange=()=>{ if(!b2.value) return; pushHist(); applyTemplate(cfg,b2.value,b2.value!=="mine"); build(); renderControls(); hint("اتغير القالب ✓"); };
  act.append(b1,b2); top.appendChild(act);
  const h=document.createElement("div"); h.className="head"; h.textContent="🧱 الشبابيك والأبواب والبروزات"; ctlEl.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="أول الحيطة: الحيطة القدامية واللي ورا بتتقاس من ناحية الشمال، والحيطة الشمال واليمين بتتقاس من ناحية القدامية."; ctlEl.appendChild(n);
  featuresEditor(ctlEl,Object.keys(FT));
  bindPlan(document.getElementById("roomPlan")); updRoomPreview();
}
function updRoomPreview(){ const d=document.getElementById("roomSum"); if(d){ d.innerHTML=`المقاس الصافي بعد التشطيب: <b>عرض ${Math.round(RW*100)} × طول ${Math.round(RL*100)} سم</b>`+(cfg.dimsOn==="brick"?`<br><small>المحارة والسيراميك بياخدوا ${(cfg.plaster+cfg.tileT)} سم من كل حيطة.</small>`:"")+`<br><small>أضيق ممر ${STATS.walk} سم • ${tplName(cfg.template)}</small>`; }
  drawPlan(document.getElementById("roomPlan")); }
// ---- live plan: drag windows / doors / openings / columns along their wall, tap a wall to change its length ----
var PLAN_DRAG=null, PLAN_WALL=null;
const PLAN_MOVE=["window","door","opening","column","shaft","stack"];
function drawPlan(box){ if(!box) return; const t=document.createElement("div"); t.innerHTML=planSVG(true); const old=box.querySelector("svg"); if(old) old.replaceWith(t.firstChild); else box.prepend(t.firstChild); }
const alongOf=(w,x,z)=>w==="L"||w==="RT"?z:x;
/* pointer -> room meters; px = meters per screen pixel, so hit areas stay finger-sized at any zoom */
function planPt(box,e){ const svg=box.querySelector("svg.pedit"), ctm=svg&&svg.getScreenCTM(); if(!ctm||!ctm.a) return null; const S=+svg.dataset.s, m=+svg.dataset.m, p=svgPt(svg,e); return {x:(p.x-m)/S,z:(p.y-m)/S,px:1/(ctm.a*S)}; }
function planHit(p){ let best=null, bd=22*p.px;
  for(const f of FEATS){ if(!PLAN_MOVE.includes(f.type)||!W4.includes(f.wall)||!(cfg.feats||[]).some(x=>x.id===f.id)) continue;
    const r=rectAO(f.wall,f.a0,f.a1,-0.08,f.type==="column"||f.type==="shaft"||f.type==="stack"?f.dep:0.08), d=Math.hypot(Math.max(r.x0-p.x,0,p.x-r.x1),Math.max(r.z0-p.z,0,p.z-r.z1));
    if(d<=bd){ bd=d; best=f.id; } }
  if(best) return {feat:best};
  let wall=null; bd=Infinity; /* a wall: from 34px outside it (its label) to 14px inside */
  for(const w of W4){ const o=w==="L"?p.x:w==="RT"?RW-p.x:w==="W"?p.z:RL-p.z, a=alongOf(w,p.x,p.z);
    if(o>-34*p.px&&o<14*p.px&&a>-20*p.px&&a<wlen(w)+20*p.px&&Math.abs(o)<bd){ bd=Math.abs(o); wall=w; } }
  return wall?{wall}:null; }
/* the distance tip floats just above the finger (below it near the top edge) */
function planTip(box,f,e){ const t=box.querySelector(".plantip"); if(!t) return; t.textContent=`${f.pos} سم من أول ${WNAME[f.wall]}`+(cfg.dimsOn==="brick"?" (على الطوب)":""); t.classList.add("on");
  const r=box.getBoundingClientRect(), hw=t.offsetWidth/2+4, y=e.clientY-r.top;
  t.style.left=Math.max(hw,Math.min(r.width-hw,e.clientX-r.left))+"px"; t.style.top=(y>64?y-60:y+36)+"px"; }
function wallPop(box){ const pop=box.querySelector(".planpop"); if(!pop) return; pop.innerHTML=""; pop.hidden=!PLAN_WALL; if(!PLAN_WALL) return;
  const w=PLAN_WALL, k=w==="W"||w==="D"?"roomW":"roomL", sc=SCHEMA["الأوضة"].find(c=>c.k===k)||{max:700,step:1}, brick=cfg.dimsOn==="brick";
  const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${WNAME[w]}</b><small>${WNAME[{W:"D",D:"W",L:"RT",RT:"L"}[w]]} بتتغير معاها</small>`;
  const x=document.createElement("button"); x.type="button"; x.className="stb"; x.innerHTML=ico("x",16); x.setAttribute("aria-label","اقفل");
  x.onclick=()=>{ PLAN_WALL=null; wallPop(box); drawPlan(box); }; hd.appendChild(x); pop.appendChild(hd);
  const note=document.createElement("div"); note.className="note";
  const upd=()=>{ const v=+cfg[k], t=2*((+cfg.plaster||0)+(+cfg.tileT||0)); note.innerHTML=brick?`ده المقاس على الطوب. الصافي بعد المحارة والسيراميك: <b>${Math.max(roomDimMin(k),Math.round(v-t))} سم</b>`:`ده المقاس الصافي بعد التشطيب. على الطوب هيبقى حوالي <b>${Math.round(v+t)} سم</b>`; };
  const row=rangeField(pop,brick?"الطول على الطوب":"الطول الصافي",()=>cfg[k],v=>{ cfg[k]=v; upd(); },roomDimMin(k),sc.max,sc.step||1,"سم",()=>UI_REFRESH());
  row.querySelector("input[type=range]").addEventListener("change",()=>UI_REFRESH()); upd(); pop.appendChild(note); }
function bindPlan(box){ if(!box) return; box.classList.add("edit");
  box.insertAdjacentHTML("beforeend",`<div class="plantip" aria-live="polite"></div><div class="plancap">اسحب الشباك أو الباب أو العمود على حيطته، ودوس على أي حيطة عشان تغيّر طولها.</div><div class="planpop" hidden></div>`);
  wallPop(box);
  box.addEventListener("pointerdown",e=>{ if(e.button||PLAN_DRAG||!e.target.closest("svg")) return; const p=planPt(box,e); if(!p) return; const h=planHit(p);
    if(!h){ if(PLAN_WALL){ PLAN_WALL=null; wallPop(box); drawPlan(box); } return; }
    e.preventDefault();
    if(h.wall){ PLAN_WALL=PLAN_WALL===h.wall?null:h.wall; wallPop(box); drawPlan(box); return; }
    const f=cfg.feats.find(x=>x.id===h.feat); PLAN_DRAG={f,a:alongOf(f.wall,p.x,p.z),pos:+f.pos||0,moved:false,id:e.pointerId}; try{ box.setPointerCapture(e.pointerId); }catch(_){} });
  box.addEventListener("pointermove",e=>{ const d=PLAN_DRAG, p=planPt(box,e); if(!p) return;
    if(!d){ if(e.pointerType==="mouse"){ const h=planHit(p); box.querySelector("svg").style.cursor=h?(h.feat?"grab":"pointer"):""; } return; }
    if(e.pointerId!==d.id) return; const da=alongOf(d.f.wall,p.x,p.z)-d.a;
    if(!d.moved){ if(Math.abs(da)<6*p.px) return; d.moved=true; pushHist(); }
    const v=Math.max(0,Math.min(Math.max(0,measLen(d.f.wall)-(+d.f.w||0)),Math.round(d.pos+da*100)));
    if(v!==d.f.pos){ d.f.pos=v; SLIDING=true; build(); SLIDING=false; } planTip(box,d.f,e); });
  const end=e=>{ const d=PLAN_DRAG; if(!d||e.pointerId!==d.id) return; PLAN_DRAG=null; const t=box.querySelector(".plantip"); if(t) t.classList.remove("on");
    const sc=box.closest("#controls,#wizBody"); if(!d.moved) OPENC.add(d.f.id); UI_REFRESH();
    /* a tap (no drag) opens that element's card below */
    const c=!d.moved&&sc&&sc.querySelector(`.card[data-key="${d.f.id}"]`); if(c) sc.scrollTop+=c.getBoundingClientRect().top-sc.getBoundingClientRect().top-8; };
  box.addEventListener("pointerup",end); box.addEventListener("pointercancel",end); }
function placeBox(){
  const h=document.createElement("div"); h.className="head"; h.textContent="📍 مكان الأجهزة"; ctlEl.appendChild(h);
  const cw=W4.filter(w=>(cfg.wallCfg[w]||{}).type==="counter").map(w=>[w,WNAME[w]]);
  const nich=FEATS.filter(f=>(f.type==="niche"&&f.y0<0.05)||f.type==="corridor").map(f=>["N:"+f.id,WALLS["N:"+f.id]?WALLS["N:"+f.id].name:"فجوة"]);
  if(!cw.length){ const n=document.createElement("div"); n.className="note"; n.textContent="مفيش حيطة عليها دواليب ورخامة. اختار نوع الحيطان من تاب التخزين."; ctlEl.appendChild(n); }
  const P=cfg.place;
  const onCh=()=>{ for(const f of cfg.feats||[]) if((f.type==="niche"||f.type==="corridor")){ const id="N:"+f.id; if(P.f===id&&P.w===id) P.w=firstCounter(); } };
  objSelect(ctlEl,P,"s","الحوض",cw,onCh); objSelect(ctlEl,P,"t","البوتاجاز",cw,onCh);
  objSelect(ctlEl,P,"f","التلاجة",[...cw,...nich],onCh); objSelect(ctlEl,P,"w","الغسالة",[...cw,...nich,["none","مش في المطبخ"]],onCh);
  if(cfg.dish) objSelect(ctlEl,P,"d","غسالة الأطباق",cw,onCh);
  const n=document.createElement("div"); n.className="note"; n.textContent="ترتيبهم على الحيطة بيتغير بالسحب بصباعك في الـ3D."; ctlEl.appendChild(n);
  const rb=document.createElement("button"); rb.className="btn"; rb.textContent="رجّع الترتيب الافتراضي"; rb.onclick=()=>{ pushHist(); cfg.seq={}; build(); }; ctlEl.appendChild(rb);
  if(cfg.template==="mine"){ const hv=document.createElement("div"); hv.className="head"; hv.textContent="✨ تنويعات جاهزة لمطبخك"; ctlEl.appendChild(hv);
    const vs=document.createElement("select"); vs.innerHTML=`<option value="">اختار تنويعة…</option>`+Object.entries(VARIANTS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("");
    vs.onchange=()=>{ if(!vs.value) return; pushHist(); const base=TEMPLATES.mine.make(cfg.roomW,cfg.roomL); Object.assign(cfg,{wallCfg:base.wallCfg,place:{...base.place,f:"N:rc"},seq:base.seq,sinkUnderWin:false,upper:"ceiling",upperFront:"solid",aboveDoor:true,aboveWindow:true,nicheTop:true}); VARIANTS[vs.value].fn(cfg); build(); renderControls(); };
    fieldRow(ctlEl,"التنويعة",vs); }
}
function wallsBox(){
  for(const w of W4){ const c=cfg.wallCfg[w]=cfg.wallCfg[w]||{type:"none",depth:60,up:false};
    const h=document.createElement("div"); h.className="head"; h.textContent="🧱 "+wallName(w); ctlEl.appendChild(h);
    objSelect(ctlEl,c,"type","عليها إيه",WTYPE);
    if(["shallow","pantry","shelves"].includes(c.type)) objRange(ctlEl,c,"depth","العمق",15,65,1);
    const t={v:c.up?"1":""}; objSelect(ctlEl,t,"v","دواليب علوية",[["1","أيوه"],["","لأ"]],()=>{ c.up=!!t.v; });
  }
  const h=document.createElement("div"); h.className="head"; h.textContent="🏝 الجزيرة"; ctlEl.appendChild(h);
  const I=cfg.island; const t={v:I.on?"1":""}; objSelect(ctlEl,t,"v","فيه جزيرة؟",[["","لأ"],["1","أيوه"]],()=>{ I.on=!!t.v; });
  if(I.on){ objRange(ctlEl,I,"w","طولها",60,400,1); objRange(ctlEl,I,"d","عرضها",40,150,1); objRange(ctlEl,I,"pos","مكانها من الحيطة القدامية",50,Math.round(RL*100),1); }
}
function waterBox(){
  const h=document.createElement("div"); h.className="head"; h.textContent="💧 المخارج الموجودة دلوقتي"; ctlEl.appendChild(h);
  objSelect(ctlEl,cfg.water,"wall","مخرج المية على",W4OPT()); objRange(ctlEl,cfg.water,"pos","بعده عن أول الحيطة",0,measLen(cfg.water.wall),5); objRange(ctlEl,cfg.water,"y","ارتفاعه",20,120,1);
  objSelect(ctlEl,cfg.drain,"wall","الصرف في الأرض جنب",W4OPT()); objRange(ctlEl,cfg.drain,"pos","بعده عن أول الحيطة",0,measLen(cfg.drain.wall),5);
  const n=document.createElement("div"); n.className="note"; n.textContent="مخارج المية اللي في الفجوات والتجاويف بتتحدد من تاب الأوضة."; ctlEl.appendChild(n);
  const el=elecLoads(); const d=document.createElement("div"); d.className="sum"; d.innerHTML=`⚡ الحمل المتوقع حوالي <b>${(el.demand/1000).toFixed(1)} ك.و (${el.amps} أمبير)</b> • محتاج <b>${el.circuits.length} دواير</b> في اللوحة<br><small>التفاصيل في 📐 ← الأحمال</small>`; ctlEl.appendChild(d);
}
function locOpts(cls){
  const cw=W4.filter(w=>(cfg.wallCfg[w]||{}).type==="counter"), cnt=W4.filter(w=>["counter","shallow","bar"].includes((cfg.wallCfg[w]||{}).type));
  const nich=FEATS.filter(f=>(f.type==="niche"&&f.y0<0.05)||f.type==="corridor").map(f=>["N:"+f.id,WALLS["N:"+f.id].name]);
  if(cls==="slot"||cls==="tall") return [...cw.map(w=>[w,WNAME[w]+" (في الترتيب)"]),...W4.filter(w=>!cw.includes(w)).map(w=>[w,WNAME[w]]),...nich];
  if(cls==="wall") return W4OPT();
  return (cnt.length?cnt:W4).map(w=>[w,WNAME[w]]);
}
// ======== projects ========
let PROJ={id:"p"+Date.now().toString(36),name:"مطبخي"}, projIndex=[], saveT=null, loadingP=true, storageOK=null;
let DRAFT=null; /* the starter design on a first visit: saved only once it changes, so picking something else on the start screen leaves no stray kitchen behind */
const MEMS={}, PENDING=new Set(), DELETED=new Set(); let retryT=null, lastSaved={};
// backend: window.storage (Claude artifacts) if it exists, else localStorage behind the same async get/set/delete, else null (MEMS only)
let LSTORE;
function store(){ if(window.storage) return window.storage; if(LSTORE===undefined) LSTORE=localStore(); return LSTORE; }
function localStore(){ try{ const ls=window.localStorage, P="kitchen3d/"; ls.getItem(P+"kproj:index"); /* throws when localStorage is blocked */
  return {async get(k){ const v=ls.getItem(P+k); return v===null?null:{key:k,value:v}; }, async set(k,v){ ls.setItem(P+k,v); return {key:k,value:v}; }, async delete(k){ ls.removeItem(P+k); return {key:k,deleted:true}; }}; }catch(e){ return null; } }
// {v} = value (null when the key doesn't exist); {v:null,err:true} = the read itself failed, so never overwrite that key with defaults
async function stRead(k){ if(k in MEMS) return {v:clone(MEMS[k])};
  try{ const r=await store().get(k,false); storageOK=storageOK===false?false:true; if(r){ const v=JSON.parse(r.value); MEMS[k]=v; return {v:clone(v)}; } return {v:null}; }catch(e){ if(!store()) storageOK=false; return {v:null,err:true}; } }
async function stGet(k){ return (await stRead(k)).v; }
async function rawSet(k){ try{ const txt=JSON.stringify(MEMS[k]); if(lastSaved[k]===txt){ PENDING.delete(k); return true; } const r=await store().set(k,txt,false); if(r){ lastSaved[k]=txt; PENDING.delete(k); storageOK=true; return true; } }catch(e){} PENDING.add(k); storageOK=false; clearTimeout(retryT); retryT=setTimeout(retryPending,6000); return false; }
async function retryPending(){ for(const k of [...PENDING]) if(k in MEMS) await rawSet(k); else PENDING.delete(k); if(PENDING.size){ clearTimeout(retryT); retryT=setTimeout(retryPending,15000); } }
async function stSet(k,v){ MEMS[k]=clone(v); return rawSet(k); }
async function stDel(k){ delete MEMS[k]; delete lastSaved[k]; PENDING.delete(k); try{ await store().delete(k,false); }catch(e){} }
// the timer waits while another room's cfg is swapped in (apartment snapshots / 3D / compare)
function autosave(){ if(loadingP||WIZ) return; clearTimeout(saveT); saveT=setTimeout(function tick(){ if(loadingP||APT_BUILD||APT3D){ saveT=setTimeout(tick,1000); return; } saveNow(); },2500); }
async function saveNow(){ clearTimeout(saveT); if(loadingP||APT_BUILD||APT3D||DELETED.has(PROJ.id)) return;
  if(DRAFT!=null){ if(DRAFT===JSON.stringify(cfg)&&!projIndex.some(p=>p.id===PROJ.id)) return; DRAFT=null; }
  const e={id:PROJ.id,name:PROJ.name,t:Date.now()}; const i=projIndex.findIndex(p=>p.id===PROJ.id); if(i>=0) projIndex[i]=e; else projIndex.push(e);
  await stSet("kproj:"+PROJ.id,{name:PROJ.name,cfg}); await stSet("kproj:index",projIndex); }
function updProjName(){ document.getElementById("projName").textContent=PROJ.name; }
async function initProjects(){
  projIndex=((await stGet("kproj:index"))||[]).filter(p=>p&&p.id).map(p=>({...p,name:cleanName(p.name)})); await loadAptIndex(); await loadApt(); PRICE_DEF=cleanPrices(await stGet("kprices"));
  if(!projIndex.length){ Object.assign(cfg,PRICE_DEF); /* the first design was made before the saved prices were read */ DRAFT=JSON.stringify(cfg); }
  if(projIndex.length){ const last=[...projIndex].sort((a,b)=>b.t-a.t)[0]; const d=await stGet("kproj:"+last.id); if(d&&d.cfg){ PROJ={id:last.id,name:cleanName(d.name)||last.name}; cfg=migrate(d.cfg); } }
  loadingP=false; updProjName(); build(); renderControls(); autosave(); openHome();
}
async function openProject(id){ const rd=await stRead("kproj:"+id); let d=rd.v; if(rd.err){ hint("مقدرتش أقرا المشروع ده من الحفظ دلوقتي، جرّب تاني كمان شوية",4000); return; } if(!d){ const nm=projName(id); d={name:nm,cfg:newCfg(nm.includes("طرقة")?"h_hall":nm.includes("حمام")?"b_std":"L")}; await stSet("kproj:"+id,d); hint("المشروع ده ماكانش اتحفظ، فتحته من جديد بالشكل الافتراضي",4000); } await saveNow(); PROJ={id,name:cleanName(d.name)||projName(id)}; cfg=migrate(d.cfg); clearHist(); SEL=null; updProjName(); build(); renderControls(); closeSheet(); setView("out"); hint(`اتفتح "${PROJ.name}"`); }
function projectsBox(){ renderProjects(ctlEl); }
function renderProjects(el){
  const n=document.createElement("div"); n.className="note"; n.textContent=storageOK===false?"⚠ الحفظ الدايم متعطل دلوقتي، وبحاول تاني لوحدي كل شوية. شغلك محفوظ طول ما الصفحة مفتوحة، ولو هتقفلها انسخ الإعدادات من تحت.":"كل تصميم وكل شقة بيتحفظوا لوحدهم تلقائي على الجهاز ده. تقدر تعمل أكتر من شقة وأكتر من تصميم وتقارن بينهم."; el.appendChild(n);
  const nb=document.createElement("button"); nb.className="btn main wide"; nb.textContent="➕ ابدأ حاجة جديدة (شقة، مطبخ، حمام، أوضة، محل)"; nb.onclick=()=>{ closeSheet(); openHome(); }; el.appendChild(nb);
  if(APTS.length){ const h=document.createElement("div"); h.className="head"; h.textContent="🏢 شققك"; el.appendChild(h); aptListUI(el,refreshSheet); }
  const ph=document.createElement("div"); ph.className="head"; ph.textContent="🧩 كل التصميمات"; el.appendChild(ph);
  const list=[...projIndex]; if(!list.some(p=>p.id===PROJ.id)) list.push({id:PROJ.id,name:PROJ.name,t:Date.now()});
  list.sort((a,b)=>b.t-a.t).forEach(p=>{ const card=document.createElement("div"); card.className="card"+(p.id===PROJ.id?" sel":"");
    const ap=aptOfRoom(p.id); card.innerHTML=`<div class="ch"><b>${p.id===PROJ.id?"✓ ":""}${esc(p.name)}</b><small>${ap?"🏢 "+esc(ap.name)+" • ":""}${new Date(p.t).toLocaleDateString("ar-EG")}</small></div>`;
    const act=document.createElement("div"); act.className="act";
    const mk=(t,fn)=>{ const b=document.createElement("button"); b.className="btn"; b.textContent=t; b.onclick=fn; act.appendChild(b); };
    if(p.id!==PROJ.id) mk("فتح",()=>openProject(p.id));
    mk("✏️ اسم",async()=>{ const inp=document.createElement("input"); inp.value=p.name; inp.className="txt"; inp.setAttribute("aria-label","اسم المشروع"); const ok=document.createElement("button"); ok.className="btn main"; ok.textContent="حفظ";
      act.innerHTML=""; act.append(inp,ok); inp.focus(); ok.onclick=async()=>{ const nm=cleanName(inp.value)||p.name; if(p.id===PROJ.id){ PROJ.name=nm; updProjName(); await saveNow(); } else { const d=await stGet("kproj:"+p.id); if(d){ d.name=nm; await stSet("kproj:"+p.id,d); } const i=projIndex.findIndex(x=>x.id===p.id); if(i>=0) projIndex[i].name=nm; await stSet("kproj:index",projIndex); } refreshSheet(); }; });
    mk("📄 نسخة",async()=>{ const d=p.id===PROJ.id?{name:PROJ.name,cfg}:await stGet("kproj:"+p.id); if(!d) return; const id="p"+Date.now().toString(36); await stSet("kproj:"+id,{name:d.name+" (نسخة)",cfg:d.cfg}); projIndex.push({id,name:d.name+" (نسخة)",t:Date.now()}); await stSet("kproj:index",projIndex); refreshSheet(); });
    if(list.length>1) mk("🗑",async()=>{ act.innerHTML=""; const q=document.createElement("span"); q.textContent="متأكد؟"; q.style.alignSelf="center"; const y=document.createElement("button"); y.className="btn main"; y.style.background="var(--clay)"; y.style.borderColor="var(--clay)"; y.textContent="امسح"; const c=document.createElement("button"); c.className="btn"; c.textContent="لأ";
      act.append(q,y,c); c.onclick=refreshSheet; y.onclick=async()=>{ DELETED.add(p.id); if(p.id===PROJ.id) clearTimeout(saveT); await stDel("kproj:"+p.id); projIndex=projIndex.filter(x=>x.id!==p.id); await stSet("kproj:index",projIndex);
        if(p.id===PROJ.id){ const nx=projIndex[0]; if(nx) await openProject(nx.id); if(PROJ.id===p.id){ PROJ={id:"p"+Date.now().toString(36),name:PROJ.name}; clearHist(); updProjName(); await saveNow(); } } refreshSheet(); }; });
    card.appendChild(act); el.appendChild(card); });
  backupUI(el);
  compareUI(el);
  const h=document.createElement("div"); h.className="head"; h.textContent="📋 نسخ ومشاركة (مشروع واحد)"; el.appendChild(h);
  const ta=document.createElement("textarea"); ta.value=JSON.stringify(cfg);
  const st=document.createElement("div"); st.className="note";
  const a2=document.createElement("div"); a2.className="act";
  const cp=document.createElement("button"); cp.className="btn"; cp.textContent="نسخ إعدادات التصميم ده"; cp.onclick=async()=>{ ta.select(); try{ await navigator.clipboard.writeText(ta.value); st.textContent="اتنسخت، ابعتها لأي حد"; }catch(e){ document.execCommand&&document.execCommand("copy"); st.textContent="اتنسخت"; } };
  const ap=document.createElement("button"); ap.className="btn"; ap.textContent="افتح إعدادات ملصوقة كتصميم جديد"; ap.onclick=async()=>{ try{ const v=JSON.parse(ta.value); if(!v||typeof v!=="object"||Array.isArray(v)) throw new Error("bad"); await saveNow(); PROJ={id:"p"+Date.now().toString(36),name:"تصميم ملصوق"}; cfg=migrate(v); clearHist(); SEL=null; build(); updProjName(); await saveNow(); refreshSheet(); st.textContent="اتفتح ✓"; }catch(e){ st.textContent="الكلام الملصوق مش مظبوط"; } };
  a2.append(cp,ap); el.append(ta,a2,st);
}
function openSheet(){ const s=document.getElementById("sheet"); s.style.display="flex"; refreshSheet(); }
function closeSheet(){ document.getElementById("sheet").style.display="none"; }
function refreshSheet(){ const b=document.getElementById("sheetBody"); if(document.getElementById("sheet").style.display==="flex"){ b.innerHTML=""; renderProjects(b); } if(tab==="المشاريع") renderControls(); }
// ======== wizard ========
// kinds of space: [first template, default name]. A shop is a furnished room (roomType "room") with rtype "shop".
const KINDS={kitchen:["L","مطبخ جديد"],bath:["b_std","حمام جديد"],room:["r_living","أوضة جديدة"],shop:["s_market","محل جديد"],hall:["h_hall","طرقة جديدة"]};
const spaceKind=c=>isShop(c)?"shop":(c.roomType||"kitchen");
function wstepName(i){ if(i!==4) return WSTEPS[i]; return {bath:"الأجهزة الصحية",room:"الفرش",shop:"الفرش والأرفف",hall:"الأجهزة"}[spaceKind(cfg)]||WSTEPS[4]; }
const WSTEPS=["النوع والشكل","المقاسات","الأبواب والشبابيك","البروزات والأعمدة والتجاويف","مكان الأجهزة","جاهز"];
function tplIcon(k){ const r=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f||"#cfd8df"}"/>`; let b=`<svg viewBox="0 0 60 60" width="56" height="56"><rect x="4" y="4" width="52" height="52" fill="#fff" stroke="#30343a" stroke-width="3"/>`;
  if(k==="mine") b+=r(6,20,12,34)+r(18,6,36,10)+r(44,22,8,26)+`<rect x="6" y="6" width="12" height="14" fill="#b9b3a8"/>`;
  if(k==="one") b+=r(6,6,12,48);
  if(k==="galley") b+=r(6,6,12,48)+r(42,6,12,48);
  if(k==="L") b+=r(6,6,12,48)+r(18,6,36,12);
  if(k==="U") b+=r(6,6,12,48)+r(18,6,24,12)+r(42,6,12,48);
  if(k==="island") b+=r(6,6,12,48)+r(28,20,14,24,"#e5d9c3");
  if(k.startsWith("r_")){ const f=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#8a8f95" stroke-width="0.6"/>`;
    if(k==="r_living") b+=f(6,18,10,24,"#8a9aa8")+f(22,24,10,12,"#c9a27a")+f(48,20,6,20,"#a57c52");
    if(k==="r_recep") b+=f(6,6,10,26,"#8a9aa8")+f(6,6,22,10,"#8a9aa8")+f(26,38,24,12,"#c9a27a");
    if(k==="r_master") b+=f(18,6,24,26,"#dfe3e6")+f(10,6,7,6,"#a57c52")+f(43,6,7,6,"#a57c52")+f(6,36,8,18,"#a57c52");
    if(k==="r_kids") b+=f(6,14,12,24,"#dfe3e6")+f(42,14,12,24,"#dfe3e6")+f(22,6,16,8,"#a57c52");
    if(k==="r_balcony") b+=`<rect x="6" y="6" width="48" height="3" fill="#6fb6e0"/>`+f(10,20,8,8,"#8a9aa8")+f(30,20,8,8,"#8a9aa8");
    if(k==="r_guest") b+=f(40,6,14,24,"#dfe3e6")+f(6,6,16,8,"#a57c52")+f(6,30,6,14,"#a57c52"); }
  if(k.startsWith("s_")){ const f=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#8a8f95" stroke-width="0.6"/>`, sh="#e3c9a0", ct="#a57c52";
    if(k==="s_market") b+=f(6,6,48,7,sh)+f(6,13,7,26,sh)+f(47,13,7,22,sh)+f(20,18,6,20,sh)+f(34,18,6,20,sh)+f(10,42,12,6,ct);
    if(k==="s_clothes") b+=f(6,6,48,7,sh)+f(8,18,3,20,"#8a9aa8")+f(22,26,16,3,"#8a9aa8")+f(22,38,16,3,"#8a9aa8")+f(44,16,10,10,"#dfe3e6")+f(44,28,10,10,"#dfe3e6")+f(40,42,6,12,ct);
    if(k==="s_cafe") b+=f(12,14,26,6,ct)+`<circle cx="18" cy="34" r="5" fill="${ct}"/><circle cx="40" cy="34" r="5" fill="${ct}"/><circle cx="18" cy="48" r="4" fill="${ct}"/><circle cx="40" cy="48" r="4" fill="${ct}"/>`;
    if(k==="s_pharm") b+=f(6,6,48,6,sh)+f(6,12,6,16,sh)+f(48,12,6,16,sh)+f(12,32,36,6,ct)+f(6,40,5,12,"#cfe3ee");
    if(k==="s_office") b+=f(20,12,20,9,ct)+f(20,28,8,8,"#8a9aa8")+f(32,28,8,8,"#8a9aa8")+f(6,8,5,20,sh)+f(48,18,6,16,"#8a9aa8"); }
  if(k==="h_hall") b+=`<rect x="22" y="6" width="16" height="48" fill="#f4f1ec"/>`;
  if(k.startsWith("b_")){ const o=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#e6edf1" stroke="#8a9aa5"/>`;
    if(k==="b_guest") b+=o(30,14,6,8)+r(6,30,8,12,"#cfe3ee");
    if(k==="b_small") b+=r(6,40,48,14,"#d4ebf3")+o(12,28,6,5)+r(6,8,8,10,"#cfe3ee");
    if(k==="b_std") b+=r(38,6,16,16,"#d4ebf3")+o(12,14,6,5)+r(6,26,8,12,"#cfe3ee");
    if(k==="b_tub") b+=r(6,6,48,12,"#d4ebf3")+o(12,30,6,5)+r(6,40,8,12,"#cfe3ee");
    if(k==="b_laundry") b+=r(6,6,12,12,"#e3e5e7")+r(20,6,12,12,"#e3e5e7")+r(46,30,8,10,"#cfe3ee");
    if(k==="b_master") b+=r(6,6,32,12,"#d4ebf3")+r(40,6,14,16,"#c8e2ec")+o(12,30,6,5)+r(46,28,8,18,"#cfe3ee"); }
  return b+"</svg>"; }
function openWizard(isNew,kind,fromHome){ saveNow(); kind=KINDS[kind]?kind:"kitchen"; WIZ={step:0,isNew,fromHome:!!fromHome,backup:clone(cfg),backupProj:{...PROJ},backupHist:hist.slice(),backupRedo:redo.slice(),name:isNew?KINDS[kind][1]:PROJ.name}; tabsEl.dataset.rt=""; if(isNew) cfg=newCfg(KINDS[kind][0]); UI_REFRESH=renderWiz; document.getElementById("wiz").style.display="flex"; build(); renderWiz(); }
function closeWizard(apply){ const w=WIZ; WIZ=null; UI_REFRESH=()=>renderControls(); document.getElementById("wiz").style.display="none";
  if(!apply){ cfg=w.backup; PROJ=w.backupProj; hist.length=0; hist.push(...w.backupHist); redo.length=0; redo.push(...w.backupRedo); histBtns(); }
  else if(w.isNew){ PROJ={id:"p"+Date.now().toString(36),name:cleanName(w.name)||KINDS[spaceKind(cfg)][1]}; clearHist(); }
  else PROJ.name=cleanName(w.name)||PROJ.name;
  updProjName(); build(); renderControls(); setView("out"); if(apply){ saveNow(); hint(`✓ «${PROJ.name}» جاهز، عدّل أي حاجة من ⚙ التحكم`,4000); } else if(w.fromHome) openHome(); }
function updWizPreview(){ drawPlan(document.getElementById("wizPlan")); const s=document.getElementById("wizWarn"); if(s) s.innerHTML=(STATS.warn||[]).slice(0,3).map(w=>`<div>⚠ ${esc(w)}</div>`).join(""); }
function renderWiz(){
  if(!WIZ) return; const body=document.getElementById("wizBody"); body.innerHTML="";
  document.getElementById("wizTitle").textContent=`${WIZ.step+1}/${WSTEPS.length} • ${wstepName(WIZ.step)}`;
  document.getElementById("wizBar").style.width=((WIZ.step+1)/WSTEPS.length*100)+"%";
  const pv=document.createElement("div"); pv.innerHTML=`<div id="wizPlan" class="planbox"></div><div id="wizWarn" class="note" style="color:var(--clay)"></div>`; body.appendChild(pv); bindPlan(document.getElementById("wizPlan"));
  const hostEl=document.createElement("div"); body.appendChild(hostEl); const saveCtl=ctlEl; ctlEl=hostEl;
  const st=WIZ.step;
  if(st===0){ const inp=document.createElement("input"); inp.value=WIZ.name; inp.placeholder="الاسم (مثلاً: مطبخ شقة المعادي)"; inp.className="txt big"; inp.setAttribute("aria-label","الاسم");
    inp.oninput=()=>{ WIZ.name=inp.value; }; hostEl.appendChild(inp);
    const tg=document.createElement("div"); tg.className="rtypes"; for(const [rt,lb] of [["kitchen","🍳 مطبخ"],["bath","🚿 حمام"],["room","🛋 أوضة / صالة"],["shop","🏪 محل / مكتب"],["hall","🚪 طرقة"]]){ const bb=document.createElement("button"); bb.className="btn"+(spaceKind(cfg)===rt?" on":""); bb.textContent=lb; bb.onclick=()=>{ if(spaceKind(cfg)===rt) return; pushHist(); applyTemplate(cfg,KINDS[rt][0],false); if(Object.values(KINDS).some(v=>v[1]===WIZ.name)) WIZ.name=KINDS[rt][1]; build(); renderWiz(); }; tg.appendChild(bb); } hostEl.appendChild(tg);
    const g=document.createElement("div"); g.className="tplgrid";
    for(const [k,v] of Object.entries(cfg.roomType==="bath"?BTEMPLATES:cfg.roomType==="hall"?HTEMPLATES:cfg.roomType==="room"?RTEMPLATES:TEMPLATES)){ if(cfg.roomType==="room"&&(v.rtype==="shop")!==isShop(cfg)) continue; const b=document.createElement("button"); b.className="btn tpl"+(cfg.template===k?" on":"");
      b.innerHTML=tplIcon(k)+`<span>${v.name}</span>`; b.onclick=()=>{ pushHist(); applyTemplate(cfg,k,false); build(); renderWiz(); }; g.appendChild(b); }
    hostEl.appendChild(g); }
  if(st===1){ for(const c of SCHEMA["الأوضة"].filter(x=>x.t!=="head")) schemaRow(hostEl,c); schemaRow(hostEl,SCHEMA["الارتفاعات"][0]); }
  if(st===2){ const n=document.createElement("div"); n.className="note"; n.textContent="ضيف كل باب وشباك وحدد حيطته ومكانه. أول الحيطة القدامية واللي ورا من ناحية الشمال."; hostEl.appendChild(n); featuresEditor(hostEl,["door","window","opening"]); }
  if(st===3){ const n=document.createElement("div"); n.className="note"; n.textContent="أي كتف أو عمود أو ماسورة بارزة أو كمرة نازلة أو تجويف في الحيطة. لو مفيش، دوس التالي."; hostEl.appendChild(n); featuresEditor(hostEl,cfg.roomType==="bath"?["cut","stack","column","shaft","beam","niche"]:cfg.roomType==="kitchen"?["cut","column","shaft","beam","niche","corridor"]:["cut","railing","column","shaft","beam","niche"]); }
  if(st===4&&cfg.roomType==="bath"){ bathBox(hostEl); }
  else if(st===4&&cfg.roomType==="room"){ furnBox(hostEl); }
  else if(st===4&&cfg.roomType==="hall"){ const n=document.createElement("div"); n.className="note"; n.textContent="الطرقة مالهاش أجهزة. بعد ما تخلص، اربطها بالمطبخ والحمامات من 🏠 ← 🏢 الشقة."; hostEl.appendChild(n); }
  else if(st===4){ wallsBoxMini(hostEl); placeBox(); for(const c of [SCHEMA["الأجهزة"][1],SCHEMA["الأجهزة"][2]]) schemaRow(hostEl,c); }
  if(st===5){ const d=document.createElement("div"); d.className="sum"; d.innerHTML=`<b>${esc(WIZ.name||"مشروع")}</b><br>صافي ${STATS.net[0]} × ${STATS.net[1]} سم • ${FEATS.length} عنصر على الحيطان • أضيق ممر ${STATS.walk} سم<br><small>بعد ما تخلص تقدر تعدّل أي حاجة من ⚙ التحكم، وتسحب الأجهزة بصباعك.</small>`; hostEl.appendChild(d); }
  ctlEl=saveCtl;
  const back=document.getElementById("wizBack"), next=document.getElementById("wizNext");
  back.style.visibility=st===0?"hidden":"visible"; next.textContent=st===WSTEPS.length-1?"✓ افتح التصميم":"التالي ←";
  updWizPreview();
}
function wallsBoxMini(el){ const h=document.createElement("div"); h.className="head"; h.textContent="🧱 أنهي حيطان عليها دواليب ورخامة؟"; el.appendChild(h);
  for(const w of W4){ const c=cfg.wallCfg[w]=cfg.wallCfg[w]||{type:"none",depth:60,up:false}; objSelect(el,c,"type",wallName(w),WTYPE); } }
function schemaRow(parent,c){ // minimal renderer for a schema control inside another container
  if(c.t==="range"){ rangeField(parent,c.l,()=>cfg[c.k],v=>{ cfg[c.k]=v; },c.min,c.max,c.step,c.u,()=>UI_REFRESH()); return; }
  if(c.t==="select"){ fieldRow(parent,c.l,choice(c.o,cfg[c.k],v=>{ pushHist(); cfg[c.k]=v; build(); UI_REFRESH(); },c.l)); return; }
  if(c.t==="toggle"){ const w=document.createElement("label"); w.className="sw"; const el=document.createElement("input"); el.type="checkbox"; el.checked=!!cfg[c.k]; el.setAttribute("aria-label",c.l); el.onchange=()=>{ pushHist(); cfg[c.k]=el.checked; build(); UI_REFRESH(); }; w.append(el,document.createElement("i")); fieldRow(parent,c.l,w); }
}

function STEPS(){ if(cfg.roomType==="bath") return BSTEPS(); if(cfg.roomType==="room"){ const c=k=>POINTS.filter(p=>p.type===k).length, Q=ROOMQ||{floorA:0,paintA:0,liters:0,skirt:0,floorPcs:0};
    return [["الكهربا والنقط",`${c("socket")} بريزة و${c("switch")} مفتاح و${c("data")} نقطة دش/إنترنت. التكييف على خط لوحده، ومواسير النحاس وصرف التكييف تتمد قبل المحارة.`],
      ["المحارة والتسوية","محارة الحيطان وتسوية الأرضية بالمونة على المنسوب."],["الأرضية",`${Q.floorA.toFixed(1)} م² (${Q.floorPcs} بلاطة ${cfg.floorTile}).`],
      ["المعجون والدهان",`${Q.paintA.toFixed(1)} م² حيطان وسقف، حوالي ${Q.liters} لتر.`],["الوزرة والأبواب",`${Q.skirt.toFixed(1)} م وزرة، وتركيب الأبواب.`],
      ["التكييف والإضاءة","تركيب وحدات التكييف والنجف والسبوتات."],["الأثاث",`${(cfg.furn||[]).length} قطعة. خد مقاساتها من جدول الوحدات في 📐 قبل ما تشتري أو تفصّل.`]]; } const c=k=>POINTS.filter(p=>p.type===k).length;
  return [
    ["ثبّت الأجهزة ومقاساتها","اشتري الأجهزة أو اعرف موديلاتها ومقاساتها بالظبط، وحدّثها في تاب مقاسات الأجهزة. النجار والرخامجي هيشتغلوا عليها."],
    ["تأسيس الكهربا",`${c("socket")} نقطة كهربا حسب جدول الكهربائي في 📐. خط لوحده بأرضي للغسالة والتلاجة والفرن.`],
    ["تأسيس السباكة والغاز",`${c("water")} تغذية مية و${c("drain")} صرف${c("gas")?` و${c("gas")} مخرج غاز`:""}. اعمل اختبار ضغط قبل ما تقفل الحيطان.`],
    ["ماسورة الشفاط","حدد مسارها لبرة قبل المحارة، وقلل الكوعات على قد ما تقدر."],
    ["المحارة",`حوالي ${cfg.plaster} سم على كل حيطة. بعدها قيس المطبخ تاني، وحط المقاسات الجديدة في تاب الأوضة واختار "بعد التشطيب".`],
    ["الجبس والسقف","لو فيه جبس بورد وسبوتات، مع سلوك الإضاءة."],
    ["الأرضية","البورسلين قبل الدواليب، ويدخل تحتها."],
    ["النقاشة (الوش الأول)","المعجون والسيلر قبل النجار."],
    ["قياس النجار على الطبيعة","ادّيله رسومات الحيطان وجدول الوحدات من 📐، وخليه يقيس بنفسه بعد المحارة."],
    ["تركيب الدواليب السفلية","اتأكد من الميزان، وسيب أماكن الأجهزة بالمسافات الجانبية."],
    ["الرخامة","بعد تركيب السفلي. فتحة الحوض والمسطح بمقاسات الأجهزة الحقيقية."],
    ["السيراميك ورا الرخامة","بعد الرخامة عشان يقعد عليها مظبوط."],
    ["الدواليب العلوية والشفاط",`على ارتفاع ${cfg.uStart} سم من الأرض.`],
    ["الحوض والخلاط والأجهزة","وصّل المية والغاز، وجرّب التسريب قبل ما تقفل الدواليب."],
    ["التشطيب النهائي","آخر وش نقاشة، سيليكون حوالين الرخامة والحوض، وتنضيف."]
  ]; }
function stepsBox(){
  const st=STEPS(), done=st.filter((_,i)=>cfg.steps[i]).length;
  const d=document.createElement("div"); d.className="sum"; d.innerHTML=`خلصت <b>${done}</b> من ${st.length} خطوة`; ctlEl.appendChild(d);
  st.forEach(([a,b],i)=>{ const r=document.createElement("label"); r.className="step"+(cfg.steps[i]?" done":""); const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!cfg.steps[i];
    cb.onchange=()=>{ cfg.steps={...cfg.steps,[i]:cb.checked}; renderControls(); }; const tx=document.createElement("div"); tx.innerHTML=`<b>${i+1}. ${a}</b><br>${b}`; r.append(cb,tx); ctlEl.appendChild(r); });
}
// the prices on this tab can be saved once (kprices) and used by every new project, or pulled into an older one
function priceDefBox(){ const ks=SCHEMA[tab].filter(c=>c.t==="num"&&PRICE_KEYS.includes(c.k)).map(c=>c.k);
  const saved=ks.length&&ks.every(k=>k in PRICE_DEF&&PRICE_DEF[k]===(+cfg[k]||0)), diff=Object.keys(PRICE_DEF).some(k=>PRICE_DEF[k]!==(+cfg[k]||0));
  const box=document.createElement("div"); box.className="ctl act1 pricedef"; box.style.flexDirection="column";
  const n=document.createElement("div"); n.className="note"; n.textContent=saved?"✓ الأسعار دي هي الافتراضية، وأي مشروع جديد هياخدها.":"لو الأسعار دي هتستخدمها في كل حاجة، خليها افتراضية وأي مشروع جديد هياخدها لوحده."; box.appendChild(n);
  const sv=document.createElement("button"); sv.type="button"; sv.className="btn wide"+(saved?"":" main"); sv.id="priceSave"; sv.textContent="خلي الأسعار دي افتراضية"; sv.disabled=saved;
  sv.onclick=async()=>{ const rd=await stRead("kprices"); if(rd.err){ hint("مقدرتش أقرا الأسعار المحفوظة دلوقتي، جرّب تاني كمان شوية",4000); return; } /* never write over a key whose read failed */
    const d=cleanPrices(rd.v); for(const k of ks) d[k]=Math.max(0,+cfg[k]||0); await stSet("kprices",d); PRICE_DEF=d; hint("✓ الأسعار دي بقت افتراضية لأي مشروع جديد"); renderControls(); };
  box.appendChild(sv);
  if(diff){ const ap=document.createElement("button"); ap.type="button"; ap.className="btn wide"; ap.id="priceApply"; ap.textContent="طبّق الأسعار الافتراضية على المشروع ده";
    ap.onclick=()=>{ pushHist(); Object.assign(cfg,PRICE_DEF); build(); renderControls(); hint("✓ اتطبقت الأسعار الافتراضية"); }; box.appendChild(ap); }
  ctlEl.appendChild(box); }
function costBox(){
  const a=STATS.acc||{lower:0,upper:0,tall:0,marble:0}, f=v=>v.toFixed(2);
  const t=a.lower*cfg.pLower+a.upper*cfg.pUpper+a.tall*cfg.pTall+a.marble*cfg.pMarble;
  const d=document.createElement("div"); d.className="sum";
  d.innerHTML=`الدواليب السفلية: <b>${f(a.lower)} م</b><br>الدواليب العلوية: <b>${f(a.upper)} م</b> <small>(الدولاب اللي للسقف محسوب دورين)</small><br>الدواليب الطول: <b>${f(a.tall)} م</b><br>الرخامة: <b>${f(a.marble)} م</b>`+
    (t>0?`<hr>الإجمالي التقريبي: <b>${Math.round(t).toLocaleString("ar-EG")} جنيه</b>`:`<hr><small>اكتب أسعار المتر اللي النجار والرخامجي قالولك عليها، والإجمالي هيتحسب لوحده.</small>`);
  return d;
}
renderTabs(); renderControls();

function resize(){ poke(); /* setSize clears the canvas */ // the stage is sized by CSS: full screen, above the phone sheet, or beside the docked panel
  const w=stage.clientWidth||innerWidth, h=stage.clientHeight||innerHeight; if(w<2||h<2) return;
  canvas.style.width=w+"px"; canvas.style.height=h+"px";
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
  if(APT3D){ if(!FP.on) aptView(false); } else if(VIEWS[view] && (VIEWS[view].fit||VIEWS[view].sideW) && !camTouched) setView(view);
}
addEventListener("resize",resize);
if(MQ.desk.matches){ panelOpen=true; panel.classList.add("open"); document.body.classList.add("panel-open"); } // desktop starts with the panel docked
resize(); setView("out"); build(); initProjects();
document.querySelectorAll("#pad button").forEach(b=>{
  let t=null; const step=()=>{ const m=b.dataset.m;
    if(FP.on){ if(m==="l") FP.yaw+=0.05; if(m==="r") FP.yaw-=0.05; if(m==="f") fpMove(0.05); if(m==="b") fpMove(-0.05); return; }
    camTouched=true; if(m==="l") sph.theta+=0.06; if(m==="r") sph.theta-=0.06;
    if(m==="f"||m==="b"){ const dx=target.x-camera.position.x, dz=target.z-camera.position.z, L=Math.hypot(dx,dz)||1, k=(m==="f"?0.06:-0.06);
      target.x=Math.max(0.6,Math.min(RW-0.3,target.x+dx/L*k)); target.z=Math.max(0.3,Math.min(RL+0.6,target.z+dz/L*k)); } };
  const start=e=>{ e.preventDefault(); clearInterval(t); step(); t=setInterval(step,40); }, stop=()=>{ clearInterval(t); t=null; };
  b.addEventListener("pointerdown",start); b.addEventListener("pointerup",stop); b.addEventListener("pointerleave",stop); b.addEventListener("pointercancel",stop);
});
function takeShot(){ updateCam(); renderer.render(scene,camera); const url=canvas.toDataURL("image/png");
  const sh=document.getElementById("shot"); sh.querySelector("img").src=url; sh.style.display="flex";
  try{ const a=document.createElement("a"); a.href=url; a.download="kitchen.png"; document.body.appendChild(a); a.click(); a.remove(); }catch(e){} }
document.getElementById("shotClose").onclick=()=>document.getElementById("shot").style.display="none";
let camKey="";
(function loop(){ flushLive(); walkTick(); if(cfg.autoRot && pts.size===0) sph.theta+=0.004;
  const k=[sph.theta,sph.phi,sph.r,target.x,target.y,target.z,FP.on,FP.x,FP.z,FP.yaw,FP.pitch,camera.aspect].join(); /* catches camera moves from held buttons and code */
  if(DIRTY>0||k!==camKey||drag){ camKey=k; updateCam(); renderer.render(scene,camera); emptyTrash(); if(DIRTY>0) DIRTY--; } requestAnimationFrame(loop); })();
