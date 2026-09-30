// =================== SHARE LINK, CUT LIST, TRADE SHEETS, SCHEDULE, QUOTES, SUN, QUALITY, TOUR ===================
// ---------- share a design as a link (#d=...) ----------
// the design rides in the URL hash (deflate + base64url), so no server is needed: whoever opens the link gets a copy saved on their device
const b64u={enc:u8=>{ let s=""; for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); },
  dec:t=>{ const s=atob(t.replace(/-/g,"+").replace(/_/g,"/")), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u; }};
async function zpipe(u8,pack){ const st=new Blob([u8]).stream().pipeThrough(pack?new CompressionStream("deflate-raw"):new DecompressionStream("deflate-raw")); return new Uint8Array(await new Response(st).arrayBuffer()); }
/* "z" = deflated JSON, "j" = plain JSON (browsers without CompressionStream) */
async function packObj(o){ const raw=new TextEncoder().encode(JSON.stringify(o)); if(typeof CompressionStream==="function"){ try{ return "z"+b64u.enc(await zpipe(raw,true)); }catch(e){} } return "j"+b64u.enc(raw); }
async function unpackObj(t){ const k=t[0], u=b64u.dec(t.slice(1)), raw=k==="z"?await zpipe(u,false):k==="j"?u:null; if(!raw) throw new Error("bad"); return JSON.parse(new TextDecoder().decode(raw)); }
const packDesign=()=>packObj({n:PROJ.name,c:cfg});
async function unpackDesign(t){ const o=await unpackObj(t); if(!o||!o.c||typeof o.c!=="object"||Array.isArray(o.c)) throw new Error("bad"); return o; }
async function designLink(){ return location.href.split("#")[0]+"#d="+await packDesign(); }
const linkWorksOutside=()=>/^https?:$/.test(location.protocol)&&!/^(localhost|127\.|\[::1\])/.test(location.hostname);
async function openSharedHash(){ const m=/^#([da])=([\w-]+)$/.exec(location.hash||""); if(!m) return false;
  try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){}
  if(m[1]==="a") return openSharedApt(m[2]);
  try{ const o=await unpackDesign(m[2]); await saveNow(); PROJ={id:"p"+Date.now().toString(36),name:cleanName(o.n)||"تصميم متبعتلي"}; cfg=migrate(o.c); DRAFT=null; clearHist(); SEL=null;
    build(); updProjName(); renderControls(); await saveNow(); closeHome(); setView("out"); hint(`✓ اتفتح التصميم اللي اتبعتلك «${PROJ.name}» واتحفظ عندك`,4500); return true; }
  catch(e){ hint("اللينك ده ناقص أو بايظ، اطلب من صاحبه يبعته تاني",4500); return false; } }
addEventListener("hashchange",()=>{ if(/^#[da]=/.test(location.hash)) openSharedHash(); });

// ---------- share a whole apartment as a link (#a=...) ----------
/* every room rides along and the ids stay the same, so on a device that already has this apartment (your phone, or someone sending your own link back)
   it offers to update that copy: the link also carries the work between your own devices. ksync:<aptId> keeps a hash of the last state sent or received,
   which tells whether this copy was edited since, before anything is overwritten */
async function aptContent(id){ const a=id===APT_ID&&APT_LOADED===id?APT:await stGet("kapt:"+id); if(!a||!Array.isArray(a.rooms)) throw new Error("apt"); const r={};
  for(const x of a.rooms){ const d=x.id===PROJ.id?{name:PROJ.name,cfg:APT3D?aptSaved:cfg}:await stGet("kproj:"+x.id); if(!d||!d.cfg) throw new Error("room"); r[x.id]={n:d.name,c:d.cfg}; }
  return {a,r}; }
const strHash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); };
const aptHash=o=>strHash(JSON.stringify([o.a,o.r]));
async function aptLink(){ await saveNow(); if(APT_LOADED!==APT_ID) await loadApt(); const c=await aptContent(APT_ID); await stSet("ksync:"+APT_ID,aptHash(c));
  return location.href.split("#")[0]+"#a="+await packObj({id:APT_ID,t:Date.now(),...c}); }
function askDlg(title,msg,opts){ return new Promise(res=>{ let d=document.getElementById("ask"); if(!d){ d=document.createElement("div"); d.id="ask"; d.className="ovl"; document.body.appendChild(d); }
  d.innerHTML=`<div class="dlg" role="dialog" aria-labelledby="askTitle"><div class="ovh"><b id="askTitle">${esc(title)}</b><button class="btn icon quiet" aria-label="قفل" data-x>${ico("x")}</button></div><div class="ovb"><div class="note">${msg}</div><div style="display:grid;gap:8px;margin-top:10px">${opts.map(([k,t,m])=>`<button class="btn wide${m?" main":""}" data-k="${k}">${esc(t)}</button>`).join("")}</div></div></div>`;
  const done=k=>{ d.style.display="none"; res(k); }; d.querySelector("[data-x]").onclick=()=>done(null); d.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>done(b.dataset.k)); d.style.display="flex"; }); }
async function openSharedApt(t){ let o;
  try{ o=await unpackObj(t); if(!o||typeof o.id!=="string"||!/^[\w-]{1,40}$/.test(o.id)||!o.a||!Array.isArray(o.a.rooms)||!o.r||typeof o.r!=="object") throw 0;
    o.a=cleanDeep(o.a); o.a.rooms=o.a.rooms.filter(x=>x&&typeof x.id==="string"&&/^[\w-]{1,40}$/.test(x.id)&&o.r[x.id]&&o.r[x.id].c&&typeof o.r[x.id].c==="object"&&!Array.isArray(o.r[x.id].c)); if(!o.a.rooms.length) throw 0; }
  catch(e){ hint("اللينك ده ناقص أو بايظ، اطلب من صاحبه يبعته تاني",4500); return false; }
  closeHome(); if(APT3D) exitApt3D(); document.getElementById("apt").style.display="none"; await saveNow();
  const have=APTS.find(x=>x.id===o.id); let mode="new";
  if(have){ let mine=null; try{ mine=aptHash(await aptContent(have.id)); }catch(e){}
    if(mine===aptHash(o)) mode="keep";
    else { const edited=!mine||mine!==await stGet("ksync:"+have.id);
      mode=await askDlg("🏢 الشقة دي عندك",`«${esc(aptNameOf(have))}» موجودة على الجهاز ده، واللينك فيه نسخة تانية منها.`+(edited?"<br>⚠ نسختك اللي هنا فيها تعديلات مش في اللينك، لو حدّثتها هتروح. لو مش متأكد احفظ اللينك نسخة جديدة جنبها.":""),
        [["update","⟳ حدّث نسختي باللي في اللينك",!edited],["copy","➕ احفظه نسخة جديدة جنبها",edited],["keep","👁 افتح نسختي زي ما هي"]]); if(!mode) return false; } }
  let aid=have?have.id:o.id, nm=aptNameOf(o.a);
  if(mode!=="keep"){ const used=new Set(projIndex.map(p=>p.id)), own=new Set(mode==="update"?have.rooms||[]:[]), map={}; if(mode==="copy"){ aid=newAptId(); nm+=" (نسخة)"; }
    let txt=JSON.stringify(o.a); for(const x of o.a.rooms){ let id=x.id; if(mode==="copy"||(used.has(id)&&!own.has(id))){ id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); txt=txt.split(JSON.stringify(x.id)).join(JSON.stringify(id)); } map[x.id]=id; } /* a room belongs to one apartment: an id already used elsewhere here gets a new one */
    const a={...aptDef(),...JSON.parse(txt),name:nm}, now=Date.now();
    for(const x of o.a.rooms){ const id=map[x.id], d={name:cleanName(o.r[x.id].n)||"أوضة",cfg:migrate(o.r[x.id].c)}; await stSet("kproj:"+id,d);
      const i=projIndex.findIndex(p=>p.id===id), e={id,name:d.name,t:now}; if(i>=0) projIndex[i]=e; else projIndex.push(e);
      if(id===PROJ.id){ PROJ.name=d.name; cfg=migrate(clone(d.cfg)); DRAFT=null; clearHist(); SEL=null; updProjName(); build(); renderControls(); } }
    await stSet("kproj:index",projIndex); await stSet("kapt:"+aid,a); const e={id:aid,name:nm,rooms:a.rooms.map(r=>r.id),t:now}, i=APTS.findIndex(x=>x.id===aid); if(i>=0) APTS[i]=e; else APTS.push(e); if(!APTS_BAD) await stSet("kapt:index",APTS);
    if(!a.rooms.some(r=>r.id===PROJ.id)) await openProject(a.rooms[0].id);
    APT_ID=aid; APT_LOADED=null; await loadApt(); try{ await stSet("ksync:"+aid,aptHash(await aptContent(aid))); }catch(e){} }
  await openAptId(aid); if(!APT.rooms.some(r=>SNAP[r.id])) return false; enterApt3D(true);
  const nmA=aptNameOf(APT), tip="🚶 دوس على الأرض تروح هناك، و📍 تنقلك لأي أوضة";
  hint(mode==="keep"?`اتفتحت «${nmA}» زي ما هي عندك. ${tip}`:mode==="update"?`✓ اتحدّثت «${nmA}» باللي في اللينك. ${tip}`:`✓ اتفتحت الشقة «${nmA}» واتحفظت عندك. ${tip}`,6000); return true; }
