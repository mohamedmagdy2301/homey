// =================== UI ===================
const panel=document.getElementById("panel");
let panelOpen=false;
function setPanel(o){ panelOpen=o; panel.classList.toggle("open",o); document.getElementById("stats").style.display=o?"none":"flex"; resize(); }
document.getElementById("open").onclick=()=>setPanel(!panelOpen);
document.getElementById("drawBtn").onclick=()=>openDraw();
document.getElementById("projBtn").onclick=()=>openSheet();
document.getElementById("wizClose").onclick=()=>closeWizard(false);
document.getElementById("wizBack").onclick=()=>{ if(WIZ&&WIZ.step>0){ WIZ.step--; renderWiz(); } };
document.getElementById("wizNext").onclick=()=>{ if(!WIZ) return; if(WIZ.step<WSTEPS.length-1){ WIZ.step++; renderWiz(); document.getElementById("wizBody").scrollTop=0; } else closeWizard(true); };
document.getElementById("dclose").onclick=()=>{ document.getElementById("draw").style.display="none"; DRAW_DOC=false; };
document.getElementById("dprint").onclick=()=>{ try{ window.print(); }catch(e){} };
document.getElementById("close").onclick=()=>setPanel(false);
const hist=[]; function pushHist(){ hist.push(JSON.stringify(cfg)); if(hist.length>60) hist.shift(); }
document.getElementById("undo").onclick=()=>{ if(!hist.length) return; cfg=JSON.parse(hist.pop()); build(); renderControls(); };
document.getElementById("reset").onclick=()=>{ pushHist(); const t=cfg.template||"mine"; const keep={roomW:cfg.roomW,roomL:cfg.roomL,dimsOn:cfg.dimsOn,plaster:cfg.plaster,tileT:cfg.tileT,ceil:cfg.ceil}; cfg=newCfg(t); if(t!=="mine"){ Object.assign(cfg,keep); applyTemplate(cfg,t,true); } SEL=null; build(); renderControls(); };

function fill(sel,obj,val){ sel.innerHTML=""; for(const [k,v] of Object.entries(obj)){const o=document.createElement("option");o.value=k;o.textContent=v.name;sel.appendChild(o);} sel.value=val; }
const viewSel=document.getElementById("view"); fill(viewSel,VIEWS,"out"); viewSel.onchange=()=>setView(viewSel.value);

