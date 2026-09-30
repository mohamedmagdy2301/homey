// =================== LIGHTING, CEILINGS, ACCENT WALLS, CURTAINS ===================
const LUX={kitchen:300,bath:200,hall:100,room:150,bed:120,living:150,shop:500};
let LIGHTQ={n:0,lux:0};
function lightPlan(){ const area=RW*RL-cutArea(), lux=cfg.roomType==="room"?(LUX[cfg.rtype]||LUX.living):(LUX[cfg.roomType||"kitchen"]||150); let n=Math.max(1,Math.ceil(area*lux/450)); if(cfg.chand&&cfg.roomType==="room") n=Math.max(1,Math.round(n*0.6));
  const nx=Math.max(1,Math.round(Math.sqrt(n*RW/RL))), nz=Math.max(1,Math.ceil(n/nx)), pts=[]; for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=RW*(i+0.5)/nx, z=RL*(j+0.5)/nz; if(!inCut(x,z,0.15)) pts.push([x,z]); }
  LIGHTQ={n:pts.length,lux,pts,area}; return pts; }
function finishesRender(){
  if(cfg.roomType!=="room"&&cfg.roomType!=="hall") return;
  // accent wall
  if(cfg.accent&&W4.includes(cfg.accent)){ const w=cfg.accent, L=wlen(w), hs=FEATS.filter(f=>f.wall===w&&["window","door","opening","niche","railing"].includes(f.type)).sort((p,q)=>p.a0-q.a0); curSide=w;
    const ac=cfg.cAccent||"#8a6a4a", mat=cfg.accentT==="stone"?new THREE.MeshStandardMaterial({map:makeTex("subway",ac,L/0.4,H/0.2),roughness:0.9}):cfg.accentT==="paper"?new THREE.MeshStandardMaterial({map:makeTex("tiles",ac,L/0.53,H/0.53),roughness:0.8}):M(ac,{roughness:0.6});
    const seg=(s0,s1,y0,y1)=>{ if(s1-s0<0.02||y1-y0<0.02) return; if(cfg.accentT==="wood"){ for(let x=s0;x<s1-0.01;x+=0.06) boxAO(w,x,Math.min(s1,x+0.04),0.004,0.025,y0,y1,mat); } else boxAO(w,s0,s1,0.004,0.012,y0,y1,mat); };
    let a=0; for(const f of hs){ seg(a,f.a0,0,H); seg(Math.max(a,f.a0),f.a1,0,f.y0); seg(Math.max(a,f.a0),f.a1,f.y1,H); a=Math.max(a,f.a1); } seg(a,L,0,H); curSide=null; }
  // curtains
  if(cfg.curtains) for(const f of FEATS.filter(x=>x.type==="window")){ const cm=M(cfg.cCurtain||"#d8cbb6",{roughness:1,transparent:true,opacity:0.92}); curSide=f.wall; const L=wlen(f.wall), top=Math.min(H-0.03,f.y1+0.25);
    boxAO(f.wall,Math.max(0,f.a0-0.3),Math.min(L,f.a1+0.3),0.1,0.12,top,top+0.02,MAT.steel);
    const shut=FP.on&&WALK.curtClosed; /* walk mode: tap the window to draw the curtains */
    for(const [s0,s1] of shut?[[Math.max(0,f.a0-0.28),Math.min(L,f.a1+0.28)]]:[[Math.max(0,f.a0-0.28),f.a0+0.12],[f.a1-0.12,Math.min(L,f.a1+0.28)]]) for(let x=s0;x<s1-0.01;x+=0.08){ boxAO(f.wall,x,x+0.05,0.06,0.1,0.02,top,cm).userData.curt=true; boxAO(f.wall,x+0.04,x+0.08,0.09,0.13,0.02,top,cm).userData.curt=true; } curSide=null; }
  // chandelier
  if(cfg.chand&&cfg.roomType==="room"){ const cx=RW/2, cz=RL/2; cyl(0.01,0.5,cx,H-0.25,cz,MAT.dark); const sh=cyl(0.28,0.22,cx,H-0.6,cz,M("#f3e7c9",{emissive:0x332a10})); for(let i=0;i<6;i++){ const t=i*Math.PI/3; cyl(0.04,0.08,cx+Math.cos(t)*0.34,H-0.62,cz+Math.sin(t)*0.34,M("#fff6dc",{emissive:0x554422})); } }
}
function genQuant(){
  const per=2*(RW+RL)+cutPerimDelta(); let wallA=per*H; for(const f of FEATS) if(["window","door","opening","railing"].includes(f.type)) wallA-=(f.a1-f.a0)*(f.y1-f.y0);
  const doorsW=FEATS.filter(f=>f.type==="door"||f.type==="opening"||f.type==="railing").reduce((x,f)=>x+(f.a1-f.a0),0), floorA=RW*RL-cutArea(), ceilA=floorA;
  let tiledA=0; if(cfg.roomType==="bath"&&BATH) tiledA=BATH.wallA; else if((cfg.roomType||"kitchen")==="kitchen") tiledA=Math.min(wallA,(STATS.counter||0)/100*0.7);
  let accentA=0; if(cfg.accent&&W4.includes(cfg.accent)&&(cfg.roomType==="room"||cfg.roomType==="hall")){ accentA=wlen(cfg.accent)*H; for(const f of FEATS) if(f.wall===cfg.accent&&["window","door","opening","railing"].includes(f.type)) accentA-=(f.a1-f.a0)*(f.y1-f.y0); }
  const paintA=Math.max(0,wallA-tiledA-accentA)+ceilA, skirt=cfg.roomType==="bath"?0:Math.max(0,per-doorsW);
  return {floorA,wallA,ceilA,tiledA,accentA,paintA,liters:Math.ceil(paintA*(cfg.paintCoats||2)/10),skirt,spots:LIGHTQ.n,floorPcs:Math.ceil(floorA*1.1/((TSZ[cfg.floorTile]||[0.6,0.6])[0]*(TSZ[cfg.floorTile]||[0.6,0.6])[1]))};
}
let QTY=null;