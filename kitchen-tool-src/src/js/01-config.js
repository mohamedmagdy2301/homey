// =================== CONFIG ===================
let H = 2.8; // ceiling height (from cfg.ceil)
const clone=o=>JSON.parse(JSON.stringify(o));
const cleanName=s=>String(s??"").replace(/[<>]/g,"").trim().slice(0,80); // names typed by the user or read from a backup
const cleanDeep=o=>typeof o==="string"?o.replace(/[<>]/g,""):Array.isArray(o)?o.map(cleanDeep):o&&typeof o==="object"?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,cleanDeep(v)])):o;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); // user text going into innerHTML / SVG
const W4=["W","RT","D","L"];
const WNAME={W:"الحيطة القدامية",RT:"الحيطة اليمين",D:"الحيطة اللي ورا",L:"الحيطة الشمال"};
const TEMPLATES={
  mine:{name:"مطبخي (الحالي)",dims:[180,400],make:(W,L)=>({
    wallCfg:{W:{type:"counter",depth:60,up:false},RT:{type:"shallow",depth:35,up:true},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"L",t:"L",w:"L",f:"N:rc",d:"L"}, seq:{L:["s","w","t"]}, sinkUnderWin:false,
    feats:[{id:"sh",type:"column",wall:"L",pos:0,w:100,d:60,y:0,h:0},{id:"win",type:"window",wall:"W",pos:80,w:80,y:100,h:120},
      {id:"door",type:"door",wall:"D",pos:80,w:80,y:0,h:210,d:45},{id:"rc",type:"corridor",wall:"D",pos:0,w:80,d:90,y:0,h:0,use:"none",water:true}]})},
  one:{name:"حيطة واحدة",dims:[250,360],make:(W,L)=>({
    wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"L",t:"L",w:"L",f:"L",d:"L"}, seq:{L:["f","s","d","w","t"]}, sinkUnderWin:false,
    feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-100)/2),w:100,y:100,h:120},{id:"door",type:"door",wall:"D",pos:Math.round((W-90)/2),w:90,y:0,h:210,d:45}]})},
  galley:{name:"طرقة بحيطتين",dims:[220,400],make:(W,L)=>({
    wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"counter",depth:60,up:true},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"L",t:"RT",w:"L",f:"RT",d:"L"}, seq:{L:["s","d","w"],RT:["t","f"]}, sinkUnderWin:false,
    feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-90)/2),w:90,y:100,h:120},{id:"door",type:"door",wall:"D",pos:Math.round((W-90)/2),w:90,y:0,h:210,d:45}]})},
  L:{name:"حرف L",dims:[260,340],make:(W,L)=>({
    wallCfg:{W:{type:"counter",depth:60,up:true},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"W",t:"L",w:"L",f:"L",d:"W"}, seq:{L:["w","t","f"],W:["s","d"]}, sinkUnderWin:true,
    feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-100)/2)+30,w:100,y:100,h:120},{id:"door",type:"door",wall:"D",pos:W-110,w:90,y:0,h:210,d:45}]})},
  U:{name:"حرف U",dims:[260,320],make:(W,L)=>({
    wallCfg:{W:{type:"counter",depth:60,up:true},RT:{type:"counter",depth:60,up:true},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"W",t:"L",w:"RT",f:"RT",d:"W"}, seq:{L:["t"],W:["s","d"],RT:["w","f"]}, sinkUnderWin:true,
    feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-100)/2),w:100,y:100,h:120},{id:"door",type:"door",wall:"D",pos:Math.round((W-90)/2),w:90,y:0,h:210,d:45}]})},
  island:{name:"مفتوح بجزيرة",dims:[400,420],make:(W,L)=>({
    wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"counter",depth:60,up:true}},
    place:{s:"L",t:"L",w:"L",f:"L",d:"L"}, seq:{L:["f","s","d","w","t"]}, sinkUnderWin:false, island:{on:true,w:180,d:80,pos:Math.round(L/2)},
    feats:[{id:"win",type:"window",wall:"W",pos:Math.round((W-120)/2),w:120,y:100,h:120},{id:"door",type:"door",wall:"D",pos:W-120,w:90,y:0,h:210,d:45}]})}
};
const DEFAULT = {
  template:"mine", roomW:180, roomL:400, dimsOn:"brick", plaster:2, tileT:1,
  wallCfg:null, place:null, seq:{}, feats:null, sinkUnderWin:false, island:{on:false,w:120,d:70,pos:200},
  upper:"ceiling", upperFront:"solid", hood:"chimney", aboveDoor:true, aboveWindow:true, colShelves:true, nicheTop:true,
  fronts:"mixed", handles:"black", ch:90,
  cBase:"#f3f3f0", cUpper:"#f7f7f5", cCounter:"#d9d7d2", cWall:"#f1efeb", cFloor:"#cdc8bf", cWood:"#b88f5e", cHandle:"#2f3237",
  led:true, night:false, walls:"auto", labels:true,
  ceil:280, uStart:150, uDepth:35,
  sinkW:80, sinkD:50, sinkType:"single", stoveType:"free", stoveW:90, stoveD:60, stoveH:90, stoveGap:3, dish:false, dishW:"45", micro:"upper",
  fridgeW:70, fridgeD:70, fridgeH:180, fridgeGap:5, fridgeBack:10, washerW:60, washerD:60, washerH:85, washerGap:2, washerBack:2, appLabels:true,
  splash:"tiles", cSplash:"#e7e4de", floorType:"tiles", gloss:false, ceiling:"gypsum", doorLeaf:"open",
  decor:true, autoRot:false, walkPad:false,
  pLower:0, pUpper:0, pTall:0, pMarble:0,
  units:{}, openDoors:false, fridgeHinge:"a1",
  showPts:true, ptLabels:false, water:{wall:"L",pos:150,y:55}, drain:{wall:"L",pos:150},
  apps:[], custom:[], steps:{}, dragOn:true, showTri:true, openCab:false, roomType:"kitchen", bfix:[], furn:[], rtype:"", cSofa:"#8a9aa8", cRug:"#b98d6a", pFloor:0, pPaint:0, pSkirt:0, paintCoats:2, gyps:"cove", chand:false, curtains:false, cCurtain:"#d8cbb6", accent:"", accentT:"wood", cAccent:"#8a6a4a", corner:"door", gbType:"tray", gbDrop:12, gbBand:30, gbPerSide:"", gbCenter:0, gbLed:"", gbLedCol:"warm", gbSpots:0, gbSpotsAt:"band", pGbFlat:0, pGbCove:0, cCeil:"#fbfbfa", tileTop:"ceil", wallTile:"30x60", floorTile:"60x60", cTile:"#e9e6e1", wpUp:30, wpShower:200, waste:10, pTile:0, pWP:0, pLabor:0
};
Object.assign(DEFAULT,TEMPLATES.mine.make(180,400)); DEFAULT.place.f="N:rc";
const VARIANTS = {
  v1:{name:"١. أقصى تخزين (للسقف)", fn:c=>{}},
  v2:{name:"٢. الحوض تحت الشباك", fn:c=>{ c.place.s="W"; c.sinkUnderWin=true; c.wallCfg.RT={type:"pantry",depth:35,up:false}; }},
  v3:{name:"٣. الغسالة برة + دولاب طول", fn:c=>{ c.place.w="none"; c.wallCfg.RT={type:"pantry",depth:40,up:false}; }},
  v4:{name:"٤. بسيط ومفتوح", fn:c=>{ c.upper="single"; c.upperFront="open"; c.wallCfg.RT={type:"shelves",depth:30,up:false}; c.aboveDoor=false; c.aboveWindow=false; c.nicheTop=false; c.wallCfg.W.type="bar"; }},
  v5:{name:"٥. التلاجة جوه + الغسالة بالطرقة", fn:c=>{ c.place.f="L"; c.place.w="N:rc"; c.seq={L:["s","t","f"]}; }}
};
function applyTemplate(c,key,keepDims){
  if(typeof RTEMPLATES!=="undefined"&&RTEMPLATES[key]){ const T=RTEMPLATES[key]; const W=keepDims?c.roomW:T.dims[0], L=keepDims?c.roomL:T.dims[1]; const m=T.make(W,L);
    Object.assign(c,{roomType:"room",rtype:T.rtype,template:key,feats:m.feats,furn:m.furn,bfix:[],units:{},seq:{},island:{on:false,w:120,d:70,pos:100},water:{wall:"none",pos:0,y:55},drain:{wall:"none",pos:0},
      wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"none",depth:60,up:false}},place:{s:"none",t:"none",w:"none",f:"none",d:"none"},floorType:"tiles",curtains:true,chand:T.rtype==="living",gbType:T.ceil==="flat"?"slab":"tray",gbDrop:15,gbBand:T.rtype==="living"?60:45,gbPerSide:"",gbCenter:0,gbLed:"1",gbLedCol:"warm",gbSpots:0,gbSpotsAt:"band"});
    if(!keepDims){ c.roomW=W; c.roomL=L; } return c; }
  if(HTEMPLATES[key]){ const T=HTEMPLATES[key]; const W=keepDims?c.roomW:T.dims[0], L=keepDims?c.roomL:T.dims[1]; const m=T.make(W,L);
    Object.assign(c,{gbType:"flat",gbDrop:15,gbLed:"",gbSpots:0});
    Object.assign(c,{roomType:"hall",template:key,feats:m.feats,bfix:[],units:{},seq:{},island:{on:false,w:120,d:70,pos:100},water:{wall:"L",pos:0,y:55},drain:{wall:"none",pos:0},
      wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"none",depth:60,up:false}},place:{s:"none",t:"none",w:"none",f:"none",d:"none"}});
    if(!keepDims){ c.roomW=W; c.roomL=L; } return c; }
  if(BTEMPLATES[key]){ const T=BTEMPLATES[key]; const W=keepDims?c.roomW:T.dims[0], L=keepDims?c.roomL:T.dims[1]; const m=T.make(W,L);
    Object.assign(c,{roomType:"bath",template:key,feats:m.feats,bfix:m.bfix,water:m.water,drain:m.drain,units:{},seq:{},island:{on:false,w:120,d:70,pos:100},
      wallCfg:{W:{type:"none",depth:60,up:false},RT:{type:"none",depth:35,up:false},D:{type:"none",depth:60,up:false},L:{type:"none",depth:60,up:false}},place:{s:"none",t:"none",w:"none",f:"none",d:"none"}});
    Object.assign(c,{gbType:"flat",gbDrop:20,gbSpots:0,gbLed:""}); if(!keepDims){ c.roomW=W; c.roomL=L; c.ceil=c.ceil||280; } return c; }
  c.roomType="kitchen";
  const T=TEMPLATES[key]; const W=keepDims?c.roomW:T.dims[0], L=keepDims?c.roomL:T.dims[1]; const m=T.make(W,L);
  if(key==="mine"){ m.place.f="N:rc"; }
  Object.assign(c,{wallCfg:m.wallCfg,place:m.place,seq:m.seq,feats:m.feats,sinkUnderWin:!!m.sinkUnderWin,island:m.island||{on:false,w:120,d:70,pos:Math.round(L/2)},template:key,units:{}});
  if(!keepDims){ c.roomW=W; c.roomL=L; }
  const sw=m.place.s, sl=(sw==="W"||sw==="D")?W:L; c.water={wall:sw,pos:Math.round(sl/2),y:55}; c.drain={wall:sw,pos:Math.round(sl/2)};
  if(key==="mine"){ c.water={wall:"L",pos:150,y:55}; c.drain={wall:"L",pos:150}; }
  return c;
}
function newCfg(key){ const c=clone(DEFAULT); applyTemplate(c,key,false); c.custom=[]; c.apps=[]; c.steps={}; return c; }
function migrate(o){
  o=cleanDeep(o&&typeof o==="object"&&!Array.isArray(o)?o:{}); const c={...clone(DEFAULT),...o};
  if(!o.feats){ // convert designs saved before the generic room model
    const shW=o.shW??60, shD=o.shD??100, winOff=o.winOff??20, winW=o.winW??80, sill=o.sill??100, wtop=o.wtop??220, dw=o.doorW??80;
    c.feats=[]; if(shW>0&&shD>0) c.feats.push({id:"sh",type:"column",wall:"L",pos:0,w:shD,d:shW,y:0,h:0});
    c.feats.push({id:"win",type:"window",wall:"W",pos:shW+winOff,w:winW,y:sill,h:wtop-sill});
    c.feats.push({id:"door",type:"door",wall:"D",pos:(o.doorPos||"opposite")==="opposite"?Math.round(shW+winOff+winW/2-dw/2):(o.doorOff??50),w:dw,y:0,h:210,d:45});
    if((o.recA??90)>0) c.feats.push({id:"rc",type:"corridor",wall:"D",pos:0,w:o.recB??80,d:o.recA??90,y:0,h:0,use:o.recessUse==="pantry"?"pantry":"none",water:o.recessWater!==false});
    c.wallCfg=clone(TEMPLATES.mine.make(180,400).wallCfg);
    if(o.right) c.wallCfg.RT={type:o.right,depth:o.rightDepth??35,up:o.rightUpper!==false};
    if(o.windowArea==="bar") c.wallCfg.W.type="bar"; if(o.windowArea==="empty") c.wallCfg.W.type="none";
    const ru=o.recessUse||"fridge", wp=o.washerPos||"inside";
    c.place={s:o.sinkPos==="window"?"W":"L",t:"L",w:(wp==="recess"||ru==="washer")?"N:rc":wp==="none"?"none":"L",f:ru==="fridge"?"N:rc":"L",d:"L"}; c.sinkUnderWin=o.sinkPos==="window";
    c.seq={L:(o.seqL||(o.order||"swt").split("")).filter(t=>["s","w","t","d"].includes(t)||String(t).startsWith("x:"))};
    c.water={wall:"L",pos:o.waterZ??150,y:o.waterY??55}; c.drain={wall:"L",pos:o.drainZ??150};
    c.colShelves=o.shoulderShelves!==false; c.nicheTop=o.recessTop!==false; c.template="mine";
    c.apps=(o.apps||[]).map(a=>({...a,loc:a.loc==="RC"?"N:rc":a.loc}));
    c.custom=(o.custom||[]).map(x=>({...x,wall:x.wall==="RC"?"RT":x.wall}));
  }
  for(const k of ["wallCfg","place","island","water","drain"]) if(!c[k]) c[k]=clone(DEFAULT[k]);
  if(o.gbType==null&&o.ceiling){ if(o.ceiling==="none") c.gbType="hide"; else if(o.ceiling==="flat") c.gbType="slab"; else { const g=o.gyps||(o.roomType==="room"?"cove":"band"); if(g==="flat"){ c.gbType="flat"; c.gbDrop=15; } else { c.gbType="tray"; c.gbBand=g==="cove"?45:g==="tray"?90:30; c.gbLed=(g==="cove"||g==="tray")?"1":""; c.gbDrop=12; } } }
  fixNums(c); return c;
}
/* numbers from old saves / backups: NaN, "", Infinity or out-of-range values would break every geometry */
function fixNums(c){ let lim={}; try{ for(const g of Object.values(SCHEMA)) for(const x of g) if(x.t==="range"){ const l=lim[x.k]; lim[x.k]=l?[Math.min(l[0],x.min),Math.max(l[1],x.max)]:[x.min,x.max]; } }catch(e){} /* SCHEMA isn't defined yet on the first call */
  for(const k in DEFAULT) if(typeof DEFAULT[k]==="number"){ const v=+c[k]; c[k]=c[k]!==""&&c[k]!=null&&Number.isFinite(v)?v:DEFAULT[k]; if(lim[k]) c[k]=Math.max(lim[k][0],Math.min(lim[k][1],c[k])); }
  for(const key of ["feats","custom","apps","bfix","furn"]) c[key]=(Array.isArray(c[key])?c[key]:[]).filter(x=>x&&typeof x==="object"&&!Array.isArray(x)).map(x=>{
    for(const f of ["pos","w","d","h","y","a","b","dep"]) if(x[f]!=null&&x[f]!==""&&!Number.isFinite(+x[f])) x[f]=0;
    for(const f of ["w","d","a","b"]) if(+x[f]<0) x[f]=-x[f]; return x; }); }

