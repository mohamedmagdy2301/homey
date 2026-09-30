// =================== WALK MODE EXTRAS ===================
/* Everything on top of the basic first-person walk (FP in 14-camera): tap the floor to go there (A* around furniture), a joystick,
   eye height, the phone's gyroscope, ready stand points, a card for the tapped piece, floor warnings for tight spots, a minimap,
   cabinets that open with a swing, a light switch, day/night, curtains, footstep sounds, and the room name in the apartment.
   Loaded before 15-ui.js so WALK exists at the first build(). Nothing here changes cfg except the card's edits and "add curtains". */
const WALK={on:false,path:null,fly:null,joy:{x:0,y:0,id:null},keys:new Set(),eye:"stand",gyro:null,warnOn:true,lightsOff:false,night:null,curtClosed:false,
  mute:false,room:null,roomT:0,stepAcc:0,anims:[],grid:null,nav:null,base:null,card:null,lastT:0,mapKey:"",nWarn:0};
const EYES={stand:[1.6,"واقف","🧍"],sit:[1.15,"قاعد","🪑"],kid:[1.1,"طفل","🧒"]};
try{ WALK.mute=localStorage.getItem("kitchen3d/walkMute")==="1"; }catch(e){}
let walkG=new THREE.Group(); scene.add(walkG); /* floor warnings + switches, remade on every build */
const walkFx=new THREE.Group(); scene.add(walkFx); /* the goal ring and swinging doors, which outlive a build */

// ---------- UI ----------
const wEl=(tag,id,html)=>{ const e=document.createElement(tag); if(id) e.id=id; if(html) e.innerHTML=html; document.getElementById("stage").appendChild(e); return e; };
const wbar=wEl("div","wbar"), wmap=wEl("canvas","wmap"), joy=wEl("div","joy","<i></i>"), wcard=wEl("div","wcard"), wplaces=wEl("div","wplaces");
wbar.setAttribute("role","toolbar"); wbar.setAttribute("aria-label","أدوات المشي"); wmap.setAttribute("aria-label","خريطة صغيرة، دوس عليها تروح المكان ده");
const WBTN=[["places","📍","أماكن جاهزة"],["eye","🧍","ارتفاع العين"],["gyro","📱","بص بحركة الموبايل"],["meas","📏","شريط قياس"],["warn","⚠️","أماكن ضيقة"],
  ["night","🌙","نهار / ليل"],["light","💡","النور"],["curt","🪟","الستاير"],["snd","🔊","الصوت"]];
wbar.innerHTML=WBTN.map(([k,i,t])=>`<button class="btn icon" data-w="${k}" aria-label="${t}" title="${t}"><span class="wi">${i}</span><b></b></button>`).join("");
const wb=k=>wbar.querySelector(`[data-w="${k}"]`);
wbar.onclick=e=>{ const b=e.target.closest("button"); if(!b) return; const k=b.dataset.w;
  if(k==="places") placesToggle(); if(k==="eye") eyeNext(); if(k==="gyro") gyroToggle(); if(k==="meas") document.getElementById("measBtn").click();
  if(k==="warn"){ WALK.warnOn=!WALK.warnOn; walkG.children.forEach(o=>{ if(o.userData.warn) o.visible=WALK.warnOn; }); hint(WALK.warnOn?(WALK.nWarn?`⚠️ ${WALK.nWarn} مكان ضيق متعلّم بالأحمر على الأرض`:"✓ مفيش أماكن ضيقة"):"اتشالت علامات الأماكن الضيقة"); }
  if(k==="night"){ WALK.night=!(WALK.night==null?WALK.base.night:WALK.night); walkLights(); hint(WALK.night?"🌙 بالليل: النور الصناعي بس":"☀️ بالنهار"); }
  if(k==="light") toggleLights(); if(k==="curt") toggleCurtains();
  if(k==="snd"){ WALK.mute=!WALK.mute; try{ localStorage.setItem("kitchen3d/walkMute",WALK.mute?"1":"0"); }catch(e){} if(!WALK.mute) sfx("click"); }
  walkBarUI(); poke(); };
function walkBarUI(){ const on=(k,v)=>wb(k).classList.toggle("on",!!v), E=EYES[WALK.eye], night=WALK.base&&(WALK.night==null?WALK.base.night:WALK.night);
  wb("eye").querySelector(".wi").textContent=E[2]; wb("eye").querySelector("b").textContent=E[1]; on("eye",WALK.eye!=="stand");
  on("gyro",WALK.gyro); on("meas",measure); on("warn",WALK.warnOn); on("light",!WALK.lightsOff); on("curt",WALK.curtClosed); on("places",wplaces.classList.contains("open"));
  wb("night").querySelector(".wi").textContent=night?"🌙":"☀️"; wb("snd").querySelector(".wi").textContent=WALK.mute?"🔇":"🔊";
  wb("warn").querySelector("b").textContent=WALK.nWarn?WALK.nWarn:""; wb("curt").style.display=APT3D||!FEATS.some(f=>f.type==="window")?"none":""; }

// ---------- enter / leave (seen from the render loop, so every way in or out is covered) ----------
function walkSync(){ if(FP.on===WALK.on) return; WALK.on=FP.on; document.body.classList.toggle("walking",FP.on);
  WALK.path=null; WALK.fly=null; WALK.room=null; WALK.joy.x=WALK.joy.y=0; WALK.keys.clear(); placesClose(); wcardClose();
  if(FP.on){ walkBase(); walkLayers(); walkLights(); walkBarUI(); return; }
  gyroOff(); if(measure) document.getElementById("measBtn").click(); FP.eye=EYES.stand[0]; WALK.eye="stand"; WALK.night=null; WALK.lightsOff=false; clearWalkG(); ringDrop();
  if(WALK.curtClosed){ WALK.curtClosed=false; if(!APT3D) build(); } walkLights(); }
function walkBase(){ WALK.base={sun:sun.intensity,hemi:hemi.intensity,bulb:bulb.intensity,bg:scene.background?scene.background.clone():null,night:!!cfg.night}; }
function walkAfterBuild(){ if(APT_BUILD) return; walkBase(); WALK.nav=null; if(!FP.on) return; walkLayers(); walkLights(); walkBarUI();
  if(WALK.card){ const u=UNITS.find(x=>x.id===WALK.card); if(u) wcardShow(u,true); else wcardClose(); } }
function clearWalkG(){ disposeTree(walkG); scene.remove(walkG); walkG=new THREE.Group(); scene.add(walkG); }

