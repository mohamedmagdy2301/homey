// =================== CAMERA ===================
const target=new THREE.Vector3(0.9,0.5,2.3); let sph={r:6,theta:0.25,phi:0.7};
const VIEWS={
  out:{name:"منظر عام",t:()=>[RW/2,0.5,RL*0.575],s:{r:6,theta:0.25,phi:0.7},fit:true},
  plan:{name:"من فوق (مسقط)",t:()=>[RW/2,0,RL*0.55],s:{r:7,theta:0,phi:0.06},fit:true},
  door:{name:"واقف على الباب",dyn:()=>{ const d=FEATS.find(f=>f.type==="door"||f.type==="opening"); if(!d) return {t:[RW/2,1.35,RL/2],s:{r:2.5,theta:0,phi:1.5}}; const m=(d.a0+d.a1)/2, [tx,tz]=aoToXZ(d.wall,m,Math.min(1.6,spanOf(d.wall)*0.6)), [dx,dz]=aoToXZ(d.wall,m,0.15); return {t:[tx,1.35,tz],s:{r:Math.hypot(dx-tx,dz-tz),theta:Math.atan2(dx-tx,dz-tz),phi:1.5}}; }},
  vW:{name:"قدام الحيطة القدامية",t:()=>[RW/2,1.3,0.3],s:{r:3,theta:0.02,phi:1.42},sideW:"W"},
  vRT:{name:"قدام الحيطة اليمين",t:()=>[RW-0.2,1.3,RL/2],s:{r:3,theta:-Math.PI/2+0.02,phi:1.42},sideW:"RT"},
  vD:{name:"قدام الحيطة اللي ورا",t:()=>[RW/2,1.3,RL-0.3],s:{r:3,theta:Math.PI-0.02,phi:1.42},sideW:"D"},
  vL:{name:"قدام الحيطة الشمال",t:()=>[0.3,1.3,RL/2],s:{r:3,theta:Math.PI/2-0.02,phi:1.42},sideW:"L"},
  niche:{name:"الفجوات والتجاويف",dyn:()=>{ const nf=FEATS.find(f=>f.type==="niche"||f.type==="corridor"); if(!nf) return {t:[RW/2,1,RL/2],s:{r:6,theta:0.3,phi:0.8}}; const m=(nf.a0+nf.a1)/2, [x,z]=aoToXZ(nf.wall,m,nf.type==="corridor"?-0.1-nf.dep/2:-nf.dep/2), [cx,cz]=aoToXZ(nf.wall,m,1.5); return {t:[x,1.2,z],s:{r:2.8,theta:Math.atan2(cx-x,cz-z)+0.35,phi:1.3}}; }}
};
VIEWS.walk={name:"🚶 امشي جوه المطبخ",fp:true};
let view="out"; const FP={on:false,x:0.9,z:2,yaw:0,pitch:-0.1,eye:1.6};
function unitRect(u){ const dr=dirOf(u.f), b=u.back, e=u.back+dr*u.depth; return alongZ(u.f)?{x0:Math.min(b,e),x1:Math.max(b,e),z0:u.a0,z1:u.a1}:{x0:u.a0,x1:u.a1,z0:Math.min(b,e),z1:Math.max(b,e)}; }
function fpFree(x,z,m,wm){ if(APT3D) return aptFree(x,z,m); m=m==null?0.12:m; if(inCut(x,z,wm==null?0.15:wm)) return false; wm=wm==null?0.18:wm; if(x<wm||x>RW-wm||z<wm||z>RL-wm) return false; for(const u of UNITS){ if(u.y0>1||!(W4.includes(u.wall)||u.wall==="IS"||(u.wall==="FR"&&u.ft!=="rug"))) continue; const r=unitRect(u); if(x>r.x0-m&&x<r.x1+m&&z>r.z0-m&&z<r.z1+m) return false; } for(const f of FEATS) if(f.type==="column"||(f.type==="shaft"||f.type==="stack")){ const r=rectAO(f.wall,f.a0,f.a1,0,f.dep); if(x>r.x0-m&&x<r.x1+m&&z>r.z0-m&&z<r.z1+m) return false; } return true; }
function fpMove(k){ fpStep(Math.sin(FP.yaw)*k,Math.cos(FP.yaw)*k); }
function fpStep(dx,dz){ const nx=FP.x+dx, nz=FP.z+dz; if(fpFree(nx,nz)||!fpFree(FP.x,FP.z)) /* started inside furniture: let them walk out */{ FP.x=nx; FP.z=nz; } else if(fpFree(nx,FP.z)) FP.x=nx; else if(fpFree(FP.x,nz)) FP.z=nz; }
function enterWalk(){ view="walk"; FP.on=true; let x=RW/2, z=RL/2; const d=FEATS.find(f=>f.type==="door"||f.type==="opening");
  if(d){ for(let o=0.35;o<=2.5;o+=0.1){ const [px,pz]=aoToXZ(d.wall,(d.a0+d.a1)/2,o); if(fpFree(px,pz)){ x=px; z=pz; break; } } }
  else { let best=null; for(let i=1;i<10;i++) for(let j=1;j<10;j++){ const px=RW*i/10, pz=RL*j/10; if(fpFree(px,pz)){ const dd=Math.hypot(px-RW/2,pz-RL/2); if(!best||dd<best[2]) best=[px,pz,dd]; } } if(best){ x=best[0]; z=best[1]; } }
  FP.x=x; FP.z=z; const far=d?aoToXZ(d.wall,(d.a0+d.a1)/2,spanOf(d.wall)):[RW/2,RL/2]; FP.yaw=Math.atan2(far[0]-x,far[1]-z); FP.pitch=-0.12;
  document.getElementById("pad").style.display="grid"; hint("🚶 دوس على الأرض تروح هناك • اسحب تبص حواليك • الدايرة تحت للمشي",5000); }