async function shareApt(){ const d=shareDlg(), b=d.querySelector("#shareBody"); d.querySelector("#shareTitle").textContent="🔗 شارك الشقة"; b.innerHTML=`<div class="note">بجهّز اللينك…</div>`; d.style.display="flex";
  let link="", url=""; if(APT3D){ const fp={...FP}; if(fp.on) aptView(false); try{ url=shotURL(); }catch(e){} if(fp.on){ aptView(true); Object.assign(FP,fp); } } /* the picture from above, then the walker back where they stood */
  try{ link=await aptLink(); }catch(e){ b.innerHTML=`<div class="note">مقدرتش أقرا كل أوض الشقة من الحفظ، جرّب تاني كمان شوية.</div>`; return {}; }
  const n=APT.rooms.length, area=APT.rooms.map(r=>SNAP[r.id]).filter(Boolean).reduce((s,sn)=>s+aptAreaM(sn),0);
  const text=`🏢 ${aptNameOf(APT)}\n🚪 ${n} ${n>2&&n<11?"أوض":"أوضة"}${area?` • حوالي ${Math.round(area)} م²`:""}\n\n🔗 افتح الشقة وامشي فيها 3D:\n${link}`;
  const st=shareBox(b,{url,link,text,fname:aptNameOf(APT).replace(/[\\/:*?"<>|]/g,"")+".jpg",title:aptNameOf(APT)});
  const tip=document.createElement("div"); tip.className="note"; tip.textContent="📱💻 عايز تكمّل على جهازك التاني؟ ابعت اللينك لنفسك وافتحه هناك. لو الشقة موجودة عليه هيسألك تحدّثها، ولما تخلص ابعته من هناك وافتحه هنا بنفس الطريقة."; b.insertBefore(tip,st);
  if(link.length>60000) st.textContent="⚠ الشقة كبيرة واللينك طويل جدًا، واتساب ممكن ميقبلوش في رسالة. انسخ اللينك بس وابعته لوحده، أو انقلها بالنسخة الاحتياطية.";
  return {text,link}; }

// ---------- a sharp picture: render at ~2400 px on the long side, then put the screen back ----------
function shotURL(){ const w=canvas.clientWidth||innerWidth, h=canvas.clientHeight||innerHeight, pr=renderer.getPixelRatio(), max=Math.min(4096,renderer.capabilities.maxTextureSize||4096);
  const k=Math.max(pr,Math.min(4,2400/Math.max(w,h),max/w,max/h)); let url;
  try{ renderer.setPixelRatio(k); renderer.setSize(w,h,false); updateCam(); renderer.render(scene,camera); url=canvas.toDataURL("image/jpeg",0.9); }
  finally{ renderer.setPixelRatio(pr); renderer.setSize(w,h,false); poke(); }
  return url; }
const kindName=c=>isShop(c)?"محل":{kitchen:"مطبخ",bath:"حمام",hall:"طرقة",room:"أوضة"}[c.roomType]||"تصميم";
function designSummary(){ const s=STATS||{}, lines=[`🏠 ${PROJ.name} (${kindName(cfg)})`];
  if(s.net) lines.push(`📏 المقاس الصافي ${s.net[0]}×${s.net[1]} سم`);
  if(cfg.roomType==="kitchen"&&s.acc){ const a=s.acc; lines.push(`🪵 دواليب: سفلي ${a.lower.toFixed(1)} م • علوي ${a.upper.toFixed(1)} م${a.tall?` • طول ${a.tall.toFixed(1)} م`:""} • رخامة ${a.marble.toFixed(1)} م`);
    const t=a.lower*cfg.pLower+a.upper*cfg.pUpper+a.tall*cfg.pTall+a.marble*cfg.pMarble; if(t>0) lines.push(`💰 التكلفة التقريبية ${Math.round(t).toLocaleString("ar-EG")} جنيه`); }
  if(cfg.roomType==="bath"&&BATH) lines.push(`🧱 سيراميك ${(BATH.wallA+BATH.floorA).toFixed(1)} م² • ${(cfg.bfix||[]).length} جهاز صحي`);
  if(cfg.roomType==="room"&&ROOMQ) lines.push(`⬜ أرضية ${ROOMQ.floorA.toFixed(1)} م² • 🎨 دهان حوالي ${ROOMQ.liters} لتر • ${(cfg.furn||[]).length} قطعة أثاث`);
  const n=new Set(s.warn||[]).size; if(n) lines.push(`⚠ فيه ${n} ${n>1?"ملاحظات":"ملاحظة"} محتاجة مراجعة`);
  return lines.join("\n"); }
// one dialog for sharing: the picture, the message and the link, with WhatsApp / copy / download
function shareDlg(){ let d=document.getElementById("share"); if(d) return d; d=document.createElement("div"); d.id="share"; d.className="ovl";
  d.innerHTML=`<div class="dlg" role="dialog" aria-labelledby="shareTitle"><div class="ovh"><b id="shareTitle">🔗 شارك التصميم</b><button class="btn icon quiet" aria-label="قفل" data-x>${ico("x")}</button></div><div class="ovb" id="shareBody"></div></div>`;
  d.querySelector("[data-x]").onclick=()=>{ d.style.display="none"; }; document.body.appendChild(d); return d; }
async function shareDesign(){ const d=shareDlg(), b=d.querySelector("#shareBody"); d.querySelector("#shareTitle").textContent="🔗 شارك التصميم"; b.innerHTML=`<div class="note">بجهّز الصورة واللينك…</div>`; d.style.display="flex";
  let link="", url=""; try{ url=shotURL(); }catch(e){} try{ link=await designLink(); }catch(e){}
  const text=designSummary()+(link?`\n\n🔗 افتح التصميم 3D وقلّب فيه:\n${link}`:""), fname=(PROJ.name||"تصميم").replace(/[\\/:*?"<>|]/g,"")+".jpg";
  shareBox(b,{url,link,text,fname,title:PROJ.name}); return {text,link}; }
/* the picture, the editable message and the buttons; returns the status line */
function shareBox(b,{url,link,text,fname,title}){
  b.innerHTML=""; if(url){ const im=document.createElement("img"); im.src=url; im.alt="صورة التصميم"; im.className="shareimg"; b.appendChild(im); }
  const ta=document.createElement("textarea"); ta.value=text; ta.setAttribute("aria-label","الرسالة"); ta.rows=6; b.appendChild(ta);
  const st=document.createElement("div"); st.className="note";
  if(!linkWorksOutside()) st.textContent="⚠ الأداة مفتوحة من ملف على الجهاز، فاللينك مش هيفتح عند حد تاني. افتحها من النسخة اللي على النت وشارك من هناك، أو ابعت الصورة والرسالة بس.";
  else if(link.length>8000) st.textContent="اللينك طويل شوية لأن التصميم فيه تفاصيل كتير، بس بيشتغل عادي.";
  const act=document.createElement("div"); act.className="act"; const mk=(t,fn,main)=>{ const x=document.createElement("button"); x.className="btn"+(main?" main":""); x.textContent=t; x.onclick=fn; act.appendChild(x); return x; };
  mk("📲 ابعت على واتساب",async()=>{ const msg=ta.value; try{ if(url&&navigator.canShare){ const f=new File([await (await fetch(url)).blob()],fname,{type:"image/jpeg"}); if(navigator.canShare({files:[f]})){ await navigator.share({files:[f],text:msg,title}); return; } } }catch(e){ if(e&&e.name==="AbortError") return; }
    sendWA(msg); st.textContent="اتفتح واتساب بالرسالة واللينك. الصورة نزّلها من الزرار التاني وابعتها معاها."; },true);
  mk("📋 انسخ الرسالة",()=>copyText(ta.value,ok=>{ st.textContent=ok?"✓ اتنسخت، الصقها في أي شات":"انسخها من المربع"; }));
  if(link) mk("🔗 انسخ اللينك بس",()=>copyText(link,ok=>{ st.textContent=ok?"✓ اتنسخ اللينك":"مقدرتش أنسخ، انسخه من الرسالة"; }));
  if(url) mk("⬇ نزّل الصورة",()=>{ try{ const a=document.createElement("a"); a.href=url; a.download=fname; document.body.appendChild(a); a.click(); a.remove(); st.textContent="✓ اتنزّلت الصورة"; }catch(e){ st.textContent="دوس مطولًا على الصورة واختار حفظ"; } });
  b.append(act,st); return st; }
function sendWA(text){ const u="https://wa.me/?text="+encodeURIComponent(text); try{ const w=window.open(u,"_blank","noopener"); if(!w) location.href=u; }catch(e){ location.href=u; } }
function shareUI(el){ const h=document.createElement("div"); h.className="head"; h.textContent="🔗 شارك التصميم ده بلينك"; el.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="لينك فيه التصميم كله، ومعاه صورة وملخص. اللي يفتحه يشوفه 3D ويتحفظ عنده نسخة، وتعديلاته مش بتأثر على نسختك."; el.appendChild(n);
  const b=document.createElement("button"); b.className="btn main wide"; b.id="shareOpen"; b.textContent="📲 شارك (واتساب، لينك، صورة)"; b.onclick=()=>{ closeSheet(); shareDesign(); }; el.appendChild(b); }

// ---------- cut list for the carpenter ----------
// rough panel list from the built cabinets: 18 mm boards, 3 mm backs in a groove, 10 cm plinth, 3 cm stone on base units; the carpenter checks it on site
const SHEET={l:244,w:122,use:0.82}; /* standard board, and the share of it that ends up as parts after cutting */
const CUTMAT={body:"خشب الجسم (MDF / كونتر 18 مم)",front:"الوش: الضلف والأدراج",back:"الضهر (HDF / أبلكاش 3 مم)",glass:"ضلف إزاز (قطاع ألومنيوم)"};
function cutList(){ const T=1.8, parts=[], hw={hinge:0,slide:0,handle:0,leg:0,lift:0}, notes=[]; let boxes=0;
  const P=(mat,name,a,b,n,eL,eS)=>{ if(a<=0.5||b<=0.5||n<=0) return; const l=Math.round(Math.max(a,b)*10)/10, w=Math.round(Math.min(a,b)*10)/10; parts.push({mat,name,l,w,n,eL:eL||0,eS:eS||0}); };
  for(const u of UNITS){ const ward=u.ft==="wardrobe"; if(!CABK.has(u.kind)&&!ward) continue;
    const W=(u.a1-u.a0)*100, D=Math.max(20,u.depth*100-(ward?0:0)), base=u.kind==="base"||u.kind==="sink";
    const H=(u.y1-u.y0)*100-(u.kind==="upper"?0:ward?8:10)-(base?3:0); if(W<12||H<15) continue; boxes++; const iw=W-2*T;
    if(u.corner) notes.push(`الوحدة ${u.n} دولاب ركن: مقاسها تقريبي، النجار يقيسها على الطبيعة.`);
    P("body","جنب",H,D,2,1,0);
    if(base){ P("body","قاعدة",iw,D,1,1,0); P("body","مربط فوق",iw,10,2,1,0); } else P("body","أرضية وسقف",iw,D,2,1,0);
    const fr=u.front==="auto"||!u.front?"doors":u.front;
    let sh=typeof u.shelves==="number"?u.shelves:fr==="drawers"||u.kind==="sink"?0:u.kind==="base"?1:u.kind==="upper"?Math.max(1,Math.round(H/35)-1):u.kind==="tall"?4:ward?Math.max(2,Math.round(H/80)):1; /* a wardrobe is part hanging space: fewer full-width shelves */
    if(fr==="open") sh+=1; P("body","رف",iw-0.2,D-2,sh,1,0);
    if(ward&&W>110){ const dv=Math.max(1,Math.round(W/90)-1); P("body","قاطوع جوه",H-2*T,D-2,dv,1,0); }
    P("back","ضهر",H-1,W-1,1);
    const drawer=(n,fh)=>{ P("front","وش درج",W-0.4,fh-0.4,n,2,2); P("body","جنب درج",D-10,14,2*n,1,0); P("body","قدام وورا الدرج",iw-2.6,14,2*n,1,0); P("back","قاع درج",iw-2.6,D-10,n); hw.slide+=n; hw.handle+=n; };
    const doors=(n,dh,mat)=>{ P(mat||"front","ضلفة",W/n-0.4,dh-0.4,n,2,2); hw.hinge+=n*(dh>180?4:dh>100?3:2); hw.handle+=n; };
    const nd=ward?Math.max(1,Math.round(W/50)):W>60?2:1;
    if(fr==="drawers") drawer(3,H/3);
    else if(fr==="drawer_door"){ drawer(1,H/4); doors(nd,H*3/4); }
    else if(fr==="lift"){ doors(1,H); hw.lift++; }
    else if(fr==="glass") doors(nd,H,"glass");
    else if(fr==="glassLow"){ doors(nd,H/2,"glass"); doors(nd,H/2); }
    else if(fr!=="open") doors(nd,H);
    if(base||u.kind==="tall") hw.leg+=W>90?6:4; }
  if(cfg.handles==="none") hw.handle=0;
  const agg={}; for(const p of parts){ const k=[p.mat,p.name,p.l,p.w,p.eL,p.eS].join("|"); if(agg[k]) agg[k].n+=p.n; else agg[k]={...p}; }
  const order=Object.keys(CUTMAT), list=Object.values(agg).sort((a,b)=>order.indexOf(a.mat)-order.indexOf(b.mat)||b.l-a.l||b.w-a.w);
  const mats={}; for(const p of list){ const m=mats[p.mat]=mats[p.mat]||{a:0,sheets:0}; m.a+=p.l*p.w*p.n/1e4; }
  for(const m of Object.values(mats)) m.sheets=Math.max(1,Math.ceil(m.a/(SHEET.l*SHEET.w/1e4*SHEET.use)));
  const edgeM=list.reduce((s,p)=>s+p.n*(p.eL*p.l+p.eS*p.w)/100,0)*1.1;
  const cost=(mats.body?mats.body.sheets*(+cfg.pSheet||0):0)+(mats.front?mats.front.sheets*(+cfg.pFrontSheet||0):0);
  return {list,mats,hw,edgeM,boxes,notes,cost}; }
const cutNum=v=>String(v).replace(/\.0$/,"");
function cutSection(){ const C=cutList(); if(!C.boxes) return "";
  const mrow=Object.entries(C.mats).map(([k,m])=>`<tr><td>${CUTMAT[k]}</td><td>${m.a.toFixed(2)} م²</td><td><b>${m.sheets}</b> لوح</td></tr>`).join("");
  const h=C.hw, hrow=[["مفصلات",h.hinge,"قطعة"],["مجاري أدراج",h.slide,"جوز"],["مقابض",h.handle,"قطعة"],["رجول للدواليب الأرضية",h.leg,"قطعة"],["مكابس رفع لفوق",h.lift,"جوز"],["شريط حرف (PVC)",Math.ceil(C.edgeM),"متر"]].filter(r=>r[1]>0).map(r=>`<tr><td>${r[0]}</td><td>${r[1]} ${r[2]}</td></tr>`).join("");
  const prow=C.list.map((p,i)=>`<tr><td>${i+1}</td><td>${CUTMAT[p.mat].split(" (")[0]}</td><td>${p.name}</td><td><b>${cutNum(p.l)} × ${cutNum(p.w)}</b></td><td>${p.n}</td><td>${p.eL||p.eS?`${p.eL?p.eL+" طول":""}${p.eL&&p.eS?" + ":""}${p.eS?p.eS+" عرض":""}`:"—"}</td></tr>`).join("");
  return `<section id="sec-cut"><h3>🪚 قايمة التقطيع للنجار</h3><div class="sub">تقريبية من ${C.boxes} وحدة: خشب 18 مم، ضهر 3 مم في مجرى، وزرة 10 سم، والرخامة 3 سم. اللوح ${SHEET.w}×${SHEET.l} سم، ومحسوب هالك التقطيع. النجار يراجع المقاسات على الطبيعة قبل ما يقطّع.</div>
  <div class="tbl"><table style="min-width:0"><tr><th>الخامة</th><th>المساحة</th><th>الألواح</th></tr>${mrow}</table></div>
  ${C.cost>0?`<div class="sub" style="margin-top:6px">تمن الألواح تقريبًا: <b>${Math.round(C.cost).toLocaleString("ar-EG")} جنيه</b> (من غير المصنعية والإكسسوارات)</div>`:""}
  <h3 style="font-size:14px">الإكسسوارات</h3><div class="tbl"><table style="min-width:0">${hrow}</table></div>
  <h3 style="font-size:14px">القطع (الطول × العرض بالسنتيمتر)</h3><div class="tbl"><table><tr><th>#</th><th>الخامة</th><th>القطعة</th><th>المقاس</th><th>العدد</th><th>شريط الحرف</th></tr>${prow}</table></div>
  ${C.notes.length?`<ul style="font-size:13px;color:#A6473A">${C.notes.map(n=>`<li>${n}</li>`).join("")}</ul>`:""}
  <div class="act noprint" style="margin-top:8px"><button type="button" class="btn" data-csv="1">⬇ نزّل القايمة (Excel / CSV) لمكنة التقطيع</button></div></section>`; }
function cutCSV(){ const C=cutList(), q=s=>`"${String(s).replace(/"/g,'""')}"`;
  const rows=[["الخامة","القطعة","الطول سم","العرض سم","العدد","شريط طول","شريط عرض"].map(q).join(","),...C.list.map(p=>[CUTMAT[p.mat],p.name,p.l,p.w,p.n,p.eL,p.eS].map(q).join(","))];
  return "﻿"+rows.join("\r\n"); }
function cutMini(){ const C=cutList(); if(!C.boxes) return; const d=document.createElement("div"); d.className="sum";
  d.innerHTML=`🪚 <b>قايمة التقطيع:</b> ${Object.entries(C.mats).map(([k,m])=>`${m.sheets} لوح ${CUTMAT[k].split(" (")[0]}`).join(" • ")}<br><small>${C.hw.hinge} مفصلة • ${C.hw.slide} جوز مجاري • ${Math.ceil(C.edgeM)} م شريط حرف</small>`+(C.cost>0?`<br>تمن الألواح تقريبًا <b>${Math.round(C.cost).toLocaleString("ar-EG")} جنيه</b>`:"");
  const b=document.createElement("button"); b.className="btn wide"; b.style.marginTop="8px"; b.textContent="🪚 قايمة التقطيع كاملة بالمقاسات"; b.onclick=()=>openDraw("cut"); d.appendChild(b); ctlEl.appendChild(d); }

// ---------- one message / one printed sheet per tradesman ----------
const wallTxt=(w,a)=>{ const Wd=WALLS[w]; return Wd?`${Wd.name.split(" (")[0]}، ${Math.round(Wd.ref(a)*100)} سم ${Wd.refName}`:""; };
const CARPK=u=>CABK.has(u.kind)||["shelf","filler","bar"].includes(u.kind)||u.ft==="wardrobe";
function tradeMsg(tr){ const hd=`${PROJ.name} (${kindName(cfg)}) • صافي ${Math.round(RW*100)}×${Math.round(RL*100)} سم`, L=[];
  const pts=ks=>POINTS.filter(p=>ks.includes(p.type)).map(p=>`• ${PT[p.type].n}: ${wallTxt(p.wall,p.a)}، على ارتفاع ${Math.round(p.y*100)} سم${p.note?` (${p.note})`:""}`);
  if(tr==="carp"){ L.push(`🪚 *شغل النجار* — ${hd}`); if(cfg.roomType==="kitchen") L.push(`الرخامة ${cfg.ch} سم من الأرض • الدواليب العلوية من ${cfg.uStart} سم وعمقها ${cfg.uDepth} سم`);
    for(const u of UNITS.filter(CARPK)) L.push(`${u.n}) ${WALLS[u.wall]?WALLS[u.wall].name.split(" (")[0]:""}: ${u.label||KN[u.kind]||u.kind} ${Math.round((u.a1-u.a0)*100)}×${Math.round((u.y1-u.y0)*100)}×${Math.round(u.depth*100)} سم${u.front&&FN[u.front]?` (${FN[u.front]})`:""}، من ارتفاع ${Math.round(u.y0*100)} سم`);
    const C=cutList(); if(C.boxes) L.push("",`الخشب تقريبًا: ${Object.entries(C.mats).map(([k,m])=>`${m.sheets} لوح ${CUTMAT[k].split(" (")[0]}`).join("، ")}`,`${C.hw.hinge} مفصلة • ${C.hw.slide} جوز مجاري • ${C.hw.handle} مقبض • ${Math.ceil(C.edgeM)} م شريط حرف`); }
  if(tr==="elec"){ const el=elecLoads(); L.push(`⚡ *شغل الكهربائي* — ${hd}`,...pts(["socket","switch","data"]),"",`الحمل المتوقع حوالي ${(el.demand/1000).toFixed(1)} ك.و (${el.amps} أمبير). الدواير:`,...el.circuits.map(c=>`• ${c.n}: قاطع ${c.a} أمبير، سلك ${c.mm} مم²${c.why?` (${c.why})`:""}`)); }
  if(tr==="plumb"){ L.push(`🚿 *شغل السباك* — ${hd}`,...pts(["water","drain","gas"])); if(cfg.roomType==="bath"&&BATH) L.push("",`ردم حوالي ${BATH.fill} سم بميول 2% • عزل ${BATH.wp.toFixed(1)} م²`,`الأجهزة: ${(cfg.bfix||[]).map(b=>KN[b.type]||b.type).join("، ")}`); }
  if(tr==="marble"&&STATS.acc){ L.push(`🪨 *شغل الرخامجي* — ${hd}`,`طول الرخامة الكلي حوالي ${STATS.acc.marble.toFixed(2)} م بعمق 60 سم، وارتفاعها ${cfg.ch} سم من الأرض`,`فتحة الحوض ${cfg.sinkW}×${cfg.sinkD} سم${cfg.stoveType==="built"?` • فتحة المسطح ${cfg.stoveW} سم`:""}`); }
  if(tr==="tiles"){ L.push(`🧱 *شغل السيراميك* — ${hd}`); if(cfg.roomType==="bath"&&BATH) L.push(`حيطان ${BATH.wallA.toFixed(1)} م² (${BATH.wallPcs} بلاطة ${cfg.wallTile}) لحد ${Math.round(BATH.top*100)} سم`,`أرضية ${BATH.floorA.toFixed(1)} م² (${BATH.floorPcs} بلاطة ${cfg.floorTile}) بميول ناحية الصفاية`);
    else if(ROOMQ) L.push(`أرضية ${ROOMQ.floorA.toFixed(1)} م² (${ROOMQ.floorPcs} بلاطة ${cfg.floorTile}) • وزرة ${ROOMQ.skirt.toFixed(1)} م`);
    else if(QTY) L.push(`أرضية ${(QTY.floorA||0).toFixed(1)} م²${QTY.tiledA?` • حيطة ${QTY.tiledA.toFixed(1)} م²`:""}`); }
  return L.join("\n"); }
/* which sections of the drawings each tradesman needs on paper */
const TRADE={carp:{n:"النجار",i:"🪚",sec:id=>/^sec-(plan|tbl|cut)$/.test(id)||(/^sec-/.test(id)&&!!WALLS[id.slice(4)])},elec:{n:"الكهربائي",i:"⚡",sec:id=>/^sec-(plan|pts|elec|ceil)$/.test(id)},
  plumb:{n:"السباك",i:"🚿",sec:id=>/^sec-(plan|pts|fin)$/.test(id)},marble:{n:"الرخامجي",i:"🪨",sec:id=>/^sec-(plan|tbl)$/.test(id)||(/^sec-/.test(id)&&!!WALLS[id.slice(4)])},tiles:{n:"السيراميك",i:"🧱",sec:id=>/^sec-(plan|fin)$/.test(id)||(/^sec-/.test(id)&&!!WALLS[id.slice(4)])}};
function tradesFor(){ const t=["elec","plumb"]; if(UNITS.some(CARPK)) t.unshift("carp"); if(cfg.roomType==="kitchen") t.push("marble"); if(cfg.roomType!=="hall") t.push("tiles"); return t; }
function sendSection(){ return `<section id="sec-send" class="noprint"><h3>📨 ابعت لكل صنايعي حتته</h3><div class="sub">رسالة واتساب فيها المقاسات اللي تخصه بس، أو اطبع الورق بتاعه لوحده.</div>`+
  tradesFor().map(k=>`<div class="trow"><b>${TRADE[k].i} ${TRADE[k].n}</b><span class="act"><button type="button" class="btn" data-send="${k}">📲 واتساب</button><button type="button" class="btn" data-copy="${k}">📋 نسخ</button><button type="button" class="btn" data-print="${k}">🖨 ورقه بس</button></span></div>`).join("")+`</section>`; }
function printOnly(tr){ const body=document.getElementById("dbody"), keep=TRADE[tr].sec; body.querySelectorAll("section").forEach(s=>s.classList.toggle("np",!keep(s.id||"")));
  const done=()=>{ body.querySelectorAll("section.np").forEach(s=>s.classList.remove("np")); removeEventListener("afterprint",done); };
  addEventListener("afterprint",done); try{ window.print(); }catch(e){} setTimeout(()=>{ if(!matchMedia("print").matches) done(); },1500); }
document.getElementById("dbody").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b||DRAW_DOC) return;
  if(b.dataset.send) sendWA(tradeMsg(b.dataset.send));
  if(b.dataset.copy) copyText(tradeMsg(b.dataset.copy),ok=>hint(ok?`✓ اتنسخت رسالة ${TRADE[b.dataset.copy].n}`:"مقدرتش أنسخ",2500));
  if(b.dataset.print) printOnly(b.dataset.print);
  if(b.dataset.csv){ const ok=downloadText(`تقطيع-${(PROJ.name||"مطبخ").replace(/[\\/:*?"<>|]/g,"")}.csv`,cutCSV(),"text/csv"); hint(ok?"✓ اتنزّلت قايمة التقطيع":"التنزيل مش متاح هنا",2500); } });

// ---------- schedule: days per step (Fridays off) and the dates they fall on ----------
const DUR=[[/علّم|ثبّت|قياس/,1],[/تأسيس الكهربا|^الكهربا/,4],[/السباكة/,4],[/شفاط/,1],[/المحارة/,10],[/الجبس|السقف/,6],[/الردم/,2],[/العزل/,3],[/الأرضية/,5],[/النقاشة|المعجون|الدهان/,7],
  [/السفلية/,3],[/الرخامة/,2],[/السيراميك/,4],[/العلوية/,2],[/الحوض|تركيب الأجهزة/,1],[/التكييف|الوزرة/,2],[/الأثاث/,3],[/التشطيب/,3]];
function stepDays(i,title){ const v=+((cfg.stepDays&&typeof cfg.stepDays==="object"&&cfg.stepDays[i])||0); if(v>0) return Math.min(90,Math.round(v)); for(const [re,d] of DUR) if(re.test(title)) return d; return 2; }
function addWorkDays(d,n){ const x=new Date(d); let k=0; while(k<n){ x.setDate(x.getDate()+1); if(x.getDay()!==5) k++; } return x; }
function stepSched(st){ const s0=/^\d{4}-\d\d-\d\d$/.test(cfg.startDate||"")&&!isNaN(new Date(cfg.startDate+"T00:00"))?new Date(cfg.startDate+"T00:00"):null; let cur=s0?(s0.getDay()===5?addWorkDays(s0,1):s0):null, total=0;
  const out=st.map(([a],i)=>{ const days=stepDays(i,a); total+=days; if(!cur) return {days}; const d0=new Date(cur), d1=addWorkDays(d0,days-1); cur=addWorkDays(d1,1); return {days,d0,d1}; });
  return {rows:out,total,end:out.length&&out[out.length-1].d1}; }
const dayFmt=d=>d.toLocaleDateString("ar-EG",{weekday:"short",day:"numeric",month:"short"});
function schedHead(st){ const S=stepSched(st), box=document.createElement("div"); box.className="sched";
  const inp=document.createElement("input"); inp.type="date"; inp.value=/^\d{4}-\d\d-\d\d$/.test(cfg.startDate||"")?cfg.startDate:""; inp.setAttribute("aria-label","يوم البداية"); inp.onchange=()=>{ pushHist(); cfg.startDate=/^\d{4}-\d\d-\d\d$/.test(inp.value)?inp.value:""; renderControls(); };
  fieldRow(box,"هتبدأ الشغل يوم",inp);
  const n=document.createElement("div"); n.className="note"; n.innerHTML=`⏱ المدة كلها حوالي <b>${S.total}</b> يوم شغل (من غير الجمع)`+(S.end?`، يعني هتخلص تقريبًا <b>${dayFmt(S.end)}</b>.`:". حدد يوم البداية وهقولك كل خطوة هتبقى إمتى.")+" غيّر عدد الأيام لكل خطوة حسب كلام الصنايعي.";
  box.appendChild(n); return {box,S}; }
function stepDur(i,title,r){ const w=document.createElement("div"); w.className="sdur";
  const t=document.createElement("small"); t.textContent=r.d0?`${dayFmt(r.d0)}${r.days>1?` ← ${dayFmt(r.d1)}`:""}`:"";
  const mk=(txt,d,l)=>{ const b=document.createElement("button"); b.type="button"; b.className="stb sm"; b.textContent=txt; b.setAttribute("aria-label",l); b.disabled=d<0&&r.days<=1;
    b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); pushHist(); cfg.stepDays={...(cfg.stepDays||{}),[i]:Math.max(1,Math.min(90,r.days+d))}; renderControls(); }; return b; };
  const v=document.createElement("span"); v.textContent=`${r.days} ${r.days===1?"يوم":r.days===2?"يومين":r.days<=10?"أيام":"يوم"}`;
  w.append(mk("−",-1,`قلّل أيام ${title}`),v,mk("+",1,`زوّد أيام ${title}`),t); return w; }

// ---------- quotes from tradesmen and what was paid ----------
const QTR=["نجار","رخامجي","سباك","كهربائي","نقاش","سيراميك","جبس","ألوميتال","أجهزة","تاني"];
function quotesBox(){ /* a loaded or shared design may carry anything here: keep well-formed entries only */
  const Q=(Array.isArray(cfg.quotes)?cfg.quotes:[]).filter(q=>q&&typeof q==="object"&&QTR.includes(q.tr)).map(q=>({...q,id:String(q.id||Math.random()),who:String(q.who||""),amt:Math.max(0,Math.round(+q.amt||0)),paid:Math.max(0,Math.round(+q.paid||0)),pick:!!q.pick})), money=v=>Math.round(v).toLocaleString("ar-EG")+" ج";
  const h=document.createElement("div"); h.className="head"; h.textContent="💬 عروض الأسعار والدفعات"; ctlEl.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="اكتب كل سعر خدته من صنايعي أو محل، وهعلّم الأرخص في كل شغلانة. علّم اللي اتفقت معاه واكتب اللي دفعته، وهقولك فاضل كام."; ctlEl.appendChild(n);
  const row=document.createElement("div"); row.className="addrow qadd";
  const tr=document.createElement("select"); tr.setAttribute("aria-label","الشغلانة"); for(const t of QTR){ const o=document.createElement("option"); o.value=t; o.textContent=t; tr.appendChild(o); } tr.value=QTR.includes(quotesBox.last)?quotesBox.last:QTR[0];
  const who=document.createElement("input"); who.className="txt"; who.placeholder="مين (اسم أو محل)"; who.setAttribute("aria-label","اسم الصنايعي أو المحل");
  const amt=document.createElement("input"); amt.className="txt"; amt.inputMode="decimal"; amt.placeholder="السعر"; amt.setAttribute("aria-label","السعر بالجنيه");
  const add=document.createElement("button"); add.className="btn main"; add.textContent="➕ ضيف";
  const err=document.createElement("div"); err.className="note";
  add.onclick=()=>{ const v=parseNum(amt.value,"جنيه",true); if(!(v>0)){ err.textContent="اكتب السعر بالأرقام"; amt.focus(); return; } quotesBox.last=tr.value; pushHist();
    cfg.quotes=[...Q,{id:"q"+Date.now().toString(36),tr:tr.value,who:cleanName(who.value)||"من غير اسم",amt:Math.round(v),paid:0,pick:false}]; renderControls(); };
  row.append(tr,who,amt,add); ctlEl.append(row,err);
  if(!Q.length) return;
  let tot=0, paid=0;
  for(const t of QTR){ const qs=Q.filter(q=>q.tr===t); if(!qs.length) continue; const low=Math.min(...qs.map(q=>q.amt)), pk=qs.find(q=>q.pick);
    tot+=pk?pk.amt:low; paid+=qs.reduce((s,q)=>s+(+q.paid||0),0);
    const g=document.createElement("div"); g.className="card qgrp"; g.innerHTML=`<div class="ch"><b>${esc(t)}</b><small>${qs.length>1?`${qs.length} عروض • الفرق ${money(Math.max(...qs.map(q=>q.amt))-low)}`:"عرض واحد"}</small></div>`;
    for(const q of qs){ const r=document.createElement("div"); r.className="qrow"+(q.pick?" pick":"");
      r.innerHTML=`<span class="qn">${esc(q.who)}${q.amt===low&&qs.length>1?` <em class="tag ok">الأرخص</em>`:""}</span><b class="qa">${money(q.amt)}</b>`;
      const pb=document.createElement("button"); pb.type="button"; pb.className="btn sm"+(q.pick?" main":""); pb.textContent=q.pick?"✓ اتفقت معاه":"اتفقت معاه"; pb.setAttribute("aria-pressed",q.pick?"true":"false");
      pb.onclick=()=>{ pushHist(); cfg.quotes=Q.map(x=>x.tr!==t?x:{...x,pick:x.id===q.id?!q.pick:false}); renderControls(); };
      const pl=document.createElement("label"); pl.className="money sm"; const pi=document.createElement("input"); pi.type="text"; pi.inputMode="decimal"; pi.placeholder="0"; pi.value=q.paid||""; pi.setAttribute("aria-label",`دفعت كام لـ ${q.who}`);
      pi.onchange=()=>{ const v=pi.value.trim()===""?0:parseNum(pi.value,"جنيه",true); if(isNaN(v)){ pi.value=q.paid||""; return; } pushHist(); cfg.quotes=Q.map(x=>x.id===q.id?{...x,paid:Math.max(0,Math.round(v))}:x); renderControls(); };
      const u=document.createElement("small"); u.textContent="دفعت"; pl.append(pi,u);
      const del=document.createElement("button"); del.type="button"; del.className="btn sm quiet"; del.textContent="🗑"; del.setAttribute("aria-label",`امسح عرض ${q.who}`); del.onclick=()=>{ pushHist(); cfg.quotes=Q.filter(x=>x.id!==q.id); renderControls(); };
      const a=document.createElement("div"); a.className="act"; a.append(pb,pl,del); r.appendChild(a); g.appendChild(r); }
    ctlEl.appendChild(g); }
  const s=document.createElement("div"); s.className="sum"; s.id="quoteSum";
  s.innerHTML=`الإجمالي (اللي اتفقت معاهم، أو الأرخص لو لسه): <b>${money(tot)}</b><br>دفعت: <b>${money(paid)}</b> • فاضل: <b>${money(Math.max(0,tot-paid))}</b>`; ctlEl.appendChild(s); }

// ---------- the sun from the real direction: which way the front wall faces, season and hour (Cairo, 30°N) ----------
function sunDir(){ if(!cfg||!cfg.sunOn) return null; const r=Math.PI/180, lat=30*r, dec=({sum:23.4,win:-23.4}[cfg.season]||0)*r, H=((+cfg.sunHour||12)-12)*15*r;
  const se=Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(H), e=Math.asin(se);
  const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(lat)-Math.tan(dec)*Math.cos(lat))+Math.PI; /* from north, clockwise */
  const rel=az-(+cfg.facing||0)*r, c=Math.cos(e); /* the front wall (W) sits at z=0 and looks out toward -z */
  return {x:Math.sin(rel)*c,y:se,z:-Math.cos(rel)*c,e:e/r}; }