// ---------- per frame ----------
function walkTick(){ walkSync(); const now=performance.now(), dt=Math.min(0.05,(now-(WALK.lastT||now))/1000); WALK.lastT=now; if(!FP.on) return;
  const x0=FP.x, z0=FP.z; let busy=false;
  if(WALK.fly){ const F=WALK.fly; F.t=Math.min(1,F.t+dt/F.dur); const e=F.t<0.5?2*F.t*F.t:1-Math.pow(-2*F.t+2,2)/2, L=(a,b)=>a+(b-a)*e;
    FP.x=L(F.a.x,F.b.x); FP.z=L(F.a.z,F.b.z); FP.yaw=F.a.yaw+angDiff(F.a.yaw,F.b.yaw)*e; FP.pitch=L(F.a.pitch,F.b.pitch); FP.eye=L(F.a.eye,F.b.eye);
    if(F.t>=1){ WALK.fly=null; if(WALK.gyro) WALK.gyro.off=null; } busy=true; }
  else { const eT=EYES[WALK.eye][0]; if(Math.abs(FP.eye-eT)>0.002){ FP.eye+=(eT-FP.eye)*Math.min(1,dt*8); busy=true; } }
  const J=WALK.joy, K=WALK.keys; let fw=-J.y, st=J.x;
  if(K.size){ if(K.has("f")) fw=1; if(K.has("b")) fw=-1; if(K.has("l")) FP.yaw+=1.8*dt; if(K.has("r")) FP.yaw-=1.8*dt; }
  if(Math.hypot(fw,st)>0.12){ WALK.path=null; WALK.fly=null; const sp=1.3*dt, s=Math.sin(FP.yaw), c=Math.cos(FP.yaw); fpStep((s*fw-c*st)*sp,(c*fw+s*st)*sp); }
  else if(WALK.path&&!WALK.fly){ const P=WALK.path, g=P[0], dx=g[0]-FP.x, dz=g[1]-FP.z, L=Math.hypot(dx,dz);
    if(L<0.04){ P.shift(); if(!P.length){ WALK.path=null; ringFade(); } }
    else { const last=P.length===1, stp=Math.min(L,1.5*dt*(last&&L<0.45?Math.max(0.3,L/0.45):1)), ox=FP.x, oz=FP.z; fpStep(dx/L*stp,dz/L*stp);
      if(Math.hypot(FP.x-ox,FP.z-oz)<stp*0.3){ if(++WALK.stuck>8){ WALK.path=null; ringFade(); } } else WALK.stuck=0; } }
  const moved=Math.hypot(FP.x-x0,FP.z-z0); if(!WALK.fly){ WALK.stepAcc+=moved; if(WALK.stepAcc>0.62){ WALK.stepAcc=0; sfx("step"); } }
  for(const A of WALK.anims) busy=animStep(A,dt)||busy; WALK.anims=WALK.anims.filter(A=>!A.done);
  if(walkFx.userData.ring){ const r=walkFx.userData.ring; r.rotation.z+=dt*1.5; if(r.userData.fade){ r.material.opacity-=dt*2.5; if(r.material.opacity<=0) ringDrop(); } busy=true; }
  if(APT3D&&now-WALK.roomT>250){ WALK.roomT=now; const nm=aptRoomAt(FP.x,FP.z); if(nm&&nm!==WALK.room){ if(WALK.room!==null) { hint(`📍 ${nm}`,1800); sfx("click"); } WALK.room=nm; } }
  drawMap(); if(busy) poke(2); }
const angDiff=(a,b)=>{ let d=(b-a)%(2*Math.PI); if(d>Math.PI) d-=2*Math.PI; if(d<-Math.PI) d+=2*Math.PI; return d; };
function aptRoomAt(X,Z){ for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const [x,z]=toLocal(r,sn,X,Z); if(x>0&&x<sn.RW&&z>0&&z<sn.RL) return sn.name||"أوضة"; } return null; }

/* apartment seen from above: tap a spot to drop into walk mode right there, facing the way the camera looks */
function aptTapWalk(cx,cy){ const h=castAt(cx,cy).find(visibleHit); if(!h) return false; let x=h.point.x, z=h.point.z;
  if(!aptFree(x,z)){ let best=null; for(let r=0.1;r<=1.2&&!best;r+=0.1) for(let k=0;k<16;k++){ const a=k*Math.PI/8, px=x+Math.cos(a)*r, pz=z+Math.sin(a)*r; if(aptFree(px,pz)&&(!best||aptRoomAt(px,pz)===aptRoomAt(x,z))){ best=[px,pz]; } } if(!best){ hint("دوس على أرضية أوضة عشان تمشي فيها"); return false; } [x,z]=best; }
  const dx=target.x-camera.position.x, dz=target.z-camera.position.z, yaw=Math.atan2(dx,dz); aptView(true); hint("",1);
  FP.x=x; FP.z=z; FP.yaw=yaw; FP.pitch=-0.1; WALK.room=null; const nm=aptRoomAt(x,z); if(nm) hint(`📍 ${nm} • دوس على الأرض تروح هناك`,3000); sfx("step"); poke(); return true; }

// ---------- floor grid: 0 free, 1 furniture, 2 wall / outside, 3 low furniture (coffee table, rug: counts as free for passages) ----------
function walkBounds(){ return APT3D?{X0:aptBox.X0,Z0:aptBox.Z0,X1:aptBox.X1,Z1:aptBox.Z1}:{X0:0,Z0:0,X1:RW,Z1:RL}; }
function walkGrid(){ const B=walkBounds(), res=APT3D?0.1:0.05, nx=Math.max(1,Math.ceil((B.X1-B.X0)/res)), nz=Math.max(1,Math.ceil((B.Z1-B.Z0)/res)), g=new Uint8Array(nx*nz);
  const low=APT3D?[]:UNITS.filter(u=>u.wall==="FR"&&u.y0<1&&u.y1<0.5).map(unitRect);
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const x=B.X0+(i+0.5)*res, z=B.Z0+(j+0.5)*res; let v;
    if(APT3D) v=aptFree(x,z,0)?0:(aptRoomAt(x,z)?1:2);
    else v=(x<0||x>RW||z<0||z>RL||inCut(x,z,0))?2:fpFree(x,z,0,0)?0:1;
    if(v===1&&low.some(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)&&fpFree(x,z,-0.5,0)) v=3; /* only a low piece here */
    g[j*nx+i]=v; }
  return {...B,res,nx,nz,g}; }
