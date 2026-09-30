// =================== APARTMENT (rooms linked together) ===================
const HTEMPLATES={  h_hall:{name:"طرقة",dims:[120,400],make:(W,L)=>({feats:[{id:"d1",type:"door",wall:"L",pos:60,w:80,y:0,h:210,d:0},{id:"d2",type:"door",wall:"RT",pos:220,w:80,y:0,h:210,d:0},{id:"en",type:"door",wall:"D",pos:Math.max(0,Math.round((W-90)/2)),w:90,y:0,h:210,d:0}]})} };
// several apartments per device: each one is saved under kapt:<id> and listed in kapt:index as {id,name,rooms:[room ids],t}.
// "main" is the id of the apartment saved before there was a list, so older data opens as it is.
function aptDef(){ return {rooms:[],wallT:12,baseFill:7,riser:null,water:null,panel:null,heaterMode:"shared",heaterAt:null}; }
let APT_ID="main", APTS=[], APTS_BAD=false, APT_LOADED=null;
let APT=aptDef(), SNAP={}, APT3D=false, APT_BUILD=false, aptRoots=[], aptSel=null, aptTab="المسقط", aptPlace=null, APTLINKS=[];
const aoLocal=(w,a,o,RW_,RL_)=>w==="L"?[o,a]:w==="RT"?[RW_-o,a]:w==="W"?[a,o]:[a,RL_-o];
const aptSize=(sn,rot)=>rot%180===0?[sn.RW,sn.RL]:[sn.RL,sn.RW];
function toWorld(r,sn,x,z){ let p; switch(r.rot){ case 90:p=[sn.RL-z,x];break; case 180:p=[sn.RW-x,sn.RL-z];break; case 270:p=[z,sn.RW-x];break; default:p=[x,z]; } return [r.x/100+p[0],r.z/100+p[1]]; }
function toLocal(r,sn,X,Z){ const x=X-r.x/100, z=Z-r.z/100; switch(r.rot){ case 90:return [z,sn.RL-x]; case 180:return [sn.RW-x,sn.RL-z]; case 270:return [sn.RW-z,x]; default:return [x,z]; } }
const manh=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
let APT_UNDO=[], APT_LAST=null, APT_ROOMS_PREV=null;
async function saveApt(){ const now=JSON.stringify(APT); if(APT_LAST!=null&&(now!==APT_LAST||APT_ROOMS_PREV)){ APT_UNDO.push({apt:APT_LAST,rooms:APT_ROOMS_PREV}); if(APT_UNDO.length>40) APT_UNDO.shift(); } APT_ROOMS_PREV=null; APT_LAST=now; await stSet("kapt:"+APT_ID,APT); await aptIndexSync(); }
const aptOtherRooms=()=>new Set(APTS.filter(a=>a.id!==APT_ID).flatMap(a=>a.rooms||[])); /* rooms that belong to the other apartments */
const aptNameOf=a=>cleanName(a&&a.name)||"شقتي";
async function aptIndexSync(touch){ const ids=APT.rooms.map(r=>r.id), nm=aptNameOf(APT); let e=APTS.find(a=>a.id===APT_ID);
  if(e&&!touch&&e.name===nm&&JSON.stringify(e.rooms||[])===JSON.stringify(ids)) return; if(!e){ e={id:APT_ID}; APTS.push(e); }
  Object.assign(e,{name:nm,rooms:ids,t:Date.now()}); if(!APTS_BAD) await stSet("kapt:index",APTS); } /* never write the list over one whose read failed */
async function loadAptIndex(){ const rd=await stRead("kapt:index"); APTS_BAD=!!rd.err;
  APTS=Array.isArray(rd.v)?rd.v.filter(a=>a&&typeof a.id==="string"&&/^[\w-]{1,40}$/.test(a.id)).map(a=>({id:a.id,name:aptNameOf(a),rooms:Array.isArray(a.rooms)?a.rooms.filter(x=>typeof x==="string"):[],t:+a.t||0})):[];
  if(!rd.err&&!rd.v){ const m=await stRead("kapt:main"); if(m.v&&Array.isArray(m.v.rooms)&&m.v.rooms.length) APTS=[{id:"main",name:aptNameOf(m.v),rooms:m.v.rooms.map(r=>r&&r.id).filter(Boolean),t:1}]; } /* saved before the list existed */
  const last=[...APTS].sort((a,b)=>b.t-a.t)[0]; APT_ID=last?last.id:"main"; }
async function aptUndo(){ const e=APT_UNDO.pop(); if(!e) return;
  APT=JSON.parse(e.apt); for(const [id,d] of Object.entries(e.rooms||{})){ if(id===PROJ.id){ cfg=migrate(clone(d.cfg)); PROJ.name=d.name; updProjName(); build(); await saveNow(); } else await stSet("kproj:"+id,d); const p=projIndex.find(x=>x.id===id); if(p) p.name=d.name; }
  if(e.rooms) await stSet("kproj:index",projIndex); APT_LAST=JSON.stringify(APT); await stSet("kapt:"+APT_ID,APT); await aptIndexSync();
  try{ await refreshSnaps(); }catch(err){ hint("مقدرتش أقرا الأوض من الحفظ، جرّب تاني",4000); } APT_SVC=aptServices(); renderApt(); hint("↶ رجعت خطوة"); }
const roomIco=sn=>sn.cfg&&sn.cfg.template==="r_balcony"?"🌿":isShop(sn.cfg)?"🏪":({kitchen:"🍳",bath:"🚿",hall:"🚪",room:"🛋"}[sn.roomType]||"");
const aptArea=sn=>(sn.q&&+sn.q.floorA)||sn.RW*sn.RL; /* clear floor */
const aptBrick=()=>APT.dimMode==="brick", aptFin=sn=>aptBrick()?2*((+sn.cfg.plaster||0)+(+sn.cfg.tileT||0)):0; /* cm added to each size when shown on the brick */
const aptDims=sn=>{ const e=aptFin(sn); return [Math.round(sn.RW*100)+e,Math.round(sn.RL*100)+e]; };
const aptAreaM=sn=>{ const e=aptFin(sn)/100; return aptArea(sn)+(sn.RW+e)*(sn.RL+e)-sn.RW*sn.RL; };
const aptDimWord=()=>aptBrick()?"على الطوب":"صافي";
async function aptEditRoom(id,fn){ // change a room's saved design (size, name) from the apartment screen, then re-snapshot just that room
  let d; if(id===PROJ.id) d={name:PROJ.name,cfg:clone(cfg)}; else { const rd=await stRead("kproj:"+id); if(rd.err||!rd.v){ hint("مقدرتش أقرا الأوضة من الحفظ، جرّب تاني",4000); return false; } d=rd.v; }
  APT_ROOMS_PREV=APT_ROOMS_PREV||{}; if(!(id in APT_ROOMS_PREV)) APT_ROOMS_PREV[id]=clone(d);
  fn(d); d.name=cleanName(d.name)||APT_ROOMS_PREV[id].name;
  if(id===PROJ.id){ cfg=d.cfg; PROJ.name=d.name; updProjName(); build(); await saveNow(); } else await stSet("kproj:"+id,d);
  const p=projIndex.find(x=>x.id===id); if(p&&p.name!==d.name){ p.name=d.name; await stSet("kproj:index",projIndex); }
  const saved=cfg, sl=loadingP; loadingP=true; SLIDING=true; try{ SNAP[id]=snapCurrent(id===PROJ.id?saved:migrate(clone(d.cfg)),d.name); } finally{ cfg=saved; SLIDING=false; build(); loadingP=sl; }
  return true; }
const sizeKey=(r,axis)=>(axis==="x")===(r.rot%180===0)?"roomW":"roomL"; /* the room's own width/length that runs along the plan's x or z */
const finOf=(sn,k)=>sn.cfg[k]-Math.round((k==="roomW"?sn.RW:sn.RL)*100); /* entered size minus the clear size (plaster + tiles when sizes are on the brick) */
async function aptResize(r,axis,net,fromStart){ // net = new clear size in cm across the plan; the other edge stays, rooms after it in the same row move along
  const sn=SNAP[r.id], k=sizeKey(r,axis), sc=SCHEMA["الأوضة"].find(c=>c.k===k)||{min:120,max:700}, mn=sn.roomType==="hall"?(k==="roomW"?70:60):sc.min, v=Math.max(mn,Math.min(sc.max,Math.round(net+finOf(sn,k))));
  if(v===sn.cfg[k]) { renderApt(); return; }
  const R0=roomRectW(r), old=axis==="x"?R0.x1-R0.x0:R0.z1-R0.z0; if(!await aptEditRoom(r.id,d=>{ d.cfg[k]=v; })) return;
  const R1=roomRectW(r), dl=Math.round(((axis==="x"?R1.x1-R1.x0:R1.z1-R1.z0)-old)*100), off0=r.rel?(r.rel.off||0):0;
  const along=r.rel&&((axis==="x")===(r.rel.side==="top"||r.rel.side==="bottom"));
  if(fromStart){ if(along) r.rel.off=off0-dl; else if(!r.rel){ if(axis==="x") r.x-=dl; else r.z-=dl; } }
  if(along&&dl) for(const o of APT.rooms) if(o!==r&&o.rel&&o.rel.to===r.rel.to&&o.rel.side===r.rel.side){ const oo=o.rel.off||0; if(!fromStart&&oo>off0) o.rel.off=oo+dl; if(fromStart&&oo<off0) o.rel.off=oo-dl; }
  aptRecalc(); await saveApt(); renderApt(); }
async function loadApt(){ const rd=await stRead("kapt:"+APT_ID); if(rd.v) APT={...aptDef(),...rd.v}; else if(APT_LOADED!==APT_ID) APT=aptDef(); APT_LOADED=APT_ID; }
function projName(id){ const p=projIndex.find(x=>x.id===id); return id===PROJ.id?PROJ.name:(p?p.name:"؟"); }
function snapQ(c){ const q={...(QTY||{})}; q.pts={}; for(const p of POINTS) q.pts[p.type]=(q.pts[p.type]||0)+1; q.fix={}; q.app={}; q.furn={}; q.wardrobes=[];
  for(const u of UNITS){ if(u.bt){ const n=u.label||KN[u.bt]; q.fix[n]=(q.fix[n]||0)+1; } if(["sink","stove","fridge","washer","dish","hood"].includes(u.kind)&&c.roomType!=="bath"){ const n={sink:"حوض مطبخ",stove:c.stoveType==="built"?"مسطح وفرن بلت إن":"بوتاجاز",fridge:"تلاجة",washer:"غسالة",dish:"غسالة أطباق",hood:"شفاط"}[u.kind]; q.app[n]=(q.app[n]||0)+1; }
    if(u.kind==="app"){ const n=u.label||"جهاز"; q.app[n]=(q.app[n]||0)+1; } }
  for(const it of c.furn||[]){ const T=FURN[it.type]; if(!T) continue; const E=effDims(it,T); if(T.modular){ const u=UNITS.find(x=>x.furn===it.id); q.wardrobes.push(`${T.n} ${E.w}×${it.d}×${E.h}${u&&u.front?" ("+u.front+")":""}`); } else { const n=`${T.n} ${E.w}×${it.d}`; q.furn[n]=(q.furn[n]||0)+1; } }
  return q; }
