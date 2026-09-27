# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file web tool (three.js r128, loaded from cdnjs) for designing kitchens, bathrooms, and rooms in 3D and linking them into a full apartment. It also produces construction drawings, plumbing and electrical estimates, and shopping lists with a budget. The UI text is in Egyptian Arabic and the page is RTL (`<html lang="ar" dir="rtl">`), so keep that dialect in new UI strings. The layout is responsive, but the tests use a 390×760 phone viewport.

- `kitchen-tool-src/` is the source. Edit only here.
- `kitchen-3d.html` at the repo root is a built copy of the bundle (it matches `dist/kitchen-3d.html` apart from line endings). Regenerate it with the build; never edit it by hand.

## Commands (run from `kitchen-tool-src/`)

```bash
python build.py                          # bundles src/ -> dist/kitchen-3d.html
python build.py --pwa                    # also writes dist/pwa/, the offline installable copy (see "PWA build" below)
pip install playwright && playwright install chromium
python tests/smoke_test.py               # headless Chromium tests against dist/ (build first!); fetches three@0.128.0 via npm once into tests/three.min.js
python tests/smoke_test.py path/to/three.min.js   # use a specific local three.js r128
```

There is no test runner and no way to run a single test. `smoke_test.py` is one linear script of `check(...)` calls, so to focus on one area, comment out the others or write a small ad-hoc Playwright script that follows the same pattern. The tests call app globals directly through `page.evaluate` (for example `cfg=newCfg('U'); build(); UNITS...`), and that is also the quickest way to debug logic.

## Architecture

**The build is plain concatenation, not modules.** `build.py` reads `src/js/ORDER.txt`, joins those files in that order, and substitutes the result for `/*__APP_JS__*/` inside the `<script>` in `src/index.html` (which also holds all the CSS). Every file shares one global script scope:
- Top-level `const`/`let`/`function` names are shared across files, and a duplicate name breaks the whole bundle.
- Order matters for top-level code that runs at load time. `01-config.js` defines the constants, `02-three-setup.js` creates `renderer`/`scene`/`camera`/`root`, and later files depend on both.
- A new JS file must be added to `ORDER.txt`, or it will not be included.
- The file list in `README.md` is out of date (for example, build is now `13-build.js` and UI is `15-ui.js`). Trust `ORDER.txt`.
- Lines are very long and dense. Use Grep to find a function instead of reading whole files.
- Code often continues after a statement on the same line, so a `//` comment added mid-line comments out the rest of that line. Use `/* */` for inline notes. If the page stops loading (smoke test: `TEMPLATES is not defined`), extract the bundled `<script>` and run `node --check` on it.

**State model.** One global `cfg` is the current room's configuration. `newCfg(templateKey)` creates it from a template. There are four template maps: `TEMPLATES` (kitchens, in 01), `BTEMPLATES` (baths, in 05), and `HTEMPLATES`/`RTEMPLATES` (halls and furnished rooms, in 06/07). `cfg.roomType` is one of `kitchen | bath | hall | room`, and a lot of code branches on it. Walls are keyed `W`, `RT`, `D`, `L` (see `W4`/`WNAME`). Features such as windows, doors, columns, corridors, and cut corners live in `cfg.feats`. The settings panel is generated from `SCHEMA` in `01-config.js`.

**`build()`** (`13-build.js`) is the single rebuild entry point. It disposes of and recreates the `root` THREE.Group, resets the derived globals (`UNITS`, `POINTS`, `FEATS`, `WALLS`, `STATS`, `QTY`, `BATH`, ...), and dispatches to `buildKitchen`/`buildBath`/`buildHall`/`buildRoom`, followed by `finishBuild`. After changing `cfg`, call `build()`. Derived globals are valid only after a build.

**Apartment mode** (`06-apartment-...js`): `APT.rooms` references saved room projects, and `SNAP[id]` caches each room's built snapshot. The code handles linking and shared walls (`SHARED`), plumbing, electrical and levels, the combined document (`aptDoc()`), and a walkable combined 3D view (`enterApt3D`/`exitApt3D`, `APT3D`, `aptRoots`). `shoppingData()` (12) aggregates purchases.