/* tight spots: a free run between furniture (at least one side) and anything, 30–75 cm wide */
function tightSpots(G){ const {nx,nz,g,res}=G, W=new Float32Array(nx*nz), fr=v=>v===0||v===3;
  const scan=(len,idx)=>{ let k=0; while(k<len){ if(!fr(g[idx(k)])){ k++; continue; } let e=k; while(e<len&&fr(g[idx(e)])) e++; const a=k>0?g[idx(k-1)]:2, b=e<len?g[idx(e)]:2, w=(e-k)*res;
      if(w>=0.3&&w<0.75&&(a===1||b===1)) for(let t=k;t<e;t++){ const c=idx(t); if(!W[c]||w<W[c]) W[c]=w; } k=e; } };
  for(let j=0;j<nz;j++) scan(nx,i=>j*nx+i); for(let i=0;i<nx;i++) scan(nz,j=>j*nx+i);
  const seen=new Uint8Array(nx*nz), out=[];
  for(let s=0;s<nx*nz;s++){ if(!W[s]||seen[s]) continue; const st=[s], cells=[]; seen[s]=1; let mn=9;
    while(st.length){ const c=st.pop(); cells.push(c); mn=Math.min(mn,W[c]); const i=c%nx, j=(c/nx)|0; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const n=b*nx+a; if(W[n]&&!seen[n]){ seen[n]=1; st.push(n); } } }
    const area=cells.length*res*res, len=area/mn; if(area<0.08) continue;
    /* a passage opens onto the floor at two ends; a nook (nightstand to wall) at one. Keep nooks only when long, like the side of a bed */
    const inC=new Set(cells), open=c=>{ const i=c%nx, j=(c/nx)|0; return [[1,0],[-1,0],[0,1],[0,-1]].some(([di,dj])=>{ const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) return false; const n=b*nx+a; return !inC.has(n)&&fr(g[n]); }); };
    const mouth=cells.filter(open), ms=new Set(mouth), mseen=new Set(); let ends=0;
    for(const m of mouth){ if(mseen.has(m)) continue; ends++; const q=[m]; mseen.add(m); while(q.length){ const c=q.pop(), i=c%nx, j=(c/nx)|0; for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ const n=(j+dj)*nx+(i+di); if(i+di<0||i+di>=nx||j+dj<0||j+dj>=nz||!ms.has(n)||mseen.has(n)) continue; mseen.add(n); q.push(n); } } }
    if(!(ends>=2&&len>=0.25||len>=1)) continue; let sx=0,sz=0; for(const c of cells){ sx+=c%nx; sz+=(c/nx)|0; }
    out.push({cells,w:mn,x:G.X0+(sx/cells.length+0.5)*res,z:G.Z0+(sz/cells.length+0.5)*res}); }
  return out; }
/* appliance doors that leave under 40 cm to stand in front (same sum as the build's door checks) */
function doorClashes(){ const out=[]; if(APT3D) return out;
  for(const dc of DOORCHK){ if(dc.fridge||!W4.includes(dc.wall)) continue; const rm=spanOf(dc.wall)-oppDepth(dc.wall,dc.a-0.3,dc.a+0.3)-distFront(dc.wall,dc.front)-dc.reach; if(rm>=0.4) continue;
    const dr=dirOf(dc.f), f1=dc.front+dc.reach*dr, [xa,za]=alongZ(dc.f)?[dc.front,dc.a-0.3]:[dc.a-0.3,dc.front], [xb,zb]=alongZ(dc.f)?[f1,dc.a+0.3]:[dc.a+0.3,f1];
    out.push({x0:Math.min(xa,xb),x1:Math.max(xa,xb),z0:Math.min(za,zb),z1:Math.max(za,zb),cm:Math.max(0,Math.round(rm*100)),what:dc.what}); }
  return out; }

// ---------- layers: warnings painted on the floor, light switches, the minimap image ----------
function walkLayers(){ clearWalkG(); const G=WALK.grid=walkGrid(), T=tightSpots(G), D=doorClashes(); WALK.nav=null; WALK.nWarn=T.length+D.length;
  const {nx,nz,res,g}=G, cv=document.createElement("canvas"); cv.width=nx; cv.height=nz; const cx=cv.getContext("2d"), im=cx.createImageData(nx,nz);
  const mp=document.createElement("canvas"); mp.width=nx; mp.height=nz; const mx=mp.getContext("2d"), mi=mx.createImageData(nx,nz), dark=!!(WALK.base&&WALK.base.night);
  const put=(d,k,r,gg,b,a)=>{ d[k*4]=r; d[k*4+1]=gg; d[k*4+2]=b; d[k*4+3]=a; };
  for(let k=0;k<nx*nz;k++){ const v=g[k]; if(v===0) put(mi.data,k,244,241,234,235); else if(v===1) put(mi.data,k,120,126,130,245); else if(v===3) put(mi.data,k,196,190,178,240); }
  for(const t of T){ const red=t.w<0.6; for(const c of t.cells){ put(im.data,c,red?200:224,red?60:140,red?50:40,red?120:100); put(mi.data,c,210,80,60,245); } }
  for(const d of D){ for(let j=Math.floor((d.z0-G.Z0)/res);j<Math.ceil((d.z1-G.Z0)/res);j++) for(let i=Math.floor((d.x0-G.X0)/res);i<Math.ceil((d.x1-G.X0)/res);i++){ if(i<0||j<0||i>=nx||j>=nz) continue; const c=j*nx+i; put(im.data,c,200,60,50,120); put(mi.data,c,210,80,60,245); } }
  cx.putImageData(im,0,0); mx.putImageData(mi,0,0); WALK.mapImg=mp; WALK.mapKey="";
  if(T.length||D.length){ const tx=new THREE.CanvasTexture(cv); tx.magFilter=THREE.LinearFilter; tx.minFilter=THREE.LinearFilter;
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(nx*res,nz*res),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    pl.rotation.x=-Math.PI/2; pl.position.set(G.X0+nx*res/2,0.022,G.Z0+nz*res/2); /* above a 1 cm rug */ pl.renderOrder=3; pl.raycast=()=>{}; pl.userData.warn=true; pl.visible=WALK.warnOn; walkG.add(pl);
    for(const t of T){ const s=spriteLabel(`ممر ضيق ${Math.round(t.w*100)} سم`,new THREE.Vector3(t.x,0.35,t.z),t.w<0.6?"#A6473A":"#b07a35"); s.scale.multiplyScalar(0.7); s.userData.warn=true; s.visible=WALK.warnOn; walkG.add(s); }
    for(const d of D){ const s=spriteLabel(`${d.what}: يفضل ${d.cm} سم`,new THREE.Vector3((d.x0+d.x1)/2,0.35,(d.z0+d.z1)/2),"#A6473A"); s.scale.multiplyScalar(0.7); s.userData.warn=true; s.visible=WALK.warnOn; walkG.add(s); } }
  if(!APT3D) switchPlates(); }
