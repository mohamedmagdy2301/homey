// =================== START SCREEN (what do you want to design?) ===================
// Opens on every visit: a whole apartment, one space by the wizard, or back to what you were doing.
let HOME=null; /* {view:"pick"|"apt", spec} */
const HOME_KINDS=[
  ["apt","🏢","شقة كاملة","سمّيها وحدد فيها كام أوضة وحمام، وبعدين صمّم كل مكان فيها لوحده"],
  ["kitchen","🍳","مطبخ","دواليب ورخامة وأجهزة، ومعاها السباكة والكهربا"],
  ["bath","🚿","حمام","الأجهزة الصحية والسيراميك والصرف"],
  ["room","🛋","أوضة أو صالة","نوم أو معيشة أو ريسبشن، بالفرش"],
  ["shop","🏪","محل أو مكتب","سوبر ماركت، هدوم، كافيه، صيدلية، عيادة"]];
const APT_PRESETS=[["استوديو",{beds:0,baths:1,living:"living",kitchen:true,balc:false}],["أوضة وصالة",{beds:1,baths:1,living:"living",kitchen:true,balc:true}],
  ["أوضتين وصالة",{beds:2,baths:1,living:"living",kitchen:true,balc:true}],["3 أوض وصالة",{beds:3,baths:2,living:"living",kitchen:true,balc:true}],["4 أوض وريسبشن",{beds:4,baths:3,living:"both",kitchen:true,balc:true}]];
const cnt=(n,one,two,many)=>n===1?one:n===2?two:`${n} ${many}`;
function openHome(){ closeSheet(); HOME={view:"pick",spec:null}; document.getElementById("home").style.display="flex"; renderHome(); }
function closeHome(){ HOME=null; document.getElementById("home").style.display="none"; }
// the rooms of a new apartment, as an APT_TPLS-style layout: a hall in the middle, the kitchen and baths on one side, the living room on the other
function specToT(s){ const W=k=>k==="k"?300:((RTEMPLATES[k]||BTEMPLATES[k]||{}).dims||[300])[0], len=a=>a.reduce((x,[k])=>x+W(k),0), top=[], bot=[];
  if(s.living==="living"||s.living==="both") bot.push(["r_living","صالة"]); if(s.living==="recep"||s.living==="both") bot.push(["r_recep","ريسبشن وسفرة"]);
  if(s.kitchen) top.push(["k","مطبخ"]);
  const rest=[]; for(let i=0;i<s.baths;i++) rest.push(["b_std",s.baths>1?`حمام ${i+1}`:"حمام"]); for(let i=0;i<s.beds;i++) rest.push([i?"r_kids":"r_master",i?`أوضة نوم ${i+1}`:(s.beds>1?"أوضة نوم رئيسية":"أوضة نوم")]);
  for(const r of rest) (len(top)<=len(bot)?top:bot).push(r);
  if(!bot.length&&top.length>1) bot.push(top.pop()); if(!top.length&&bot.length>1) top.push(bot.pop());
  return {n:s.name||"شقة",top,bot,balc:!!s.balc&&bot.length>0&&["r_living","r_recep"].includes(bot[0][0])}; }
function aptSpecText(s){ const a=[]; if(s.living==="living"||s.living==="both") a.push("صالة"); if(s.living==="recep"||s.living==="both") a.push("ريسبشن"); if(s.kitchen) a.push("مطبخ");
  a.push(cnt(s.baths,"حمام","حمامين","حمامات")); if(s.beds) a.push(cnt(s.beds,"أوضة نوم","أوضتين نوم","أوض نوم")); if(s.balc) a.push("بلكونة"); return a.join("، ")+"، وطرقة بتربطهم"; }
function renderHome(){ if(!HOME) return; const b=document.getElementById("homeBody"); b.innerHTML=""; b.scrollTop=0;
  const head=t=>{ const h=document.createElement("div"); h.className="head"; h.textContent=t; b.appendChild(h); };
  if(HOME.view==="apt"){ document.getElementById("homeTitle").textContent="🏢 شقة جديدة"; newAptUI(b); return; }
  document.getElementById("homeTitle").textContent="ابدأ من هنا";
  const hero=document.createElement("div"); hero.className="hhero"; hero.innerHTML=`<h1>عايز تصمّم إيه؟</h1><p>اختار وهنمشي معاك خطوة بخطوة، وتقدر تغيّر أي حاجة بعدين.</p>`; b.appendChild(hero);
  if(projIndex.some(p=>p.id===PROJ.id)){ const c=document.createElement("button"); c.className="hcont"; c.id="homeCont";
    const ap=aptOfRoom(PROJ.id); c.innerHTML=`<span class="hico">↩</span><span><small>كمّل آخر شغلك</small><b>${esc(PROJ.name)}</b>${ap?`<small>في ${esc(ap.name)}</small>`:""}</span>`; c.onclick=closeHome; b.appendChild(c); }
  const g=document.createElement("div"); g.className="hgrid";
  for(const [k,i,n,d] of HOME_KINDS){ const c=document.createElement("button"); c.className="hcard"+(k==="apt"?" wide":""); c.dataset.k=k; c.innerHTML=`<span class="hico">${i}</span><b>${n}</b><small>${d}</small>`;
    c.onclick=()=>{ if(k==="apt"){ HOME.view="apt"; HOME.spec={name:"",...APT_PRESETS[2][1]}; renderHome(); return; } closeHome(); openWizard(true,k,true); }; g.appendChild(c); }
  b.appendChild(g);
  if(APTS.length){ head("🏢 شققك"); aptListUI(b,renderHome); }
  const rec=[...projIndex].sort((x,y)=>y.t-x.t).slice(0,6);
  if(rec.length){ head("🕘 آخر تصميماتك"); const ch=document.createElement("div"); ch.className="chips";
    for(const p of rec){ const c=document.createElement("button"); c.className="chipbtn"+(p.id===PROJ.id?" on":""); const ap=aptOfRoom(p.id); c.textContent=p.name+(ap?` • ${ap.name}`:"");
      c.onclick=async()=>{ closeHome(); if(p.id!==PROJ.id) await openProject(p.id); }; ch.appendChild(c); }
    b.appendChild(ch); const all=document.createElement("button"); all.className="btn wide"; all.style.marginTop="10px"; all.textContent="📂 كل التصميمات والنسخة الاحتياطية"; all.onclick=()=>{ closeHome(); openSheet(); }; b.appendChild(all); }
  const n=document.createElement("div"); n.className="note"; n.style.marginTop="14px";
  n.textContent="🔒 شغلك بيتحفظ لوحده على الجهاز ده بس، ومحدش غيرك بيشوفه. تقدر تعمل أكتر من شقة وأكتر من تصميم. عشان تنقلهم لجهاز تاني نزّل نسخة احتياطية من «كل التصميمات» ورجّعها هناك."; b.appendChild(n); }
