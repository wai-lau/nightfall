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

Host path: `/exec-fn/nightfall-incident/` (volume-mounted into exec-fn container at `/app/nightfall/`).
StaticFiles serves live from the volume — no container restart needed.

```bash
# Build first
cd nightfall-src && npm run build

# Deploy compiled assets
scp -r ../static/ root@wai-lau.net:/exec-fn/nightfall-incident/static/

# Or: push to GitHub and pull on host
ssh root@wai-lau.net "git -C /exec-fn/nightfall-incident pull"
```

Note: `static/js/` and `static/css/` are gitignored — git pull only works for source/asset changes, not compiled bundles. Use scp for compiled output.

---

## How it's served

exec-fn mounts `./nightfall-incident → /app/nightfall` in `docker-compose.yml`.
FastAPI serves `/nightfall` as a static mount — no auth required.
