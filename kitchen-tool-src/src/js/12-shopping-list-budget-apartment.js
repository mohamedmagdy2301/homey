// =================== SHOPPING LIST & BUDGET (apartment) ===================
const BUDGET_DEF=["كهربا","سباكة","محارة","عزل","سيراميك وبورسلين","دهانات","جبس","نجارة المطبخ","دواليب وأبواب","ألوميتال","أجهزة صحية","أجهزة كهربائية","أثاث"];
function shoppingData(){
  const T={}, add=(trade,item,qty,unit)=>{ T[trade]=T[trade]||{}; const k=item+"|"+unit; T[trade][k]=(T[trade][k]||0)+qty; };
  const sv=APT_SVC||{drain:{m4:0,m2:0},cold:{main:0,br:0},hot:{main:0,br:0},wire:{},circuits:0};
  for(const r of APT.rooms){ const sn=SNAP[r.id]; if(!sn||!sn.q) continue; const q=sn.q;
    if(sn.roomType==="bath"){ add("السيراميك","سيراميك حيطان حمامات",q.tiledA*1.1,"م²"); add("السيراميك","بلاط أرضية حمامات",q.floorA*1.1,"م²"); add("العزل","عزل حمامات",sn.bath?sn.bath.wp:0,"م²"); }
    else { add("السيراميك",`أرضية ${sn.roomType==="room"?"الأوض والصالات":sn.roomType==="hall"?"الطرقات":"المطبخ"} (${sn.cfg.floorTile||"60x60"})`,q.floorA*1.1,"م²"); }
    if(sn.roomType==="kitchen") add("السيراميك","سيراميك حيطة المطبخ",q.tiledA*1.1,"م²");
    add("النقاش","دهان حيطان وأسقف",q.paintA,"م²"); add("النقاش","دهان (لتر تقريبًا)",q.liters,"لتر"); if(q.skirt) add("النقاش","وزرة",q.skirt,"م"); if(q.accentA) add("النقاش","تجليد/ورق حيطة مميزة",q.accentA,"م²");
    if(q.spots) add("الكهربائي","سبوتات LED",q.spots,"قطعة");
    const g=sn.gb; if(g&&g.type==="flat"){ add("الجبسنجي","جبس بورد فلات",g.boardA,"م²"); add("الجبسنجي","زوايا حوالين الحيطان",g.angle,"م.ط"); add("الجبسنجي","ألواح جبس 120×240 (تقريبي)",g.boards,"لوح"); }
    if(g&&g.type==="tray"){ add("الجبسنجي","بيت نور",g.innerPer,"م.ط"); if(g.center>0.005) add("الجبسنجي","جبس فلات في نص بيت النور",g.innerA,"م²"); add("الجبسنجي","ألواح جبس 120×240 (تقريبي)",g.boards,"لوح"); add("الجبسنجي","زوايا حوالين الحيطان",g.angle,"م.ط"); if(g.led) add("الكهربائي","شريط ليد مخفي",g.led,"م"); }
    for(const [k,v] of Object.entries(q.pts||{})){ if(k==="socket") add("الكهربائي","برايز",v,"قطعة"); if(k==="switch") add("الكهربائي","مفاتيح",v,"قطعة"); if(k==="data") add("الكهربائي","نقط دش وإنترنت",v,"نقطة"); if(k==="water") add("السباك","نقط تغذية مية",v,"نقطة"); if(k==="drain") add("السباك","نقط صرف",v,"نقطة"); if(k==="gas") add("السباك","مخارج غاز",v,"نقطة"); }
    for(const [n,v] of Object.entries(q.fix||{})) add("الأدوات الصحية",n,v,"قطعة");
    for(const [n,v] of Object.entries(q.app||{})) add("الأجهزة",n,v,"قطعة");
    for(const [n,v] of Object.entries(q.furn||{})) add("الأثاث",n,v,"قطعة");
    for(const w of q.wardrobes||[]) add("النجار",w,1,"قطعة");
    if(sn.roomType==="kitchen"){ const a=sn.acc||{}; add("النجار","دواليب مطبخ سفلي",a.lower||0,"م.ط"); add("النجار","دواليب مطبخ علوي",a.upper||0,"م.ط"); if(a.tall) add("النجار","دواليب مطبخ طول",a.tall,"م.ط"); add("النجار","رخامة",a.marble||0,"م.ط"); }
    for(const f of sn.feats){ if(f.type==="window") add("الألوميتال",`شباك ${Math.round((f.a1-f.a0)*100)}×${Math.round((f.y1-f.y0)*100)}`,1,"قطعة"); } }
  for(const L of APTLINKS){ if(L.B||!L.f||L.f.type!=="door") continue; }
  const doorSet=new Set(); for(const L of APTLINKS){ if(!L.f||L.f.type!=="door") continue; const key=L.apt?`apt${L.A}${L.B}${L.b0}`:`${L.A}${L.f.id}`; if(doorSet.has(key)) continue; doorSet.add(key); if(L.B&&!L.apt){ const back=APTLINKS.find(x=>x!==L&&!x.apt&&x.A===L.B&&x.B===L.A); if(back&&doorSet.has(`${back.A}${back.f.id}`)) continue; } add("النجار",`باب ${Math.round((L.apt?(L.b1-L.b0):(L.f.a1-L.f.a0))*100)} سم`,1,"قطعة"); }
  if(sv.drain.m4) add("السباك","ماسورة صرف 4 بوصة",sv.drain.m4*1.1,"م"); if(sv.drain.m2) add("السباك","ماسورة صرف 2 و3 بوصة",sv.drain.m2*1.1,"م");
  if(sv.cold.main+sv.hot.main) add("السباك","ماسورة PPR 25 مم (رئيسي)",(sv.cold.main+sv.hot.main)*1.1,"م"); if(sv.cold.br+sv.hot.br) add("السباك","ماسورة PPR 20 مم (فروع)",(sv.cold.br+sv.hot.br)*1.1,"م");
  const wp=Object.values(T["السباك"]||{}); const nW=Object.entries(T["السباك"]||{}).filter(([k])=>k.startsWith("نقط تغذية")).reduce((x,[,v])=>x+v,0), nD=Object.entries(T["السباك"]||{}).filter(([k])=>k.startsWith("نقط صرف")).reduce((x,[,v])=>x+v,0);
  if(nW) { add("السباك","كيعان وتيهات PPR (تقريبي)",Math.ceil(nW*3),"قطعة"); add("السباك","محابس",APT.rooms.filter(r=>SNAP[r.id]&&SNAP[r.id].q&&(SNAP[r.id].q.pts||{}).water).length+1,"قطعة"); }
  if(nD) add("السباك","كيعان صرف (تقريبي)",Math.ceil(nD*2),"قطعة");
  for(const [mm,m] of Object.entries(sv.wire||{})) add("الكهربائي",`سلك ${mm} مم²`,m*1.1,"م");
  const boxes=["برايز|قطعة","مفاتيح|قطعة","نقط دش وإنترنت|نقطة"].reduce((x,k)=>x+((T["الكهربائي"]||{})[k]||0),0); if(boxes) add("الكهربائي","علب كهربا",boxes,"قطعة");
  if(sv.circuits) { add("الكهربائي","قواطع",sv.circuits,"قطعة"); add("الكهربائي",`لوحة ${sv.circuits+2} خط + قاطع رئيسي ${sv.main||40} أمبير`,1,"قطعة"); add("الكهربائي","قاطع تسريب أرضي (RCD)",1,"قطعة"); }
  return T;
}
function tradeText(tr,items){ return `*${tr}* — طلبات الشقة:\n`+Object.entries(items).filter(([,v])=>v>0.05).map(([k,v])=>{ const [n,u]=k.split("|"); return `• ${n}: ${u==="م"||u==="م²"||u==="م.ط"?v.toFixed(1):Math.ceil(v)} ${u}`; }).join("\n"); }
