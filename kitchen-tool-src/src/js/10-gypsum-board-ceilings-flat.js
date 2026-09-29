// =================== GYPSUM BOARD CEILINGS (flat / بيت النور) ===================
let GBQ=null;
const gbOn=()=>cfg.gbType==="flat"||cfg.gbType==="tray";
const gbWallDrop=()=>gbOn()?(cfg.gbDrop||0)/100:0; // ceiling height lost next to the walls
function polyArea(p){ let a=0; for(let i=0;i<p.length;i++){ const [x1,z1]=p[i],[x2,z2]=p[(i+1)%p.length]; a+=x1*z2-x2*z1; } return a/2; }
function polyPerim(p){ let s=0; for(let i=0;i<p.length;i++){ const [x1,z1]=p[i],[x2,z2]=p[(i+1)%p.length]; s+=Math.hypot(x2-x1,z2-z1); } return s; }
function inPoly(p,x,z){ let c=false; for(let i=0,j=p.length-1;i<p.length;j=i++){ const [xi,zi]=p[i],[xj,zj]=p[j]; if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; }
function edgeWall(a,b){ const e=0.002; if(Math.abs(a[1])<e&&Math.abs(b[1])<e) return "W"; if(Math.abs(a[0]-RW)<e&&Math.abs(b[0]-RW)<e) return "RT"; if(Math.abs(a[1]-RL)<e&&Math.abs(b[1]-RL)<e) return "D"; if(Math.abs(a[0])<e&&Math.abs(b[0])<e) return "L"; return null; }
function offsetPoly(p,dist){ // dist(i) = inward offset of edge i
  const n=p.length, lines=[];
  for(let i=0;i<n;i++){ const a=p[i], b=p[(i+1)%n], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1; let nx=-dz/L, nz=dx/L; const mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2; if(!inPoly(p,mx+nx*0.01,mz+nz*0.01)){ nx=-nx; nz=-nz; } const d=dist(i); lines.push({x:a[0]+nx*d,z:a[1]+nz*d,dx:dx/L,dz:dz/L}); }
  const out=[]; for(let i=0;i<n;i++){ const A=lines[(i-1+n)%n], B=lines[i], den=A.dx*B.dz-A.dz*B.dx; if(Math.abs(den)<1e-6){ out.push([B.x,B.z]); continue; } const t=((B.x-A.x)*B.dz-(B.z-A.z)*B.dx)/den; out.push([A.x+A.dx*t,A.z+A.dz*t]); }
  return out; }
function gbBandFor(wl){ const u=(cfg.gbBand||0)/100; if(cfg.gbPerSide!=="1"||!wl) return u; return Math.max(0,(cfg["gb"+wl]??cfg.gbBand??0)/100); }
function rotBox(p,q,y0,y1,th,mat,parent,inset){ const dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz); if(L<0.01) return; const m=new THREE.Mesh(new THREE.BoxGeometry(L,y1-y0,th),mat); m.position.set((p[0]+q[0])/2+(inset?inset[0]:0),(y0+y1)/2,(p[1]+q[1])/2+(inset?inset[1]:0)); m.rotation.y=-Math.atan2(dz,dx); parent.add(m); return m; }
function spotsAlong(poly,n){ const per=polyPerim(poly), out=[]; if(n<1||per<0.1) return out; const step=per/n; let acc=step/2, i=0, pos=0;
  for(let k=0;k<poly.length&&out.length<n;k++){ const a=poly[k], b=poly[(k+1)%poly.length], L=Math.hypot(b[0]-a[0],b[1]-a[1]); while(acc<=pos+L&&out.length<n){ const t=(acc-pos)/L; out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); acc+=step; } pos+=L; } return out; }
function spotsGrid(poly,n,bb){ if(n<1) return []; const w=bb.x1-bb.x0, h=bb.z1-bb.z0; const nx=Math.max(1,Math.round(Math.sqrt(n*w/Math.max(0.1,h)))), nz=Math.max(1,Math.ceil(n/nx)), out=[];
  for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const x=bb.x0+w*(i+0.5)/nx, z=bb.z0+h*(j+0.5)/nz; if(inPoly(poly,x,z)&&out.length<n) out.push([x,z]); } return out; }
