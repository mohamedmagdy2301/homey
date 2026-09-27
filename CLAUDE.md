# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file web tool (three.js r128, loaded from cdnjs) for designing kitchens, bathrooms, and rooms in 3D and linking them into a full apartment. It also produces construction drawings, plumbing and electrical estimates, and shopping lists with a budget. The UI text is in Egyptian Arabic and the page is RTL (`<html lang="ar" dir="rtl">`), so keep that dialect in new UI strings. The layout is designed for mobile (the tests use a 390×760 viewport).

- `kitchen-tool-src/` is the source. Edit only here.
- `kitchen-3d.html` at the repo root is a built copy of the bundle (it matches `dist/kitchen-3d.html` apart from line endings). Regenerate it with the build; never edit it by hand.

## Commands (run from `kitchen-tool-src/`)

```bash
python build.py                          # bundles src/ -> dist/kitchen-3d.html
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

**State model.** One global `cfg` is the current room's configuration. `newCfg(templateKey)` creates it from a template. There are four template maps: `TEMPLATES` (kitchens, in 01), `BTEMPLATES` (baths, in 05), and `HTEMPLATES`/`RTEMPLATES` (halls and furnished rooms, in 06/07). `cfg.roomType` is one of `kitchen | bath | hall | room`, and a lot of code branches on it. Walls are keyed `W`, `RT`, `D`, `L` (see `W4`/`WNAME`). Features such as windows, doors, columns, corridors, and cut corners live in `cfg.feats`. The settings panel is generated from `SCHEMA` in `01-config.js`.

**`build()`** (`13-build.js`) is the single rebuild entry point. It disposes of and recreates the `root` THREE.Group, resets the derived globals (`UNITS`, `POINTS`, `FEATS`, `WALLS`, `STATS`, `QTY`, `BATH`, ...), and dispatches to `buildKitchen`/`buildBath`/`buildHall`/`buildRoom`, followed by `finishBuild`. After changing `cfg`, call `build()`. Derived globals are valid only after a build.

**Apartment mode** (`06-apartment-...js`): `APT.rooms` references saved room projects, and `SNAP[id]` caches each room's built snapshot. The code handles linking and shared walls (`SHARED`), plumbing, electrical and levels, the combined document (`aptDoc()`), and a walkable combined 3D view (`enterApt3D`/`exitApt3D`, `APT3D`, `aptRoots`). `shoppingData()` (12) aggregates purchases.

**Persistence** (`15-ui.js`): `stGet`/`stSet`/`stDel` wrap `window.storage` (the Claude artifacts storage API) and fall back to the in-memory `MEMS` if it throws. Projects are listed in `projIndex` and saved with `saveNow()`. `backupData()`/`restoreData()` live in `11-backup.js`. The tests mock `window.storage` and also check a broken-storage fallback case. To host the tool outside Claude artifacts, swap `stGet`/`stSet`/`stDel` for localStorage or an API.

**User text and HTML.** Much of the UI is built with template strings and `innerHTML`. Any project or room name, warning, or label that goes into markup must be wrapped in `esc()`, which is defined in `01-config.js`. Names are also cleaned when they come in (`cleanName`), and `migrate()` runs `cleanDeep` to strip `<>` from every string in a loaded cfg. `restoreData()` checks the whole backup before it writes anything. Use `stRead()` when you need to tell "the key doesn't exist" apart from "the read failed", and never write defaults over a key whose read failed.

The engineering numbers (drain slopes, pipe and cable lengths, electrical loads) are rough planning estimates and do not replace an engineer.