function snapCurrent(c,name){ // build a room silently and capture what the apartment needs
  cfg=c; build();
  const pts=POINTS.map(p=>{ const [x,z]=markerPos(p); return {x,z,y:p.y,type:p.type,note:p.note}; });
  const a=STATS.acc||{}; const costs={kitchen:0,tile:0,wp:0,paint:0}; // per budget line (BUDGET_DEF)
  if(c.roomType==="bath"&&BATH){ costs.tile=(BATH.wallA+BATH.floorA)*(1+c.waste/100)*c.pTile+(BATH.wallA+BATH.floorA)*c.pLabor; costs.wp=BATH.wp*c.pWP; }
  else if((c.roomType==="room"||c.roomType==="hall")&&ROOMQ){ costs.tile=ROOMQ.floorA*1.1*(c.pFloor||0)+ROOMQ.skirt*(c.pSkirt||0); costs.paint=ROOMQ.paintA*(c.pPaint||0); }
  else if(c.roomType!=="hall"&&c.roomType!=="room") costs.kitchen=(a.lower||0)*c.pLower+(a.upper||0)*c.pUpper+(a.tall||0)*c.pTall+(a.marble||0)*c.pMarble;
  const cost=costs.kitchen+costs.tile+costs.wp+costs.paint;
  return {name,roomType:c.roomType||"kitchen",RW,RL,H,feats:FEATS.map(f=>({...f})),units:UNITS.filter(u=>u.y0<1&&(W4.includes(u.wall)||u.wall==="IS"||u.wall==="FR")).map(u=>({...unitRect(u),kind:u.kind,label:u.label,ft:u.ft})),
    pts,warn:[...new Set(STATS.warn)],elec:elecLoads(),cost,costs,bath:BATH?{...BATH}:null,acc:{...a},hasToilet:UNITS.some(u=>u.kind==="toilet"),cfg:c,cuts:CUTS.map(k=>({...k})),q:snapQ(c),gb:GBQ?{...GBQ,outer:null,inner:null,spotPts:null}:null};
}
async function refreshSnaps(){
  const saved=cfg, sl=loadingP; loadingP=true; SLIDING=true; SNAP={};
  try{ for(const r of APT.rooms){ let c; if(r.id===PROJ.id) c=saved; else { const rd=await stRead("kproj:"+r.id); let d=rd.v; if(rd.err) throw new Error("storage read failed: "+r.id); // never replace an unreadable room with a default
        if(!d){ const nm=projName(r.id); if(nm==="؟") continue; d={name:nm,cfg:newCfg(nm.includes("بلكونة")?"r_balcony":nm.includes("طرقة")?"h_hall":nm.includes("حمام")?"b_std":nm.includes("صالة")?"r_living":nm.includes("أطفال")?"r_kids":nm.includes("نوم")?"r_master":"L")}; await stSet("kproj:"+r.id,d); }
        c=migrate(d.cfg); } SNAP[r.id]=snapCurrent(c,projName(r.id)); } }
  finally{ cfg=saved; SLIDING=false; build(); loadingP=sl; }
  APT.rooms=APT.rooms.filter(r=>SNAP[r.id]); layoutRel(); computeShared(); computeLinks();
}
function wallWorld(r,sn,w,a0,a1){ const p0=toWorld(r,sn,...aoLocal(w,a0,0,sn.RW,sn.RL)), p1=toWorld(r,sn,...aoLocal(w,a1,0,sn.RW,sn.RL)), q=toWorld(r,sn,...aoLocal(w,(a0+a1)/2,-1,sn.RW,sn.RL)), m=toWorld(r,sn,...aoLocal(w,(a0+a1)/2,0,sn.RW,sn.RL)); return {p0,p1,n:[q[0]-m[0],q[1]-m[1]]}; }
function computeLinks(){
  APTLINKS=[]; const g=APT.wallT/100;
  for(const A of APT.rooms){ const sa=SNAP[A.id]; if(!sa) continue;
    for(const f of sa.feats){ if(f.type!=="door"&&f.type!=="opening") continue; const {p0,p1,n}=wallWorld(A,sa,f.wall,f.a0,f.a1); let linked=null;
      for(const B of APT.rooms){ if(B===A) continue; const sb=SNAP[B.id]; if(!sb) continue;
        const q0=[p0[0]+n[0]*g,p0[1]+n[1]*g], q1=[p1[0]+n[0]*g,p1[1]+n[1]*g], l0=toLocal(B,sb,...q0), l1=toLocal(B,sb,...q1);
        for(const wB of W4){ const o=l=>wB==="L"?l[0]:wB==="RT"?sb.RW-l[0]:wB==="W"?l[1]:sb.RL-l[1], al=l=>wB==="L"||wB==="RT"?l[1]:l[0], len=wB==="W"||wB==="D"?sb.RW:sb.RL;
          if(Math.abs(o(l0))<0.07&&Math.abs(o(l1))<0.07){ const b0=Math.min(al(l0),al(l1)), b1=Math.max(al(l0),al(l1)); if(b1>0.05&&b0<len-0.05){ linked={A:A.id,B:B.id,wallA:f.wall,wallB:wB,b0:Math.max(0,b0),b1:Math.min(len,b1),f,p0,p1,n}; break; } } }
        if(linked) break; }
      APTLINKS.push(linked||{A:A.id,B:null,f,p0,p1,n,wallA:f.wall}); } }
  if(typeof aptDoorLinks==="function") APTLINKS.push(...aptDoorLinks());
}
function roomRectW(r){ const sn=SNAP[r.id]; const [w,h]=aptSize(sn,r.rot); return {x0:r.x/100,z0:r.z/100,x1:r.x/100+w,z1:r.z/100+h}; }
function snapPos(r,x,z){ // x,z in cm (top-left); snap to other rooms' edges with wall gap
  const sn=SNAP[r.id], [w,h]=aptSize(sn,r.rot).map(v=>v*100), g=APT.wallT, T=15; let bx=x, bz=z, dx=T, dz=T;
  for(const o of APT.rooms){ if(o===r||!SNAP[o.id]) continue; const R=roomRectW(o), ox0=R.x0*100, ox1=R.x1*100, oz0=R.z0*100, oz1=R.z1*100;
    for(const c of [ox1+g, ox0-g-w, ox0, ox1-w]) if(Math.abs(x-c)<dx){ dx=Math.abs(x-c); bx=c; }
    for(const c of [oz1+g, oz0-g-h, oz0, oz1-h]) if(Math.abs(z-c)<dz){ dz=Math.abs(z-c); bz=c; } }
  return [Math.round(bx),Math.round(bz)];
}
// ---------- phase 2: plumbing, electric, levels ----------
function roomEntry(r,src){ const R=roomRectW(r); return [Math.min(R.x1,Math.max(R.x0,src[0])),Math.min(R.z1,Math.max(R.z0,src[1]))]; }
function aptServices(){
  const out={rooms:[],warn:[],drain:{m4:0,m2:0},cold:{main:0,br:0},hot:{main:0,br:0},wire:{},circuits:0,demand:0,levels:[],heater:null};
  const P=v=>v?[v.x/100,v.z/100]:null, riser=P(APT.riser), water=P(APT.water), panel=P(APT.panel);
  let heater=APT.heaterMode==="shared"?P(APT.heaterAt):null;
  if(APT.heaterMode==="shared"&&!heater){ for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const hp=sn.pts.find(p=>p.note.includes("خروج سخن")); if(hp){ heater=toWorld(r,sn,hp.x,hp.z); out.heater=sn.name; break; } } }
  for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const R=roomRectW(r), W=pt=>toWorld(r,sn,pt.x,pt.z);
    const drains=sn.pts.filter(p=>p.type==="drain"&&!p.note.includes("التكييف")), waters=sn.pts.filter(p=>p.type==="water"), hots=waters.filter(p=>p.note.includes("سخن")&&!p.note.includes("خروج"));
    const row={id:r.id,name:sn.name,type:sn.roomType,fill:0,drainL:0,coldL:0,hotL:0,farHot:0,wire:0};
    const own=sn.pts.filter(p=>p.type==="exist"&&p.note.includes("صرف")).map(W), srcs=[...own,...(riser?[riser]:[]),...(APT.riser2?[P(APT.riser2)]:[])];
    if(srcs.length&&drains.length){ let src=srcs[0], best=1e9; for(const c of srcs){ const dd=manh(c,roomEntry(r,c))+drains.reduce((x,d)=>x+manh(W(d),c),0)*0.01; if(dd<best){ best=dd; src=c; } }
      const e=roomEntry(r,src), main=manh(src,e); let br=0; for(const d of drains){ const l=manh(W(d),e), big=d.note.includes("4 بوصة"); br+=l; if(big) out.drain.m4+=l; else out.drain.m2+=l; if(sn.roomType==="bath") row.fill=Math.max(row.fill,(big?13:8)+(l+main)*100*0.02); }
      row.drainL=main+br; if(sn.hasToilet) out.drain.m4+=main; else out.drain.m2+=main; row.src=own.includes(src)?"صرف الأوضة":"العمود الرئيسي"; }
    else if(sn.bath) row.fill=sn.bath.fill;
    if(water&&waters.length){ const e=roomEntry(r,water), main=manh(water,e); let br=0; for(const w of waters) br+=manh(W(w),e); out.cold.main+=main; out.cold.br+=br; row.coldL=main+br; }
    if(hots.length){ if(heater){ const e=roomEntry(r,heater), main=manh(heater,e); let br=0; for(const h of hots){ const l=manh(W(h),e); br+=l; row.farHot=Math.max(row.farHot,main+l); } out.hot.main+=main; out.hot.br+=br; row.hotL=main+br;
        if(row.farHot>7) out.warn.push(`المية السخنة هتوصل ${sn.name} بعد ${row.farHot.toFixed(1)} م من السخان، هتستنى شوية. فكّر في سخان صغير هناك`); }
      else { const own=sn.pts.find(p=>p.note.includes("خروج سخن")); if(own){ const o=W(own); let br=0; for(const h of hots) br+=manh(W(h),o); out.hot.br+=br; row.hotL=br; } else if(APT.heaterMode!=="shared") out.warn.push(`${sn.name} فيه مية سخنة ومالوش سخان`); } }
    if(panel){ const c=[(R.x0+R.x1)/2,(R.z0+R.z1)/2], d=manh(panel,c)+2, per=(R.x1-R.x0+R.z1-R.z0)*0.8; for(const ci of sn.elec.circuits){ const m=(d+per)*3; out.wire[ci.mm]=(out.wire[ci.mm]||0)+m; row.wire+=m; out.circuits++; } }
    out.demand+=sn.elec.demand;
    row.level=Math.max(APT.baseFill,Math.round(row.fill)); out.rooms.push(row); }
  if(!riser&&!APT.riser2&&APT.rooms.some(r=>SNAP[r.id]&&SNAP[r.id].pts.some(p=>p.type==="drain")&&!SNAP[r.id].pts.some(p=>p.type==="exist"&&p.note.includes("صرف")))) out.warn.push("حدد مكان عمود الصرف على المسقط"); if(!water) out.warn.push("حدد مكان دخول المية للشقة"); if(!panel) out.warn.push("حدد مكان لوحة الكهربا");
  const lv=id=>(out.rooms.find(x=>x.id===id)||{level:APT.baseFill}).level;
  for(const L of APTLINKS){ if(!L.B) continue; const a=lv(L.A), b=lv(L.B), sa=SNAP[L.A], sb=SNAP[L.B]; if(!sa||!sb) continue;
    const wet=s=>s.roomType==="bath", diff=a-b; let adv="✓ نفس المنسوب";
    const [hi,lo,dd]=diff>=0?[sa,sb,diff]:[sb,sa,-diff];
    if(wet(hi)&&dd>0) adv=`أرضية ${hi.name} أعلى ${dd} سم: اعمل عتبة، أو هبوط في البلاطة ${dd+2} سم عشان الحمام يبقى أوطى 2 سم`;
    else if(wet(lo)&&dd<2) adv=`خلّي ${lo.name} أوطى 2 سم على الأقل عشان المية متطلعش برة`;
    else if(dd>2) adv=`فرق ${dd} سم، محتاج سلمة صغيرة أو ميول عند الباب`;
    if(!out.levels.some(x=>(x.a===L.A&&x.b===L.B)||(x.a===L.B&&x.b===L.A))) out.levels.push({a:L.A,b:L.B,na:sa.name,nb:sb.name,la:a,lb:b,adv}); }
  const g2=APT.wallT/100; for(const L of APTLINKS){ if(!L.B) continue; for(const [rid,o0,o1] of [[L.A,-0.6,0],[L.B,g2,g2+0.6]]){ const r=APT.rooms.find(x=>x.id===rid), sn=SNAP[rid]; if(!r||!sn) continue;
      const xs=[L.p0[0]+L.n[0]*o0,L.p1[0]+L.n[0]*o1,L.p0[0]+L.n[0]*o1,L.p1[0]+L.n[0]*o0], zs=[L.p0[1]+L.n[1]*o0,L.p1[1]+L.n[1]*o1,L.p0[1]+L.n[1]*o1,L.p1[1]+L.n[1]*o0], Z={x0:Math.min(...xs)+0.05,x1:Math.max(...xs)-0.05,z0:Math.min(...zs)+0.05,z1:Math.max(...zs)-0.05};
      for(const u of [...sn.units].sort((a,b)=>(b.ft==="rug")-(a.ft==="rug"))){ const a=toWorld(r,sn,u.x0,u.z0), b=toWorld(r,sn,u.x1,u.z1), U={x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])};
        if(Math.min(U.x1,Z.x1)>Math.max(U.x0,Z.x0)&&Math.min(U.z1,Z.z1)>Math.max(U.z0,Z.z0)){ out.warn.push(`الباب بين ${SNAP[L.A].name} و${SNAP[L.B].name} قدامه ${u.label||KN[u.kind]||"دواليب"} في ${sn.name}، زحلق الباب أو غيّر التصميم`); break; } } } }
  out.amps=Math.round(out.demand/220); out.main=out.amps<=32?32:out.amps<=40?40:63;
  return out;
}
// ---------- apartment plan UI ----------
function aptPlanSVG(){
  const rs=APT.rooms.filter(r=>SNAP[r.id]); if(!rs.length) return `<div class="note">ضيف أوض للشقة من تحت.</div>`;
  let X0=1e9,Z0=1e9,X1=-1e9,Z1=-1e9; for(const r of rs){ const R=roomRectW(r); X0=Math.min(X0,R.x0);Z0=Math.min(Z0,R.z0);X1=Math.max(X1,R.x1);Z1=Math.max(Z1,R.z1); }
  for(const k of ["riser","riser2","water","panel","heaterAt"]) if(APT[k]){ X0=Math.min(X0,APT[k].x/100);Z0=Math.min(Z0,APT[k].z/100);X1=Math.max(X1,APT[k].x/100);Z1=Math.max(Z1,APT[k].z/100); }
  const pad=0.9; X0-=pad;Z0-=pad;X1+=pad;Z1+=pad; const S=100;
  let s=`<svg id="aptSvg" viewBox="${X0*S} ${Z0*S} ${(X1-X0)*S} ${(Z1-Z0)*S}" xmlns="http://www.w3.org/2000/svg" font-family="Tahoma,Arial" style="touch-action:none;background:#f6f7f8">`;
  s+=`<rect x="${X0*S}" y="${Z0*S}" width="${(X1-X0)*S}" height="${(Z1-Z0)*S}" fill="#f6f7f8" data-bg="1"/>`;
  const col={kitchen:"#fff6ea",bath:"#eaf5fa",hall:"#f4f1ec",room:"#f7f4ee"};
  for(const r of rs){ const sn=SNAP[r.id], R=roomRectW(r), sel=aptSel===r.id, g=APT.wallT;
    s+=`<g data-room="${r.id}" style="cursor:move">`;
    s+=`<rect x="${R.x0*S-g/2}" y="${R.z0*S-g/2}" width="${(R.x1-R.x0)*S+g}" height="${(R.z1-R.z0)*S+g}" fill="none" stroke="${sel?"#e07b00":"#30343a"}" stroke-width="${g}"/>`;
    s+=`<rect x="${R.x0*S}" y="${R.z0*S}" width="${(R.x1-R.x0)*S}" height="${(R.z1-R.z0)*S}" fill="${col[sn.roomType]||"#fff"}"/>`;
    for(const u of [...sn.units].sort((a,b)=>(b.ft==="rug")-(a.ft==="rug"))){ const a=toWorld(r,sn,u.x0,u.z0), b=toWorld(r,sn,u.x1,u.z1); s+=`<rect x="${Math.min(a[0],b[0])*S}" y="${Math.min(a[1],b[1])*S}" width="${Math.abs(b[0]-a[0])*S}" height="${Math.abs(b[1]-a[1])*S}" fill="${UC[u.kind]||"#e5e5e5"}" stroke="#9aa0a6" stroke-width="1.5"/>`; }
    for(const f of sn.feats){ if(f.type!=="window") continue; const {p0,p1}=wallWorld(r,sn,f.wall,f.a0,f.a1); s+=`<line x1="${p0[0]*S}" y1="${p0[1]*S}" x2="${p1[0]*S}" y2="${p1[1]*S}" stroke="#6fb6e0" stroke-width="${g+2}"/>`; }
    const cx=(R.x0+R.x1)/2*S, cy=(R.z0+R.z1)/2*S, rw=(R.x1-R.x0)*S;
    s+=`<rect class="lbg" x="${cx}" y="${cy}" width="0" height="0" rx="6" fill="#fff" fill-opacity=".82"/><text class="rn" x="${cx}" y="${cy}" data-cy="${cy}" data-fit="${rw}" text-anchor="middle" font-size="${Math.max(18,Math.min(34,rw/6))}" fill="#2d5f7a" font-weight="bold">${esc(sn.name)}</text>`;
    s+=`<text class="rd" x="${cx}" y="${cy+28}" data-cy="${cy}" data-fit="${rw}" text-anchor="middle" font-size="18" fill="#6b737c">${aptDims(sn).join("×")}</text><text class="ra" x="${cx}" y="${cy+50}" data-cy="${cy}" data-fit="${rw}" text-anchor="middle" font-size="18" fill="#6b737c">${aptAreaM(sn).toFixed(1)} م²</text></g>`; }
  { let a=1e9,b=1e9,c=-1e9,d=-1e9; for(const r of rs){ const R=roomRectW(r); a=Math.min(a,R.x0);b=Math.min(b,R.z0);c=Math.max(c,R.x1);d=Math.max(d,R.z1); } const g=APT.wallT/100; a-=g;b-=g;c+=g;d+=g; const o=0.32, t=0.1;
    const ln=(x1,y1,x2,y2)=>`<line x1="${x1*S}" y1="${y1*S}" x2="${x2*S}" y2="${y2*S}" stroke="#56606a" stroke-width="1.2" vector-effect="non-scaling-stroke"/>`;
    s+=ln(a,b-o,c,b-o)+ln(a,b-o-t,a,b-o+t)+ln(c,b-o-t,c,b-o+t)+`<text x="${(a+c)/2*S}" y="${(b-o-0.06)*S}" text-anchor="middle" font-size="16" data-px="11" fill="#56606a">${(c-a).toFixed(2)} م</text>`;
    s+=ln(a-o,b,a-o,d)+ln(a-o-t,b,a-o+t,b)+ln(a-o-t,d,a-o+t,d)+`<text x="${(a-o-0.06)*S}" y="${(b+d)/2*S}" text-anchor="middle" font-size="16" data-px="11" fill="#56606a" transform="rotate(-90 ${(a-o-0.06)*S} ${(b+d)/2*S})">${(d-b).toFixed(2)} م</text>`; }
  if(aptTab==="المسقط") for(const sh of SHARED){ if(APTLINKS.some(L=>L.B&&((L.A===sh.a&&L.B===sh.b)||(L.A===sh.b&&L.B===sh.a)))) continue; const g=APT.wallT/100, c=sh.c+g/2, i=SHARED.indexOf(sh); s+=sh.v?`<line data-sh="${i}" x1="${c*S}" y1="${sh.s0*S}" x2="${c*S}" y2="${sh.s1*S}" stroke="#000" stroke-opacity="0" stroke-width="24" vector-effect="non-scaling-stroke" style="cursor:pointer"/>`:`<line data-sh="${i}" x1="${sh.s0*S}" y1="${c*S}" x2="${sh.s1*S}" y2="${c*S}" stroke="#000" stroke-opacity="0" stroke-width="24" vector-effect="non-scaling-stroke" style="cursor:pointer"/>`; s+=sh.v?`<line x1="${c*S}" y1="${sh.s0*S}" x2="${c*S}" y2="${sh.s1*S}" stroke="#2e9d5a" stroke-width="6" stroke-dasharray="14 10" pointer-events="none"/>`:`<line x1="${sh.s0*S}" y1="${c*S}" x2="${sh.s1*S}" y2="${c*S}" stroke="#2e9d5a" stroke-width="6" stroke-dasharray="14 10" pointer-events="none"/>`; }
  for(const L of APTLINKS){ const g=APT.wallT; const q0=[L.p0[0]+L.n[0]*g/200,L.p0[1]+L.n[1]*g/200], q1=[L.p1[0]+L.n[0]*g/200,L.p1[1]+L.n[1]*g/200];
    s+=`<line x1="${q0[0]*S}" y1="${q0[1]*S}" x2="${q1[0]*S}" y2="${q1[1]*S}" stroke="${L.B?"#fff":"#e07b00"}" stroke-width="${g+3}"/>`;
    if(!L.B) s+=`<text x="${(q0[0]+q1[0])/2*S+L.n[0]*40}" y="${(q0[1]+q1[1])/2*S+L.n[1]*40+6}" text-anchor="middle" font-size="16" data-px="10" fill="#e07b00">باب لبرة</text>`; }
  const sv=APT_SVC; if(sv&&aptTab!=="المسقط"){ const P=v=>[v.x/100,v.z/100];
    const route=(src,colr)=>{ for(const r of rs){ const e=roomEntry(r,src); s+=`<polyline points="${src[0]*S},${src[1]*S} ${e[0]*S},${src[1]*S} ${e[0]*S},${e[1]*S}" fill="none" stroke="${colr}" stroke-width="4" stroke-dasharray="10 6" opacity="0.8"/>`; } };
    if(APT.riser) route(P(APT.riser),"#1b3a5c"); if(APT.riser2) route(P(APT.riser2),"#1b3a5c"); if(APT.water) route(P(APT.water),"#2a7fd4"); if(APT.panel) route(P(APT.panel),"#e07b00"); }
  const hr=aptTab==="المسقط"&&aptSel&&rs.find(r=>r.id===aptSel); if(hr){ const R=roomRectW(hr), g=APT.wallT/200, mx=(R.x0+R.x1)/2, mz=(R.z0+R.z1)/2;
    for(const [h,x,z,c] of [["x0",R.x0-g,mz,"ew"],["x1",R.x1+g,mz,"ew"],["z0",mx,R.z0-g,"ns"],["z1",mx,R.z1+g,"ns"]]) s+=`<circle data-h="${h}" cx="${x*S}" cy="${z*S}" r="16" data-r="11" fill="#fff" stroke="#e07b00" stroke-width="3" vector-effect="non-scaling-stroke" style="cursor:${c}-resize"/>`; }
  const mk=(v,c,t)=>{ if(!v) return; s+=`<circle cx="${v.x}" cy="${v.z}" r="16" data-r="8" fill="${c}" stroke="#fff" stroke-width="3"/><text x="${v.x}" y="${v.z-22}" data-cy="${v.z}" text-anchor="middle" font-size="16" data-px="11" fill="${c}" font-weight="bold">${t}</text>`; };
  mk(APT.riser,"#1b3a5c","عمود الصرف"); mk(APT.riser2,"#1b3a5c","عمود صرف 2"); mk(APT.water,"#2a7fd4","دخول المية"); mk(APT.panel,"#e07b00","اللوحة"); if(APT.heaterMode==="shared") mk(APT.heaterAt,"#c0392b","السخان");
  return s+"</svg>";
}
let APT_SVC=null, aptDrag=null, aptRsz=null;
async function openApt(){ await saveNow(); await loadApt(); document.getElementById("apt").style.display="flex"; document.getElementById("aptBody").innerHTML="<div class='note'>بحضّر الشقة…</div>";
  if(!APT.rooms.length){ let id=PROJ.id; if(aptOtherRooms().has(id)){ id="p"+Date.now().toString(36); await stSet("kproj:"+id,{name:"طرقة",cfg:newCfg("h_hall")}); projIndex.push({id,name:"طرقة",t:Date.now()}); await stSet("kproj:index",projIndex); } APT.rooms=[{id,x:0,z:0,rot:0}]; } APT_UNDO=[]; APT_ROOMS_PREV=null; APT_LAST=null; try{ await refreshSnaps(); APT_LAST=JSON.stringify(APT); }catch(e){ document.getElementById("aptBody").innerHTML="<div class='note'>⚠ مقدرتش أقرا كل أوض الشقة من الحفظ دلوقتي. اقفل وجرّب تاني كمان شوية، ومتقلقش التصميمات متلمستش.</div>"; return; } APT_SVC=aptServices(); await aptIndexSync(true); renderApt(); }