function fitR(v){ const vf=camera.fov*Math.PI/360, hf=Math.atan(Math.tan(vf)*camera.aspect);
  return Math.max(v.s.r,(RW/2+1.5)/Math.tan(hf),(RL/2+1.4)/Math.tan(vf)); }
let camTouched=false; /* user orbited/zoomed: resize() keeps their camera */
function setView(k){ if(VIEWS[k].fp){ enterWalk(); return; } camTouched=false; if(FP.on){ FP.on=false; document.getElementById("pad").style.display=cfg.walkPad?"grid":"none"; } view=k; const v0=VIEWS[k]; const v=v0.dyn?{...v0,...v0.dyn()}:v0; target.set(...(typeof v.t==="function"?v.t():v.t)); sph={...v.s}; if(v.fit)sph.r=fitR(v); if(v.side){ const vf=camera.fov*Math.PI/360, hf=Math.atan(Math.tan(vf)*camera.aspect); sph.r=Math.max(v.s.r,(RL/2+0.1)/Math.tan(hf),1.6/Math.tan(vf)); } if(v.sideW){ const vf=camera.fov*Math.PI/360, hf=Math.atan(Math.tan(vf)*camera.aspect); sph.r=Math.max(v.s.r,(wlen(v.sideW)/2+0.15)/Math.tan(hf),1.6/Math.tan(vf)); } }
function updateCam(){
  { const wf=FP.on?75:55; if(camera.fov!==wf){ camera.fov=wf; camera.updateProjectionMatrix(); } }
  if(FP.on){ FP.pitch=Math.max(-1.2,Math.min(1.1,FP.pitch)); camera.position.set(FP.x,FP.eye,FP.z);
    camera.lookAt(FP.x+Math.sin(FP.yaw)*Math.cos(FP.pitch),FP.eye+Math.sin(FP.pitch),FP.z+Math.cos(FP.yaw)*Math.cos(FP.pitch)); }
  else { sph.phi=Math.max(0.03,Math.min(1.62,sph.phi)); sph.r=Math.max(0.5,Math.min(APT3D?60:20,sph.r));
  camera.position.set(target.x+sph.r*Math.sin(sph.phi)*Math.sin(sph.theta), target.y+sph.r*Math.cos(sph.phi), target.z+sph.r*Math.sin(sph.phi)*Math.cos(sph.theta));
  camera.lookAt(target); }
  const showL=!FP.on&&sph.r>3.6; root.children.forEach(o=>{ if(o.userData.label) o.visible=showL&&!o.userData.hid; });
  const p=camera.position, over=p.y>H;
  if(APT3D){ root.children.forEach(o=>{ if(o.userData.label) o.visible=false; }); return; }
  if(showL) lblTick();
  const fade=(g,hide)=>{ if(!g||!g.userData.mat)return; const hd=cfg.walls==="ghost"?true:cfg.walls==="solid"?false:hide; g.userData.mat.opacity=hd?0.1:1; g.userData.mat.depthWrite=!hd; for(const c of g.children) if(c.userData.wf) c.visible=!hd; };
  fade(walls.front,p.z<0); fade(walls.left,p.x<0||over); fade(walls.right,p.x>RW||over); fade(walls.back,p.z>RL||over); fade(walls.top,p.y>H-0.05);
  const sol=cfg.walls==="solid", hs={W:!sol&&p.z<-0.1,RT:!sol&&p.x>RW+0.1,D:!sol&&p.z>RL+0.1,L:!sol&&p.x<-0.1};
  for(const o of root.children){ const sd=o.userData.side; if(sd) o.visible=!hs[sd]; }
}
/* 3D labels that overlap on screen: keep the higher userData.prio (then the nearer one) and hide the rest.
   Runs every LBL_EVERY camera frames while moving, plus once shortly after the camera stops, and right away after a rebuild. */
