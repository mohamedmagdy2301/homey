// =================== HELPERS ===================
const col=c=>new THREE.Color(c);
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:col(c),roughness:0.7,metalness:0},o));
let MAT={};
function mats(){
  MAT={
    base:M(cfg.cBase,{roughness:cfg.gloss?0.15:0.55,metalness:cfg.gloss?0.1:0}), upper:M(cfg.cUpper,{roughness:cfg.gloss?0.15:0.55,metalness:cfg.gloss?0.1:0}), counter:M(cfg.cCounter,{roughness:0.3}),
    wood:M(cfg.cWood,{roughness:0.6}), plinth:M("#3a3d42"),
    handle: cfg.handles==="gold"?M("#c9a45c",{metalness:0.8,roughness:0.25}):M(cfg.cHandle==="#c6a25a"||cfg.cHandle==="#c9a45c"||cfg.cHandle==="#b8925a"?"#2f3237":"#2b2d30",{metalness:0.5,roughness:0.35}),
    steel:M("#b9c0c6",{metalness:0.75,roughness:0.3}), dark:M("#5f666c",{metalness:0.5,roughness:0.4}),
    black:M("#1c1e21",{roughness:0.25}), glass:M("#cfe3ea",{transparent:true,opacity:0.35,roughness:0.05,metalness:0.1}),
    white:M("#f4f5f6",{roughness:0.4}), gola:M("#2a2c2f",{roughness:0.5}),
    led:new THREE.MeshBasicMaterial({color:0xfff3d1})
  };
}
// ---- procedural textures ----
function shade(hex,k){ const c=col(hex); c.r=Math.min(1,c.r*k); c.g=Math.min(1,c.g*k); c.b=Math.min(1,c.b*k); return "#"+c.getHexString(); }
const TEXC=new Map(); /* drawn canvases by kind+color: a bath rebuild used to paint a new canvas per tile segment on every slider tick */
function makeTex(kind,color,rx,ry){ const key=kind+"|"+color; let c=TEXC.get(key);
  if(!c){ if(TEXC.size>64) TEXC.clear(); c=texCanvas(kind,color); TEXC.set(key,c); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=4; return t; } /* own texture per material: build() disposes it, the canvas stays cached */
function texCanvas(kind,color){
  const c=document.createElement("canvas"); c.width=c.height=256; const g=c.getContext("2d");
  g.fillStyle=color; g.fillRect(0,0,256,256);
  if(kind==="tiles"){ g.strokeStyle=shade(color,0.8); g.lineWidth=6; g.strokeRect(0,0,256,256); }
  if(kind==="subway"){ g.strokeStyle=shade(color,0.82); g.lineWidth=5;
    for(let r=0;r<4;r++){ const y=r*64; g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke(); const off=r%2?64:0;
      for(let x=off;x<=256;x+=128){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+64); g.stroke(); } } }
  if(kind==="wood"){ for(let i=0;i<4;i++){ g.fillStyle=shade(color,0.9+((i*37)%20)/100); g.fillRect(i*64,0,64,256);
      g.strokeStyle=shade(color,0.7); g.lineWidth=2; g.strokeRect(i*64,(i%2)*128,64,256);
      g.strokeStyle=shade(color,0.85); g.lineWidth=1; for(let k=0;k<6;k++){ g.beginPath(); g.moveTo(i*64+8+k*9,0); g.lineTo(i*64+6+k*9,256); g.stroke(); } } }
  if(kind==="checker"){ g.fillStyle=shade(color,0.45); g.fillRect(0,0,128,128); g.fillRect(128,128,128,128); }
  return c;
}
function floorMat(w,d){
  if(cfg.floorType==="plain") return M(cfg.cFloor,{roughness:0.8});
  const size=cfg.floorType==="wood"?1.0:0.6;
  return new THREE.MeshStandardMaterial({map:makeTex(cfg.floorType,cfg.cFloor,w/size,d/size),roughness:cfg.floorType==="tiles"?0.35:0.7});
}
function splashMat(w,h){
  if(cfg.splash==="stone") return MAT.counter;
  if(cfg.splash==="glass") return M(cfg.cSplash,{roughness:0.05,metalness:0.2});
  const size=cfg.splash==="tiles"?0.2:0.3;
  return new THREE.MeshStandardMaterial({map:makeTex(cfg.splash,cfg.cSplash,w/size,h/(cfg.splash==="tiles"?0.2:0.3)),roughness:0.3});
}
let ACC={lower:0,upper:0,tall:0,marble:0}, curSide=null;
// ---- room geometry (net, meters) ----
let RW=1.8, RL=4.0, FIN=0, FEATS=[], WALLS={};
function geo(){ FIN=cfg.dimsOn==="brick"?(cfg.plaster+cfg.tileT)/100:0; RW=Math.max(1.2,cfg.roomW/100-2*FIN); RL=Math.max(1.5,cfg.roomL/100-2*FIN); }
const wlen=w=>w==="W"||w==="D"?RW:RL;
function netFeat(f){
  const L=wlen(f.wall), w=Math.max(0.05,Math.min((f.w||10)/100,L)), a0=Math.max(0,Math.min(L-w,(f.pos||0)/100-((f.pos||0)>0&&!f.net?FIN:0)));
  let y0=0,y1=H;
  if(f.type==="window"){ y0=(f.y||0)/100; y1=Math.min(H-0.02,((f.y||0)+(f.h||100))/100); }
  else if(f.type==="door"||f.type==="opening"){ y1=Math.min(H-0.02,(f.h||210)/100); }
  else if(f.type==="railing"){ y0=0; y1=H; }
  else if(f.type==="beam"){ y0=H-Math.min(H-0.5,(f.h||40)/100); }
  else if(f.type==="niche"){ y0=(f.y||0)/100; y1=f.h?Math.min(H,((f.y||0)+f.h)/100):H; }
  return {...f,a0,a1:a0+w,y0,y1,dep:Math.max(0.02,(f.d||0)/100)};
}
function aoToXZ(w,a,o){ return w==="L"?[o,a]:w==="RT"?[RW-o,a]:w==="W"?[a,o]:[a,RL-o]; } // a = along wall, o = distance into the room
function boxAO(w,a0,a1,o0,o1,y0,y1,mat,parent){ const [xA,zA]=aoToXZ(w,a0,o0),[xB,zB]=aoToXZ(w,a1,o1); return box(Math.min(xA,xB),y0,Math.min(zA,zB),Math.max(xA,xB),y1,Math.max(zA,zB),mat,parent); }
function rectAO(w,a0,a1,o0,o1){ const [xA,zA]=aoToXZ(w,a0,o0),[xB,zB]=aoToXZ(w,a1,o1); return {x0:Math.min(xA,xB),x1:Math.max(xA,xB),z0:Math.min(zA,zB),z1:Math.max(zA,zB)}; }
const WF={L:"+x",RT:"-x",W:"+z",D:"-z"};
function wallFrame(w){ return {f:WF[w],back:w==="L"||w==="W"?0:w==="RT"?RW:RL}; }
function nicheFrame(nf){
  if(nf.type==="niche"){ const b=wallFrame(nf.wall), dr=dirOf(b.f); return {f:b.f,back:b.back-nf.dep*dr,a0:nf.a0,a1:nf.a1,width:nf.a1-nf.a0,depth:nf.dep,host:nf.wall,floor:nf.y0<0.05}; }
  const door=FEATS.find(x=>x.wall===nf.wall&&(x.type==="door"||x.type==="opening")); const mid=(nf.a0+nf.a1)/2, toward=door?((door.a0+door.a1)/2>=mid?1:-1):1;
  const T=0.1, [xA,zA]=aoToXZ(nf.wall,0,-T-0.02), [xB,zB]=aoToXZ(nf.wall,0,-T-nf.dep+0.02), alongIsX=nf.wall==="W"||nf.wall==="D";
  const f=alongIsX?(toward>0?"+x":"-x"):(toward>0?"+z":"-z");
  const a0=alongIsX?Math.min(zA,zB):Math.min(xA,xB), a1=alongIsX?Math.max(zA,zB):Math.max(xA,xB);
  return {f,back:toward>0?nf.a0:nf.a1,a0,a1,width:a1-a0,depth:nf.a1-nf.a0,host:nf.wall,corridor:true,floor:true};
}
function frameOf(w){
  if(W4.includes(w)){ const fr=wallFrame(w); return {...fr,base0:0,side:w,len:wlen(w)}; }
  const nf=FEATS.find(x=>"N:"+x.id===w); if(nf){ const fr=nicheFrame(nf); return {f:fr.f,back:fr.back,base0:fr.a0,side:fr.host,len:fr.width,niche:true}; }
  const fr=wallFrame("L"); return {...fr,base0:0,side:"L",len:RL};
}
const wallLen=w=>frameOf(w).len;
function subtract(rng,blocks){
  let segs=[rng.slice()];
  for(const [b0,b1] of blocks){ const out=[]; for(const [a,c] of segs){ if(b1<=a||b0>=c){ out.push([a,c]); continue; } if(b0>a) out.push([a,b0]); if(b1<c) out.push([b1,c]); } segs=out; }
  return segs.filter(([a,c])=>c-a>=0.1);
}
function bandBlocks(w,dep,rects){ // along-ranges of wall w whose band (0..dep deep) hits any plan rect
  const b=rectAO(w,0,wlen(w),0,dep), alongX=w==="W"||w==="D", out=[];
  for(const r of rects){ if(Math.min(b.x1,r.x1)-Math.max(b.x0,r.x0)>0.005 && Math.min(b.z1,r.z1)-Math.max(b.z0,r.z0)>0.005) out.push(alongX?[r.x0,r.x1]:[r.z0,r.z1]); }
  return out;
}
function wallName(w){ if(!W4.includes(w)) return (WALLS[w]&&WALLS[w].name)||w; const tags=[]; if(FEATS.some(f=>f.wall===w&&f.type==="window")) tags.push("الشباك"); if(FEATS.some(f=>f.wall===w&&(f.type==="door"||f.type==="opening"))) tags.push("الباب"); return WNAME[w]+(tags.length?" ("+tags.join(" و")+")":""); }
function makeWalls(){
  const o={};
  for(const w of W4) o[w]={name:wallName(w),len:wlen(w),xs:w==="W"||w==="RT"?(a=>a):w==="D"?(a=>RW-a):(a=>RL-a),ref:a=>a,refName:w==="W"||w==="D"?"من الحيطة الشمال":"من الحيطة القدامية"};
  for(const nf of FEATS.filter(f=>f.type==="niche"||f.type==="corridor")){ const fr=nicheFrame(nf); o["N:"+nf.id]={name:(nf.type==="niche"?"تجويف في ":"فجوة برة جنب ")+WNAME[nf.wall],len:fr.width,xs:a=>fr.a1-a,ref:a=>a-fr.a0,refName:"من أول الفجوة"}; }
  if(cfg.roomType==="room") o.FR={name:"الأثاث",len:RW,xs:a=>a,ref:a=>a,refName:"من الحيطة الشمال"};
  if(cfg.island.on){ const iw=cfg.island.w/100, z0=cfg.island.pos/100-iw/2; o.IS={name:"الجزيرة",len:iw,xs:a=>z0+iw-a,ref:a=>a-z0,refName:"من أولها"}; }
  return o;
}
let KEY=null, OPT=null, curWall=null;

