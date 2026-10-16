# nightfall

Standalone browser RPG. Served at `wai-lau.net/nightfall` (guest-gated: Turnstile `guest_session` or owner login) via the exec-fn container.
How the game works: **ARCHITECTURE.md** (history: **ARCHAEOLOGY.md**). How exec-fn serves it (page route, save slots, bind mount): exec-fn's own ARCHITECTURE.md (§20f, §17e).

---

## Repo layout

The file/symbol map lives in the knowledge graph (built with `/graphify`): open `graphify-out/graph.html` in a browser, or read `graphify-out/GRAPH_REPORT.md`. `graphify-out/` is a **generated local artifact** (gitignored since 2026-10-14, never committed; run `/graphify` to rebuild it -- the graphify post-commit hook is installed but inert, `GRAPHIFY_SKIP_HOOK=1` in `~/.zshenv`). If it is absent, regenerate it before relying on it. The hand-written layout is in ARCHITECTURE.md.

---

## Build & deploy

**On the droplet** (droplet claude) this repo lives at `/exec-fn/nightfall-incident` on
production, volume-mounted into the exec-fn container at `/app/nightfall`.
FastAPI serves `static/` straight from the volume — building writes to the live
files. **No ssh / scp / push-pull needed** to build. (The old remote-dev workflow with
scp to `wai-root@wai-lau.net` is obsolete — ignore it.) A local-claude mirror
has no live mount: the build only goes live where it runs on the droplet.

```bash
cd /exec-fn/nightfall-incident/nightfall-src
NODE_ENV=production npm run build     # webpack → ../static/ (live)
```

- **`NODE_ENV=production` is required** — without it the compiled asset paths
  are wrong and the game loads to a silent black screen (assets 404).
- Run the build with `run_in_background: true` — it takes ~45s.
- `static/js/` and `static/css/` are **gitignored** — only source is tracked.
  Building locally on the server IS the deploy; commit the source separately.
- `static/media/` is in `.gitignore` too, but 112 files already in it ARE tracked (committed
  before the ignore), so a rebuild that renames a hashed asset shows as a tracked change;
  `node_modules/`, save JSONs (`save*.json`, `gamesave_*.json`) and `graphify-out/` are
  properly ignored.
- Verify: `curl -sf https://wai-lau.net/nightfall | head -c 200` (200 = healthy).
- `index.html` loads `./static/css/bundle.css` + `./static/js/bundle.js` (not
  hashed); exec-fn appends `?v=<mtime>` to them at serve time (the save-sync loader adds
  `v=Date.now()` to the script, so it is refetched every load), so a rebuild
  needs no manual cache-bust. Lazy per-level chunks are content-hashed.

The page `/nightfall` is built per request by exec-fn (`api/routes_nightfall.py`);
assets come from exec-fn's `./nightfall-incident → /app/nightfall` bind mount
(`/nightfall-game/`), with an empty tmpfs masking `nightfall-src/` inside the
container (so reload polling does not walk it; the host copy is untouched).

**This repo is a git SUBMODULE of exec-fn** (`wai-lau/nightfall`, since 2026-10-14,
at its old path `nightfall-incident/`; it was an untracked nested checkout before). Commit here as usual: exec-fn's push hook
pushes this repo first, then bumps and pushes exec-fn's pointer, so a deploy
(`scripts/deploy.sh` there, `git submodule update --init`) serves the same
commit. An exec-fn deploy REFUSES while this repo holds a commit the parent
has not recorded. 

---

## Git hooks

**Pre-commit** is this repo's OWN lint hook, not exec-fn's sub-repo shim (exec-fn's
session hook skips it; it does not go through `core.hooksPath` or `.exec-fn/`). It lints
staged files: ESLint on `nightfall-src/**/*.ts(x)`, stylelint on `nightfall-src/**/*.css`.
Errors block the commit; warnings print and pass. Source of truth is `scripts/pre-commit`
(version-controlled); `.git/hooks/pre-commit` is a symlink — run
`bash scripts/install-hooks.sh` to (re)install on a fresh clone. It runs no tests and no
type-check.

**Post-commit / post-checkout** belong to graphify (would rebuild the generated,
untracked `graphify-out/`, but `GRAPHIFY_SKIP_HOOK=1` in `~/.zshenv` keeps them inert;
`install-hooks.sh` manages only pre-commit).
Reinstall with `graphify hook install`.

**Type-check** is NOT in the hook (whole-project, ~50s): run
`npm run typecheck` (`tsc --noEmit`) in `nightfall-src/` before pushing
type-touching changes. Neither ESLint (not type-aware) nor the build
(`transpileOnly`) catches type errors.

