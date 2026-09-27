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

def page(p, storage=MOCK):
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": 390, "height": 760})
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
    r = ev("()=>{ const h=hist.length, c=JSON.stringify(cfg); openWizard(true); pushHist(); applyTemplate(cfg,'b_std',false); build(); closeWizard(false); return [hist.length===h, JSON.stringify(cfg)===c]; }")
    check("cancelling the wizard restores cfg and undo history", r[0] and r[1], r)
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
    check("no JS errors during the whole run", not errs, errs[:3])
    b.close()
    b, pg, errs = page(p, FAILING); ev = pg.evaluate
    ev("async()=>{ await openApt(); }"); pg.wait_for_timeout(1500)
    pg.select_option("#aptBody .addrow select", "__hall"); pg.click("#aptBody .addrow button"); pg.wait_for_timeout(1800)
    check("works when persistent storage is broken (memory fallback)", ev("()=>APT.rooms.length") == 2 and not errs, errs[:2])
    b.close()
ok = sum(1 for _, c in results if c); print(f"\n{ok}/{len(results)} passed"); sys.exit(0 if ok == len(results) else 1)
