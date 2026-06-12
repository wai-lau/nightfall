# nightfall

Standalone browser RPG. Served at `wai-lau.net/nightfall` (unprotected route) via exec-fn container.

---

## Repo layout

```
nightfall/
  nightfall-src/       # TypeScript/React source
    components/        # React components + CSS
    campaign/          # levels, dialogues, netmap, characters
    audio/             # source audio files
    img/               # source images
    webpack.config.js
    tsconfig.json
    package.json
  static/              # compiled output (gitignored: static/js/, static/css/)
    media/             # compiled assets
  audio/               # mp3 files served directly
  index.html
  wai-head.js          # injected into <head>
  wai-body.html        # injected into <body>
  wai-save-sync.js     # save sync logic
```

---

## Build & deploy

**WE ARE ON THE SERVER.** This repo lives at `/exec-fn/nightfall-incident` on
production, volume-mounted into the exec-fn container at `/app/nightfall`.
FastAPI serves `static/` straight from the volume — building writes to the live
files. **No ssh / scp / push-pull needed.** (The old remote-dev workflow with
scp to `root@wai-lau.net` is obsolete — ignore it.)

```bash
cd /exec-fn/nightfall-incident/nightfall-src
NODE_ENV=production npm run build     # webpack → ../static/ (live)
```

- **`NODE_ENV=production` is required** — without it the compiled asset paths
  are wrong and the game loads to a silent black screen (assets 404).
- Run the build with `run_in_background: true` — it takes ~45s.
- `static/js/` and `static/css/` are **gitignored** — only source is tracked.
  Building locally on the server IS the deploy; commit the source separately.
- `*.png` under `web/`/here are gitignored too; nav icons are whitelisted.
- Verify: `curl -sf https://wai-lau.net/nightfall | head -c 200` (200 = healthy).
- `index.html` loads `./static/css/bundle.css` + `./static/js/bundle.js` (not
  hashed) — no cache-bust needed.

Served at `/nightfall` as an unauthenticated static mount (exec-fn mounts
`./nightfall-incident → /app/nightfall` in `docker-compose.yml`).

---

## Git hooks

**Pre-commit** lints staged files: ESLint on `nightfall-src/**/*.ts(x)`,
stylelint on `nightfall-src/**/*.css`. Errors block the commit; warnings
print and pass. Source of truth is `scripts/pre-commit` (version-controlled);
`.git/hooks/pre-commit` is a symlink — run `bash scripts/install-hooks.sh`
to (re)install on a fresh clone.

**Post-commit / post-checkout** belong to graphify (auto-rebuilds
`graphify-out/` knowledge graph; log at `/root/.cache/graphify-rebuild.log`).
Reinstall with `graphify hook install`.

---

## Gameplay conventions (non-obvious)

**Programs** (`nightfall-src/programs/*.ts`, `IProgram`): `actions[].run(ac, tc,
selfID, targetID)` returns an array of `ac.*` effect promises, all awaited.
`targetID` is the program id at the targeted cell, or **null** for empty space —
gate effects on it (e.g. Kuang-12/13 Devour only `growTarget(self)` when
`targetID` is set, so it grows only on a real hit). Variant pairs (Kuang-12 enemy
/ Kuang-13 player, LogicBomb / LogicBomb2) share stats + behaviour and differ
only in art (`id` / `color` / `iconImageFile`).

**program.list ordering** (`components/uploadEntries.ts`): programs group by line
(`PROGRAM_CATEGORIES`), groups render in that order; within a group order is by
**warez tier** (which warez node sells it, lowest-left). A program sold at no
warez node (e.g. starter Clog.01) carries forward the preceding line member's
tier so starters lead and upgrade variants trail their base; tie-break by
canonical line index. `buildUploadEntries` is the single source of truth shared
by render + keyboard nav (`Battle.keyboardUploadIndex`, init **-1** = nothing
highlighted; first nav clamps to row 0).

**Move undo** (`components/Battle.tsx`, `undoState`): snapshot of full state taken
**before each move** (`createOnMove`); restored by `undo()`, then nulled. Cleared
after an action commits (`createOnAct`) and at `nextTurn` — never undo past an
attack or across a turn. NOT captured on selection change, so moving a unit then
selecting another keeps the last move undoable.

**Tutorial** (`components/Tutorial.tsx` + `index.css`): blocks input via a
window-capture click/keydown listener (no overlay) — only clicks whose path
includes the highlighted `.tutorial-target`, the `.dialogue-buttons`, or the
exec-fn wrapper's `#wai-fs-btn` (fullscreen) pass through. `body.tutorial-active`
suppresses the white selected-unit outline flash on every unit so the only
flashing outline is the tutorial ring (`tutorial-pulse`, 0.25s, Superphreak-hair
gold `#f8b308`). State toggled by the `body.tutorial-active` class.

**Recolour rule:** recolouring a program means updating BOTH its `.ts` `color`
AND its icon PNG (`bin`/`recolor_icons.py`). See also: only `Netmap3D.tsx` is
rendered (the 2D `Netmap.tsx` is dead code); match canon character pronouns
(Superphreak stays ungendered).
