// =================== BUILD ===================
let STATS={}, SLIDING=false;
const OPP={L:"RT",RT:"L",W:"D",D:"W"};
const spanOf=w=>w==="L"||w==="RT"?RW:RL;
const distFront=(w,front)=>w==="L"||w==="W"?front:(w==="RT"?RW-front:RL-front);
function oppDepth(w,a0,a1){ const o=OPP[w]; if(!o) return 0; let m=0; for(const u of UNITS) if(u.wall===o&&u.y0<1.0&&u.kind!=="app"&&Math.min(u.a1,a1)-Math.max(u.a0,a0)>0.01) m=Math.max(m,u.depth); return m; }
function build(){
  root.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material){ if(o.material.map)o.material.map.dispose(); o.material.dispose(); } });
  scene.remove(root); root=new THREE.Group(); scene.add(root);
  H=cfg.ceil/100; geo();
  TRI=null; BATH=null; BATH_DRAIN=null; ACC={lower:0,upper:0,tall:0,marble:0}; UNITS=[]; POINTS=[]; unitCount={}; DOORCHK=[]; KEY=null; OPT=null; curWall=null; curSide=null;
  cfg.units=cfg.units||{}; cfg.custom=cfg.custom||[]; cfg.apps=(cfg.apps||[]).filter(a=>APPS[a.type]); cfg.seq=cfg.seq||{};
  FEATS=(cfg.feats||[]).filter(f=>f.type!=="cut").map(netFeat); netCuts(); WALLS=makeWalls();
  mats(); room();
  const warn=[]; const R=cfg.roomType==="bath"?buildBath(warn):cfg.roomType==="hall"?buildHall(warn):cfg.roomType==="room"?buildRoom(warn):buildKitchen(warn);
  finishBuild(warn,R.walk,R.counter,cfg.uStart/100);
}
function buildKitchen(warn){
  const ch=CH(), US=cfg.uStart/100, uTop=cfg.upper==="ceiling"?H-0.01:Math.min(2.2,H-0.01), UD=cfg.uDepth/100;
  const wc=w=>cfg.wallCfg[w]||{type:"none",depth:60,up:false};
  const counterWalls=W4.filter(w=>wc(w).type==="counter");
  const nicheIds=FEATS.filter(f=>f.type==="niche"||f.type==="corridor").map(f=>"N:"+f.id);
  const PLC={...cfg.place}; const fallback=counterWalls[0]||null;
  const validFor=(t,v)=>v==="none"&&t==="w"||counterWalls.includes(v)||((t==="f"||t==="w")&&nicheIds.includes(v));
  for(const t of ["s","t","w","f","d"]){ if(!validFor(t,PLC[t])){ if(PLC[t]&&PLC[t]!=="none"&&fallback) warn.push(`${{s:"الحوض",t:"البوتاجاز",w:"الغسالة",f:"التلاجة",d:"غسالة الأطباق"}[t]} اتنقل لـ ${WNAME[fallback]} لأن مكانه مش متاح`); PLC[t]=fallback||"none"; } }
  if(!counterWalls.length) warn.push("مفيش ولا حيطة عليها رخامة، اختار نوع الحيطان من تاب التخزين");
  const apps=cfg.apps, appById=Object.fromEntries(apps.map(a=>[a.id,a]));
  const appOf=t=>appById[t.slice(2)];
  const isTallT=t=>!!t&&(t==="f"||(t.startsWith("x:")&&APPS[appOf(t).type].cls==="tall"));
  const topC=t=>!!t&&(t==="w"||t==="d"||(t.startsWith("x:")&&!isTallT(t)));
  const wOf=t=>t==="s"?Math.max(0.45,cfg.sinkW/100):t==="w"?(cfg.washerW+2*cfg.washerGap)/100:t==="t"?(cfg.stoveW+(cfg.stoveType==="built"?0:2*cfg.stoveGap))/100:t==="d"?(+cfg.dishW)/100:t==="f"?(cfg.fridgeW+2*cfg.fridgeGap)/100:(appOf(t).w+2)/100;
  const tn=t=>!t?"":t.startsWith("x:")?appOf(t).type:t;
  // keep-out rectangles in plan
  const keepLow=[], keepUp=[];
  for(const f of FEATS){
    if(f.type==="door"||f.type==="opening"){ keepLow.push(rectAO(f.wall,f.a0-0.03,f.a1+0.03,0,Math.max(0.05,f.dep))); keepUp.push(rectAO(f.wall,f.a0,f.a1,0,0.02)); }
    if(f.type==="column"||(f.type==="shaft"||f.type==="stack")){ const r=rectAO(f.wall,f.a0,f.a1,0,f.dep); keepLow.push(r); keepUp.push(r); }
    if(f.type==="niche"&&f.y0<ch+0.02) keepLow.push(rectAO(f.wall,f.a0,f.a1,0,0.03));
    if(f.type==="railing"){ keepLow.push(rectAO(f.wall,f.a0,f.a1,0,0.03)); keepUp.push(rectAO(f.wall,f.a0,f.a1,0,0.03)); }
    if(f.type==="window"&&f.y0<ch+0.02){ keepLow.push(rectAO(f.wall,f.a0,f.a1,0,0.03)); }
  }
  if(cfg.island.on){ const iw=cfg.island.w/100, idp=cfg.island.d/100, cx=RW/2, cz=cfg.island.pos/100; keepLow.push({x0:cx-idp/2,x1:cx+idp/2,z0:cz-iw/2,z1:cz+iw/2}); }
  for(const k of CUTS){ const r={x0:k.x0,x1:k.x1,z0:k.z0,z1:k.z1}; keepLow.push(r); keepUp.push(r); }
  const capUp=(w,a0,a1,y1)=>{ y1=Math.min(y1,H-gbWallDrop()-0.01); for(const b of FEATS) if(b.type==="beam"&&b.wall===w&&Math.min(b.a1,a1)-Math.max(b.a0,a0)>0.01) y1=Math.min(y1,b.y0-0.01); return y1; };
  let counterLen=0, stoveRange=null, stoveWall=null; const tallByWall={};
  const PRI=["L","W","RT","D"], order=[...PRI.filter(w=>counterWalls.includes(w)),...PRI.filter(w=>!counterWalls.includes(w))];
  // ================= lower runs =================
  for(const w of order){
    const c=wc(w); if(c.type==="none") continue;
    const dep=c.type==="counter"?0.62:c.type==="bar"?0.42:Math.max(0.2,c.depth/100);
    curSide=w; curWall=w; const fr=wallFrame(w), L=wlen(w);
    let blocks=bandBlocks(w,dep,keepLow);
    if(c.type==="pantry"||c.type==="shelves") for(const f of FEATS) if(f.wall===w&&(f.type==="window")) blocks.push([f.a0,f.a1]);
    for(const a of apps){ const T=APPS[a.type]; if(a.loc===w&&(T.cls==="slot"||T.cls==="tall")&&c.type!=="counter") blocks.push([a.pos/100-0.01,(a.pos+a.w)/100+0.01]); }
    for(const cu of cfg.custom){ if(cu.wall===w&&(cu.type==="lower"||cu.type==="tall")) blocks.push([cu.pos/100-0.005,(cu.pos+cu.w)/100+0.005]); }
    const segs=subtract([0,L],blocks);
    const before=UNITS.length;
    if(c.type==="counter"){
      const avail=[]; for(const t of ["s","t","w","f"]) if(PLC[t]===w) avail.push(t); if(cfg.dish&&PLC.d===w) avail.push("d");
      for(const a of apps){ const cl=APPS[a.type].cls; if(a.loc===w&&(cl==="slot"||cl==="tall")) avail.push("x:"+a.id); }
      let toks=(cfg.seq[w]||[]).filter(t=>avail.includes(t)); for(const t of ["f","s","d","w","t"]) if(avail.includes(t)&&!toks.includes(t)) toks.push(t); for(const t of avail) if(!toks.includes(t)) toks.push(t);
      if(!cfg.seq[w]||!cfg.seq[w].length){ const base=["s","d","w","t","f"]; toks.sort((p,q)=>(base.indexOf(p)<0?9:base.indexOf(p))-(base.indexOf(q)<0?9:base.indexOf(q))); }
      // sink fixed under a window?
      let fixedSink=null; const win=FEATS.find(f=>f.wall===w&&f.type==="window"&&f.y0>=ch-0.02);
      if(cfg.sinkUnderWin&&toks.includes("s")&&win){ const sw=wOf("s"), mid=(win.a0+win.a1)/2, sg=segs.find(([a,b])=>mid>a&&mid<b&&b-a>=sw);
        if(sg){ let s0=Math.max(sg[0],mid-sw/2); s0=Math.min(s0,sg[1]-sw); fixedSink=[s0,s0+sw]; toks=toks.filter(t=>t!=="s"); } }
      let parts=[]; for(const [a,b] of segs){ if(fixedSink&&fixedSink[0]>=a-1e-6&&fixedSink[1]<=b+1e-6){ if(fixedSink[0]-a>=0.02) parts.push([a,fixedSink[0]]); parts.push([fixedSink[0],fixedSink[1],"S"]); if(b-fixedSink[1]>=0.02) parts.push([fixedSink[1],b]); } else parts.push([a,b]); }
      { const cornerAt=st=>{ const Bw=(w==="L"||w==="RT")?(st?"W":"D"):(st?"L":"RT"); return counterWalls.includes(Bw)&&order.indexOf(Bw)>order.indexOf(w); }, cw=cfg.corner==="magic"?1.0:0.9;
        if(parts.length){ const p0=parts[0]; if(!p0[2]&&p0[0]<0.02&&cornerAt(true)&&p0[1]-p0[0]>=cw+0.3) parts.splice(0,1,[p0[0],p0[0]+cw,"C"],[p0[0]+cw,p0[1]]);
          const pl=parts[parts.length-1]; if(!pl[2]&&pl[1]>L-0.02&&cornerAt(false)&&pl[1]-pl[0]>=cw+0.3) parts.splice(parts.length-1,1,[pl[0],pl[1]-cw],[pl[1]-cw,pl[1],"C"]); } }
      const assign=parts.map(()=>[]); let k0=0; const missing=[];
      for(const t of toks){ const need=wOf(t); let ok=false; for(let k=k0;k<parts.length;k++){ if(parts[k][2]) continue; const used=assign[k].reduce((s,x)=>s+wOf(x),0); if(used+need<=parts[k][1]-parts[k][0]+1e-6){ assign[k].push(t); k0=k; ok=true; break; } } if(!ok) missing.push(t); }
      for(const t of missing) warn.push(`${t==="s"?"الحوض":t==="t"?"البوتاجاز":t==="w"?"الغسالة":t==="f"?"التلاجة":t==="d"?"غسالة الأطباق":APPS[appOf(t).type].n} مش لاقي مكان على ${WNAME[w]}`);
      parts.forEach(([a,b,fx],k)=>{
        if(fx==="C"){ KEY=w+"-corner"+(a<0.1?"0":"1"); base(fr.f,a,b,fr.back); counterLen+=b-a; return; }
        if(fx==="S"){ KEY=w+"-sink"; const u=sink(fr.f,a,b,fr.back); appLabel(`حوض ${cfg.sinkW}×${cfg.sinkD}`,fr.f,(a+b)/2,0.3,ch+0.35); return; }
        const its=assign[k], fixed=its.reduce((s,x)=>s+wOf(x),0), left=Math.max(0,b-a-fixed);
        const wts=[]; for(let i=0;i<=its.length;i++){ const p=its[i-1], q=its[i]; wts.push(!its.length?1:i===0?0.3:i===its.length?1:(topC(p)||topC(q))?0.25:1); }
        const sw=wts.reduce((x,y)=>x+y,0), gaps=wts.map(x=>left*x/sw);
        let z=a;
        const flex=(g,p,q)=>{ if(g>=0.12){ KEY=`${w}-b:${tn(p)||"^"+k}|${tn(q)||"$"+k}`; base(fr.f,z,z+g,fr.back); }
          else if(g>0.015){ const fu=newUnit("filler",fr.f,z,z+g,fr.back,0.6,0,ch,{front:"حشوة ثابتة"}); curUid=fu.id; const dr=dirOf(fr.f);
            place(fr.f,z,z+g,fr.back,fr.back+0.53*dr,0,0.1,MAT.plinth); place(fr.f,z,z+g,fr.back,fr.back+0.6*dr,0.1,ch-0.04,MAT.base); place(fr.f,z,z+g,fr.back,fr.back+0.62*dr,ch-0.04,ch,MAT.counter); ACC.marble+=g; curUid=null; }
          z+=g; };
        flex(gaps[0],null,its[0]);
        its.forEach((t,i)=>{ const ww=wOf(t), mid=z+ww/2, ly=ch+0.35; let u=null;
          if(t==="s"){ KEY=w+"-sink"; u=sink(fr.f,z,z+ww,fr.back); appLabel(`حوض ${cfg.sinkW}×${cfg.sinkD}`,fr.f,mid,0.3,ly); }
          if(t==="w"){ u=washer(fr.f,z,z+ww,fr.back); appLabel(`غسالة ${cfg.washerW}×${cfg.washerD}`,fr.f,mid,0.3,0.55); }
          if(t==="d") u=dish(fr.f,z,z+ww,fr.back);
          if(t==="t"){ u=stove(fr.f,z,z+ww,fr.back); stoveRange=[z,z+ww]; stoveWall=w; appLabel(`بوتاجاز ${cfg.stoveW}×${cfg.stoveD}`,fr.f,mid,0.3,ly+0.1);
            const sides=[gaps[i]+(topC(its[i-1])?0.6:0),gaps[i+1]+(topC(its[i+1])?0.6:0)]; if(Math.min(...sides)<0.3) warn.push("مساحة الرخامة جنب البوتاجاز قليلة"); }
          if(t==="f"){ const g=cfg.fridgeGap/100; u=fridge(fr.f,z+g,z+ww-g,fr.back); appLabel(`تلاجة ${cfg.fridgeW}×${cfg.fridgeD}`,fr.f,mid,0.35,cfg.fridgeH/100+0.15);
            (tallByWall[w]=tallByWall[w]||[]).push([z,z+ww]);
            const top=capUp(w,z,z+ww,H-0.01); if((cfg.upper==="ceiling"||cfg.nicheTop)&&top-cfg.fridgeH/100>0.3){ KEY=w+"-fTop"; tall(fr.f,z,z+ww,fr.back,0.6,cfg.fridgeH/100+0.08,top); } }
          if(t.startsWith("x:")){ const ap=appOf(t), tl=isTallT(t); u=appUnit(fr.f,z,z+ww,fr.back,ap,!tl); if(tl) (tallByWall[w]=tallByWall[w]||[]).push([z,z+ww]);
            appLabel(`${APPS[ap.type].n} ${ap.w}×${ap.d}`,fr.f,mid,0.3,(tl?Math.min(ap.h/100,H-0.1):ch)+0.25); }
          if(u) u.tok=t;
          z+=ww; flex(gaps[i+1],t,its[i+1]); });
        counterLen+=b-a;
      });
    } else if(c.type==="shallow"){ segs.forEach(([a,b],k)=>{ KEY=`${w}-b:${k}`; base(fr.f,a,b,fr.back,dep); counterLen+=b-a; }); }
    else if(c.type==="pantry"){ segs.forEach(([a,b],k)=>{ KEY=`${w}-p:${k}`; tall(fr.f,a,b,fr.back,dep,0,capUp(w,a,b,H-0.01)); (tallByWall[w]=tallByWall[w]||[]).push([a,b]); }); }
    else if(c.type==="shelves"){ const ys=[1.3,1.65,2.0,2.35].filter(y=>y<H-0.15); segs.forEach(([a,b])=>{ const u=newUnit("shelf",fr.f,a,b,fr.back,Math.min(dep,0.3),ys[0],ys[ys.length-1]+0.03,{front:`${ys.length} رفوف`}); curUid=u.id; for(const y of ys) place(fr.f,a,b,fr.back,fr.back+Math.min(dep,0.3)*dirOf(fr.f),y,y+0.03,MAT.wood); curUid=null; }); }
    else if(c.type==="bar"){ segs.forEach(([a,b])=>{ newUnit("bar",fr.f,a,b,fr.back,0.4,0,1.06,{front:"بار فطار"}); const dr=dirOf(fr.f);
      place(fr.f,a,b,fr.back,fr.back+0.4*dr,1.02,1.06,MAT.counter); ACC.marble+=b-a; place(fr.f,a+0.1,a+0.14,fr.back+0.02*dr,fr.back+0.06*dr,0,1.02,MAT.handle); place(fr.f,b-0.14,b-0.1,fr.back+0.02*dr,fr.back+0.06*dr,0,1.02,MAT.handle);
      const n=Math.max(1,Math.floor((b-a)/0.55)); for(let i=0;i<n;i++){ const s=a+(i+0.5)*(b-a)/n; cylAt(fr.f,s,fr.back+0.62*dr,0.72,0.17,0.05,MAT.wood); cylAt(fr.f,s,fr.back+0.62*dr,0.36,0.02,0.7,MAT.handle); } counterLen+=b-a; }); }
    for(let i=before;i<UNITS.length;i++){ const u=UNITS[i]; if(u.wall!==w) continue; if(u.y0<1.0) keepLow.push(rectAO(w,u.a0,u.a1,0,u.depth)); if(u.y1>US+0.1) keepUp.push(rectAO(w,u.a0,u.a1,0,u.depth)); }
    curSide=null; curWall=null;
  }
  // ================= corner units =================
  if(cfg.corner&&counterWalls.length>1){ const perp=(a,b)=>(a==="L"||a==="RT")!==(b==="L"||b==="RT");
    for(const A of order){ if(wc(A).type!=="counter") continue; for(const Bw of counterWalls){ if(Bw===A||!perp(A,Bw)) continue;
      const atStart=(A==="L"||A==="RT")?Bw==="W":Bw==="L", LA=wlen(A), LB=wlen(Bw), bStart=(Bw==="W"||Bw==="D")?A==="L":A==="W";
      const bu=UNITS.find(u=>u.wall===Bw&&u.y0<0.5&&(bStart?Math.abs(u.a0-0.62)<0.12:Math.abs(u.a1-(LB-0.62))<0.12)); if(!bu) continue;
      const any=UNITS.find(u=>u.wall===A&&u.y0<0.5&&!["shelf","base","sink","filler"].includes(u.kind)&&(atStart?u.a0<0.6:u.a1>LA-0.6));
      if(any){ warn.push(`في ركن ${WNAME[A]} مع ${WNAME[Bw]} فيه ${KN[any.kind]||"جهاز"}، هيبقى صعب يتفتح. الأحسن يبقى دولاب ركن، اسحب الجهاز لمكان تاني`); continue; }
      const cu=UNITS.find(u=>u.wall===A&&(u.kind==="base"||u.kind==="sink")&&u.y1<=ch+0.02&&(atStart?u.a0<0.05:u.a1>LA-0.05)); if(!cu||cu.corner) continue;
      cu.corner=cfg.corner; const fr=wallFrame(A), dr=dirOf(fr.f), front=fr.back+0.6*dr, b0=atStart?cu.a0:cu.a1-0.62, b1=atStart?cu.a0+0.62:cu.a1, wdt=cu.a1-cu.a0;
      curSide=A; curUid=cu.id; place(fr.f,b0,b1,front+0.021*dr,front+0.025*dr,0.11,ch-0.05,MAT.base); curUid=null; curSide=null;
      const nm={blind:"ركن مقفول",door:"باب ركن مكسور",carousel:"كاروسيل",magic:"ماجيك كورنر"}[cfg.corner]; cu.acc=cu.acc||""; cu.label=`دولاب ركن (${nm})`;
      const need=cfg.corner==="magic"?1.0:cfg.corner==="carousel"?0.9:cfg.corner==="door"?0.8:0; if(need&&wdt<need-0.01) warn.push(`دولاب الركن ${Math.round(wdt*100)} سم، ${nm} محتاج ${Math.round(need*100)} سم على الأقل`);
      if(cfg.corner==="blind") warn.push(`الركن بين ${WNAME[A]} و${WNAME[Bw]} ${Math.round(0.62*100)} سم مقفول (ركن ميت)، جرب كاروسيل أو ماجيك كورنر من تاب التخزين`); } } }
  // ================= hood =================
  if(stoveRange){ const [a,b]=stoveRange, m=(a+b)/2, fr=wallFrame(stoveWall); curSide=stoveWall; curWall=stoveWall; const dr=dirOf(fr.f), bk=fr.back;
    if(cfg.hood==="chimney"){ const hu=newUnit("hood",fr.f,a,b,bk,0.5,US+0.12,H,{front:"شفاط مدخنة"}); curUid=hu.id; place(fr.f,a,b,bk,bk+0.5*dr,US+0.12,US+0.22,MAT.steel); place(fr.f,m-0.14,m+0.14,bk,bk+0.25*dr,US+0.22,H,MAT.steel); curUid=null; }
    if(cfg.hood==="built"){ const hu=newUnit("hood",fr.f,a,b,bk,0.38,US+0.18,US+0.28,{front:"شفاط بلت إن"}); curUid=hu.id; place(fr.f,a+0.01,b-0.01,bk,bk+0.38*dr,US+0.18,US+0.28,MAT.steel); curUid=null; }
    curSide=null; curWall=null; }
  // ================= uppers =================
  for(const w of order){
    const c=wc(w); const up=c.up&&cfg.upper!=="none"&&(c.type==="counter"||c.type==="shallow"||c.type==="bar"||c.type==="none");
    const opens=FEATS.filter(f=>f.wall===w&&((f.type==="window"&&cfg.aboveWindow)||((f.type==="door"||f.type==="opening")&&cfg.aboveDoor)));
    if(!up && !opens.length) continue;
    curSide=w; curWall=w; const fr=wallFrame(w), L=wlen(w), ud=c.type==="shallow"?Math.min(UD,c.depth/100):UD;
    const blocks=bandBlocks(w,ud,keepUp).concat((tallByWall[w]||[]).map(([a,b])=>[a-0.005,b+0.005]));
    if(stoveRange&&stoveWall===w&&cfg.hood!=="none") blocks.push(cfg.hood==="chimney"?[stoveRange[0]-0.02,stoveRange[1]+0.02]:[stoveRange[0],stoveRange[1]]);
    for(const f of FEATS) if(f.wall===w&&f.type==="niche"&&f.y1>US) blocks.push([f.a0,f.a1]);
    for(const cu of cfg.custom) if(cu.wall===w&&cu.type!=="lower") blocks.push([cu.pos/100-0.005,(cu.pos+cu.w)/100+0.005]);
    for(const a of apps){ const T=APPS[a.type]; if(a.loc===w&&T.cls==="wall"&&a.y+a.h>cfg.uStart) blocks.push([a.pos/100,(a.pos+a.w)/100]); }
    const before=UNITS.length;
    subtract([0,L],blocks).forEach(([a,b],k)=>{
      const ow=FEATS.filter(f=>f.wall===w&&(f.type==="window"||f.type==="door"||f.type==="opening")&&f.y1>US-0.05&&f.a1>a&&f.a0<b).sort((p,q)=>p.a0-q.a0);
      let pieces=[], cur=a; for(const f of ow){ const s0=Math.max(a,f.a0), s1=Math.min(b,f.a1); if(s0>cur) pieces.push([cur,s0,null]); pieces.push([s0,s1,f]); cur=s1; } if(cur<b) pieces.push([cur,b,null]);
      const canHi=q=>q&&q[2]&&(((q[2].type==="window"&&cfg.aboveWindow)||(q[2].type!=="window"&&cfg.aboveDoor))&&capUp(w,q[0],q[1],H-0.01)-(q[2].y1+0.03)>=0.25);
      for(let i=0;i<pieces.length;i++){ const p=pieces[i]; if(!p[2] && p[1]-p[0]<0.3){ const nb=canHi(pieces[i-1])?pieces[i-1]:canHi(pieces[i+1])?pieces[i+1]:null; if(nb){ nb[0]=Math.min(nb[0],p[0]); nb[1]=Math.max(nb[1],p[1]); p.dead=true; } } }
      pieces.filter(p=>!p.dead).forEach((p,j)=>{
        const [s0,s1,f]=p, top=capUp(w,s0,s1,uTop);
        if(!f){ if(up){ KEY=`${w}-up:${k}.${j}`; uppers(fr.f,s0,s1,fr.back,US,top,ud); } }
        else { const okT=(f.type==="window"&&cfg.aboveWindow)||(f.type!=="window"&&cfg.aboveDoor); const y0=f.y1+0.03, t2=capUp(w,s0,s1,H-0.01);
          if(okT && t2-y0>=0.25){ KEY=`${w}-hi:${k}.${j}`; uppers(fr.f,s0,s1,fr.back,y0,t2,Math.min(ud,0.35)); } }
      });
    });
    if(stoveRange&&stoveWall===w&&cfg.hood==="built"&&up){ KEY=w+"-up:hood"; uppers(fr.f,stoveRange[0],stoveRange[1],fr.back,US+0.28,capUp(w,stoveRange[0],stoveRange[1],uTop),ud); }
    for(let i=before;i<UNITS.length;i++){ const u=UNITS[i]; if(u.wall===w) keepUp.push(rectAO(w,u.a0,u.a1,0,u.depth)); }
    curSide=null; curWall=null;
  }
  // ================= spice shelves on columns =================
  if(cfg.colShelves) for(const f of FEATS) if(f.type==="column"&&f.dep>=0.25&&f.a1-f.a0>=0.4){ const fr=wallFrame(f.wall); curSide=f.wall; curWall=f.wall;
    const u=newUnit("shelf",fr.f,f.a0+0.04,f.a1-0.04,fr.back,f.dep+0.14,1.25,Math.min(H-0.2,2.47),{front:"على وش البروز"}); curUid=u.id;
    for(let y=1.25;y<Math.min(H-0.2,2.5);y+=0.3) boxAO(f.wall,f.a0+0.04,f.a1-0.04,f.dep,f.dep+0.14,y,y+0.02,MAT.wood); curUid=null; curSide=null; curWall=null; }
  // ================= niches =================
  for(const nf of FEATS.filter(f=>f.type==="niche"||f.type==="corridor")){
    const id="N:"+nf.id, fr=nicheFrame(nf), mid=(fr.a0+fr.a1)/2; curSide=fr.host; curWall=id;
    const tok=PLC.f===id?"f":PLC.w===id?"w":null;
    if(tok&&!fr.floor) warn.push("التجويف مش على الأرض، مينفعش جهاز فيه");
    else if(tok==="f"){ const fw=Math.min(cfg.fridgeW/100,fr.width-0.02); fridge(fr.f,mid-fw/2,mid+fw/2,fr.back); appLabel(`تلاجة ${cfg.fridgeW}×${cfg.fridgeD}`,fr.f,mid,0.4,cfg.fridgeH/100+0.15);
      if(cfg.nicheTop&&H-cfg.fridgeH/100>0.3){ KEY=id+"-top"; tall(fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,Math.min(0.65,fr.depth),cfg.fridgeH/100+0.07,nf.type==="niche"?Math.min(H-0.01,nf.y1-0.01):H-0.01); }
      if((cfg.fridgeW+2*cfg.fridgeGap)/100>fr.width+0.005||(cfg.fridgeD+cfg.fridgeBack)/100>fr.depth+(nf.type==="niche"?0.25:0)) warn.push(`التلاجة بالمقاس ده مش هتدخل ${WALLS[id].name}`); }
    else if(tok==="w"){ const sl=(cfg.washerW+2*cfg.washerGap)/100; washer(fr.f,mid-sl/2,mid+sl/2,fr.back,false); place(fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,fr.back+Math.min(0.66,fr.depth)*dirOf(fr.f),0.86,0.9,MAT.counter);
      appLabel(`غسالة ${cfg.washerW}×${cfg.washerD}`,fr.f,mid,0.4,1.1); if(cfg.nicheTop){ KEY=id+"-top"; tall(fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,0.4,1.45,H-0.01); } }
    else if(nf.use==="pantry"&&fr.floor){ KEY=id+"-tall"; tall(fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,Math.min(0.6,fr.depth),0,nf.type==="niche"?Math.min(H-0.01,nf.y1-0.01):H-0.01); }
    else if(nf.use==="shelves"){ const y0=nf.type==="niche"?nf.y0:0.3, y1=nf.type==="niche"?nf.y1:H-0.2, n=Math.max(2,Math.floor((y1-y0)/0.35)); const u=newUnit("shelf",fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,Math.min(0.4,fr.depth),y0,y1,{front:`${n} رفوف`}); curUid=u.id;
      for(let i=0;i<n;i++){ const y=y0+0.02+i*(y1-y0-0.06)/Math.max(1,n-1); place(fr.f,fr.a0+0.02,fr.a1-0.02,fr.back,fr.back+Math.min(0.4,fr.depth)*dirOf(fr.f),y,y+0.025,MAT.wood); } curUid=null; }
    for(const a of apps){ if(a.loc!==id) continue; const T=APPS[a.type]; if(T.cls==="slot"||T.cls==="tall"){ const u=appUnit(fr.f,mid-a.w/200,mid+a.w/200,fr.back,a,false); u.movable=null; } }
    curSide=null; curWall=null;
  }
  // ================= island =================
  if(cfg.island.on){ const iw=cfg.island.w/100, idp=cfg.island.d/100, cx=RW/2, cz=cfg.island.pos/100, z0=cz-iw/2, z1=cz+iw/2; curWall="IS";
    const back=cx+idp/2-0.25; KEY="IS-b"; const u=base("-x",z0,z1,back,Math.max(0.3,idp-0.25)); box(cx-idp/2,ch-0.04,z0,cx+idp/2,ch,z1,MAT.counter); ACC.marble+=iw*0.4;
    const n=Math.max(1,Math.floor(iw/0.55)); for(let i=0;i<n;i++){ const s=z0+(i+0.5)*iw/n; cyl(0.17,0.05,cx+idp/2+0.2,0.66,s,MAT.wood); cyl(0.02,0.64,cx+idp/2+0.2,0.33,s,MAT.handle); }
    const gl=Math.round(((cx-idp/2)-Math.max(0,...UNITS.filter(x=>x.wall==="L"&&x.y0<1&&Math.min(x.a1,z1)-Math.max(x.a0,z0)>0).map(x=>x.depth)))*100);
    const gr=Math.round((RW-Math.max(0,...UNITS.filter(x=>x.wall==="RT"&&x.y0<1&&Math.min(x.a1,z1)-Math.max(x.a0,z0)>0).map(x=>x.depth))-(cx+idp/2))*100);
    if(Math.min(gl,gr)<90) warn.push(`المسافة حوالين الجزيرة ${Math.min(gl,gr)} سم بس، الأحسن 90 سم على الأقل`);
    curWall=null; }
  // ================= extra appliances (wall / counter / pos-based) =================
  for(const a of apps){ const T=APPS[a.type]; if(!W4.includes(a.loc)) continue; const c=wc(a.loc);
    if((T.cls==="slot"||T.cls==="tall")&&c.type==="counter") continue;
    const fr=frameOf(a.loc), a0=a.pos/100, a1=a0+a.w/100; curSide=fr.side; curWall=a.loc; let u=null;
    if(T.cls==="slot"||T.cls==="tall") u=appUnit(fr.f,a0,a1,fr.back,a,false);
    if(T.cls==="wall") u=appWall(fr.f,a0,a1,fr.back,a);
    if(T.cls==="counter"){ u=appCounter(fr.f,a0,a1,fr.back,a); if(c.type!=="counter"&&c.type!=="shallow"&&c.type!=="bar") warn.push(`${T.n} محطوط على حيطة من غير رخامة`); }
    if(u) u.movable={obj:"apps",id:a.id};
    curSide=null; curWall=null;
    if(a.type==="heaterG") warn.push("سخان الغاز لازم يبقى في مكان فيه تهوية وليه مدخنة لبرة");
  }
  // ================= custom storage units =================
  for(const cu of cfg.custom){ if(!W4.includes(cu.wall)) continue;
    const fr=frameOf(cu.wall), a0=cu.pos/100, a1=a0+cu.w/100, dp=cu.d/100; curSide=fr.side; curWall=cu.wall;
    OPT={front:cu.front,n:cu.n,shelves:cu.shelves,acc:cu.acc}; KEY=cu.id;
    if(cu.type==="lower"){ base(fr.f,a0,a1,fr.back,dp); counterLen+=a1-a0; }
    else if(cu.type==="upper") uppers(fr.f,a0,a1,fr.back,cu.y/100,capUp(cu.wall,a0,a1,Math.min(H-0.01,(cu.y+cu.h)/100)),dp);
    else if(cu.type==="tall") tall(fr.f,a0,a1,fr.back,dp,0,capUp(cu.wall,a0,a1,Math.min(H-0.01,cu.h/100)));
    else if(cu.type==="shelf"){ const n=Math.max(1,+cu.shelves||3); const u=newUnit("shelf",fr.f,a0,a1,fr.back,dp,cu.y/100,Math.min(H-0.01,(cu.y+cu.h)/100),{front:`${n} رفوف`}); const pu=curUid; curUid=u.id;
      for(let i=0;i<n;i++){ const y=cu.y/100+(n===1?0:i*(cu.h/100-0.03)/(n-1)); place(fr.f,a0,a1,fr.back,fr.back+dp*dirOf(fr.f),y,y+0.03,MAT.wood); } curUid=pu; }
    OPT=null; KEY=null; const uu=UNITS.find(x=>x.id===cu.id); if(uu) uu.movable={obj:"custom",id:cu.id};
    curSide=null; curWall=null;
  }
  // ================= backsplash =================
  const ch2=ch;
  if(cfg.splash!=="none") for(const w of W4){ const c=wc(w); if(c.type!=="counter"&&c.type!=="shallow") continue;
    curSide=w; const lows=UNITS.filter(u=>u.wall===w&&u.y0<0.5&&u.y1>=ch-0.05&&u.y1<=ch+0.05).sort((p,q)=>p.a0-q.a0); if(!lows.length){ curSide=null; continue; }
    const top0=(c.up&&cfg.upper!=="none")?US:ch+0.6;
    let runs=[]; for(const u of lows){ const l=runs[runs.length-1]; if(l&&u.a0-l[1]<0.02) l[1]=Math.max(l[1],u.a1); else runs.push([u.a0,u.a1]); }
    const wins=FEATS.filter(f=>f.wall===w&&(f.type==="window"||f.type==="niche"));
    for(const [a,b] of runs){ let cur=a; const cuts=wins.filter(f=>f.a1>a&&f.a0<b).sort((p,q)=>p.a0-q.a0);
      const seg=(s0,s1,t)=>{ if(s1-s0>0.02&&t>ch2+0.03) boxAO(w,s0,s1,0.001,0.012,ch2,t,splashMat(s1-s0,t-ch2)); };
      for(const f of cuts){ const s0=Math.max(a,f.a0), s1=Math.min(b,f.a1); seg(cur,s0,top0); seg(s0,s1,Math.min(top0,f.y0)); cur=s1; } seg(cur,b,top0); }
    curSide=null; }
  // ================= microwave =================
  const microBox=(f,a0,a1,back,y0,d0,d1)=>{ const dr=dirOf(f); place(f,a0,a1,back+d0*dr,back+d1*dr,y0,y0+0.3,M("#1f2226",{roughness:0.3})); place(f,a0+0.04,a1-0.14,back+d1*dr,back+(d1+0.005)*dr,y0+0.04,y0+0.26,M("#3a4652",{roughness:0.05})); };
  let microAt=null;
  if(cfg.micro==="upper"&&cfg.upper!=="none"){ const uu=UNITS.find(u=>u.kind==="upper"&&W4.includes(u.wall)&&Math.abs(u.y0-US)<0.02&&u.a1-u.a0>=0.55&&(!stoveWall||u.wall===stoveWall))||UNITS.find(u=>u.kind==="upper"&&W4.includes(u.wall)&&Math.abs(u.y0-US)<0.02&&u.a1-u.a0>=0.55);
    if(uu){ const fr=wallFrame(uu.wall); curSide=uu.wall; microBox(fr.f,uu.a0+0.06,uu.a0+0.56,fr.back,US+0.04,uu.depth-0.02,uu.depth+0.02); curSide=null; microAt={wall:uu.wall,a:uu.a0+0.3,y:US+0.45}; } }
  if(cfg.micro==="counter"){ const bu=[...UNITS].reverse().find(u=>u.kind==="base"&&W4.includes(u.wall)&&u.a1-u.a0>=0.5&&u.y1<=ch+0.01);
    if(bu){ const fr=wallFrame(bu.wall); curSide=bu.wall; microBox(fr.f,bu.a1-0.5,bu.a1-0.04,fr.back,ch,0.06,0.42); curSide=null; microAt={wall:bu.wall,a:bu.a1-0.2,y:ch+0.2}; } }
  // ================= decor =================
  if(cfg.decor){
    if(stoveRange){ const fr=wallFrame(stoveWall), m=(stoveRange[0]+stoveRange[1])/2, sy=cfg.stoveType==="built"?ch:cfg.stoveH/100, dr=dirOf(fr.f); curSide=stoveWall;
      cylAt(fr.f,m-0.1,fr.back+0.18*dr,sy+0.08,0.11,0.13,MAT.steel); cylAt(fr.f,m-0.1,fr.back+0.18*dr,sy+0.15,0.115,0.01,MAT.dark); cylAt(fr.f,m+0.12,fr.back+0.42*dr,sy+0.06,0.08,0.09,M("#b8432f",{roughness:0.4})); curSide=null; }
    const bases=UNITS.filter(u=>u.kind==="base"&&W4.includes(u.wall)&&u.y1<=ch+0.01&&u.a1-u.a0>=0.3);
    if(bases[0]){ const u=bases[0], fr=wallFrame(u.wall), dr=dirOf(fr.f); curSide=u.wall; cylAt(fr.f,u.a0+0.15,fr.back+0.25*dr,ch+0.1,0.07,0.2,M("#e9ebee",{metalness:0.6,roughness:0.25})); curSide=null; }
    const wu=bases.find(u=>FEATS.some(f=>f.type==="window"&&f.wall===u.wall&&f.a1>u.a0&&f.a0<u.a1));
    if(wu){ const fr=wallFrame(wu.wall), dr=dirOf(fr.f), a=wu.a1-0.14; curSide=wu.wall; cylAt(fr.f,a,fr.back+0.25*dr,ch+0.06,0.07,0.12,M("#b5623f")); const [x,z]=alongZ(fr.f)?[fr.back+0.25*dr,a]:[a,fr.back+0.25*dr]; const lf=new THREE.Mesh(new THREE.SphereGeometry(0.13,16,12),M("#4f7a45",{roughness:0.9})); lf.position.set(x,ch+0.24,z); lf.userData.side=wu.wall; root.add(lf); curSide=null; }
  }
  if(US-ch<0.5 && cfg.upper!=="none") warn.push("المسافة بين الرخامة والدولاب العلوي أقل من 50 سم");
  if(cfg.stoveType!=="built" && cfg.stoveD>62) warn.push(`البوتاجاز طالع عن الرخامة ${cfg.stoveD-62} سم`);
  if(UNITS.some(u=>u.kind==="washer"&&u.y1>=ch-0.01) && cfg.washerD+cfg.washerBack>62) warn.push(`الغسالة طالعة عن الرخامة ${cfg.washerD+cfg.washerBack-62} سم`);
  if(UNITS.some(u=>u.kind==="washer"&&u.y1>=ch-0.01) && cfg.washerH>cfg.ch-4) warn.push("الغسالة أعلى من الرخامة، علّي الرخامة من تاب الارتفاعات");
  if(cfg.sinkD>56) warn.push("الحوض أعمق من الرخامة");
  // ================= walkway =================
  let walk=null; for(const [p,q] of [["L","RT"],["W","D"]]){ const sp=p==="L"?RW:RL; const up_=UNITS.filter(u=>u.wall===p&&u.y0<1&&u.kind!=="app"), uq=UNITS.filter(u=>u.wall===q&&u.y0<1&&u.kind!=="app");
    for(const x of up_) for(const y of uq){ if(Math.min(x.a1,y.a1)-Math.max(x.a0,y.a0)>0.05){ const g=sp-x.depth-y.depth; if(walk===null||g<walk) walk=g; } } }
  if(walk===null){ let best=null; for(const u of UNITS) if(W4.includes(u.wall)&&u.y0<1){ const g=spanOf(u.wall)-u.depth; if(best===null||g<best) best=g; } walk=best===null?Math.min(RW,RL):best; }
  const walkCm=Math.round(walk*100); if(walkCm<80) warn.push(`أضيق ممر ${walkCm} سم، قلل عمق الدواليب أو شيل حاجة`);
  // ================= points =================
  computePoints(warn,{stoveWall,US,ch,appById,microAt,place:PLC});
  workTriangle(warn);
  // ================= door checks =================
  for(const dc of DOORCHK){
    const inRoom=W4.includes(dc.wall);
    if(dc.fridge){ const W=dc.a1-dc.a0; const avail=inRoom?spanOf(dc.wall)-oppDepth(dc.wall,dc.a0,dc.a1)-distFront(dc.wall,dc.front):1.2;
      const deg=cfg.openDoors?fridgeDoor(dc,avail):90; if(deg<90) warn.push(`باب التلاجة هيفتح ${deg}° بس، هيخبط في اللي قصاده`); continue; }
    if(!inRoom) continue;
    const rm=spanOf(dc.wall)-oppDepth(dc.wall,dc.a-0.3,dc.a+0.3)-distFront(dc.wall,dc.front)-dc.reach, cm=Math.round(rm*100);
    if(cfg.openDoors){ const dr=dirOf(dc.f), nn=dc.front+(dc.reach+0.05+Math.max(0,rm/2))*dr, [x,z]=alongZ(dc.f)?[nn,dc.a]:[dc.a,nn]; label(`${dc.what}: يفضل ${cm} سم`,x,0.35,z,cm<40?"#b3452c":"#2e7d4f"); }
    if(cm<40) warn.push(`لما ${dc.what} يتفتح يفضل ${Math.max(0,cm)} سم قدامه، هتقف على جنب`);
  }
  return {walk:walkCm,counter:counterLen};
}
function finishBuild(warn,walkCm,counterLen,US){
  // ================= numbering, overlaps =================
  const WO={W:0,L:1,RT:2,D:3,IS:4};
  UNITS.sort((p,q)=>(WO[p.wall]??5)-(WO[q.wall]??5)||String(p.wall).localeCompare(String(q.wall))||(p.y0>=1.2)-(q.y0>=1.2)||(WALLS[p.wall]?WALLS[p.wall].xs(q.a0+(q.a1-q.a0)/2)-WALLS[p.wall].xs(p.a0+(p.a1-p.a0)/2):0));
  UNITS.forEach((u,i)=>u.n=i+1);
  let ovc=0;
  for(let i=0;i<UNITS.length&&ovc<3;i++) for(let j=i+1;j<UNITS.length&&ovc<3;j++){ const p=UNITS[i], q=UNITS[j]; if(p.wall!==q.wall||p.wall==="FR") continue;
    const ox=Math.min(p.a1,q.a1)-Math.max(p.a0,q.a0), oy=Math.min(p.y1,q.y1)-Math.max(p.y0,q.y0);
    if(ox>0.015&&oy>0.015){ warn.push(`في تداخل بين الوحدة ${p.n} (${p.label||KN[p.kind]}) والوحدة ${q.n} (${q.label||KN[q.kind]})`); ovc++; } }
  if(selHelper){ scene.remove(selHelper); selHelper=null; } if(SEL && UNITS.some(u=>u.id===SEL)) highlight(SEL); else SEL=null;
  STATS={walk:walkCm,counter:Math.round(counterLen*100),warn,acc:{...ACC},net:[Math.round(RW*100),Math.round(RL*100)],vol:storageVol(),tri:TRI};
  QTY=genQuant(); if(cfg.roomType==="room"||cfg.roomType==="hall") ROOMQ={...QTY,tvDist:ROOMQ&&cfg.roomType==="room"?ROOMQ.tvDist:null}; /* after STATS: genQuant reads STATS.counter */
  if(cfg.labels&&(cfg.roomType||"kitchen")==="kitchen"){ label(`أضيق ممر ${walkCm} سم`,RW/2,0.05,RL/2); }
  // lights / env
  scene.background=new THREE.Color(cfg.night?0x1b1f26:0xe9ecef);
  sun.intensity=cfg.night?0.05:0.8; hemi.intensity=cfg.night?0.25:0.75; bulb.intensity=(cfg.night?0.9:0.45)*(gbOn()?1.4:1); bulb.position.set(RW/2,H-0.2,RL/2);
  if(cfg.led && cfg.upper!=="none"){ let n=0; for(const u of UNITS){ if(n>=4) break; if(u.kind==="upper"&&Math.abs(u.y0-US)<0.02&&W4.includes(u.wall)){ const fr=wallFrame(u.wall), dr=dirOf(fr.f), m=(u.a0+u.a1)/2, o=fr.back+0.3*dr; const [x,z]=alongZ(fr.f)?[o,m]:[m,o]; const p=new THREE.PointLight(0xfff0c8,cfg.night?0.5:0.15,1.6); p.position.set(x,US-0.1,z); root.add(p); n++; } } }
  if(tabsEl.dataset.rt!==cfg.roomType){ tabsEl.dataset.rt=cfg.roomType; if(!tabsFor().includes(tab)) tab=tabsFor()[0]; renderTabs(); }
  showStats(); if(!SLIDING && ["السقف","الحمام","التشطيب","الأثاث","الدهان والأرضية","التكلفة","الوحدات","المية والكهربا","➕ أجهزة","الأوضة","خطوات التنفيذ","التخزين","الأجهزة"].includes(tab)) renderControls();
  if(!SLIDING && typeof WIZ!=="undefined" && WIZ) renderWiz(); else if(typeof WIZ!=="undefined" && WIZ) updWizPreview();
  if(tab==="الأوضة") updRoomPreview();
  if(document.getElementById("draw").style.display==="flex"&&!DRAW_DOC) renderDraw();
  document.getElementById("pad").style.display=(cfg.walkPad||FP.on)?"grid":"none";
  autosave();
}