function sunNote(){ const d=sunDir(); if(!d) return; const n=document.createElement("div"); n.className="note";
  const into=d.z<-0.05, side=["W","D","L","RT"].find(k=>k==="W"?d.z<-0.35:k==="D"?d.z>0.35:k==="L"?d.x<-0.35:d.x>0.35);
  n.textContent=d.e<=0?"🌙 الشمس غايبة في الساعة دي.":`☀️ الشمس على ارتفاع ${Math.round(d.e)}° ${side?`وجاية من ناحية ${WNAME[side]}`:"وفوق المكان تقريبًا"}${into&&d.e<50?"، يعني هتدخل من شباك الحيطة القدامية.":"."}`;
  const i=[...ctlEl.children].findIndex(x=>x.querySelector&&x.querySelector('input[aria-label="الساعة"]')); if(i>=0) ctlEl.children[i].after(n); else ctlEl.appendChild(n); }

// ---------- display quality per device: auto steps down on slow phones ----------
let QUAL=(()=>{ try{ return localStorage.getItem("kitchen3d/qual")||"auto"; }catch(e){ return "auto"; } })(), QSTEP=0, QS=[], QLAST=0;
const QPR=Math.min(devicePixelRatio||1,2);
function applyQual(){ const low=QUAL==="low"||(QUAL==="auto"&&QSTEP>=1), noSh=QUAL==="low"||(QUAL==="auto"&&QSTEP>=2);
  renderer.setPixelRatio(low?1:QPR); sun.castShadow=!noSh; resize(); poke(); }