function switchPlates(){ const at=[]; for(const p of POINTS) if(p.type==="switch"&&W4.includes(p.wall)&&at.length<8){ const [x,z]=markerPos(p); at.push([p.wall,x,z,p.y||1.2]); }
  if(!at.length){ const d=FEATS.find(f=>(f.type==="door"||f.type==="opening")&&W4.includes(f.wall)); if(d){ const L=wlen(d.wall), a=d.a1+0.2<L-0.05?d.a1+0.15:Math.max(0.05,d.a0-0.15), [x,z]=aoToXZ(d.wall,a,0.012); at.push([d.wall,x,z,1.2]); } }
  const pm=M("#f6f4ef",{roughness:0.4}), km=M("#d9d4ca",{roughness:0.5});
  for(const [w,x,z,y] of at){ const along=w==="W"||w==="D", [sx,sz]=along?[0.08,0.012]:[0.012,0.08], n=w==="L"?[1,0]:w==="RT"?[-1,0]:w==="W"?[0,1]:[0,-1];
    const pl=new THREE.Mesh(new THREE.BoxGeometry(sx,0.12,sz),pm); pl.position.set(x+n[0]*0.006,y,z+n[1]*0.006); walkG.add(pl);
    const k=new THREE.Mesh(new THREE.BoxGeometry(along?0.035:0.012,0.05,along?0.012:0.035),km); k.position.set(x+n[0]*0.014,y,z+n[1]*0.014); walkG.add(k); pl.userData.plate=k;
    const hit=new THREE.Mesh(new THREE.BoxGeometry(along?0.3:0.1,0.34,along?0.1:0.3),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(x,y,z); hit.userData.act="light"; walkG.add(hit); }
  plateUI(); }
function plateUI(){ walkG.children.forEach(o=>{ if(o.userData.plate) o.userData.plate.rotation[o.geometry.parameters.width>0.05?"x":"z"]=WALK.lightsOff?0.25:-0.25; }); }

// ---------- lights, night, curtains ----------
function walkLights(){ const B=WALK.base; if(!B) return; const night=WALK.night==null?B.night:WALK.night; let s=B.sun, h=B.hemi, b=B.bulb, bg=B.bg;
  if(night!==B.night){ s=night?0.05:0.8; h=night?0.25:0.75; b=B.bulb*(night?2:0.5); bg=new THREE.Color(night?0x1b1f26:0xeef0ec); }
  if(WALK.curtClosed&&!night){ s*=0.15; h*=0.55; }
  if(WALK.lightsOff) b=0;
  sun.intensity=s; hemi.intensity=h; bulb.intensity=b; if(bg) scene.background=bg;
  for(const G of [root,...(APT3D?aptRoots:[])]) G.traverse(o=>{ if(o.isLight) o.visible=!WALK.lightsOff; if(o.userData.glass&&o.material) o.material.color.set(night?0x1d2a3a:0xcfe8f5); });
  plateUI(); poke(); }
function toggleLights(){ WALK.lightsOff=!WALK.lightsOff; walkLights(); walkBarUI(); sfx("click"); hint(WALK.lightsOff?"💡 طفيت النور":"💡 ولعت النور"); }
function toggleCurtains(){ if(APT3D) return; if(!FEATS.some(f=>f.type==="window")){ hint("مفيش شبابيك في الأوضة دي"); return; }
  if(!cfg.curtains){ wcardHTML(`<div class="wch"><b>مفيش ستاير على الشبابيك</b><button class="btn icon quiet" data-a="x" aria-label="قفل">✕</button></div><p class="note">ضيف ستاير عشان تجرب تقفلها وتفتحها وتشوف الفرق في النور.</p><div class="act"><button class="btn main" data-a="addc">ضيف ستاير</button></div>`,
      a=>{ if(a==="addc"){ pushHist(); cfg.curtains=true; wcardClose(); build(); UI_REFRESH(); hint("اتضافت ستاير ✓ دوس على الشباك تقفلها"); } }); return; }
  WALK.curtClosed=!WALK.curtClosed; build(); sfx("curtain"); hint(WALK.curtClosed?"🪟 قفلت الستارة":"🪟 فتحت الستارة"); }

// ---------- sounds (made on the fly, no files) ----------
let ACX=null, NOISE=null;
function actx(){ if(!ACX){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; try{ ACX=new C(); const n=ACX.createBuffer(1,ACX.sampleRate,ACX.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; NOISE=n; }catch(e){ return null; } }
  if(ACX.state==="suspended") ACX.resume().catch(()=>{}); return ACX; }
function sfx(kind){ if(WALK.mute) return; const c=actx(); if(!c) return; try{ const t=c.currentTime, g=c.createGain(); g.connect(c.destination);
  const noise=(dur,type,f0,f1,vol)=>{ const s=c.createBufferSource(); s.buffer=NOISE; const fl=c.createBiquadFilter(); fl.type=type; fl.frequency.setValueAtTime(f0,t); if(f1) fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
    s.connect(fl); fl.connect(g); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.start(t,Math.random()*0.5); s.stop(t+dur+0.02); };
  const tone=(dur,type,f,vol)=>{ const o=c.createOscillator(), og=c.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*0.6,t+dur); o.connect(og); og.connect(c.destination);
    og.gain.setValueAtTime(vol,t); og.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.start(t); o.stop(t+dur+0.02); };
  if(kind==="step") noise(0.09,"lowpass",380+Math.random()*120,0,0.09);
  if(kind==="door"){ noise(0.28,"bandpass",1100,280,0.05); tone(0.12,"sine",95,0.12); }
  if(kind==="click") tone(0.03,"square",1500,0.03);
  if(kind==="curtain") noise(0.45,"highpass",2400,900,0.035); }catch(e){} }

// ---------- tap: a piece, the switch, a window, or somewhere to walk to ----------
function walkTap(cx,cy){ castAt(cx,cy); const sw=ray.intersectObjects(walkG.children,true).find(h=>h.object.userData.act); const hs=castAt(cx,cy), h=hs.find(visibleHit);
  if(sw&&(!h||sw.distance<h.distance+0.05)){ toggleLights(); return; }
  if(!h) return; const ud=h.object.userData;
  if(!APT3D&&(ud.glass||ud.curt)){ toggleCurtains(); return; }
  if(!APT3D){ let o=h.object; while(o&&!o.userData.uid&&o.parent&&o.parent!==root) o=o.parent; const u=o&&o.userData.uid&&UNITS.find(x=>x.id===o.userData.uid);
    if(u&&!(u.kind==="furn"&&u.ft==="rug")){ walkUnitTap(u); return; } }
  walkGoTo(h.point); }
function walkGoTo(p){ const c=camera.position; let gx=p.x, gz=p.z;
  if(p.y>0.08){ const dx=p.x-c.x, dz=p.z-c.z, L=Math.hypot(dx,dz)||1, back=Math.min(0.55,L); gx=p.x-dx/L*back; gz=p.z-dz/L*back; } /* a wall or a piece: stop in front of it */
  const path=findPath(FP.x,FP.z,gx,gz); if(!path){ hint("مش هقدر أوصل للمكان ده"); return false; }
  WALK.path=path; WALK.stuck=0; WALK.fly=null; wcardClose(); placesClose(); const e=path[path.length-1]; ringAt(e[0],e[1]); poke(); return true; }
function ringAt(x,z){ ringDrop();
  const r=new THREE.Mesh(new THREE.RingGeometry(0.14,0.19,28,1,0,Math.PI*1.7),new THREE.MeshBasicMaterial({color:0x2f6d5a,transparent:true,opacity:0.85,depthWrite:false,side:THREE.DoubleSide}));
  r.rotation.x=-Math.PI/2; r.position.set(x,0.02,z); r.renderOrder=4; r.raycast=()=>{}; walkFx.add(r); walkFx.userData.ring=r; }
function ringDrop(){ const r=walkFx.userData.ring; if(!r) return; walkFx.remove(r); r.geometry.dispose(); r.material.dispose(); walkFx.userData.ring=null; }
function ringFade(){ const r=walkFx.userData.ring; if(r) r.userData.fade=true; }

// ---------- path finding on a 10 cm grid (A*, 8 directions, no corner cutting) ----------
function navGrid(){ if(WALK.nav) return WALK.nav; const B=walkBounds(), res=0.1, nx=Math.max(1,Math.ceil((B.X1-B.X0)/res)), nz=Math.max(1,Math.ceil((B.Z1-B.Z0)/res)), f=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++) f[j*nx+i]=fpFree(B.X0+(i+0.5)*res,B.Z0+(j+0.5)*res)?1:0;
  return WALK.nav={X0:B.X0,Z0:B.Z0,res,nx,nz,f}; }