let DOORCHK=[];
const PT={switch:{c:"#8e44ad",n:"مفتاح"},data:{c:"#16a085",n:"دش / إنترنت"},water:{c:"#2a7fd4",n:"مية سخن وبارد"},drain:{c:"#1b3a5c",n:"صرف"},socket:{c:"#e07b00",n:"بريزة"},gas:{c:"#c9a400",n:"غاز"},exist:{c:"#7a8691",n:"موجود"}};
function addPt(type,wall,a,y,note){ POINTS.push({type,wall,a,y,note}); }
function hostPos(wall,a){ if(W4.includes(wall)) return [wall,a]; const nf=FEATS.find(x=>"N:"+x.id===wall); if(nf) return [nf.wall,(nf.a0+nf.a1)/2]; return null; }
function perim(wall,a){ return wall==="W"?a:wall==="RT"?RW+a:wall==="D"?RW+RL+(RW-a):2*RW+RL+(RL-a); }
function pathDist(w1,a1,w2,a2){ const p=hostPos(w1,a1), q=hostPos(w2,a2); if(!p||!q) return 9; const P=2*(RW+RL), d=Math.abs(perim(...p)-perim(...q)); return Math.min(d,P-d); }
function markerPos(p){
  if(W4.includes(p.wall)){ const [x,z]=aoToXZ(p.wall,p.a,0.015); return [x,z]; }
  const nf=FEATS.find(x=>"N:"+x.id===p.wall); if(nf){ const fr=nicheFrame(nf), dr=dirOf(fr.f), o=fr.back+0.015*dr; return alongZ(fr.f)?[o,p.a]:[p.a,o]; }
  return [RW/2,RL/2];
}
function computePoints(warn,ctx){
  const {stoveWall,US,ch,appById,microAt,place}=ctx;
  const wsrc=[], dsrc=[]; const fx=v=>Math.max(0,v/100-(v>0?FIN:0));
  if(cfg.water&&W4.includes(cfg.water.wall)){ const a=Math.min(wlen(cfg.water.wall),fx(cfg.water.pos)); addPt("exist",cfg.water.wall,a,cfg.water.y/100,"مخرج مية موجود"); wsrc.push([cfg.water.wall,a]); }
  if(cfg.drain&&W4.includes(cfg.drain.wall)){ const a=Math.min(wlen(cfg.drain.wall),fx(cfg.drain.pos)); addPt("exist",cfg.drain.wall,a,0,"صرف موجود في الأرض"); dsrc.push([cfg.drain.wall,a]); }
  for(const nf of FEATS) if((nf.type==="niche"||nf.type==="corridor")&&nf.water){ const fr=nicheFrame(nf); addPt("exist","N:"+nf.id,(fr.a0+fr.a1)/2,0.7,"مخرج مية موجود في الفجوة"); wsrc.push(["N:"+nf.id,(fr.a0+fr.a1)/2]); }
  const ext=(w,a)=>{ let m=9; for(const [sw,sa] of wsrc) m=Math.min(m,sw===w?Math.abs(sa-a):pathDist(sw,sa,w,a)); return wsrc.length?m:0; };
  const extD=(w,a)=>{ let m=9; for(const [sw,sa] of dsrc) m=Math.min(m,pathDist(sw,sa,w,a)); return dsrc.length?m:0; };
  const winAt=(w,x,yy)=>FEATS.some(f=>f.wall===w&&(f.type==="window"||f.type==="door"||f.type==="opening")&&x>f.a0-0.05&&x<f.a1+0.05&&yy>f.y0-0.05&&yy<f.y1+0.05);
  for(const u of UNITS){
    const m=(u.a0+u.a1)/2;
    if(u.kind==="sink"){ addPt("water",u.wall,m,0.55,"تغذية الحوض (سخن وبارد)"); addPt("drain",u.wall,m,0.45,"صرف الحوض");
      const e=ext(u.wall,m), ed=extD(u.wall,m); if(e>0.3) warn.push(`الحوض محتاج تمديد مية حوالي ${Math.round(e*100)} سم`); if(ed>0.4) warn.push(`الحوض محتاج تمديد صرف حوالي ${Math.round(ed*100)} سم`); }
    if(u.kind==="washer"){ addPt("water",u.wall,u.a0+0.12,0.75,"حنفية الغسالة"); addPt("drain",u.wall,u.a0+0.25,0.6,"صرف الغسالة"); addPt("socket",u.wall,u.a1-0.12,0.75,"بريزة الغسالة (بأرضي)");
      const e=ext(u.wall,m); if(e>1.0) warn.push(`الغسالة بعيدة عن المية ${Math.round(e*100)} سم، محتاج تمديد`); }
    if(u.kind==="dish"){ addPt("water",u.wall,u.a0+0.1,0.3,"تغذية غسالة الأطباق"); addPt("drain",u.wall,u.a0+0.2,0.3,"صرف غسالة الأطباق"); addPt("socket",u.wall,u.a1-0.1,0.3,"بريزة غسالة الأطباق"); }
    if(u.kind==="fridge") addPt("socket",u.wall,u.a1-0.12,0.6,"بريزة التلاجة (ورا التلاجة)");
    if(u.kind==="stove"){ if(cfg.stoveType==="built"){ addPt("socket",u.wall,u.a0+0.12,0.35,"بريزة الفرن البلت إن"); addPt("gas",u.wall,u.a1-0.12,0.7,"مخرج غاز للمسطح"); } else addPt("gas",u.wall,u.a1-0.12,0.45,"مخرج غاز البوتاجاز"); }
    if(u.kind==="hood") addPt("socket",u.wall,m,cfg.hood==="chimney"?Math.min(H-0.2,US+0.75):US+0.15,"بريزة الشفاط");
    if(u.kind==="base" && W4.includes(u.wall) && u.y1<1.2 && (u.a1-u.a0)>=0.3){
      const nearStove=UNITS.some(s=>s.kind==="stove"&&s.wall===u.wall&&(Math.abs(u.a0-s.a1)<0.02||Math.abs(u.a1-s.a0)<0.02))&&(u.a1-u.a0)<0.45;
      let x=m; if(winAt(u.wall,x,ch+0.2)){ const cand=[u.a0+0.12,u.a1-0.12].find(v=>!winAt(u.wall,v,ch+0.2)); x=cand??null; }
      if(!nearStove && x!=null) addPt("socket",u.wall,x,ch+0.2,"بريزة فوق الرخامة (دبل)");
    }
  }
  if(microAt) addPt("socket",microAt.wall,microAt.a,microAt.y,cfg.micro==="upper"?"بريزة الميكروويف (جوه الدولاب)":"بريزة الميكروويف");
  if(cfg.led && cfg.upper!=="none"){ const uu=UNITS.find(u=>u.kind==="upper"&&W4.includes(u.wall)&&Math.abs(u.y0-US)<0.02); if(uu) addPt("socket",uu.wall,uu.a0+0.1,US+0.1,"سلك إضاءة LED تحت الدواليب"); }
  for(const u of UNITS){ if(u.kind!=="app") continue; const a=appById[u.app]; if(!a) continue; const T=APPS[a.type], nm=T.n;
    const sy=T.cls==="counter"?ch+0.2:T.cls==="wall"?Math.min(H-0.1,u.y1+0.12):T.cls==="tall"?Math.min(1.1,u.y1-0.15):0.4;
    const wy=T.cls==="wall"?Math.max(0.3,u.y0-0.12):0.6;
    if(T.need.includes("socket")) addPt("socket",u.wall,u.a1-0.08,sy,"بريزة "+nm);
    if(T.need.includes("water")){ addPt("water",u.wall,u.a0+0.08,wy,"مية "+nm); const e=ext(u.wall,(u.a0+u.a1)/2); if(e>1.0) warn.push(`${nm} محتاج تمديد مية حوالي ${Math.round(e*100)} سم`); }
    if(T.need.includes("drain")) addPt("drain",u.wall,u.a0+0.2,0.45,"صرف "+nm);
    if(T.need.includes("gas")) addPt("gas",u.wall,(u.a0+u.a1)/2,wy,"غاز "+nm);
  }
  drawPts();
}
function drawPts(){
  if(!cfg.showPts) return;
  for(const p of POINTS){
    const [x,z]=markerPos(p), y=Math.max(0.03,p.y), exist=p.type==="exist";
    const mk=new THREE.Mesh(new THREE.SphereGeometry(exist?0.045:0.035,14,10),new THREE.MeshBasicMaterial({color:PT[p.type].c,depthTest:false,transparent:true,opacity:exist?0.6:0.95}));
    mk.position.set(x,y,z); mk.renderOrder=12; mk.raycast=()=>{}; const hp=hostPos(p.wall,p.a); mk.userData.side=hp?hp[0]:null; root.add(mk);
    if(cfg.ptLabels) label(p.note,x,y+0.08,z,PT[p.type].c);
  }
}

