#!/usr/bin/env python3
"""Headless smoke tests for dist/kitchen-3d.html
Requirements: pip install playwright && playwright install chromium
three.js r128 is served locally (npm pack three@0.128.0 -> package/build/three.min.js) so tests run offline.
Usage: python3 tests/smoke_test.py [path/to/three.min.js]
"""
import os, sys, json, subprocess, tempfile, shutil, tarfile, pathlib
from playwright.sync_api import sync_playwright
try: sys.stdout.reconfigure(encoding="utf-8")  # Arabic in failure details (Windows consoles default to cp1252)
except Exception: pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = pathlib.Path(ROOT, "dist", "kitchen-3d.html").as_uri()
THREE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "tests", "three.min.js")
if not os.path.exists(THREE):  # fetched once from npm and cached as tests/three.min.js
    npm = shutil.which("npm") or sys.exit("npm not found: pass the path to three.min.js (r128) as an argument")
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([npm, "pack", "three@0.128.0"], cwd=d, check=True, capture_output=True)
        tgz = [f for f in os.listdir(d) if f.endswith(".tgz")][0]
        with tarfile.open(os.path.join(d, tgz)) as t:
            shutil.copyfileobj(t.extractfile("package/build/three.min.js"), open(THREE, "wb"))
MOCK = """window.storage={_d:{},async get(k){return k in this._d?{key:k,value:this._d[k]}:null},async set(k,v){this._d[k]=v;return {key:k,value:v}},async delete(k){delete this._d[k];return {key:k,deleted:true}},async list(){return {keys:Object.keys(this._d)}}};"""
FAILING = """window.storage={async get(k){throw new Error('x')},async set(k,v){return null},async delete(k){return null},async list(){return null}};"""
results = []
def check(name, cond, info=""):
    results.append((name, bool(cond))); print(("PASS " if cond else "FAIL ") + name + (f"  {info}" if info and not cond else ""))

def page(p, storage=MOCK, size=(390, 760)):
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": size[0], "height": size[1]})
    pg.add_init_script(storage)
    pg.route("**/three.min.js", lambda r: r.fulfill(path=THREE, content_type="application/javascript"))
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(HTML); pg.wait_for_timeout(2500)
    return b, pg, errs