function qualStep(){ QSTEP++; if(QSTEP===1&&QPR<=1) QSTEP=2; applyQual(); hint("⚙️ خففت جودة العرض عشان الجهاز يبقى أسرع. تقدر ترجّعها من تاب العرض",4000); }
{ const _render=renderer.render.bind(renderer);
  renderer.render=(s,c)=>{ const t=performance.now();
    /* consecutive frames only (dt<150 ms); the automated test browser is always slow, so it keeps full quality */
    if(QUAL==="auto"&&QSTEP<2&&!navigator.webdriver&&!document.hidden){ const dt=t-QLAST; if(QLAST&&dt<150) QS.push(dt); if(QS.length>=30){ QS.sort((a,b)=>a-b); const med=QS[15]; QS=[]; if(med>45) qualStep(); } }
    QLAST=t; _render(s,c); }; }
if(QUAL!=="auto") applyQual();
function qualBox(){ fieldRow(ctlEl,"جودة العرض",choice([["auto","تلقائي"],["high","عالية"],["low","خفيفة"]],QUAL,v=>{ QUAL=v; QSTEP=0; QS=[]; try{ localStorage.setItem("kitchen3d/qual",v); }catch(e){} applyQual(); renderControls(); },"جودة العرض"));
  const n=document.createElement("div"); n.className="note"; n.textContent=QUAL==="low"?"خفيفة: من غير ظلال وبدقة أقل، للموبايلات الضعيفة.":QUAL==="auto"?(QSTEP?"تلقائي: الجهاز كان بطيء فخففتها.":"تلقائي: لو الجهاز بطيء هخففها لوحدي."):"عالية: أحسن شكل، بس ممكن تسخّن الموبايل."; ctlEl.appendChild(n); }