const STYLES = {
  light:{name:"مودرن فاتح", cBase:"#f3f3f0", cUpper:"#f7f7f5", cCounter:"#d9d7d2", cWall:"#f1efeb", cFloor:"#cdc8bf", cWood:"#b88f5e", cHandle:"#2f3237"},
  warm:{name:"دافي كلاسيك", cBase:"#e6d8bf", cUpper:"#8e6a47", cCounter:"#f2ecdf", cWall:"#f2ebdf", cFloor:"#b49a79", cWood:"#7a5a3a", cHandle:"#6d5230"},
  green:{name:"أخضر زيتي", cBase:"#56654f", cUpper:"#f4f2ee", cCounter:"#e9e5dd", cWall:"#f4f2ee", cFloor:"#d4cec2", cWood:"#a88458", cHandle:"#c6a25a"},
  navy:{name:"كحلي ودهبي", cBase:"#2f3e56", cUpper:"#eef0f2", cCounter:"#f1efe9", cWall:"#eef0f2", cFloor:"#c9c3b8", cWood:"#b08a55", cHandle:"#c9a45c"},
  grey:{name:"رمادي وخشب", cBase:"#8b9096", cUpper:"#c49a6c", cCounter:"#ecebe8", cWall:"#efefed", cFloor:"#b8b4ae", cWood:"#c49a6c", cHandle:"#2b2d30"},
  black:{name:"أسود مطفي", cBase:"#2a2c2f", cUpper:"#2a2c2f", cCounter:"#e8e6e1", cWall:"#f0eeea", cFloor:"#a9a39a", cWood:"#9c7446", cHandle:"#b8925a"}
};
let cfg = migrate({});