function gypsumRender(){
  const top=walls.top, cm=top.userData.mat; cm.color=col(cfg.cCeil||"#fbfbfa"); cm.side=THREE.DoubleSide; const outer=roomPoly(RW,RL,CUTS), floorA=polyArea(outer)>0?polyArea(outer):-polyArea(outer), outerPer=polyPerim(outer);
  const lux=cfg.roomType==="room"?(LUX[cfg.rtype]||LUX.living):(LUX[cfg.roomType||"kitchen"]||150); let autoN=Math.max(1,Math.ceil(floorA*lux/450)); if(cfg.chand&&cfg.roomType==="room") autoN=Math.max(1,Math.round(autoN*0.6));
  const type=cfg.gbType||"tray", drop=Math.max(0.03,(cfg.gbDrop||12)/100), ledC={warm:0xffd9a0,white:0xfff4e0,cool:0xe6f2ff}[cfg.gbLedCol||"warm"];
  let spots=[], spotY=H-0.004, inner=null, q={type,floorA,outerPer,drop};
  if(type!=="hide") top.add(polyMesh(outer,H+0.001,cm));
  if(type==="flat"){ top.add(polyMesh(outer,H-drop,cm)); const n=cfg.gbSpots>0?cfg.gbSpots:autoN; const bb={x0:0,x1:RW,z0:0,z1:RL}; spots=spotsGrid(outer,n,bb); spotY=H-drop-0.004; q.boardA=floorA; }
  else if(type==="tray"){
    inner=offsetPoly(outer,i=>{ const a=outer[i], b=outer[(i+1)%outer.length]; return gbBandFor(edgeWall(a,b)); });
    const ia=Math.abs(polyArea(inner)); const valid=ia>0.2&&inner.every(([x,z])=>x>-0.01&&x<RW+0.01&&z>-0.01&&z<RL+0.01);
    if(!valid){ top.add(polyMesh(outer,H-drop,cm)); spots=spotsGrid(outer,cfg.gbSpots>0?cfg.gbSpots:autoN,{x0:0,x1:RW,z0:0,z1:RL}); spotY=H-drop-0.004; q.type="flat"; q.boardA=floorA; q.note="بيت النور أعرض من الأوضة، اترسم فلات"; }
    else {
      const sh=new THREE.Shape(); outer.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z)); const hole=new THREE.Path(); inner.forEach(([x,z],i)=>i?hole.lineTo(x,z):hole.moveTo(x,z)); sh.holes.push(hole);
      const band=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:drop,bevelEnabled:false}),cm); band.rotation.x=Math.PI/2; band.position.y=H; top.add(band);
      const cd=Math.max(0,Math.min(drop-0.02,(cfg.gbCenter||0)/100)); if(cd>0.005) top.add(polyMesh(inner,H-cd,cm));
      const ip=polyPerim(inner);
      if(cfg.gbLed==="1"){ const led=new THREE.MeshBasicMaterial({color:ledC}); for(let i=0;i<inner.length;i++){ const a=inner[i], b=inner[(i+1)%inner.length], mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1; let nx=-dz/L, nz=dx/L; if(!inPoly(inner,mx+nx*0.01,mz+nz*0.01)){ nx=-nx; nz=-nz; } rotBox(a,b,H-drop-0.001,H-cd-0.005,0.012,led,top,[-nx*0.005,-nz*0.005]); }
        const glow=new THREE.PointLight(ledC,cfg.night?0.6:0.2,Math.max(RW,RL)); glow.position.set(RW/2,H-0.1,RL/2); root.add(glow); }
      const at=cfg.gbSpotsAt||"band"; const mid=offsetPoly(outer,i=>{ const a=outer[i], b=outer[(i+1)%outer.length]; return gbBandFor(edgeWall(a,b))/2; });
      const nTot=cfg.gbSpots>0?cfg.gbSpots:(at==="center"?autoN:Math.max(4,Math.round(polyPerim(mid)/1.1))+(at==="both"?Math.max(1,Math.round(ia*lux/900)):0));
      const nBand=at==="center"?0:at==="both"?Math.max(1,Math.round(nTot*0.7)):nTot, nCen=nTot-nBand; const bw=Math.min(...W4.map(gbBandFor));
      spots=spotsAlong(mid,nBand).map(p=>[...p,H-drop-0.004]); const xs=inner.map(p=>p[0]), zs=inner.map(p=>p[1]);
      spots=spots.concat(spotsGrid(inner,nCen,{x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)}).map(p=>[...p,H-cd-0.004]));
      q={...q,innerA:ia,innerPer:ip,bandA:floorA-ia,vertA:ip*(drop-cd),center:cd,led:cfg.gbLed==="1"?ip:0,boardA:(floorA-ia)+ip*(drop-cd)+(cd>0.005?ia:0),inner};
    }
  } else if(type==="slab"){ spots=spotsGrid(outer,cfg.gbSpots>0?cfg.gbSpots:autoN,{x0:0,x1:RW,z0:0,z1:RL}); }
  if(type!=="hide"){ const sm=new THREE.MeshBasicMaterial({color:0xfff6dc}); for(const s of spots){ const d=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.01,20),sm); d.position.set(s[0],s[2]!=null?s[2]:spotY,s[1]); top.add(d); } }
  q.spots=spots.length; q.spotPts=spots.map(s=>[s[0],s[1]]); q.boards=Math.ceil((q.boardA||0)*1.1/2.88); q.angle=q.type==="flat"||q.type==="tray"?outerPer:0; q.outer=outer;
  q.cost=q.type==="flat"?(q.boardA||0)*(cfg.pGbFlat||0):q.type==="tray"?(q.innerPer||0)*(cfg.pGbCove||0)+(q.center>0.005?(q.innerA||0)*(cfg.pGbFlat||0):0):0;
  GBQ=q; LIGHTQ={n:spots.length,lux,pts:spots.map(s=>[s[0],s[1]]),area:floorA};
}
function ceilSVG(){ const q=GBQ; if(!q||!q.outer) return ""; const S=Math.min(300/Math.max(RW,0.1),340/Math.max(RL,0.1),110), m=40, W=RW*S+2*m, Hh=RL*S+2*m, X=x=>m+x*S, Z=z=>m+z*S;
  const P=p=>p.map(([x,z])=>X(x)+","+Z(z)).join(" "); let s=`<svg viewBox="0 0 ${W} ${Hh}" xmlns="http://www.w3.org/2000/svg" font-family="Tahoma,Arial" font-size="11" style="width:100%;display:block">`;
  s+=`<polygon points="${P(q.outer)}" fill="${q.type==="flat"?"#eef3f6":"#fff"}" stroke="#30343a" stroke-width="4"/>`;
  if(q.inner){ s+=`<polygon points="${P(q.outer)} ${P(q.inner)}" fill="#e6eef3" fill-rule="evenodd" stroke="none"/><polygon points="${P(q.inner)}" fill="#fffdf6" stroke="${q.led?"#e0a800":"#555"}" stroke-width="${q.led?3:1.5}" stroke-dasharray="${q.led?"":"6 4"}"/>`;
    for(const wl of W4){ const b=Math.round(gbBandFor(wl)*100); if(!b) continue; const [x,z]=wl==="W"?[RW/2,gbBandFor("W")/2]:wl==="D"?[RW/2,RL-gbBandFor("D")/2]:wl==="L"?[gbBandFor("L")/2,RL/2]:[RW-gbBandFor("RT")/2,RL/2]; s+=`<text x="${X(x)}" y="${Z(z)+4}" text-anchor="middle" fill="#2d5f7a" font-size="11">${b}</text>`; } }
  for(const [x,z] of q.spotPts) s+=`<circle cx="${X(x)}" cy="${Z(z)}" r="4" fill="#e07b00"/>`;
  s+=`<text x="${X(RW/2)}" y="${Z(0)-14}" text-anchor="middle" fill="#2d5f7a">${Math.round(RW*100)} سم</text><text x="${X(0)-14}" y="${Z(RL/2)}" text-anchor="middle" fill="#2d5f7a" transform="rotate(-90 ${X(0)-14} ${Z(RL/2)})">${Math.round(RL*100)} سم</text>`;
  return s+"</svg>"; }
