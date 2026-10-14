# Nightfall — Archaeology

Game-internal history that no longer belongs in ARCHITECTURE.md.

- **2026-10-14** — repo adopted as a git submodule of exec-fn (`wai-lau/nightfall`);
  `graphify-out/` untracked (generated, gitignored).
- **Netmap.tsx** — the original 2D overworld was replaced by `Netmap3D.tsx` +
  `components/netmap3d/`; the old file has since been deleted.
- **CRA remnants** — `serviceWorker.js`, root `precache-manifest.*.js` and
  `asset-manifest.json` are fossil Create-React-App output; the service worker
  is unregistered at boot.
- Old remote-dev workflow (scp to the droplet) is obsolete; building on the
  droplet is the deploy.

exec-fn-side history (the tmpfs mask on `nightfall-src/`, the lazy-mount fix,
the shared-save-slot incident of 2026-09-01) stays in exec-fn's ARCHAEOLOGY.md
and ARCHITECTURE.md.