function lineFree(x0,z0,x1,z1){ const L=Math.hypot(x1-x0,z1-z0), n=Math.ceil(L/0.05); for(let k=1;k<=n;k++){ const t=k/n; if(!fpFree(x0+(x1-x0)*t,z0+(z1-z0)*t)) return false; } return true; }
function findPath(x0,z0,x1,z1){ const N=navGrid(), {nx,nz,res,f}=N, cl=(v,n)=>Math.max(0,Math.min(n-1,v)), ci=(x,z)=>cl(Math.floor((z-N.Z0)/res),nz)*nx+cl(Math.floor((x-N.X0)/res),nx), cx=k=>N.X0+(k%nx+0.5)*res, cz=k=>N.Z0+(((k/nx)|0)+0.5)*res;
  let goal=ci(x1,z1), exact=fpFree(x1,z1);
  if(!f[goal]){ let best=-1, bd=1e9; const gi=goal%nx, gj=(goal/nx)|0; for(let dj=-6;dj<=6;dj++) for(let di=-6;di<=6;di++){ const i=gi+di, j=gj+dj; if(i<0||j<0||i>=nx||j>=nz||!f[j*nx+i]) continue; const d=di*di+dj*dj; if(d<bd){ bd=d; best=j*nx+i; } } if(best<0) return null; goal=best; exact=false; }
  const ex=exact?x1:cx(goal), ez=exact?z1:cz(goal);
  if(lineFree(x0,z0,ex,ez)) return [[ex,ez]];
  const start=ci(x0,z0), G=new Float32Array(nx*nz).fill(1e9), P=new Int32Array(nx*nz).fill(-1), done=new Uint8Array(nx*nz), H=[]; /* binary heap of [f,k] */
  const push=(fv,k)=>{ H.push([fv,k]); let i=H.length-1; while(i>0){ const p=(i-1)>>1; if(H[p][0]<=H[i][0]) break; [H[p],H[i]]=[H[i],H[p]]; i=p; } };
  const pop=()=>{ const top=H[0], last=H.pop(); if(H.length){ H[0]=last; let i=0; for(;;){ const l=2*i+1, r=l+1; let m=i; if(l<H.length&&H[l][0]<H[m][0]) m=l; if(r<H.length&&H[r][0]<H[m][0]) m=r; if(m===i) break; [H[m],H[i]]=[H[i],H[m]]; i=m; } } return top; };
  const hh=k=>Math.hypot((k%nx)-(goal%nx),((k/nx)|0)-((goal/nx)|0)); G[start]=0; push(hh(start),start); let found=false, guard=0;
  while(H.length&&guard++<200000){ const [,k]=pop(); if(done[k]) continue; done[k]=1; if(k===goal){ found=true; break; } const i=k%nx, j=(k/nx)|0;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ if(!di&&!dj) continue; const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const n=b*nx+a; if(!f[n]||done[n]) continue;
      if(di&&dj&&(!f[j*nx+a]||!f[b*nx+i])) continue; const gv=G[k]+(di&&dj?1.4142:1); if(gv<G[n]){ G[n]=gv; P[n]=k; push(gv+hh(n),n); } } }
  if(!found) return null; const cells=[]; for(let k=goal;k>=0&&k!==start;k=P[k]) cells.unshift([cx(k),cz(k)]); cells[cells.length-1]=[ex,ez];
  const out=[]; let from=[x0,z0], i=0; /* keep only the turns: jump to the farthest point still in plain sight */
  while(i<cells.length){ let j=cells.length-1; while(j>i&&!lineFree(from[0],from[1],cells[j][0],cells[j][1])) j--; out.push(cells[j]); from=cells[j]; i=j+1; }
  return out; }

// ---------- joystick + keys ----------
joy.addEventListener("pointerdown",e=>{ e.preventDefault(); joy.setPointerCapture(e.pointerId); WALK.joy.id=e.pointerId; joyMove(e); actx(); });
joy.addEventListener("pointermove",e=>{ if(WALK.joy.id===e.pointerId) joyMove(e); });
const joyEnd=e=>{ if(WALK.joy.id!==e.pointerId) return; WALK.joy.id=null; WALK.joy.x=WALK.joy.y=0; joy.firstChild.style.transform=""; };
joy.addEventListener("pointerup",joyEnd); joy.addEventListener("pointercancel",joyEnd);
function joyMove(e){ const r=joy.getBoundingClientRect(), R=r.width/2-14; let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); const L=Math.hypot(dx,dy); if(L>R){ dx*=R/L; dy*=R/L; }
  WALK.joy.x=dx/R; WALK.joy.y=dy/R; joy.firstChild.style.transform=`translate(${dx}px,${dy}px)`; poke(); }