function unitOpt(id){ if(OPT) return OPT; const v=cfg.units&&cfg.units[id]; return typeof v==="string"?{front:v}:(v||{}); }
function setUnitOpt(id,patch){ const v=cfg.units[id]; const cur=typeof v==="string"?{front:v}:(v||{}); cfg.units={...cfg.units,[id]:{...cur,...patch}}; }
const ACCS=[["","من غير"],["cutlery","منظم معالق"],["basket","سلة سحب"],["spice","كارو بهارات"],["dishrack","صفاية أطباق"],["magic","ركنة ماجيك"],["bins","صناديق تخزين"],["light","إضاءة جوه"]];
const ACCN=Object.fromEntries(ACCS);
const APPS={
  oven:{n:"فرن كهربا بلت إن",cls:"slot",w:60,d:58,h:60,col:"#2a2d31",look:"oven",need:["socket"]},
  freezerU:{n:"فريزر تحت الرخامة",cls:"slot",w:60,d:58,h:85,col:"#eceef0",look:"door",need:["socket"]},
  minibar:{n:"تلاجة صغيرة",cls:"slot",w:50,d:55,h:85,col:"#d9dde1",look:"door",need:["socket"]},
  dryer:{n:"مجفف هدوم",cls:"slot",w:60,d:60,h:85,col:"#f4f5f6",look:"round",need:["socket"]},
  washer2:{n:"غسالة نص أوتوماتيك",cls:"slot",w:75,d:45,h:90,col:"#f1f2f4",look:"top",need:["socket","water","drain"]},
  freezer:{n:"ديب فريزر رأسي",cls:"tall",w:60,d:65,h:170,col:"#eceef0",look:"door",need:["socket"]},
  cooler:{n:"كولدير مية",cls:"tall",w:32,d:35,h:105,col:"#e9ebee",look:"cooler",need:["socket"]},
  ovenCol:{n:"عمود فرن وميكروويف",cls:"tall",w:60,d:60,h:230,col:"base",look:"col",need:["socket"]},
  heaterE:{n:"سخان كهربا",cls:"wall",w:40,d:40,h:75,y:170,col:"#f4f5f6",look:"box",need:["socket","water"]},
  heaterG:{n:"سخان غاز",cls:"wall",w:35,d:20,h:60,y:150,col:"#f4f5f6",look:"heaterG",need:["gas","water"]},
  tv:{n:"شاشة",cls:"wall",w:60,d:6,h:36,y:165,col:"#141517",look:"tv",need:["socket"]},
  coffee:{n:"ماكينة قهوة",cls:"counter",w:28,d:38,h:35,col:"#2b2e33",look:"box",need:["socket"]},
  airfryer:{n:"إير فراير",cls:"counter",w:32,d:38,h:34,col:"#1f2226",look:"box",need:["socket"]},
  blender:{n:"خلاط / كبة",cls:"counter",w:20,d:20,h:40,col:"#dfe3e7",look:"box",need:["socket"]}
};
function appUnit(f,a0,a1,back,a,withTop){
  const T=APPS[a.type], dr=dirOf(f), b0=back+0.02*dr, D=a.d/100, front=b0+D*dr, m=(a0+a1)/2;
  let h=a.h/100; if(T.look==="col"||h>H-0.01) h=Math.min(h,H-0.01); if(withTop) h=Math.min(h,CH()-0.045);
  const u=newUnit("app",f,a0,a1,back,D+0.02,0,withTop?CH():h,{front:T.n,label:T.n,app:a.id}); const pu=curUid; curUid=u.id;
  if(T.look==="col"){
    place(f,a0,a1,back,front-0.04*dr,0,0.1,MAT.plinth); place(f,a0,a1,back,front,0.1,h,MAT.base);
    doorPanels(f,a0,a1,front,0.11,0.72,MAT.base,"top",1);
    place(f,a0+0.02,a1-0.02,front,front+0.02*dr,0.74,1.34,M("#23262a",{roughness:0.15,metalness:0.4})); place(f,a0+0.07,a1-0.07,front+0.02*dr,front+0.025*dr,0.8,1.22,M("#3b4148",{roughness:0.05}));
    place(f,a0+0.02,a1-0.02,front,front+0.02*dr,1.36,1.72,M("#1f2226",{roughness:0.3}));
    if(h>1.9) doorPanels(f,a0,a1,front,1.74,h,MAT.base,"bottom",1);
  } else {
    const mat=T.col==="base"?MAT.base:M(T.col,{roughness:0.35,metalness:(T.look==="door"||T.look==="oven")?0.3:0.05});
    place(f,a0+0.01,a1-0.01,b0,front,0,h,mat);
    if(T.look==="oven"){ place(f,a0+0.05,a1-0.05,front,front+0.006*dr,0.08,h-0.12,M("#3b4148",{roughness:0.05})); place(f,a0+0.08,a1-0.08,front,front+0.03*dr,h-0.07,h-0.055,MAT.steel); }
    if(T.look==="door"){ place(f,a1-0.07,a1-0.05,front,front+0.04*dr,h*0.45,h*0.75,MAT.dark); }
    if(T.look==="round"){ const r=Math.min(0.2,(a1-a0)*0.33); cylAt(f,m,front+0.01*dr,h*0.5,r,0.02,MAT.steel,true); cylAt(f,m,front+0.015*dr,h*0.5,r*0.8,0.03,M("#39424b",{roughness:0.1}),true); }
    if(T.look==="top"){ place(f,a0+0.04,a1-0.04,b0+0.04*dr,front-0.04*dr,h,h+0.01,M("#9fb3c2")); }
    if(T.look==="cooler"){ cylAt(f,m,b0+D/2*dr,h+0.2,0.13,0.4,M("#8fc1e3",{transparent:true,opacity:0.75})); }
  }
  if(withTop){ place(f,a0,a1,back,back+0.62*dr,CH()-0.04,CH(),MAT.counter); ACC.marble+=a1-a0; }
  curUid=pu; return u;
}
function appWall(f,a0,a1,back,a){
  const T=APPS[a.type], dr=dirOf(f), y0=a.y/100, y1=Math.min(H-0.01,y0+a.h/100), D=a.d/100;
  const u=newUnit("app",f,a0,a1,back,D,y0,y1,{front:T.n,label:T.n,app:a.id}); const pu=curUid; curUid=u.id;
  place(f,a0,a1,back+0.005*dr,back+D*dr,y0,y1,M(T.col,{roughness:0.3}));
  if(T.look==="heaterG") place(f,(a0+a1)/2-0.05,(a0+a1)/2+0.05,back+0.03*dr,back+0.13*dr,y1,Math.min(H,y1+0.5),MAT.steel);
  if(T.look==="tv") place(f,a0+0.01,a1-0.01,back+D*dr,back+(D+0.003)*dr,y0+0.01,y1-0.01,M("#23303d",{roughness:0.1}));
  curUid=pu; return u;
}
function appCounter(f,a0,a1,back,a){
  const T=APPS[a.type], dr=dirOf(f), ch=CH(), D=a.d/100, h=a.h/100;
  const u=newUnit("app",f,a0,a1,back,D+0.05,ch,ch+h,{front:T.n,label:T.n,app:a.id}); const pu=curUid; curUid=u.id;
  place(f,a0,a1,back+0.05*dr,back+(0.05+D)*dr,ch,ch+h,M(T.col,{roughness:0.35}));
  curUid=pu; return u;
}
// ---- unit registry (for drawings, per-unit control, picking) ----
let UNITS=[], POINTS=[], unitCount={}, curUid=null, SEL=null, selHelper=null;
const wallOf=f=>f==="+x"?"L":f==="-x"?"RT":f==="+z"?"W":"D";
function newUnit(kind,f,a0,a1,back,depth,y0,y1,extra){
  const wall=curWall||(W4.includes(curSide)?curSide:null)||wallOf(f), key=wall+"-"+kind; unitCount[key]=(unitCount[key]||0)+1;
  let id=KEY||(key+unitCount[key]); KEY=null; while(UNITS.some(x=>x.id===id)) id+="'";
  const u=Object.assign({id,wall,kind,f,a0:Math.min(a0,a1),a1:Math.max(a0,a1),back,depth,y0,y1},extra||{}); UNITS.push(u); OPENU=CABK.has(kind)&&(cfg.openCab||OPENSET.has(id)); return u;
}
const KN={dryer:"مجفف",usink:"حوض غسيل",furn:"أثاث",toilet:"قاعدة",bidet:"شطاف",basin:"حوض",shower:"شاور",tub:"بانيو",heater:"سخان",towel:"شماعة",app:"جهاز",filler:"حشوة",base:"دولاب",sink:"دولاب الحوض",stove:"البوتاجاز",washer:"الغسالة",dish:"غسالة أطباق",fridge:"التلاجة",upper:"دولاب علوي",tall:"دولاب طول",hood:"الشفاط",shelf:"أرفف",bar:"بار"};
const FRONTS={base:[["auto","تلقائي"],["doors","ضلف"],["drawers","3 أدراج"],["drawer_door","درج + ضلفة"],["open","رف مفتوح"],["bottle","كارو زجاجات"],["trash","سلة زبالة"]],
  sink:[["doors","ضلف"],["trash","ضلف + سلة زبالة"]],
  upper:[["auto","تلقائي"],["doors","ضلف"],["glass","ضلف إزاز"],["lift","رفع لفوق"],["open","أرفف مفتوحة"]],
  tall:[["auto","ضلف"],["open","رفوف مفتوحة"]]};
