// =================== ROOM ===================
function room(){
  const T=0.1, wm=()=>M(cfg.cWall,{roughness:0.9,transparent:true});
  walls={front:new THREE.Group(),left:new THREE.Group(),right:new THREE.Group(),back:new THREE.Group(),top:new THREE.Group()};
  for(const [k,g] of Object.entries(walls)){ g.userData.mat=wm(); root.add(g); }
  const GRP={W:walls.front,RT:walls.right,D:walls.back,L:walls.left};
  if(CUTS.length) root.add(polyMesh(roomPoly(RW,RL,CUTS),0.0005,floorMat(1,1))); else box(-T,-0.02,-T,RW+T,0,RL+T,floorMat(RW+0.2,RL+0.2));
  const solid=M(cfg.cWall,{roughness:0.9}), fr=M("#9aa2a8",{metalness:0.4}), fm=M(0x8a8f95,{metalness:0.3}), dm=M(cfg.cWood,{roughness:0.5});
  for(const w of W4){
    const g=GRP[w], mat=g.userData.mat, L=wlen(w), ext=(w==="W"||w==="D")?T:0;
    const hs=FEATS.filter(f=>f.wall===w&&["window","door","opening","niche","railing"].includes(f.type)).map(f=>[f.a0,f.a1,f.y0,f.y1]).concat(cutHoles(w).map(([a,b])=>[a<=0.001?-ext-0.01:a,b>=L-0.001?L+ext+0.01:b,0,H])).sort((p,q)=>p[0]-q[0]);
    let a=-ext;
    for(const [h0,h1,y0,y1] of hs){ if(h0>a) boxAO(w,a,h0,0,-T,0,H,mat,g); const s0=Math.max(a,h0); if(h1>s0){ if(y0>0.001) boxAO(w,s0,h1,0,-T,0,y0,mat,g); if(y1<H-0.001) boxAO(w,s0,h1,0,-T,y1,H,mat,g); } a=Math.max(a,h1); }
    if(a<L+ext) boxAO(w,a,L+ext,0,-T,0,H,mat,g);
    for(const f of FEATS.filter(x=>x.wall===w)){
      const {a0,a1,y0,y1,dep}=f;
      if(f.type==="window"){ Object.assign(boxAO(w,a0,a1,-0.055,-0.065,y0,y1,new THREE.MeshBasicMaterial({color:cfg.night?0x1d2a3a:0xcfe8f5}),g).userData,{wf:true,glass:true});
        const mc=(a0+a1)/2; boxAO(w,a0,a0+0.03,-0.03,-0.07,y0,y1,fr,g).userData.wf=true; boxAO(w,a1-0.03,a1,-0.03,-0.07,y0,y1,fr,g).userData.wf=true; boxAO(w,mc-0.015,mc+0.015,-0.03,-0.07,y0,y1,fr,g).userData.wf=true;
        boxAO(w,a0,a1,-0.03,-0.07,y1-0.03,y1,fr,g).userData.wf=true; boxAO(w,a0,a1,-0.03,-0.07,y0,y0+0.03,fr,g).userData.wf=true; }
      if(f.type==="door"){ boxAO(w,a0-0.02,a0,0.02,-0.12,0,y1+0.02,fm,g).userData.wf=true; boxAO(w,a1,a1+0.02,0.02,-0.12,0,y1+0.02,fm,g).userData.wf=true; boxAO(w,a0-0.02,a1+0.02,0.02,-0.12,y1,y1+0.02,fm,g).userData.wf=true;
        if(cfg.doorLeaf==="closed") boxAO(w,a0,a1,-0.03,-0.07,0.005,y1,dm,g).userData.wf=true;
        if(cfg.doorLeaf==="open") boxAO(w,a1+0.02,a1+0.06,-0.12,-0.12-(a1-a0),0.005,y1,dm,g).userData.wf=true; }
      if(f.type==="niche"){ const floorN=y0<0.05;
        boxAO(w,a0,a1,-dep,-dep-T,y0,y1,mat,g); boxAO(w,a0-T,a0,-T,-dep-T,y0,y1,mat,g); boxAO(w,a1,a1+T,-T,-dep-T,y0,y1,mat,g);
        if(y1<H-0.01) boxAO(w,a0,a1,-T,-dep,y1,y1+0.05,mat,g);
        if(floorN) boxAO(w,a0,a1,0,-dep,-0.02,0,floorMat(a1-a0,dep),g); else boxAO(w,a0,a1,-T,-dep,y0-0.04,y0,mat,g); }
      if(f.type==="corridor"){ const nfr=nicheFrame(f), tw=nfr.back===a0?1:-1;
        boxAO(w,a0,a1,-T,-T-dep,-0.02,0,floorMat(a1-a0,dep),g);
        if(tw>0) boxAO(w,a0-T,a0,-T,-T-dep-T,0,H,mat,g); else boxAO(w,a1,a1+T,-T,-T-dep-T,0,H,mat,g);
        boxAO(w,tw>0?a0-T:a0,tw>0?a1:a1+T,-T-dep,-T-dep-T,0,H,mat,g); }
      if(f.type==="column"||(f.type==="shaft"||f.type==="stack")){ curSide=w; boxAO(w,a0,a1,0,dep,0,H,solid); curSide=null; }
      if(f.type==="beam"){ curSide=w; boxAO(w,a0,a1,0,dep,y0,H,solid); curSide=null; }
      if(f.type==="railing"){ const rh=(f.h||110)/100, gl=M("#cfe6ee",{transparent:true,opacity:0.3,roughness:0.05}); boxAO(w,a0,a1,-0.06,-0.07,0.05,rh-0.05,gl,g).userData.wf=true; boxAO(w,a0,a1,-0.04,-0.09,rh-0.05,rh,fr,g).userData.wf=true; boxAO(w,a0,a1,-0.02,-0.12,0,0.05,solid,g);
        for(let x=a0;x<=a1+0.001;x+=Math.max(0.3,(a1-a0)/Math.max(1,Math.round((a1-a0)/1.2)))) boxAO(w,Math.min(a1-0.03,x),Math.min(a1,x+0.03),-0.045,-0.085,0.05,rh,fr,g).userData.wf=true; }
    }
  }
  cutWalls(null,GRP);
  gypsumRender();
  finishesRender();
}