// ---------- first-visit tour ----------
const TOUR=[{el:"#c",t:"ده تصميمك 3D",d:"اسحب بصباع عشان تلف حواليه، وبصباعين تقرّب وتبعّد. دوس على أي دولاب أو جهاز عشان تختاره وتعدّله."},
  {el:"#open,#fab,#panel",t:"من هنا بتغيّر كل حاجة",d:"المقاسات والأجهزة والألوان والأسعار، متقسمة على مراحل الشغل بالترتيب: المقاسات، التصميم، التنفيذ."},
  {el:"#drawBtn",t:"رسومات التنفيذ",d:"رسومات الحيطان وجدول الوحدات وقايمة التقطيع للنجار ونقط الكهربا والسباكة. اطبعها أو ابعت لكل صنايعي حتته على واتساب."},
  {el:"#shareBtn",t:"شارك تصميمك",d:"ابعت لينك التصميم مع صورة على واتساب. اللي يفتحه يشوفه 3D ويقلّب فيه زيك."},
  {el:"#aptBtn",t:"الشقة كلها",d:"اربط المطبخ والحمامات والأوض في شقة واحدة، وامشي فيها، وطلّع قايمة المشتريات والميزانية."}];
let TOURI=-1, TOUR_DONE=null;
function tourTarget(sel){ for(const s of sel.split(",")){ const e=document.querySelector(s); if(!e) continue; const r=e.getBoundingClientRect(); if(r.width>4&&r.height>4&&getComputedStyle(e).visibility!=="hidden") return r; } return null; }
function startTour(){ TOURI=0; let o=document.getElementById("tour"); if(!o){ o=document.createElement("div"); o.id="tour"; o.innerHTML=`<div class="tring"></div><div class="tcard" role="dialog" aria-live="polite" aria-labelledby="tourT"><b id="tourT"></b><p id="tourD"></p><div class="tfoot"><span id="tourN"></span><button type="button" class="btn quiet" id="tourSkip">تخطّي</button><button type="button" class="btn main" id="tourNext"></button></div></div>`; document.body.appendChild(o);
    o.querySelector("#tourSkip").onclick=endTour; o.querySelector("#tourNext").onclick=()=>{ if(TOURI>=TOUR.length-1) endTour(); else { TOURI++; tourShow(); } };
    addEventListener("resize",()=>{ if(TOURI>=0) tourShow(); }); addEventListener("keydown",e=>{ if(TOURI>=0&&e.key==="Escape") endTour(); }); }
  o.style.display="block"; tourShow(); }