const FN={doors:"ضلف",drawers:"3 أدراج",drawer_door:"درج + ضلفة",open:"مفتوح",bottle:"كارو زجاجات",trash:"سلة زبالة",glass:"إزاز",lift:"رفع لفوق",glassLow:"إزاز (تحت) + ضلف",solid:"ضلف",auto:"تلقائي"};
function box(x0,y0,z0,x1,y1,z1,mat,parent){
  const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.001,Math.abs(x1-x0)),Math.max(0.001,Math.abs(y1-y0)),Math.max(0.001,Math.abs(z1-z0))),mat);
  m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); m.castShadow=m.receiveShadow=true;
  if(curSide) m.userData.side=curSide; if(curUid) m.userData.uid=curUid;
  (parent||root).add(m); return m;
}
function cyl(r,h,x,y,z,mat,axis){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),mat); m.position.set(x,y,z);
  if(axis==="x")m.rotation.z=Math.PI/2; if(axis==="z")m.rotation.x=Math.PI/2;
  m.castShadow=true; if(curSide) m.userData.side=curSide; if(curUid) m.userData.uid=curUid; root.add(m); return m;
}
// face: +x left wall | -x right wall | +z window wall | -z door wall.  a=along, d=depth coordinate
const dirOf=f=>f[0]==="-"?-1:1;
const alongZ=f=>f[1]==="x";
function place(f,a0,a1,d0,d1,y0,y1,mat){ return alongZ(f)?box(d0,y0,a0,d1,y1,a1,mat):box(a0,y0,d0,a1,y1,d1,mat); }
function cylAt(f,a,d,y,r,h,mat,frontAxis){ // frontAxis true: cylinder axis pointing out of the front
  const [x,z]=alongZ(f)?[d,a]:[a,d];
  return cyl(r,h,x,y,z,mat,frontAxis?(alongZ(f)?"x":"z"):null);
}
function handle(f,s,e,front,y,vertical){
  if(cfg.handles==="none")return;
  const dr=dirOf(f), m=(s+e)/2;
  if(vertical) place(f,e-0.06,e-0.045,front,front+0.03*dr,y-0.15,y+0.15,MAT.handle);
  else place(f,Math.max(s+0.05,m-0.16),Math.min(e-0.05,m+0.16),front,front+0.03*dr,y-0.008,y+0.008,MAT.handle);
}
function doorPanels(f,a0,a1,front,y0,y1,mat,handleAt,n,glass){
  const dr=dirOf(f); n=n||Math.max(1,Math.round((a1-a0)/0.48)); const w=(a1-a0)/n;
  if(OPENU){ for(let i=0;i<n;i++){ const s=a0+i*w+0.003,e=a0+(i+1)*w-0.003, dw=e-s, hs=n===1||i%2===0; if(hs) place(f,s-0.02,s,front,front+dw*dr,y0,y1,mat); else place(f,e,e+0.02,front,front+dw*dr,y0,y1,mat); } return; }
  for(let i=0;i<n;i++){
    const s=a0+i*w+0.003,e=a0+(i+1)*w-0.003;
    if(glass){
      place(f,s,s+0.04,front,front+0.02*dr,y0,y1,mat); place(f,e-0.04,e,front,front+0.02*dr,y0,y1,mat);
      place(f,s,e,front,front+0.02*dr,y0,y0+0.04,mat); place(f,s,e,front,front+0.02*dr,y1-0.04,y1,mat);
      place(f,s+0.04,e-0.04,front+0.005*dr,front+0.012*dr,y0+0.04,y1-0.04,MAT.glass);
    } else place(f,s,e,front,front+0.02*dr,y0,y1,mat);
    if(handleAt==="top")handle(f,s,e,front+0.02*dr,y1-0.06);
    if(handleAt==="bottom")handle(f,s,e,front+0.02*dr,y0+0.05);
  }
}
function drawers(f,a0,a1,front,y0,y1,k){
  const dr=dirOf(f), n=Math.max(1,Math.round((a1-a0)/0.6)), w=(a1-a0)/n, hs=k?Array(k).fill(1/k):[0.36,0.34,0.30];
  for(let i=0;i<n;i++){
    const s=a0+i*w+0.003,e=a0+(i+1)*w-0.003; let y=y1;
    let j=0; for(const k of hs){ const hh=(y1-y0)*k;
      if(OPENU){ const pl=Math.max(0.12,0.34-j*0.1), fr2=front+pl*dr, b0=front+(pl-0.46)*dr, inn=M("#efe8dc",{roughness:0.8});
        place(f,s,e,fr2,fr2+0.02*dr,y-hh+0.003,y-0.003,MAT.base); handle(f,s,e,fr2+0.02*dr,y-0.05);
        place(f,s+0.01,s+0.022,b0,fr2,y-hh+0.02,y-0.04,inn); place(f,e-0.022,e-0.01,b0,fr2,y-hh+0.02,y-0.04,inn); place(f,s+0.01,e-0.01,b0,fr2,y-hh+0.02,y-hh+0.032,inn); place(f,s+0.01,e-0.01,b0,b0+0.012*dr,y-hh+0.02,y-0.04,inn); }
      else { place(f,s,e,front,front+0.02*dr,y-hh+0.003,y-0.003,MAT.base); handle(f,s,e,front+0.02*dr,y-0.05); }
      y-=hh; j++; }
  }
}
const CH=()=>cfg.ch/100;
// ======== work triangle, storage volume, electrical loads ========
let TRI=null;
function frontPt(u){ const d=u.back+dirOf(u.f)*u.depth, m=(u.a0+u.a1)/2; return alongZ(u.f)?[d,m]:[m,d]; }
function workTriangle(warn){
  const g=k=>UNITS.find(u=>u.kind===k); const s=g("sink"), t=g("stove"), f=g("fridge"); TRI=null;
  if(!s||!t||!f) return;
  const P={s:frontPt(s),t:frontPt(t),f:frontPt(f)}, d=(a,b)=>Math.hypot(P[a][0]-P[b][0],P[a][1]-P[b][1]);
  const legs=[["s","t",d("s","t")],["t","f",d("t","f")],["f","s",d("f","s")]], total=legs.reduce((x,l)=>x+l[2],0);
  const nm={s:"الحوض",t:"البوتاجاز",f:"التلاجة"};
  let score=3, notes=[];
  if(total>7.9){ score--; notes.push(`مجموع المثلث ${total.toFixed(1)} م، كبير وهتمشي كتير`); }
  if(total<3.0){ notes.push(`المثلث صغير (${total.toFixed(1)} م)، الأجهزة لازقة في بعض`); }
  for(const [a,b,l] of legs) if(l>2.7){ score--; notes.push(`${nm[a]} و${nm[b]} بعاد عن بعض ${l.toFixed(1)} م`); }
  if(s.wall===t.wall){ const gap=Math.max(s.a0,t.a0)-Math.min(s.a1,t.a1); if(gap<0.3){ score--; notes.push(`الرخامة بين الحوض والبوتاجاز ${Math.max(0,Math.round(gap*100))} سم بس، الأحسن 40 سم أو أكتر`); } }
  if(f.wall===t.wall){ const gap=Math.max(f.a0,t.a0)-Math.min(f.a1,t.a1); if(gap<0.15){ score--; notes.push("التلاجة لازقة في البوتاجاز، حرارته هتتعبها"); } }
  // does a door's walking zone cut the triangle?
  for(const dr of FEATS.filter(x=>x.type==="door"||x.type==="opening")){ const [dx,dz]=aoToXZ(dr.wall,(dr.a0+dr.a1)/2,0.5);
    const inTri=(()=>{ const A=P.s,B=P.t,C=P.f, sg=(p,q,r)=>(p[0]-r[0])*(q[1]-r[1])-(q[0]-r[0])*(p[1]-r[1]); const pt=[dx,dz], d1=sg(pt,A,B),d2=sg(pt,B,C),d3=sg(pt,C,A); return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)); })();
    if(inTri){ score--; notes.push("طريق الباب بيعدي من جوه مثلث العمل، الداخل والخارج هيقطع عليك"); } }
  TRI={P,legs,total,score:Math.max(0,score),notes};
  for(const n of notes) if(!n.startsWith("المثلث صغير")) warn.push("مثلث العمل: "+n);
  if(cfg.showTri){ const mk=(a,b,l)=>{ const ok=l<=2.7; const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(P[a][0],0.03,P[a][1]),new THREE.Vector3(P[b][0],0.03,P[b][1])]),new THREE.LineBasicMaterial({color:ok?0x2e7d4f:0xb3452c,depthTest:false})); ln.renderOrder=11; root.add(ln);
      label(`${l.toFixed(2)} م`,(P[a][0]+P[b][0])/2,0.08,(P[a][1]+P[b][1])/2,ok?"#2e7d4f":"#b3452c"); };
    for(const [a,b,l] of legs) mk(a,b,l); }
}
function storageVol(){ let v=0; const ch=CH();
  for(const u of UNITS){ const w=u.a1-u.a0;
    if(u.kind==="base") v+=w*(ch-0.14)*(u.depth-0.04)*(u.front==="open"?0.8:1);
    if(u.kind==="sink") v+=w*(ch-0.14)*(u.depth-0.04)*0.4;
    if(u.kind==="upper") v+=w*(u.y1-u.y0)*(u.depth-0.02);
    if(u.kind==="tall") v+=w*(u.y1-u.y0-0.1)*(u.depth-0.04); }
  return Math.round(v*1000); }