function closeApt(){ document.getElementById("apt").style.display="none"; saveApt(); }
function aptTitle(){ const t=document.getElementById("aptTitle"); if(t) t.textContent="🏢 "+aptNameOf(APT); }
const newAptId=()=>"a"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
async function openAptId(id){ APT_ID=id; APT_LOADED=null; aptSel=null; aptPlace=null; aptTab="المسقط"; await openApt(); }
// a new apartment from the start screen: its own rooms (never the room open now), then the kitchen or first room opens behind it
async function createApt(name,T){ await saveNow(); APT_ID=newAptId(); APT=aptDef(); APT.name=cleanName(name)||"شقة جديدة"; APT_LOADED=APT_ID; APT_SVC=null;
  APT_UNDO=[]; APT_ROOMS_PREV=null; APT_LAST=null; aptSel=null; aptPlace=null; aptTab="المسقط"; document.getElementById("apt").style.display="flex"; aptTitle();
  await applyAptTpl({...T,fresh:true}); APT_UNDO=[]; APT_SVC=aptServices();
  const kind=k=>APT.rooms.find(r=>SNAP[r.id]&&SNAP[r.id].roomType===k), first=kind("kitchen")||kind("room")||APT.rooms[0];
  if(first&&first.id!==PROJ.id) await openProject(first.id); renderApt(); hint(`✓ «${APT.name}» جاهزة. دوس على أي أوضة في المسقط عشان تعدّل مقاسها أو تصممها`,5000); }
async function renameApt(id,name){ const nm=cleanName(name); if(!nm) return; const e=APTS.find(a=>a.id===id);
  if(id===APT_ID&&APT_LOADED===id){ APT.name=nm; await saveApt(); aptTitle(); return; }
  const rd=await stRead("kapt:"+id); if(rd.err||!rd.v){ hint("مقدرتش أقرا الشقة دي من الحفظ، جرّب تاني",4000); return; } rd.v.name=nm; await stSet("kapt:"+id,rd.v); if(e){ e.name=nm; if(!APTS_BAD) await stSet("kapt:index",APTS); } }