**Claude Code guard hooks** are exec-fn's (`.claude/hooks/` there; exec-fn's ARCHITECTURE.md
§1e covers its sub-repo shims, which this repo does not use), registered in its
`.claude/settings.json`; every one fails open. They only fire for Claude Code running in exec-fn:
- `nightfall-build-guard.py` (PreToolUse Bash): denies a webpack build that lacks
  `NODE_ENV=production` or is not run in the background.
- `dead-file-guard.sh` (PreToolUse Edit/Write): denies edits to
  `components/Netmap.tsx`. That file no longer exists; the guard is a tripwire
  against re-adding it. Only `Netmap3D.tsx` + `components/netmap3d/` are live.

---

## Gameplay conventions (non-obvious)

**Programs** (`nightfall-src/programs/*.ts`, `IProgram`): `actions[].run(ac, tc,
selfID, targetID)` returns an array of `ac.*` effect promises, all awaited.
`targetID` is the program id at the targeted cell, or **null** for empty space —
gate effects on it (e.g. Kuang-12/13 Devour only `growTarget(self)` when
`targetID` is set, so it grows only on a real hit). Variant pairs (Kuang-12 enemy
/ Kuang-13 player, LogicBomb / LogicBomb2) share stats + behaviour and the `id`
differs. LogicBomb / LogicBomb2 also differ in art (`color` / `iconImageFile`);
Kuang-12 / Kuang-13 are now *identical* in art too (both = the `emet` sprite,
`rgb(48,48,51)` dark grey = the emet icon's tile bg) — the captured-same-program
merge. Program icons follow tile-bg == `color`; emet's slate tile sets it.

**program.list ordering** (`components/uploadEntries.ts`): programs group by line
(`PROGRAM_CATEGORIES`; a line the player owns fewer than two distinct programs of, and any
uncategorized program, falls into the trailing `everything-else` group), groups render in
that order; within a group order is by
**warez tier** (which warez node sells it, lowest-left). A program sold at no
warez node (e.g. starter Clog.01) carries forward the preceding line member's
tier so starters lead and upgrade variants trail their base; tie-break by
canonical line index. `buildUploadEntries` is the single source of truth shared
by render + keyboard nav (`Battle.keyboardUploadIndex`, init **-1** = nothing
highlighted; first nav clamps to row 0).

**Audio unlock** (`components/AudioPlayer.tsx`): all game audio is Web Audio
(`new AudioContext()`), which iOS mutes under the Ring/Silent switch and starts
suspended. `unlockAudio()` runs on the first user gesture (one-shot
`pointerdown`/`touchend`/`keydown` listener in `componentDidMount`): resumes the
context, fires a 1-sample blip, and loops `audio/silence.wav` through an
`HTMLMediaElement` so the page's audio session becomes "playback" — which the
switch does NOT mute, so audio plays in silent mode / DnD. Mirrors the /hosaka
TTS page in exec-fn.

**Move undo** (`components/Battle.tsx`, `undoStates`): a per-program map of full-state
snapshots. One is taken the first time a program is selected while still pristine
(`movesRemaining === numMoves && !hasActed`, in `componentDidUpdate`) and never
overwritten by re-selection, so `undo()` reverts ALL of that program's moves this turn;
`undo()` restores a fresh clone and keeps the snapshot for repeat undos. The program's
snapshot is deleted when it acts (`createOnAct`) and all are cleared at `nextTurn` — never
undo past an attack or across a turn.

**Tutorial** (`components/Tutorial.tsx` + `index.css`): blocks input via a
window-capture click/keydown listener (no overlay) — only clicks whose path
includes the highlighted `.tutorial-target`, the `.dialogue-buttons`, or the
exec-fn wrapper's `#wai-fs-btn` (fullscreen) pass through; game keys are blocked
except the current stage's allowed keys. `body.tutorial-active` suppresses the white
selected-unit outline flash on every unit so the only flashing outline is the tutorial
ring (`tutorial-pulse`, 0.16s, Superphreak yellow `#f5d71e`, `index.css`). State toggled
by the `body.tutorial-active` class.

**Recolour rule:** recolouring a program means updating BOTH its `.ts` `color`
AND its icon PNG (`nightfall-src/bin/recolor_icons.py`). See also: only `Netmap3D.tsx` is
rendered (the old 2D `Netmap.tsx` is gone; do not recreate it); match canon character pronouns
(Superphreak stays ungendered).