function tourShow(){ const o=document.getElementById("tour"), s=TOUR[TOURI], r=tourTarget(s.el), ring=o.querySelector(".tring"), card=o.querySelector(".tcard");
  o.querySelector("#tourT").textContent=s.t; o.querySelector("#tourD").textContent=s.d; o.querySelector("#tourN").textContent=`${TOURI+1} من ${TOUR.length}`;
  o.querySelector("#tourNext").textContent=TOURI>=TOUR.length-1?"يلا نبدأ ✓":"التالي ←";
  const big=!r||r.width*r.height>innerWidth*innerHeight*0.5; ring.classList.toggle("off",big);
  if(!big){ const p=6; Object.assign(ring.style,{left:r.left-p+"px",top:r.top-p+"px",width:r.width+2*p+"px",height:r.height+2*p+"px"}); }
  const cw=Math.min(340,innerWidth-32); card.style.width=cw+"px";
  let top=big?innerHeight/2-90:r.bottom+14; if(!big&&top+200>innerHeight) top=Math.max(12,r.top-14-(card.offsetHeight||190));
  const left=big?(innerWidth-cw)/2:Math.max(16,Math.min(innerWidth-cw-16,r.left+r.width/2-cw/2)); Object.assign(card.style,{top:top+"px",left:left+"px"});
  o.querySelector("#tourNext").focus({preventScroll:true}); }