const LBL_EVERY=6, lblV=new THREE.Vector3(), lblC=new THREE.Vector3(); let lblN=0, lblKey="", lblT=null, lblRuns=0;
function lblKeyNow(){ const c=camera.position; return [c.x,c.y,c.z,target.x,target.y,target.z,camera.fov,camera.aspect].map(v=>v.toFixed(3)).join()+","+canvas.clientWidth+"x"+canvas.clientHeight; }
function lblTick(){ const k=lblKeyNow(), fresh=root.children.some(o=>o.userData.label&&o.userData.hid===undefined); /* fresh = labels from a new build, never checked */
  if(k===lblKey&&!fresh) return; clearTimeout(lblT);
  if(fresh||++lblN>=LBL_EVERY) declutterLabels(); else lblT=setTimeout(()=>{ if(APT3D||FP.on) return; declutterLabels(); poke(1); },160); }
function declutterLabels(){ lblN=0; lblKey=lblKeyNow(); lblRuns++;
  camera.updateMatrixWorld(); root.updateMatrix(); const cw=canvas.clientWidth, ch=canvas.clientHeight, ppu=ch/(2*Math.tan(camera.fov*Math.PI/360)), keep=[];
  const R=root.children.filter(o=>o.userData.label).map(o=>{ o.userData.hid=false; lblV.copy(o.position).applyMatrix4(root.matrix); const z=-lblC.copy(lblV).applyMatrix4(camera.matrixWorldInverse).z; if(z<0.05) return null;
    lblV.project(camera); const s=ppu/z; return {o,x:(lblV.x+1)/2*cw,y:(1-lblV.y)/2*ch,w:o.scale.x*s/2+2,h:o.scale.y*s/2+2,p:o.userData.prio||0,s}; }).filter(Boolean).sort((a,b)=>b.p-a.p||b.s-a.s);
  for(const r of R){ if(keep.some(k=>Math.abs(k.x-r.x)<k.w+r.w&&Math.abs(k.y-r.y)<k.h+r.h)){ r.o.userData.hid=true; r.o.visible=false; } else { r.o.visible=true; keep.push(r); } } }
const pts=new Map(); let lastPinch=0, tapStart=null, drag=null;
const ray=new THREE.Raycaster();
let hintT=null; function hint(msg,ms){ const h=document.getElementById("hint"); h.textContent=msg; h.style.opacity=1; clearTimeout(hintT); if(ms!==0) hintT=setTimeout(()=>h.style.opacity=0,ms||2600); }
function castAt(cx,cy){ const r=canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1),camera); return ray.intersectObjects(APT3D?[root,...aptRoots]:root.children,true); }
function visibleHit(h){ let o=h.object; while(o&&o!==root){ if(!o.visible) return false; o=o.parent; } const m=h.object.material; if(h.object.userData.label||!h.object.isMesh) return false; if(m && m.transparent && m.opacity<0.3) return false; return true; }
function hitUnit(cx,cy){ for(const h of castAt(cx,cy)){ if(!visibleHit(h)) continue; let o=h.object; while(o && !o.userData.uid && o.parent && o.parent!==root) o=o.parent; if(o && o.userData.uid) return {uid:o.userData.uid,point:h.point}; return null; } return null; }
function pick(cx,cy){ if(FP.on){ walkTap(cx,cy); return; } if(APT3D) return; const h=hitUnit(cx,cy); if(h) selectUnit(h.uid,true); }
// ---- measure tape ----
let measure=false, mPts=[]; const measureG=new THREE.Group(); scene.add(measureG);
function spriteLabel(text,pos,color){ const c=document.createElement("canvas"), ctx=c.getContext("2d"); const fs=44; ctx.font=`bold ${fs}px Tahoma,Arial`; const w=ctx.measureText(text).width+40; c.width=w; c.height=fs+30;
  ctx.font=`bold ${fs}px Tahoma,Arial`; ctx.fillStyle=color; ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(0,0,w,c.height,18); else ctx.rect(0,0,w,c.height); ctx.fill(); ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(text,w/2,c.height/2+2);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false})); const k=0.0024; sp.scale.set(w*k,c.height*k,1); sp.position.copy(pos); sp.renderOrder=30; return sp; }