function newAptUI(b){ const s=HOME.spec;
  const back=document.createElement("button"); back.className="btn"; back.textContent="→ رجوع"; back.onclick=()=>{ HOME.view="pick"; renderHome(); }; b.appendChild(back);
  const nm=document.createElement("input"); nm.className="txt big"; nm.id="aptNewName"; nm.value=s.name; nm.placeholder="اسم الشقة (مثلاً: شقة المعادي)"; nm.setAttribute("aria-label","اسم الشقة"); nm.oninput=()=>{ s.name=nm.value; };
  const nh=document.createElement("div"); nh.className="head"; nh.textContent="1. سمّي الشقة"; b.append(nh,nm);
  const ph=document.createElement("div"); ph.className="head"; ph.textContent="2. إيه اللي جوّاها؟"; b.appendChild(ph);
  const pn=document.createElement("div"); pn.className="note"; pn.textContent="اختار شكل قريب، وبعدين زوّد أو قلّل:"; b.appendChild(pn);
  const ch=document.createElement("div"); ch.className="chips";
  for(const [t,v] of APT_PRESETS){ const c=document.createElement("button"); c.className="chipbtn"+(["beds","baths","living","kitchen","balc"].every(k=>s[k]===v[k])?" on":""); c.textContent=t; c.onclick=()=>{ Object.assign(s,v); renderHome(); }; ch.appendChild(c); }
  b.appendChild(ch);
  const box=document.createElement("div"); b.appendChild(box);
  const step=(label,k,min,max)=>{ const w=document.createElement("div"); w.className="numw"; const mk=(ic,d,l)=>{ const x=document.createElement("button"); x.type="button"; x.className="stb"; x.innerHTML=ico(ic,18); x.setAttribute("aria-label",l+" "+label);
      x.disabled=d<0?s[k]<=min:s[k]>=max; x.onclick=()=>{ s[k]=Math.max(min,Math.min(max,s[k]+d)); renderHome(); }; return x; };
    const v=document.createElement("input"); v.className="num"; v.readOnly=true; v.value=s[k]; v.setAttribute("aria-label",label); w.append(mk("plus",1,"زوّد"),v,mk("minus",-1,"قلّل")); fieldRow(box,label,w); };
  step("أوض النوم","beds",0,6); step("الحمامات","baths",1,4);
  fieldRow(box,"الصالة",choice([["living","صالة"],["recep","ريسبشن"],["both","الاتنين"],["none","مفيش"]],s.living,v=>{ s.living=v; renderHome(); },"الصالة"));
  fieldRow(box,"مطبخ",choice([["1","أيوه"],["","لأ"]],s.kitchen?"1":"",v=>{ s.kitchen=!!v; renderHome(); },"مطبخ"));
  fieldRow(box,"بلكونة",choice([["1","أيوه"],["","لأ"]],s.balc?"1":"",v=>{ s.balc=!!v; renderHome(); },"بلكونة"));
  const sum=document.createElement("div"); sum.className="sum"; sum.innerHTML=`<b>الشقة فيها:</b> ${esc(aptSpecText(s))}.`; b.appendChild(sum);
  const nx=document.createElement("div"); nx.className="note";
  nx.innerHTML="<b>بعد كده:</b><br>1. هنرسم المسقط والأوض متوصلة ببعض.<br>2. تظبط مقاس كل أوضة ومكانها، أو تضيف وتشيل أماكن.<br>3. تصمّم كل مكان من جوّه: المطبخ والحمامات والفرش.<br>4. تطلع رسومات ومشتريات وميزانية الشقة كلها."; b.appendChild(nx);
  const go=document.createElement("button"); go.className="btn main wide"; go.id="aptCreate"; go.textContent="✓ اعمل الشقة";
  go.onclick=async()=>{ go.disabled=true; const T=specToT({...s,name:cleanName(s.name)}); closeHome(); await createApt(s.name,T); }; b.appendChild(go); }