function endTour(){ TOURI=-1; const o=document.getElementById("tour"); if(o) o.style.display="none"; TOUR_DONE=true; stSet("ktour",1); }
/* after the start screen / wizard closes on a first visit; waits while any dialog is open */
async function maybeTour(tries){ if(TOUR_DONE||navigator.webdriver) return; if(TOUR_DONE===null){ TOUR_DONE=!!(await stGet("ktour")); if(TOUR_DONE) return; }
  const busy=[...document.querySelectorAll(".ovl,#draw")].some(e=>getComputedStyle(e).display!=="none")||(typeof WIZ!=="undefined"&&WIZ);
  if(busy){ if((tries||0)<40) setTimeout(()=>maybeTour((tries||0)+1),1500); return; } if(TOURI<0) startTour(); }

// ---------- backup reminder ----------
function markBackup(){ stSet("kbak",Date.now()); }
async function quickBackup(){ const d=await backupData(), ok=downloadText(`تصميماتي-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(d)); if(ok) markBackup(); return ok; }
async function backupNag(slot){ if(!projIndex.length) return; const rd=await stRead("kbak"); if(rd.err) return;
  const since=rd.v||Math.min(...projIndex.map(p=>p.t||Date.now())), days=Math.floor((Date.now()-since)/864e5); if(days<14||!slot.isConnected) return;
  const c=document.createElement("div"); c.className="nag"; c.id="backupNag";
  c.innerHTML=`<span>💾 ${rd.v?`بقالك ${days} يوم من غير نسخة احتياطية.`:"لسه ماعملتش نسخة احتياطية لشغلك."} لو المتصفح اتمسحت بياناته، التصميمات هتضيع.</span>`;
  const b=document.createElement("button"); b.className="btn main"; b.textContent="⬇ نزّل نسخة دلوقتي"; b.onclick=async()=>{ b.disabled=true; const ok=await quickBackup(); c.innerHTML=`<span>${ok?"✓ اتنزّلت النسخة. احتفظ بيها في درايف أو ابعتها لنفسك على واتساب.":"التنزيل مش متاح هنا، افتح «كل التصميمات» وانسخها كنص."}</span>`; };
  c.appendChild(b); slot.appendChild(c); }

// ---------- a contractor's plan picture under the apartment plan ----------
// kept in its own key (kaptbg:<id>) so the apartment JSON, its undo and the backups stay small
let APTBG={id:null,v:null,busy:false};
async function aptBgLoad(){ if(APTBG.id===APT_ID||APTBG.busy) return; APTBG.busy=true; const rd=await stRead("kaptbg:"+APT_ID); APTBG={id:APT_ID,v:rd.v&&typeof rd.v.src==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(rd.v.src)?rd.v:null,busy:false}; if(APTBG.v&&document.getElementById("aptSvg")) renderApt(); }
function aptBgSVG(){ const g=APTBG.id===APT_ID&&APTBG.v; if(!g) return ""; const S=100;
  return `<image href="${g.src}" x="${g.x*S}" y="${g.z*S}" width="${g.w*S}" height="${g.w*g.ar*S}" opacity="${g.op}" preserveAspectRatio="none" pointer-events="none" style="mix-blend-mode:multiply"/>`; }
function aptBgBounds(){ const g=APTBG.id===APT_ID&&APTBG.v; return g?{x0:g.x,z0:g.z,x1:g.x+g.w,z1:g.z+g.w*g.ar}:null; }
function aptBgUI(box){ aptBgLoad(); const g=APTBG.id===APT_ID&&APTBG.v, card=document.createElement("div"); card.className="card";
  const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>🖼 صورة المسقط من المقاول</b><small>${g?"ظاهرة تحت الأوض":"حطها تحت الأوض وارسم فوقها"}</small>`; card.appendChild(hd);
  const body=document.createElement("div"); card.appendChild(body); foldCard(card,hd,"aptbg"); box.appendChild(card);
  const fi=document.createElement("input"); fi.type="file"; fi.accept="image/*"; fi.style.display="none";
  const st=document.createElement("div"); st.className="note";
  fi.onchange=async()=>{ const f=fi.files[0]; if(!f) return; st.textContent="بجهّز الصورة…";
    try{ const src=await new Promise((ok,no)=>{ const im=new Image(), u=URL.createObjectURL(f); im.onload=()=>{ const k=Math.min(1,1600/Math.max(im.width,im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
        const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u); ok({src:c.toDataURL("image/jpeg",0.72),ar:c.height/c.width}); }; im.onerror=()=>{ URL.revokeObjectURL(u); no(new Error("img")); }; im.src=u; });
      const rs=APT.rooms.filter(r=>SNAP[r.id]).map(r=>roomRectW(r)), X0=rs.length?Math.min(...rs.map(R=>R.x0)):0, Z0=rs.length?Math.min(...rs.map(R=>R.z0)):0, X1=rs.length?Math.max(...rs.map(R=>R.x1)):10;
      const v={src:src.src,ar:src.ar,x:+X0.toFixed(2),z:+Z0.toFixed(2),w:Math.max(4,+(X1-X0).toFixed(1)),op:0.7}; await stSet("kaptbg:"+APT_ID,v); APTBG={id:APT_ID,v,busy:false}; renderApt(); }
    catch(e){ st.textContent="مقدرتش أفتح الصورة دي، جرّب صورة JPG أو PNG"; } };
  const pick=document.createElement("button"); pick.className="btn wide"+(g?"":" main"); pick.textContent=g?"🔁 غيّر الصورة":"📷 اختار صورة المسقط"; pick.onclick=()=>fi.click(); body.append(fi,pick);
  if(!g){ const n=document.createElement("div"); n.className="note"; n.textContent="صوّر رسمة الشقة من المقاول أو المهندس، وظبط عرضها الحقيقي بالمتر، وبعدين حرّك الأوض وغيّر مقاساتها لحد ما تركب عليها."; body.append(n,st); return; }
  const save=()=>{ stSet("kaptbg:"+APT_ID,g); renderApt(); };
  const num=(k,l,mn,mx,st,u)=>fieldRow(body,l,numIn(g[k],mn,mx,u,v=>{ g[k]=v; save(); },st,null,l));
  num("w","عرض الرسمة الحقيقي",2,40,0.1,"م"); num("x","حرّكها يمين وشمال",-20,20,0.1,"م"); num("z","حرّكها لفوق وتحت",-20,20,0.1,"م"); num("op","وضوح الصورة",0.1,1,0.05,"");
  const rm=document.createElement("button"); rm.className="btn wide"; rm.textContent="🗑 شيل الصورة"; rm.onclick=async()=>{ await stDel("kaptbg:"+APT_ID); APTBG={id:APT_ID,v:null,busy:false}; renderApt(); };
  body.append(rm,st); }
document.getElementById("shareBtn").onclick=()=>shareDesign();
