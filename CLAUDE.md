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

## Build

```bash
cd nightfall-src
npm run build          # webpack → outputs to ../static/
```

Compiled JS/CSS are gitignored — only source is tracked.

---

## Deploy

**DEPLOY = BACKGROUND AGENT. ALWAYS. NO EXCEPTIONS.**

Host path: `/exec-fn/nightfall-incident/` (volume-mounted into exec-fn container at `/app/nightfall/`).
StaticFiles serves live from the volume — no container restart needed.

Two cases:

### Source/asset changes only (no compiled JS/CSS)

```bash
# 1. commit + push locally
git add <files> && git commit && git push

# 2. pull on host
ssh root@wai-lau.net "git -C /exec-fn/nightfall-incident pull"

# 3. verify
curl -sf https://wai-lau.net/nightfall | head -c 200
```

### Compiled bundle changes (anything in static/js/ or static/css/)

`static/js/` and `static/css/` are gitignored — must scp.

```bash
# 1. build
cd nightfall-src && npm run build

# 2. scp compiled output
scp -r static/js/ static/css/ root@wai-lau.net:/exec-fn/nightfall-incident/static/

# 3. scp any other changed files (index.html, wai-*.js, audio, etc.)
scp index.html root@wai-lau.net:/exec-fn/nightfall-incident/

# 4. commit + push source changes
git add <source files> && git commit && git push

# 5. verify
curl -sf https://wai-lau.net/nightfall | head -c 200
```

No restart needed — volume mount serves files directly.

### Deploy agent prompt template

```
Deploy nightfall changes to production.

WHAT CHANGED:
<summary>

DEPLOY:
1. cd /home/wai/src/nightfall && npm run build (if JS/CSS changed)
2. scp static/js/ static/css/ root@wai-lau.net:/exec-fn/nightfall-incident/static/ (if compiled)
   OR ssh root@wai-lau.net "git -C /exec-fn/nightfall-incident pull" (source/assets only)
3. Verify: WebFetch https://wai-lau.net/nightfall — 200 = healthy
4. git add <source files> && git commit && git push

Report what was deployed and health check result.
```

---

## How it's served

exec-fn mounts `./nightfall-incident → /app/nightfall` in `docker-compose.yml`.
FastAPI serves `/nightfall` as a static mount — no auth required.
