// =================== LIVING ROOMS & BEDROOMS (furnished rooms) ===================
const FURN={
  sofa3:{n:"كنبة 3 مقاعد",cat:"جلوس",w:220,d:90,h:85,lim:[160,280,80,110],col:"fab"},
  sofa2:{n:"كنبة 2 مقعد",cat:"جلوس",w:160,d:90,h:85,lim:[130,200,80,110],col:"fab"},
  corner:{n:"ركنة L",cat:"جلوس",w:280,d:200,h:85,lim:[200,350,150,300],col:"fab"},
  arm:{n:"فوتيه",cat:"جلوس",w:85,d:85,h:85,lim:[65,110,65,110],col:"fab"},
  coffee:{n:"ترابيزة وسط",cat:"جلوس",w:110,d:60,h:42,lim:[60,160,40,100],col:"wood"},
  side:{n:"ترابيزة جانبية",cat:"جلوس",w:50,d:50,h:55,lim:[35,70,35,70],col:"wood"},
  tvunit:{n:"وحدة تليفزيون",cat:"تليفزيون",w:200,d:45,h:50,lim:[100,300,30,60],col:"wood"},
  tv:{n:"شاشة على الحيطة",cat:"تليفزيون",w:123,d:6,h:71,lim:[80,190,4,10],wall:true,y:110,var:[["55","55 بوصة"],["43","43 بوصة"],["65","65 بوصة"],["75","75 بوصة"]]},
  dining:{n:"سفرة",cat:"سفرة",w:180,d:90,h:75,lim:[90,280,80,120],col:"wood",var:[["6","6 كراسي"],["4","4 كراسي"],["8","8 كراسي"]]},
  buffet:{n:"بوفيه",cat:"سفرة",w:160,d:50,h:90,lim:[100,240,40,60],col:"wood"},
  wallunit:{n:"وحدة حيطة مفصّلة (مكتبة / تليفزيون)",cat:"تخزين",w:300,d:40,h:240,lim:[60,800,20,70],col:"wood",tall:true,modular:true,var:[["hinged","ضلف عادية"],["sliding","ضلف سحاب"]]},
  shelf:{n:"مكتبة",cat:"تخزين",w:90,d:35,h:200,lim:[50,240,25,50],col:"wood",tall:true},
  shoe:{n:"جزامة",cat:"تخزين",w:100,d:35,h:110,lim:[60,160,25,45],col:"wood"},
  console:{n:"كونسول ومراية",cat:"تخزين",w:120,d:40,h:80,lim:[80,180,30,50],col:"wood"},
  bed2:{n:"سرير دبل",cat:"نوم",w:180,d:205,h:110,lim:[140,200,190,220],col:"fab",var:[["180","180×200"],["160","160×200"],["200","200×200"]]},
  bed1:{n:"سرير فردي",cat:"نوم",w:100,d:205,h:100,lim:[80,130,180,215],col:"fab"},
  bunk:{n:"سرير دورين",cat:"نوم",w:100,d:205,h:165,lim:[90,130,190,215],col:"wood",tall:true},
  crib:{n:"سرير بيبي",cat:"نوم",w:70,d:130,h:95,lim:[60,80,120,140],col:"white"},
  night:{n:"كومودينو",cat:"نوم",w:50,d:40,h:55,lim:[35,70,30,50],col:"wood"},
  wardrobe:{n:"دولاب هدوم",cat:"نوم",w:240,d:60,h:230,lim:[60,800,35,80],col:"wood",tall:true,modular:true,var:[["hinged","ضلف عادية"],["sliding","ضلف سحاب"]]},
  dresser:{n:"تسريحة",cat:"نوم",w:120,d:45,h:78,lim:[80,160,35,55],col:"wood"},
  chest:{n:"شيفونيرة",cat:"نوم",w:90,d:50,h:110,lim:[60,140,40,60],col:"wood"},
  desk:{n:"مكتب وكرسي",cat:"مكتب",w:120,d:60,h:75,lim:[80,180,45,80],col:"wood"},
  toys:{n:"أرفف لعب",cat:"مكتب",w:100,d:35,h:100,lim:[60,160,25,45],col:"white"},
  ac:{n:"تكييف سبليت",cat:"تكييف وديكور",w:90,d:25,h:30,lim:[70,110,20,30],wall:true,y:220,var:[["1.5","1.5 حصان"],["2.25","2.25 حصان"],["3","3 حصان"]]},
  acfloor:{n:"تكييف عمودي",cat:"تكييف وديكور",w:50,d:35,h:180,lim:[40,60,30,45],tall:true,var:[["3","3 حصان"],["5","5 حصان"]]},
  acout:{n:"وحدة تكييف خارجية",cat:"تكييف وديكور",w:80,d:30,h:55,lim:[60,100,25,40],col:"white"},
  clothes:{n:"منشر غسيل",cat:"تكييف وديكور",w:120,d:50,h:110,lim:[60,200,30,80]},
  rug:{n:"سجادة",cat:"تكييف وديكور",w:200,d:300,h:1,lim:[80,400,60,500]},
  lamp:{n:"لمبادير",cat:"تكييف وديكور",w:40,d:40,h:165,lim:[30,50,30,50]},
  plant:{n:"زرعة",cat:"تكييف وديكور",w:45,d:45,h:120,lim:[25,70,25,70]}
};
const RTEMPLATES={
  r_living:{name:"صالة",dims:[400,500],rtype:"living",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-150)/2),w:150,y:90,h:140},{id:"door",type:"opening",wall:"D",pos:30,w:100,y:0,h:220,d:0}],
    furn:[{id:"f1",type:"sofa3",snap:"L",pos:Math.round((l-220)/2),w:220,d:90},{id:"f2",type:"tvunit",snap:"RT",pos:Math.round((l-200)/2),w:200,d:45},{id:"f3",type:"tv",var:"55",snap:"RT",pos:Math.round((l-123)/2),w:123,d:6,y:110},
      {id:"f4",type:"coffee",x:150,z:Math.round(l/2),rot:90,w:110,d:60},{id:"f5",type:"arm",x:210,z:Math.round(l/2)-150,rot:0,w:85,d:85},{id:"f6",type:"arm",x:210,z:Math.round(l/2)+150,rot:180,w:85,d:85},
      {id:"f7",type:"rug",x:170,z:Math.round(l/2),rot:90,w:300,d:200},{id:"f8",type:"ac",var:"2.25",snap:"W",pos:30,w:90,d:25,y:220},{id:"f9",type:"plant",x:w-30,z:30,rot:0,w:45,d:45}]}; }},
  r_recep:{name:"ريسبشن وسفرة",dims:[450,600],rtype:"living",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-180)/2),w:180,y:90,h:140},{id:"door",type:"door",wall:"D",pos:W-120,w:100,y:0,h:220,d:0}],
    furn:[{id:"f1",type:"corner",snap:"L",pos:20,w:260,d:200},{id:"f2",type:"tvunit",snap:"RT",pos:40,w:200,d:45},{id:"f3",type:"tv",var:"65",snap:"RT",pos:52,w:145,d:6,y:110},{id:"f4",type:"coffee",x:150,z:130,rot:90,w:110,d:60},
      {id:"f5",type:"dining",var:"6",x:Math.round(w/2),z:l-150,rot:0,w:180,d:90},{id:"f6",type:"buffet",snap:"L",pos:l-190,w:160,d:50},{id:"f7",type:"ac",var:"3",snap:"W",pos:40,w:100,d:25,y:220},{id:"f8",type:"rug",x:170,z:170,rot:0,w:200,d:250}]}; }},
  r_master:{name:"أوضة نوم رئيسية",dims:[400,420],rtype:"bed",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"win",type:"window",wall:"RT",pos:40,w:120,y:100,h:130},{id:"door",type:"door",wall:"D",pos:W-110,w:90,y:0,h:210,d:90}],
    furn:[{id:"f1",type:"bed2",var:"180",snap:"W",pos:Math.round((w-180)/2)-20,w:180,d:205},{id:"f2",type:"night",snap:"W",pos:Math.round((w-180)/2)-75,w:50,d:40},{id:"f3",type:"night",snap:"W",pos:Math.round((w+180)/2)-15,w:50,d:40},
      {id:"f4",type:"wardrobe",var:"sliding",snap:"D",pos:20,w:240,d:60},{id:"f5",type:"dresser",snap:"RT",pos:190,w:120,d:45},{id:"f6",type:"ac",var:"1.5",snap:"L",pos:150,w:90,d:25,y:220}]}; }},
  r_kids:{name:"أوضة أطفال",dims:[300,400],rtype:"bed",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-100)/2),w:100,y:110,h:120},{id:"door",type:"door",wall:"D",pos:W-100,w:80,y:0,h:210,d:80}],
    furn:[{id:"f1",type:"bed1",x:50,z:163,rot:0,w:100,d:205},{id:"f2",type:"bed1",x:w-50,z:163,rot:0,w:100,d:205},{id:"f3",type:"desk",snap:"W",pos:Math.round((w-90)/2),w:90,d:60},{id:"f4",type:"wardrobe",var:"sliding",snap:"D",pos:15,w:150,d:60},{id:"f6",type:"ac",var:"1.5",snap:"L",pos:120,w:90,d:25,y:220}]}; }},
  r_balcony:{name:"بلكونة",dims:[350,160],rtype:"living",ceil:"flat",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"rail",type:"railing",wall:"W",pos:0,w:W,h:110},{id:"door",type:"door",wall:"D",pos:Math.round((W-90)/2),w:90,y:0,h:220,d:0}],
    furn:[{id:"f1",type:"arm",x:55,z:80,rot:180,w:85,d:85},{id:"f2",type:"side",x:125,z:80,rot:0,w:50,d:50},{id:"f3",type:"arm",x:195,z:80,rot:180,w:85,d:85},{id:"f4",type:"plant",x:w-25,z:30,rot:0,w:45,d:45},{id:"f5",type:"acout",snap:"RT",pos:60,w:80,d:30}]}; }},
  r_guest:{name:"أوضة ضيوف / مكتب",dims:[300,350],rtype:"bed",make:(W,L)=>{ const w=W-6,l=L-6; return {feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-100)/2),w:100,y:100,h:130},{id:"door",type:"door",wall:"D",pos:W-100,w:80,y:0,h:210,d:80}],
    furn:[{id:"f1",type:"bed1",x:w-60,z:160,rot:0,w:120,d:205},{id:"f2",type:"desk",snap:"W",pos:50,w:120,d:55},{id:"f3",type:"shelf",snap:"L",pos:125,w:80,d:35},{id:"f4",type:"wardrobe",var:"hinged",snap:"D",pos:20,w:120,d:60},{id:"f5",type:"ac",var:"1.5",snap:"L",pos:40,w:90,d:25,y:220}]}; }}
};
let ROOMQ=null;
const SECK=[["doors","ضلف"],["drawers","أدراج تحت + ضلف"],["hanging","علّاقة مفتوحة"],["open","أرفف مفتوحة"],["mirror","ضلفة مراية"],["gap","فراغ فاضي"],["desk","مكتب في الفراغ"],["tv","مكان تليفزيون"],["dresser","تسريحة في الفراغ"]];
function effDims(it,T){ T=T||FURN[it.type]||{h:100}; let w=it.w; if(it.fillW==="1"&&it.snap&&W4.includes(it.snap)) w=Math.max(20,Math.round(wlen(it.snap)*100)-(it.pos||0)-(it.endGap||0));
  const h=it.toCeil==="1"?Math.max(20,Math.round((H-gbWallDrop())*100)-1-(T.wall?0:(it.y||0))):(it.h||T.h); return {w,h}; }