function highlight(uid){
  if(selHelper){ scene.remove(selHelper); selHelper=null; }
  const bx=new THREE.Box3(); let any=false;
  root.traverse(o=>{ if(o.isMesh && o.userData.uid===uid){ bx.expandByObject(o); any=true; } });
  if(!any) return; bx.expandByScalar(0.01);
  selHelper=new THREE.Box3Helper(bx,new THREE.Color(0xff8a00)); selHelper.material.depthTest=false; selHelper.renderOrder=20; scene.add(selHelper);
}
function selectUnit(uid,openTab){
  SEL=uid; highlight(uid);
  if(openTab){ tab="الوحدات"; renderTabs(); if(!panelOpen) setPanel(true); renderControls();
    const r=ctlEl.querySelector(`[data-uid="${uid}"]`); if(r) r.scrollIntoView({block:"center"}); }
  else ctlEl.querySelectorAll(".urow").forEach(r=>r.classList.toggle("sel",r.dataset.uid===uid));
}
// ---- drawings ----
const UC={dryer:"#e3e5e7",usink:"#cfe3ee",furn:"#e3d7c3",toilet:"#e6edf1",bidet:"#e6edf1",basin:"#cfe3ee",shower:"#d4ebf3",tub:"#d4ebf3",heater:"#f0e3d0",towel:"#ddd",filler:"#dcd8d0",base:"#ece7dc",sink:"#cfe3ee",stove:"#f2c9bd",washer:"#d9e6d0",dish:"#e3e5e7",fridge:"#dcd6f0",upper:"#f4f2ec",tall:"#e9e0cf",hood:"#cfd4d8",shelf:"#ead3ae",bar:"#f1d19b"};
function elevSVG(w){
  const Wd=WALLS[w], S=100, mx=46, my=46, Lc=Wd.len*S, Hc=H*S, X=a=>mx+Wd.xs(a)*S, Y=y=>my+(H-y)*S;
  const us=UNITS.filter(u=>u.wall===w);
  let s=`<svg viewBox="0 0 ${Lc+2*mx+30} ${Hc+2*my+24}" xmlns="http://www.w3.org/2000/svg" font-family="Tahoma,Arial" font-size="11">
  <defs><pattern id="hp${w}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e4e1db"/><line x1="0" y1="0" x2="0" y2="8" stroke="#a9a39a" stroke-width="2"/></pattern></defs>
  <rect x="${mx}" y="${my}" width="${Lc}" height="${Hc}" fill="#fcfcfb" stroke="#30343a" stroke-width="2"/>`;
  const hatch=(a0,a1,y0,y1,t)=>{ const xa=Math.min(X(a0),X(a1)), xb=Math.max(X(a0),X(a1)); s+=`<rect x="${xa}" y="${Y(y1)}" width="${xb-xa}" height="${(y1-y0)*S}" fill="url(#hp${w})" stroke="#8a857c"/>`; if(t) s+=`<text x="${(xa+xb)/2}" y="${Y((y0+y1)/2)}" text-anchor="middle" font-size="12" fill="#555">${t}</text>`; };
  const hole=(a0,a1,y0,y1,t)=>{ const xa=Math.min(X(a0),X(a1)), xb=Math.max(X(a0),X(a1)); s+=`<rect x="${xa}" y="${Y(y1)}" width="${xb-xa}" height="${(y1-y0)*S}" fill="#dff0f8" stroke="#2f6d8c" stroke-width="1.5"/><text x="${(xa+xb)/2}" y="${Y(y1)+14}" text-anchor="middle" fill="#2f6d8c">${t}</text>`; };
  if(W4.includes(w)) for(const [a0,a1] of cutHoles(w)) hatch(a0,a1,0,H,"برة الأوضة");
  for(const f of FEATS.filter(x=>x.wall===w)){
    if(f.type==="railing") hole(f.a0,f.a1,0,(f.h||110)/100,"سور");
    if(f.type==="window") hole(f.a0,f.a1,f.y0,f.y1,"شباك");
    if(f.type==="door") hole(f.a0,f.a1,0,f.y1,"باب");
    if(f.type==="opening") hole(f.a0,f.a1,0,f.y1,"فتحة");
    if(f.type==="niche") hole(f.a0,f.a1,f.y0,f.y1,"تجويف");
    if(f.type==="column"||(f.type==="shaft"||f.type==="stack")) hatch(f.a0,f.a1,0,H,`${(f.type==="shaft"||f.type==="stack")?"شفت":"بروز"} ${Math.round(f.dep*100)}`);
    if(f.type==="beam") hatch(f.a0,f.a1,f.y0,H,"كمرة");
  }
  for(const u of us){
    const xa=Math.min(X(u.a0),X(u.a1)), xb=Math.max(X(u.a0),X(u.a1)), ya=Y(u.y1), h=(u.y1-u.y0)*S, sel=u.id===SEL;
    s+=`<rect x="${xa}" y="${ya}" width="${xb-xa}" height="${h}" fill="${UC[u.kind]||"#eee"}" stroke="${sel?"#ff8a00":"#555"}" stroke-width="${sel?3:1}"/>`;
    if(u.kind==="base"||u.kind==="sink"){ if(u.front==="drawers"){ for(const k of [0.36,0.7]) s+=`<line x1="${xa+3}" x2="${xb-3}" y1="${ya+h*k}" y2="${ya+h*k}" stroke="#999"/>`; }
      else if(u.front==="drawer_door") s+=`<line x1="${xa+3}" x2="${xb-3}" y1="${ya+h*0.22}" y2="${ya+h*0.22}" stroke="#999"/>`;
      else if((xb-xa)>70 && u.front!=="open") s+=`<line x1="${(xa+xb)/2}" x2="${(xa+xb)/2}" y1="${ya+4}" y2="${ya+h-12}" stroke="#999"/>`; }
    if(u.kind==="upper" && h>100) s+=`<line x1="${xa+2}" x2="${xb-2}" y1="${ya+h-72}" y2="${ya+h-72}" stroke="#999"/>`;
    if(u.secs){ for(const sc of u.secs){ const x0=Math.min(X(sc.a0),X(sc.a1)), x1=Math.max(X(sc.a0),X(sc.a1)); if(sc.k==="gap") s+=`<rect x="${x0}" y="${u.topY?Y(u.topY):ya}" width="${x1-x0}" height="${(u.topY?u.topY-u.y0:u.y1-u.y0)*S}" fill="#fff" stroke="#999" stroke-dasharray="4 3"/>`; s+=`<line x1="${x1}" x2="${x1}" y1="${ya}" y2="${ya+h}" stroke="#666"/>`; if(x1-x0>24) s+=`<text x="${(x0+x1)/2}" y="${ya+h-8}" text-anchor="middle" font-size="9" fill="#444">${sc.label} ${Math.round((sc.a1-sc.a0)*100)}</text>`; } if(u.topY) s+=`<line x1="${xa}" x2="${xb}" y1="${Y(u.topY)}" y2="${Y(u.topY)}" stroke="#666"/>`; }
    const cx=(xa+xb)/2, cy=ya+Math.min(h/2,60);
    s+=`<circle cx="${xa+11}" cy="${ya+11}" r="9" fill="#2d5f7a"/><text x="${xa+11}" y="${ya+15}" text-anchor="middle" fill="#fff" font-size="10">${u.n}</text>`;
    if(xb-xa>30) s+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="#333" font-size="${xb-xa>55?11:9}">${(u.label||KN[u.kind]||"").replace("دولاب ","").slice(0,14)}</text>`;
  }
  // points
  for(const p of POINTS.filter(p=>p.wall===w)){ const ex=p.type==="exist";
    s+=`<circle cx="${X(p.a)}" cy="${Y(p.y)}" r="${ex?7:5}" fill="${ex?"none":PT[p.type].c}" stroke="${PT[p.type].c}" stroke-width="${ex?2.5:1}"/>`; }
  // dimension chains
  const chain=(list,yl,above)=>{ const b=[...new Set(list.map(v=>Math.round(v)))].sort((p,q)=>p-q);
    for(let i=0;i<b.length-1;i++){ const a=b[i], c=b[i+1]; if(c-a<3) continue;
      s+=`<line x1="${a}" x2="${c}" y1="${yl}" y2="${yl}" stroke="#2d5f7a"/><line x1="${a}" x2="${a}" y1="${yl-5}" y2="${yl+5}" stroke="#2d5f7a"/><line x1="${c}" x2="${c}" y1="${yl-5}" y2="${yl+5}" stroke="#2d5f7a"/>
      <text x="${(a+c)/2}" y="${above?yl-4:yl+13}" text-anchor="middle" fill="#2d5f7a" font-size="${c-a<28?9:11}">${Math.round((c-a)/S*100)}</text>`; } };
  const low=us.filter(u=>u.y0<1.2), hi=us.filter(u=>u.y0>=1.2);
  if(low.length) chain([mx,mx+Lc,...low.flatMap(u=>[X(u.a0),X(u.a1)])],my+Hc+14,false);
  if(hi.length) chain([mx,mx+Lc,...hi.flatMap(u=>[X(u.a0),X(u.a1)])],my-12,true);
  // heights
  const lv=[0,H]; if(low.some(u=>u.y1<1.2)) lv.push(cfg.ch/100); if(hi.some(u=>u.kind==="upper")) lv.push(cfg.uStart/100);
  for(const f of FEATS) if(f.wall===w&&f.type==="window"){ lv.push(f.y0); lv.push(f.y1); }
  const lvs=[...new Set(lv.map(v=>Math.round(v*100)))].sort((p,q)=>p-q), vx=mx+Lc+14;
  for(let i=0;i<lvs.length-1;i++){ const a=Y(lvs[i]/100), c=Y(lvs[i+1]/100);
    s+=`<line x1="${vx}" x2="${vx}" y1="${a}" y2="${c}" stroke="#8a5a2b"/><line x1="${vx-4}" x2="${vx+4}" y1="${a}" y2="${a}" stroke="#8a5a2b"/><line x1="${vx-4}" x2="${vx+4}" y1="${c}" y2="${c}" stroke="#8a5a2b"/>
    <text x="${vx+6}" y="${(a+c)/2+4}" fill="#8a5a2b" font-size="10">${lvs[i+1]-lvs[i]}</text>`; }
  s+=`<text x="${mx+Lc/2}" y="${my+Hc+36}" text-anchor="middle" fill="#666" font-size="11">الطول الكلي ${Math.round(Wd.len*100)} سم • الارتفاع ${Math.round(H*100)} سم</text>`;
  return s+"</svg>";
}
function drawHTML(){
  let h="", t="";
  const walls=[...["L","W","RT","D"].filter(w=>UNITS.some(u=>u.wall===w)||FEATS.some(f=>f.wall===w)),...Object.keys(WALLS).filter(k=>!W4.includes(k)&&k!=="FR"&&UNITS.some(u=>u.wall===k))];
  h+=`<section id="sec-plan"><h3>المسقط (من فوق)</h3><div class="sub">صافي ${Math.round(RW*100)} × ${Math.round(RL*100)} سم بعد التشطيب</div><div class="planbox">${planSVG()}</div></section>`; t+=`<button data-go="sec-plan">المسقط</button>`;
  for(const w of walls){ t+=`<button data-go="sec-${w}">${WALLS[w].name.split(" (")[0]}</button>`;
    h+=`<section id="sec-${w}"><h3>${WALLS[w].name}</h3><div class="sub">واقف في المطبخ وباصص عليها • المقاسات بالسنتيمتر • الأرقام في الدواير هي رقم الوحدة في الجدول</div><div class="elev">${elevSVG(w)}</div></section>`; }
  t+=`<button data-go="sec-tbl">جدول الوحدات</button>`+(TRI?`<button data-go="sec-tri">مثلث العمل</button>`:"")+`<button data-go="sec-pts">الكهربا والمية</button><button data-go="sec-elec">الأحمال</button><button data-go="sec-steps">خطوات التنفيذ</button>`;
  const rows=UNITS.map(u=>{ const Wd=WALLS[u.wall]; return `<tr${u.id===SEL?' style="background:#fff4e5"':""}><td>${u.n}</td><td>${Wd.name.split(" (")[0]}</td><td>${esc(u.label||KN[u.kind]||u.kind)}</td><td>${Math.round((u.a1-u.a0)*100)}</td><td>${Math.round((u.y1-u.y0)*100)}</td><td>${Math.round(u.depth*100)}</td><td>${Math.round(u.y0*100)}</td><td>${(FN[u.front]||u.front||"—")+(u.acc?" + "+ACCN[u.acc]:"")}</td><td>${Math.round(Wd.ref(u.a0)*100)} ${Wd.refName}</td></tr>`; }).join("");
  const a=STATS.acc||{};
  h+=`<section id="sec-tbl"><h3>جدول الوحدات للنجار</h3><div class="sub">الارتفاع من الأرض لحد فوق الوحدة • الرخامة ${cfg.ch} سم من الأرض • الدواليب العلوية بتبدأ من ${cfg.uStart} سم وعمقها ${cfg.uDepth} سم</div>
  <div class="tbl"><table><tr><th>#</th><th>الحيطة</th><th>النوع</th><th>العرض</th><th>الارتفاع</th><th>العمق</th><th>بتبدأ من ارتفاع</th><th>الواجهة</th><th>مكانها</th></tr>${rows}</table></div>
  <div class="sub" style="margin-top:8px">الإجمالي: سفلي ${(a.lower||0).toFixed(2)} م • علوي ${(a.upper||0).toFixed(2)} م • طول ${(a.tall||0).toFixed(2)} م • رخامة ${(a.marble||0).toFixed(2)} م</div></section>`;
  const prow=POINTS.map((p,i)=>{ const Wd=WALLS[p.wall]; return `<tr><td>${i+1}</td><td><span style="color:${PT[p.type].c}">●</span> ${p.type==="exist"?"موجود":PT[p.type].n}</td><td>${Wd.name.split(" (")[0]}</td><td>${Math.round(Wd.ref(p.a)*100)} ${Wd.refName}</td><td>${Math.round(p.y*100)}</td><td>${p.note}</td></tr>`; }).join("");
  const cnt=k=>POINTS.filter(p=>p.type===k).length;
  h+=`<section id="sec-pts"><h3>جدول الكهربائي والسباك</h3><div class="sub">${cnt("socket")} بريزة • ${cnt("water")} تغذية مية • ${cnt("drain")} صرف • ${cnt("gas")} غاز. الارتفاع من الأرض لنص النقطة. الأماكن مقترحة، راجعها مع الفني قبل التكسير.</div>
  <div class="tbl"><table><tr><th>#</th><th>النوع</th><th>الحيطة</th><th>المكان</th><th>الارتفاع</th><th>ملاحظة</th></tr>${prow}</table></div>
  <div class="sub" style="margin-top:8px">⚠ البرايز اللي فوق الرخامة تبعد 30 سم على الأقل عن الحوض والبوتاجاز. بريزة الغسالة والتلاجة بأرضي وعلى خط لوحدهم.</div></section>`;
  if(TRI){ const nm={s:"الحوض",t:"البوتاجاز",f:"التلاجة"}; h+=`<section id="sec-tri"><h3>مثلث العمل</h3><div class="sub">المسافة بين وش الحوض والبوتاجاز والتلاجة. الأحسن كل ضلع من 1.2 لـ 2.7 م، والمجموع أقل من 7.9 م، ومحدش يعدي من جوه المثلث.</div><div class="tbl"><table style="min-width:0"><tr><th>من</th><th>لـ</th><th>المسافة</th></tr>${TRI.legs.map(([a,b,l])=>`<tr><td>${nm[a]}</td><td>${nm[b]}</td><td style="color:${l>2.7?"#b3452c":"#2e7d4f"}">${l.toFixed(2)} م</td></tr>`).join("")}</table></div><div class="sub" style="margin-top:6px">المجموع ${TRI.total.toFixed(2)} م • التقييم ${"★".repeat(TRI.score)}${"☆".repeat(3-TRI.score)}</div>${TRI.notes.length?`<ul style="font-size:13px;color:#8a2a1c">${TRI.notes.map(n=>`<li>${n}</li>`).join("")}</ul>`:`<div class="sub" style="color:#2e7d4f">✓ التوزيعة مريحة في الاستخدام</div>`}</section>`; }
  if(GBQ&&(GBQ.type==="flat"||GBQ.type==="tray")){ h+=`<section id="sec-ceil"><h3>مسقط السقف (الجبس بورد)</h3><div class="sub">${gbSummary().replace(/<hr>.*$/,"")}<br>البرتقاني = السبوتات${GBQ.inner?" • الأرقام = عرض البانوه بالسنتيمتر • "+(GBQ.led?"الخط الأصفر = ليد مخفي":"المتقطع = حد بيت النور"):""}</div><div class="planbox">${ceilSVG()}</div></section>`; t+=`<button data-go="sec-ceil">السقف</button>`; }
  if(cfg.roomType==="bath"&&BATH){ const B=BATH; h+=`<section id="sec-fin"><h3>كميات التشطيب</h3><div class="tbl"><table style="min-width:0"><tr><td>سيراميك الحيطان (لحد ${Math.round(B.top*100)} سم)</td><td>${B.wallA.toFixed(1)} م² • ${B.wallPcs} بلاطة ${cfg.wallTile}</td></tr><tr><td>بلاط الأرضية</td><td>${B.floorA.toFixed(1)} م² • ${B.floorPcs} بلاطة ${cfg.floorTile}</td></tr><tr><td>العزل</td><td>${B.wp.toFixed(1)} م²</td></tr><tr><td>الردم تقريبًا</td><td>${B.fill} سم (ميول 2%)</td></tr></table></div><div class="sub" style="margin-top:6px">الكميات شاملة هالك ${cfg.waste}%، وبعد طرح الأبواب والشبابيك.</div></section>`; t+=`<button data-go="sec-fin">التشطيب</button>`; }
  { const el=elecLoads(); h+=`<section id="sec-elec"><h3>أحمال الكهربا والدوائر</h3><div class="sub">أرقام تقريبية للتخطيط بس، والكهربائي لازم يراجعها حسب العداد واللوحة.</div><div class="tbl"><table style="min-width:0"><tr><th>الجهاز</th><th>القدرة التقريبية</th></tr>${el.rows.map(r=>`<tr><td>${r.n}</td><td>${r.w.toLocaleString("ar-EG")} وات</td></tr>`).join("")}</table></div><div class="sub" style="margin-top:6px">إجمالي القدرة ${(el.total/1000).toFixed(1)} ك.و • المتوقع شغال في نفس الوقت حوالي ${(el.demand/1000).toFixed(1)} ك.و (${el.amps} أمبير)</div><h3 style="font-size:14px">الدوائر المقترحة في اللوحة</h3><div class="tbl"><table style="min-width:0"><tr><th>الدائرة</th><th>القاطع</th><th>السلك</th><th>ملاحظة</th></tr>${el.circuits.map(c=>`<tr><td>${c.n}</td><td>${c.a} أمبير</td><td>${c.mm} مم²</td><td>${c.why}</td></tr>`).join("")}</table></div><div class="sub" style="margin-top:6px">كل البرايز بأرضي، ويفضل قاطع تسريب أرضي (RCD) لخطوط المطبخ عشان المية.</div></section>`; }
  h+=`<section id="sec-steps"><h3>خطوات التنفيذ بالترتيب</h3><div class="sub">المقاسات الصافية بعد التشطيب: عرض ${Math.round(RW*100)} × طول ${Math.round(RL*100)} سم</div><ol style="font-size:13px;line-height:1.8;padding-inline-start:20px">${STEPS().map(([a,b],i)=>`<li${cfg.steps[i]?' style="color:#8a9097;text-decoration:line-through"':""}><b>${a}:</b> ${b}</li>`).join("")}</ol></section>`;
  if((STATS.warn||[]).length) h=`<section><h3>⚠ ملاحظات على التصميم</h3><ul style="font-size:13px;line-height:1.8;padding-inline-start:18px;color:#8a2a1c">${[...new Set(STATS.warn)].map(w=>`<li>${esc(w)}</li>`).join("")}</ul></section>`+h;
  return {h,t};
}
function renderDraw(){ if(DRAW_DOC) return; const body=document.getElementById("dbody"), tabs=document.getElementById("dtabs"); const {h,t}=drawHTML();
  body.innerHTML=h; tabs.innerHTML=t;
  tabs.querySelectorAll("button").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.go).scrollIntoView({behavior:"smooth"}));
}
function openDraw(sec){ DRAW_DOC=false; document.getElementById("draw").style.display="flex"; renderDraw(); if(sec) setTimeout(()=>{ const e=document.getElementById("sec-"+sec); if(e) e.scrollIntoView(); },50); }
function showStats(){
  const s=STATS; let h=cfg.roomType==="room"?`<span>صافي ${s.net?s.net[0]+"×"+s.net[1]:""}</span><span>أرضية ${ROOMQ?ROOMQ.floorA.toFixed(1):0} م²</span><span>دهان ${ROOMQ?ROOMQ.liters:0} لتر</span>`:cfg.roomType==="bath"?`<span>صافي ${s.net?s.net[0]+"×"+s.net[1]:""}</span><span>مساحة الحركة ${s.walk} سم</span><span>سيراميك ${BATH?(BATH.wallA+BATH.floorA).toFixed(1):0} م²</span>`:`<span>صافي ${s.net?s.net[0]+"×"+s.net[1]:""}</span><span>أضيق ممر ${s.walk} سم</span><span>إجمالي الرخامة ${s.counter} سم</span>`;
  const ws=[...new Set(s.warn)]; ws.slice(0,3).forEach(w=>h+=`<span class="warn">${esc(w)}</span>`); if(ws.length>3) h+=`<span class="warn">+${ws.length-3} تحذيرات تانية (في 📐)</span>`;
  document.getElementById("stats").innerHTML=h;
}
