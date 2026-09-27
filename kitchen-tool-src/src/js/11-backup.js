// =================== BACKUP ===================
async function backupData(){ await saveNow(); const projects=[]; for(const p of projIndex){ const d=p.id===PROJ.id?{name:PROJ.name,cfg}:await stGet("kproj:"+p.id); if(d) projects.push({id:p.id,name:d.name||p.name,cfg:d.cfg}); }
  if(!projects.some(p=>p.id===PROJ.id)) projects.push({id:PROJ.id,name:PROJ.name,cfg}); return {app:"kitchen-3d",v:1,date:new Date().toISOString(),projects,apt:APT,current:PROJ.id}; }
function downloadText(name,text,type){ try{ const blob=new Blob([text],{type:type||"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); return true; }catch(e){ return false; } }
async function restoreData(obj){ if(!obj||!Array.isArray(obj.projects)||!obj.projects.length) throw new Error("bad");
  for(const p of obj.projects){ await stSet("kproj:"+p.id,{name:p.name,cfg:p.cfg}); const i=projIndex.findIndex(x=>x.id===p.id); const e={id:p.id,name:p.name,t:Date.now()}; if(i>=0) projIndex[i]=e; else projIndex.push(e); }
  await stSet("kproj:index",projIndex); if(obj.apt){ APT={...APT,...obj.apt}; await saveApt(); }
  const cur=obj.projects.find(p=>p.id===obj.current)||obj.projects[0]; PROJ={id:cur.id,name:cur.name}; cfg=migrate(cur.cfg); hist.length=0; SEL=null; updProjName(); build(); renderControls(); }
function backupUI(el){
  const h=document.createElement("div"); h.className="head"; h.textContent="💾 نسخة احتياطية للشقة كلها"; el.appendChild(h);
  const n=document.createElement("div"); n.className="note"; n.textContent="ملف واحد فيه كل المطابخ والحمامات والأوض والشقة. نزّله واحتفظ بيه في مكان آمن (درايف أو واتساب لنفسك)، وتقدر ترجّعه في أي وقت أو على أي جهاز."; el.appendChild(n);
  const st=document.createElement("div"); st.className="note"; const act=document.createElement("div"); act.className="act";
  const mk=(t,fn,main)=>{ const b=document.createElement("button"); b.className="btn"+(main?" main":""); b.textContent=t; b.onclick=fn; act.appendChild(b); };
  const ta=document.createElement("textarea"); ta.placeholder="لو التنزيل مش شغال، انسخ النص ده واحتفظ بيه، أو الصق نسخة هنا ودوس «رجّع من النص»"; ta.style.display="none";
  mk("⬇ نزّل النسخة",async()=>{ const d=await backupData(), txt=JSON.stringify(d); ta.value=txt; ta.style.display="block"; const ok=downloadText(`شقتي-${new Date().toISOString().slice(0,10)}.json`,txt); st.textContent=ok?`✓ اتنزّلت (${d.projects.length} مشروع). لو مظهرتش في التنزيلات، انسخ النص اللي تحت.`:"التنزيل مش متاح هنا، انسخ النص اللي تحت."; },true);
  mk("📋 انسخها كنص",async()=>{ const d=await backupData(); ta.value=JSON.stringify(d); ta.style.display="block"; ta.select(); try{ await navigator.clipboard.writeText(ta.value); st.textContent="✓ اتنسخت، الصقها في رسالة لنفسك"; }catch(e){ document.execCommand&&document.execCommand("copy"); st.textContent="اتعلّمت، انسخها من المربع"; } });
  const fi=document.createElement("input"); fi.type="file"; fi.accept=".json,application/json,text/plain"; fi.style.display="none";
  fi.onchange=async()=>{ const f=fi.files[0]; if(!f) return; try{ const obj=JSON.parse(await f.text()); await restoreData(obj); st.textContent=`✓ اترجعت ${obj.projects.length} مشروع والشقة`; refreshSheet(); }catch(e){ st.textContent="الملف ده مش نسخة من الأداة"; } };
  mk("⬆ رجّع من ملف",()=>fi.click());
  mk("رجّع من النص",async()=>{ ta.style.display="block"; if(!ta.value.trim()){ st.textContent="الصق النسخة في المربع الأول"; ta.focus(); return; } try{ const obj=JSON.parse(ta.value); await restoreData(obj); st.textContent=`✓ اترجعت ${obj.projects.length} مشروع`; refreshSheet(); }catch(e){ st.textContent="النص الملصوق مش نسخة صحيحة"; } });
  el.append(act,fi,ta,st);
}