function gbSummary(){ const q=GBQ; if(!q) return ""; const f=v=>(v||0).toFixed(1), H0=Math.round(H*100), dr=Math.round(q.drop*100);
  if(q.type==="flat") return `⬜ <b>جبس فلات</b> نازل ${dr} سم ← الارتفاع بعد الجبس <b>${H0-dr} سم</b><br>المساحة: <b>${f(q.boardA)} م²</b> • حوالي ${q.boards} لوح (120×240)<br>زوايا حوالين الحيطان: ${f(q.angle)} م.ط • ${q.spots} سبوت${q.note?`<br><small>${q.note}</small>`:""}`+(q.cost>0?`<hr>التكلفة التقريبية: <b>${Math.round(q.cost).toLocaleString("ar-EG")} جنيه</b>`:"");
  if(q.type==="tray") return `💡 <b>بيت نور</b> نازل ${dr} سم ← تحت البانوه <b>${H0-dr} سم</b> وفي النص <b>${H0-Math.round((q.center||0)*100)} سم</b><br>بيت النور: <b>${f(q.innerPer)} م.ط</b> (مقاس النص ${f(q.innerA)} م²)<br>البانوهات: ${f(q.bandA)} م² + القفلة ${f(q.vertA)} م²${q.center>0.005?` + النص ${f(q.innerA)} م²`:""} ← <b>${f(q.boardA)} م²</b> • حوالي ${q.boards} لوح`+(q.led?`<br>ليد مخفي: <b>${f(q.led)} م</b>`:"")+`<br>زوايا: ${f(q.angle)} م.ط • ${q.spots} سبوت`+(q.cost>0?`<hr>التكلفة التقريبية: <b>${Math.round(q.cost).toLocaleString("ar-EG")} جنيه</b>`:"");
  return q.type==="slab"?`سقف عادي من غير جبس • ${q.spots} نقطة إضاءة`:""; }