const SCHEMA = {
  "الأجهزة":[
    {t:"select",k:"stoveType",l:"البوتاجاز",o:[["free","بوتاجاز عادي بفرن"],["built","مسطح بلت إن + فرن تحت الرخامة"]]},
    {t:"toggle",k:"dish",l:"غسالة أطباق"},
    {t:"toggle",k:"sinkUnderWin",l:"الحوض في نص الشباك (لو على حيطته شباك)"},
    {t:"toggle",k:"openDoors",l:"🚪 افتح أبواب الأجهزة (اختبار المسافات)"},
    {t:"select",k:"fridgeHinge",l:"مفصلة باب التلاجة",o:[["a1","ناحية آخر الحيطة"],["a0","ناحية أول الحيطة"]]},
    {t:"select",k:"micro",l:"الميكروويف",o:[["upper","في الدولاب العلوي"],["counter","على الرخامة"],["none","من غير"]]},
    {t:"select",k:"hood",l:"الشفاط",o:[["chimney","شفاط برج"],["built","شفاط مخفي في الدولاب"],["none","من غير (شفاط في الشباك)"]]}
  ],
  "➕ أجهزة":[],
  "مقاسات الأجهزة":[
    {t:"head",l:"🔥 البوتاجاز"},
    {t:"range",k:"stoveW",l:"العرض",min:50,max:100,step:5,u:"سم"},
    {t:"range",k:"stoveD",l:"العمق",min:50,max:70,step:1,u:"سم"},
    {t:"range",k:"stoveH",l:"الارتفاع",min:80,max:95,step:1,u:"سم"},
    {t:"range",k:"stoveGap",l:"مسافة على كل جنب",min:0,max:10,step:1,u:"سم"},
    {t:"head",l:"🧊 التلاجة"},
    {t:"range",k:"fridgeW",l:"العرض",min:55,max:95,step:1,u:"سم"},
    {t:"range",k:"fridgeD",l:"العمق",min:55,max:85,step:1,u:"سم"},
    {t:"range",k:"fridgeH",l:"الارتفاع",min:140,max:200,step:1,u:"سم"},
    {t:"range",k:"fridgeGap",l:"تهوية على كل جنب",min:0,max:10,step:1,u:"سم"},
    {t:"range",k:"fridgeBack",l:"تهوية من ورا",min:0,max:15,step:1,u:"سم"},
    {t:"head",l:"🚰 الحوض"},
    {t:"range",k:"sinkW",l:"العرض",min:45,max:120,step:5,u:"سم"},
    {t:"range",k:"sinkD",l:"العمق",min:40,max:60,step:1,u:"سم"},
    {t:"select",k:"sinkType",l:"النوع",o:[["single","حوض واحد وجنبه مصفّاية"],["double","حوضين"]]},
    {t:"head",l:"🫧 الغسالة"},
    {t:"range",k:"washerW",l:"العرض",min:55,max:70,step:1,u:"سم"},
    {t:"range",k:"washerD",l:"العمق",min:45,max:70,step:1,u:"سم"},
    {t:"range",k:"washerH",l:"الارتفاع",min:80,max:90,step:1,u:"سم"},
    {t:"range",k:"washerGap",l:"مسافة على كل جنب",min:0,max:5,step:1,u:"سم"},
    {t:"range",k:"washerBack",l:"مسافة المواسير من ورا",min:0,max:15,step:1,u:"سم"},
    {t:"head",l:"🍽 غسالة الأطباق"},
    {t:"select",k:"dishW",l:"العرض",o:[["45","45 سم"],["60","60 سم"]]},
    {t:"toggle",k:"appLabels",l:"اكتب مقاس كل جهاز على الرسم"}
  ],
  "التخزين":[
    {t:"select",k:"upper",l:"الدواليب العلوية",o:[["ceiling","للسقف (دورين)"],["single","دور واحد عادي"],["none","من غير"]]},
    {t:"select",k:"upperFront",l:"ضلف الدواليب العلوية",o:[["solid","ضلف مقفولة"],["glass","ضلف إزاز"],["open","أرفف مفتوحة"]]},
    {t:"toggle",k:"aboveWindow",l:"دولاب فوق الشبابيك"},
    {t:"toggle",k:"aboveDoor",l:"دولاب فوق الأبواب"},
    {t:"toggle",k:"colShelves",l:"أرفف توابل على وش الكتف / البروز"},
    {t:"toggle",k:"nicheTop",l:"دولاب فوق التلاجة (للسقف)"},
    {t:"select",k:"corner",l:"دولاب الركن",o:[["blind","ركن مقفول (ميت)"],["door","باب ركن مكسور"],["carousel","كاروسيل (دوّار)"],["magic","ماجيك كورنر (سحّاب)"]]}
  ],
  "الوحدات":[],
  "الأوضة":[
    {t:"head",l:"📏 مقاسات المطبخ"},
    {t:"select",k:"dimsOn",l:"المقاسات اللي هتدخلها",o:[["brick","على الطوب (قبل المحارة)"],["net","بعد التشطيب"]]},
    {t:"range",k:"roomW",l:"العرض (من الشمال لليمين)",min:120,max:600,step:1,u:"سم"},
    {t:"range",k:"roomL",l:"الطول (من القدامية للي ورا)",min:150,max:700,step:1,u:"سم"},
    {t:"range",k:"plaster",l:"سُمك المحارة على كل حيطة",min:0,max:4,step:0.5,u:"سم"},
    {t:"range",k:"tileT",l:"سُمك السيراميك واللزق",min:0,max:2,step:0.5,u:"سم"}
  ],
  "الارتفاعات":[
    {t:"range",k:"ceil",l:"ارتفاع السقف",min:230,max:350,step:5,u:"سم"},
    {t:"range",k:"uStart",l:"بداية الدواليب العلوية من الأرض",min:135,max:170,step:1,u:"سم"},
    {t:"range",k:"uDepth",l:"عمق الدواليب العلوية",min:30,max:40,step:1,u:"سم"},
    {t:"range",k:"ch",l:"ارتفاع الرخامة",min:85,max:95,step:1,u:"سم"}
  ],
  "الشكل":[
    {t:"select",k:"style",l:"ستايل جاهز",o:Object.entries(STYLES).map(([k,v])=>[k,v.name])},
    {t:"select",k:"fronts",l:"الدواليب السفلية",o:[["mixed","أدراج وضلف"],["doors","ضلف بس"],["drawers","أدراج بس"]]},
    {t:"select",k:"handles",l:"المقابض",o:[["black","بار أسود"],["gold","بار دهبي"],["none","من غير مقابض (جولا)"]]},
    {t:"color",k:"cBase",l:"لون الدواليب السفلية"},
    {t:"color",k:"cUpper",l:"لون الدواليب العلوية"},
    {t:"color",k:"cCounter",l:"لون الرخامة"},
    {t:"color",k:"cWall",l:"لون الحيطان"},
    {t:"color",k:"cFloor",l:"لون الأرضية"},
    {t:"color",k:"cWood",l:"لون الخشب والأرفف"},
    {t:"toggle",k:"gloss",l:"دواليب لامعة (هاي جلوس)"},
    {t:"select",k:"splash",l:"الحيطة ورا الرخامة",o:[["tiles","سيراميك مربع"],["subway","سيراميك طوبة"],["stone","نفس الرخامة"],["glass","إزاز ملون"],["none","دهان عادي"]]},
    {t:"color",k:"cSplash",l:"لون السيراميك / الإزاز"},
    {t:"select",k:"floorType",l:"الأرضية",o:[["tiles","بورسلين 60×60"],["wood","باركيه خشب"],["checker","شطرنج"],["plain","لون واحد"]]},
    {t:"color",k:"cCeil",l:"لون السقف"}
  ],
  "العرض":[
    {t:"toggle",k:"labels",l:"إظهار المقاسات"},
    {t:"toggle",k:"led",l:"إضاءة LED تحت الدواليب"},
    {t:"toggle",k:"night",l:"منظر بالليل"},
    {t:"select",k:"walls",l:"الحيطان",o:[["auto","تختفي لوحدها"],["ghost","شفافة دايمًا"],["solid","ظاهرة دايمًا"]]},
    {t:"toggle",k:"decor",l:"إكسسوارات (غلاية، حلة، زرعة)"},
    {t:"toggle",k:"openCab",l:"🚪 افتح كل الدواليب (تشوف جوه)"},
    {t:"toggle",k:"showTri",l:"🔺 ارسم مثلث العمل على الأرض"},
    {t:"action",l:"🚶 امشي جوه المطبخ",fn:()=>{ setPanel(false); viewSel.value="walk"; setView("walk"); }},
    {t:"select",k:"doorLeaf",l:"ضلفة الباب",o:[["open","مفتوحة"],["closed","مقفولة"],["none","من غير"]]},
    {t:"toggle",k:"autoRot",l:"لف تلقائي"},
    {t:"toggle",k:"dragOn",l:"سحب الأجهزة والوحدات بالصباع"},
    {t:"toggle",k:"walkPad",l:"أزرار المشي جوه المطبخ"},
    {t:"action",l:"📷 صورة للتصميم",fn:()=>takeShot()},
    {t:"action",l:"📐 رسومات النجار والمقاسات",fn:()=>openDraw()}
  ],
  "المية والكهربا":[
    {t:"toggle",k:"showPts",l:"اظهر النقط في الـ3D"},
    {t:"toggle",k:"ptLabels",l:"اكتب اسم كل نقطة"},
    {t:"action",l:"📐 جدول الكهربائي والسباك",fn:()=>openDraw("pts")}
  ],
  "خطوات التنفيذ":[],
  "التكلفة":[
    {t:"num",k:"pLower",l:"سعر متر الدواليب السفلية"},
    {t:"num",k:"pUpper",l:"سعر متر الدواليب العلوية"},
    {t:"num",k:"pTall",l:"سعر متر الدولاب الطول"},
    {t:"num",k:"pMarble",l:"سعر متر الرخامة"}
  ],
  "المشاريع":[],
  "الحمام":[],
  "السقف":[
    {t:"select",k:"gbType",l:"نوع السقف",o:[["tray","جبس بورد: بيت نور"],["flat","جبس بورد: فلات"],["slab","من غير جبس (سقف عادي)"],["hide","إخفاء السقف في العرض"]]},
    {t:"range",k:"ceil",l:"ارتفاع السقف (الخرسانة)",min:230,max:400,step:1,u:"سم"},
    {t:"toggle",k:"chand",l:"نجفة في النص"},
    {t:"color",k:"cCeil",l:"لون السقف"}
  ],
  "الأثاث":[],
  "الدهان والأرضية":[
    {t:"select",k:"floorType",l:"الأرضية",o:[["tiles","بورسلين"],["wood","باركيه"],["checker","شطرنج"],["plain","لون واحد"]]},
    {t:"select",k:"floorTile",l:"مقاس البلاط",o:[["60x60","60×60"],["60x120","60×120"],["20x120","20×120 خشبي"],["30x30","30×30"]]},
    {t:"color",k:"cFloor",l:"لون الأرضية"},
    {t:"color",k:"cWall",l:"لون الدهان"},
    {t:"color",k:"cSofa",l:"لون القماش (كنب وسراير)"},
    {t:"color",k:"cWood",l:"لون الخشب"},
    {t:"color",k:"cRug",l:"لون السجادة"},

    {t:"toggle",k:"curtains",l:"ستاير على الشبابيك"},
    {t:"color",k:"cCurtain",l:"لون الستارة"},
    {t:"select",k:"accent",l:"حيطة مميزة (تجليد / ورق)",o:[["","من غير"],["W","الحيطة القدامية"],["RT","الحيطة اليمين"],["D","الحيطة اللي ورا"],["L","الحيطة الشمال"]]},
    {t:"select",k:"accentT",l:"نوع التجليد",o:[["wood","شرائح خشب"],["stone","حجر"],["paper","ورق حائط"],["paint","دهان لون تاني"]]},
    {t:"color",k:"cAccent",l:"لون الحيطة المميزة"},
    {t:"range",k:"paintCoats",l:"عدد أوش الدهان",min:1,max:4,step:1,u:"وش"},
    {t:"num",k:"pFloor",l:"سعر متر الأرضية (خامة + مصنعية)"},
    {t:"num",k:"pPaint",l:"سعر متر الدهان"},
    {t:"num",k:"pSkirt",l:"سعر متر الوزرة"}
  ],
  "التشطيب":[
    {t:"select",k:"tileTop",l:"السيراميك على الحيطان لحد",o:[["ceil","السقف"],["240","240 سم"],["210","210 سم"],["150","150 سم"]]},
    {t:"select",k:"wallTile",l:"مقاس سيراميك الحيطان",o:[["25x40","25×40"],["30x60","30×60"],["60x60","60×60"],["60x120","60×120"]]},
    {t:"select",k:"floorTile",l:"مقاس بلاط الأرضية",o:[["30x30","30×30"],["60x60","60×60"],["20x120","20×120 خشبي"],["60x120","60×120"]]},
    {t:"color",k:"cTile",l:"لون سيراميك الحيطان"},
    {t:"color",k:"cFloor",l:"لون الأرضية"},
    {t:"range",k:"waste",l:"نسبة الهالك",min:5,max:20,step:1,u:"%"},
    {t:"range",k:"wpUp",l:"رفع العزل على الحيطان",min:10,max:60,step:5,u:"سم"},
    {t:"range",k:"wpShower",l:"ارتفاع العزل في الشاور",min:100,max:240,step:10,u:"سم"},
    {t:"num",k:"pTile",l:"سعر متر السيراميك"},
    {t:"num",k:"pLabor",l:"مصنعية متر السيراميك"},
    {t:"num",k:"pWP",l:"سعر متر العزل"}
  ]
};

