// =================== BATHROOM MODE ===================
const BFIX={
  toilet:{n:"قاعدة",w:40,d:70,var:[["floor","أرضي بصندوق"],["hung","معلقة (بوكس في الحيطة)"]]},
  bidet:{n:"شطاف منفصل (بيديه)",w:38,d:55},
  basin:{n:"حوض",w:60,d:46,var:[["vanity","على وحدة"],["wall","معلق"],["pedestal","برجل"]]},
  shower:{n:"شاور",w:90,d:90,var:[["tray","قاعدة وكابينة إزاز"],["walkin","أرضي بلوح إزاز"],["curtain","بستارة"]]},
  tub:{n:"بانيو",w:170,d:75},
  heater:{n:"سخان",w:45,d:45,var:[["elec","كهربا"],["gas","غاز"]],wallY:170},
  washer:{n:"غسالة",w:60,d:60},
  cab:{n:"دولاب تخزين",w:50,d:35},
  towel:{n:"شماعة فوط",w:60,d:8,wallY:110},
  dryer:{n:"مجفف هدوم",w:60,d:60},
  usink:{n:"حوض غسيل (خدمة)",w:50,d:50}
};
const BLIM={dryer:[55,70,50,70],usink:[40,80,40,60],toilet:[35,60,55,80],bidet:[35,60,45,65],basin:[40,180,30,60],shower:[70,200,70,200],tub:[120,200,65,100],heater:[30,70,30,60],washer:[55,70,50,70],cab:[30,120,25,60],towel:[30,150,5,15]};
const BTEMPLATES={
  b_guest:{name:"حمام ضيوف",dims:[130,180],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"D",pos:Math.round((W-70)/2),w:70,y:0,h:210,d:0}],
    bfix:[{id:"t1",type:"toilet",var:"floor",wall:"W",pos:Math.round((w-40)/2),w:40,d:70},{id:"b1",type:"basin",var:"wall",wall:"L",pos:l-42,w:40,d:35,mirror:"mirror"}],water:{wall:"W",pos:Math.round(W/2),y:55},drain:{wall:"W",pos:Math.round(W/2)}}; }},
  b_small:{name:"حمام صغير بشاور",dims:[160,220],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"W",pos:W-90,w:70,y:0,h:210,d:70},{id:"win",type:"window",wall:"D",pos:Math.round((W-50)/2),w:50,y:170,h:45}],
    bfix:[{id:"s1",type:"shower",var:"tray",wall:"D",pos:0,w:w,d:80},{id:"b1",type:"basin",var:"wall",wall:"L",pos:5,w:40,d:40,mirror:"mirror"},{id:"t1",type:"toilet",var:"floor",wall:"L",pos:70,w:40,d:70},{id:"h1",type:"heater",var:"elec",wall:"W",pos:8,w:45,d:45,y:170}],water:{wall:"L",pos:60,y:55},drain:{wall:"L",pos:90}}; }},
  b_std:{name:"حمام عادي بشاور",dims:[180,260],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"D",pos:10,w:75,y:0,h:210,d:75},{id:"win",type:"window",wall:"RT",pos:100,w:60,y:170,h:50}],
    bfix:[{id:"s1",type:"shower",var:"tray",wall:"W",pos:w-90,w:90,d:90},{id:"b1",type:"basin",var:"vanity",wall:"W",pos:12,w:55,d:45,mirror:"cab"},{id:"t1",type:"toilet",var:"floor",wall:"L",pos:120,w:40,d:70},{id:"w1",type:"washer",wall:"RT",pos:l-70,w:60,d:60},{id:"h1",type:"heater",var:"elec",wall:"D",pos:110,w:45,d:45,y:170},{id:"r1",type:"towel",wall:"L",pos:40,w:50,d:8,y:110}],water:{wall:"L",pos:100,y:55},drain:{wall:"L",pos:140}}; }},
  b_tub:{name:"حمام ببانيو",dims:[200,260],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"D",pos:W-95,w:80,y:0,h:210,d:80},{id:"win",type:"window",wall:"RT",pos:40,w:60,y:170,h:50}],
    bfix:[{id:"u1",type:"tub",wall:"W",pos:0,w:w,d:75},{id:"t1",type:"toilet",var:"hung",wall:"L",pos:100,w:40,d:70},{id:"b1",type:"basin",var:"vanity",wall:"L",pos:170,w:70,d:46,mirror:"cab"},{id:"h1",type:"heater",var:"elec",wall:"RT",pos:130,w:45,d:45,y:170}],water:{wall:"L",pos:150,y:55},drain:{wall:"L",pos:110}}; }},
  b_laundry:{name:"أوضة غسيل",dims:[180,200],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"D",pos:20,w:80,y:0,h:210,d:0},{id:"win",type:"window",wall:"W",pos:Math.round((W-60)/2),w:60,y:170,h:45}],
    bfix:[{id:"w1",type:"washer",wall:"W",pos:10,w:60,d:60},{id:"y1",type:"dryer",wall:"W",pos:75,w:60,d:60},{id:"s1",type:"usink",wall:"RT",pos:125,w:50,d:50},{id:"c1",type:"cab",wall:"L",pos:110,w:50,d:35},{id:"h1",type:"heater",var:"elec",wall:"RT",pos:30,w:45,d:45,y:170}],water:{wall:"W",pos:40,y:75},drain:{wall:"W",pos:50}}; }},
  b_master:{name:"حمام ماستر",dims:[260,320],make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"door",type:"door",wall:"D",pos:90,w:80,y:0,h:210,d:80},{id:"win",type:"window",wall:"W",pos:Math.round((W-80)/2),w:80,y:170,h:50}],
    bfix:[{id:"u1",type:"tub",wall:"L",pos:0,w:170,d:75},{id:"s1",type:"shower",var:"walkin",wall:"W",pos:w-100,w:100,d:100},{id:"t1",type:"toilet",var:"hung",wall:"L",pos:195,w:40,d:70},{id:"b1",type:"basin",var:"vanity",wall:"RT",pos:170,w:120,d:50,mirror:"cab"},{id:"c1",type:"cab",wall:"L",pos:262,w:50,d:35},{id:"h1",type:"heater",var:"elec",wall:"D",pos:30,w:45,d:45,y:170}],water:{wall:"L",pos:210,y:55},drain:{wall:"L",pos:220}}; }}
};
const tplName=k=>(TEMPLATES[k]||BTEMPLATES[k]||(typeof HTEMPLATES!=="undefined"&&HTEMPLATES[k])||(typeof RTEMPLATES!=="undefined"&&RTEMPLATES[k])||{}).name||"";
let BATH=null;
const TSZ={"20x20":[0.2,0.2],"25x40":[0.4,0.25],"30x30":[0.3,0.3],"30x60":[0.6,0.3],"60x60":[0.6,0.6],"60x120":[1.2,0.6],"20x120":[1.2,0.2]};
function bathTileMat(w,h){ const [tw,th]=TSZ[cfg.wallTile]||[0.6,0.3]; return new THREE.MeshStandardMaterial({map:makeTex("tiles",cfg.cTile,w/tw,h/th),roughness:0.25}); }
function buildBath(warn){
  const cer=M("#f8f8f6",{roughness:0.18}), chrome=MAT.steel, glass=M("#cfe6ee",{transparent:true,opacity:0.22,roughness:0.05}), frame=M("#b9bfc4",{metalness:0.6,roughness:0.3});
  const top=cfg.tileTop==="ceil"?H-gbWallDrop()-0.005:Math.min(H-gbWallDrop(),+cfg.tileTop/100);
  // wall tiles (skip openings)
  for(const w of W4){ curSide=w; const L=wlen(w); const hs=FEATS.filter(f=>f.wall===w&&["window","door","opening","niche","railing"].includes(f.type)).concat(cutHoles(w).map(([a,b])=>({a0:a,a1:b,y0:0,y1:H}))).sort((p,q)=>p.a0-q.a0); let a=0;
    const seg=(s0,s1,y0,y1)=>{ if(s1-s0>0.01&&y1-y0>0.01) boxAO(w,s0,s1,0.001,0.008,y0,y1,bathTileMat(s1-s0,y1-y0)); };
    for(const f of hs){ seg(a,f.a0,0,top); const s0=Math.max(a,f.a0); seg(s0,f.a1,0,Math.min(top,f.y0)); if(f.y1<top) seg(s0,f.a1,f.y1,top); a=Math.max(a,f.a1); } seg(a,L,0,top); curSide=null; }
  const bodies=[], zones=[], fx=cfg.bfix||[];
  const nmOf=b=>BFIX[b.type].n+(BFIX[b.type].var?" "+(BFIX[b.type].var.find(v=>v[0]===b.var)||BFIX[b.type].var[0])[1]:"");
  for(const b of fx){ const T=BFIX[b.type]; if(!T||!W4.includes(b.wall)) continue;
    const L=wlen(b.wall), w=Math.min(b.w/100,L), a0=Math.max(0,Math.min(L-w,b.pos/100)), a1=a0+w, d=Math.min(b.d/100,spanOf(b.wall)), m=(a0+a1)/2, fr=wallFrame(b.wall), dr=dirOf(fr.f);
    curSide=b.wall; curWall=b.wall;
    const P=(s0,s1,d0,d1,y0,y1,mt)=>place(fr.f,s0,s1,fr.back+d0*dr,fr.back+d1*dr,y0,y1,mt);
    const E=(a,dd,y,r,h,mt,sN)=>{ const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.88,h,28),mt); const n=fr.back+dd*dr; const [x,z]=alongZ(fr.f)?[n,a]:[a,n]; me.position.set(x,y,z); if(alongZ(fr.f)) me.scale.x=sN||1; else me.scale.z=sN||1; me.castShadow=true; me.userData.side=curSide; if(curUid) me.userData.uid=curUid; root.add(me); return me; };
    const wallItem=!!T.wallY, y0=wallItem?(b.y||T.wallY)/100:0;
    let y1=0.9; if(b.type==="toilet") y1=b.var==="hung"?1.15:0.83; if(b.type==="bidet") y1=0.42; if(b.type==="basin") y1=0.86; if(b.type==="shower") y1=2.0; if(b.type==="tub") y1=0.56; if(b.type==="heater") y1=y0+0.72; if(b.type==="cab") y1=2.1; if(b.type==="towel") y1=y0+0.25; if(b.type==="washer") y1=cfg.washerH/100; if(b.type==="dryer") y1=0.85; if(b.type==="usink") y1=0.9;
    let u=null;
    if(b.type==="washer"){ const sv=[cfg.washerW,cfg.washerD]; cfg.washerW=Math.round(w*100); cfg.washerD=Math.round(d*100); /* draw with this fixture's size, not the kitchen washer's */ try{ u=washer(fr.f,a0,a1,fr.back,false); } finally{ [cfg.washerW,cfg.washerD]=sv; } u.label=nmOf(b); }
    else if(b.type==="cab"){ KEY="B-"+b.id; tall(fr.f,a0,a1,fr.back,d,0,Math.min(H-0.01,2.1)); u=UNITS[UNITS.length-1]; u.label=nmOf(b); }
    else { u=newUnit(b.type,fr.f,a0,a1,fr.back,d,y0,y1,{label:nmOf(b)}); curUid=u.id;
      if(b.type==="toilet"){ if(b.var==="hung"){ P(a0-0.08,a1+0.08,0,0.18,0,1.12,bathTileMat(w+0.16,1.12)); P(m-0.12,m+0.12,0.18,0.19,0.95,1.1,chrome); E(m,0.18+0.27,0.38,0.19,0.16,cer,1.4); E(m,0.18+0.27,0.465,0.195,0.02,M("#fdfdfd"),1.4); }
        else { P(m-0.18,m+0.18,0.01,0.19,0.42,0.8,cer); P(m-0.19,m+0.19,0,0.2,0.8,0.83,cer); P(m-0.02,m+0.02,0.08,0.12,0.83,0.84,chrome); E(m,0.4,0.2,0.12,0.4,cer,1.3); E(m,0.45,0.36,0.19,0.1,cer,1.35); E(m,0.45,0.415,0.195,0.02,M("#fdfdfd"),1.35); } }
      if(b.type==="bidet"){ E(m,0.3,0.2,0.12,0.4,cer,1.3); E(m,0.32,0.36,0.18,0.1,cer,1.3); cylAt(fr.f,m,fr.back+0.1*dr,0.46,0.015,0.1,chrome); }
      if(b.type==="basin"){ const br=Math.min(0.2,w/2-0.06), two=w>=1.2, cs=two?[a0+w/4,a1-w/4]:[m];
        if(b.var==="vanity"){ P(a0,a1,0,d-0.02,0.15,0.82,MAT.base); if(w>=0.8) drawers(fr.f,a0,a1,fr.back+(d-0.02)*dr,0.16,0.81,2); else doorPanels(fr.f,a0,a1,fr.back+(d-0.02)*dr,0.16,0.81,MAT.base,"top"); P(a0,a1,0,d,0.82,0.86,MAT.counter); }
        else { P(a0,a1,0,d,0.78,0.86,cer); cylAt(fr.f,m,fr.back+0.12*dr,0.62,0.025,0.32,chrome); if(b.var==="pedestal") E(m,0.2,0.39,0.1,0.78,cer,1); }
        for(const c of cs){ E(c,d*0.55,0.862,br,0.008,M("#dde3e7"),1.25); cylAt(fr.f,c,fr.back+0.05*dr,0.96,0.014,0.2,chrome); P(c-0.01,c+0.01,0.05,0.16,1.04,1.06,chrome); }
        if(b.mirror==="cab"){ P(a0,a1,0,0.14,1.15,1.85,MAT.base); P(a0+0.01,a1-0.01,0.14,0.145,1.16,1.84,M("#dde6eb",{metalness:0.15,roughness:0.05})); }
        else if(b.mirror!=="none") P(a0+0.03,a1-0.03,0,0.012,1.15,1.85,M("#dde6eb",{metalness:0.15,roughness:0.05}));
        if(b.mirror&&b.mirror!=="none") P(a0+0.1,a1-0.1,0,0.06,1.88,1.91,MAT.led); }
      if(b.type==="shower"){
        if(b.var==="walkin"){ P(a0,a1,0,d,0,0.008,M("#b7bec3",{roughness:0.5})); P(a0+0.05,a1-0.05,0.06,0.11,0.008,0.012,chrome); P(a0,a0+w*0.62,d-0.01,d,0.01,2.0,glass); P(a0,a0+w*0.62,d-0.012,d+0.002,1.97,2.0,frame); }
        else { if(b.var==="tray") P(a0,a1,0,d,0,0.05,cer); else P(a0,a1,0,d,0,0.02,cer); E(m,d/2,0.052,0.04,0.004,MAT.dark,1);
          if(b.var==="tray"){ P(a0,a1,d-0.01,d,0.05,2.0,glass); P(a0,a1,d-0.015,d+0.005,1.97,2.0,frame);
            if(a0>0.03) P(a0,a0+0.01,0,d,0.05,2.0,glass); if(a1<L-0.03) P(a1-0.01,a1,0,d,0.05,2.0,glass); }
          else { P(a0,a1,d-0.02,d,1.98,2.0,chrome); P(a0,a0+w*0.35,d-0.03,d-0.01,0.3,1.96,M("#dfe8ee",{transparent:true,opacity:0.85})); } }
        P(m-0.08,m+0.08,0,0.05,1.05,1.15,chrome); cylAt(fr.f,m,fr.back+0.03*dr,1.58,0.012,0.86,chrome); P(m-0.012,m+0.012,0.02,0.26,2.0,2.02,chrome); E(m,0.26,1.99,0.1,0.02,chrome,1); }
      if(b.type==="tub"){ P(a0,a1,0,d,0,0.56,cer); P(a0+0.06,a1-0.06,0.06,d-0.06,0.5,0.562,M("#dfeaf0",{roughness:0.1})); P(m-0.08,m+0.08,0,0.06,0.68,0.74,chrome); }
      if(b.type==="heater"){ if(b.var==="gas"){ P(m-0.18,m+0.18,0,0.22,y0,y0+0.6,cer); cylAt(fr.f,m,fr.back+0.11*dr,y0+0.8,0.05,0.4,chrome); }
        else { cylAt(fr.f,m,fr.back+0.23*dr,y0+0.36,0.22,0.72,cer); cylAt(fr.f,m-0.06,fr.back+0.1*dr,y0-0.1,0.012,0.2,chrome); cylAt(fr.f,m+0.06,fr.back+0.1*dr,y0-0.1,0.012,0.2,chrome); } }
      if(b.type==="dryer"){ P(a0+0.01,a1-0.01,0.02,d,0,0.85,cer); E(m,d+0.005,0.45,0.18,0.01,M("#3a4652"),1); P(a0+0.05,a1-0.05,d,d+0.004,0.72,0.8,M("#c9cfd4")); }
      if(b.type==="usink"){ P(a0,a1,0,d-0.02,0.1,0.85,MAT.base); doorPanels(fr.f,a0,a1,fr.back+(d-0.02)*dr,0.12,0.84,MAT.base,"top"); P(a0,a1,0,d,0.85,0.9,cer); P(a0+0.05,a1-0.05,0.08,d-0.05,0.9,0.902,M("#c9cfd4")); cylAt(fr.f,m,fr.back+0.05*dr,1.0,0.015,0.2,chrome); P(m-0.01,m+0.01,0.05,0.2,1.08,1.1,chrome); }
      if(b.type==="towel"){ for(const yy of [y0,y0+0.2]) P(a0,a1,0.05,0.07,yy,yy+0.02,chrome); P(a0,a0+0.02,0,0.07,y0,y0+0.22,chrome); P(a1-0.02,a1,0,0.07,y0,y0+0.22,chrome); }
      curUid=null; }
    if(u){ u.movable={obj:"bfix",id:b.id}; u.bt=b.type; }
    const labY={dryer:1.0,usink:1.1,toilet:0.95,bidet:0.6,basin:1.0,shower:2.15,tub:0.75,heater:y1+0.1,washer:1.0,cab:2.2,towel:y1+0.1}[b.type];
    appLabel(`${T.n} ${b.w}×${b.d}`,fr.f,m,Math.min(d,0.4),labY);
    if(!wallItem){ bodies.push({b,r:rectAO(b.wall,a0,a1,0,d),n:T.n});
      const fz=b.type==="toilet"||b.type==="bidet"?[m-0.38,m+0.38,d,d+0.6]:[a0,a1,d,d+(b.type==="washer"?0.5:0.6)];
      if(b.type==="shower"||b.type==="tub"){ const sw=Math.min(0.6,w), cands=[]; for(let s0=a0;s0<=a1-sw+0.001;s0+=0.05) cands.push(rectAO(b.wall,s0,s0+sw,d,d+0.6)); zones.push({b,n:T.n,strips:cands,over:d+0.6>spanOf(b.wall)+0.01}); }
      else if(b.type!=="cab") zones.push({b,n:T.n,r:rectAO(b.wall,fz[0],fz[1],fz[2],fz[3]),over:fz[3]>spanOf(b.wall)+0.01});
      if(b.type==="toilet"||b.type==="bidet"){ if(m-0.4<-0.001||m+0.4>L+0.001) warn.push(`${T.n}: لازم 20 سم على الأقل بينها وبين الحيطة اللي جنبها`); zones.push({b,n:T.n,side:true,r:rectAO(b.wall,m-0.4,m+0.4,0.02,d-0.05)}); }
      if(b.type==="shower"&&(b.w<80||b.d<80)) warn.push(`الشاور ${b.w}×${b.d} صغير، أقل مقاس مريح 80×80`); }
    curSide=null; curWall=null; }
  const inter=(p,q)=>Math.min(p.x1,q.x1)-Math.max(p.x0,q.x0)>0.01&&Math.min(p.z1,q.z1)-Math.max(p.z0,q.z0)>0.01;
  for(let i=0;i<bodies.length;i++) for(let j=i+1;j<bodies.length;j++) if(inter(bodies[i].r,bodies[j].r)) warn.push(`${bodies[i].n} راكب على ${bodies[j].n}`);
  const doorR=FEATS.filter(f=>(f.type==="door"||f.type==="opening")&&(f.d||0)>2).map(f=>({f,r:rectAO(f.wall,f.a0,f.a1,0,Math.max(0.05,f.dep))}));
  const colR=FEATS.filter(f=>f.type==="column"||(f.type==="shaft"||f.type==="stack")).map(f=>rectAO(f.wall,f.a0,f.a1,0,f.dep)).concat(CUTS.map(k=>({x0:k.x0,x1:k.x1,z0:k.z0,z1:k.z1})));
  for(const bd of bodies){ for(const d of doorR) if(inter(bd.r,d.r)) warn.push(`الباب هيخبط في ${bd.n}، غيّر مكانه أو خلّي الباب يفتح لبرة`); for(const c of colR) if(inter(bd.r,c)) warn.push(`${bd.n} راكب على بروز في الحيطة`); }
  const blocked=r=>bodies.some(bd=>inter(r,bd.r))||colR.some(c=>inter(r,c));
  for(const z of zones){ if(z.over){ warn.push(`مفيش 60 سم فاضية قدام ${z.n}`); continue; }
    if(z.strips){ if(!z.strips.some(r=>!bodies.some(bd=>bd.b!==z.b&&inter(r,bd.r))&&!colR.some(c=>inter(r,c)))) warn.push(`مفيش مكان 60×60 فاضي قدام ${z.n} تقف فيه`); continue; }
    for(const bd of bodies){ if(bd.b===z.b) continue; if(inter(z.r,bd.r)){ warn.push(z.side?`${z.n} لازقة في ${bd.n}، سيب 20 سم على الأقل`:`${bd.n} واخد المساحة اللي قدام ${z.n} (محتاج 60 سم)`); break; } }
    for(const c of colR) if(inter(z.r,c)){ warn.push(`بروز الحيطة قافل المساحة اللي قدام ${z.n}`); break; } }
  // ---------- plumbing & electric points ----------
  const fxOf=v=>Math.max(0,v/100-(v>0?FIN:0));
  let stack=null; const sf=FEATS.find(f=>f.type==="stack");
  if(sf){ const [x,z]=aoToXZ(sf.wall,(sf.a0+sf.a1)/2,sf.dep/2); stack={x,z,name:"عمود الصرف"}; }
  else if(cfg.drain&&W4.includes(cfg.drain.wall)){ const a=Math.min(wlen(cfg.drain.wall),fxOf(cfg.drain.pos)); const [x,z]=aoToXZ(cfg.drain.wall,a,0.05); stack={x,z,name:"الصرف الموجود"}; addPt("exist",cfg.drain.wall,a,0,"الصرف الموجود / العمود"); }
  if(cfg.water&&W4.includes(cfg.water.wall)) addPt("exist",cfg.water.wall,Math.min(wlen(cfg.water.wall),fxOf(cfg.water.pos)),cfg.water.y/100,"مخرج مية موجود");
  let fill=0, far=0;
  for(const u of UNITS){ const m=(u.a0+u.a1)/2, t=u.bt||u.kind;
    const drainAt=(o)=>{ if(!stack) return; const [x,z]=aoToXZ(u.wall,m,o); const L=Math.hypot(x-stack.x,z-stack.z); far=Math.max(far,L); const need=(t==="toilet"?13:8)+L*100*0.02; fill=Math.max(fill,need); };
    if(t==="toilet"){ if(u.label&&u.label.includes("معلقة")){ addPt("water",u.wall,m+0.15,1.0,"تغذية بوكس القاعدة المعلقة"); addPt("drain",u.wall,m,0.23,"صرف القاعدة 4 بوصة في الحيطة"); drainAt(0.05); }
      else { addPt("water",u.wall,m+0.18,0.2,"تغذية القاعدة (بارد)"); addPt("drain",u.wall,m,0,"صرف القاعدة 4 بوصة في الأرض، على بعد 30 سم من الحيطة"); drainAt(0.3); }
      addPt("water",u.wall,m-0.28,0.4,"شطاف القاعدة (سخن وبارد)"); }
    if(t==="bidet"){ addPt("water",u.wall,m,0.2,"تغذية الشطاف (سخن وبارد)"); addPt("drain",u.wall,m,0.15,"صرف الشطاف"); drainAt(0.2); }
    if(t==="basin"){ addPt("water",u.wall,m,0.55,"تغذية الحوض (سخن وبارد)"); addPt("drain",u.wall,m,0.45,"صرف الحوض 2 بوصة"); drainAt(0.05);
      { const cand=[Math.max(0.1,u.a0-0.3),Math.min(wlen(u.wall)-0.1,u.a1+0.3)], wet=bodies.filter(bd=>["shower","tub"].includes(bd.b.type)); const dist=a=>{ const [x,z]=aoToXZ(u.wall,a,0.02); return Math.min(9,...wet.map(bd=>Math.hypot(Math.max(bd.r.x0-x,0,x-bd.r.x1),Math.max(bd.r.z0-z,0,z-bd.r.z1)))); };
        addPt("socket",u.wall,dist(cand[0])>dist(cand[1])?cand[0]:cand[1],1.2,"بريزة مراية / سشوار"); } addPt("socket",u.wall,m,1.95,"إضاءة المراية"); }
    if(t==="shower"){ addPt("water",u.wall,m,1.1,"خلاط الشاور (سخن وبارد)"); addPt("water",u.wall,m,2.05,"مخرج الدش"); addPt("drain",u.wall,m,0,"صفاية الشاور"); drainAt(u.depth/2); }
    if(t==="tub"){ addPt("water",u.wall,m,0.7,"خلاط البانيو (سخن وبارد)"); addPt("drain",u.wall,u.a0+0.2,0,"صرف البانيو"); drainAt(0.3); }
    if(t==="washer"){ addPt("water",u.wall,u.a0+0.12,0.75,"حنفية الغسالة"); addPt("drain",u.wall,u.a0+0.25,0.6,"صرف الغسالة"); addPt("socket",u.wall,u.a1-0.12,1.3,"بريزة الغسالة (بأرضي، بعيدة عن المية)"); drainAt(0.1); }
    if(t==="dryer"){ addPt("socket",u.wall,u.a1-0.1,1.1,"بريزة المجفف على خط لوحده"); addPt("drain",u.wall,m,1.6,"خرطوم تهوية المجفف لبرة"); }
    if(t==="usink"){ addPt("water",u.wall,m,0.6,"تغذية حوض الغسيل (سخن وبارد)"); addPt("drain",u.wall,m,0.45,"صرف حوض الغسيل"); drainAt(0.05); }
    if(t==="heater"){ addPt("water",u.wall,m-0.06,u.y0-0.15,"دخول بارد للسخان"); addPt("water",u.wall,m+0.06,u.y0-0.15,"خروج سخن من السخان");
      if(u.label&&u.label.includes("غاز")) addPt("gas",u.wall,m,u.y0-0.3,"غاز السخان (ومدخنة لبرة)"); else addPt("socket",u.wall,m,Math.min(H-0.1,u.y1+0.12),"بريزة السخان على خط لوحده (فوقه)"); }
  }
  // floor drain in the middle of the free floor
  { let best=null; for(let i=1;i<8;i++) for(let j=1;j<8;j++){ const x=RW*i/8, z=RL*j/8; if(bodies.some(bd=>x>bd.r.x0-0.1&&x<bd.r.x1+0.1&&z>bd.r.z0-0.1&&z<bd.r.z1+0.1)) continue; const dd=Math.hypot(x-RW/2,z-RL/2); if(!best||dd<best[2]) best=[x,z,dd]; }
    if(best){ const g=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.006,20),chrome); g.position.set(best[0],0.004,best[1]); root.add(g); BATH_DRAIN=best; if(stack){ const L=Math.hypot(best[0]-stack.x,best[1]-stack.z); fill=Math.max(fill,8+L*100*0.02); } } }
  // exhaust fan
  { const win=FEATS.find(f=>f.type==="window"); if(win){ const [x,z]=aoToXZ(win.wall,(win.a0+win.a1)/2,-0.05); const fm=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),M("#e6e8ea")); fm.position.set(x,win.y1-0.14,z); fm.userData.side=win.wall; root.add(fm); addPt("socket",win.wall,Math.min(wlen(win.wall)-0.1,win.a1+0.15),Math.min(H-0.15,Math.max(2.3,win.y1)),"بريزة شفاط الشباك"); }
    else { const d=FEATS.find(f=>f.type==="door"); const w=d?OPP[d.wall]:"W"; addPt("socket",w,wlen(w)/2,H-0.35,"شفاط في الحيطة (مفيش شباك)"); warn.push("الحمام من غير شباك، لازم شفاط قوي طالع لبرة أو لمنور"); } }
  if(fill>25) warn.push(`الردم تحت البلاط هيوصل ${Math.round(fill)} سم عشان ميول الصرف، قرّب الأجهزة من العمود`);
  if(!stack) warn.push("حدد مكان الصرف الموجود أو عمود الصرف من تاب المية والكهربا عشان أحسب الميول");
  // socket safety near water
  for(const p of POINTS){ if(p.type!=="socket"||p.note.includes("إضاءة")) continue; const [x,z]=aoToXZ(p.wall,p.a,0.02); for(const bd of bodies){ if(!["shower","tub"].includes(bd.b.type)) continue; const dx=Math.max(bd.r.x0-x,0,x-bd.r.x1), dz=Math.max(bd.r.z0-z,0,z-bd.r.z1); if(Math.hypot(dx,dz)<0.6&&p.y<2.25){ warn.push(`${p.note} قريبة من ${bd.n} أقل من 60 سم، خطر`); break; } } }
  drawPts();
  // ---------- finishing quantities ----------
  let wallA=0; for(const w of W4){ let A=wlen(w)*top; for(const f of FEATS) if(f.wall===w&&["window","door","opening","niche"].includes(f.type)) A-=(f.a1-f.a0)*Math.max(0,Math.min(top,f.y1)-Math.min(top,f.y0)); wallA+=Math.max(0,A); } wallA=Math.max(0,wallA+cutPerimDelta()*top); /* angled cut walls are shorter than the two sides they replace */
  const floorA=RW*RL-cutArea(), ws=(1+cfg.waste/100); const tA=k=>{ const s=TSZ[k]||[0.6,0.6]; return s[0]*s[1]; };
  let wp=floorA+2*(RW+RL)*cfg.wpUp/100;
  for(const bd of bodies){ if(!["shower","tub"].includes(bd.b.type)) continue; const b=bd.b, L=wlen(b.wall); let len=b.w/100; const a0=Math.min(L-b.w/100,Math.max(0,b.pos/100)); if(a0<0.03) len+=b.d/100; if(a0+b.w/100>L-0.03) len+=b.d/100; wp+=len*Math.max(0,cfg.wpShower-cfg.wpUp)/100; }
  BATH={wallA,floorA,wallPcs:Math.ceil(wallA*ws/tA(cfg.wallTile)),floorPcs:Math.ceil(floorA*ws/tA(cfg.floorTile)),wp,fill:Math.round(fill),far,top};
  // clear floor
  let walk=null; for(const [p,q] of [["L","RT"],["W","D"]]){ const sp=p==="L"?RW:RL; for(const x of UNITS) for(const y of UNITS){ if(x.wall!==p||y.wall!==q||x.y0>1||y.y0>1) continue; if(Math.min(x.a1,y.a1)-Math.max(x.a0,y.a0)>0.05){ const g=sp-x.depth-y.depth; if(walk===null||g<walk) walk=g; } } }
  if(walk===null){ for(const u of UNITS) if(u.y0<1){ const g=spanOf(u.wall)-u.depth; if(walk===null||g<walk) walk=g; } } if(walk===null) walk=Math.min(RW,RL);
  const wc=Math.round(walk*100); if(wc<60) warn.push(`أضيق مسافة للحركة ${wc} سم، الأحسن 70 سم على الأقل`);
  return {walk:wc,counter:0};
}
let BATH_DRAIN=null;
function buildHall(warn){ drawPts(); const w=Math.round(Math.min(RW,RL)*100); if(w<90) warn.push(`عرض الطرقة ${w} سم، الأحسن 100 سم أو أكتر`); return {walk:w,counter:0}; }
function bathBox(el){
  el=el||ctlEl;
  const ar=document.createElement("div"); ar.className="addrow"; const ts=document.createElement("select");
  for(const [k,v] of Object.entries(BFIX)){ const o=document.createElement("option"); o.value=k; o.textContent=v.n; ts.appendChild(o); }
  const ws=document.createElement("select"); for(const [k,v] of W4OPT()){ const o=document.createElement("option"); o.value=k; o.textContent=v; ws.appendChild(o); } ws.value="L";
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕";
  ab.onclick=()=>{ pushHist(); const T=BFIX[ts.value]; const L=Math.round(wlen(ws.value)*100); const b={id:"f"+Math.random().toString(36).slice(2,6),type:ts.value,wall:ws.value,pos:Math.max(0,Math.round((L-T.w)/2)),w:T.w,d:T.d}; if(T.var) b.var=T.var[0][0]; if(T.wallY) b.y=T.wallY; if(ts.value==="basin") b.mirror="mirror"; cfg.bfix=[...(cfg.bfix||[]),b]; build(); UI_REFRESH(); hint(`اتضاف ${T.n} ✓`); };
  ar.append(ts,ws,ab); el.appendChild(ar);
  const n=document.createElement("div"); n.className="note"; n.textContent="اسحب أي جهاز بصباعك في الـ3D عشان تحركه على الحيطة. المكان بيتقاس من أول الحيطة."; el.appendChild(n);
  for(const b of cfg.bfix||[]){ const T=BFIX[b.type]; if(!T) continue; const lim=BLIM[b.type];
    const card=document.createElement("div"); card.className="card"; const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${T.n}</b>`;
    const del=document.createElement("button"); del.className="btn"; del.textContent="🗑 شيل"; del.onclick=()=>{ pushHist(); cfg.bfix=cfg.bfix.filter(x=>x!==b); build(); UI_REFRESH(); }; hd.appendChild(del); card.appendChild(hd);
    if(T.var) objSelect(card,b,"var","النوع",T.var);
    objSelect(card,b,"wall","على أنهي حيطة",W4OPT());
    objRange(card,b,"pos","بعده عن أول الحيطة",0,Math.max(1,Math.round(wlen(b.wall)*100)-b.w),1);
    objRange(card,b,"w",b.type==="shower"||b.type==="tub"?"الطول على الحيطة":"العرض",lim[0],lim[1],1);
    if(!["toilet","bidet","towel"].includes(b.type)) objRange(card,b,"d","العمق",lim[2],lim[3],1);
    if(T.wallY) objRange(card,b,"y","ارتفاعه من الأرض",40,220,1);
    if(b.type==="basin") objSelect(card,b,"mirror","فوقه",[["mirror","مراية"],["cab","دولاب بمراية"],["none","ولا حاجة"]]);
    el.appendChild(card); }
}
function finishBox(){
  if(!BATH) return; const B=BATH, f=v=>v.toFixed(1);
  const cost=(B.wallA+B.floorA)*(1+cfg.waste/100)*cfg.pTile+B.wp*cfg.pWP+(B.wallA+B.floorA)*cfg.pLabor;
  const d=document.createElement("div"); d.className="sum";
  d.innerHTML=`🧱 سيراميك الحيطان: <b>${f(B.wallA)} م²</b> (${B.wallPcs} بلاطة ${cfg.wallTile} بالهالك)<br>⬜ الأرضية: <b>${f(B.floorA)} م²</b> (${B.floorPcs} بلاطة ${cfg.floorTile})<br>💧 العزل: <b>${f(B.wp)} م²</b> <small>(الأرضية + ${cfg.wpUp} سم على الحيطان + ${cfg.wpShower} سم في الشاور)</small><br>📐 الردم تحت البلاط حوالي <b>${B.fill} سم</b> <small>(ميول 2% للصرف)</small>`+(cost>0?`<hr>التكلفة التقريبية: <b>${Math.round(cost).toLocaleString("ar-EG")} جنيه</b>`:`<hr><small>اكتب الأسعار تحت والتكلفة هتتحسب لوحدها.</small>`);
  ctlEl.insertBefore(d,ctlEl.firstChild);
}