const WKEYS={ArrowUp:"f",KeyW:"f",ArrowDown:"b",KeyS:"b",ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r"};
addEventListener("keydown",e=>{ if(!FP.on||!WKEYS[e.code]) return; const t=e.target; if(t&&(t.tagName==="INPUT"||t.tagName==="SELECT"||t.tagName==="TEXTAREA")) return; WALK.keys.add(WKEYS[e.code]); WALK.path=null; e.preventDefault(); });
addEventListener("keyup",e=>{ if(WKEYS[e.code]) WALK.keys.delete(WKEYS[e.code]); });
addEventListener("blur",()=>WALK.keys.clear());

// ---------- eye height ----------
function eyeNext(){ const ks=Object.keys(EYES); WALK.eye=ks[(ks.indexOf(WALK.eye)+1)%ks.length]; const E=EYES[WALK.eye]; hint(`${E[2]} ${E[1]}: عينك على ارتفاع ${Math.round(E[0]*100)} سم`); walkBarUI(); poke(); }

// ---------- gyroscope: turn the phone to look around ----------
const _gq=new THREE.Quaternion(), _ge=new THREE.Euler(), _gq1=new THREE.Quaternion(-Math.sqrt(0.5),0,0,Math.sqrt(0.5)), _gz=new THREE.Vector3(0,0,1), _gq0=new THREE.Quaternion(), _gv=new THREE.Vector3();
async function gyroToggle(){ if(WALK.gyro){ gyroOff(); hint("وقفت حساس الحركة"); return; }
  if(typeof DeviceOrientationEvent==="undefined"){ hint("الجهاز ده مفيهوش حساس حركة"); return; }
  try{ if(typeof DeviceOrientationEvent.requestPermission==="function"&&await DeviceOrientationEvent.requestPermission()!=="granted"){ hint("محتاج تسمح بحساس الحركة من المتصفح"); return; } }catch(e){ hint("مقدرتش أشغّل حساس الحركة"); return; }
  const G=WALK.gyro={off:null,got:false}; addEventListener("deviceorientation",onOrient); walkBarUI(); hint("📱 لف بالموبايل حواليك عشان تبص",3000);
  setTimeout(()=>{ if(WALK.gyro===G&&!G.got){ gyroOff(); hint("مفيش قراءة من حساس الحركة على الجهاز ده"); } },2000); }
function gyroOff(){ if(!WALK.gyro) return; WALK.gyro=null; removeEventListener("deviceorientation",onOrient); walkBarUI(); }
function onOrient(e){ const G=WALK.gyro; if(!G||e.alpha==null||WALK.fly) return; G.got=true; const D=Math.PI/180, so=((screen.orientation&&screen.orientation.angle)||window.orientation||0)*D;
  _ge.set(e.beta*D,e.alpha*D,-e.gamma*D,"YXZ"); _gq.setFromEuler(_ge).multiply(_gq1).multiply(_gq0.setFromAxisAngle(_gz,-so)); _gv.set(0,0,-1).applyQuaternion(_gq);
  const yd=Math.atan2(_gv.x,_gv.z); if(G.off==null) G.off=FP.yaw-yd; FP.yaw=G.off+yd; FP.pitch=Math.asin(Math.max(-1,Math.min(1,_gv.y))); poke(2); }

// ---------- stand points ----------
function furnFront(it){ if(it.snap&&W4.includes(it.snap)){ const f=wallFrame(it.snap).f, d=dirOf(f); return alongZ(f)?[d,0]:[0,d]; } const r=(((it.rot||0)%360)+360)%360; return r===90?[1,0]:r===180?[0,-1]:r===270?[-1,0]:[0,1]; }
function walkPlaces(){ const P=[], add=(n,x,z,lx,lz,eye,pitch)=>P.push({n,x,z,yaw:Math.atan2(lx-x,lz-z),pitch:pitch==null?-0.12:pitch,eye:eye||"stand"});
  const freeNear=(R,cx,cz)=>{ let best=null; for(let i=1;i<10;i++) for(let j=1;j<10;j++){ const x=R.x0+(R.x1-R.x0)*i/10, z=R.z0+(R.z1-R.z0)*j/10; if(!fpFree(x,z)) continue; const d=Math.hypot(x-cx,z-cz); if(!best||d<best[2]) best=[x,z,d]; } return best; };
  if(APT3D){ for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn) continue; const R=roomRectW(r), b=freeNear(R,(R.x0+R.x1)/2,(R.z0+R.z1)/2); if(!b) continue; const far=(R.x1-R.x0)>(R.z1-R.z0)?[R.x1,b[1]]:[b[0],R.z1]; add(`🚪 ${sn.name||"أوضة"}`,b[0],b[1],far[0],far[1]); } return P; }
  const d=FEATS.find(f=>(f.type==="door"||f.type==="opening")&&W4.includes(f.wall));
  if(d){ const m=(d.a0+d.a1)/2; for(let o=0.35;o<=2.5;o+=0.1){ const [x,z]=aoToXZ(d.wall,m,o); if(fpFree(x,z)){ const [lx,lz]=aoToXZ(d.wall,m,spanOf(d.wall)); add("🚪 عند الباب",x,z,lx,lz); break; } } }
  const c=freeNear({x0:0,x1:RW,z0:0,z1:RL},RW/2,RL/2); if(c) add("🎯 نص الأوضة",c[0],c[1],RW>RL?c[0]+1:c[0],RW>RL?c[1]:c[1]+1);
  const uFront=(n,u,eye)=>{ if(!u) return; const dr=dirOf(u.f), fr=u.back+dr*u.depth, m=(u.a0+u.a1)/2, az=alongZ(u.f); for(let o=0.4;o<=0.9;o+=0.1){ const p=fr+dr*o, [x,z]=az?[p,m]:[m,p]; if(fpFree(x,z)){ add(n,x,z,az?u.back:m,az?m:u.back,eye,-0.4); return; } } };
  const K=k=>UNITS.find(u=>u.kind===k);
  if(cfg.roomType==="kitchen"){ uFront("🚰 قدام الحوض",K("sink")); uFront("🔥 قدام البوتاجاز",K("stove")); uFront("🧊 قدام التلاجة",K("fridge")); }
  if(cfg.roomType==="bath"){ uFront("🪞 قدام الحوض",K("basin")); uFront("🚿 قدام الشاور",K("shower")||K("tub")); }
  const F=cfg.furn||[], one=ts=>F.find(it=>ts.includes(it.type)), tv=one(["tv","tvunit"]), mid=it=>{ const R=furnRect(it); return [(R.x0+R.x1)/2,(R.z0+R.z1)/2,R]; };
  const sofa=one(["sofa3","sofa2","corner","arm"]); if(sofa){ const [x,z,R]=mid(sofa), [fx,fz]=furnFront(sofa), dd=Math.min(R.x1-R.x0,R.z1-R.z0), sx=x-fx*dd*0.1, sz=z-fz*dd*0.1; const t=tv?mid(tv):[sx+fx,sz+fz]; add(sofa.type==="arm"?"🛋 من الفوتيه":"🛋 من الكنبة",sx,sz,t[0],t[1],"sit",-0.05); }
  const bed=one(["bed2","bed1","bunk"]); if(bed){ const [x,z]=mid(bed), [fx,fz]=furnFront(bed), s=(bed.d||200)/100*0.2; add("🛏 على السرير",x-fx*s,z-fz*s,x+fx*3,z+fz*3,"sit",-0.1); }
  const din=one(["dining","cafe"]); if(din){ const [x,z]=mid(din), [fx,fz]=furnFront(din), o=(din.d||90)/200+0.35; add("🍽 على السفرة",x+fx*o,z+fz*o,x,z,"sit",-0.3); }
  const desk=one(["desk"]); if(desk){ const [x,z]=mid(desk), [fx,fz]=furnFront(desk), o=(desk.d||60)/200+0.3; add("💻 على المكتب",x+fx*o,z+fz*o,x-fx,z-fz,"sit",-0.3); }
  const cnt=one(["counter"]); if(cnt){ const [x,z]=mid(cnt), [fx,fz]=furnFront(cnt), o=(cnt.d||60)/200+0.5; add("🧾 ورا الكاونتر",x-fx*o,z-fz*o,x+fx*3,z+fz*3); }
  return P; }
