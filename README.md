# nightfall ｡◕‿◕｡

Browser RPG. Hack corporations, fight databattles, unravel the net.
Live at **[wai-lau.net/nightfall](https://wai-lau.net/nightfall)**.

---

## Deploy ＼(＾O＾)／

This repo lives at `/exec-fn/nightfall-incident/` **on the production server**,
volume-mounted into exec-fn at `/app/nightfall/`. FastAPI serves `static/` from
the volume, so building writes the live files — no ssh / scp / push-pull.

```bash
cd /exec-fn/nightfall-incident/nightfall-src
NODE_ENV=production npm run build   # webpack → ../static/ (live); ~45s
```

`NODE_ENV=production` is required (else asset paths break → black screen).
`static/js/` + `static/css/` are gitignored — building IS the deploy; commit the
source separately. No container restart needed.

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