const WATT={fridge:250,washer:2200,dish:2000,oven:3000,micro:1200,hood:250,led:60,spots:60,freezer:200,freezerU:150,minibar:100,dryer:2500,washer2:450,cooler:500,ovenCol:3000,heaterE:2500,heaterG:40,tv:150,coffee:1500,airfryer:1800,blender:800};
function elecLoadsBath(){
  const rows=[], has=t=>(cfg.bfix||[]).some(b=>b.type===t&&(t!=="heater"||b.var!=="gas"));
  if(has("heater")) rows.push({n:"سخان كهربا",w:2500}); if(has("washer")) rows.push({n:"الغسالة",w:2200}); if(has("dryer")) rows.push({n:"المجفف",w:2500});
  rows.push({n:"برايز (سشوار ومكنة حلاقة)",w:2000},{n:"الشفاط",w:40},{n:"الإضاءة والمراية",w:60});
  const circuits=[]; if(has("heater")) circuits.push({n:"السخان",a:20,mm:"4",why:"خط لوحده"}); if(has("washer")) circuits.push({n:"الغسالة",a:16,mm:"2.5",why:"خط لوحده بأرضي"}); if(has("dryer")) circuits.push({n:"المجفف",a:20,mm:"4",why:"خط لوحده"});
  circuits.push({n:"برايز الحمام",a:16,mm:"2.5",why:"قاطع تسريب 30 مللي أمبير"},{n:"الإضاءة والشفاط",a:10,mm:"1.5",why:""});
  const total=rows.reduce((x,r)=>x+r.w,0), demand=Math.round(total*0.6); return {rows,circuits,total,demand,amps:Math.round(demand/220)};
}
function BSTEPS(){ const c=k=>POINTS.filter(p=>p.type===k).length, B=BATH||{wallA:0,floorA:0,wp:0,fill:0};
  return [["علّم أماكن الأجهزة","علّم بالقلم على الحيطة والأرض مكان القاعدة وصرفها والحوض والشاور والسخان بالمقاسات من 📐."],
    ["السباكة",`مد ${c("drain")} نقطة صرف بميول 2% ناحية العمود و${c("water")} نقطة تغذية سخن وبارد، واعمل اختبار ضغط قبل ما المواسير تتقفل.`],
    ["الكهربا",`${c("socket")} نقطة كهربا. السخان على خط لوحده، والبرايز بعيدة 60 سم عن المية وعليها قاطع تسريب.`],
    ["الردم والميول",`ردم حوالي ${B.fill} سم تحت البلاط بميول ناحية الصفاية والشاور.`],
    ["العزل واختبار المية",`عزل حوالي ${B.wp.toFixed(1)} م²، وبعدين املى الأرضية مية 48 ساعة واتأكد مفيش تسريب قبل السيراميك.`],
    ["السيراميك",`الحيطان الأول (${B.wallA.toFixed(1)} م²) وبعدين الأرضية (${B.floorA.toFixed(1)} م²) بالميول.`],
    ["تركيب الأجهزة","القاعدة والحوض والخلاطات والكابينة والسخان والإكسسوارات."],
    ["التشطيب والاختبار","سليكون حوالين الأجهزة، وجرّب كل حنفية وصفاية والسخان والشفاط."]]; }