with sync_playwright() as p:
    b, pg, errs = page(p); ev = pg.evaluate
    check("loads without JS errors", not errs, errs[:2])
    tpls = ev("()=>[...Object.keys(TEMPLATES),...Object.keys(BTEMPLATES),...Object.keys(HTEMPLATES),...Object.keys(RTEMPLATES)]")
    for t in tpls:
        r = ev(f"()=>{{try{{ cfg=newCfg('{t}'); build(); return [UNITS.length, STATS.net]; }}catch(e){{ return 'ERR '+e.message; }}}}")
        check(f"template {t} builds", isinstance(r, list) and r[1][0] > 0, r)
    r = ev("()=>{ cfg=newCfg('r_living'); cfg.feats.push({id:'c',type:'cut',corner:'DR',a:150,b:150,shape:'rect'}); build(); return [CUTS.length, QTY.floorA]; }")
    check("L-shaped room (cut corner) reduces floor area", r[0] == 1 and r[1] < 19.4, r)
    r = ev("()=>{ cfg=newCfg('r_master'); const w=cfg.furn.find(f=>f.type==='wardrobe'); w.fillW='1'; w.toCeil='1'; w.topH=50; w.secs=[{k:'doors',w:0},{k:'gap',w:80},{k:'drawers',w:0}]; build(); const u=UNITS.find(u=>u.ft==='wardrobe'); return [u.secs.length, +(u.y1).toFixed(2), +(H-gbWallDrop()).toFixed(2)]; }")
    check("full-wall wardrobe with sections reaches the (gypsum) ceiling", r[0] == 3 and abs(r[1] - r[2]) < 0.03, r)
    r = ev("()=>{ cfg=newCfg('U'); cfg.corner='carousel'; build(); return UNITS.filter(u=>u.corner).length; }")
    check("U kitchen gets corner cabinets", r >= 1, r)
    ev("async()=>{ cfg=newCfg('mine'); build(); await saveNow(); window._bk=await backupData(); }")
    r = ev("async()=>{ const n=_bk.projects.length; cfg=newCfg('b_std'); build(); await restoreData(_bk); return [n, cfg.roomType]; }")
    check("backup / restore round-trip", r[0] >= 1 and r[1] == "kitchen", r)
    ev("async()=>{ await openApt(); }"); pg.wait_for_timeout(1500)
    for v in ["__hall", "__bath", "__living"]:
        pg.select_option("#aptBody .addrow select", v); pg.click("#aptBody .addrow button"); pg.wait_for_timeout(1800)
    r = ev("()=>[APT.rooms.length, SHARED.length]")
    check("apartment: rooms added and placed side by side", r[0] == 4 and r[1] >= 3, r)
    r = ev("()=>Object.keys(shoppingData()).length")
    check("apartment: shopping list generated", r >= 4, r)
    ev("()=>aptDoc()"); pg.wait_for_timeout(3500)
    r = ev("()=>document.querySelectorAll('#dtabs button').length")
    check("apartment: full document (all rooms) generated", r >= 8, r)
    ev("()=>{ document.getElementById('dclose').click(); enterApt3D(true); }"); pg.wait_for_timeout(1500)
    r = ev("()=>[APT3D, aptRoots.length]")
    check("apartment 3D + walk mode", r[0] and r[1] == 4, r)
    ev("()=>exitApt3D()")
    r = ev("()=>{ const s=SHARED[0]; APT.doors=[{a:s.b,b:s.a,pos:20,w:80}]; const n=aptDoorLinks().length; const t=APT.wallT; APT.wallT=60; aptRecalc(); aptDoorLinks(); const kept=APT.doors.length; APT.wallT=t; aptRecalc(); return [n, kept]; }")
    check("apartment: door (either direction) survives rooms moving apart", r[0] == 1 and r[1] == 1, r)
    pg.on("dialog", lambda d: d.accept())
    r = ev("""async()=>{ window._aptBak=JSON.stringify(APT); await openApt(); await applyAptTpl(APT_TPLS[2]); const out=APTLINKS.filter(L=>!L.B).map(L=>SNAP[L.A].roomType);
      const svg=document.getElementById('aptSvg'), ctl=document.querySelector('#apt .aptctl'), pl=document.querySelector('#apt .aptplan').getBoundingClientRect();
      return [APT.rooms.length, APTLINKS.filter(L=>L.B).length, out, APT.rooms.some(r=>r.id===PROJ.id)===(cfg.roomType==='kitchen'), document.getElementById('apt').classList.contains('split'), pl.height>200, !!ctl&&getComputedStyle(ctl).overflowY, +svg.querySelector('.rn').getAttribute('font-size')*svg.getScreenCTM().a]; }""")
    check("apartment template: 7 rooms with a balcony, every door links up, only the front door leads out", r[0] == 7 and r[1] == 6 and r[2] == ["hall"] and r[3], r)
    check("apartment plan stays pinned above its own scrolling controls, room names readable", r[4] and r[5] and r[6] == "auto" and 9 <= r[7] <= 15, r)
    r = ev("()=>{ document.querySelector('#apt .aptbig').click(); const a=[document.getElementById('apt').classList.contains('big'), getComputedStyle(document.querySelector('#apt .aptctl')).display, document.querySelector('#apt .aptplan').getBoundingClientRect().height]; document.querySelector('#apt .aptbig').click(); return a; }")
    check("apartment plan enlarges to fill the screen", r[0] and r[1] == "none" and r[2] > 550, r)
    r = ev("""async()=>{ const id=n=>APT.rooms.find(r=>SNAP[r.id].name===n), bath=id('حمام'), kids=id('أوضة أطفال'), w0=SNAP[bath.id].cfg.roomW, o0=kids.rel.off, u0=APT_UNDO.length;
      await aptResize(bath,'x',SNAP[bath.id].RW*100+50,false); const grown=[SNAP[bath.id].cfg.roomW-w0, kids.rel.off-o0, SHARED.some(s=>[s.a,s.b].includes(bath.id)&&[s.a,s.b].includes(kids.id)), APT_UNDO.length-u0];
      await aptUndo(); return [...grown, SNAP[bath.id].cfg.roomW===w0, APT.rooms.find(r=>r.id===kids.id).rel.off===o0]; }""")
    check("apartment: resizing a room pushes the next room in its row, and undo puts both back", r == [50, 50, True, 1, True, True], r)
    r = ev("""async()=>{ const k=APT.rooms.find(r=>SNAP[r.id].name==='أوضة أطفال'); await aptEditRoom(k.id,d=>{ d.name='أوضة <يوسف>'; }); await saveApt(); const a=[SNAP[k.id].name, projIndex.find(p=>p.id===k.id).name]; await aptUndo(); return [...a, SNAP[k.id].name]; }""")
    check("apartment: rename a room (cleaned) and undo it", r == ["أوضة يوسف", "أوضة يوسف", "أوضة أطفال"], r)
    r = ev("""async()=>{ const k=APT.rooms.find(r=>SNAP[r.id].name==='أوضة أطفال'); APT.dimMode='net'; aptSel=k.id; renderApt(); const f=()=>[...document.querySelectorAll('#apt .card.sel .ctl.rng input.num')].map(x=>+x.value), lbl=()=>document.querySelector('#aptSvg g[data-room="'+k.id+'"] .rd').textContent;
      await aptResize(k,'x',300,false); const a=[Math.round(SNAP[k.id].RW*100), f()[0], lbl().split('×').map(Number).includes(300)];
      APT.dimMode='brick'; await saveApt(); renderApt(); const b=[f()[0], lbl().split('×').map(Number).includes(306), document.querySelector('#apt .aptarea').textContent.includes('على الطوب')];
      APT.dimMode='net'; await saveApt(); renderApt(); return [...a,...b]; }""")
    check("apartment: sizes switch - 300 typed as clear is 300 on the plan; on the brick it reads 306", r == [300, 300, True, 306, True, True], r)
    n0 = ev("()=>{ aptSel=null; renderApt(); return (APT.doors||[]).length; }"); pg.wait_for_timeout(300)
    bb = pg.locator("#aptSvg [data-sh]").first.bounding_box(); pg.mouse.click(bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2); pg.wait_for_timeout(600)
    r = ev("()=>[(APT.doors||[]).length, APTLINKS.filter(L=>L.apt).length, document.querySelectorAll('#aptSvg [data-h]').length, document.querySelector('#apt .aptarea').textContent.includes('م²')]")
    check("apartment: tapping a shared wall adds a door; the picked room gets 4 resize handles; total area shows", r[0] == n0 + 1 and r[1] >= 1 and r[2] == 4 and r[3], r)
    ev("async()=>{ APT=JSON.parse(_aptBak); await saveApt(); await refreshSnaps(); aptRecalc(); closeApt(); }"); pg.wait_for_timeout(800)
    r = ev("()=>{ pushHist(); cfg.roomW+=10; document.getElementById('undo').click(); const h=hist.length, rd=redo.length, c=JSON.stringify(cfg); openWizard(true); pushHist(); applyTemplate(cfg,'b_std',false); build(); closeWizard(false); return [hist.length===h, JSON.stringify(cfg)===c, rd===1&&redo.length===1]; }")
    check("cancelling the wizard restores cfg and undo/redo history", r[0] and r[1] and r[2], r)
    # --- number input: Arabic digits, "٫"/",", units, clamping ---
    r = ev("()=>[parseNum('٢٫٥م','سم'), parseNum('250سم','سم'), parseNum('2,5','سم'), parseNum('١٢٠','سم'), parseNum('80 cm','سم'), parseNum('150','م'), parseNum('150سم','م'), isNaN(parseNum('abc','سم')), isNaN(parseNum('5كجم','سم')), parseNum('١٬٥٠٠','جنيه',true), parseNum('1,500','جنيه',true), parseNum('12%','%')]")
    check("parseNum reads Arabic digits, decimal marks and units", r == [250, 250, 2.5, 120, 80, 150, 1.5, True, True, 1500, 1500, 12], r)
    ev("()=>{ cfg=newCfg('L'); cfg.stoveW=60; build(); clearHist(); setPanel(true); tab='مقاسات الأجهزة'; renderTabs(); renderControls(); }"); pg.wait_for_timeout(400)
    num = "input.num[aria-label='العرض']"
    r = ev(f"()=>{{ const n=document.querySelector(\"{num}\"); return [n.type, n.inputMode]; }}")
    check("stepper number box is a text field with a decimal keyboard", r == ["text", "decimal"], r)
    vals = []
    for typed in ["٨٠", "0.9م", "٧٥٫٥", "5م", "xyz"]:
        pg.fill(num, typed); pg.press(num, "Enter"); pg.wait_for_timeout(150)
        vals.append(ev(f"()=>[cfg.stoveW, document.querySelector(\"{num}\").value]"))
    check("typing ٨٠ / 0.9م / ٧٥٫٥ sets 80 / 90 / 75.5 cm", [v[0] for v in vals[:3]] == [80, 90, 75.5], vals)
    check("typed value is clamped to the max (5م -> 100)", vals[3][0] == 100, vals)
    check("unreadable text puts the last value back", vals[4] == [100, "100"], vals)
    minus = ".ctl.rng:has(input.num[aria-label='العرض']) .stb[aria-label^='قلّل']"
    h0 = ev("()=>hist.length"); pg.click(minus); pg.wait_for_timeout(150)
    r = ev(f"()=>[cfg.stoveW, hist.length, document.querySelector(\"{num}\").value]")
    check("− button still steps down and adds one undo step", r[0] == 95 and r[1] == h0 + 1 and r[2] == "95", [h0, r])
    box = pg.locator(minus).first.bounding_box(); pg.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    pg.mouse.down(); pg.wait_for_timeout(1500); pg.mouse.up(); pg.wait_for_timeout(600)
    r = ev("()=>[cfg.stoveW, hist.length]")
    check("long-pressing − keeps repeating (one undo step for the whole press)", r[0] <= 85 and r[1] == h0 + 2, r)
    ev("()=>{ cfg.stoveW=100; renderControls(); }"); h1 = ev("()=>hist.length")
    pg.click(".ctl.rng:has(input.num[aria-label='العرض']) .stb[aria-label^='زوّد']"); pg.wait_for_timeout(150)
    r = ev("()=>[cfg.stoveW, hist.length]")
    check("+ at the max changes nothing and adds no undo step", r == [100, h1], [h1, r])
    # --- redo ---
    r = ev("()=>{ cfg=newCfg('L'); build(); clearHist(); renderControls(); const U=document.getElementById('undo'), R=document.getElementById('redo'); const d0=[U.disabled,R.disabled];"
           " pushHist(); cfg.roomW=333; build(); pushHist(); cfg.roomW=344; build(); U.click(); U.click(); const a=[cfg.roomW!==333&&cfg.roomW!==344, redo.length, R.disabled];"
           " R.click(); const b=[cfg.roomW, redo.length]; R.click(); const c=[cfg.roomW, redo.length, R.disabled]; U.click(); pushHist(); return [d0, a, b, c, redo.length, R.disabled]; }")
    check("undo moves states to redo and redo walks forward again", r[0] == [True, True] and r[1] == [True, 2, False] and r[2] == [333, 1] and r[3] == [344, 0, True], r)
    check("a new change (pushHist) clears the redo list", r[4] == 0 and r[5], r)
    ev("()=>{ clearHist(); pushHist(); cfg.walls='solid'; build(); document.activeElement&&document.activeElement.blur(); }")
    pg.keyboard.press("Control+z"); w1 = ev("()=>cfg.walls")
    pg.keyboard.press("Control+y"); w2 = ev("()=>cfg.walls")
    pg.keyboard.press("Control+z"); pg.keyboard.press("Control+Shift+z"); w3 = ev("()=>cfg.walls")
    check("Ctrl+Y and Ctrl+Shift+Z redo", w1 != "solid" and w2 == "solid" and w3 == "solid", [w1, w2, w3])
    r = ev("()=>{ const r=document.getElementById('redo'), u=document.getElementById('undo'); return [!!r, r&&r.parentElement===u.parentElement, r&&r.textContent.trim()]; }")
    check("redo button sits next to undo in the panel header", r[0] and r[1] and r[2] == "إعادة", r)
    # --- default prices for every project ---
    ev("()=>{ cfg=newCfg('b_std'); cfg.pTile=150; cfg.pLabor=90; cfg.pWP=40; build(); clearHist(); tab='التشطيب'; renderTabs(); renderControls(); }"); pg.wait_for_timeout(200)
    pg.click("#priceSave"); pg.wait_for_timeout(300)
    r = ev("()=>[JSON.parse(window.storage._d['kprices']||'{}'), newCfg('L').pTile, newCfg('r_living').pLabor, document.getElementById('priceSave').disabled]")
    check("'خلي الأسعار دي افتراضية' saves the tab's prices to their own key", r[0] == {"pTile": 150, "pLabor": 90, "pWP": 40}, r)
    check("new projects start with the default prices", r[1] == 150 and r[2] == 90 and r[3], r)
    ev("()=>{ cfg=newCfg('L'); cfg.pLower=2000; cfg.pMarble=1200; build(); tab='التكلفة'; renderTabs(); renderControls(); }"); pg.wait_for_timeout(200)
    pg.fill(".money input[aria-label='سعر متر الدواليب العلوية']", "١٬٨٠٠"); pg.press(".money input[aria-label='سعر متر الدواليب العلوية']", "Enter"); pg.wait_for_timeout(150)
    r = ev("()=>[cfg.pUpper, document.querySelector(\".money input[aria-label='سعر متر الدواليب العلوية']\").type]")
    check("price box accepts Arabic digits (١٬٨٠٠ -> 1800)", r == [1800, "text"], r)
    pg.click("#priceSave"); pg.wait_for_timeout(300)
    r = ev("()=>JSON.parse(window.storage._d['kprices'])")
    check("saving kitchen prices keeps the saved bath prices", r.get("pLower") == 2000 and r.get("pUpper") == 1800 and r.get("pTile") == 150, r)
    ev("()=>{ cfg=migrate({...newCfg('b_std'),pTile:0,pLabor:0,pWP:0}); build(); clearHist(); tab='التشطيب'; renderTabs(); renderControls(); }"); pg.wait_for_timeout(200)
    pg.click("#priceApply"); pg.wait_for_timeout(200)
    r = ev("()=>[cfg.pTile, cfg.pLabor, cfg.pWP, hist.length, !!document.getElementById('priceApply')]")
    check("an older project can pull in the default prices (undoable)", r == [150, 90, 40, 1, False], r)
    r = ev("async()=>{ const b=await backupData(); return b.prices; }")
    check("backup includes the default prices", r.get("pTile") == 150 and r.get("pLower") == 2000, r)
    r = ev("async()=>{ await restoreData({projects:[{id:'pprice',name:'أسعار',cfg:newCfg('L')}],prices:{pTile:77,pLower:'x',pWP:-5,evil:9},current:'pprice'}); const a=JSON.parse(window.storage._d['kprices']);"
           " let threw=false; try{ await restoreData({projects:[{id:'pprice',name:'أسعار',cfg:newCfg('L')}],prices:'junk',current:'pprice'}); }catch(e){ threw=true; } return [a, PRICE_DEF.pTile, threw, JSON.parse(window.storage._d['kprices']).pTile]; }")
    check("restore checks prices: keeps valid ones, drops bad keys/values", r[0].get("pTile") == 77 and r[0].get("pLower") == 2000 and r[0].get("pWP") == 40 and "evil" not in r[0] and r[1] == 77, r)
    check("restore ignores a malformed prices field", not r[2] and r[3] == 77, r)
    r = ev("async()=>{ const before=window.storage._d['kprices']; let threw=false; try{ await restoreData({projects:[null],prices:{pTile:1}}); }catch(e){ threw=true; } return [threw, window.storage._d['kprices']===before]; }")
    check("an invalid backup doesn't write its prices", r[0] and r[1], r)
    ev("async()=>{ PRICE_DEF={}; await stDel('kprices'); await stDel('kproj:pprice'); projIndex=projIndex.filter(p=>p.id!=='pprice'); await stSet('kproj:index',projIndex); clearHist(); setPanel(false); }")
    ev("async()=>{ cfg=newCfg('L'); PROJ={id:'pdel1',name:'حذف'}; await saveNow(); cfg=newCfg('b_std'); PROJ={id:'pkeep1',name:'يفضل'}; await saveNow(); await openProject('pdel1'); openSheet(); }")
    pg.click(".card.sel .act button:has-text('🗑')"); pg.click(".card.sel .act button:has-text('امسح')"); pg.wait_for_timeout(3500)
    r = ev("()=>[PROJ.id, projIndex.some(p=>p.id==='pdel1'), 'kproj:pdel1' in window.storage._d, JSON.parse(window.storage._d['kproj:index']).some(p=>p.id==='pdel1')]")
    check("deleting the open project doesn't bring it back", r[0] != "pdel1" and not any(r[1:]), r)
    ev("()=>closeSheet()")
    r = ev("async()=>{ const before=JSON.stringify(window.storage._d); let threw=false; try{ await restoreData({projects:[{},null,{id:'../x',cfg:{}}]}); }catch(e){ threw=true; } return [threw, JSON.stringify(window.storage._d)===before]; }")
    check("invalid backup is rejected without writing anything", r[0] and r[1], r)
    r = ev("async()=>{ await restoreData({projects:[{id:'pxss',name:'<img src=x onerror=window.__xss=1>',cfg:newCfg('L')}],apt:{rooms:null,doors:'x'},current:'pxss'}); return [Array.isArray(APT.rooms), Array.isArray(APT.doors), PROJ.name]; }")
    check("restore sanitizes names and apartment data", r[0] and r[1] and "<" not in r[2], r)
    ev("()=>openSheet()"); pg.wait_for_timeout(300)
    r = ev("()=>[window.__xss, document.querySelectorAll('#sheetBody img').length]")
    check("project names can't inject HTML", r[0] is None and r[1] == 0, r)
    ev("()=>closeSheet()")
    r = ev("()=>{ STATS={}; cfg=newCfg('L'); build(); return [QTY.tiledA, Math.min(QTY.wallA,STATS.counter/100*0.7)]; }")
    check("kitchen tiled area uses this build's counter length", r[0] > 0 and abs(r[0] - r[1]) < 1e-9, r)
    r = ev("()=>{ const c=newCfg('h_hall'); c.pPaint=100; c.pFloor=200; cfg=c; build(); const s=snapCurrent(c,'x'); return [s.cost, s.costs.paint, s.costs.tile]; }")
    check("hall floor + paint prices count in the apartment total", r[0] > 0 and r[1] > 0 and r[2] > 0, r)
    r = ev("()=>{ cfg=newCfg('b_std'); build(); const a=BATH.wallA; cfg.feats.push({id:'c',type:'cut',corner:'DR',a:100,b:100,shape:'diag'}); build(); return [a, BATH.wallA]; }")
    check("bath wall tiles shrink with an angled cut", r[1] < r[0] - 0.5, r)
    r = ev("()=>{ cfg=newCfg('r_living'); cfg.roomW=500; cfg.roomL=500; cfg.feats.push({id:'c',type:'cut',corner:'WL',a:300,b:300,shape:'diag'}); build(); return [inCut(1.55,1.55,0.15), inCut(1.7,1.7,0.15)]; }")
    check("cut-corner margin is in meters (not a ratio)", r[0] and not r[1], r)
    r = ev("()=>{ cfg=newCfg('L'); const L=cfg.roomL; cfg.custom=[{id:'cx',type:'tall',wall:'L',pos:L-50,w:120,d:40,h:200}]; build(); const u=UNITS.find(u=>u.id==='cx'); return u?[+u.a1.toFixed(3), L/100]:null; }")
    check("custom unit stays inside its wall", r is not None and r[0] <= r[1] + 1e-6, r)
    r = ev("()=>{ cfg=newCfg('b_laundry'); build(); const b=cfg.bfix.find(b=>b.type==='washer'); if(!b) return null; b.w=50; build(); const u=UNITS.find(u=>u.kind==='washer'); return [cfg.washerW, u&&+(u.a1-u.a0).toFixed(2)]; }")
    check("bath washer uses its own size (kitchen washer setting untouched)", r is not None and r[0] == 60, r)
    r = ev("()=>{ cfg=newCfg('r_master'); const w=cfg.furn.find(f=>f.type==='wardrobe'); delete w.secs; tab='الأثاث'; renderControls(); return [w.secs===undefined, !!document.querySelector('#controls')]; }")
    check("opening the furniture tab doesn't change the design", r[0], r)
    r = ev("()=>{ cfg=newCfg('r_kids'); build(); const u=UNITS.find(u=>u.wall==='FR'&&u.ft!=='rug'&&u.y0<1); if(!u) return null; const R=unitRect(u); return fpFree((R.x0+R.x1)/2,(R.z0+R.z1)/2); }")
    check("walk mode can't pass through furniture", r is False, r)
    r = ev("()=>{ setView('out'); sph.theta+=1; camTouched=true; const t=sph.theta; setPanel(true); setPanel(false); return Math.abs(sph.theta-t)<1e-9; }")
    check("opening/closing the panel keeps the user's camera", r, r)
    r = ev("()=>{ const c=migrate({roomW:'abc',roomL:-50,ceil:null,feats:[{id:'w',type:'window',wall:'W',pos:'x',w:-80,y:100,h:120},null,5],custom:'bad'}); cfg=c; build(); return [c.roomW, c.roomL, c.ceil, c.feats.length, c.feats[0].pos, c.feats[0].w, Array.isArray(c.custom), UNITS.length>0]; }")
    check("bad numbers in a saved design are repaired", r[0] == 180 and r[1] == 150 and r[2] == 280 and r[3] == 1 and r[4] == 0 and r[5] == 80 and r[6] and r[7], r)
    r = ev("async()=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); cfg=newCfg('L'); build(); setView('out'); let n=0; const o=renderer.render.bind(renderer); renderer.render=(...a)=>{ n++; return o(...a); }; let idle=-1; for(let i=0;i<25&&idle<0;i++){ n=0; await sl(400); if(!n) idle=0; } n=0; build(); await sl(300); renderer.render=o; return [idle, n]; }")
    check("renders only when something changes (goes idle, wakes on build)", r[0] == 0 and r[1] > 0, r)
    r = ev("()=>{ cfg=newCfg('r_living'); cfg.roomW=600; cfg.roomL=700; build(); const c=sun.shadow.camera; return [c.right, Math.hypot(RW,RL)/2, Math.abs(sun.target.position.x-RW/2)<1e-6]; }")
    check("sun shadow box covers big rooms", r[0] >= r[1] and r[2], r)
    r = ev("()=>{ const order=['المقاسات','التصميم','التنفيذ','المشاريع'], bad=[]; for(const t of ['L','b_std','h_hall','r_master']){ cfg=newCfg(t); build(); const g=tabGroups(), names=g.map(x=>x.n), all=g.flatMap(x=>x.tabs);"
           " if(names.join()!==order.filter(n=>names.includes(n)).join()||all.length!==tabsFor().length||!tabsFor().every(x=>all.includes(x))||g.some(x=>!x.tabs.length)) bad.push(t); } return bad; }")
    check("tab groups follow the work order and hold exactly this room's tabs", r == [], r)
    r = ev("()=>{ for(const k in tabLast) delete tabLast[k]; cfg=newCfg('L'); build(); setPanel(true); tab='الوحدات'; renderTabs(); const c=JSON.stringify(cfg), vis=()=>[...document.querySelectorAll('#tabs .tsec button')].filter(b=>b.offsetParent).map(b=>b.dataset.t);"
           " const a=vis(), gOn=document.querySelector('#tabs .tgrp .on').dataset.g; document.querySelector('#tabs .tgrp [data-g=\"do\"]').click(); const t1=tab, b=vis(); document.querySelector('#tabs .tgrp [data-g=\"design\"]').click();"
           " const r=[gOn, a.includes('الوحدات')&&!a.includes('التكلفة'), t1, b.includes('التكلفة')&&!b.includes('الوحدات'), tab, JSON.stringify(cfg)===c, 'tabLast' in cfg]; setPanel(false); return r; }")
    check("phone: group row shows only the open group's tabs, remembers the last tab, doesn't touch cfg", r == ["design", True, "المية والكهربا", True, "الوحدات", True, False], r)
    r = ev("()=>{ cfg=newCfg('L'); build(); return [warnTab('البوتاجاز طالع عن الرخامة 8 سم'), warnTab('الحوض محتاج تمديد صرف حوالي 90 سم'), warnTab('مفيش ولا حيطة عليها رخامة، اختار نوع الحيطان من تاب التخزين'),"
           " warnTab('المسافة بين الرخامة والدولاب العلوي أقل من 50 سم'), warnTab('مثلث العمل: كلام'), (cfg=newCfg('b_std'),warnTab('حدد مكان الصرف الموجود أو عمود الصرف من تاب المية والكهربا عشان أحسب الميول')), warnTab('الشاور 70×70 صغير'), (cfg=newCfg('r_master'),warnTab('الدولاب قدام الشباك')), warnTab('باب التلاجة هيفتح 90° بس')]; }")
    check("warnings link to the tab that fixes them", r == ["مقاسات الأجهزة", "المية والكهربا", "التخزين", "الارتفاعات", "الأجهزة", "المية والكهربا", "الحمام", "الأثاث", "الأثاث"], r)
    r = ev("()=>{ cfg=newCfg('L'); build(); const g=k=>document.querySelector(`#tabs .tgrp [data-g=\"${k}\"]`).classList.contains('warn'); cfg.stoveD=70; build();"
           " const w=STATS.warn.some(x=>/طالع عن الرخامة/.test(x)), t=document.querySelector('#tabs [data-t=\"مقاسات الأجهزة\"]'); const r=[w, g('design'), t.classList.contains('warn'), /ملاحظ/.test(t.textContent)]; cfg.stoveD=60; build(); return r; }")
    check("a group with warnings gets a dot (updated after each build)", r == [True, True, True, True], r)
    # --- warnings behind one "⚠ N ملاحظات" button over the 3D ---
    ev("()=>{ setPanel(false); document.getElementById('draw').style.display='none'; cfg=newCfg('mine'); build(); setView('out'); }"); pg.wait_for_timeout(300)
    r = ev("()=>{ const s=document.getElementById('stats'), b=document.getElementById('warnBtn'), m=document.getElementById('warnMenu'), n=new Set(STATS.warn).size;"
           " return [n, s.querySelectorAll('span.warn').length, !!b&&b.textContent.includes('⚠'), getComputedStyle(b).pointerEvents, getComputedStyle(s).pointerEvents, m.hidden, m.querySelectorAll('button').length]; }")
    check("warnings collapse into one ⚠ button (no warning chips), clickable while #stats isn't", r[0] >= 2 and r[1] == 0 and r[2] and r[3] == "auto" and r[4] == "none" and r[5] and r[6] == r[0], r)
    pg.click("#warnBtn"); pg.wait_for_timeout(150)
    r = ev("()=>{ const m=document.getElementById('warnMenu'); const a=[!m.hidden, document.getElementById('warnBtn').getAttribute('aria-expanded')]; build(); return [...a, !document.getElementById('warnMenu').hidden]; }")
    check("⚠ button opens the list, and it stays open across a rebuild", r == [True, "true", True], r)
    pg.mouse.click(20, 740); pg.wait_for_timeout(150)
    r1 = ev("()=>document.getElementById('warnMenu').hidden")
    pg.click("#warnBtn"); pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("the list closes on an outside tap and on Escape", r1 and ev("()=>document.getElementById('warnMenu').hidden"), r1)
    r = ev("()=>{ STATS.warn.push('ملاحظة تجربة ملهاش تاب <b>'); showStats(); const ws=[...new Set(STATS.warn)], i=ws.findIndex(w=>warnDest(w)), j=ws.findIndex(w=>!warnDest(w));"
           " return [i, j, i>=0?warnDest(ws[i]):null, document.querySelectorAll('#warnMenu b').length]; }")
    check("the no-tab warning is in the list, text escaped", r[1] >= 0 and r[3] == 0, r)
    if ev("()=>typeof warnTab==='function'"):  # tab links use the tab-dot rules (warnTab/WARNTAB in 15-ui.js)
        check("the list also has a warning linked to a tab", r[0] >= 0, r)
        pg.click("#warnBtn"); pg.click(f"#warnMenu button[data-i='{r[0]}']"); pg.wait_for_timeout(200)
        r2 = ev("()=>[tab, panelOpen, document.getElementById('warnMenu').hidden]")
        check("tapping a warning opens the tab that fixes it", r2 == [r[2], True, True], [r, r2])
        ev("()=>setPanel(false)"); pg.wait_for_timeout(150)
        r3 = ev("()=>{ cfg=newCfg('b_std'); build(); const x=warnDest('حدد مكان الصرف الموجود أو عمود الصرف من تاب المية والكهربا عشان أحسب الميول'); cfg=newCfg('L'); build(); return [x, warnDest('كلام ملوش تاب')]; }")
        check("warnDest: explicit 'من تاب X' wins, unknown text -> drawings (null)", r3 == ["المية والكهربا", None], r3)
        ev("()=>{ cfg=newCfg('mine'); build(); STATS.warn.push('ملاحظة تجربة ملهاش تاب <b>'); showStats(); }")
    else:
        check("without warnTab() every warning falls back to the drawings", r[0] == -1, r)
    pg.click("#warnBtn"); pg.click(f"#warnMenu button[data-i='{r[1]}']"); pg.wait_for_timeout(200)
    check("a warning with no matching tab opens 📐 the drawings", ev("()=>getComputedStyle(document.getElementById('draw')).display") == "flex", r)
    ev("()=>{ document.getElementById('dclose').click(); build(); }")
    # --- 3D labels: overlapping ones are thinned out, every few frames only, not in apartment 3D ---
    LBLS = ("()=>{ camera.updateMatrixWorld(); const ch=canvas.clientHeight, cw=canvas.clientWidth, ppu=ch/(2*Math.tan(camera.fov*Math.PI/360));"
            " return root.children.filter(o=>o.userData.label).map(o=>{ const v=o.position.clone(), z=-v.clone().applyMatrix4(camera.matrixWorldInverse).z; v.project(camera); const s=ppu/z;"
            " return {vis:o.visible, p:o.userData.prio, x:(v.x+1)/2*cw, y:(1-v.y)/2*ch, w:o.scale.x*s/2, h:o.scale.y*s/2}; }); }")
    ev("()=>{ cfg=newCfg('mine'); build(); setView('out'); }"); pg.wait_for_timeout(500)
    L = ev(LBLS); vis = [a for a in L if a["vis"]]; hid = [a for a in L if not a["vis"]]
    ov = lambda a, b: abs(a["x"] - b["x"]) < a["w"] + b["w"] and abs(a["y"] - b["y"]) < a["h"] + b["h"]
    check("no two visible 3D labels overlap on screen", not any(ov(a, b) for i, a in enumerate(vis) for b in vis[i + 1:]), [len(L), len(vis)])
    check("a hidden label always loses to an overlapping label of equal/higher priority", len(hid) > 0 and all(any(ov(h, v) and v["p"] >= h["p"] for v in vis) for h in hid), [len(hid), [h["p"] for h in hid]])
    r = ev("async()=>{ const f=()=>new Promise(r=>requestAnimationFrame(r)); await f(); const n0=lblRuns; for(let i=0;i<18;i++){ sph.theta+=0.01; await f(); } return lblRuns-n0; }")
    check("label overlap check runs every few frames while orbiting, not every frame", 1 <= r <= 5, r)
    r = ev("async()=>{ lblN=0; const n=lblRuns; sph.theta+=0.05; updateCam(); const a=lblRuns-n; await new Promise(r=>setTimeout(r,400)); return [a, lblRuns-n, lblKey===lblKeyNow()]; }")
    check("…and once more shortly after the camera stops, so the final view is checked", r == [0, 1, True], r)
    r = ev("()=>{ const n=lblRuns; APT3D=true; sph.theta+=0.3; try{ updateCam(); updateCam(); return [lblRuns-n, root.children.filter(o=>o.userData.label).every(o=>!o.visible)]; } finally{ APT3D=false; updateCam(); } }")
    check("apartment 3D skips the label overlap check", r == [0, True], r)
    # live plan: drag a window along its wall, tap a wall to edit its length
    ev("()=>{ cfg=newCfg('L'); build(); setPanel(true); tab='الأوضة'; renderTabs(); renderControls(); PLAN_WALL=null; }"); pg.wait_for_timeout(900)  # let the sheet finish sliding up
    ev("()=>{ const bx=document.getElementById('roomPlan'), sc=bx.closest('#controls'); sc.scrollTop+=bx.getBoundingClientRect().top-sc.getBoundingClientRect().top-8; }"); pg.wait_for_timeout(300)
    PLANXY = """(a)=>{ const svg=document.querySelector(a[0]+' svg'), S=+svg.dataset.s, m=+svg.dataset.m, p=svg.createSVGPoint(); let x,z;
      if(a[1]){ const f=FEATS.find(f=>f.id===a[1]); [x,z]=aoToXZ(f.wall,(f.a0+f.a1)/2,0); } else { x=RW*0.12; z=-10/S; } p.x=m+x*S; p.y=m+z*S; const q=p.matrixTransform(svg.getScreenCTM()); return [q.x,q.y,svg.getScreenCTM().a*S]; }"""
    r = ev("()=>[getComputedStyle(document.querySelector('#roomPlan svg')).touchAction, planSVG().includes('pedit'), planSVG(true).includes('pedit')]")
    check("room-tab plan is editable (touch-action:none) but the plain plan stays a picture", r == ["none", False, True], r)
    fid = ev("()=>cfg.feats.find(f=>f.type==='window').id")
    x, y, sc = ev(PLANXY, ["#roomPlan", fid]); p0 = ev("(id)=>[cfg.feats.find(f=>f.id===id).pos, hist.length]", fid)
    pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 20, y, steps=3); pg.mouse.move(x + 40, y, steps=3)
    mid = ev("(id)=>[cfg.feats.find(f=>f.id===id).pos, hist.length, document.querySelector('#roomPlan .plantip').textContent, document.querySelectorAll('#roomPlan .pdim').length]", fid)
    pg.mouse.up(); pg.wait_for_timeout(150)
    r = ev("(id)=>[cfg.feats.find(f=>f.id===id).pos, hist.length, SLIDING, PLAN_DRAG, document.querySelector('#roomPlan .plantip').classList.contains('on')]", fid)
    check("dragging a window on the plan moves it by the dragged distance (px -> cm)", abs(mid[0] - p0[0] - round(40 / sc * 100)) <= 2 and r[0] == mid[0], [p0, mid[:2], r[0], round(40 / sc * 100)])
    check("a plan drag pushes undo once and shows the distance tip only while dragging", mid[1] == p0[1] + 1 and r[1] == p0[1] + 1 and f"{mid[0]} سم" in mid[2] and mid[3] == 1 and r[2] is False and r[3] is None and not r[4], [mid, r])
    x, y, sc = ev(PLANXY, ["#roomPlan", fid]); pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 900, y, steps=4); pg.mouse.up()
    r = ev("(id)=>{ const f=cfg.feats.find(f=>f.id===id); return [f.pos, cfg.roomW-f.w]; }", fid)
    check("plan drag is clamped to 0 … measLen-w", r[0] == r[1], r)
    x, y, sc = ev(PLANXY, ["#roomPlan", None]); pg.mouse.click(x, y); pg.wait_for_timeout(150)
    r = ev("()=>{ const pp=document.querySelector('#roomPlan .planpop'); return [PLAN_WALL, pp.hidden, pp.querySelector('.rng label').textContent, pp.querySelector('.note').textContent, document.querySelectorAll('#roomPlan .pwall').length]; }")
    check("tapping a wall on the plan opens its length box (brick size + net size)", r[0] == "W" and not r[1] and "على الطوب" in r[2] and "الصافي" in r[3] and "254" in r[3] and r[4] == 1, r)
    r = ev("()=>{ const n=document.querySelector('#roomPlan .planpop input.num'); n.value=300; n.dispatchEvent(new Event('change')); const pp=document.querySelector('#roomPlan .planpop'); return [cfg.roomW, Math.round(RW*100), !!pp&&!pp.hidden, pp&&pp.querySelector('.note').textContent]; }")
    check("the wall length box sets roomW and stays open after the panel refresh", r[0] == 300 and r[1] == 294 and r[2] and "294" in r[3], r)
    r = ev("()=>{ cfg.dimsOn='net'; build(); renderControls(); const pp=document.querySelector('#roomPlan .planpop'); return [pp.querySelector('.rng label').textContent, pp.querySelector('.note').textContent]; }")
    check("in net mode the wall length box says net and shows the brick size", "الصافي" in r[0] and "على الطوب" in r[1] and "306" in r[1], r)
    ev("()=>{ PLAN_WALL=null; cfg=newCfg('L'); build(); openWizard(false); WIZ.step=2; renderWiz(); }")
    did = ev("()=>cfg.feats.find(f=>f.type==='door').id")
    x, y, sc = ev(PLANXY, ["#wizPlan", did]); pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x - 900, y, steps=4); pg.mouse.up(); pg.wait_for_timeout(150)
    r = ev("(id)=>[cfg.feats.find(f=>f.id===id).pos, !!document.querySelector('#wizPlan svg.pedit')]", did)
    check("the wizard plan is draggable too", r == [0, True], r)
    ev("()=>closeWizard(false)"); ev("()=>openDraw()"); pg.wait_for_timeout(1500)
    r = ev("()=>[document.querySelectorAll('#draw .planbox svg').length, document.querySelectorAll('#draw svg.pedit, #draw .planbox.edit').length]")
    check("the drawings document (and print) keeps a plain, non-editable plan", r[0] >= 1 and r[1] == 0, r)
    ev("()=>document.getElementById('dclose').click()")
    pg.set_viewport_size({"width": 1440, "height": 900}); pg.wait_for_timeout(300)
    r = ev("()=>{ cfg=newCfg('r_master'); build(); tab='الأثاث'; renderTabs(); return [getComputedStyle(document.querySelector('#tabs .tgrp')).display, [...document.querySelectorAll('#tabs .tsh')].filter(h=>h.offsetParent).map(h=>h.textContent), [...document.querySelectorAll('#tabs .tsec button')].filter(b=>b.offsetParent).length===tabsFor().length]; }")
    check("desktop: one icon rail split by a heading per group", r[0] == "none" and r[1] == ["المقاسات", "التصميم", "التنفيذ", "المشاريع"] and r[2], r)
    pg.set_viewport_size({"width": 390, "height": 760}); pg.wait_for_timeout(300)
    # slider performance: moves in one frame share one light build; the full build (panel, shadows) waits for the release; numbers stay the same
    r = ev("""async()=>{ cfg=newCfg('U'); build(); tab=['التخزين','الوحدات','التكلفة'].find(t=>tabsFor().includes(t)); renderTabs(); renderControls(); await new Promise(r=>setTimeout(r,300));
      const raf=()=>new Promise(r=>requestAnimationFrame(r)), d=document.createElement('div'); document.body.appendChild(d);
      rangeField(d,'تجربة',()=>cfg.roomW,v=>{ cfg.roomW=v; },200,500,1,'سم',()=>{}); const sl=d.querySelector('input[type=range]');
      let n=0, rc=0; const ob=build, orc=renderControls; build=function(){ n++; return ob.apply(this,arguments); }; renderControls=function(){ rc++; return orc.apply(this,arguments); };
      try{ sl.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); for(let i=1;i<=10;i++){ sl.value=300+i; sl.dispatchEvent(new Event('input',{bubbles:true})); }
        const sync=[n,cfg.roomW]; await raf(); await raf(); const mid=[n,rc,renderer.shadowMap.autoUpdate];
        sl.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); sl.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,400));
        const end=[n,rc>0,renderer.shadowMap.autoUpdate]; const live=JSON.stringify([STATS,QTY]); ob(); const direct=JSON.stringify([STATS,QTY]);
        return [sync,mid,end,live===direct]; }
      finally{ build=ob; renderControls=orc; d.remove(); } }""")
    check("slider: 10 moves in one frame = 1 rebuild, run on the next frame", r[0] == [0, 310] and r[1][0] == 1, r)
    check("slider: panel refresh and shadows wait until the finger lifts", r[1][1] == 0 and r[1][2] is False and r[2] == [2, True, True], r)
    check("slider: sizes, quantities and cost match a normal build", r[3], r)
    r = ev("""async()=>{ const raf=()=>new Promise(r=>requestAnimationFrame(r)); cfg=newCfg('b_master'); build(); await raf(); await raf(); await raf();
      const p0=new Set(renderer.info.programs); for(let i=0;i<3;i++){ cfg.roomW+=5; build(); await raf(); await raf(); }
      return [renderer.info.programs.length, renderer.info.programs.filter(p=>!p0.has(p)).length, TRASH.length]; }""")
    check("rebuilds reuse the compiled shaders and free the old scene after drawing", r[0] > 0 and r[1] == 0 and r[2] == 0, r)
    check("no JS errors during the whole run", not errs, errs[:3])
    b.close()
    b, pg, errs = page(p, FAILING); ev = pg.evaluate
    ev("async()=>{ await openApt(); }"); pg.wait_for_timeout(1500)
    pg.select_option("#aptBody .addrow select", "__hall"); pg.click("#aptBody .addrow button"); pg.wait_for_timeout(1800)
    check("works when persistent storage is broken (memory fallback)", ev("()=>APT.rooms.length") == 2 and not errs, errs[:2])
    b.close()
    # tablet: the panel docks on the right and the 3D stage shrinks to make room for it
    b, pg, errs = page(p, size=(820, 1100)); ev = pg.evaluate
    r = ev("()=>{ const a=stage.clientWidth; setPanel(true); const pw=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-w')); return [panelOpen, a, stage.clientWidth, pw, innerWidth, canvas.clientWidth]; }")
    check("tablet: opening the panel shrinks #stage by --panel-w", r[1] == r[4] and r[3] > 0 and r[2] == r[4] - r[3] and r[5] == r[2], r)
    check("tablet: no JS errors", not errs, errs[:3])
    b.close()
    # desktop: panel docked from the start, tabs as an icon rail, and the panel controls themselves
    b, pg, errs = page(p, size=(1440, 900)); ev = pg.evaluate
    r = ev("()=>{ const pw=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-w')); return [panelOpen, stage.clientWidth, stage.clientHeight, canvas.clientWidth, canvas.clientHeight, innerWidth-pw]; }")
    check("desktop: panel is open on load", r[0] is True, r)
    check("desktop: canvas is exactly the size of #stage (beside the panel)", r[1] == r[3] and r[2] == r[4] and r[1] == r[5], r)
    r = ev("()=>{ const vis=[...document.querySelectorAll('#tabs button')].filter(b=>b.getClientRects().length), bs=vis.map(b=>b.getBoundingClientRect()); return [getComputedStyle(document.getElementById('tabs')).flexDirection, bs.length, bs.every(q=>Math.abs(q.left-bs[0].left)<1), bs.every((q,i)=>!i||q.top>=bs[i-1].bottom-1), vis.filter(b=>b.querySelector('.ico')).length]; }")
    check("desktop: tabs are a column of icons", r[0] == "column" and r[1] >= 5 and r[2] and r[3] and r[4] == r[1], r)
    ev("()=>{ window.goTab=k=>{ tab=Object.keys(SCHEMA).find(t=>SCHEMA[t].some(c=>c.k===k)); renderTabs(); renderControls(); }; }")
    r = ev("()=>{ const k=e=>e.tagName==='SELECT'?'select':e.className; return [k(choice([['1','أيوه'],['','لأ']],'',()=>{})), k(choice([['a','1'],['b','2'],['c','3'],['d','4']],'a',()=>{})), k(choice([['a','1'],['b','2'],['c','3'],['d','4'],['e','5']],'a',()=>{})), k(choice([['a','من غير (شفاط في الشباك)'],['b','ب']],'a',()=>{}))]; }")
    check("choice(): yes/no -> switch, <=4 short -> segmented, else select", r == ["sw", "seg", "select", "select"], r)
    ev("()=>{ cfg=newCfg('L'); cfg.walls='auto'; cfg.splash='tiles'; build(); goTab('walls'); }")
    pg.click("#controls .seg[aria-label='الحيطان'] button:has-text('ظاهرة دايمًا')")
    r = ev("()=>[cfg.walls, document.querySelector(\"#controls .seg[aria-label='الحيطان'] button.on\").textContent]")
    check("choice(): segmented button sets cfg", r == ["solid", "ظاهرة دايمًا"], r)
    ev("()=>goTab('splash')"); pg.select_option("#controls select[aria-label='الحيطة ورا الرخامة']", "glass")
    check("choice(): select sets cfg", ev("()=>cfg.splash") == "glass", ev("()=>cfg.splash"))
    ev("()=>{ cfg.gbType='tray'; cfg.gbLed=''; build(); tab='السقف'; renderTabs(); renderControls(); }")
    SW = "#controls .sw:has(input[aria-label='ليد مخفي في بيت النور'])"
    pg.click(SW); a = ev("()=>cfg.gbLed"); pg.click(SW); r = [a, ev("()=>cfg.gbLed")]
    check("choice(): switch sets cfg on and off", r == ["1", ""], r)
    PLUS = "#controls .ctl.rng:has(input[aria-label='العرض']) .stb[aria-label^='زوّد']"
    ev("()=>{ cfg=newCfg('L'); cfg.stoveW=90; build(); tab='مقاسات الأجهزة'; renderTabs(); renderControls(); }")
    pg.click(PLUS); r = ev("()=>[cfg.stoveW, +document.querySelector(\"#controls .ctl.rng:has(input[aria-label='العرض']) input.num\").value]")
    pg.click("#undo"); r.append(ev("()=>cfg.stoveW"))
    for _ in range(4): pg.click(PLUS)
    r.append(ev("()=>cfg.stoveW"))
    check("numIn: + adds one step, undo restores it, never passes max", r == [95, 95, 90, 100], r)
    ev("()=>{ cfg=newCfg('L'); cfg.feats=[]; build(); tab='الأوضة'; renderTabs(); renderControls(); }")
    pg.click("#controls .adder .seg button:has-text('اليمين')"); pg.click("#controls .adder .chipbtn:has-text('شباك')")
    r = ev("()=>{ const f=cfg.feats.find(f=>f.type==='window'); const c=f&&document.querySelector(`#controls .card[data-key='${f.id}']`); return f?[f.wall, OPENC.has(f.id), !!c&&!c.classList.contains('closed'), f.id]:null; }")
    check("chipAdder: window goes on the picked wall and its card opens", r is not None and r[0] == "RT" and r[1] and r[2], r)
    if r:
        CARD = f"#controls .card[data-key='{r[3]}']"; closed = f"()=>document.querySelector(\"{CARD}\").classList.contains('closed')"
        pg.click(CARD + " .ch b"); s = [ev(closed)]; ev("()=>renderControls()"); s.append(ev(closed))
        pg.click(CARD + " .ch .fold"); s.append(ev(closed)); ev("()=>renderControls()"); s.append(ev(closed))
        check("foldCard: header click folds/unfolds and survives renderControls()", s == [True, True, False, False], s)
    ev("()=>openSheet()"); pg.wait_for_timeout(200); pg.keyboard.press("Escape")
    r = ev("()=>[document.getElementById('sheet').style.display, panelOpen]")
    check("Esc closes the projects sheet (desktop panel stays)", r == ["none", True], r)
    ev("()=>{ cfg=newCfg('L'); build(); renderControls(); pushHist(); cfg.walls='solid'; build(); document.activeElement.blur(); }")
    pg.keyboard.press("Control+z")
    check("Ctrl+Z undoes", ev("()=>cfg.walls") == "auto", ev("()=>cfg.walls"))
    ev("async()=>{ await openApt(); }"); pg.wait_for_timeout(1500)
    pg.select_option("#aptBody .addrow select", "__hall"); pg.click("#aptBody .addrow button"); pg.wait_for_timeout(1800)
    ev("()=>enterApt3D(false)")
    try: pg.wait_for_function("()=>panel.getBoundingClientRect().left>=innerWidth-2", timeout=5000)  # the slide-out animation is slow under swiftshader
    except Exception: pass
    r = ev("()=>[APT3D, panelOpen, panel.classList.contains('open'), panel.getBoundingClientRect().left>=innerWidth-2, stage.clientWidth===innerWidth]")
    check("desktop: apartment 3D hides the panel", r == [True, False, False, True, True], r)
    ev("()=>exitApt3D()"); pg.wait_for_timeout(300)
    r = ev("()=>[APT3D, panelOpen, panel.classList.contains('open'), stage.clientWidth<innerWidth, canvas.clientWidth===stage.clientWidth]")
    check("desktop: leaving apartment 3D brings the panel back", r == [False, True, True, True, True], r)
    check("desktop: no JS errors", not errs, errs[:3])
    b.close()
    # --- outside Claude artifacts: no window.storage -> localStorage; neither -> memory only ---
    b, pg, errs = page(p, "delete window.storage;"); ev = pg.evaluate
    ev("async()=>{ localStorage.clear(); cfg=newCfg('b_std'); PROJ={id:'pls1',name:'حمام محلي'}; await saveNow(); }")
    pg.reload(); pg.wait_for_timeout(2500)
    r = ev("()=>[PROJ.id, cfg.roomType, storageOK, 'kitchen3d/kproj:pls1' in localStorage, JSON.parse(localStorage['kitchen3d/kproj:index']).some(p=>p.id==='pls1')]")
    check("no window.storage: projects persist in localStorage across reloads", r == ["pls1", "bath", True, True, True] and not errs, [r, errs[:2]])
    b.close()
    b, pg, errs = page(p, "delete window.storage; Object.defineProperty(window,'localStorage',{get(){ throw new DOMException('blocked','SecurityError'); }});"); ev = pg.evaluate
    r = ev("async()=>{ cfg=newCfg('L'); build(); await saveNow(); return [storageOK, !!(await stGet('kproj:'+PROJ.id)), UNITS.length>0]; }")
    check("no window.storage and no localStorage: works from memory and warns", r == [False, True, True] and not errs, [r, errs[:2]])
    b.close()
    # --- PWA build (build.py --pwa): served over http, then reloaded with the network off ---
    import re, threading, functools, http.server
    sys.path.insert(0, ROOT); import build as bld
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    with tempfile.TemporaryDirectory() as d:
        pwa = os.path.join(d, "pwa"); files = bld.build_pwa(bld.bundle()[0], pwa, THREE)
        idx = open(os.path.join(pwa, "index.html"), encoding="utf-8").read()
        check("PWA: three.js inlined, no CDN or Google Fonts links", "cdnjs" not in idx and "googleapis" not in idx and "REVISION" in idx and not re.findall(r'(?:src|href)="https?://', idx))
        srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=pwa))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{srv.server_port}/"
        b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        ctx = b.new_context(viewport={"width": 390, "height": 760}); pg = ctx.new_page(); ev = pg.evaluate
        errs, ext = [], []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("request", lambda q: ext.append(q.url) if not q.url.startswith((url, "data:", "blob:")) else None)
        pg.goto(url); pg.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller", timeout=15000); pg.wait_for_timeout(1500)
        r = ev("async()=>{ const m=await (await fetch('manifest.json')).json(); const k=await caches.keys(); const c=await caches.open(k[0]); return [m.display, m.icons.length, (await c.keys()).length]; }")
        check("PWA: manifest + service worker precaches every file", r[0] == "standalone" and r[1] >= 3 and r[2] == len(files) + 1, [r, len(files)])
        ev("async()=>{ cfg=newCfg('b_std'); PROJ={id:'ppwa',name:'حمام أوفلاين'}; await saveNow(); }")
        srv.shutdown(); srv.server_close(); ctx.set_offline(True)
        pg.reload(); pg.wait_for_timeout(3000)
        r = ev("()=>[typeof THREE==='object' && THREE.REVISION, !!navigator.serviceWorker.controller, PROJ.id, cfg.roomType, UNITS.length>0, !!document.querySelector('#controls').children.length]")
        check("PWA: reloads and works with the network off, saved work kept", r == ["128", True, "ppwa", "bath", True, True] and not errs, [r, errs[:2]])
        r = ev("async()=>{ const f=await document.fonts.load('600 16px \"IBM Plex Sans Arabic\"','مطبخ'); const i=await fetch('icons/icon-192.png'); return [f.length, f.every(x=>x.status==='loaded'), i.ok]; }")
        check("PWA: IBM Plex Sans Arabic and icons load offline", r[0] >= 1 and r[1] and r[2], r)
        check("PWA: nothing requested from outside the site", not ext, ext[:3])
        b.close()
ok = sum(1 for _, c in results if c); print(f"\n{ok}/{len(results)} passed"); sys.exit(0 if ok == len(results) else 1)