async function copyApt(id){ await saveNow(); const src=id===APT_ID&&APT_LOADED===id?clone(APT):await stGet("kapt:"+id); if(!src){ hint("مقدرتش أقرا الشقة دي من الحفظ، جرّب تاني",4000); return; }
  let txt=JSON.stringify(src); for(const r of src.rooms||[]){ const d=await stGet("kproj:"+r.id); if(!d) continue; const rid="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    await stSet("kproj:"+rid,{name:d.name,cfg:d.cfg}); projIndex.push({id:rid,name:d.name,t:Date.now()}); txt=txt.split(JSON.stringify(r.id)).join(JSON.stringify(rid)); } /* room ids are unique, so swapping them in the text moves every link and door too */
  await stSet("kproj:index",projIndex); const a=JSON.parse(txt), nid=newAptId(); a.name=aptNameOf(src)+" (نسخة)"; await stSet("kapt:"+nid,a);
  APTS.push({id:nid,name:a.name,rooms:(a.rooms||[]).map(r=>r.id),t:Date.now()}); if(!APTS_BAD) await stSet("kapt:index",APTS); }
// withRooms: its rooms go too (they were made for it); otherwise they stay in "my projects"
async function deleteApt(id,withRooms){ const e=APTS.find(a=>a.id===id); const rooms=id===APT_ID&&APT_LOADED===id?APT.rooms.map(r=>r.id):(e&&e.rooms)||[];
  if(withRooms){ const oth=new Set(APTS.filter(a=>a.id!==id).flatMap(a=>a.rooms||[])), gone=rooms.filter(r=>!oth.has(r));
    for(const rid of gone){ DELETED.add(rid); if(rid===PROJ.id) clearTimeout(saveT); await stDel("kproj:"+rid); } projIndex=projIndex.filter(p=>!gone.includes(p.id)); await stSet("kproj:index",projIndex);
    if(gone.includes(PROJ.id)){ const nx=[...projIndex].sort((a,b)=>b.t-a.t)[0]; if(nx) await openProject(nx.id); if(gone.includes(PROJ.id)){ PROJ={id:"p"+Date.now().toString(36),name:"مطبخي"}; cfg=newCfg("L"); clearHist(); SEL=null; updProjName(); build(); renderControls(); } } }
  await stDel("kapt:"+id); APTS=APTS.filter(a=>a.id!==id); if(!APTS_BAD) await stSet("kapt:index",APTS);
  if(id===APT_ID){ const nx=[...APTS].sort((a,b)=>b.t-a.t)[0]; APT_ID=nx?nx.id:newAptId(); APT_LOADED=null; await loadApt(); } }
const aptOfRoom=id=>APTS.find(a=>(a.id===APT_ID&&APT_LOADED===a.id?APT.rooms.map(r=>r.id):a.rooms||[]).includes(id));
// the list of apartments (start screen and "my projects"): open, rename, copy, delete
function aptListUI(el,after){ const list=[...APTS].sort((a,b)=>b.t-a.t); const redo=()=>{ if(after) after(); };
  for(const a of list){ const n=(a.id===APT_ID&&APT_LOADED===a.id?APT.rooms:a.rooms||[]).length, card=document.createElement("div"); card.className="card acard"+(a.id===APT_ID?" cur":""); /* not .sel: that marks the open design */
    card.innerHTML=`<div class="ch"><b>🏢 ${esc(a.name)}</b><small>${n} ${n>=3&&n<=10?"أماكن":"مكان"}${a.t>1?" • "+new Date(a.t).toLocaleDateString("ar-EG"):""}</small></div>`;
    const act=document.createElement("div"); act.className="act"; const mk=(t,fn,main)=>{ const b=document.createElement("button"); b.className="btn"+(main?" main":""); b.textContent=t; b.onclick=fn; act.appendChild(b); return b; };
    mk("افتح",()=>{ closeSheet(); if(typeof closeHome==="function") closeHome(); openAptId(a.id); },true);
    mk("✏️ اسم",()=>{ const inp=document.createElement("input"); inp.value=a.name; inp.className="txt"; inp.setAttribute("aria-label","اسم الشقة"); const ok=document.createElement("button"); ok.className="btn main"; ok.textContent="حفظ";
      act.innerHTML=""; act.append(inp,ok); inp.focus(); ok.onclick=async()=>{ await renameApt(a.id,inp.value); redo(); }; });
    mk("📄 نسخة",async()=>{ await copyApt(a.id); hint("✓ اتعملت نسخة من الشقة بأوضها"); redo(); });
    mk("🗑",()=>{ act.innerHTML=""; const q=document.createElement("div"); q.className="note"; q.style.flex="1 1 100%"; q.textContent=`تمسح «${a.name}»؟ لو مسحت الأوض كمان مش هترجع.`;
      const b1=document.createElement("button"); b1.className="btn main"; b1.style.cssText="background:var(--clay);border-color:var(--clay)"; b1.textContent="امسح الشقة وأوضها";
      const b2=document.createElement("button"); b2.className="btn"; b2.textContent="امسح الشقة بس"; const c=document.createElement("button"); c.className="btn"; c.textContent="لأ";
      b1.onclick=async()=>{ await deleteApt(a.id,true); redo(); }; b2.onclick=async()=>{ await deleteApt(a.id,false); redo(); }; c.onclick=redo; act.append(q,b1,b2,c); });
    card.appendChild(act); el.appendChild(card); }
  return list.length; }
let aptBig=false;
function renderApt(){ aptTitle();
  const body=document.getElementById("aptBody"), old=body.querySelector(".aptctl"), keep=old?old.scrollTop:0; body.innerHTML="";
  const withPlan=["المسقط","السباكة والكهربا","المناسيب","الإجمالي"].includes(aptTab), ov=document.getElementById("apt"); if(!withPlan) aptBig=false; ov.classList.toggle("split",withPlan); ov.classList.toggle("big",aptBig);
  const tabs=document.createElement("div"); tabs.className="tabs apttabs"; tabs.style.cssText="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none";
  for(const t of ["المسقط","السباكة والكهربا","المناسيب","الإجمالي","الرسومات","المشتريات والميزانية"]){ const b=document.createElement("button"); b.className="btn"+(aptTab===t?" on":""); b.textContent=t; b.onclick=()=>{ aptTab=t; aptPlace=null; renderApt(); }; tabs.appendChild(b); }
  body.appendChild(tabs);
  if(withPlan){ const pl=document.createElement("div"); pl.className="planbox aptplan"; pl.innerHTML=aptPlanSVG(); body.appendChild(pl); bindAptSvg();
    const bg=document.createElement("button"); bg.className="btn aptbig"; bg.textContent=aptBig?"✕ صغّر":"⛶ كبّر المسقط"; bg.onclick=()=>{ aptBig=!aptBig; ov.classList.toggle("big",aptBig); bg.textContent=aptBig?"✕ صغّر":"⛶ كبّر المسقط"; fitAptLabels(); }; pl.appendChild(bg);
    const ub=document.createElement("button"); ub.className="btn aptundo"; ub.textContent="↶ تراجع"; ub.disabled=!APT_UNDO.length; ub.onclick=()=>aptUndo(); pl.appendChild(ub);
    const rsA=APT.rooms.filter(r=>SNAP[r.id]); if(rsA.length>1){ const ar=document.createElement("div"); ar.className="aptarea"; ar.textContent=`📐 ${rsA.reduce((a,r)=>a+aptAreaM(SNAP[r.id]),0).toFixed(1)} م² ${aptDimWord()}`; pl.appendChild(ar); } }
  const box=document.createElement("div"); box.className="aptctl"; body.appendChild(box); const saveCtl=ctlEl; ctlEl=box;
  const sv=APT_SVC;
  if(aptTab==="المسقط") arrangeUI(box);
  if(aptTab==="الرسومات") aptDrawingsUI(box);
  if(aptTab==="المشتريات والميزانية") aptShopUI(box);
  if(aptTab==="السباكة والكهربا"){
    const n=document.createElement("div"); n.className="note"; n.textContent="اختار العلامة ودوس على مكانها في المسقط:"; box.appendChild(n);
    const act=document.createElement("div"); act.className="act";
    for(const [k,t] of [["riser","🟦 عمود صرف"],["riser2","🟦 عمود صرف تاني"],["water","💧 دخول المية"],["panel","⚡ اللوحة"],...(APT.heaterMode==="shared"?[["heaterAt","🔥 السخان"]]:[])]){ const b=document.createElement("button"); b.className="btn"+(aptPlace===k?" on":""); b.textContent=t; b.onclick=()=>{ aptPlace=aptPlace===k?null:k; renderApt(); }; act.appendChild(b); }
    box.appendChild(act);
    aSel(box,"المية السخنة",[["shared","سخان واحد للشقة"],["each","كل أوضة بسخانها"]],APT.heaterMode,async v=>{ APT.heaterMode=v; APT_SVC=aptServices(); await saveApt(); renderApt(); });
    if(APT.heaterMode==="shared"&&!APT.heaterAt&&sv.heater){ const nn=document.createElement("div"); nn.className="note"; nn.textContent=`السخان المشترك: اللي في ${sv.heater} (تقدر تحدد مكان تاني بعلامة 🔥)`; box.appendChild(nn); }
    const f=v=>v.toFixed(1);
    const d=document.createElement("div"); d.className="sum";
    d.innerHTML=`🟦 <b>الصرف:</b> ${f(sv.drain.m4)} م مواسير 4 بوصة + ${f(sv.drain.m2)} م مواسير 2 و3 بوصة<br>💧 <b>المية البارد:</b> ${f(sv.cold.main)} م خط رئيسي (25 مم) + ${f(sv.cold.br)} م فروع (20 مم)<br>🔥 <b>المية السخنة:</b> ${f(sv.hot.main)} م رئيسي + ${f(sv.hot.br)} م فروع<br>⚡ <b>الكهربا:</b> ${sv.circuits} دايرة • الحمل حوالي ${(sv.demand/1000).toFixed(1)} ك.و (${sv.amps} أمبير) ← قاطع رئيسي ${sv.main} أمبير<br>`+Object.entries(sv.wire).sort().map(([mm,m])=>`سلك ${mm} مم²: ${Math.ceil(m)} م`).join(" • ")+`<br><small>الأطوال تقريبية (مسار على الحيطان بزوايا قايمة) + زود 10% احتياطي.</small><br><small style="color:#A6473A">${DISCLAIM}</small>`;
    box.appendChild(d);
    const n2=document.createElement("div"); n2.className="note"; n2.textContent="كل أوضة بتصرّف على أقرب صرف: اللي جواها (لو محدده في تصميمها) أو العمود اللي على المسقط."; box.appendChild(n2);
    const t=document.createElement("div"); t.className="tbl"; t.innerHTML=`<table style="min-width:0"><tr><th>الأوضة</th><th>صرف</th><th>بارد</th><th>سخن</th><th>أبعد حنفية سخن</th></tr>${sv.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td>${f(r.drainL)} م</td><td>${f(r.coldL)} م</td><td>${f(r.hotL)} م</td><td style="color:${r.farHot>7?"#A6473A":"inherit"}">${r.farHot?f(r.farHot)+" م":"—"}</td></tr>`).join("")}</table>`; box.appendChild(t); }
  if(aptTab==="المناسيب"){
    aRange(box,"منسوب الأرضية العادي (مونة + بلاط)",3,15,APT.baseFill,"سم",async v=>{ APT.baseFill=v; APT_SVC=aptServices(); await saveApt(); renderApt(); });
    const n=document.createElement("div"); n.className="note"; n.textContent="المنسوب = ارتفاع البلاط النهائي فوق البلاطة الخرسانة. الحمام بياخد ردم أكتر عشان ميول الصرف لحد العمود."; box.appendChild(n);
    const t=document.createElement("div"); t.className="tbl"; t.innerHTML=`<table style="min-width:0"><tr><th>الأوضة</th><th>الردم المطلوب</th><th>المنسوب</th></tr>${sv.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td>${Math.round(r.fill)} سم</td><td>${r.level} سم</td></tr>`).join("")}</table>`; box.appendChild(t);
    const h=document.createElement("div"); h.className="head"; h.textContent="🚪 عند الأبواب"; box.appendChild(h);
    if(!sv.levels.length){ const x=document.createElement("div"); x.className="note"; x.textContent="مفيش أبواب مربوطة بين الأوض لسه. لزّق الأوض في بعض من تاب المسقط."; box.appendChild(x); }
    for(const L of sv.levels){ const c=document.createElement("div"); c.className="card"; c.innerHTML=`<div class="ch"><b>${L.na} ↔ ${L.nb}</b><small>${L.la} / ${L.lb} سم</small></div><div class="note">${L.adv}</div>`; box.appendChild(c); } }
  if(aptTab==="الإجمالي"){
    let tc=0, ta=0, tw=0, tp={socket:0,water:0,drain:0}; const rows=APT.rooms.filter(r=>SNAP[r.id]).map(r=>{ const sn=SNAP[r.id]; tc+=sn.cost; const fa=sn.RW*sn.RL; ta+=fa; const wa=sn.bath?sn.bath.wallA:0; tw+=wa; for(const k in tp) tp[k]+=sn.pts.filter(p=>p.type===k).length;
      return `<tr><td>${esc(sn.name)}</td><td>${fa.toFixed(1)} م²</td><td>${wa?wa.toFixed(1)+" م²":"—"}</td><td>${sn.pts.filter(p=>p.type==="socket").length}/${sn.pts.filter(p=>p.type==="water").length}/${sn.pts.filter(p=>p.type==="drain").length}</td><td>${sn.cost>0?Math.round(sn.cost).toLocaleString("ar-EG"):"—"}</td></tr>`; }).join("");
    const t=document.createElement("div"); t.className="tbl"; t.innerHTML=`<table style="min-width:0"><tr><th>الأوضة</th><th>الأرضية</th><th>سيراميك حيطان</th><th>برايز/مية/صرف</th><th>التكلفة</th></tr>${rows}<tr style="font-weight:bold;background:#f1f4f6"><td>الشقة</td><td>${ta.toFixed(1)} م²</td><td>${tw?tw.toFixed(1)+" م²":"—"}</td><td>${tp.socket}/${tp.water}/${tp.drain}</td><td>${tc>0?Math.round(tc).toLocaleString("ar-EG")+" ج":"—"}</td></tr></table>`; box.appendChild(t);
    const allW=[...APT_SVC.warn,...APT.rooms.filter(r=>SNAP[r.id]).flatMap(r=>SNAP[r.id].warn.map(w=>SNAP[r.id].name+": "+w))];
    const h=document.createElement("div"); h.className="head"; h.textContent=`⚠ ملاحظات (${allW.length})`; box.appendChild(h);
    const ul=document.createElement("ul"); ul.style.cssText="font-size:13px;line-height:1.7;color:#A6473A;padding-inline-start:18px"; ul.innerHTML=allW.slice(0,25).map(w=>`<li>${esc(w)}</li>`).join(""); box.appendChild(ul); }
  ctlEl=saveCtl; box.scrollTop=keep; fitAptLabels();
}
function fitAptLabels(){ // label sizes in screen pixels, whatever the plan's scale; room names shrink to fit their room
  const svg=document.getElementById("aptSvg"), M=svg&&svg.getScreenCTM(); if(!M||!M.a) return; const k=M.a;
  svg.querySelectorAll("[data-px]").forEach(t=>{ const f=+t.dataset.px/k; t.setAttribute("font-size",f); if(t.dataset.cy) t.setAttribute("y",+t.dataset.cy-12/k); });
  svg.querySelectorAll("[data-r]").forEach(c=>c.setAttribute("r",+c.dataset.r/k));
  svg.querySelectorAll("g[data-room]").forEach(g=>{ const n=g.querySelector(".rn"), d=g.querySelector(".rd"), ra=g.querySelector(".ra"), bg=g.querySelector(".lbg"); if(!n||!d) return; const w=+n.dataset.fit, cy=+n.dataset.cy;
    const fn=Math.min(14/k,w*0.9/(Math.max(3,n.textContent.length)*0.62)), fd=Math.min(11/k,w*0.9/(d.textContent.length*0.6)); n.setAttribute("font-size",fn); d.setAttribute("font-size",fd);
    n.setAttribute("y",cy-0.1*fn-(ra?fd*0.55:0)); d.setAttribute("y",cy+0.35*fn+fd*1.05-(ra?fd*0.55:0)); if(ra){ ra.setAttribute("font-size",fd); ra.setAttribute("y",cy+0.35*fn+fd*2.2-fd*0.55); }
    try{ const a=n.getBBox(), b=(ra||d).getBBox(), c=d.getBBox(), p=3/k, x0=Math.min(a.x,b.x,c.x)-p, x1=Math.max(a.x+a.width,b.x+b.width,c.x+c.width)+p; bg.setAttribute("x",x0); bg.setAttribute("y",a.y-p); bg.setAttribute("width",x1-x0); bg.setAttribute("height",b.y+b.height-a.y+2*p); bg.setAttribute("rx",5/k); }catch(e){} });
}
addEventListener("resize",()=>{ if(document.getElementById("apt").style.display==="flex") fitAptLabels(); });
function svgPt(svg,e){ const p=svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function bindAptSvg(){
  const svg=document.getElementById("aptSvg"); if(!svg) return;
  svg.addEventListener("pointerdown",e=>{ const pt=svgPt(svg,e);
    if(aptPlace){ APT[aptPlace]={x:Math.round(pt.x),z:Math.round(pt.y)}; aptPlace=null; APT_SVC=aptServices(); saveApt(); renderApt(); return; }
    if(aptTab!=="المسقط") return;
    const hd=e.target.closest("[data-h]"), hr=hd&&APT.rooms.find(x=>x.id===aptSel); if(hr){ const ns="http://www.w3.org/2000/svg", k=svg.getScreenCTM().a, pv=document.createElementNS(ns,"rect"), tx=document.createElementNS(ns,"text");
      pv.setAttribute("fill","#e07b00"); pv.setAttribute("fill-opacity",".12"); pv.setAttribute("stroke","#e07b00"); pv.setAttribute("stroke-width","2"); pv.setAttribute("stroke-dasharray","6 4"); pv.setAttribute("vector-effect","non-scaling-stroke");
      tx.setAttribute("text-anchor","middle"); tx.setAttribute("font-size",13/k); tx.setAttribute("font-weight","bold"); tx.setAttribute("fill","#b35f00"); tx.setAttribute("stroke","#fff"); tx.setAttribute("stroke-width",4/k); tx.setAttribute("paint-order","stroke"); svg.append(pv,tx);
      aptRsz={r:hr,edge:hd.dataset.h,R:roomRectW(hr),sx:pt.x,sy:pt.y,pv,tx}; aptRszMove(pt); svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    const sh=e.target.closest("[data-sh]"), s=sh&&SHARED[+sh.dataset.sh]; if(s){ const len=Math.round((s.s1-s.s0)*100), at=(s.v?pt.y:pt.x)-s.s0*100; APT.doors=APT.doors||[];
      APT.doors.push({a:s.a,b:s.b,w:80,pos:Math.max(0,Math.min(Math.max(0,len-90),Math.round(at-40)))}); aptSel=s.a; aptRecalc(); saveApt(); renderApt(); hint("✓ اتحط باب. تقدر تزحلقه أو تشيله من كارت الأوضة",3500); return; }
    const g=e.target.closest("[data-room]"); if(!g) return; const r=APT.rooms.find(x=>x.id===g.dataset.room); if(!r) return; if(APT.rooms[0]===r){ aptSel=r.id; renderApt(); return; }
    aptSel=r.id; aptDrag={r,g,sx:pt.x,sy:pt.y,ox:r.x,oz:r.z,moved:false}; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
  svg.addEventListener("pointermove",e=>{ if(aptRsz){ aptRszMove(svgPt(svg,e)); return; } if(!aptDrag) return; const pt=svgPt(svg,e), dx=pt.x-aptDrag.sx, dz=pt.y-aptDrag.sy; if(Math.hypot(dx,dz)>4) aptDrag.moved=true;
    const [nx,nz]=snapPos(aptDrag.r,aptDrag.ox+dx,aptDrag.oz+dz); aptDrag.g.setAttribute("transform",`translate(${nx-aptDrag.ox},${nz-aptDrag.oz})`); aptDrag.nx=nx; aptDrag.nz=nz; });
  const up=async()=>{ if(aptRsz){ const z=aptRsz; aptRsz=null; z.pv.remove(); z.tx.remove(); if(z.net!=null&&Math.abs(z.net-z.old)>=1) await aptResize(z.r,z.edge[0],z.net,z.edge[1]==="0"); return; } if(!aptDrag) return; const d=aptDrag; aptDrag=null; if(d.moved&&d.nx!=null){ d.r.x=d.nx; d.r.z=d.nz; if(APT.rooms[0]!==d.r) d.r.rel=null; computeShared(); computeLinks(); APT_SVC=aptServices(); await saveApt(); } renderApt(); };
  svg.addEventListener("pointerup",up); svg.addEventListener("pointercancel",up);
}
function aptRszMove(pt){ // live preview while a handle is dragged: the moving edge snaps to other rooms' walls, else to 5 cm
  const z=aptRsz, ax=z.edge[0], st=z.edge[1]==="0", g=APT.wallT; let a0=(ax==="x"?z.R.x0:z.R.z0)*100, a1=(ax==="x"?z.R.x1:z.R.z1)*100; z.old=a1-a0;
  let m=(st?a0:a1)+(ax==="x"?pt.x-z.sx:pt.y-z.sy), best=12, snap=null;
  for(const o of APT.rooms){ if(o===z.r||!SNAP[o.id]) continue; const Q=roomRectW(o), q0=(ax==="x"?Q.x0:Q.z0)*100, q1=(ax==="x"?Q.x1:Q.z1)*100; for(const c of [q0-g,q1+g,q0,q1]) if(Math.abs(c-m)<best){ best=Math.abs(c-m); snap=c; } }
  m=snap!=null?snap:(st?a1-Math.round((a1-m)/5)*5:a0+Math.round((m-a0)/5)*5); if(st) a0=Math.min(m,a1-100); else a1=Math.max(m,a0+100); z.net=Math.round(a1-a0);
  const x0=ax==="x"?a0:z.R.x0*100, x1=ax==="x"?a1:z.R.x1*100, z0=ax==="z"?a0:z.R.z0*100, z1=ax==="z"?a1:z.R.z1*100;
  z.pv.setAttribute("x",x0); z.pv.setAttribute("y",z0); z.pv.setAttribute("width",x1-x0); z.pv.setAttribute("height",z1-z0);
  const cx=(x0+x1)/2, k=z.tx.getAttribute("font-size"); z.tx.setAttribute("x",cx); z.tx.setAttribute("y",(z0+z1)/2);
  const e=aptFin(SNAP[z.r.id]), W=Math.round(x1-x0)+e, H=Math.round(z1-z0)+e;
  z.tx.innerHTML=`<tspan x="${cx}">${W}×${H}</tspan><tspan x="${cx}" dy="1.25em">${(W*H/1e4).toFixed(1)} م²</tspan>`; }
// ---------- simpler apartment arranging: "next to" + doors between rooms ----------
const SIDES=[["right","يمينها"],["left","شمالها"],["bottom","تحتها"],["top","فوقها"]];
let SHARED=[];
function aSel(parent,label,opts,val,onch){ const el=document.createElement("select"); for(const [v,t] of opts){ const o=document.createElement("option"); o.value=v; o.textContent=t; el.appendChild(o); } el.value=val; el.onchange=()=>onch(el.value); fieldRow(parent,label,el); return el; }
function aRange(parent,label,min,max,val,u,onch){ max=Math.max(min+1,max); const row=document.createElement("div"); row.className="ctl rng"; const lb=document.createElement("label"); lb.textContent=label;
  const sl=document.createElement("input"); sl.type="range"; sl.min=min; sl.max=max; sl.step=1; sl.value=val; sl.setAttribute("aria-label",label);
  const fill=()=>sl.style.setProperty("--p",Math.max(0,Math.min(100,(+sl.value-min)/((max-min)||1)*100))+"%");
  const out=numIn(val,min,max,u,v=>{ sl.value=v; fill(); onch(v); },1,null,label);
  sl.oninput=()=>{ out.set(+sl.value); fill(); }; sl.onchange=()=>onch(+sl.value); fill(); row.append(lb,out,sl); parent.appendChild(row); return sl; }
function layoutRel(){
  const placed=new Set(); if(APT.rooms[0]){ APT.rooms[0].rel=null; placed.add(APT.rooms[0].id); }
  for(let pass=0;pass<4;pass++) for(const r of APT.rooms){ if(!r.rel||!SNAP[r.id]) { placed.add(r.id); continue; } const t=APT.rooms.find(x=>x.id===r.rel.to); if(!t||!SNAP[t.id]||!placed.has(t.id)) continue;
    const R=roomRectW(t), [w,h]=aptSize(SNAP[r.id],r.rot), g=APT.wallT/100, off=(r.rel.off||0)/100;
    let x,z; if(r.rel.side==="right"){ x=R.x1+g; z=R.z0+off; } else if(r.rel.side==="left"){ x=R.x0-g-w; z=R.z0+off; } else if(r.rel.side==="bottom"){ z=R.z1+g; x=R.x0+off; } else { z=R.z0-g-h; x=R.x0+off; }
    r.x=Math.round(x*100); r.z=Math.round(z*100); placed.add(r.id); }
}
function computeShared(){
  SHARED=[]; const g=APT.wallT/100, rs=APT.rooms.filter(r=>SNAP[r.id]);
  for(let i=0;i<rs.length;i++) for(let j=0;j<rs.length;j++){ if(i===j) continue; const A=roomRectW(rs[i]), B=roomRectW(rs[j]);
    if(Math.abs(B.x0-(A.x1+g))<0.04){ const s0=Math.max(A.z0,B.z0), s1=Math.min(A.z1,B.z1); if(s1-s0>0.4) SHARED.push({a:rs[i].id,b:rs[j].id,v:true,c:A.x1,s0,s1}); }
    if(Math.abs(B.z0-(A.z1+g))<0.04){ const s0=Math.max(A.x0,B.x0), s1=Math.min(A.x1,B.x1); if(s1-s0>0.4) SHARED.push({a:rs[i].id,b:rs[j].id,v:false,c:A.z1,s0,s1}); } }
}
function localWallSeg(r,p0,p1){ const sn=SNAP[r.id], l0=toLocal(r,sn,...p0), l1=toLocal(r,sn,...p1);
  for(const w of W4){ const o=l=>w==="L"?l[0]:w==="RT"?sn.RW-l[0]:w==="W"?l[1]:sn.RL-l[1], al=l=>w==="L"||w==="RT"?l[1]:l[0];
    if(Math.abs(o(l0))<0.06&&Math.abs(o(l1))<0.06) return {wall:w,b0:Math.min(al(l0),al(l1)),b1:Math.max(al(l0),al(l1))}; } return null; }
function aptDoorLinks(){ // doors the user added between rooms from the apartment screen
  // doors whose rooms stopped touching are skipped, not deleted, so they come back when the rooms touch again (either order)
  const out=[], g=APT.wallT/100;
  for(const d of APT.doors||[]){ const s=SHARED.find(x=>(x.a===d.a&&x.b===d.b)||(x.a===d.b&&x.b===d.a)); if(!s) continue; const A=APT.rooms.find(r=>r.id===s.a), B=APT.rooms.find(r=>r.id===s.b); if(!A||!B) continue;
    const len=s.s1-s.s0, w=Math.min(d.w/100,len-0.1), a0=s.s0+Math.max(0.05,Math.min(len-w-0.05,d.pos/100));
    const p0=s.v?[s.c,a0]:[a0,s.c], p1=s.v?[s.c,a0+w]:[a0+w,s.c], n=s.v?[1,0]:[0,1], q0=[p0[0]+n[0]*g,p0[1]+n[1]*g], q1=[p1[0]+n[0]*g,p1[1]+n[1]*g];
    const sa=localWallSeg(A,p0,p1), sb=localWallSeg(B,q0,q1); if(!sa||!sb) continue;
    out.push({A:s.a,B:s.b,wallA:sa.wall,wallB:sb.wall,b0:sb.b0,b1:sb.b1,injA:sa,f:{type:"door",y1:2.1},p0,p1,n,apt:true}); }
  return out;
}
function aptRecalc(){ layoutRel(); computeShared(); computeLinks(); APT_SVC=aptServices(); }
// ---------- apartment templates: a hall in the middle, rooms above and below with their doors (wall D) facing it ----------
const APT_TPLS=[
  {n:"استوديو",sub:"صالة ومطبخ وحمام",top:[["k","مطبخ"],["b_std","حمام"]],bot:[["r_living","صالة"]]},
  {n:"أوضة وصالة",sub:"نوم وصالة ومطبخ وحمام وبلكونة",balc:true,top:[["k","مطبخ"],["b_std","حمام"]],bot:[["r_living","صالة"],["r_master","أوضة نوم"]]},
  {n:"أوضتين وصالة",sub:"نوم رئيسية وأطفال وصالة ومطبخ وحمام وبلكونة",balc:true,top:[["k","مطبخ"],["b_std","حمام"],["r_kids","أوضة أطفال"]],bot:[["r_living","صالة"],["r_master","أوضة نوم رئيسية"]]},
  {n:"3 أوض وصالة",sub:"3 نوم وصالة ومطبخ وحمامين وبلكونة",balc:true,top:[["k","مطبخ"],["b_std","حمام"],["r_kids","أوضة أطفال"],["b_std","حمام ضيوف"]],bot:[["r_living","صالة"],["r_master","أوضة نوم رئيسية"],["r_kids","أوضة نوم 3"]]}];
// a window that becomes the balcony door: slide the door off big furniture, then move loose pieces (armchairs, side tables) out of its way
function clearDoorway(c,dr){ const W=c.roomW-6, big=[], loose=["arm","side","plant","lamp","coffee"], zone=p=>[p,p+dr.w,0,62]; /* the apartment check looks 55 cm in front of a door */
  const rect=it=>{ const w=it.w,d=it.d,o=it.off||0,p=it.pos||0; if(it.snap==="W") return [p,p+w,o,o+d]; if(it.snap==="D") return [p,p+w,c.roomL-6-o-d,c.roomL-6-o]; if(it.snap==="L") return [o,o+d,p,p+w]; if(it.snap==="RT") return [W-o-d,W-o,p,p+w];
    const r=((it.rot||0)%180)?[d,w]:[w,d]; return [it.x-r[0]/2,it.x+r[0]/2,it.z-r[1]/2,it.z+r[1]/2]; };
  const hit=(r,q)=>Math.min(r[1],q[1])-Math.max(r[0],q[0])>1&&Math.min(r[3],q[3])-Math.max(r[2],q[2])>1, solid=it=>FURN[it.type]&&!FURN[it.type].wall&&it.type!=="rug";
  for(const it of c.furn||[]) if(it.type==="rug"||(solid(it)&&(it.snap||!loose.includes(it.type)))) big.push(rect(it));
  const c0=dr.pos, ps=[c0]; for(let k=10;k<W;k+=10) ps.push(c0+k,c0-k); dr.pos=ps.find(p=>p>=10&&p+dr.w<=W-4&&!big.some(r=>hit(r,zone(p))))??c0;
  const z=zone(dr.pos); for(const it of [...(c.furn||[])]){ if(!solid(it)||it.snap||!loose.includes(it.type)) continue; const r=rect(it); if(!hit(r,z)) continue;
    const hw=(r[1]-r[0])/2, oth=c.furn.filter(o=>o!==it&&solid(o)).map(rect), xs=[]; for(let x=hw+5;x<=W-hw-5;x+=5) xs.push(x); xs.sort((a,b)=>Math.abs(a-it.x)-Math.abs(b-it.x));
    const nx=xs.find(x=>{ const q=[x-hw,x+hw,r[2],r[3]]; return !hit(q,z)&&!oth.some(o=>hit(o,q)); }); if(nx!=null) it.x=nx; else c.furn=c.furn.filter(o=>o!==it); } }
async function applyAptTpl(T){
  if(APT.rooms.length>1&&!confirm("ترتيب الشقة الحالي هيتشال ويتعمل ترتيب جديد من القالب. الأوض القديمة هتفضل محفوظة في مشاريعك. نكمّل؟")) return;
  await saveNow(); document.getElementById("aptBody").innerHTML="<div class='note'>بجهّز الشقة…</div>";
  let reuse=!T.fresh&&!aptOtherRooms().has(PROJ.id); const kindOf=key=>key==="k"?"kitchen":BTEMPLATES[key]?"bath":"room";
  const mk=async(key,nm,c)=>{ // the room open now takes the first slot of its kind
    if(reuse&&!c&&cfg.template!=="r_balcony"&&cfg.roomType===kindOf(key)&&(key==="k"||cfg.roomType==="bath"||(RTEMPLATES[key]&&RTEMPLATES[key].rtype===cfg.rtype))){ reuse=false; return PROJ.id; }
    const id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); await stSet("kproj:"+id,{name:nm,cfg:c||newCfg(key==="k"?"L":key)}); projIndex.push({id,name:nm,t:Date.now()}); return id; };
  const hc=newCfg("h_hall"); hc.roomW=600; hc.roomL=140; hc.feats=[{id:"en",type:"door",wall:"RT",pos:25,w:90,y:0,h:210,d:0}];
  const hall=await mk("h_hall","طرقة",hc), tops=[], bots=[];
  for(const [k,nm] of T.top) tops.push({id:await mk(k,nm),x:0,z:0,rot:0,rel:{to:hall,side:"top",off:0}});
  const lk=(T.bot[0]||["r_living"])[0], lc=newCfg(lk), ww=lc.feats.find(f=>f.id==="win"); if(T.balc&&ww){ Object.assign(ww,{type:"door",wall:"W",w:120,pos:Math.round((lc.roomW-120)/2),y:0,h:220,d:0}); clearDoorway(lc,ww); }
  for(const [i,[k,nm]] of T.bot.entries()) bots.push({id:await mk(k,nm,T.balc&&i===0?lc:null),x:0,z:0,rot:180,rel:{to:hall,side:"bottom",off:0}});
  const extra=[]; if(T.balc){ const bc=newCfg("r_balcony"); bc.roomW=lc.roomW; applyTemplate(bc,"r_balcony",true); bc.feats=bc.feats.filter(f=>f.type!=="door"); /* its door is the living room's */ for(const f of bc.furn) if(!f.snap&&["arm","side"].includes(f.type)) f.z=Math.round(f.d/2)+8; /* seats by the railing, clear of the door */
    extra.push({id:await mk("r_balcony","بلكونة",bc),x:0,z:0,rot:180,rel:{to:bots[0].id,side:"bottom",off:0}}); }
  await stSet("kproj:index",projIndex);
  APT.rooms=[{id:hall,x:0,z:0,rot:0,rel:null},...tops,...bots,...extra]; APT.doors=[]; for(const k of ["riser","riser2","water","panel","heaterAt"]) APT[k]=null;
  try{ await refreshSnaps();
    const row=rs=>{ let x=0; for(const r of rs){ r.rel.off=x; x+=Math.round(aptSize(SNAP[r.id],r.rot)[0]*100)+APT.wallT; } return x-APT.wallT; };
    const need=Math.max(row(tops),row(bots)), d=await stGet("kproj:"+hall); d.cfg.roomW+=need-Math.round(SNAP[hall].RW*100); await stSet("kproj:"+hall,d); // hall as long as the longer row
    await refreshSnaps(); }
  catch(e){ hint("مقدرتش أقرا الأوض من الحفظ، جرّب تاني",4000); }
  aptRecalc(); aptSel=null; aptTab="المسقط"; await saveApt(); renderApt(); hint("✓ الشقة جاهزة. دوس على أي أوضة في المسقط عشان تعدّلها",4500);
}
let aptTplOpen=false;
function arrangeUI(box){
  const rs=APT.rooms.filter(r=>SNAP[r.id]); if(aptSel&&!rs.some(r=>r.id===aptSel)) aptSel=null;
  const head=t=>{ const h=document.createElement("div"); h.className="head"; h.textContent=t; box.appendChild(h); }, note=t=>{ const n=document.createElement("div"); n.className="note"; n.textContent=t; box.appendChild(n); return n; };
  const nm=document.createElement("input"); nm.className="txt"; nm.value=aptNameOf(APT); nm.setAttribute("aria-label","اسم الشقة"); nm.placeholder="اسم الشقة";
  nm.onchange=async()=>{ const v=cleanName(nm.value); if(!v){ nm.value=aptNameOf(APT); return; } APT.name=v; aptTitle(); await saveApt(); }; fieldRow(box,"اسم الشقة",nm);
  const tplGrid=()=>{ const g=document.createElement("div"); g.className="tplgrid"; for(const T of APT_TPLS){ const b=document.createElement("button"); b.className="btn tpl"; b.innerHTML=`<b>${T.n}</b><small style="color:var(--muted)">${T.sub}</small>`; b.onclick=()=>applyAptTpl(T); g.appendChild(b); } box.appendChild(g); };
  fieldRow(box,"المقاسات",choice([["net","صافي بعد التشطيب"],["brick","على الطوب"]],APT.dimMode==="brick"?"brick":"net",async v=>{ APT.dimMode=v; await saveApt(); renderApt(); },"المقاسات"));
  if(rs.length<=1){ head("🏢 ابدأ بقالب شقة"); note("اختار شكل قريب من شقتك: طرقة في النص والأوض حواليها بأبوابها. بعد كده عدّل مقاس كل أوضة ومكانها."); tplGrid(); head("أو ابني الشقة أوضة أوضة"); }
  else { note("دوس على أوضة في المسقط عشان تعدّلها، أو اسحبها بصباعك. الخط الأخضر المتقطع = حيطة مشتركة ممكن تحط فيها باب، والبرتقاني = باب لبرة.");
    const ch=document.createElement("div"); ch.className="chips"; for(const r of rs){ const sn=SNAP[r.id], b=document.createElement("button"); b.className="chipbtn"+(aptSel===r.id?" on":""); b.textContent=roomIco(sn)+" "+sn.name; b.onclick=()=>{ aptSel=aptSel===r.id?null:r.id; renderApt(); }; ch.appendChild(b); } box.appendChild(ch); }
  const ar=document.createElement("div"); ar.className="addrow"; const ps=document.createElement("select");
  const oth=aptOtherRooms(), free=projIndex.filter(p=>!APT.rooms.some(r=>r.id===p.id)&&!oth.has(p.id)); if(!projIndex.some(p=>p.id===PROJ.id)&&!APT.rooms.some(r=>r.id===PROJ.id)) free.push({id:PROJ.id,name:PROJ.name});
  ps.innerHTML=free.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")+`<option value="__hall">🚪 طرقة جديدة</option><option value="__bath">🚿 حمام جديد</option><option value="__living">🛋 صالة جديدة</option><option value="__master">🛏 أوضة نوم جديدة</option><option value="__kids">🧸 أوضة أطفال جديدة</option><option value="__balc">🌿 بلكونة جديدة</option>`;
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕ ضيف";
  ab.onclick=async()=>{ let id=ps.value; if(id.startsWith("__")){ const MAPK={__hall:["h_hall","طرقة"],__bath:["b_std","حمام"],__living:["r_living","صالة"],__master:["r_master","أوضة نوم"],__kids:["r_kids","أوضة أطفال"],__balc:["r_balcony","بلكونة"]}[id]; const key=MAPK[0], nm=MAPK[1]+(APT.rooms.length?" "+(APT.rooms.length+1):""); id="p"+Date.now().toString(36); await stSet("kproj:"+id,{name:nm,cfg:newCfg(key)}); projIndex.push({id,name:nm,t:Date.now()}); await stSet("kproj:index",projIndex); }
    const last=APT.rooms[APT.rooms.length-1]; APT.rooms.push({id,x:0,z:0,rot:0,rel:last?{to:last.id,side:"right",off:0}:null}); aptSel=id; try{ await refreshSnaps(); }catch(e){ hint("مقدرتش أقرا الأوض من الحفظ، جرّب تاني",4000); return; } aptRecalc(); await saveApt(); renderApt(); hint("اتضافت ✓ حدد مكانها في الخطوة 2"); };
  ar.append(ps,ab); if(rs.length<=1) box.appendChild(ar);
  // the selected room: where it sits, rotate, design, remove
  rs.forEach((r,i)=>{ if(r.id!==aptSel) return; const sn=SNAP[r.id]; const card=document.createElement("div"); card.className="card"+(aptSel===r.id?" sel":"");
    card.innerHTML=`<div class="ch"><b>${roomIco(sn)} ${esc(sn.name)}</b><small style="color:#66716C">${aptAreaM(sn).toFixed(1)} م² ${aptDimWord()}</small></div>`;
    card.onclick=e=>{ if(e.target.closest("select,input,button")) return; aptSel=r.id; renderApt(); };
    { const [dw,dl]=aptDims(sn), e=aptFin(sn), ff=2*((+sn.cfg.plaster||0)+(+sn.cfg.tileT||0)); for(const [ax,lab] of [["x","العرض ↔"],["z","الطول ↕"]]){ const d=(ax==="x")===(r.rot%180===0)?dw:dl;
        aRange(card,`${lab} (${aptDimWord()})`,50,800,d,"سم",v=>aptResize(r,ax,v-e,false)); }
      const n=document.createElement("div"); n.className="note"; n.textContent=(aptBrick()?`الصافي بعد التشطيب ${dw-e}×${dl-e} سم`:`على الطوب ${dw+ff}×${dl+ff} سم`)+` (المحارة والسيراميك ${ff/2} سم من كل حيطة). تقدر كمان تشد الدواير البرتقاني على المسقط.`; card.appendChild(n); }
    if(i===0){ const n=document.createElement("div"); n.className="note"; n.textContent="📍 دي الأوضة الأساس، الباقي بيترص حواليها."; card.appendChild(n); }
    else { const others=rs.filter(x=>x!==r).map(x=>[x.id,SNAP[x.id].name]); const rel=r.rel||{to:rs[0].id,side:"right",off:0};
      const upd=async()=>{ r.rel=rel; aptRecalc(); await saveApt(); renderApt(); };
      aSel(card,"جنب",others,rel.to,v=>{ rel.to=v; rel.off=0; upd(); });
      aSel(card,"ناحية",SIDES,rel.side,v=>{ rel.side=v; rel.off=0; upd(); });
      const t=APT.rooms.find(x=>x.id===rel.to); if(t&&SNAP[t.id]){ const R=roomRectW(t), vert=rel.side==="right"||rel.side==="left", L=Math.round((vert?R.z1-R.z0:R.x1-R.x0)*100), [w,h]=aptSize(sn,r.rot);
        aRange(card,"زحلقها",-Math.round((vert?h:w)*100)+40,L-40,rel.off||0,"سم",v=>{ rel.off=v; upd(); }); }
      if(!r.rel){ const n=document.createElement("div"); n.className="note"; n.textContent="اتحركت بالسحب. اختار «جنب» عشان ترجع تترص أوتوماتيك."; card.appendChild(n); } }
    const act=document.createElement("div"); act.className="act";
    const mk=(t,fn)=>{ const b=document.createElement("button"); b.className="btn"; b.textContent=t; b.onclick=fn; act.appendChild(b); };
    mk("↻ لف",async()=>{ r.rot=(r.rot+90)%360; aptRecalc(); await saveApt(); renderApt(); });
    mk("✏️ اسم",()=>{ const inp=document.createElement("input"); inp.value=sn.name; inp.className="txt"; inp.setAttribute("aria-label","اسم الأوضة"); const ok=document.createElement("button"); ok.className="btn main"; ok.textContent="حفظ";
      act.innerHTML=""; act.append(inp,ok); inp.focus(); inp.select(); inp.onkeydown=e=>{ if(e.key==="Enter") ok.click(); }; ok.onclick=async()=>{ const nm=cleanName(inp.value); if(nm&&nm!==sn.name) await aptEditRoom(r.id,d=>{ d.name=nm; }); await saveApt(); renderApt(); }; });
    mk("📄 نسخة",async()=>{ const rd=r.id===PROJ.id?{v:{name:PROJ.name,cfg:clone(cfg)}}:await stRead("kproj:"+r.id); if(rd.err||!rd.v){ hint("مقدرتش أقرا الأوضة من الحفظ، جرّب تاني",4000); return; }
      const id="p"+Date.now().toString(36), nm=cleanName(rd.v.name+" 2"); await stSet("kproj:"+id,{name:nm,cfg:rd.v.cfg}); projIndex.push({id,name:nm,t:Date.now()}); await stSet("kproj:index",projIndex);
      APT.rooms.push({id,x:0,z:0,rot:r.rot,rel:{to:r.id,side:"right",off:0}}); aptSel=id; try{ await refreshSnaps(); }catch(e){ hint("مقدرتش أقرا الأوض من الحفظ، جرّب تاني",4000); return; } aptRecalc(); await saveApt(); renderApt(); hint("✓ اتعملت نسخة جنبها، حطها في مكانها",3500); });
    mk("✏️ صمّمها",async()=>{ closeApt(); if(r.id!==PROJ.id) await openProject(r.id); setPanel(true); tab=cfg.roomType==="bath"?"الحمام":cfg.roomType==="room"?"الأثاث":"الأوضة"; renderTabs(); renderControls(); });
    mk("✕ شيل",async()=>{ APT.rooms=APT.rooms.filter(x=>x!==r); for(const o of APT.rooms) if(o.rel&&o.rel.to===r.id) o.rel={to:APT.rooms[0]?APT.rooms[0].id:null,side:"right",off:0}; aptSel=null; aptRecalc(); await saveApt(); renderApt(); });
    card.appendChild(act); box.appendChild(card); });
  // doors between the selected room and the rooms touching it
  const pairs=[]; if(aptSel) for(const s of SHARED) if((s.a===aptSel||s.b===aptSel)&&!pairs.some(p=>p.a===s.b&&p.b===s.a)) pairs.push(s);
  if(aptSel&&rs.length>1){ head("🚪 الأبواب بينها وبين اللي جنبها"); if(!pairs.length) note("مفيش أوضة لازقة فيها. حطها جنب أوضة تانية الأول."); }
  APT.doors=APT.doors||[];
  for(const s of pairs){ const na=SNAP[s.a].name, nb=SNAP[s.b].name, len=Math.round((s.s1-s.s0)*100);
    const card=document.createElement("div"); card.className="card"; card.innerHTML=`<div class="ch"><b>${esc(na)} ↔ ${esc(nb)}</b><small style="color:#66716C">حيطة مشتركة ${len} سم</small></div>`;
    const fromDesign=APTLINKS.some(L=>!L.apt&&L.B&&((L.A===s.a&&L.B===s.b)||(L.A===s.b&&L.B===s.a)));
    const d=APT.doors.find(x=>(x.a===s.a&&x.b===s.b)||(x.a===s.b&&x.b===s.a));
    if(fromDesign){ const n=document.createElement("div"); n.className="note"; n.style.color="#2e7d4f"; n.textContent="✓ فيه باب بينهم من تصميم الأوضة نفسها"; card.appendChild(n); }
    const tg=aSel(card,"باب بينهم؟",[["","لأ"],["1","أيوه"]],d?"1":"",async v=>{ if(v){ APT.doors.push({a:s.a,b:s.b,pos:Math.max(0,Math.round(len/2-40)),w:80}); } else APT.doors=APT.doors.filter(x=>x!==d); aptRecalc(); await saveApt(); renderApt(); });
    if(d){ const ds=SHARED.find(x=>x.a===d.a&&x.b===d.b); const L2=Math.round((ds.s1-ds.s0)*100);
      aRange(card,"مكانه على الحيطة",0,Math.max(1,L2-d.w-10),d.pos,"سم",async v=>{ d.pos=v; aptRecalc(); await saveApt(); renderApt(); });
      aRange(card,"عرضه",60,Math.min(150,L2-10),d.w,"سم",async v=>{ d.w=v; aptRecalc(); await saveApt(); renderApt(); }); }
    box.appendChild(card); }
  if(rs.length>1){ head("➕ ضيف أوضة"); box.appendChild(ar);
    const tb=document.createElement("button"); tb.className="btn"; tb.style.width="100%"; tb.textContent=aptTplOpen?"✕ اقفل القوالب":"🏢 ابدأ من جديد بقالب شقة"; tb.onclick=()=>{ aptTplOpen=!aptTplOpen; renderApt(); }; box.appendChild(tb); if(aptTplOpen) tplGrid();
    head("📐 المساحة"); const net=rs.reduce((a,r)=>a+aptArea(SNAP[r.id]),0), brk=rs.reduce((a,r)=>{ const sn=SNAP[r.id], e=2*((+sn.cfg.plaster||0)+(+sn.cfg.tileT||0))/100; return a+aptArea(sn)+(sn.RW+e)*(sn.RL+e)-sn.RW*sn.RL; },0), g=APT.wallT/100, gross=rs.reduce((a,r)=>{ const sn=SNAP[r.id]; return a+(sn.RW+g)*(sn.RL+g); },0);
    const sm=document.createElement("div"); sm.className="sum"; sm.innerHTML=`صافي الأرضيات: <b>${net.toFixed(1)} م²</b><br>على الطوب: <b>${brk.toFixed(1)} م²</b><br>بالحيطان اللي بين الأوض: حوالي <b>${gross.toFixed(0)} م²</b><br><small>${rs.map(r=>`${esc(SNAP[r.id].name)} ${aptAreaM(SNAP[r.id]).toFixed(1)}`).join(" • ")} (${aptDimWord()})</small>`; box.appendChild(sm);
    fieldRow(box,"مساحة العقد",numIn(APT.contract||0,0,2000,"م²",async v=>{ APT.contract=v; await saveApt(); renderApt(); },1,null,"مساحة العقد"));
    if(APT.contract>0) note(`الفرق بين العقد وصافي الأرضيات ${(APT.contract-net).toFixed(1)} م². ده عادةً الحيطان الخارجية ونصيب الشقة من السلم والمداخل والمناور.`);
    head("الحيطان"); }
  aRange(box,"سُمك الحيطان بين الأوض",8,30,APT.wallT,"سم",async v=>{ APT.wallT=v; aptRecalc(); await saveApt(); renderApt(); });
}

// ---------- apartment: drawings, schedules, shopping, budget ----------
let DRAW_DOC=false;
function scheduleRows(){ const rows=[]; const wn=w=>WNAME[w]||w;
  for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue;
    for(const f of sn.feats){ if(!["door","opening","window","railing"].includes(f.type)) continue; const L=APTLINKS.find(x=>x.A===r.id&&!x.apt&&x.f&&x.f.id===f.id);
      rows.push({room:sn.name,type:{door:"باب",opening:"فتحة",window:"شباك",railing:"سور بلكونة"}[f.type],wall:wn(f.wall),w:Math.round((f.a1-f.a0)*100),h:Math.round((f.type==="railing"?(f.h||110)/100:f.y1-f.y0)*100),sill:f.type==="window"?Math.round(f.y0*100):0,note:f.type==="window"||f.type==="railing"?"":(L&&L.B?"بيودّي لـ "+SNAP[L.B].name:"لبرة / مش متربط")}); } }
  for(const L of APTLINKS) if(L.apt) rows.push({room:SNAP[L.A].name+" ↔ "+SNAP[L.B].name,type:"باب (من الشقة)",wall:"حيطة مشتركة",w:Math.round((L.b1-L.b0)*100),h:210,sill:0,note:""});
  return rows; }
function scheduleHTML(){ const rows=scheduleRows(); return `<div class="tbl"><table style="min-width:0"><tr><th>#</th><th>الأوضة</th><th>النوع</th><th>الحيطة</th><th>العرض</th><th>الارتفاع</th><th>الجلسة</th><th>ملاحظة</th></tr>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r.room}</td><td>${r.type}</td><td>${r.wall}</td><td>${r.w}</td><td>${r.h}</td><td>${r.sill||"—"}</td><td>${r.note}</td></tr>`).join("")}</table></div>`; }
function shoppingHTML(){ const T=shoppingData(); return Object.entries(T).map(([tr,items])=>`<h4 style="margin:10px 0 4px">${tr}</h4><div class="tbl"><table style="min-width:0">${Object.entries(items).filter(([,v])=>v>0.05).map(([k,v])=>{ const [n,u]=k.split("|"); return `<tr><td>${n}</td><td>${u==="م"||u==="م²"||u==="م.ط"?v.toFixed(1):Math.ceil(v)} ${u}</td></tr>`; }).join("")}</table></div>`).join(""); }
const DISCLAIM="⚠ الأطوال والكميات والأحمال حسابات تخطيطية تقريبية، لازم المهندس أو الفني يراجعها قبل الشراء والتنفيذ.";
async function aptDoc(){
  const saved=cfg, sl=loadingP; loadingP=true; SLIDING=true; const sv=APT_SVC;
  let body=`<section id="apt-plan"><h3>مسقط الشقة</h3><div class="sub">${APT.rooms.length} أوض • سُمك الحيطان بينهم ${APT.wallT} سم</div><div class="planbox">${aptPlanSVG().replace('id="aptSvg"','')}</div></section>`; /* one #aptSvg only: the editable plan */
  body+=`<section id="apt-sched"><h3>جدول الأبواب والشبابيك</h3><div class="sub">المقاسات بالسنتيمتر (الصافي بعد التشطيب)</div>${scheduleHTML()}</section>`;
  if(sv) body+=`<section id="apt-svc"><h3>السباكة والكهربا والمناسيب</h3><div class="sub">${DISCLAIM}</div><div class="tbl"><table style="min-width:0"><tr><th>الأوضة</th><th>صرف</th><th>بارد</th><th>سخن</th><th>الردم</th><th>المنسوب</th></tr>${sv.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.drainL.toFixed(1)} م</td><td>${r.coldL.toFixed(1)} م</td><td>${r.hotL.toFixed(1)} م</td><td>${Math.round(r.fill)} سم</td><td>${r.level} سم</td></tr>`).join("")}</table></div><div class="sub" style="margin-top:6px">${sv.circuits} دايرة • الحمل حوالي ${(sv.demand/1000).toFixed(1)} ك.و (${sv.amps} أمبير) • قاطع رئيسي ${sv.main} أمبير</div>${sv.levels.length?`<ul style="font-size:13px">${sv.levels.map(l=>`<li>${l.na} ↔ ${l.nb}: ${l.adv}</li>`).join("")}</ul>`:""}</section>`;
  body+=`<section id="apt-shop"><h3>قايمة المشتريات</h3><div class="sub">${DISCLAIM}</div>${shoppingHTML()}</section>`;
  let nav=`<button data-go="apt-plan">المسقط</button><button data-go="apt-sched">الأبواب والشبابيك</button><button data-go="apt-svc">السباكة والكهربا</button><button data-go="apt-shop">المشتريات</button>`;
  try{ APT.rooms.forEach((r,i)=>{ const sn=SNAP[r.id]; if(!sn) return; cfg=clone(sn.cfg); build(); const {h}=drawHTML(); body+=`<div class="rdoc" id="rdoc${i}" style="page-break-before:always"><h2 style="color:#2d5f7a;border-bottom:2px solid #2d5f7a;padding-bottom:4px">${esc(sn.name)}</h2>${h.replace(/id="sec-/g,`id="r${i}-sec-`)}</div>`; nav+=`<button data-go="rdoc${i}">${sn.name}</button>`; }); }
  finally{ cfg=saved; SLIDING=false; build(); loadingP=sl; }
  document.getElementById("apt").style.display="none"; DRAW_DOC=true; document.getElementById("draw").style.display="flex";
  const b=document.getElementById("dbody"), t=document.getElementById("dtabs"); b.innerHTML=body; t.innerHTML=nav; b.scrollTop=0;
  t.querySelectorAll("button").forEach(x=>x.onclick=()=>{ const e=document.getElementById(x.dataset.go); if(e) e.scrollIntoView({behavior:"smooth"}); });
  hint("🖨 دوس «طباعة / PDF» واختار «حفظ كـ PDF» عشان يطلعلك ملف واحد",5000);
}
function copyText(txt,done){ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>done(true)).catch(()=>{ const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); done(true); }catch(e){ done(false); } ta.remove(); }); }
function aptDrawingsUI(box){
  const n=document.createElement("div"); n.className="note"; n.textContent="ملف واحد فيه مسقط الشقة، وجدول الأبواب والشبابيك، والسباكة والكهربا، وقايمة المشتريات، ورسومات كل أوضة بالتفصيل."; box.appendChild(n);
  const b=document.createElement("button"); b.className="btn main"; b.style.cssText="width:100%;padding:11px"; b.textContent="📄 افتح ملف الشقة كامل (للطباعة / PDF)"; b.onclick=()=>aptDoc(); box.appendChild(b);
  const h=document.createElement("div"); h.className="head"; h.textContent="🚪 جدول الأبواب والشبابيك"; box.appendChild(h);
  const d=document.createElement("div"); d.innerHTML=scheduleHTML(); box.appendChild(d);
  const rows=scheduleRows(); const cnt={}; for(const r of rows){ const k=`${r.type} ${r.w}×${r.h}`; cnt[k]=(cnt[k]||0)+1; }
  const s=document.createElement("div"); s.className="sum"; s.innerHTML="<b>للطلب:</b><br>"+Object.entries(cnt).map(([k,v])=>`${k}: ${v}`).join("<br>"); box.appendChild(s);
}
function aptShopUI(box){
  const n=document.createElement("div"); n.className="note"; n.textContent=DISCLAIM; box.appendChild(n);
  const T=shoppingData(); const all=[];
  for(const [tr,items] of Object.entries(T)){ const txt=tradeText(tr,items); all.push(txt);
    const c=document.createElement("div"); c.className="card"; c.innerHTML=`<div class="ch"><b>${tr}</b></div>`+`<div class="tbl"><table style="min-width:0">${Object.entries(items).filter(([,v])=>v>0.05).map(([k,v])=>{ const [nn,u]=k.split("|"); return `<tr><td>${nn}</td><td>${u==="م"||u==="م²"||u==="م.ط"?v.toFixed(1):Math.ceil(v)} ${u}</td></tr>`; }).join("")}</table></div>`;
    const cb=document.createElement("button"); cb.className="btn"; cb.textContent="📋 انسخ رسالة واتساب"; cb.onclick=()=>copyText(txt,ok=>hint(ok?"✓ اتنسخت، ابعتها لل"+tr:"مقدرتش أنسخ")); c.appendChild(cb); box.appendChild(c); }
  const ca=document.createElement("button"); ca.className="btn"; ca.style.width="100%"; ca.textContent="📋 انسخ القايمة كلها"; ca.onclick=()=>copyText(all.join("\n\n"),ok=>hint(ok?"✓ اتنسخت":"مقدرتش أنسخ")); box.appendChild(ca);
  // budget
  const h=document.createElement("div"); h.className="head"; h.textContent="💰 الميزانية والدفعات"; box.appendChild(h);
  APT.budget=APT.budget&&APT.budget.length?APT.budget:BUDGET_DEF.map(n=>({n,est:0,paid:0}));
  const fill=document.createElement("button"); fill.className="btn"; fill.textContent="✨ املى التقديرات من التصميم (من الأسعار اللي كتبتها)";
  fill.onclick=async()=>{ const sum=k=>APT.rooms.reduce((x,r)=>x+((SNAP[r.id]&&SNAP[r.id].costs&&SNAP[r.id].costs[k])||0),0); const set=(n,v)=>{ const l=APT.budget.find(x=>x.n===n); if(l&&v>0) l.est=Math.round(v); };
    set("نجارة المطبخ",sum("kitchen")); set("سيراميك وبورسلين",sum("tile")); set("عزل",sum("wp")); set("دهانات",sum("paint")); { const g=APT.rooms.reduce((x,r)=>x+((SNAP[r.id]&&SNAP[r.id].gb&&SNAP[r.id].gb.cost)||0),0); set("جبس",g); } await saveApt(); renderApt(); hint("✓ اتملت البنود اللي ليها أسعار في التصميم"); };
  box.appendChild(fill);
  const tb=document.createElement("div"); tb.className="tbl"; let te=0,tp=0;
  const tbl=document.createElement("table"); tbl.style.minWidth="0"; tbl.innerHTML="<tr><th>البند</th><th>التقدير</th><th>المدفوع</th><th>الباقي</th><th></th></tr>";
  APT.budget.forEach((l,i)=>{ te+=+l.est||0; tp+=+l.paid||0; const tr=document.createElement("tr");
    const nm=document.createElement("input"); nm.value=l.n; nm.style.cssText="width:100%;font:inherit;font-size:12px;border:1px solid #dde;border-radius:6px;padding:3px"; nm.onchange=async()=>{ l.n=nm.value; await saveApt(); };
    const e=document.createElement("input"); e.type="number"; e.className="num"; e.style.width="70px"; e.value=l.est||""; e.onchange=async()=>{ l.est=+e.value||0; await saveApt(); renderApt(); };
    const pd=document.createElement("input"); pd.type="number"; pd.className="num"; pd.style.width="70px"; pd.value=l.paid||""; pd.onchange=async()=>{ l.paid=+pd.value||0; await saveApt(); renderApt(); };
    const x=document.createElement("button"); x.className="btn"; x.textContent="✕"; x.onclick=async()=>{ APT.budget.splice(i,1); await saveApt(); renderApt(); };
    const td=el=>{ const c=document.createElement("td"); if(typeof el==="string") c.textContent=el; else c.appendChild(el); return c; };
    tr.append(td(nm),td(e),td(pd),td(((+l.est||0)-(+l.paid||0)).toLocaleString("ar-EG")),td(x)); tbl.appendChild(tr); });
  const tt=document.createElement("tr"); tt.style.cssText="font-weight:bold;background:#f1f4f6"; tt.innerHTML=`<td>الإجمالي</td><td>${te.toLocaleString("ar-EG")}</td><td>${tp.toLocaleString("ar-EG")}</td><td>${(te-tp).toLocaleString("ar-EG")}</td><td></td>`; tbl.appendChild(tt);
  tb.appendChild(tbl); box.appendChild(tb);
  const ad=document.createElement("button"); ad.className="btn"; ad.textContent="➕ بند"; ad.onclick=async()=>{ APT.budget.push({n:"بند جديد",est:0,paid:0}); await saveApt(); renderApt(); }; box.appendChild(ad);
  if(te>0){ const pr=document.createElement("div"); pr.className="sum"; pr.innerHTML=`دفعت <b>${Math.round(tp/te*100)}%</b> من الميزانية`; box.appendChild(pr); }
}

