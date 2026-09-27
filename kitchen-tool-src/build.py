#!/usr/bin/env python3
"""Bundle src/ into a single self-contained HTML file: dist/kitchen-3d.html"""
import os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(ROOT, "src")
order = [l.strip() for l in open(os.path.join(src, "js", "ORDER.txt"), encoding="utf-8") if l.strip()]
js = "\n".join(open(os.path.join(src, "js", f), encoding="utf-8").read() for f in order)
tpl = open(os.path.join(src, "index.html"), encoding="utf-8").read()
assert "/*__APP_JS__*/" in tpl, "placeholder missing in src/index.html"
out = tpl.replace("/*__APP_JS__*/", js)
os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
dst = os.path.join(ROOT, "dist", "kitchen-3d.html")
open(dst, "w", encoding="utf-8").write(out)
print(f"built {dst} ({len(out)//1024} KB, {len(order)} modules)")