function clearMeasure(){ while(measureG.children.length){ const o=measureG.children.pop(); if(o.geometry)o.geometry.dispose(); if(o.material){ if(o.material.map)o.material.map.dispose(); o.material.dispose(); } } mPts=[]; }
function measurePick(cx,cy){
  const h=castAt(cx,cy).find(visibleHit); if(!h) return;
  if(mPts.length>=2) clearMeasure();
  const p=h.point.clone(); mPts.push(p);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.025,12,8),new THREE.MeshBasicMaterial({color:0xb07a35,depthTest:false})); dot.position.copy(p); dot.renderOrder=29; measureG.add(dot);
  if(mPts.length===2){ const [a,b]=mPts; const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0xb07a35,depthTest:false})); ln.renderOrder=29; measureG.add(ln);
    const cm=Math.round(a.distanceTo(b)*100); measureG.add(spriteLabel(`${cm} سم`,a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0,0.06,0)),"#b07a35")); hint(`المسافة ${cm} سم • دوس على نقطتين تانيين للقياس من جديد`,4000); }
  else hint("دوس على النقطة التانية",0);
}
document.getElementById("measBtn").onclick=()=>{ measure=!measure; document.getElementById("measBtn").classList.toggle("on",measure); if(measure){ hint("📏 دوس على أي نقطتين وهقولك المسافة بينهم",0); } else { clearMeasure(); hint("اتقفل شريط القياس"); } };
// ---- drag appliances / units ----
function startDrag(e){
  const h=hitUnit(e.clientX,e.clientY); if(!h) return false;
  const u=UNITS.find(x=>x.id===h.uid); if(!u || !(u.tok||u.movable)) return false;
  if(u.furn){ const it=(cfg.furn||[]).find(x=>x.id===u.furn); if(!it) return false; drag={u,it,free:true,plane:new THREE.Plane(new THREE.Vector3(0,1,0),-h.point.y),sx:h.point.x,sz:h.point.z,dx:0,dz:0,meshes:[],moved:false};
    root.traverse(o=>{ if(o.isMesh && o.userData.uid===u.id) drag.meshes.push([o,o.position.clone()]); }); return true; }
  const az=alongZ(u.f), n=az?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1), c=az?h.point.x:h.point.z;
  drag={u,plane:new THREE.Plane(n,-c),az,start:az?h.point.z:h.point.x,delta:0,meshes:[],moved:false};
  root.traverse(o=>{ if(o.isMesh && o.userData.uid===u.id) drag.meshes.push([o,o.position.clone()]); });
  return true;
}
function moveDrag(e){ castAt(e.clientX,e.clientY); const v=new THREE.Vector3(); if(!ray.ray.intersectPlane(drag.plane,v)) return;
  if(drag.free){ let dx=v.x-drag.sx, dz=v.z-drag.sz; if(drag.it.snap){ if(drag.it.snap==="W"||drag.it.snap==="D") dz=0; else dx=0; } drag.dx=dx; drag.dz=dz; if(Math.hypot(dx,dz)>0.03) drag.moved=true;
    for(const [o,p0] of drag.meshes){ o.position.x=p0.x+dx; o.position.z=p0.z+dz; } if(drag.moved) hint(`${FURN[drag.it.type].n}`,0); return; }
  drag.delta=(drag.az?v.z:v.x)-drag.start; if(Math.abs(drag.delta)>0.03) drag.moved=true;
  for(const [o,p0] of drag.meshes){ if(drag.az) o.position.z=p0.z+drag.delta; else o.position.x=p0.x+drag.delta; }
  if(drag.moved) hint(`${drag.u.label||KN[drag.u.kind]}: ${drag.delta>0?"+":""}${Math.round(drag.delta*100)} سم`,0); }