function placesToggle(){ if(wplaces.classList.contains("open")){ placesClose(); return; } const P=walkPlaces(); wcardClose();
  wplaces.innerHTML=P.length?P.map((p,i)=>`<button class="btn" data-i="${i}">${esc(p.n)}</button>`).join(""):`<p class="note">مفيش أماكن جاهزة هنا</p>`;
  wplaces.onclick=e=>{ const b=e.target.closest("button"); if(!b) return; flyTo(P[+b.dataset.i]); placesClose(); };
  wplaces.classList.add("open"); walkBarUI(); }
function placesClose(){ wplaces.classList.remove("open"); walkBarUI(); }
function flyTo(p){ WALK.path=null; ringFade(); WALK.eye=p.eye; WALK.fly={t:0,dur:0.8,a:{x:FP.x,z:FP.z,yaw:FP.yaw,pitch:FP.pitch,eye:FP.eye},b:{x:p.x,z:p.z,yaw:p.yaw,pitch:p.pitch,eye:EYES[p.eye][0]}}; hint(p.n.replace(/^\S+\s/,""),1600); walkBarUI(); poke(); }

// ---------- the card for a tapped piece ----------
const COLK=u=>{ if(u.kind==="furn"){ const T=FURN[u.ft]||{}; return u.ft==="rug"?["cRug","لون السجاد"]:T.col==="fab"?["cSofa","لون القماش (كل الكنب والسراير)"]:T.col==="wood"?["cWood","لون الخشب (كل القطع)"]:null; }
  return {base:["cBase","لون الدواليب السفلية (كلها)"],sink:["cBase","لون الدواليب السفلية (كلها)"],tall:["cBase","لون الدواليب (كلها)"],upper:["cUpper","لون الدواليب العلوية (كلها)"]}[u.kind]||null; };
const PRICEK={base:"pLower",sink:"pLower",upper:"pUpper",tall:"pTall"};
const DOORAPP=new Set(["fridge","stove","dish","washer"]);
function wcardHTML(html,onAct){ wcard.innerHTML=html; wcard.classList.add("open"); document.body.classList.add("wcard");
  wcard.onclick=e=>{ const b=e.target.closest("[data-a]"); if(!b) return; if(b.dataset.a==="x"){ wcardClose(); return; } onAct&&onAct(b.dataset.a); }; }