let tab=Object.keys(SCHEMA)[0];
const tabsEl=document.getElementById("tabs"); let ctlEl=document.getElementById("controls");
function tabsFor(){ if(cfg.roomType==="room") return ["الأثاث","الأوضة","السقف","الدهان والأرضية","المية والكهربا","الشكل","العرض","الوحدات","خطوات التنفيذ","المشاريع"]; if(cfg.roomType==="hall") return ["الأوضة","السقف","الدهان والأرضية","الشكل","العرض","المشاريع"]; return cfg.roomType==="bath"?["الحمام","الأوضة","السقف","التشطيب","المية والكهربا","الشكل","العرض","الوحدات","خطوات التنفيذ","المشاريع"]:Object.keys(SCHEMA).filter(t=>!["الحمام","التشطيب","الأثاث","الدهان والأرضية","السقف"].includes(t)).flatMap(t=>t==="الارتفاعات"?[t,"السقف"]:[t]); }
function renderTabs(){ tabsEl.innerHTML=""; if(!tabsFor().includes(tab)) tab=tabsFor()[0]; for(const t of tabsFor()){ const b=document.createElement("button"); b.textContent=t; b.className=t===tab?"on":""; b.onclick=()=>{tab=t;renderTabs();renderControls();}; tabsEl.appendChild(b);} }
function renderControls(){
  ctlEl.innerHTML="";
  for(const c of SCHEMA[tab]){
    if(c.t==="head"){ const h=document.createElement("div"); h.className="head"; h.textContent=c.l; ctlEl.appendChild(h); continue; }
    const row=document.createElement("div"); row.className="ctl";
    const lb=document.createElement("label"); lb.textContent=c.l; row.appendChild(lb);
    let el;
    if(c.t==="select"){ el=document.createElement("select"); for(const [v,n] of c.o){const o=document.createElement("option");o.value=v;o.textContent=n;el.appendChild(o);}
      el.value=c.k==="style"?(cfg.style||"light"):cfg[c.k];
      el.onchange=()=>{ pushHist(); if(c.k==="style"){ cfg.style=v; Object.assign(cfg,STYLES[el.value]); if(cfg.handles!=="none") cfg.handles=["#c6a25a","#c9a45c","#b8925a"].includes(cfg.cHandle)?"gold":"black"; /* the style's handle color picks the handle finish */ build(); renderControls(); return;} cfg[c.k]=el.value;
        build(); renderControls(); }; row.appendChild(el); }
    if(c.t==="toggle"){ const w=document.createElement("label"); w.className="sw"; el=document.createElement("input"); el.type="checkbox"; el.checked=!!cfg[c.k];
      el.onchange=()=>{pushHist(); cfg[c.k]=el.checked; build();}; w.appendChild(el); w.appendChild(document.createElement("i")); row.appendChild(w); }
    if(c.t==="range"){ el=document.createElement("input"); el.type="range"; el.min=c.min; el.max=c.max; el.step=c.step; el.value=+cfg[c.k];
      const out=numIn(cfg[c.k],c.min,c.max,c.u,v=>{ pushHist(); cfg[c.k]=v; el.value=v; build(); renderControls(); });
      el.addEventListener("pointerdown",pushHist); el.addEventListener("keydown",pushHist);
      el.oninput=()=>{cfg[c.k]=+el.value; out.set(el.value); SLIDING=true; build(); SLIDING=false;}; row.appendChild(el); row.appendChild(out); }
    if(c.t==="color"){ el=document.createElement("input"); el.type="color"; el.value=cfg[c.k]; el.addEventListener("click",pushHist); el.oninput=()=>{cfg[c.k]=el.value; build();}; row.appendChild(el); }
    if(c.t==="num"){ el=document.createElement("input"); el.type="number"; el.min=0; el.inputMode="numeric"; el.placeholder="جنيه"; el.value=cfg[c.k]||"";
      el.onchange=()=>{ pushHist(); cfg[c.k]=+el.value||0; renderControls(); }; row.appendChild(el); }
    if(c.t==="action"){ row.innerHTML=""; const b=document.createElement("button"); b.className="btn main"; b.style.flex="1"; b.textContent=c.l; b.onclick=c.fn; row.appendChild(b); }
    ctlEl.appendChild(row);
  }
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
function unitsBox(){
  const n=document.createElement("div"); n.className="note"; n.textContent="دوس على أي دولاب في الـ3D وهيتحدد هنا، أو اختار من القايمة. غيّر نوع الواجهة لكل وحدة لوحدها.";
  ctlEl.appendChild(n);
  let lastWall=null;
  for(const u of UNITS){
    if(u.wall!==lastWall){ const h=document.createElement("div"); h.className="head"; h.textContent=WALLS[u.wall].name; ctlEl.appendChild(h); lastWall=u.wall; }
    const r=document.createElement("div"); r.className="urow"+(u.id===SEL?" sel":""); r.dataset.uid=u.id;
    const w=Math.round((u.a1-u.a0)*100), hh=Math.round((u.y1-u.y0)*100);
    r.innerHTML=`<span class="n">${u.n}</span><span class="t">${u.label||KN[u.kind]||u.kind}<small>عرض ${w} • ارتفاع ${hh} • عمق ${Math.round(u.depth*100)} سم</small></span>`;
    r.querySelector(".t").onclick=()=>{ selectUnit(u.id,false); renderControls(); const rr=ctlEl.querySelector(`[data-uid="${u.id}"]`); if(rr) rr.scrollIntoView({block:"nearest"}); };
    if(CABK.has(u.kind)&&!cfg.openCab){ const ob=document.createElement("button"); ob.className="btn"+(OPENSET.has(u.id)?" on":""); ob.textContent="🚪"; ob.setAttribute("aria-label","افتح الدولاب"); ob.onclick=()=>{ OPENSET.has(u.id)?OPENSET.delete(u.id):OPENSET.add(u.id); SEL=u.id; build(); renderControls(); }; r.appendChild(ob); }
    const opts=FRONTS[u.kind];
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
    ctlEl.appendChild(r);
  }
  const b=document.createElement("button"); b.className="btn"; b.style.marginTop="10px"; b.textContent="رجّع كل الوحدات تلقائي";
  b.onclick=()=>{ pushHist(); cfg.units={}; build(); }; ctlEl.appendChild(b);
}
function fieldRow(parent,label,el,out){ const row=document.createElement("div"); row.className="ctl"; const lb=document.createElement("label"); lb.textContent=label; row.appendChild(lb); row.appendChild(el); if(out) row.appendChild(out); parent.appendChild(row); }
function objSelect(parent,obj,k,label,opts,after){ const el=document.createElement("select"); for(const [v,t] of opts){ const o=document.createElement("option"); o.value=v; o.textContent=t; el.appendChild(o);} el.value=obj[k]==null?"":String(obj[k]);
  el.onchange=()=>{ pushHist(); obj[k]=el.value; if(after) after(); build(); UI_REFRESH(); }; fieldRow(parent,label,el); }
function numIn(val,min,max,unit,onSet){ const w=document.createElement("span"); w.className="numw"; const n=document.createElement("input"); n.type="number"; n.inputMode="decimal"; n.className="num"; n.value=val; n.min=min; n.max=max;
  const u=document.createElement("small"); u.textContent=unit||""; n.onchange=()=>{ let v=+n.value; if(isNaN(v)) return; v=Math.max(min,Math.min(max,v)); n.value=v; onSet(v); }; n.onkeydown=e=>{ if(e.key==="Enter") n.blur(); }; w.append(n,u); w.set=v=>{ n.value=v; }; return w; }
function objRange(parent,obj,k,label,min,max,step){ if(obj[k]==null) obj[k]=min; const el=document.createElement("input"); el.type="range"; el.min=min; el.max=Math.max(min+1,max); el.step=step||1; el.value=obj[k];
  const out=numIn(obj[k],min,Math.max(min+1,max),"سم",v=>{ pushHist(); obj[k]=v; el.value=v; build(); UI_REFRESH(); }); el.addEventListener("pointerdown",pushHist); el.addEventListener("keydown",pushHist);
  el.oninput=()=>{ obj[k]=+el.value; out.set(el.value); SLIDING=true; build(); SLIDING=false; }; fieldRow(parent,label,el,out); }
function appsBox(){
  const n=document.createElement("div"); n.className="note"; n.textContent="ضيف أي جهاز تاني وحدد مكانه ومقاسه. الأجهزة اللي على الحيطة الشمال بتدخل في ترتيبها، وكل الأجهزة تقدر تسحبها بصباعك في الـ3D.";
  ctlEl.appendChild(n);
  const ar=document.createElement("div"); ar.className="addrow"; const ts=document.createElement("select"); for(const [k,v] of Object.entries(APPS)){ const o=document.createElement("option"); o.value=k; o.textContent=v.n; ts.appendChild(o); }
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕ ضيف";
  ab.onclick=()=>{ pushHist(); const T=APPS[ts.value], id="a"+Math.random().toString(36).slice(2,7);
    const lo=locOpts(T.cls), loc=T.cls==="wall"?"RT":(lo[0]?lo[0][0]:"L"); const pos=Math.max(0,Math.round((wlen(W4.includes(loc)?loc:"L")*100-T.w)/2));
    cfg.apps=[...(cfg.apps||[]),{id,type:ts.value,w:T.w,d:T.d,h:T.h,y:T.y||0,loc,pos}]; build(); renderControls(); hint(`اتضاف ${T.n} ✓`); };
  ar.append(ts,ab); ctlEl.appendChild(ar);
  for(const a of cfg.apps||[]){ const T=APPS[a.type]; if(!T) continue; const card=document.createElement("div"); card.className="card";
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${T.n}</b>`; const del=document.createElement("button"); del.className="btn"; del.textContent="🗑 شيل";
    del.onclick=()=>{ pushHist(); cfg.apps=cfg.apps.filter(x=>x.id!==a.id); build(); renderControls(); }; hd.appendChild(del); card.appendChild(hd);
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
  const ar=document.createElement("div"); ar.className="addrow"; const ts=document.createElement("select");
  for(const [k,v] of [["lower","دولاب سفلي برخامة"],["upper","دولاب علوي"],["tall","دولاب طول من الأرض"],["shelf","أرفف مفتوحة"]]){ const o=document.createElement("option"); o.value=k; o.textContent=v; ts.appendChild(o); }
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕ ضيف";
  ab.onclick=()=>{ pushHist(); const t=ts.value, id="c"+Math.random().toString(36).slice(2,7);
    const c={id,type:t,wall:"RT",pos:100,w:60,d:t==="shelf"?25:t==="upper"?35:(t==="tall"?40:35),h:t==="tall"?Math.round(H*100)-1:t==="upper"?72:90,y:t==="upper"?cfg.uStart:130,front:t==="shelf"?"open":(t==="tall"?"auto":"doors"),n:"",shelves:3,acc:""};
    cfg.custom=[...(cfg.custom||[]),c]; SEL=id; build(); renderControls(); hint("اتضافت الوحدة ✓"); };
  ar.append(ts,ab); ctlEl.appendChild(ar);
  const TN={lower:"دولاب سفلي",upper:"دولاب علوي",tall:"دولاب طول",shelf:"أرفف مفتوحة"};
  for(const c of cfg.custom||[]){ const u=UNITS.find(x=>x.id===c.id); const card=document.createElement("div"); card.className="card"+(c.id===SEL?" sel":"");
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<span class="n" style="min-width:24px;height:24px;border-radius:50%;background:#2d5f7a;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center">${u?u.n:"?"}</span><b>${TN[c.type]}</b>`;
    const del=document.createElement("button"); del.className="btn"; del.textContent="🗑 شيل"; del.onclick=()=>{ pushHist(); cfg.custom=cfg.custom.filter(x=>x.id!==c.id); build(); renderControls(); };
    hd.onclick=e=>{ if(e.target!==del) selectUnit(c.id,false); }; hd.appendChild(del); card.appendChild(hd);
    objSelect(card,c,"wall","الحيطة",W4OPT());
    objRange(card,c,"pos","بعدها عن الركن",0,Math.round(wallLen(c.wall)*100)-c.w,1);
    objRange(card,c,"w","العرض",15,250,1); objRange(card,c,"d","العمق",10,70,1);
    if(c.type!=="lower") objRange(card,c,"h","الارتفاع",15,Math.round(H*100),1);
    if(c.type==="upper"||c.type==="shelf") objRange(card,c,"y","بتبدأ من ارتفاع",20,Math.round(H*100)-20,1);
    if(c.type!=="shelf"){ objSelect(card,c,"front","الواجهة",(c.type==="lower"?FRONTS.base:c.type==="upper"?FRONTS.upper:FRONTS.tall));
      objSelect(card,c,"n","عدد الضلف / الأدراج",[["","تلقائي"],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"]]); }
    if(c.type==="shelf"||c.front==="open") objSelect(card,c,"shelves","عدد الرفوف",[["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"]]);
    objSelect(card,c,"acc","إكسسوار",ACCS);
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
    const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${FT.cut}</b>`; const del=document.createElement("button"); del.className="btn"; del.textContent="🗑 شيل"; del.onclick=onDel; hd.appendChild(del); card.appendChild(hd);
    objSelect(card,f,"corner","أنهي ركن",[["WL","القدامي الشمال"],["WR","القدامي اليمين"],["DL","اللي ورا الشمال"],["DR","اللي ورا اليمين"]]);
    objSelect(card,f,"shape","الشكل",[["rect","ركن مقصوص (الأوضة L)"],["diag","حيطة مايلة (ركن مشطوف)"]]);
    objRange(card,f,"a","المقصوص من العرض",20,Math.max(21,cfg.roomW-40),1); objRange(card,f,"b","المقصوص من الطول",20,Math.max(21,cfg.roomL-40),1);
    const n=document.createElement("div"); n.className="note"; n.textContent="الجزء ده بيبقى برة الأوضة: مفيش فيه أرضية ولا دواليب ولا أثاث، والحيطان بتلف حواليه."; card.appendChild(n); parent.appendChild(card); return; }
  const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${FT[f.type]}</b>`;
  const del=document.createElement("button"); del.className="btn"; del.textContent="🗑 شيل"; del.onclick=onDel; hd.appendChild(del); card.appendChild(hd);
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
  const ar=document.createElement("div"); ar.className="addrow"; const ts=document.createElement("select");
  for(const t of types){ const o=document.createElement("option"); o.value=t; o.textContent=FT[t]; ts.appendChild(o); }
  const ws=document.createElement("select"); for(const [k,v] of W4OPT()){ const o=document.createElement("option"); o.value=k; o.textContent=v; ws.appendChild(o); }
  ws.value=types.includes("door")?"D":types.includes("window")?"W":"L";
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕";
  ab.onclick=()=>{ pushHist(); cfg.feats=[...(cfg.feats||[]),defFeat(ts.value,ws.value)]; build(); UI_REFRESH(); hint(`اتضاف ${FT[ts.value]} ✓`); };
  ar.append(ts,ws,ab); parent.appendChild(ar);
  for(const f of (cfg.feats||[]).filter(x=>types.includes(x.type))) featCard(parent,f,()=>{ pushHist(); cfg.feats=cfg.feats.filter(x=>x!==f); if(cfg.place.f==="N:"+f.id) cfg.place.f=firstCounter(); if(cfg.place.w==="N:"+f.id) cfg.place.w=firstCounter(); build(); UI_REFRESH(); });
}
function planSVG(){
  const S=Math.min(300/Math.max(RW,0.1),380/Math.max(RL,0.1),120), m=34, W=RW*S+2*m, Hh=RL*S+2*m+10, X=x=>m+x*S, Z=z=>m+z*S;
  let s=`<svg viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" font-family="Tahoma,Arial" font-size="11" style="width:100%;max-height:48vh;display:block"><rect x="${X(0)}" y="${Z(0)}" width="${RW*S}" height="${RL*S}" fill="#fff" stroke="#30343a" stroke-width="5"/>`;
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
  return s+"</svg>";
}
function roomBox(){
  const top=document.createElement("div"); top.innerHTML=`<div class="sum" id="roomSum"></div><div id="roomPlan" class="planbox"></div>`; ctlEl.insertBefore(top,ctlEl.firstChild);
  const act=document.createElement("div"); act.className="act"; const b1=document.createElement("button"); b1.className="btn main"; b1.textContent="🧭 المعالج خطوة بخطوة"; b1.onclick=()=>openWizard(false);
  const b2=document.createElement("select"); b2.setAttribute("aria-label","غيّر شكل المطبخ"); b2.innerHTML=`<option value="">🔁 غيّر القالب…</option>`+Object.entries(cfg.roomType==="bath"?BTEMPLATES:cfg.roomType==="hall"?HTEMPLATES:cfg.roomType==="room"?RTEMPLATES:TEMPLATES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("");
  b2.onchange=()=>{ if(!b2.value) return; pushHist(); applyTemplate(cfg,b2.value,b2.value!=="mine"); build(); renderControls(); hint("اتغير شكل المطبخ ✓"); };
  act.append(b1,b2); top.appendChild(act);
  const h=document.createElement("div"); h.className="head"; h.textContent="🧱 الشبابيك والأبواب والبروزات"; ctlEl.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="أول الحيطة: الحيطة القدامية واللي ورا بتتقاس من ناحية الشمال، والحيطة الشمال واليمين بتتقاس من ناحية القدامية."; ctlEl.appendChild(n);
  featuresEditor(ctlEl,Object.keys(FT));
  updRoomPreview();
}
function updRoomPreview(){ const d=document.getElementById("roomSum"); if(d){ d.innerHTML=`المقاس الصافي بعد التشطيب: <b>عرض ${Math.round(RW*100)} × طول ${Math.round(RL*100)} سم</b>`+(cfg.dimsOn==="brick"?`<br><small>المحارة والسيراميك بياخدوا ${(cfg.plaster+cfg.tileT)} سم من كل حيطة.</small>`:"")+`<br><small>أضيق ممر ${STATS.walk} سم • ${tplName(cfg.template)}</small>`; }
  const p=document.getElementById("roomPlan"); if(p) p.innerHTML=planSVG(); }
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
const MEMS={}, PENDING=new Set(), DELETED=new Set(); let retryT=null, lastSaved={};
// {v} = value (null when the key doesn't exist); {v:null,err:true} = the read itself failed, so never overwrite that key with defaults
async function stRead(k){ if(k in MEMS) return {v:clone(MEMS[k])};
  try{ const r=await window.storage.get(k,false); storageOK=storageOK===false?false:true; if(r){ const v=JSON.parse(r.value); MEMS[k]=v; return {v:clone(v)}; } return {v:null}; }catch(e){ if(!window.storage) storageOK=false; return {v:null,err:true}; } }
async function stGet(k){ return (await stRead(k)).v; }
async function rawSet(k){ try{ const txt=JSON.stringify(MEMS[k]); if(lastSaved[k]===txt){ PENDING.delete(k); return true; } const r=await window.storage.set(k,txt,false); if(r){ lastSaved[k]=txt; PENDING.delete(k); storageOK=true; return true; } }catch(e){} PENDING.add(k); storageOK=false; clearTimeout(retryT); retryT=setTimeout(retryPending,6000); return false; }
async function retryPending(){ for(const k of [...PENDING]) if(k in MEMS) await rawSet(k); else PENDING.delete(k); if(PENDING.size){ clearTimeout(retryT); retryT=setTimeout(retryPending,15000); } }
async function stSet(k,v){ MEMS[k]=clone(v); return rawSet(k); }
async function stDel(k){ delete MEMS[k]; delete lastSaved[k]; PENDING.delete(k); try{ await window.storage.delete(k,false); }catch(e){} }
// the timer waits while another room's cfg is swapped in (apartment snapshots / 3D / compare)
function autosave(){ if(loadingP||WIZ) return; clearTimeout(saveT); saveT=setTimeout(function tick(){ if(loadingP||APT_BUILD||APT3D){ saveT=setTimeout(tick,1000); return; } saveNow(); },2500); }
async function saveNow(){ clearTimeout(saveT); if(loadingP||APT_BUILD||APT3D||DELETED.has(PROJ.id)) return;
  const e={id:PROJ.id,name:PROJ.name,t:Date.now()}; const i=projIndex.findIndex(p=>p.id===PROJ.id); if(i>=0) projIndex[i]=e; else projIndex.push(e);
  await stSet("kproj:"+PROJ.id,{name:PROJ.name,cfg}); await stSet("kproj:index",projIndex); }
function updProjName(){ document.getElementById("projName").textContent=PROJ.name; }
async function initProjects(){
  projIndex=((await stGet("kproj:index"))||[]).filter(p=>p&&p.id).map(p=>({...p,name:cleanName(p.name)})); await loadApt();
  if(projIndex.length){ const last=[...projIndex].sort((a,b)=>b.t-a.t)[0]; const d=await stGet("kproj:"+last.id); if(d&&d.cfg){ PROJ={id:last.id,name:cleanName(d.name)||last.name}; cfg=migrate(d.cfg); } }
  loadingP=false; updProjName(); build(); renderControls(); autosave();
}
async function openProject(id){ const rd=await stRead("kproj:"+id); let d=rd.v; if(rd.err){ hint("مقدرتش أقرا المشروع ده من الحفظ دلوقتي، جرّب تاني كمان شوية",4000); return; } if(!d){ const nm=projName(id); d={name:nm,cfg:newCfg(nm.includes("طرقة")?"h_hall":nm.includes("حمام")?"b_std":"L")}; await stSet("kproj:"+id,d); hint("المشروع ده ماكانش اتحفظ، فتحته من جديد بالشكل الافتراضي",4000); } await saveNow(); PROJ={id,name:cleanName(d.name)||projName(id)}; cfg=migrate(d.cfg); hist.length=0; SEL=null; updProjName(); build(); renderControls(); closeSheet(); setView("out"); hint(`اتفتح "${PROJ.name}"`); }
function projectsBox(){ renderProjects(ctlEl); }
function renderProjects(el){
  const n=document.createElement("div"); n.className="note"; n.textContent=storageOK===false?"⚠ الحفظ الدايم متعطل دلوقتي، وبحاول تاني لوحدي كل شوية. شغلك محفوظ طول ما الصفحة مفتوحة، ولو هتقفلها انسخ الإعدادات من تحت.":"كل مطبخ بيتحفظ لوحده تلقائي. تقدر تعمل أكتر من مطبخ وتقارن بينهم."; el.appendChild(n);
  const ab=document.createElement("button"); ab.className="btn"; ab.style.cssText="width:100%;margin-bottom:8px;padding:10px"; ab.innerHTML="🏢 <b>الشقة</b> — اربط المطبخ والحمامات والطرقة"; ab.onclick=()=>{ closeSheet(); openApt(); }; el.appendChild(ab);
  const nb=document.createElement("button"); nb.className="btn main"; nb.style.width="100%"; nb.textContent="➕ مطبخ أو حمام أو أوضة جديدة (بالمعالج)"; nb.onclick=()=>{ closeSheet(); openWizard(true); }; el.appendChild(nb);
  const list=[...projIndex]; if(!list.some(p=>p.id===PROJ.id)) list.push({id:PROJ.id,name:PROJ.name,t:Date.now()});
  list.sort((a,b)=>b.t-a.t).forEach(p=>{ const card=document.createElement("div"); card.className="card"+(p.id===PROJ.id?" sel":"");
    card.innerHTML=`<div class="ch"><b>${p.id===PROJ.id?"✓ ":""}${esc(p.name)}</b><small style="color:#6b737c">${new Date(p.t).toLocaleDateString("ar-EG")}</small></div>`;
    const act=document.createElement("div"); act.className="act";
    const mk=(t,fn)=>{ const b=document.createElement("button"); b.className="btn"; b.textContent=t; b.onclick=fn; act.appendChild(b); };
    if(p.id!==PROJ.id) mk("فتح",()=>openProject(p.id));
    mk("✏️ اسم",async()=>{ const inp=document.createElement("input"); inp.value=p.name; inp.style.cssText="flex:1;font:inherit;padding:6px;border:1px solid #c9ced3;border-radius:8px"; const ok=document.createElement("button"); ok.className="btn main"; ok.textContent="حفظ";
      act.innerHTML=""; act.append(inp,ok); inp.focus(); ok.onclick=async()=>{ const nm=cleanName(inp.value)||p.name; if(p.id===PROJ.id){ PROJ.name=nm; updProjName(); await saveNow(); } else { const d=await stGet("kproj:"+p.id); if(d){ d.name=nm; await stSet("kproj:"+p.id,d); } const i=projIndex.findIndex(x=>x.id===p.id); if(i>=0) projIndex[i].name=nm; await stSet("kproj:index",projIndex); } refreshSheet(); }; });
    mk("📄 نسخة",async()=>{ const d=p.id===PROJ.id?{name:PROJ.name,cfg}:await stGet("kproj:"+p.id); if(!d) return; const id="p"+Date.now().toString(36); await stSet("kproj:"+id,{name:d.name+" (نسخة)",cfg:d.cfg}); projIndex.push({id,name:d.name+" (نسخة)",t:Date.now()}); await stSet("kproj:index",projIndex); refreshSheet(); });
    if(list.length>1) mk("🗑",async()=>{ act.innerHTML=""; const q=document.createElement("span"); q.textContent="متأكد؟"; q.style.alignSelf="center"; const y=document.createElement("button"); y.className="btn main"; y.textContent="امسح"; const c=document.createElement("button"); c.className="btn"; c.textContent="لأ";
      act.append(q,y,c); c.onclick=refreshSheet; y.onclick=async()=>{ DELETED.add(p.id); if(p.id===PROJ.id) clearTimeout(saveT); await stDel("kproj:"+p.id); projIndex=projIndex.filter(x=>x.id!==p.id); await stSet("kproj:index",projIndex);
        if(p.id===PROJ.id){ const nx=projIndex[0]; if(nx) await openProject(nx.id); if(PROJ.id===p.id){ PROJ={id:"p"+Date.now().toString(36),name:PROJ.name}; hist.length=0; updProjName(); await saveNow(); } } refreshSheet(); }; });
    card.appendChild(act); el.appendChild(card); });
  backupUI(el);
  compareUI(el);
  const h=document.createElement("div"); h.className="head"; h.textContent="📋 نسخ ومشاركة (مشروع واحد)"; el.appendChild(h);
  const ta=document.createElement("textarea"); ta.value=JSON.stringify(cfg);
  const st=document.createElement("div"); st.className="note";
  const a2=document.createElement("div"); a2.className="act";
  const cp=document.createElement("button"); cp.className="btn"; cp.textContent="نسخ إعدادات المطبخ ده"; cp.onclick=async()=>{ ta.select(); try{ await navigator.clipboard.writeText(ta.value); st.textContent="اتنسخت، ابعتها لأي حد"; }catch(e){ document.execCommand&&document.execCommand("copy"); st.textContent="اتنسخت"; } };
  const ap=document.createElement("button"); ap.className="btn"; ap.textContent="افتح إعدادات ملصوقة كمطبخ جديد"; ap.onclick=async()=>{ try{ const v=JSON.parse(ta.value); if(!v||typeof v!=="object"||Array.isArray(v)) throw new Error("bad"); await saveNow(); PROJ={id:"p"+Date.now().toString(36),name:"مطبخ ملصوق"}; cfg=migrate(v); hist.length=0; SEL=null; build(); updProjName(); await saveNow(); refreshSheet(); st.textContent="اتفتح ✓"; }catch(e){ st.textContent="الكلام الملصوق مش مظبوط"; } };
  a2.append(cp,ap); el.append(ta,a2,st);
}
function openSheet(){ const s=document.getElementById("sheet"); s.style.display="flex"; refreshSheet(); }
function closeSheet(){ document.getElementById("sheet").style.display="none"; }
function refreshSheet(){ const b=document.getElementById("sheetBody"); if(document.getElementById("sheet").style.display==="flex"){ b.innerHTML=""; renderProjects(b); } if(tab==="المشاريع") renderControls(); }
// ======== wizard ========
const WSTEPS=["شكل المطبخ","المقاسات","الأبواب والشبابيك","البروزات والأعمدة والتجاويف","مكان الأجهزة","جاهز"];
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
  if(k==="h_hall") b+=`<rect x="22" y="6" width="16" height="48" fill="#f4f1ec"/>`;
  if(k.startsWith("b_")){ const o=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#e6edf1" stroke="#8a9aa5"/>`;
    if(k==="b_guest") b+=o(30,14,6,8)+r(6,30,8,12,"#cfe3ee");
    if(k==="b_small") b+=r(6,40,48,14,"#d4ebf3")+o(12,28,6,5)+r(6,8,8,10,"#cfe3ee");
    if(k==="b_std") b+=r(38,6,16,16,"#d4ebf3")+o(12,14,6,5)+r(6,26,8,12,"#cfe3ee");
    if(k==="b_tub") b+=r(6,6,48,12,"#d4ebf3")+o(12,30,6,5)+r(6,40,8,12,"#cfe3ee");
    if(k==="b_laundry") b+=r(6,6,12,12,"#e3e5e7")+r(20,6,12,12,"#e3e5e7")+r(46,30,8,10,"#cfe3ee");
    if(k==="b_master") b+=r(6,6,32,12,"#d4ebf3")+r(40,6,14,16,"#c8e2ec")+o(12,30,6,5)+r(46,28,8,18,"#cfe3ee"); }
  return b+"</svg>"; }
function openWizard(isNew){ saveNow(); WIZ={step:0,isNew,backup:clone(cfg),backupProj:{...PROJ},backupHist:hist.slice(),name:isNew?"مطبخ جديد":PROJ.name}; tabsEl.dataset.rt=""; if(isNew) cfg=newCfg("L"); UI_REFRESH=renderWiz; document.getElementById("wiz").style.display="flex"; build(); renderWiz(); }
function closeWizard(apply){ const w=WIZ; WIZ=null; UI_REFRESH=()=>renderControls(); document.getElementById("wiz").style.display="none";
  if(!apply){ cfg=w.backup; PROJ=w.backupProj; hist.length=0; hist.push(...w.backupHist); }
  else if(w.isNew){ PROJ={id:"p"+Date.now().toString(36),name:cleanName(w.name)||"مطبخ جديد"}; hist.length=0; }
  else PROJ.name=cleanName(w.name)||PROJ.name;
  updProjName(); build(); renderControls(); setView("out"); if(apply){ saveNow(); hint("✓ المطبخ جاهز، عدّل أي حاجة من ⚙ التحكم",4000); } }
function updWizPreview(){ const p=document.getElementById("wizPlan"); if(p) p.innerHTML=planSVG(); const s=document.getElementById("wizWarn"); if(s) s.innerHTML=(STATS.warn||[]).slice(0,3).map(w=>`<div>⚠ ${esc(w)}</div>`).join(""); }
function renderWiz(){
  if(!WIZ) return; const body=document.getElementById("wizBody"); body.innerHTML="";
  document.getElementById("wizTitle").textContent=`${WIZ.step+1}/${WSTEPS.length} • ${WSTEPS[WIZ.step]}`;
  document.getElementById("wizBar").style.width=((WIZ.step+1)/WSTEPS.length*100)+"%";
  const pv=document.createElement("div"); pv.innerHTML=`<div id="wizPlan" class="planbox"></div><div id="wizWarn" class="note" style="color:#8a2a1c"></div>`; body.appendChild(pv);
  const hostEl=document.createElement("div"); body.appendChild(hostEl); const saveCtl=ctlEl; ctlEl=hostEl;
  const st=WIZ.step;
  if(st===0){ const inp=document.createElement("input"); inp.value=WIZ.name; inp.placeholder="اسم المطبخ"; inp.style.cssText="width:100%;font:inherit;font-size:15px;padding:9px;border:1px solid #c9ced3;border-radius:10px;margin:6px 0";
    inp.oninput=()=>{ WIZ.name=inp.value; }; hostEl.appendChild(inp);
    const tg=document.createElement("div"); tg.className="act"; for(const [rt,lb,def] of [["kitchen","🍳 مطبخ","L"],["bath","🚿 حمام","b_std"],["hall","🚪 طرقة","h_hall"],["room","🛋 أوضة / صالة","r_living"]]){ const bb=document.createElement("button"); bb.className="btn"+(cfg.roomType===rt?" on":""); bb.style.flex="1"; bb.textContent=lb; bb.onclick=()=>{ if(cfg.roomType===rt) return; pushHist(); applyTemplate(cfg,def,false); if(["مطبخ جديد","حمام جديد","طرقة جديدة","أوضة جديدة"].includes(WIZ.name)) WIZ.name=rt==="bath"?"حمام جديد":rt==="hall"?"طرقة جديدة":rt==="room"?"أوضة جديدة":"مطبخ جديد"; build(); renderWiz(); }; tg.appendChild(bb); } hostEl.appendChild(tg);
    const g=document.createElement("div"); g.style.cssText="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px";
    for(const [k,v] of Object.entries(cfg.roomType==="bath"?BTEMPLATES:cfg.roomType==="hall"?HTEMPLATES:cfg.roomType==="room"?RTEMPLATES:TEMPLATES)){ const b=document.createElement("button"); b.className="btn"+(cfg.template===k?" on":""); b.style.cssText="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px";
      b.innerHTML=tplIcon(k)+`<span style="font-size:12px">${v.name}</span>`; b.onclick=()=>{ pushHist(); applyTemplate(cfg,k,false); build(); renderWiz(); }; g.appendChild(b); }
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
  const row=document.createElement("div"); row.className="ctl"; const lb=document.createElement("label"); lb.textContent=c.l; row.appendChild(lb);
  if(c.t==="select"){ const el=document.createElement("select"); for(const [v,n] of c.o){ const o=document.createElement("option"); o.value=v; o.textContent=n; el.appendChild(o); } el.value=cfg[c.k]; el.onchange=()=>{ pushHist(); cfg[c.k]=el.value; build(); UI_REFRESH(); }; row.appendChild(el); }
  if(c.t==="toggle"){ const w=document.createElement("label"); w.className="sw"; const el=document.createElement("input"); el.type="checkbox"; el.checked=!!cfg[c.k]; el.onchange=()=>{ pushHist(); cfg[c.k]=el.checked; build(); UI_REFRESH(); }; w.append(el,document.createElement("i")); row.appendChild(w); }
  if(c.t==="range"){ const el=document.createElement("input"); el.type="range"; el.min=c.min; el.max=c.max; el.step=c.step; el.value=+cfg[c.k]; const out=document.createElement("output"); out.textContent=cfg[c.k]+" "+c.u;
    el.addEventListener("pointerdown",pushHist); el.oninput=()=>{ cfg[c.k]=+el.value; out.textContent=el.value+" "+c.u; SLIDING=true; build(); SLIDING=false; }; row.append(el,out); }
  parent.appendChild(row);
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
function costBox(){
  const a=STATS.acc||{lower:0,upper:0,tall:0,marble:0}, f=v=>v.toFixed(2);
  const t=a.lower*cfg.pLower+a.upper*cfg.pUpper+a.tall*cfg.pTall+a.marble*cfg.pMarble;
  const d=document.createElement("div"); d.className="sum";
  d.innerHTML=`الدواليب السفلية: <b>${f(a.lower)} م</b><br>الدواليب العلوية: <b>${f(a.upper)} م</b> <small>(الدولاب اللي للسقف محسوب دورين)</small><br>الدواليب الطول: <b>${f(a.tall)} م</b><br>الرخامة: <b>${f(a.marble)} م</b>`+
    (t>0?`<hr>الإجمالي التقريبي: <b>${Math.round(t).toLocaleString("ar-EG")} جنيه</b>`:`<hr><small>اكتب أسعار المتر اللي النجار والرخامجي قالولك عليها، والإجمالي هيتحسب لوحده.</small>`);
  return d;
}
renderTabs(); renderControls();

function resize(){ poke(); /* setSize clears the canvas */
  const w=document.documentElement.clientWidth||innerWidth, full=document.documentElement.clientHeight||innerHeight;
  const h=panelOpen?Math.round(full*0.48):full;
  canvas.style.height=h+"px";
  renderer.setSize(w,h,false); canvas.style.width=w+"px";
  camera.aspect=w/h; camera.updateProjectionMatrix();
  if(APT3D){ if(!FP.on) aptView(false); } else if(VIEWS[view] && (VIEWS[view].fit||VIEWS[view].sideW) && !camTouched) setView(view);
}
addEventListener("resize",resize);
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
(function loop(){ if(cfg.autoRot && pts.size===0) sph.theta+=0.004;
  const k=[sph.theta,sph.phi,sph.r,target.x,target.y,target.z,FP.on,FP.x,FP.z,FP.yaw,FP.pitch,camera.aspect].join(); /* catches camera moves from held buttons and code */
  if(DIRTY>0||k!==camKey||drag){ camKey=k; updateCam(); renderer.render(scene,camera); if(DIRTY>0) DIRTY--; } requestAnimationFrame(loop); })();
