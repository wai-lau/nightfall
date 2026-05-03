# nightfall ｡◕‿◕｡

Browser RPG. Hack corporations, fight databattles, unravel the net.
Live at **[wai-lau.net/nightfall](https://wai-lau.net/nightfall)**.

---

## Deploy ＼(＾O＾)／

Host path: `/exec-fn/nightfall-incident/` (volume-mounted into exec-fn at `/app/nightfall/`).

### Source/asset changes only

```bash
git add <files> && git commit && git push
ssh root@wai-lau.net "git -C /exec-fn/nightfall-incident pull"
```

### Compiled bundle changes `(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧`

`static/js/` and `static/css/` are gitignored — must scp.

```bash
cd nightfall-src && npm run build
scp -r static/js/ static/css/ root@wai-lau.net:/exec-fn/nightfall-incident/static/
git add <source files> && git commit && git push
```

No container restart needed — StaticFiles serves live from the volume.

### Verify

```bash
curl -sf https://wai-lau.net/nightfall | head -c 200
```

---

## Stack (╯°□°）╯

| Thing | What |
|-------|------|
| TypeScript + React | UI + game logic |
| Webpack | Bundle → `../static/` |
| FastAPI (exec-fn) | Serves `/nightfall` as static mount |
| Docker volume | `./nightfall-incident → /app/nightfall` |