function ceilBox(){
  const top=document.createElement("div"); top.innerHTML=`<div class="sum">${gbSummary()||"السقف مخفي في العرض"}</div><div class="planbox">${ceilSVG()}</div>`; ctlEl.insertBefore(top,ctlEl.firstChild);
  const P=ctlEl; const sub=t=>{ const h=document.createElement("div"); h.className="head"; h.textContent=t; P.appendChild(h); };
  sub("📐 مقاسات الجبس"); objRange(P,cfg,"gbDrop","نزول الجبس من السقف",3,80,1);
  if(cfg.gbType==="tray"){
    objSelect(P,cfg,"gbPerSide","عرض البانوه",[["","نفس العرض من كل ناحية"],["1","كل حيطة لوحدها"]]);
    if(cfg.gbPerSide==="1"){ for(const w of W4){ if(cfg["gb"+w]==null) cfg["gb"+w]=cfg.gbBand; objRange(P,cfg,"gb"+w,"البانوه عند "+WNAME[w]+" (0 = مفيش)",0,200,1); } }
    else objRange(P,cfg,"gbBand","عرض البانوه حوالين",15,200,1);
    objRange(P,cfg,"gbCenter","نزول النص (0 = على السقف)",0,Math.max(1,(cfg.gbDrop||12)-2),1);
    sub("💡 الإضاءة"); objSelect(P,cfg,"gbLed","ليد مخفي في بيت النور",[["1","أيوه"],["","لأ"]]);
    if(cfg.gbLed==="1") objSelect(P,cfg,"gbLedCol","لون الليد",[["warm","دافي (أصفر)"],["white","أبيض طبيعي"],["cool","أبيض بارد"]]);
    objSelect(P,cfg,"gbSpotsAt","السبوتات فين",[["band","في البانوه حوالين"],["center","في النص"],["both","الاتنين"]]);
  } else sub("💡 الإضاءة");
  objRange(P,cfg,"gbSpots","عدد السبوتات (0 = تلقائي)",0,60,1);
  const n=document.createElement("div"); n.className="note"; n.textContent=`التلقائي بيحسب حوالي ${LIGHTQ.lux} لوكس للأوضة دي (سبوت 7 وات ≈ 450 لومن).`; P.appendChild(n);
  sub("💰 الأسعار"); for(const [k,l] of [["pGbFlat","سعر متر الجبس الفلات (مسطح)"],["pGbCove","سعر متر بيت النور (طولي)"]]){ const el=document.createElement("input"); el.type="number"; el.className="num"; el.style.width="90px"; el.value=cfg[k]||""; el.onchange=()=>{ cfg[k]=+el.value||0; build(); renderControls(); }; fieldRow(P,l,el); }
}
