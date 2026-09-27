#!/usr/bin/env python3
"""Bundle src/ into a single self-contained HTML file: dist/kitchen-3d.html
Usage: python build.py [--pwa] [--three path/to/three.min.js]
  --pwa  also writes dist/pwa/: an installable copy that works offline (three.js r128 inlined,
         IBM Plex Sans Arabic served locally, manifest.json, icons and a caching service worker sw.js).
"""
import os, sys, re, json, hashlib, shutil, subprocess, tempfile, tarfile, argparse
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
PWA_SRC = os.path.join(SRC, "pwa")
CDN_THREE = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'

def bundle():
    order = [l.strip() for l in open(os.path.join(SRC, "js", "ORDER.txt"), encoding="utf-8") if l.strip()]
    js = "\n".join(open(os.path.join(SRC, "js", f), encoding="utf-8").read() for f in order)
    tpl = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
    assert "/*__APP_JS__*/" in tpl, "placeholder missing in src/index.html"
    return tpl.replace("/*__APP_JS__*/", js), len(order)

def ensure_three(path=None):
    """three.js r128: the given file, else tests/three.min.js (fetched once from npm, shared with the smoke test)."""
    path = path or os.path.join(ROOT, "tests", "three.min.js")
    if not os.path.exists(path):
        npm = shutil.which("npm") or sys.exit("npm not found: pass --three path/to/three.min.js (r128)")
        with tempfile.TemporaryDirectory() as d:
            subprocess.run([npm, "pack", "three@0.128.0"], cwd=d, check=True, capture_output=True)
            tgz = [f for f in os.listdir(d) if f.endswith(".tgz")][0]
            with tarfile.open(os.path.join(d, tgz)) as t:
                shutil.copyfileobj(t.extractfile("package/build/three.min.js"), open(path, "wb"))
    return path

def build_pwa(html, out, three):
    t = open(three, encoding="utf-8").read()
    assert 'const e="128"' in t, f"{three} is not three.js r128"
    assert "</script" not in t.lower(), "three.min.js can't be inlined in a <script> tag"
    assert html.count(CDN_THREE) == 1, "three.js CDN <script> not found in the bundle"
    html = html.replace(CDN_THREE, "<script>" + t + "</script>")
    html = re.sub(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?', "", html)
    fonts = open(os.path.join(PWA_SRC, "fonts", "fonts.css"), encoding="utf-8").read()
    head = ('<link rel="manifest" href="manifest.json">\n<link rel="icon" href="icons/icon.svg" type="image/svg+xml">\n'
            '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n<meta name="mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n<style>\n' + fonts + '</style>\n')
    assert html.count("</title>") == 1 and html.count("</body>") == 1
    html = html.replace("</title>", "</title>\n" + head, 1)
    reg = '<script>if("serviceWorker" in navigator && location.protocol!=="file:") addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));</script>\n'
    html = html.replace("</body>", reg + "</body>", 1)
    ext = re.findall(r'(?:src|href)="(https?://[^"]*)"', html)
    assert not ext, f"PWA still loads from the network: {ext}"
    if os.path.isdir(out): shutil.rmtree(out)
    os.makedirs(os.path.join(out, "fonts")); os.makedirs(os.path.join(out, "icons"))
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
    files = ["index.html", "manifest.json"]
    shutil.copy(os.path.join(PWA_SRC, "manifest.json"), out)
    for sub, keep in (("icons", (".png", ".svg")), ("fonts", (".woff2", ".txt"))):
        for f in sorted(os.listdir(os.path.join(PWA_SRC, sub))):
            if f.endswith(keep):
                shutil.copy(os.path.join(PWA_SRC, sub, f), os.path.join(out, sub))
                if not f.endswith(".txt"): files.append(f"{sub}/{f}")
    h = hashlib.sha256()
    for f in files: h.update(open(os.path.join(out, f), "rb").read())
    sw = open(os.path.join(PWA_SRC, "sw.js"), encoding="utf-8").read()
    sw = sw.replace("__VERSION__", "kitchen3d-" + h.hexdigest()[:12]).replace("__FILES__", json.dumps(["./"] + files))
    open(os.path.join(out, "sw.js"), "w", encoding="utf-8").write(sw)
    return files

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Bundle src/ into dist/kitchen-3d.html (and dist/pwa/ with --pwa)")
    ap.add_argument("--pwa", action="store_true", help="also build the offline PWA folder dist/pwa/")
    ap.add_argument("--three", help="path to three.min.js r128 for --pwa (default: tests/three.min.js, fetched via npm if missing)")
    a = ap.parse_args()
    out, n = bundle()
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    dst = os.path.join(ROOT, "dist", "kitchen-3d.html")
    open(dst, "w", encoding="utf-8").write(out)
    print(f"built {dst} ({len(out)//1024} KB, {n} modules)")
    if a.pwa:
        pwa = os.path.join(ROOT, "dist", "pwa")
        files = build_pwa(out, pwa, ensure_three(a.three))
        size = sum(os.path.getsize(os.path.join(pwa, f)) for f in files)
        print(f"built {pwa} ({size//1024} KB, {len(files)} cached files + sw.js)")