// ---------- phase 3: whole apartment in 3D ----------
function aptFree(X,Z,m){ const wm=m==null?0.15:m, um=m==null?0.12:m; /* m=0: the bare floor plan (walk-mode map), no body margins */
  for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const [x,z]=toLocal(r,sn,X,Z);
    if(x>wm&&x<sn.RW-wm&&z>wm&&z<sn.RL-wm){ for(const u of sn.units) if(x>u.x0-um&&x<u.x1+um&&z>u.z0-um&&z<u.z1+um) return false; return true; } }
  const g=APT.wallT/100; for(const L of APTLINKS){ if(!L.B) continue; const xs=[L.p0[0],L.p1[0],L.p0[0]+L.n[0]*(g+0.2),L.p1[0]-L.n[0]*0.2], zs=[L.p0[1],L.p1[1],L.p0[1]+L.n[1]*(g+0.2),L.p1[1]-L.n[1]*0.2];
    const alongX=Math.abs(L.p1[0]-L.p0[0])>Math.abs(L.p1[1]-L.p0[1]); let x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs); if(alongX){ x0+=0.08; x1-=0.08; } else { z0+=0.08; z1-=0.08; }
    if(X>x0&&X<x1&&Z>z0&&Z<z1) return true; }
  return false;
}
let aptSaved=null, aptBox=null;
function enterApt3D(walk){
  closeApt(); aptSaved=cfg; const sl=loadingP; loadingP=true; SLIDING=true;
  root.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material){ if(o.material.map)o.material.map.dispose(); o.material.dispose(); } }); scene.remove(root); root=new THREE.Group(); scene.add(root);
  APT_BUILD=true; aptRoots=[]; let X0=1e9,Z0=1e9,X1=-1e9,Z1=-1e9;
  try{ for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const c=clone(sn.cfg); c.ceiling="none"; c.gbType="hide"; c.labels=false; c.showPts=false; c.walls="solid"; c.openDoors=false; c.showTri=false; c.openCab=false;
    APTLINKS.forEach((L,i)=>{ if(L.injA&&L.A===r.id) c.feats=[...(c.feats||[]),{id:"la"+i,type:"opening",wall:L.injA.wall,pos:Math.round(L.injA.b0*100),w:Math.round((L.injA.b1-L.injA.b0)*100),y:0,h:210,d:0,net:true}];
      if(L.B===r.id) c.feats=[...(c.feats||[]),{id:"lk"+i,type:"opening",wall:L.wallB,pos:Math.round(L.b0*100),w:Math.round((L.b1-L.b0)*100),y:0,h:L.f.type==="door"?Math.round((L.f.y1||2.1)*100):210,d:0,net:true}]; });
    cfg=c; build(); const phi=r.rot===90?-Math.PI/2:r.rot===180?Math.PI:r.rot===270?Math.PI/2:0, off=r.rot===90?[sn.RL,0]:r.rot===180?[sn.RW,sn.RL]:r.rot===270?[0,sn.RW]:[0,0];
    root.rotation.y=phi; root.position.set(r.x/100+off[0],0,r.z/100+off[1]); scene.remove(root); aptRoots.push(root); scene.add(root); root=new THREE.Group(); scene.add(root);
    const R=roomRectW(r); X0=Math.min(X0,R.x0);Z0=Math.min(Z0,R.z0);X1=Math.max(X1,R.x1);Z1=Math.max(Z1,R.z1); } }
  catch(e){ console.error(e); for(const g of aptRoots){ g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material){ if(o.material.map)o.material.map.dispose(); o.material.dispose(); } }); scene.remove(g); } aptRoots=[]; // back to the normal room view, autosave working again
    APT_BUILD=false; SLIDING=false; loadingP=sl; cfg=aptSaved||cfg; aptSaved=null; build(); hint("حصلت مشكلة في عرض الشقة 3D، رجعتك للتصميم",4000); return; }
  // floor under the walls between rooms
  const fl=new THREE.Mesh(new THREE.BoxGeometry(X1-X0+0.4,0.02,Z1-Z0+0.4),M("#d8d4cc")); fl.position.set((X0+X1)/2,-0.02,(Z0+Z1)/2); root.add(fl);
  APT_BUILD=false; SLIDING=false; loadingP=sl; APT3D=true; aptBox={X0,Z0,X1,Z1}; bulb.position.set((X0+X1)/2,2.6,(Z0+Z1)/2); bulb.intensity=0.6; fitSun((X0+X1)/2,(Z0+Z1)/2,Math.hypot(X1-X0,Z1-Z0)/2+0.8);
  document.body.classList.add("apt3d"); if(panelOpen) setPanel(false);
  document.querySelector(".top").style.display="none"; document.getElementById("stats").style.display="none"; document.getElementById("open").style.display="none"; document.getElementById("aptBar").style.display="flex";
  aptView(walk);
}
function aptView(walk){
  if(walk){ FP.on=true; let st=null; const hall=APT.rooms.find(r=>SNAP[r.id]&&SNAP[r.id].roomType==="hall")||APT.rooms.find(r=>SNAP[r.id]);
    if(hall){ const R=roomRectW(hall), cx=(R.x0+R.x1)/2, cz=(R.z0+R.z1)/2; let bd=1e9; for(let i=1;i<10;i++) for(let j=1;j<10;j++){ const x=R.x0+(R.x1-R.x0)*i/10, z=R.z0+(R.z1-R.z0)*j/10; const dd=Math.hypot(x-cx,z-cz); if(aptFree(x,z)&&dd<bd){ bd=dd; st=[x,z]; } } }
    st=st||[(aptBox.X0+aptBox.X1)/2,(aptBox.Z0+aptBox.Z1)/2]; FP.x=st[0]; FP.z=st[1]; { const R=hall?roomRectW(hall):{x0:0,x1:1,z0:0,z1:2}; FP.yaw=(R.x1-R.x0)>(R.z1-R.z0)?Math.PI/2:0; } FP.pitch=-0.1; document.getElementById("pad").style.display="grid";
    hint("🚶 دوس على الأرض تروح هناك • 📍 تنقلك لأي أوضة • عدّي من الأبواب بين الأوض",5000); }
  else { FP.on=false; document.getElementById("pad").style.display="none"; const b=aptBox; target.set((b.X0+b.X1)/2,0,(b.Z0+b.Z1)/2); const vf=camera.fov*Math.PI/360, hf=Math.atan(Math.tan(vf)*camera.aspect);
    const half=Math.hypot(b.X1-b.X0,b.Z1-b.Z0)/2+0.6; /* the view is turned: on a narrow screen fit the diagonal across the width */
    sph={r:Math.max(((b.X1-b.X0)/2+0.8)/Math.tan(hf)*1.35,((b.Z1-b.Z0)/2+0.8)/Math.tan(vf)*1.35,half/Math.tan(hf)*0.8,5),theta:0.3,phi:0.62}; }
  document.getElementById("aptWalk").textContent=FP.on?"🧊 من فوق":"🚶 امشي";
}
function exitApt3D(){ for(const g of aptRoots){ g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material){ if(o.material.map)o.material.map.dispose(); o.material.dispose(); } }); scene.remove(g); } aptRoots=[];
  APT3D=false; FP.on=false; cfg=aptSaved||cfg; aptSaved=null; document.body.classList.remove("apt3d"); document.querySelector(".top").style.display=""; document.getElementById("stats").style.display=""; document.getElementById("open").style.display=""; document.getElementById("aptBar").style.display="none";
  build(); if(MQ.desk.matches&&!panelOpen){ setPanel(true); renderTabs(); renderControls(); } setView("out"); }