function walkUnitTap(u){ if(CABK.has(u.kind)&&!cfg.openCab){ toggleCab(u); u=UNITS.find(x=>x.id===u.id)||u; } wcardShow(u); }
function wcardShow(u,keep){ WALK.card=u.id; placesClose(); SEL=u.id; highlight(u.id);
  const w=Math.round((u.a1-u.a0)*100), d=Math.round(u.depth*100), h=Math.round((u.y1-u.y0)*100), nm=u.label||KN[u.kind]||u.kind, ck=COLK(u), pk=PRICEK[u.kind], pr=pk&&cfg.roomType==="kitchen"&&+cfg[pk]>0?Math.round((u.a1-u.a0)*cfg[pk]):0;
  const fo=FRONTS[u.kind], cur=fo&&(unitOpt(u.id).front||(u.kind==="sink"?"doors":"auto")), fn=fo&&(fo.find(o=>o[0]===cur)||fo[0])[1];
  const open=CABK.has(u.kind)&&!cfg.openCab?(OPENSET.has(u.id)?"🚪 اقفل الدولاب":"🚪 افتح الدولاب"):DOORAPP.has(u.kind)?(cfg.openDoors?"🚪 اقفل أبواب الأجهزة":"🚪 افتح أبواب الأجهزة"):"";
  wcardHTML(`<div class="wch"><b>${esc(nm)}</b><button class="btn icon quiet" data-a="x" aria-label="قفل">✕</button></div>
    <div class="wdim">عرض ${w} × عمق ${d} × ارتفاع ${h} سم</div>
    ${fn?`<div class="wrow"><span>الواجهة</span><select data-k="front" aria-label="نوع الواجهة">${fo.map(([v,t])=>`<option value="${v}"${v===cur?" selected":""}>${esc(t)}</option>`).join("")}</select></div>`:""}
    ${ck?`<label class="wrow"><span>${esc(ck[1])}</span><input type="color" data-k="col" value="${esc(String(cfg[ck[0]]||"#cccccc"))}"></label>`:""}
    ${pr?`<div class="wrow"><span>السعر التقريبي</span><b>${pr.toLocaleString("ar-EG")} جنيه</b></div>`:""}
    <div class="act">${open?`<button class="btn" data-a="open">${open}</button>`:""}<button class="btn quiet" data-a="more">تفاصيل أكتر</button></div>`,
    a=>{ const cu=UNITS.find(x=>x.id===WALK.card); if(!cu) return;
      if(a==="open"){ if(CABK.has(cu.kind)) toggleCab(cu); else { cfg.openDoors=!cfg.openDoors; build(); sfx("door"); } const nu=UNITS.find(x=>x.id===cu.id); if(nu) wcardShow(nu); }
      if(a==="more"){ const id=cu.id; wcardClose(); if(cu.kind==="furn"){ tab="الأثاث"; renderTabs(); if(!panelOpen) setPanel(true); renderControls(); } else selectUnit(id,true); } });
  const fs=wcard.querySelector('[data-k="front"]'); if(fs) fs.onchange=()=>{ pushHist(); setUnitOpt(u.id,{front:fs.value}); build(); UI_REFRESH(); };
  const ci=wcard.querySelector('[data-k="col"]'); if(ci) ci.onchange=()=>{ pushHist(); cfg[ck[0]]=ci.value; build(); UI_REFRESH(); };
  if(!keep) sfx("click"); }
function wcardClose(){ if(!wcard.classList.contains("open")&&!WALK.card) return; wcard.classList.remove("open"); wcard.innerHTML=""; document.body.classList.remove("wcard");
  if(WALK.card){ WALK.card=null; SEL=null; if(selHelper){ scene.remove(selHelper); selHelper=null; } poke(); } }

// ---------- cabinet doors that swing (a fading copy of the fronts turns on its hinge while the real cabinet rebuilds open or shut) ----------
function frontMeshes(u){ const dr=dirOf(u.f), fr=u.back+dr*u.depth, az=alongZ(u.f), out=[], bx=new THREE.Box3(); root.updateMatrixWorld(true);
  root.traverse(o=>{ if(!o.isMesh||o.userData.uid!==u.id) return; bx.setFromObject(o); const lo=az?bx.min.x:bx.min.z, hi=az?bx.max.x:bx.max.z; if(dr>0?lo>fr-0.035:hi<fr+0.035) out.push(o); }); return out; }
function ghostOf(u,ms){ const dr=dirOf(u.f), az=alongZ(u.f), fr=u.back+dr*u.depth, [hx,hz]=az?[fr,u.a0]:[u.a0,fr], pv=new THREE.Group(); pv.position.set(hx,0,hz);
  for(const o of ms){ const mt=(Array.isArray(o.material)?o.material[0]:o.material).clone(); mt.transparent=true; const g=new THREE.Mesh(o.geometry.clone(),mt); g.applyMatrix4(o.matrixWorld); g.position.x-=hx; g.position.z-=hz; g.raycast=()=>{}; pv.add(g); }
  /* which way is "out": turn a point beside the hinge a little and see if it moves into the room */
  const p=new THREE.Vector3(az?0:0.3,0,az?0.3:0).applyAxisAngle(new THREE.Vector3(0,1,0),0.3), outN=az?p.x*dr:p.z*dr; pv.userData.sgn=outN>0?1:-1;
  const o=unitOpt(u.id); pv.userData.slide=o.front==="drawers"?(az?[dr,0]:[0,dr]):null; walkFx.add(pv); return pv; }
function toggleCab(u){ const opening=!OPENSET.has(u.id); let pv=null, hide=[];
  if(opening) pv=ghostOf(u,frontMeshes(u)); opening?OPENSET.add(u.id):OPENSET.delete(u.id); build();
  if(!opening){ const nu=UNITS.find(x=>x.id===u.id); if(nu){ hide=frontMeshes(nu); pv=ghostOf(nu,hide); hide.forEach(o=>o.visible=false); } }
  if(pv) WALK.anims.push({pv,t:0,opening,hide}); sfx("door"); poke(); }
function animStep(A,dt){ A.t=Math.min(1,A.t+dt/0.38); const e=1-Math.pow(1-A.t,3), k=A.opening?e:1-e, pv=A.pv, S=pv.userData.slide;
  if(S){ pv.children.forEach(c=>{ c.userData.p0=c.userData.p0||c.position.clone(); c.position.set(c.userData.p0.x+S[0]*0.35*k,c.userData.p0.y,c.userData.p0.z+S[1]*0.35*k); }); } else pv.rotation.y=pv.userData.sgn*1.75*k;
  const op=A.opening?1-e:e; pv.children.forEach(c=>{ c.material.opacity=op; });
  if(A.t>=1){ A.done=true; A.hide.forEach(o=>o.visible=true); walkFx.remove(pv); pv.children.forEach(c=>{ c.geometry.dispose(); c.material.dispose(); }); } return true; } /* not disposeTree: the maps are shared */

// ---------- minimap ----------
function drawMap(){ const im=WALK.mapImg; if(!im) return; const k=[FP.x.toFixed(2),FP.z.toFixed(2),FP.yaw.toFixed(2),wmap.clientWidth].join(); if(k===WALK.mapKey) return; WALK.mapKey=k;
  const G=WALK.grid, dpr=Math.min(2,devicePixelRatio||1), cw=wmap.clientWidth||120, ch=wmap.clientHeight||120; if(wmap.width!==Math.round(cw*dpr)){ wmap.width=Math.round(cw*dpr); wmap.height=Math.round(ch*dpr); }
  const c=wmap.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,cw,ch); const s=Math.min((cw-10)/im.width,(ch-10)/im.height), ox=(cw-im.width*s)/2, oy=(ch-im.height*s)/2;
  c.imageSmoothingEnabled=false; c.drawImage(im,ox,oy,im.width*s,im.height*s); WALK.mapT={ox,oy,s};
  const px=ox+(FP.x-G.X0)/G.res*s, py=oy+(FP.z-G.Z0)/G.res*s, a=Math.atan2(Math.cos(FP.yaw),Math.sin(FP.yaw)); /* screen angle of the view: x right, z down */
  c.fillStyle="rgba(47,109,90,.28)"; c.beginPath(); c.moveTo(px,py); c.arc(px,py,26,a-0.6,a+0.6); c.closePath(); c.fill();
  c.fillStyle="#2f6d5a"; c.strokeStyle="#fff"; c.lineWidth=2; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill(); c.stroke();
  if(WALK.path){ c.strokeStyle="#2f6d5a"; c.setLineDash([3,3]); c.lineWidth=1.5; c.beginPath(); c.moveTo(px,py); for(const p of WALK.path) c.lineTo(ox+(p[0]-G.X0)/G.res*s,oy+(p[1]-G.Z0)/G.res*s); c.stroke(); c.setLineDash([]); } }
wmap.addEventListener("pointerdown",e=>{ e.preventDefault(); const T=WALK.mapT, G=WALK.grid; if(!T||!G) return; const r=wmap.getBoundingClientRect();
  const x=G.X0+(e.clientX-r.left-T.ox)/T.s*G.res, z=G.Z0+(e.clientY-r.top-T.oy)/T.s*G.res; if(x<G.X0||z<G.Z0||x>G.X1||z>G.Z1) return; walkGoTo(new THREE.Vector3(x,0,z)); });