function endDrag(){
  if(drag.free){ const {it,dx,dz,moved}=drag; drag=null; if(!moved) return false; pushHist();
    if(it.snap){ const L=Math.round(wlen(it.snap)*100); it.pos=Math.max(0,Math.min(L-it.w,Math.round((it.pos||0)+((it.snap==="W"||it.snap==="D")?dx:dz)*100))); }
    else { it.x=Math.max(0,Math.min(Math.round(RW*100),Math.round((it.x||0)+dx*100))); it.z=Math.max(0,Math.min(Math.round(RL*100),Math.round((it.z||0)+dz*100))); }
    cfg.furn=[...cfg.furn]; build(); if(panelOpen) renderControls(); hint("اتنقلت ✓"); return true; }
  const {u,delta,moved}=drag; drag=null; if(!moved) return false;
  pushHist();
  if(u.tok){ const run=UNITS.filter(x=>x.tok&&x.wall===u.wall); const arr=run.map(x=>({t:x.tok,c:(x.a0+x.a1)/2+(x===u?delta:0)})); arr.sort((p,q)=>p.c-q.c); cfg.seq={...cfg.seq,[u.wall]:arr.map(x=>x.t)}; hint("اتغير الترتيب ✓"); }
  else if(u.movable){ const list=cfg[u.movable.obj]; const o=list.find(x=>x.id===u.movable.id); if(o){ const fr=frameOf(u.wall), len=fr.len; o.pos=Math.max(0,Math.min(Math.round((len-(u.a1-u.a0))*100),Math.round((u.a0+delta-fr.base0)*100))); cfg[u.movable.obj]=[...list]; hint(`اتنقلت لـ ${o.pos} سم ✓`); } }
  build(); if(panelOpen) renderControls(); return true;
}
canvas.addEventListener("pointerdown",e=>{ canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(!measure) document.getElementById("hint").style.opacity=0;
  tapStart=pts.size===1?{x:e.clientX,y:e.clientY,t:performance.now()}:null;
  if(pts.size===1 && cfg.dragOn && !measure && !FP.on && !APT3D) startDrag(e); else if(drag){ for(const [o,p0] of drag.meshes) o.position.copy(p0); drag=null; } });
canvas.addEventListener("pointermove",e=>{
  if(!pts.has(e.pointerId))return; const pr=pts.get(e.pointerId), c={x:e.clientX,y:e.clientY}; pts.set(e.pointerId,c);
  if(drag && pts.size===1){ moveDrag(e); return; }
  if(pts.size===1){ if(FP.on){ const dy=(c.x-pr.x)*0.006; FP.yaw+=dy; if(WALK.gyro&&WALK.gyro.off!=null) WALK.gyro.off+=dy; else FP.pitch+=(c.y-pr.y)*0.005; } else { sph.theta-=(c.x-pr.x)*0.008; sph.phi-=(c.y-pr.y)*0.006; camTouched=true; } }
  else if(pts.size===2){ const [a,b]=[...pts.values()]; const dd=Math.hypot(a.x-b.x,a.y-b.y); if(lastPinch){ if(FP.on) fpMove((dd-lastPinch)*0.01); else { sph.r*=lastPinch/dd; camTouched=true; } } lastPinch=dd; }
});
const up=e=>{
  let handled=false; if(drag) handled=endDrag();
  if(!handled && tapStart && pts.size===1){ const dx=e.clientX-tapStart.x, dy=e.clientY-tapStart.y; if(Math.hypot(dx,dy)<7 && performance.now()-tapStart.t<450){ if(measure) measurePick(e.clientX,e.clientY); else pick(e.clientX,e.clientY); } }
  tapStart=null; pts.delete(e.pointerId); if(pts.size<2)lastPinch=0;};
canvas.addEventListener("pointerup",up);
canvas.addEventListener("pointercancel",e=>{ if(drag){ for(const [o,p0] of drag.meshes) o.position.copy(p0); drag=null; hint("",1); } /* the system took the touch: undo the half-done drag instead of saving it */
  tapStart=null; pts.delete(e.pointerId); if(pts.size<2)lastPinch=0; });
canvas.addEventListener("wheel",e=>{e.preventDefault(); if(FP.on) fpMove(-e.deltaY*0.002); else { sph.r*=1+e.deltaY*0.001; camTouched=true; }},{passive:false});