function elecLoads(){ if(cfg.roomType==="room") return elecLoadsRoom(); if(cfg.roomType==="bath") return elecLoadsBath(); if(cfg.roomType==="hall") return {rows:[{n:"إضاءة الطرقة وبريزة",w:300}],circuits:[{n:"إضاءة وبرايز الطرقة",a:10,mm:"1.5",why:""}],total:300,demand:180,amps:1};
  const rows=[], add=(n,w,circ)=>rows.push({n,w,circ});
  const has=k=>UNITS.some(u=>u.kind===k);
  if(has("fridge")) add("التلاجة",WATT.fridge,"fridge");
  if(has("washer")) add("الغسالة",WATT.washer,"ded");
  if(has("dish")) add("غسالة الأطباق",WATT.dish,"ded");
  if(cfg.stoveType==="built"&&has("stove")) add("الفرن البلت إن",WATT.oven,"ded20");
  if(cfg.micro!=="none") add("الميكروويف",WATT.micro,"counter");
  if(has("hood")) add("الشفاط",WATT.hood,"light");
  if(cfg.led&&cfg.upper!=="none") add("إضاءة LED",WATT.led,"light");
  add("إضاءة السقف",Math.max(40,(LIGHTQ.n||0)*7),"light");
  for(const a of cfg.apps||[]){ const T=APPS[a.type]; if(!T||!T.need.includes("socket")) continue; const w=WATT[a.type]||600; add(T.n,w,w>=2400?"ded20":w>=1800&&T.cls!=="counter"?"ded":T.cls==="counter"?"counter":"gen"); }
  const cs=POINTS.filter(p=>p.type==="socket"&&/فوق الرخامة/.test(p.note)).length;
  if(cs) add(`برايز الرخامة (${cs}) للغلاية والأجهزة الصغيرة`,2000,"counter");
  const circuits=[]; const cc={n:0};
  for(const r of rows){ if(r.circ==="ded") circuits.push({n:r.n,a:16,mm:"2.5",why:"خط لوحده"}); if(r.circ==="ded20") circuits.push({n:r.n,a:20,mm:"4",why:"خط لوحده"}); }
  if(rows.some(r=>r.circ==="fridge")) circuits.push({n:"التلاجة",a:16,mm:"2.5",why:"خط لوحده عشان متفصلش مع أي جهاز تاني"});
  const cnt=Math.max(1,Math.ceil(cs/4)); if(cs||rows.some(r=>r.circ==="counter"||r.circ==="gen")) for(let i=0;i<cnt;i++) circuits.push({n:`برايز الرخامة ${cnt>1?(i+1):""}`.trim(),a:16,mm:"2.5",why:"4 برايز بالكتير على الخط"});
  circuits.push({n:"الإضاءة والشفاط",a:10,mm:"1.5",why:""});
  const total=rows.reduce((s,r)=>s+r.w,0), demand=Math.round(total*0.6);
  return {rows,circuits,total,demand,amps:Math.round(demand/220)};
}
// ======== compare projects ========
async function projMetrics(ids){
  const saved=cfg, savedLoad=loadingP; loadingP=true; SLIDING=true; const out=[];
  try{ for(const id of ids){ let c; if(id===PROJ.id) c=saved; else { const d=await stGet("kproj:"+id); if(!d) continue; c=migrate(d.cfg); }
      cfg=c; build(); const a=STATS.acc, cost=a.lower*cfg.pLower+a.upper*cfg.pUpper+a.tall*cfg.pTall+a.marble*cfg.pMarble, el=elecLoads();
      out.push({id,name:(projIndex.find(p=>p.id===id)||PROJ).name,net:STATS.net,walk:STATS.walk,counter:STATS.counter,acc:{...a},cost,vol:STATS.vol,tri:TRI?TRI.total:null,triScore:TRI?TRI.score:null,warn:[...new Set(STATS.warn)].length,sockets:POINTS.filter(p=>p.type==="socket").length,water:POINTS.filter(p=>p.type==="water").length,kw:(el.demand/1000).toFixed(1),tpl:tplName(cfg.template)}); } }
  finally{ cfg=saved; SLIDING=false; build(); loadingP=savedLoad; }
  return out;
}
function compareUI(el){
  const h=document.createElement("div"); h.className="head"; h.textContent="⚖ قارن بين مطبخين"; el.appendChild(h);
  const list=[...projIndex]; if(!list.some(p=>p.id===PROJ.id)) list.push({id:PROJ.id,name:PROJ.name,t:Date.now()});
  if(list.length<2){ const n=document.createElement("div"); n.className="note"; n.textContent="اعمل نسخة من المطبخ وغيّر فيها، وبعدين قارن بينهم هنا."; el.appendChild(n); return; }
  const mk=v=>{ const s=document.createElement("select"); for(const p of list){ const o=document.createElement("option"); o.value=p.id; o.textContent=p.name; s.appendChild(o); } s.value=v; return s; };
  const s1=mk(PROJ.id), s2=mk((list.find(p=>p.id!==PROJ.id)||list[0]).id); const b=document.createElement("button"); b.className="btn main"; b.textContent="قارن";
  const row=document.createElement("div"); row.className="addrow"; row.append(s1,s2,b); el.appendChild(row);
  const res=document.createElement("div"); res.className="tbl"; el.appendChild(res);
  b.onclick=async()=>{ res.innerHTML="<div class='note'>بحسب…</div>"; const m=await projMetrics([s1.value,s2.value]); if(m.length<2){ res.innerHTML="<div class='note'>مش قادر أفتح واحد منهم</div>"; return; }
    const [A,B]=m, best=(x,y,hi)=>x===y||x==null||y==null?["",""]:(hi?x>y:x<y)?[" style='background:#e5f3e9;font-weight:bold'",""]:[""," style='background:#e5f3e9;font-weight:bold'"];
    const R=(t,a,b,fa,fb,hi)=>{ const [ca,cb]=hi===undefined?["",""]:best(fa,fb,hi); return `<tr><td>${t}</td><td${ca}>${a}</td><td${cb}>${b}</td></tr>`; };
    const money=v=>v>0?Math.round(v).toLocaleString("ar-EG")+" ج":"—";
    res.innerHTML=`<table style="min-width:0"><tr><th></th><th>${esc(A.name)}</th><th>${esc(B.name)}</th></tr>`+
      R("الشكل",A.tpl,B.tpl)+R("المقاس الصافي",A.net.join("×"),B.net.join("×"))+
      R("مساحة التخزين",A.vol+" لتر",B.vol+" لتر",A.vol,B.vol,true)+
      R("الرخامة",(A.acc.marble).toFixed(2)+" م",(B.acc.marble).toFixed(2)+" م",A.acc.marble,B.acc.marble,true)+
      R("دواليب سفلي / علوي / طول",`${A.acc.lower.toFixed(1)} / ${A.acc.upper.toFixed(1)} / ${A.acc.tall.toFixed(1)}`,`${B.acc.lower.toFixed(1)} / ${B.acc.upper.toFixed(1)} / ${B.acc.tall.toFixed(1)}`)+
      R("التكلفة التقريبية",money(A.cost),money(B.cost),A.cost||null,B.cost||null,false)+
      R("أضيق ممر",A.walk+" سم",B.walk+" سم",A.walk,B.walk,true)+
      R("مثلث العمل",A.tri?A.tri.toFixed(1)+" م"+" "+"★".repeat(A.triScore):"—",B.tri?B.tri.toFixed(1)+" م"+" "+"★".repeat(B.triScore):"—",A.triScore,B.triScore,true)+
      R("التحذيرات",A.warn,B.warn,A.warn,B.warn,false)+
      R("برايز / نقط مية",`${A.sockets} / ${A.water}`,`${B.sockets} / ${B.water}`)+
      R("الحمل الكهربي التقريبي",A.kw+" ك.و",B.kw+" ك.و")+`</table>`; };
}
// ======== open cabinets ========
let OPENU=false; const OPENSET=new Set(); const CABK=new Set(["base","upper","tall","sink"]);
function carcass(f,a0,a1,back,front,y0,y1,mat,shelves){
  if(!OPENU){ place(f,a0,a1,back,front,y0,y1,mat); return; }
  const dr=dirOf(f), t=0.018, inn=M("#efe8dc",{roughness:0.8});
  place(f,a0,a1,back,back+t*dr,y0,y1,inn); place(f,a0,a0+t,back,front,y0,y1,mat); place(f,a1-t,a1,back,front,y0,y1,mat);
  place(f,a0,a1,back,front,y0,y0+t,inn); place(f,a0,a1,back,front,y1-t,y1,mat);
  const n=shelves==null?Math.max(1,Math.floor((y1-y0)/0.36)-1):shelves; for(let i=1;i<=n;i++){ const y=y0+i*(y1-y0)/(n+1); place(f,a0+t,a1-t,back+t*dr,front-0.03*dr,y,y+0.018,inn); }
}