function defaultSecs(it,wcm){ if(it.type==="wallunit") return wcm>=220?[{k:"open",w:0},{k:"tv",w:Math.min(200,Math.round(wcm*0.5))},{k:"open",w:0}]:[{k:"tv",w:0}];
  const n=Math.max(1,Math.round(wcm/90)); const a=[]; for(let i=0;i<n;i++) a.push({k:n>=3&&i===Math.floor(n/2)?"drawers":"doors",w:0}); return a; }
function secWidths(secs,w){ const fixed=secs.reduce((x,s)=>x+(s.w>0?s.w/100:0),0), autos=secs.filter(s=>!(s.w>0)).length; const aw=autos?Math.max(0.1,(w-fixed)/autos):0; let ws=secs.map(s=>s.w>0?s.w/100:aw); const tot=ws.reduce((x,y)=>x+y,0); if(tot>w+0.005) ws=ws.map(v=>v*w/tot); return {ws,over:fixed>w+0.005}; }

function furnRect(it){ // world rect (m) of a furniture item using the current room size
  const w=Math.min(effDims(it).w/100,it.snap&&W4.includes(it.snap)?wlen(it.snap):99), d=it.d/100; if(it.snap&&W4.includes(it.snap)){ const L=wlen(it.snap), a0=Math.max(0,Math.min(L-w,(it.pos||0)/100)), off=0.005+(it.off||0)/100; const r=rectAO(it.snap,a0,a0+w,off,off+d); const rot={W:0,RT:270,D:180,L:90}[it.snap]; return {...r,rot}; }
  const rot=((it.rot||0)%360+360)%360, sw=rot%180===0?w:d, sd=rot%180===0?d:w; let cx=(it.x||0)/100, cz=(it.z||0)/100; cx=Math.max(sw/2,Math.min(RW-sw/2,cx)); cz=Math.max(sd/2,Math.min(RL-sd/2,cz));
  return {x0:cx-sw/2,x1:cx+sw/2,z0:cz-sd/2,z1:cz+sd/2,rot};
}
function buildRoom(warn){
  const q={}; const fab=M(cfg.cSofa||"#8a9aa8",{roughness:0.9}), wood=M(cfg.cWood,{roughness:0.55}), white=M("#f4f4f2",{roughness:0.4}), dark=MAT.dark, metal=MAT.steel;
  const items=cfg.furn||[], recs=[];
  const order=[...items].sort((a,b)=>(a.type==="rug"?-1:0)-(b.type==="rug"?-1:0));
  for(const it of order){ const T=FURN[it.type]; if(!T) continue; const E=effDims(it,T), R=furnRect(it), rot=R.rot, w=(rot%180===0?R.x1-R.x0:R.z1-R.z0), d=it.d/100, cx=(R.x0+R.x1)/2, cz=(R.z0+R.z1)/2;
    const yo=T.wall?0:(it.y||0)/100, y0=T.wall?(it.y||T.y)/100:yo, H0=E.h/100, mcol=T.col==="fab"?fab:T.col==="white"?white:wood;
    const XZ=(lx,lz)=>rot===0?[cx+lx,cz+lz]:rot===90?[cx+lz,cz-lx]:rot===180?[cx-lx,cz-lz]:[cx-lz,cz+lx];
    const B=(lx0,lx1,lz0,lz1,ya,yb,mt)=>{ const [ax,az]=XZ(lx0,lz0), [bx,bz]=XZ(lx1,lz1); return box(Math.min(ax,bx),ya+yo,Math.min(az,bz),Math.max(ax,bx),yb+yo,Math.max(az,bz),mt); };
    const C=(lx,lz,y,r,h,mt)=>{ const [x,z]=XZ(lx,lz); return cyl(r,h,x,y+yo,z,mt); };
    let modParts=null;
    const hw=w/2, hd=d/2; // local: x from -hw..hw along width, z from -hd (back) .. +hd (front)
    let near=null, nd=1e9; for(const wl of W4){ const dd=wl==="L"?R.x0:wl==="RT"?RW-R.x1:wl==="W"?R.z0:RL-R.z1; if(dd<nd){ nd=dd; near=wl; } }
    let u; const lab={label:T.n+(T.var&&it.var?" "+((T.var.find(v=>v[0]===it.var)||[0,""])[1]):"")};
    if(it.snap&&W4.includes(it.snap)){ const frw=wallFrame(it.snap), al0=(it.snap==="W"||it.snap==="D")?R.x0:R.z0, al1=(it.snap==="W"||it.snap==="D")?R.x1:R.z1; curWall=it.snap; curSide=it.snap; u=newUnit("furn",frw.f,al0,al1,frw.back,0.005+(it.off||0)/100+d,y0,y0+(it.type==="tv"?(it.w/100)*0.58:H0),lab); }
    else { curSide=nd<0.2?near:null; curWall="FR"; u=newUnit("furn","+z",R.x0,R.x1,R.z0,R.z1-R.z0,y0,y0+(it.type==="tv"?(it.w/100)*0.58:H0),lab); }
    u.furn=it.id; u.ft=it.type; u.movable={obj:"furn",id:it.id}; curUid=u.id;
    if(T.modular&&(it.secs||it.type==="wallunit"||it.fillW==="1"||it.toCeil==="1"||it.topH>0)){
      const secs=(it.secs&&it.secs.length)?it.secs:defaultSecs(it,Math.round(w*100)), {ws,over}=secWidths(secs,w); if(over) warn.push(`أقسام ${T.n} أعرض من الدولاب نفسه`);
      const topH=(it.topH||0)/100, bodyTop=topH>0&&H0-topH>0.5?H0-topH:H0, hasTop=bodyTop<H0-0.001, inner=M(shade(cfg.cWood,1.12),{roughness:0.7}), mir=M("#dde6eb",{metalness:0.15,roughness:0.05}), hw=w/2, hd=d/2;
      let sx=-hw; modParts=[]; const sum=[], srec=[];
      secs.forEach((sc,i)=>{ const sx0=sx, sx1=sx+ws[i]; sx=sx1; const k=sc.k, sw=sx1-sx0, mid=(sx0+sx1)/2; sum.push(`${(SECK.find(q=>q[0]===k)||[0,k])[1]} ${Math.round(sw*100)}`); srec.push({l0:sx0,l1:sx1,k,label:(SECK.find(q=>q[0]===k)||[0,k])[1].split(" ")[0]});
        const part=(y1)=>{ const [ax,az]=XZ(sx0,-hd),[bx,bz]=XZ(sx1,hd); modParts.push({x0:Math.min(ax,bx),x1:Math.max(ax,bx),z0:Math.min(az,bz),z1:Math.max(az,bz),y1}); };
        const top=()=>{ if(hasTop&&sc.top!=="0"){ B(sx0,sx1,-hd,hd-0.02,bodyTop,H0,mcol); B(sx0,sx1,hd-0.02,hd,bodyTop+0.004,H0-0.004,mcol); B(sx0,sx1,hd,hd+0.004,bodyTop-0.002,bodyTop+0.002,dark); const n=Math.max(1,Math.round(sw/0.5)); for(let j=1;j<n;j++){ const xx=sx0+j*sw/n; B(xx-0.002,xx+0.002,hd,hd+0.004,bodyTop,H0,dark); } } };
        const plinth=()=>B(sx0+0.02,sx1-0.02,-hd,hd-0.03,0,0.06,dark);
        const carc=()=>{ B(sx0,sx0+0.018,-hd,hd,0.06,bodyTop,mcol); B(sx1-0.018,sx1,-hd,hd,0.06,bodyTop,mcol); B(sx0,sx1,-hd,-hd+0.015,0.06,bodyTop,inner); B(sx0,sx1,-hd,hd,0.06,0.08,mcol); B(sx0,sx1,-hd,hd,bodyTop-0.02,bodyTop,mcol); };
        const doorsF=(ya,yb)=>{ if(it.var==="sliding"){ const n=Math.max(1,Math.round(sw/1.0)); for(let j=0;j<n;j++){ const a=sx0+j*sw/n, b=sx0+(j+1)*sw/n, off=j%2?0:0.025; B(a+0.004,b-0.004,hd+off-0.02,hd+off,ya,yb,j%2?mcol:M(shade(cfg.cWood,0.92))); } }
          else { const n=Math.max(1,Math.round(sw/0.5)); for(let j=1;j<n;j++){ const xx=sx0+j*sw/n; B(xx-0.002,xx+0.002,hd,hd+0.004,ya,yb,dark); } for(let j=0;j<n;j++){ const hx=sx0+(j+(j%2?0.12:0.88))*sw/n; B(hx-0.01,hx+0.01,hd,hd+0.03,Math.min(yb-0.1,1.0),Math.min(yb-0.05,1.3),metal); } } };
        if(k==="gap"){ top(); return; }
        if(k==="desk"){ B(sx0,sx1,-hd,hd,0.73,0.76,mcol); B(sx0,sx1,-hd,-hd+0.3,1.3,1.32,mcol); B(sx0,sx1,-hd,-hd+0.015,0.76,bodyTop,inner); top(); part(0.76); return; }
        if(k==="dresser"){ plinth(); B(sx0,sx1,-hd,hd,0.06,0.76,mcol); for(let y=0.3;y<0.75;y+=0.23) B(sx0,sx1,hd,hd+0.004,y,y+0.005,dark); B(sx0+0.08,sx1-0.08,-hd,-hd+0.02,0.95,1.75,mir); top(); part(0.76); return; }
        if(k==="tv"){ plinth(); B(sx0,sx1,-hd,-hd+0.02,0.06,bodyTop,M(shade(cfg.cWood,0.75))); B(sx0,sx1,-hd,hd,0.06,0.45,mcol); B(sx0,sx1,hd,hd+0.004,0.25,0.254,dark); const tw=Math.min(sw*0.85,1.65); B(mid-tw/2,mid+tw/2,-hd+0.02,-hd+0.06,0.9,0.9+tw*0.56,M("#15171a",{roughness:0.2})); top(); part(0.45); return; }
        plinth();
        if(k==="open"||k==="hanging"){ carc(); if(k==="open"){ for(let y=0.43;y<bodyTop-0.1;y+=0.36) B(sx0+0.018,sx1-0.018,-hd+0.015,hd-0.01,y,y+0.018,mcol); }
          else { const ry=bodyTop-0.32; B(sx0+0.018,sx1-0.018,-hd+0.015,hd-0.01,bodyTop-0.26,bodyTop-0.24,mcol); B(sx0+0.02,sx1-0.02,-0.012,0.012,ry,ry+0.02,metal); const cols=["#2d5f7a","#a4452c","#e0d6c2","#557a45","#333"]; for(let x=sx0+0.08;x<sx1-0.06;x+=0.09) B(x,x+0.03,-hd*0.7,hd*0.7,Math.max(0.2,ry-0.95),ry,M(cols[Math.abs(Math.round(x*40))%5],{roughness:0.95})); } top(); part(bodyTop); return; }
        B(sx0,sx1,-hd,hd-0.02,0.06,bodyTop,mcol);
        if(k==="mirror"){ B(sx0+0.004,sx1-0.004,hd-0.02,hd,0.07,bodyTop-0.01,mir); B(sx1-0.08,sx1-0.06,hd,hd+0.03,1.0,1.3,metal); }
        else if(k==="drawers"){ for(let y=0.28;y<0.9;y+=0.21) B(sx0,sx1,hd,hd+0.004,y,y+0.005,dark); B(sx0,sx1,hd,hd+0.004,0.9,0.905,dark); for(let y=0.18;y<0.9;y+=0.21) B(mid-0.1,mid+0.1,hd,hd+0.03,y,y+0.015,metal); doorsF(0.91,bodyTop-0.01); }
        else doorsF(0.07,bodyTop-0.01);
        if(i<secs.length-1) B(sx1-0.002,sx1+0.002,hd,hd+0.006,0.06,bodyTop,dark);
        top(); part(bodyTop); });
      u.front=sum.join(" • "); if(hasTop) u.front+=` • شنط ${it.topH} سم`;
      if(it.snap&&W4.includes(it.snap)){ const sg=(it.snap==="W"||it.snap==="RT")?1:-1, mA=(it.snap==="W"||it.snap==="D")?cx:cz; u.secs=srec.map(r=>{ const a=mA+sg*r.l0, b=mA+sg*r.l1; return {a0:Math.min(a,b),a1:Math.max(a,b),k:r.k,label:r.label}; }); u.topY=hasTop?bodyTop+yo:null; }
    } else switch(it.type){
      case "sofa3": case "sofa2": case "arm": { B(-hw,hw,-hd,hd,0.08,0.42,mcol); B(-hw,hw,-hd,-hd+0.2,0.42,H0,mcol); B(-hw,-hw+0.16,-hd,hd,0.42,0.62,mcol); B(hw-0.16,hw,-hd,hd,0.42,0.62,mcol);
        const n=it.type==="arm"?1:it.type==="sofa2"?2:3, cw=(w-0.32)/n; for(let i=0;i<n;i++) B(-hw+0.16+i*cw+0.01,-hw+0.16+(i+1)*cw-0.01,-hd+0.2,hd-0.02,0.42,0.52,M(shade(cfg.cSofa||"#8a9aa8",1.08),{roughness:0.9})); B(-hw+0.05,-hw+0.1,-hd+0.05,hd-0.05,0,0.08,dark); B(hw-0.1,hw-0.05,-hd+0.05,hd-0.05,0,0.08,dark); break; }
      case "corner": { const dd=0.9; B(-hw,hw,-hd,-hd+dd,0.08,0.42,mcol); B(-hw,hw,-hd,-hd+0.2,0.42,H0,mcol); B(-hw,-hw+dd,-hd+dd,hd,0.08,0.42,mcol); B(-hw,-hw+0.2,-hd,hd,0.42,H0,mcol); B(hw-0.16,hw,-hd,-hd+dd,0.42,0.62,mcol);
        B(-hw+0.2,hw-0.17,-hd+0.2,-hd+dd-0.02,0.42,0.52,M(shade(cfg.cSofa||"#8a9aa8",1.08),{roughness:0.9})); B(-hw+0.2,-hw+dd-0.02,-hd+dd,hd-0.02,0.42,0.52,M(shade(cfg.cSofa||"#8a9aa8",1.08),{roughness:0.9})); break; }
      case "coffee": case "side": { B(-hw,hw,-hd,hd,H0-0.04,H0,mcol); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(a*(hw-0.05)-0.02,a*(hw-0.05)+0.02,b*(hd-0.05)-0.02,b*(hd-0.05)+0.02,0,H0-0.04,dark); if(it.type==="coffee") B(-hw+0.05,hw-0.05,-hd+0.05,hd-0.05,0.12,0.14,mcol); break; }
      case "tvunit": case "buffet": case "shoe": case "chest": case "dresser": case "toys": { const hh=H0; B(-hw,hw,-hd,hd,0.06,hh,mcol); B(-hw+0.03,hw-0.03,-hd,hd-0.03,0,0.06,dark);
        const n=Math.max(2,Math.round(w/0.5)); for(let i=1;i<n;i++) B(-hw+i*w/n-0.003,-hw+i*w/n+0.003,hd,hd+0.004,0.08,hh-0.02,dark);
        if(it.type==="chest"||it.type==="dresser") for(let y=0.3;y<hh-0.05;y+=0.25) B(-hw,hw,hd,hd+0.004,y,y+0.006,dark);
        if(it.type==="toys") for(let y=0.35;y<hh;y+=0.32) B(-hw+0.02,hw-0.02,-hd,hd,y,y+0.02,M("#f2c14e"));
        if(it.type==="dresser"){ B(-hw+0.15,hw-0.15,-hd,-hd+0.02,hh+0.1,hh+0.85,M("#dde6eb",{metalness:0.15,roughness:0.05})); C(0,hd+0.3,0.22,0.17,0.44,fab); }
        if(it.type==="console") {} break; }
      case "console": { B(-hw,hw,-hd,hd,H0-0.04,H0,mcol); B(-hw+0.03,-hw+0.06,-hd,hd,0,H0,mcol); B(hw-0.06,hw-0.03,-hd,hd,0,H0,mcol); B(-hw+0.1,hw-0.1,-hd,-hd+0.02,1.1,1.8,M("#dde6eb",{metalness:0.15,roughness:0.05})); break; }
      case "tv": { const sz=+(it.var||55), tw=sz*0.0221, th=sz*0.0125; B(-tw/2,tw/2,-hd,hd,y0,y0+th,M("#15171a",{roughness:0.2})); const mA=(it.snap==="L"||it.snap==="RT")?cz:cx; u.a0=mA-tw/2; u.a1=mA+tw/2; u.y1=y0+th; break; }
      case "dining": { B(-hw,hw,-hd,hd,H0-0.04,H0,mcol); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(a*(hw-0.08)-0.03,a*(hw-0.08)+0.03,b*(hd-0.08)-0.03,b*(hd-0.08)+0.03,0,H0-0.04,mcol);
        const n=+(it.var||6), side=Math.max(1,Math.floor((n-(n>=6?2:0))/2)); const chair=(lx,lz,face)=>{ B(lx-0.22,lx+0.22,lz-0.22,lz+0.22,0.44,0.48,fab); const bz=face>0?lz-0.22:lz+0.18; B(lx-0.22,lx+0.22,bz,bz+0.04,0.48,0.95,mcol); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(lx+a*0.19-0.015,lx+a*0.19+0.015,lz+b*0.19-0.015,lz+b*0.19+0.015,0,0.44,dark); };
        for(let i=0;i<side;i++){ const lx=-hw+(i+0.5)*w/side; chair(lx,-hd-0.15,1); chair(lx,hd+0.15,-1); } if(n>=6){ const [ax,az]=[0,0]; B(-hw-0.37,-hw-0.33,-0.22,0.22,0.48,0.95,mcol); B(-hw-0.37,-hw-0.07,-0.22,0.22,0.44,0.48,fab); B(hw+0.33,hw+0.37,-0.22,0.22,0.48,0.95,mcol); B(hw+0.07,hw+0.37,-0.22,0.22,0.44,0.48,fab); } break; }
      case "shelf": { B(-hw,-hw+0.02,-hd,hd,0,H0,mcol); B(hw-0.02,hw,-hd,hd,0,H0,mcol); B(-hw,hw,-hd,-hd+0.015,0,H0,mcol); for(let y=0.02;y<H0;y+=0.38) B(-hw,hw,-hd,hd,y,y+0.02,mcol);
        for(let y=0.04;y<H0-0.35;y+=0.38) for(let x=-hw+0.05;x<hw-0.08;x+=0.07) B(x,x+0.04,-hd+0.03,-hd+0.22,y,y+0.24+((x*37)%0.06),M(["#a4452c","#2d5f7a","#c9a400","#557a45"][Math.abs(Math.round(x*50))%4])); break; }
      case "bed2": case "bed1": { B(-hw,hw,-hd+0.06,hd,0.1,0.32,mcol); B(-hw+0.02,hw-0.02,-hd+0.08,hd-0.02,0.32,0.55,M("#f6f4ef",{roughness:0.9})); B(-hw,hw,-hd,-hd+0.07,0.1,H0,mcol);
        B(-hw+0.03,hw-0.03,-hd+0.6,hd-0.02,0.55,0.58,M(shade(cfg.cSofa||"#8a9aa8",1.15),{roughness:0.9}));
        const np=it.type==="bed2"?2:1; for(let i=0;i<np;i++){ const pw=(w-0.12)/np; B(-hw+0.06+i*pw+0.02,-hw+0.06+(i+1)*pw-0.02,-hd+0.12,-hd+0.45,0.55,0.66,white); } B(-hw+0.03,-hw+0.08,-hd+0.1,hd-0.03,0,0.1,dark); B(hw-0.08,hw-0.03,-hd+0.1,hd-0.03,0,0.1,dark); break; }
      case "bunk": { for(const yy of [0.25,1.25]){ B(-hw,hw,-hd,hd,yy,yy+0.08,mcol); B(-hw+0.03,hw-0.03,-hd+0.03,hd-0.03,yy+0.08,yy+0.24,M("#f6f4ef")); } for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(a*hw-(a>0?0.06:0),a*hw+(a<0?0.06:0),b*hd-(b>0?0.06:0),b*hd+(b<0?0.06:0),0,H0,mcol);
        B(-hw,hw,-hd,-hd+0.03,1.35,1.6,mcol); for(let y=0.4;y<1.3;y+=0.25) B(hw-0.06,hw,hd-0.45,hd-0.06,y,y+0.03,mcol); break; }
      case "crib": { B(-hw,hw,-hd,hd,0.3,0.34,white); B(-hw+0.02,hw-0.02,-hd+0.02,hd-0.02,0.34,0.44,M("#f6f4ef")); for(const lz of [-hd,hd-0.03]) B(-hw,hw,lz,lz+0.03,0,H0,white); for(let x=-hw;x<=hw;x+=0.08){ B(x,x+0.02,-hd,-hd+0.02,0.34,H0,white); B(x,x+0.02,hd-0.02,hd,0.34,H0,white); } break; }
      case "night": { B(-hw,hw,-hd,hd,0.08,H0,mcol); B(-hw,hw,hd,hd+0.004,H0-0.16,H0-0.155,dark); B(-hw+0.02,hw-0.02,-hd+0.02,hd-0.02,0,0.08,dark); C(0,-0.02,H0+0.14,0.09,0.2,M("#f3e7c9")); break; }
      case "wardrobe": { B(-hw,hw,-hd,hd,0.05,H0,mcol); B(-hw+0.02,hw-0.02,-hd,hd-0.02,0,0.05,dark);
        if(it.var==="sliding"){ const n=Math.max(2,Math.round(w/1.0)); for(let i=0;i<n;i++){ const a=-hw+i*w/n, bb=-hw+(i+1)*w/n, off=i%2?0.0:0.025; B(a+0.005,bb-0.005,hd+off,hd+off+0.02,0.06,H0-0.02,i%2?mcol:M(shade(cfg.cWood,0.9))); } }
        else { const n=Math.max(2,Math.round(w/0.5)); for(let i=1;i<n;i++) B(-hw+i*w/n-0.003,-hw+i*w/n+0.003,hd,hd+0.004,0.06,H0-0.02,dark); for(let i=0;i<n;i++){ const hx=-hw+(i+(i%2?0.12:0.88))*w/n; B(hx-0.01,hx+0.01,hd,hd+0.03,1.0,1.3,metal); } } break; }
      case "desk": { B(-hw,hw,-hd,hd,H0-0.03,H0,mcol); B(-hw,-hw+0.4,-hd,hd,0,H0-0.03,mcol); B(hw-0.03,hw,-hd,hd,0,H0-0.03,mcol);
        C(0.1,hd+0.25,0.02,0.25,0.04,dark); C(0.1,hd+0.25,0.25,0.03,0.45,dark); C(0.1,hd+0.25,0.48,0.22,0.06,fab); B(-0.12,0.32,hd+0.42,hd+0.46,0.5,0.95,fab); B(-0.25,0.15,-hd+0.05,-hd+0.3,H0,H0+0.25,M("#1b1d20")); break; }
      case "ac": { B(-hw,hw,-hd,hd,y0,y0+0.3,white); B(-hw+0.05,hw-0.05,hd,hd+0.004,y0+0.04,y0+0.08,M("#c9cfd4")); break; }
      case "acfloor": { B(-hw,hw,-hd,hd,0,H0,white); B(-hw+0.06,hw-0.06,hd,hd+0.004,H0-0.5,H0-0.1,M("#c9cfd4")); break; }
      case "acout": { B(-hw,hw,-hd,hd,0.05,H0,white); B(-0.2,0.2,hd,hd+0.004,0.1,H0-0.05,M("#3a3f45")); B(-hw+0.05,-hw+0.1,-hd,hd,0,0.05,dark); B(hw-0.1,hw-0.05,-hd,hd,0,0.05,dark); break; }
      case "clothes": { for(const lx of [-hw,hw-0.03]){ B(lx,lx+0.03,-hd,-hd+0.03,0,H0,metal); B(lx,lx+0.03,hd-0.03,hd,0,H0,metal); } for(let z=-hd+0.05;z<hd;z+=0.1) B(-hw,hw,z,z+0.01,H0-0.02,H0,metal); break; }
      case "rug": { B(-hw,hw,-hd,hd,0.001,0.012,M(cfg.cRug||"#b98d6a",{roughness:1})); B(-hw+0.12,hw-0.12,-hd+0.12,hd-0.12,0.012,0.014,M(shade(cfg.cRug||"#b98d6a",1.2),{roughness:1})); u.y1=0.012; break; }
      case "lamp": { C(0,0,0.02,0.16,0.03,dark); C(0,0,0.82,0.015,1.6,dark); C(0,0,1.55,0.2,0.28,M("#f3e7c9")); break; }
      case "plant": { C(0,0,0.18,0.16,0.36,M("#b5623f")); const lf=new THREE.Mesh(new THREE.SphereGeometry(Math.min(hw,hd)+0.05,14,10),M("#4f7a45",{roughness:0.9})); lf.position.set(cx,0.36+Math.min(hw,hd)+0.2,cz); lf.userData.uid=u.id; root.add(lf); break; }
    }
    curUid=null; curSide=null; curWall=null;
    let parts=modParts?modParts.filter(p=>p.y1>0.3||true):[R]; if(it.type==="corner"){ const rr=(lx0,lx1,lz0,lz1)=>{ const [ax,az]=XZ(lx0,lz0),[bx,bz]=XZ(lx1,lz1); return {x0:Math.min(ax,bx),x1:Math.max(ax,bx),z0:Math.min(az,bz),z1:Math.max(az,bz)}; }; parts=[rr(-hw,hw,-hd,-hd+0.9),rr(-hw,-hw+0.9,-hd+0.9,hd)]; }
    recs.push({it,T,R,u,parts});
  }
  // ---------- checks ----------
  const inter0=(p,q,m)=>Math.min(p.x1,q.x1)-Math.max(p.x0,q.x0)>(m||0.01)&&Math.min(p.z1,q.z1)-Math.max(p.z0,q.z0)>(m||0.01);
  const inter=(p,q,m)=>{ const A=p.parts||[p], B=q.parts||[q]; return A.some(a=>B.some(b=>inter0(a.R||a,b.R||b,m))); };
  const floorRecs=recs.filter(r=>!r.T.wall&&r.it.type!=="rug");
  for(let i=0;i<floorRecs.length;i++) for(let j=i+1;j<floorRecs.length;j++) if(inter(floorRecs[i],floorRecs[j],0.02)) warn.push(`${floorRecs[i].T.n} راكب على ${floorRecs[j].T.n}`);
  for(const r of floorRecs) for(const k of CUTS){ const P=(r.parts||[r.R]); if(P.some(p=>[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1],[(p.x0+p.x1)/2,(p.z0+p.z1)/2]].some(([x,z])=>inCut(x,z,-0.02)))) { warn.push(`${r.T.n} طالع برة حدود الأوضة`); break; } }
  const doors=FEATS.filter(f=>(f.type==="door"||f.type==="opening"));
  for(const dr of doors){ const sw=(dr.d||0)>2?rectAO(dr.wall,dr.a0,dr.a1,0,dr.dep):rectAO(dr.wall,dr.a0,dr.a1,0,0.3); for(const r of floorRecs) if(inter({parts:[sw]},r)) warn.push(`${r.T.n} قافل ${dr.type==="door"?"الباب":"الفتحة"}${r.T.modular?"، حط قسم «فراغ» مكانه":""}`); }
  for(const wn of FEATS.filter(f=>f.type==="window")){ const z=rectAO(wn.wall,wn.a0,wn.a1,0,0.3); for(const r of floorRecs) if(r.T.tall&&inter({parts:[z]},{parts:(r.parts||[r.R]).filter(p=>!p.y1||p.y1>wn.y0)})) warn.push(`${r.T.n} قدام الشباك${r.T.modular?"، حط قسم «فراغ» مكانه":""}`); }
  const blockers=(self)=>floorRecs.filter(r=>r!==self&&!["night"].includes(r.it.type));
  for(const r of floorRecs){ const t=r.it.type, R=r.R;
    const freeAt=(z)=>z.x0>=-0.001&&z.z0>=-0.001&&z.x1<=RW+0.001&&z.z1<=RL+0.001&&!blockers(r).some(b=>inter({parts:[z]},b));
    const front=(dd)=>{ const rot=R.rot; return rot===0?{x0:R.x0,x1:R.x1,z0:R.z1,z1:R.z1+dd}:rot===180?{x0:R.x0,x1:R.x1,z0:R.z0-dd,z1:R.z0}:rot===90?{x0:R.x1,x1:R.x1+dd,z0:R.z0,z1:R.z1}:{x0:R.x0-dd,x1:R.x0,z0:R.z0,z1:R.z1}; };
    const sides=(dd)=>{ const rot=R.rot; return rot%180===0?[{x0:R.x0-dd,x1:R.x0,z0:R.z0,z1:R.z1},{x0:R.x1,x1:R.x1+dd,z0:R.z0,z1:R.z1}]:[{x0:R.x0,x1:R.x1,z0:R.z0-dd,z1:R.z0},{x0:R.x0,x1:R.x1,z0:R.z1,z1:R.z1+dd}]; };
    if(t==="wardrobe"&&!(r.parts.length===0)&&!freeAt(front(r.it.var==="sliding"?0.6:0.75))) warn.push(`مفيش ${r.it.var==="sliding"?60:75} سم فاضية قدام الدولاب عشان يتفتح`);
    if(t==="bed2"){ const ok=sides(0.6).filter(freeAt).length; if(ok<2) warn.push(`السرير الدبل محتاج 60 سم فاضية على الجنبين (${ok===1?"جنب واحد بس فاضي":"الجنبين مقفولين"})`); if(!freeAt(front(0.6))) warn.push("مفيش 60 سم فاضية عند رجلين السرير"); }
    if(t==="bed1"&&!sides(0.5).some(freeAt)) warn.push("السرير الفردي محتاج جنب واحد فاضي 50 سم على الأقل");
    if(t==="dining"){ const zz={x0:R.x0-0.75,x1:R.x1+0.75,z0:R.z0-0.75,z1:R.z1+0.75}; if(zz.x0<0||zz.z0<0||zz.x1>RW||zz.z1>RL||blockers(r).some(b=>inter({parts:[zz]},b))) warn.push("السفرة محتاجة 75 سم حواليها عشان الكراسي تتسحب"); }
    if((t==="dresser"||t==="desk")&&!freeAt(front(0.6))) warn.push(`مفيش مكان للكرسي قدام ${r.T.n}`);
  }
  const tv=recs.find(r=>r.it.type==="tv"), seat=recs.find(r=>["sofa3","sofa2","corner"].includes(r.it.type));
  if(tv&&seat){ const a=[(tv.R.x0+tv.R.x1)/2,(tv.R.z0+tv.R.z1)/2], b=[(seat.R.x0+seat.R.x1)/2,(seat.R.z0+seat.R.z1)/2], dist=Math.hypot(a[0]-b[0],a[1]-b[1]), diag=(+(tv.it.var||55))*0.0254;
    q.tvDist=dist; if(dist<diag*1.2) warn.push(`الشاشة قريبة من الكنبة (${dist.toFixed(1)} م)، المناسب لـ ${tv.it.var} بوصة من ${(diag*1.5).toFixed(1)} لـ ${(diag*2.5).toFixed(1)} م`); if(dist>diag*3) warn.push(`الشاشة بعيدة عن الكنبة (${dist.toFixed(1)} م)، جرب شاشة أكبر أو قرّب الكنبة`); }
  // ---------- electric points ----------
  const nearWall=(R)=>{ let best=null; for(const wl of W4){ const dd=wl==="L"?R.x0:wl==="RT"?RW-R.x1:wl==="W"?R.z0:RL-R.z1; if(!best||dd<best[1]) best=[wl,dd]; } return best[0]; };
  const alongOf=(wl,x,z)=>wl==="W"||wl==="D"?x:z;
  for(const dr of doors){ const L=wlen(dr.wall), a=dr.a1+0.15<L?dr.a1+0.15:dr.a0-0.15; addPt("switch",dr.wall,Math.max(0.05,a),1.1,"مفتاح النور جنب الباب"); }
  for(const r of recs){ const t=r.it.type, R=r.R, wl=r.it.snap&&W4.includes(r.it.snap)?r.it.snap:nearWall(R), cx=(R.x0+R.x1)/2, cz=(R.z0+R.z1)/2, a=alongOf(wl,cx,cz), L=wlen(wl);
    if(t==="bed2"||t==="bed1"){ const hw=(wl==="W"||wl==="D"?R.x1-R.x0:R.z1-R.z0)/2; for(const s of t==="bed2"?[-1,1]:[1]){ const aa=Math.max(0.1,Math.min(L-0.1,a+s*(hw+0.25))); addPt("socket",wl,aa,0.7,"بريزة جنب السرير + مفتاح أباجورة"); } }
    if(t==="tv"||t==="tvunit"){ if(!POINTS.some(p=>p.note.includes("التليفزيون"))){ const yy=t==="tv"?Math.max(0.3,(r.it.y||110)/100-0.1):0.6; addPt("socket",wl,a-0.15,yy,"برايز التليفزيون (دبل)"); addPt("data",wl,a+0.15,yy,"دش + إنترنت للتليفزيون"); } }
    if(t==="ac"){ addPt("socket",wl,Math.min(L-0.1,a+(R.x1-R.x0+R.z1-R.z0)/2),Math.min(H-0.1,(r.it.y||220)/100+0.1),"بريزة التكييف على خط لوحده"); addPt("drain",wl,a,Math.min(H-0.1,(r.it.y||220)/100),"صرف مية التكييف + مواسير النحاس لبرة"); }
    if(t==="acfloor") addPt("socket",wl,a,0.3,"بريزة التكييف على خط لوحده");
    if(t==="desk"){ addPt("socket",wl,a,0.9,"برايز المكتب + إنترنت"); addPt("data",wl,a+0.2,0.9,"نقطة إنترنت"); }
    if(t==="dresser"||t==="console") addPt("socket",wl,a+(R.x1-R.x0+R.z1-R.z0)/4,1.0,"بريزة التسريحة (سشوار)");
    if(t==="lamp") addPt("socket",wl,a,0.3,"بريزة اللمبادير");
  }
  // general sockets every ~3 m where nothing tall blocks the wall
  for(const wl of W4){ const L=wlen(wl), n=Math.max(1,Math.round(L/3)); for(let i=0;i<n;i++){ const a=(i+0.5)*L/n; const [x,z]=aoToXZ(wl,a,0.05);
      const blocked=floorRecs.some(r=>r.T.tall&&x>r.R.x0-0.1&&x<r.R.x1+0.1&&z>r.R.z0-0.1&&z<r.R.z1+0.1)||FEATS.some(f=>f.wall===wl&&(f.type==="door"||f.type==="opening")&&a>f.a0-0.1&&a<f.a1+0.1)||POINTS.some(p=>p.wall===wl&&Math.abs(p.a-a)<0.5&&p.type==="socket");
      if(!blocked) addPt("socket",wl,a,0.35,"بريزة عادية"); } }
  drawPts();
  // ---------- quantities ----------
  const per=2*(RW+RL); let wallA=per*H; for(const f of FEATS) if(["window","door","opening"].includes(f.type)) wallA-=(f.a1-f.a0)*(f.y1-f.y0);
  const skirt=per-doors.reduce((x,f)=>x+(f.a1-f.a0),0), floorA=RW*RL, paintA=wallA+floorA;
  ROOMQ={floorA,wallA,paintA,liters:Math.ceil(paintA*(cfg.paintCoats||2)/10),skirt,floorPcs:Math.ceil(floorA*1.1/((TSZ[cfg.floorTile]||[0.6,0.6])[0]*(TSZ[cfg.floorTile]||[0.6,0.6])[1])),tvDist:q.tvDist};
  let walk=null; for(let i=1;i<10;i++){ for(let j=1;j<10;j++){} } walk=Math.round(Math.min(RW,RL)*100);
  return {walk,counter:0};
}
function elecLoadsRoom(){
  const rows=[], circuits=[]; for(const it of cfg.furn||[]){ if(it.type==="ac"||it.type==="acfloor"){ const hp=+(it.var||1.5), wt=Math.round(hp*800); rows.push({n:`تكييف ${hp} حصان`,w:wt}); circuits.push({n:`تكييف ${hp} حصان`,a:hp>=3?25:20,mm:hp>=3?"6":"4",why:"خط لوحده"}); } if(it.type==="tv") rows.push({n:"الشاشة",w:150}); }
  rows.push({n:"برايز عامة",w:1500},{n:"الإضاءة",w:120}); circuits.push({n:"برايز الأوضة",a:16,mm:"2.5",why:""},{n:"الإضاءة",a:10,mm:"1.5",why:""});
  const total=rows.reduce((x,r)=>x+r.w,0), demand=Math.round(total*0.7); return {rows,circuits,total,demand,amps:Math.round(demand/220)};
}
function furnBox(el){
  el=el||ctlEl;
  const box=document.createElement("div"); box.className="adder"; box.innerHTML=`<div class="adder-l">اختار القطعة وضيفها، وبعدين اسحبها لمكانها في الـ3D:</div>`;
  const ar=document.createElement("div"); ar.className="addrow"; const ts=document.createElement("select"); ts.setAttribute("aria-label","القطعة"); const cats={};
  for(const [k,v] of Object.entries(FURN)) (cats[v.cat]=cats[v.cat]||[]).push([k,v.n]);
  ts.innerHTML=Object.entries(cats).map(([c,l])=>`<optgroup label="${c}">${l.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</optgroup>`).join("");
  const ab=document.createElement("button"); ab.className="btn main"; ab.textContent="➕ ضيف";
  ab.onclick=()=>{ pushHist(); const T=FURN[ts.value]; const it={id:"i"+Math.random().toString(36).slice(2,7),type:ts.value,w:T.w,d:T.d};
    if(T.var) it.var=T.var[0][0]; if(T.wall){ it.snap="W"; it.pos=Math.max(0,Math.round((RW*100-T.w)/2)); it.y=T.y; } else { it.x=Math.round(RW*50); it.z=Math.round(RL*50); it.rot=0; }
    cfg.furn=[...(cfg.furn||[]),it]; OPENC.add(it.id); build(); UI_REFRESH(); hint(`اتضاف ${T.n} في نص الأوضة، اسحبه بصباعك لمكانه ✓`,3500); };
  ar.append(ts,ab); box.appendChild(ar); el.appendChild(box);
  const n=document.createElement("div"); n.className="note"; n.textContent="اسحب أي قطعة بصباعك في الـ3D. «لازقة في حيطة» بتخليها تتحرك على الحيطة بس، و«حرة» تتحرك في أي حتة وتلفها."; el.appendChild(n);
  const YN=[["","لأ"],["1","أيوه"]];
  for(const it of cfg.furn||[]){ const T=FURN[it.type]; if(!T) continue; const E=effDims(it,T);
    const card=document.createElement("div"); card.className="card"; const hd=document.createElement("div"); hd.className="ch"; hd.innerHTML=`<b>${T.n}</b><small>${E.w}×${it.d}×${E.h}</small>`;
    const cp=document.createElement("button"); cp.className="btn icon"; cp.textContent="📄"; cp.setAttribute("aria-label","نسخة"); cp.onclick=()=>{ pushHist(); const c=JSON.parse(JSON.stringify(it)); c.id="i"+Math.random().toString(36).slice(2,7); c.fillW=""; if(c.snap) c.pos=(c.pos||0)+E.w+5; else c.x=(c.x||0)+30; cfg.furn=[...cfg.furn,c]; build(); UI_REFRESH(); };
    const del=document.createElement("button"); del.className="btn icon danger"; del.textContent="🗑"; del.setAttribute("aria-label","شيل"); del.onclick=()=>{ pushHist(); cfg.furn=cfg.furn.filter(x=>x!==it); build(); UI_REFRESH(); }; hd.append(cp,del); card.appendChild(hd); foldCard(card,hd,it.id);
    if(T.var) objSelect(card,it,"var","النوع",T.var,()=>{ if(it.type==="tv"){ it.w=Math.round(+it.var*2.21); } if(it.type==="bed2") it.w=+it.var; });
    const snapOpts=T.wall?W4OPT():[["","حرة (في أي حتة)"],...W4.map(w=>[w,"لازقة في "+WNAME[w]])];
    objSelect(card,it,"snap","مكانها",snapOpts,()=>{ if(it.snap){ it.pos=Math.max(0,Math.round(((it.snap==="W"||it.snap==="D")?RW:RL)*50-it.w/2)); } else { it.fillW=""; it.x=Math.round(RW*50); it.z=Math.round(RL*50); it.rot=it.rot||0; } });
    const sub=t=>{ const h=document.createElement("div"); h.className="note"; h.style.cssText="font-weight:600;color:var(--pri-ink);margin-top:6px"; h.textContent=t; card.appendChild(h); };
    if(it.snap){ sub("📍 المكان");
      if(!T.wall) objSelect(card,it,"fillW","ملو عرض الحيطة؟",YN);
      const L=Math.round(wlen(it.snap)*100);
      objRange(card,it,"pos",it.fillW==="1"?"فراغ من أول الحيطة":"بعدها عن أول الحيطة",0,Math.max(1,L-(it.fillW==="1"?20:E.w)),1);
      if(it.fillW==="1") objRange(card,it,"endGap","فراغ من آخر الحيطة",0,Math.max(1,L-20),1);
      if(!T.wall) objRange(card,it,"off","بعدها عن الحيطة",0,100,1); }
    else { sub("📍 المكان"); objRange(card,it,"x","من الحيطة الشمال (للنص)",0,Math.round(RW*100),1); objRange(card,it,"z","من الحيطة القدامية (للنص)",0,Math.round(RL*100),1);
      const rb=document.createElement("button"); rb.className="btn"; rb.textContent="↻ لف 90°"; rb.onclick=()=>{ pushHist(); it.rot=((it.rot||0)+90)%360; build(); UI_REFRESH(); }; card.appendChild(rb); }
    sub("📏 المقاسات");
    if(it.fillW!=="1"&&it.type!=="tv") objRange(card,it,"w","العرض",T.lim[0],T.lim[1],1);
    if(it.type!=="tv") objRange(card,it,"d","العمق",Math.min(T.lim[2],5),Math.max(T.lim[3],it.d),1);
    if(!T.wall&&!["rug"].includes(it.type)){ if(T.tall||T.modular||["tvunit","buffet","shoe","chest","console","toys","shelf"].includes(it.type)) objSelect(card,it,"toCeil","لحد السقف؟",YN);
      if(it.toCeil!=="1"){ if(it.h==null) it.h=T.h; objRange(card,it,"h","الارتفاع",10,Math.round(H*100),1); } }
    if(T.wall) objRange(card,it,"y","ارتفاعها من الأرض",0,Math.round(H*100)-10,1); else if(!["rug"].includes(it.type)) objRange(card,it,"y","مرفوعة عن الأرض",0,200,1);
    if(T.modular){ sub("🗄 أقسام الدولاب (من الشمال لليمين وإنت باصص عليه)");
      objRange(card,it,"topH","ارتفاع الشنط فوق (0 = من غير)",0,120,1);
      const secs=it.secs&&it.secs.length?it.secs:defaultSecs(it,E.w), own=()=>{ if(it.secs!==secs) it.secs=secs; }; /* only store the default sections once the user edits them */
      const {ws,over}=secWidths(secs,E.w/100);
      secs.forEach((sc,idx)=>{ const row=document.createElement("div"); row.className="addrow"; row.style.alignItems="center";
        const ks=document.createElement("select"); ks.innerHTML=SECK.map(([k,n])=>`<option value="${k}">${n}</option>`).join(""); ks.value=sc.k; ks.onchange=()=>{ pushHist(); own(); sc.k=ks.value; build(); UI_REFRESH(); };
        const wi=document.createElement("input"); wi.type="number"; wi.inputMode="numeric"; wi.className="num"; wi.value=sc.w>0?sc.w:""; wi.placeholder=String(Math.round(ws[idx]*100)); wi.setAttribute("aria-label","عرض القسم");
        wi.onchange=()=>{ pushHist(); own(); sc.w=Math.max(0,+wi.value||0); build(); UI_REFRESH(); };
        const un=document.createElement("small"); un.textContent="سم"; un.style.color="#6b737c";
        const up=document.createElement("button"); up.className="btn"; up.textContent="↑"; up.disabled=idx===0; up.onclick=()=>{ pushHist(); own(); const a=secs; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; build(); UI_REFRESH(); };
        const dl=document.createElement("button"); dl.className="btn"; dl.textContent="✕"; dl.onclick=()=>{ pushHist(); own(); secs.splice(idx,1); if(!secs.length) delete it.secs; build(); UI_REFRESH(); };
        row.append(ks,wi,un,up,dl); card.appendChild(row);
        if(sc.k==="gap"||sc.k==="desk"||sc.k==="dresser"){ if((it.topH||0)>0){ const tg={v:sc.top==="0"?"0":""}; objSelect(card,tg,"v","  ↳ فوقه شنطة؟",[["","أيوه"],["0","لأ، فاضي للسقف"]],()=>{ own(); sc.top=tg.v; }); } } });
      const n=document.createElement("div"); n.className="note"; n.style.color=over?"var(--clay)":""; n.textContent=(over?"⚠ ":"")+`سيب العرض فاضي عشان القسم ياخد الباقي لوحده. العرض الكلي ${E.w} سم.`; card.appendChild(n);
      const act=document.createElement("div"); act.className="act";
      const ad=document.createElement("button"); ad.className="btn"; ad.textContent="➕ قسم"; ad.onclick=()=>{ pushHist(); own(); secs.push({k:"doors",w:0}); build(); UI_REFRESH(); };
      const rs=document.createElement("button"); rs.className="btn"; rs.textContent="↺ الأقسام الافتراضية"; rs.onclick=()=>{ pushHist(); delete it.secs; build(); UI_REFRESH(); };
      act.append(ad,rs); card.appendChild(act); }
    el.appendChild(card); }
}
function roomFinishBox(){ if(!ROOMQ) return; const Q=ROOMQ, f=v=>v.toFixed(1);
  const cost=Q.floorA*1.1*(cfg.pFloor||0)+Q.paintA*(cfg.pPaint||0)+Q.skirt*(cfg.pSkirt||0);
  const d=document.createElement("div"); d.className="sum"; d.innerHTML=`⬜ الأرضية: <b>${f(Q.floorA)} م²</b> (${Q.floorPcs} بلاطة ${cfg.floorTile} بالهالك)<br>🎨 الدهان: <b>${f(Q.paintA)} م²</b> حيطان وسقف ← حوالي <b>${Q.liters} لتر</b> (${cfg.paintCoats||2} وش)<br>📏 الوزرة: <b>${f(Q.skirt)} م</b><br>💡 الإضاءة: <b>${Q.spots} سبوت</b> (حوالي ${LIGHTQ.lux} لوكس)${cfg.chand&&cfg.roomType==="room"?" + نجفة":""}`+(Q.accentA?`<br>🪵 الحيطة المميزة: <b>${f(Q.accentA)} م²</b>`:"")+(Q.tvDist?`<br>📺 المسافة بين الكنبة والشاشة ${Q.tvDist.toFixed(1)} م`:"")+(cost>0?`<hr>التكلفة التقريبية: <b>${Math.round(cost).toLocaleString("ar-EG")} جنيه</b>`:`<hr><small>اكتب الأسعار تحت والتكلفة هتتحسب.</small>`);
  ctlEl.insertBefore(d,ctlEl.firstChild); }