**Persistence** (`15-ui.js`): `stRead`/`stGet`/`stSet`/`stDel`/`rawSet` go through `store()`, which returns `window.storage` (the Claude artifacts storage API) when it exists, otherwise a localStorage adapter with the same async `get`/`set`/`delete` (keys prefixed `kitchen3d/`), otherwise `null`. When a call fails or there is no backend, they fall back to the in-memory `MEMS` and set `storageOK=false`, which shows the "saving is broken" note. Projects are listed in `projIndex` and saved with `saveNow()`. `backupData()`/`restoreData()` live in `11-backup.js`. The tests cover four cases: a mocked `window.storage`, a `window.storage` that throws, no `window.storage` (localStorage survives a reload), and neither (memory only).

**PWA build** (`python build.py --pwa`). The default build stays one self-contained HTML file. `--pwa` also writes `dist/pwa/` (gitignored): an `index.html` with three.js r128 inlined in place of the cdnjs `<script>` (taken from `tests/three.min.js`, fetched via npm if missing, or from `--three PATH`), the Google Fonts links swapped for local IBM Plex Sans Arabic `@font-face` rules, plus `manifest.json`, `icons/`, `fonts/`, and `sw.js`. Their sources are in `src/pwa/`. The font files are the arabic and latin subsets, weights 400–700, from `@fontsource/ibm-plex-sans-arabic` (OFL). The icon PNGs were rendered from `icons/icon.svg`. `sw.js` precaches every file on install and serves from the cache first, so the tool opens with no network. Its cache name is a hash of the files, so every new build replaces the old cache (users get the update on their second visit after a deploy). With no `window.storage`, projects are saved in localStorage.
- To deploy, upload the contents of `dist/pwa/` as they are to any static HTTPS host (GitHub Pages, Netlify, Cloudflare Pages, or a folder on a server). Service workers need HTTPS or `localhost`. The paths are relative, so a subfolder works. Don't set long cache headers on `sw.js`.
- To try it locally, run `python -m http.server 8000 -d dist/pwa` and open `http://localhost:8000/`. Opened from `file://`, the page still works, but it can't be installed or run offline.
- `smoke_test.py` builds the PWA into a temp folder, serves it over HTTP, waits for the service worker, stops the server, turns the network off (`context.set_offline(True)`), reloads, and checks that the app, a saved project, the font, and the icons all still load.

**Layout and UI components** (CSS in `src/index.html`, JS in `15-ui.js`). There are three layouts, and the CSS media queries and `MQ` in JS share the same breakpoints. On a phone (<760px), the 3D view fills the screen and the panel is a bottom sheet (`#grab` expands, shrinks, or closes it) opened from `#fab`. On a tablet (≥760px), the panel is docked on the right. On a desktop (≥1180px), the panel is docked and open at load, and its tabs become an icon rail (`TABICO`). The canvas lives in `#stage`, which CSS sizes around the panel, and `resize()` reads the stage's size. The top toolbar uses container queries on `#stage`, so it adapts to the width of the 3D area, not the whole screen. Colors are CSS tokens on `:root`. Build panel rows with the shared helpers rather than raw inputs: `choice()` picks a switch for yes/no options, segmented buttons for up to four short options, or a select otherwise. `rangeField()`/`objRange()` give a stepper with −/+ plus a slider. `foldCard(card,hd,id)` makes a card collapsible, and adding an id to `OPENC` opens it. `chipAdder()` builds the tap-to-add bar with a wall picker. Icons are `ico(name)` from `ICONS`.

**User text and HTML.** Much of the UI is built with template strings and `innerHTML`. Any project or room name, warning, or label that goes into markup must be wrapped in `esc()`, which is defined in `01-config.js`. Names are also cleaned when they come in (`cleanName`), and `migrate()` runs `cleanDeep` to strip `<>` from every string in a loaded cfg. `restoreData()` checks the whole backup before it writes anything. Use `stRead()` when you need to tell "the key doesn't exist" apart from "the read failed", and never write defaults over a key whose read failed.

The engineering numbers (drain slopes, pipe and cable lengths, electrical loads) are rough planning estimates and do not replace an engineer.
