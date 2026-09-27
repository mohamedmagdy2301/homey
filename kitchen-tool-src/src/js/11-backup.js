// =================== BACKUP ===================
async function backupData(){ await saveNow(); const projects=[], missing=[]; for(const p of projIndex){ const d=p.id===PROJ.id?{name:PROJ.name,cfg}:await stGet("kproj:"+p.id); if(d) projects.push({id:p.id,name:d.name||p.name,cfg:d.cfg}); else missing.push(p.name); }
  if(!projects.some(p=>p.id===PROJ.id)) projects.push({id:PROJ.id,name:PROJ.name,cfg}); const pr=await stRead("kprices"), prices=pr.err?{...PRICE_DEF}:cleanPrices(pr.v);
  const out={app:"kitchen-3d",v:1,date:new Date().toISOString(),projects,apt:APT,prices,current:PROJ.id};
  Object.defineProperty(out,"missing",{value:missing,enumerable:false}); return out; } // missing = projects that couldn't be read (not written into the file)
const backupMsg=(d,ok)=>(ok?`✓ اتنزّلت (${d.projects.length} مشروع).`:`✓ ${d.projects.length} مشروع.`)+(d.missing&&d.missing.length?` ⚠ مقدرتش أقرا: ${d.missing.join("، ")}، النسخة من غيرهم.`:"");
function downloadText(name,text,type){ try{ const blob=new Blob([text],{type:type||"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); return true; }catch(e){ return false; } }
// validate the whole file first, then write: a bad file must not leave half-restored data behind
async function restoreData(obj){ if(!obj||typeof obj!=="object"||!Array.isArray(obj.projects)) throw new Error("bad");
  const okId=id=>typeof id==="string"&&/^[\w-]{1,40}$/.test(id);
  const ps=obj.projects.filter(p=>p&&typeof p==="object"&&okId(p.id)&&p.cfg&&typeof p.cfg==="object"&&!Array.isArray(p.cfg)).map(p=>({id:p.id,name:cleanName(p.name)||"مشروع",cfg:cleanDeep(p.cfg)}));
  if(!ps.length) throw new Error("bad");
  let apt=null; if(obj.apt&&typeof obj.apt==="object"&&!Array.isArray(obj.apt)){ apt=cleanDeep(obj.apt); apt.rooms=(Array.isArray(apt.rooms)?apt.rooms:[]).filter(r=>r&&typeof r==="object"&&okId(r.id)); apt.doors=(Array.isArray(apt.doors)?apt.doors:[]).filter(d=>d&&typeof d==="object"&&okId(d.a)&&okId(d.b)); }
  const prices=cleanPrices(obj.prices); /* like apt: only known price keys holding numbers >= 0, anything else is dropped */
  migrate(clone(ps.find(p=>p.id===obj.current)||ps[0]).cfg); // throws before anything is written if the design can't load
  clearTimeout(saveT); for(const p of ps){ DELETED.delete(p.id); await stSet("kproj:"+p.id,{name:p.name,cfg:p.cfg}); const i=projIndex.findIndex(x=>x.id===p.id); const e={id:p.id,name:p.name,t:Date.now()}; if(i>=0) projIndex[i]=e; else projIndex.push(e); }
  await stSet("kproj:index",projIndex); if(apt){ APT={...APT,...apt}; await saveApt(); }
  if(Object.keys(prices).length){ PRICE_DEF={...PRICE_DEF,...prices}; await stSet("kprices",PRICE_DEF); }
  const cur=ps.find(p=>p.id===obj.current)||ps[0]; PROJ={id:cur.id,name:cur.name}; cfg=migrate(cur.cfg); clearHist(); SEL=null; updProjName(); build(); renderControls(); return ps.length; }
function backupUI(el){
  const h=document.createElement("div"); h.className="head"; h.textContent="💾 نسخة احتياطية للشقة كلها"; el.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="ملف واحد فيه كل المطابخ والحمامات والأوض والشقة. نزّله واحتفظ بيه في مكان آمن (درايف أو واتساب لنفسك)، وتقدر ترجّعه في أي وقت أو على أي جهاز."; el.appendChild(n);
  const st=document.createElement("div"); st.className="note"; const act=document.createElement("div"); act.className="act";
  const mk=(t,fn,main)=>{ const b=document.createElement("button"); b.className="btn"+(main?" main":""); b.textContent=t; b.onclick=fn; act.appendChild(b); };
  const ta=document.createElement("textarea"); ta.placeholder="لو التنزيل مش شغال، انسخ النص ده واحتفظ بيه، أو الصق نسخة هنا ودوس «رجّع من النص»"; ta.style.display="none";
  mk("⬇ نزّل النسخة",async()=>{ const d=await backupData(), txt=JSON.stringify(d); ta.value=txt; ta.style.display="block"; const ok=downloadText(`شقتي-${new Date().toISOString().slice(0,10)}.json`,txt); st.textContent=ok?backupMsg(d,true)+" لو مظهرتش في التنزيلات، انسخ النص اللي تحت.":"التنزيل مش متاح هنا، انسخ النص اللي تحت. "+backupMsg(d,false); },true);
  mk("📋 انسخها كنص",async()=>{ const d=await backupData(); ta.value=JSON.stringify(d); ta.style.display="block"; ta.select(); try{ await navigator.clipboard.writeText(ta.value); st.textContent="✓ اتنسخت، الصقها في رسالة لنفسك. "+backupMsg(d,false); }catch(e){ document.execCommand&&document.execCommand("copy"); st.textContent="اتعلّمت، انسخها من المربع"; } });
  const fi=document.createElement("input"); fi.type="file"; fi.accept=".json,application/json,text/plain"; fi.style.display="none";
  fi.onchange=async()=>{ const f=fi.files[0]; if(!f) return; try{ const obj=JSON.parse(await f.text()); const n=await restoreData(obj); st.textContent=`✓ اترجعت ${n} مشروع`+(obj.apt?" والشقة":""); refreshSheet(); }catch(e){ st.textContent="الملف ده مش نسخة من الأداة"; } };
  mk("⬆ رجّع من ملف",()=>fi.click());
  mk("رجّع من النص",async()=>{ ta.style.display="block"; if(!ta.value.trim()){ st.textContent="الصق النسخة في المربع الأول"; ta.focus(); return; } try{ const obj=JSON.parse(ta.value); const n=await restoreData(obj); st.textContent=`✓ اترجعت ${n} مشروع`; refreshSheet(); }catch(e){ st.textContent="النص الملصوق مش نسخة صحيحة"; } });
  el.append(act,fi,ta,st);
}