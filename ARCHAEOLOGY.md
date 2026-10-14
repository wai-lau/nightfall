# Nightfall — Archaeology

Game-internal history that no longer belongs in ARCHITECTURE.md.

- **2026-10-14** — repo adopted as a git submodule of exec-fn (`wai-lau/nightfall`);
  `graphify-out/` untracked (generated, gitignored).
- **Netmap.tsx** — the original 2D overworld was replaced by `Netmap3D.tsx` +
  `components/netmap3d/`; the old file has since been deleted.
- **CRA remnants** — `serviceWorker.js`, root `precache-manifest.*.js` and
  `asset-manifest.json` are fossil Create-React-App output; the service worker
  is unregistered at boot.
- **2026-05-28 to 05-30** — the morning/"dawn" netmap mode took six fixes in two days
  (floor tiles repainted on toggle, faces/slabs, wireframe vs solid column geometry,
  culling unrevealed tiles); it settled as full-column wireframe + top face only. The
  tutorial highlight went through the same churn: a big drop shadow was added, then
  reverted (`6135e4a`, 2026-05-30), and the Satellite line's teal was recoloured then
  restored (`5105e48`). On 2026-06-05 a "nightfall toggle reads 12AM in day mode" fix
  was reverted the same day (`f6de8da`).
- **2026-05-27** — Kuang-12 was split into an enemy and a player program; saves that owned
  the old id are remapped Kuang12 -> Kuang13 on load (`1cec112`). On 2026-06-22 the two
  were merged onto the single `emet` sprite and sector colour (`38b6f13`, `16d69ec`).
- **2026-06-11** — `tsc --noEmit` had 22 standing type errors (`d73148b`) because the build
  is `transpileOnly`; the type-check was never put in the pre-commit hook (~50s), so it
  is a manual `npm run typecheck`. Same day: a hooks-rules violation in `AnimatedEdge`.
- Old remote-dev workflow (scp to the droplet) is obsolete; building on the
  droplet is the deploy.

exec-fn-side history (the tmpfs mask on `nightfall-src/`, the lazy-mount fix,
the shared-save-slot incident of 2026-09-01) stays in exec-fn's ARCHAEOLOGY.md
and ARCHITECTURE.md.
