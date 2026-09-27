// =================== CUT CORNERS (L-shaped rooms / angled walls) ===================
let CUTS=[];
function netCuts(){ CUTS=(cfg.feats||[]).filter(f=>f.type==="cut").map(f=>{ const a=Math.max(0.2,Math.min(RW-0.4,(f.a||100)/100)), b=Math.max(0.2,Math.min(RL-0.4,(f.b||100)/100)), c=f.corner||"WL";
  const x0=c[1]==="L"?0:RW-a, z0=c[0]==="W"?0:RL-b; return {...f,a,b,c,diag:f.shape==="diag",x0,x1:x0+a,z0,z1:z0+b}; }); }
function inCut(x,z,m){ m=m||0; for(const k of CUTS){ if(x>k.x0-m&&x<k.x1+m&&z>k.z0-m&&z<k.z1+m){ if(!k.diag) return true; const cx=k.c[1]==="L"?0:RW, cz=k.c[0]==="W"?0:RL; if(Math.abs(x-cx)/k.a+Math.abs(z-cz)/k.b<1+m*Math.hypot(k.a,k.b)/(k.a*k.b)) return true; /* m = distance in meters past the angled wall */ } } return false; }
function cutHoles(w){ const out=[]; for(const k of CUTS){ if(w==="W"&&k.c[0]==="W") out.push([k.x0,k.x1]); if(w==="D"&&k.c[0]==="D") out.push([k.x0,k.x1]); if(w==="L"&&k.c[1]==="L") out.push([k.z0,k.z1]); if(w==="RT"&&k.c[1]==="R") out.push([k.z0,k.z1]); } return out; }
function cutArea(){ return CUTS.reduce((s,k)=>s+(k.diag?k.a*k.b/2:k.a*k.b),0); }
function cutPerimDelta(){ return CUTS.reduce((s,k)=>s+(k.diag?Math.hypot(k.a,k.b)-k.a-k.b:0),0); }
function roomPoly(RW_,RL_,cuts){ const pts=[]; const C=c=>cuts.find(k=>k.c===c);
  const add=(corner,ptsRect,ptsDiag,plain)=>{ const k=C(corner); if(!k) pts.push(plain); else pts.push(...(k.diag?ptsDiag(k):ptsRect(k))); };
  add("WL",k=>[[0,k.b],[k.a,k.b],[k.a,0]],k=>[[0,k.b],[k.a,0]],[0,0]);
  add("WR",k=>[[RW_-k.a,0],[RW_-k.a,k.b],[RW_,k.b]],k=>[[RW_-k.a,0],[RW_,k.b]],[RW_,0]);
  add("DR",k=>[[RW_,RL_-k.b],[RW_-k.a,RL_-k.b],[RW_-k.a,RL_]],k=>[[RW_,RL_-k.b],[RW_-k.a,RL_]],[RW_,RL_]);
  add("DL",k=>[[k.a,RL_],[k.a,RL_-k.b],[0,RL_-k.b]],k=>[[k.a,RL_],[0,RL_-k.b]],[0,RL_]);
  return pts; }
function polyMesh(pts,y,mat){ const sh=new THREE.Shape(); pts.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z)); const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),mat); m.rotation.x=Math.PI/2; m.position.y=y; mat.side=THREE.DoubleSide; m.receiveShadow=true; return m; }
function cutWalls(mat,groups){ const T=0.1;
  for(const k of CUTS){ const gH=k.c[0]==="W"?groups.W:groups.D, gV=k.c[1]==="L"?groups.L:groups.RT;
    if(k.diag){ const p1=[k.c[1]==="L"?k.a:RW-k.a,k.c[0]==="W"?0:RL], p2=[k.c[1]==="L"?0:RW,k.c[0]==="W"?k.b:RL-k.b], len=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);
      const cx=k.c[1]==="L"?0:RW, cz=k.c[0]==="W"?0:RL, mx=(p1[0]+p2[0])/2, mz=(p1[1]+p2[1])/2, nl=Math.hypot(cx-mx,cz-mz)||1, ox=(cx-mx)/nl*T/2, oz=(cz-mz)/nl*T/2;
      const m=new THREE.Mesh(new THREE.BoxGeometry(len+T,H,T),gH.userData.mat); m.position.set(mx+ox,H/2,mz+oz); m.rotation.y=-Math.atan2(p2[1]-p1[1],p2[0]-p1[0]); m.castShadow=m.receiveShadow=true; gH.add(m); }
    else { const L=k.c[1]==="L", F=k.c[0]==="W";
      box(L?-T:RW-k.a,0,F?k.b-T:RL-k.b,L?k.a:RW+T,H,F?k.b:RL-k.b+T,gH.userData.mat,gH);
      box(L?k.a-T:RW-k.a,0,F?-T:RL-k.b,L?k.a:RW-k.a+T,H,F?k.b:RL+T,gV.userData.mat,gV); } } }