function base(f,a0,a1,back,depth,kind,regKind){
  depth=depth||0.6; const dr=dirOf(f), ch=CH(), front=back+(depth-0.02)*dr;
  const u=newUnit(regKind||"base",f,a0,a1,back,depth,0,ch); const prevUid=curUid; curUid=u.id;
  place(f,a0,a1,back,front-0.05*dr,0,0.1,MAT.plinth);
  const top=cfg.handles==="none"?ch-0.08:ch-0.045;
  if(cfg.handles==="none") place(f,a0,a1,front-0.02*dr,front,ch-0.08,ch-0.045,MAT.gola);
  let mode=kind==="doors"?"doors":cfg.fronts==="mixed"?((a1-a0)>=0.5&&kind!=="narrow"?"drawers":"doors"):cfg.fronts;
  if(!regKind && (a1-a0)<0.28 && f==="+x") mode="bottle";
  const o=unitOpt(u.id); if(o.front && o.front!=="auto") mode=o.front; u.front=mode; u.acc=o.acc||""; const nn=+o.n||null;
  if(mode==="open") place(f,a0,a1,back,front,0.1,ch-0.04,MAT.base); else carcass(f,a0,a1,back,front,0.1,ch-0.04,MAT.base,mode==="drawers"?0:Math.max(1,+o.shelves||1));
  if(mode==="drawers") drawers(f,a0,a1,front,0.11,top,nn);
  else if(mode==="drawer_door"){ const dh=0.17; place(f,a0+0.003,a1-0.003,front,front+0.02*dr,top-dh,top-0.003,MAT.base); handle(f,a0,a1,front+0.02*dr,top-0.05); doorPanels(f,a0,a1,front,0.11,top-dh-0.003,MAT.base,"top",nn); }
  else if(mode==="open"){ place(f,a0+0.02,a1-0.02,front-0.004*dr,front+0.001*dr,0.12,top,M(shade(cfg.cWood,0.7),{roughness:0.8})); const ns=Math.max(1,+o.shelves||1);
    for(let i=1;i<=ns;i++){ const y=0.11+i*(top-0.11)/(ns+1); place(f,a0+0.02,a1-0.02,front-0.3*dr,front+0.005*dr,y,y+0.02,MAT.wood); } }
  else if(mode==="bottle"||mode==="trash"){ place(f,a0+0.003,a1-0.003,front,front+0.02*dr,0.11,top,MAT.base); handle(f,a0,a1,front+0.02*dr,top-0.05); }
  else doorPanels(f,a0,a1,front,0.11,top,MAT.base,"top",nn);
  place(f,a0,a1,back,back+(depth+0.02)*dr,ch-0.04,ch,MAT.counter);
  ACC.lower+=a1-a0; ACC.marble+=a1-a0;
  curUid=prevUid; return u;
}
function sink(f,a0,a1,back){
  const su=base(f,a0,a1,back,0.6,"doors","sink"); curUid=su.id;
  const dr=dirOf(f), m=(a0+a1)/2, ch=CH(), sw=Math.min(a1-a0,cfg.sinkW/100)-0.02, sd=Math.min(0.58,cfg.sinkD/100);
  const d0=back+(0.6-sd)/2*dr+0.02*dr, d1=d0+sd*dr;
  place(f,m-sw/2,m+sw/2,d0,d1,ch,ch+0.006,MAT.steel);
  const bowl=(c,hw)=>place(f,c-hw,c+hw,d0+0.04*dr,d1-0.04*dr,ch+0.006,ch+0.009,MAT.dark);
  if(cfg.sinkType==="double" && sw>=0.7){ bowl(m-sw/4,sw/4-0.04); bowl(m+sw/4,sw/4-0.04); }
  else if(sw>=0.7){ const bw=Math.min(0.5,sw*0.58); bowl(m-sw/2+0.04+bw/2,bw/2);
    for(let i=0;i<5;i++){ const x=m-sw/2+0.08+bw+i*((sw-bw-0.14)/4); place(f,x,x+0.006,d0+0.06*dr,d1-0.06*dr,ch+0.006,ch+0.01,MAT.dark); } }
  else bowl(m,sw/2-0.04);
  cylAt(f,m,back+0.06*dr,ch+0.15,0.015,0.3,MAT.steel);
  place(f,m-0.012,m+0.012,back+0.06*dr,back+0.26*dr,ch+0.28,ch+0.30,MAT.steel);
  curUid=null; return su;
}
function burners(f,a0,a1,back,ch,D){
  D=D||0.6; const dr=dirOf(f), five=(a1-a0)>0.75;
  const pts=five?[[0.2,0.3],[0.2,0.72],[0.8,0.3],[0.8,0.72],[0.5,0.5]]:[[0.28,0.3],[0.72,0.3],[0.28,0.7],[0.72,0.7]];
  for(const [u,v] of pts) cylAt(f,a0+(a1-a0)*u,back+D*v*dr,ch+0.01,u===0.5?0.08:0.065,0.02,M("#111214"));
}
function stove(f,a0,a1,back){
  const dr=dirOf(f), ch=CH();
  if(cfg.stoveType!=="built"){ const g=cfg.stoveGap/100; a0+=g; a1-=g; }
  const D=cfg.stoveD/100, SH=cfg.stoveH/100, front=back+(cfg.stoveType==="built"?0.6:D)*dr;
  const su=newUnit("stove",f,a0,a1,back,cfg.stoveType==="built"?0.6:D,0,cfg.stoveType==="built"?ch:SH,{front:cfg.stoveType==="built"?"مسطح + فرن بلت إن":"بوتاجاز عادي"}); curUid=su.id;
  if(cfg.openDoors){ const oh=cfg.stoveType==="built"?0.59:SH-0.32, fr=cfg.stoveType==="built"?front:front+0.015*dr;
    place(f,a0+0.04,a1-0.04,fr,fr+oh*dr,0.12,0.145,M("#2a2d31",{transparent:true,opacity:0.85}));
    DOORCHK.push({wall:curWall||curSide,what:"باب الفرن",f,a:(a0+a1)/2,front:fr,reach:oh}); }
  if(cfg.stoveType==="built"){
    place(f,a0,a1,back,front-0.05*dr,0,0.1,MAT.plinth);
    place(f,a0,a1,back,front-0.02*dr,0.1,ch-0.04,MAT.base);
    place(f,a0+0.01,a1-0.01,front-0.02*dr,front,0.13,0.72,M("#23262a",{roughness:0.15,metalness:0.4}));
    if(!cfg.openDoors) place(f,a0+0.06,a1-0.06,front,front+0.005*dr,0.2,0.6,M("#3b4148",{roughness:0.05}));
    place(f,a0+0.08,a1-0.08,front,front+0.03*dr,0.66,0.675,MAT.steel);
    place(f,a0+0.01,a1-0.01,front-0.02*dr,front,0.74,ch-0.05,MAT.base); handle(f,a0,a1,front,ch-0.1);
    place(f,a0,a1,back,back+0.62*dr,ch-0.04,ch,MAT.counter); ACC.marble+=a1-a0;
    place(f,a0+0.03,a1-0.03,back+0.05*dr,back+0.55*dr,ch,ch+0.006,MAT.black);
    burners(f,a0,a1,back,ch); curUid=null; return su;
  }
  place(f,a0,a1,back,front,0,SH-0.02,M("#c8ccd0",{metalness:0.6,roughness:0.35}));
  place(f,a0,a1,back,front,SH-0.02,SH,MAT.black);
  if(!cfg.openDoors) place(f,a0+0.06,a1-0.06,front,front+0.015*dr,0.12,SH-0.2,M("#2a2d31",{roughness:0.15,metalness:0.3}));
  burners(f,a0,a1,back,SH,D);
  const nk=(a1-a0)>0.75?5:4; for(let i=0;i<nk;i++) cylAt(f,a0+0.1+i*((a1-a0-0.2)/(nk-1)),front+0.015*dr,SH-0.1,0.02,0.03,M("#222"),true);
  curUid=null; return su;
}
function washer(f,a0,a1,back,withTop){
  const dr=dirOf(f), m=(a0+a1)/2, ww=cfg.washerW/100, b0=back+(cfg.washerBack/100)*dr, front=b0+(cfg.washerD/100)*dr, WH=Math.min(cfg.washerH/100,CH()-0.045);
  const wu=newUnit("washer",f,a0,a1,back,cfg.washerBack/100+cfg.washerD/100,0,withTop!==false?CH():WH,{front:`${cfg.washerW}×${cfg.washerD}`}); curUid=wu.id;
  place(f,m-ww/2,m+ww/2,b0,front,0,WH,MAT.white);
  if(withTop!==false){ place(f,a0,a1,back,back+0.62*dr,CH()-0.04,CH(),MAT.counter); ACC.marble+=a1-a0; }
  const r=Math.min(0.2,ww*0.34);
  if(cfg.openDoors){ place(f,m-r-0.01,m-r+0.01,front,front+2*r*dr,WH*0.5-r,WH*0.5+r,M("#8d99a4",{transparent:true,opacity:0.8})); DOORCHK.push({wall:curWall||curSide,what:"باب الغسالة",f,a:m,front,reach:2*r}); }
  else { cylAt(f,m,front+0.01*dr,WH*0.5,r,0.02,MAT.steel,true);
  cylAt(f,m,front+0.015*dr,WH*0.5,r*0.8,0.03,M("#39424b",{roughness:0.1}),true); }
  place(f,m-ww/2+0.03,m+ww/2-0.03,front,front+0.005*dr,WH-0.1,WH-0.03,M("#dfe2e5"));
  curUid=null; return wu;
}
function dish(f,a0,a1,back){
  const dr=dirOf(f), front=back+0.58*dr, ch=CH();
  const du=newUnit("dish",f,a0,a1,back,0.6,0,ch,{front:"باب بنفس لون الدواليب"}); curUid=du.id;
  if(cfg.openDoors){ place(f,a0+0.01,a1-0.01,front,front+0.58*dr,0.1,0.125,M("#b8bec4",{transparent:true,opacity:0.85})); DOORCHK.push({wall:curWall||curSide,what:"باب غسالة الأطباق",f,a:(a0+a1)/2,front,reach:0.58}); }
  place(f,a0,a1,back,front-0.05*dr,0,0.1,MAT.plinth);
  place(f,a0+0.005,a1-0.005,back,front,0.1,ch-0.045,M("#d5d9dd",{metalness:0.5,roughness:0.3}));
  place(f,a0+0.005,a1-0.005,front,front+0.02*dr,0.11,ch-0.05,MAT.base); handle(f,a0,a1,front+0.02*dr,ch-0.1);
  place(f,a0,a1,back,back+0.62*dr,ch-0.04,ch,MAT.counter); ACC.marble+=a1-a0; curUid=null; return du;
}
function fridge(f,a0,a1,back){ // a0..a1 = fridge body; back = wall
  const dr=dirOf(f), b0=back+(cfg.fridgeBack/100)*dr, front=b0+(cfg.fridgeD/100)*dr, FH=cfg.fridgeH/100, body=M("#d9dde1",{metalness:0.35,roughness:0.35});
  const fu=newUnit("fridge",f,a0,a1,back,cfg.fridgeBack/100+cfg.fridgeD/100,0,FH,{front:`${cfg.fridgeW}×${cfg.fridgeD}`}); curUid=fu.id;
  const sp=FH*0.64;
  if(cfg.openDoors){
    place(f,a0,a1,b0,front-0.05*dr,0,FH,body);
    DOORCHK.push({fridge:true,wall:fu.wall,side:curSide,f,a0,a1,front:front-0.05*dr,back,FH,uid:fu.id});
  } else {
    place(f,a0,a1,b0,front,0,FH,body);
    place(f,a0,a1,front,front+0.004*dr,sp,sp+0.015,M("#7d848b"));
    place(f,a1-0.08,a1-0.06,front,front+0.05*dr,sp-0.43,sp-0.08,MAT.dark);
    place(f,a1-0.08,a1-0.06,front,front+0.05*dr,sp+0.12,Math.min(FH-0.1,sp+0.42),MAT.dark);
  }
  curUid=null; return fu;
}
function fridgeDoor(dc,avail){ // draw the opened door after the whole kitchen exists
  const W=dc.a1-dc.a0, FH=dc.FH, sgn=cfg.fridgeHinge==="a0"?1:-1, hingeA=sgn>0?dc.a0:dc.a1, az=alongZ(dc.f);
  const nv=dirOf(dc.f), maxT=avail>=W?Math.PI/2:Math.asin(Math.max(0,avail)/W);
  const P=(t,r)=>{ const al=hingeA+sgn*r*Math.cos(t), nn=dc.front+nv*r*Math.sin(t); return az?[nn,al]:[al,nn]; };
  const [cx,cz]=P(maxT,W/2), [hx,hz]=P(0,0), [ex,ez]=P(maxT,W);
  const m=new THREE.Mesh(new THREE.BoxGeometry(W,FH,0.05),M("#c9ced3",{metalness:0.35,roughness:0.35,transparent:true,opacity:0.85}));
  m.position.set(cx,FH/2,cz); m.rotation.y=Math.atan2(-(ez-hz),(ex-hx)); m.userData.side=dc.side; m.userData.uid=dc.uid; root.add(m);
  const ptsA=[]; for(let i=0;i<=24;i++){ const [x,z]=P(maxT*i/24,W); ptsA.push(new THREE.Vector3(x,0.01,z)); }
  root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsA),new THREE.LineBasicMaterial({color:0xe07b00})));
  const deg=Math.round(maxT*180/Math.PI); label(deg>=90?"باب التلاجة بيفتح 90° ✓":`باب التلاجة بيفتح ${deg}° بس`,cx,FH+0.1,cz,deg>=90?"#2e7d4f":"#b3452c");
  return deg;
}
function appLabel(t,f,a,d,y){ if(!cfg.appLabels||!cfg.labels) return; t=t.replace(/(\d+)×(\d+)/,"عرض $1 · عمق $2"); const [x,z]=alongZ(f)?[d,a]:[a,d]; label(t,x,y,z,"#555c63",0.5); }
function uppers(f,a0,a1,back,y0,y1,depth){
  if(a1-a0<0.1||y1-y0<0.15){ KEY=null; return; }
  depth=depth||cfg.uDepth/100; const dr=dirOf(f), front=back+depth*dr;
  ACC.upper+=(a1-a0)*(y1-y0>0.9?2:1);
  const u=newUnit("upper",f,a0,a1,back,depth,y0,y1); const prevUid=curUid; curUid=u.id;
  const o=unitOpt(u.id), nn=+o.n||null;
  const mode=(o.front&&o.front!=="auto")?o.front:(cfg.upperFront==="open"?"open":cfg.upperFront==="glass"?"glassLow":"doors"); u.front=mode; u.acc=o.acc||"";
  if(mode==="open"){
    place(f,a0,a1,back,back+0.015*dr,y0,y1,MAT.wood);
    if(o.shelves){ const ns=+o.shelves; for(let i=0;i<ns;i++){ const y=y0+(ns===1?0:i*(y1-y0-0.03)/(ns-1)); place(f,a0,a1,back,front,y,y+0.03,MAT.wood); } }
    else for(let y=y0;y<y1-0.05;y+=0.36) place(f,a0,a1,back,front,y,y+0.03,MAT.wood);
    curUid=prevUid; return;
  }
  carcass(f,a0,a1,back,front,y0,y1,MAT.upper,+o.shelves||(y1-y0>0.9?3:1));
  const tiers = y1-y0>0.9 ? [[y0,y0+0.72,"bottom"],[y0+0.72,y1,"bottom"]] : [[y0,y1,"bottom"]];
  tiers.forEach(([s,e,h],i)=>{
    if(mode==="lift") doorPanels(f,a0,a1,front,s+0.005,e-0.005,MAT.upper,"bottom",Math.max(1,Math.round((a1-a0)/0.9)));
    else doorPanels(f,a0,a1,front,s+0.005,e-0.005,MAT.upper,h,nn,mode==="glass"||(mode==="glassLow"&&i===0)); });
  if(cfg.led && y0<1.75){ place(f,a0+0.02,a1-0.02,back+(depth-0.06)*dr,back+(depth-0.03)*dr,y0-0.012,y0-0.004,MAT.led); }
  curUid=prevUid;
}
function tall(f,a0,a1,back,depth,y0,y1){
  if(a1-a0<0.1){ KEY=null; return; }
  const dr=dirOf(f), front=back+depth*dr; y0=y0||0; y1=y1||H-0.01;
  if(y0===0) ACC.tall+=a1-a0; else ACC.upper+=a1-a0;
  const u=newUnit(y0===0?"tall":"upper",f,a0,a1,back,depth,y0,y1); const prevUid=curUid; curUid=u.id;
  const o=unitOpt(u.id), nn=+o.n||null; u.front=(o.front==="open")?"open":"doors"; u.acc=o.acc||"";
  if(o.front==="open"){ if(y0===0) place(f,a0,a1,back,front-0.04*dr,0,0.1,MAT.plinth);
    place(f,a0,a1,back,back+0.015*dr,Math.max(y0,0.1),y1,MAT.wood); place(f,a0,a0+0.018,back,front,Math.max(y0,0.1),y1,MAT.wood); place(f,a1-0.018,a1,back,front,Math.max(y0,0.1),y1,MAT.wood);
    const ys0=Math.max(y0,0.1), ns=+o.shelves||Math.max(1,Math.floor((y1-ys0)/0.36));
    for(let i=0;i<ns;i++){ const y=ys0+i*(y1-ys0-0.03)/Math.max(1,ns-1); place(f,a0,a1,back,front,y,y+0.025,MAT.wood); } curUid=prevUid; return; }
  if(y0===0) place(f,a0,a1,back,front-0.04*dr,0,0.1,MAT.plinth);
  carcass(f,a0,a1,back,front,Math.max(y0,y0===0?0.1:y0),y1,MAT.base,+o.shelves||null);
  const s0=Math.max(y0,y0===0?0.11:y0);
  if(y1-s0>1.4){ const mid=s0+(y1-s0)*0.62; doorPanels(f,a0,a1,front,s0,mid-0.003,MAT.base,null,nn); doorPanels(f,a0,a1,front,mid+0.003,y1,MAT.base,null,nn);
    const n=nn||Math.max(1,Math.round((a1-a0)/0.48)),w=(a1-a0)/n; for(let i=0;i<n;i++) handle(f,a0+i*w,a0+(i+1)*w,front+0.02*dr,mid,true); }
  else doorPanels(f,a0,a1,front,s0,y1,MAT.base,"bottom",nn);
  curUid=prevUid;
}
function label(text,x,y,z,color,prio){ /* prio: which label stays when two overlap on screen (declutterLabels); red warnings 3, default 1 */
  if(!cfg.labels)return;
  const c=document.createElement("canvas"), ctx=c.getContext("2d"); const fs=44;
  ctx.font=`bold ${fs}px Tahoma,Arial`; const w=ctx.measureText(text).width+40; c.width=w; c.height=fs+30;
  ctx.font=`bold ${fs}px Tahoma,Arial`; ctx.fillStyle=color||"#2d5f7a"; ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(0,0,w,c.height,18);else ctx.rect(0,0,w,c.height); ctx.fill();
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.direction="rtl"; ctx.fillText(text,w/2,c.height/2+2);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));
  const k=0.0028; sp.scale.set(w*k,c.height*k,1); sp.position.set(x,y,z); sp.renderOrder=10; sp.userData.label=true; sp.userData.prio=prio!=null?prio:/^#(b3452c|a6473a)$/i.test(color||"")?3:1; root.add(sp);
}
