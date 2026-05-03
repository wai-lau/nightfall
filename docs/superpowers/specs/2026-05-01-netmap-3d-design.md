# Netmap 3D Redesign

**Date:** 2026-05-01  
**Status:** Approved for implementation

## Context

The existing netmap (`Netmap.tsx`) is a 2D scrollable canvas: a static PNG background with absolute-positioned icon sprites for ~43 nodes. The goal is to replace it with a React Three Fiber 3D scene while keeping all game logic, prop interfaces, and audio untouched.

---

## Visual Language

All node icons in the original are **the same steel blue color** (~`#8FAABB`). Shape alone identifies corp type. The clear/uncleared distinction is:
- **Uncleared** → wireframe mesh (see `trim-ph-t.png`)
- **Cleared** → solid filled mesh, slightly darker (see `trim-ph-o.png`)

The "under-selected" sprite is an isometric tile/platform in the same steel blue. In 3D this becomes a flat ring/disc that rises with the node on selection.

---

## Design Decisions

| Topic | Decision |
|-------|----------|
| Camera | Isometric perspective (fixed angle), WASD pans X/Z |
| Background | Pure black |
| Node color | Unified steel blue `#8FAABB` (uncleared wireframe, cleared solid) |
| Node shape | Corp-specific geometry (see below), faithful to original icons |
| Node animation | No idle; hover/select → node + platform rise slightly on Y |
| Clear state | Wireframe `MeshBasicMaterial` (uncleared) → solid `MeshStandardMaterial` (cleared) |
| Selected highlight | Flat ring/disc rises under node + subtle emissive glow on mesh |
| Edge lines | White/grey `LineBasicMaterial`; inactive = dim, accessible = slightly brighter |
| Nightfall effect | Non-available nodes dimmed (low opacity / dark material) |
| Tooltips | drei `<Html>` component, same content as current |

---

## Corp Geometry Mapping

| Corp | Key | Geometry | Original Icon Feel |
|------|-----|----------|--------------------|
| Pharmhaus | `ph` | `CapsuleGeometry` (tall, narrow) | Chess piece / minaret tower |
| Lucky Monkey | `lmm` | `TorusGeometry` (flat, wide) | Satellite dish |
| Cellular Automata | `car` | `CylinderGeometry` tall + 3× small `SphereGeometry` | CN Tower + globes |
| PED | `ped` | `OctahedronGeometry` (scaled flat on Y) | Hexagonal snowflake slab |
| Dr. Donut | `donut` | `SphereGeometry` (squished) + `TorusGeometry` ring | Lozenge + ring base |
| Disarray HQ | `hq` | `BoxGeometry` cross (2 thin boxes merged) | Cross platform |
| S.M.A.R.T | `smart` | `BoxGeometry` stepped (3 stacked boxes, descending size) | City skyscraper |
| Warez | `warez` | `CylinderGeometry` (squat, wider) | Barrel/tank |

Multi-mesh corps (`car`, `donut`, `smart`) use a `<group>` so they move/rise as one unit.

---

## Coordinate System

```
2D pixel space: X [0–1958], Y [0–1412]
3D world space: x = (pixelX / 10) - 98
               z = (pixelY / 10) - 71
               y = securityLevel * 1.5  (subtle depth, ~1.5–7.5 units)
```

Camera orbits at fixed isometric angle (~35° from horizontal, 45° azimuth). WASD moves camera target on X/Z.

---

## Component Structure

```
Netmap3D.tsx
├── <div className="netmap-container">        ← same class, same DOM overlay structure
│   ├── <Canvas>                              ← r3f, fills container
│   │   ├── <color attach="background" />    ← #000000
│   │   ├── <ambientLight />
│   │   ├── <directionalLight />
│   │   ├── <CameraController />             ← WASD + scrollToPosition
│   │   ├── <NetmapEdges />                  ← all prereq lines
│   │   └── nodes.map → <NetmapNode />       ← one per visible node
│   ├── <div className="top-right-controls"> ← credits + menu (unchanged DOM)
│   ├── arrow divs                           ← mobile arrows (unchanged DOM)
│   └── <CurrentPrograms />                  ← unchanged
```

---

## Key Components

### CameraController
- Uses `useFrame` to apply WASD velocity to camera position each frame
- Exposes `scrollToPosition(pos, duration): Promise<NetmapPosition>` via ref
- Camera follows `cameraTarget [x, z]`; fixed Y=80, fixed look-down angle
- `bindScrollFunction` called in `useEffect` on mount — same contract as current

### NetmapNode
Props: `node`, `position3D`, `status`, `isSelected`, `isNightfallDimmed`, `onClick`

- Selects geometry + material based on corp and status
- `useSpring` (react-spring / r3f) or manual `useFrame` lerp for hover/select Y rise
- Uncleared: `MeshBasicMaterial({ wireframe: true, color: '#8FAABB' })`
- Cleared: `MeshStandardMaterial({ color: '#6A8A9E', emissive: '#2A4A5E' })`
- Invisible/undefined status → `visible={false}`
- Nightfall dimmed: `opacity: 0.15, transparent: true`
- `<Html>` tooltip from drei (same content: org name, node name, sec level)
- Selection platform: 3×3 square grid (matching `under-selected.png`) — 9 `<BoxGeometry>` tiles in a group at y=-0.5, same Y lerp as node, only visible when `isSelected`

### NetmapEdges
- Derives edges from `nodes[].prereq` at render time
- For each edge: `[sourcePos3D, targetPos3D]`
- Accessible edge (target node status !== INVISIBLE and !== undefined): `color: '#aaaaaa', lineWidth: 1.5`
- Inactive edge: `color: '#333333', lineWidth: 1`
- Uses `<Line>` from `@react-three/drei`

### Nightfall
When `nightfallAvailableNodes` is defined, nodes NOT in the list render with dimmed material. No separate overlay plane needed.

---

## Files Changed

| File | Change |
|------|--------|
| `nightfall-src/components/Netmap3D.tsx` | **CREATE** — new main component |
| `nightfall-src/components/Netmap3D.css` | **CREATE** — DOM overlay styles (port from Netmap.css) |
| `nightfall-src/components/App.tsx` | **MODIFY** — swap `<Netmap>` → `<Netmap3D>` in `getNetmap()` |
| `nightfall-src/webpack.config.js` | **MODIFY** — increase `maxAssetSize`/`maxEntrypointSize` to 2MB (three.js ~600KB) |

`Netmap.tsx` and `Netmap.css` stay untouched (kept as fallback until stable).

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| drei/r3f ESM in node_modules not transpiled by ts-loader | Webpack 5 handles ESM natively; drei@8+r3f@7 ship CJS fallbacks |
| `scrollToPosition` Promise contract broken | Test by selecting a node and verifying camera animates and Promise resolves |
| Performance: three.js ~600KB exceeds 512KB webpack hint | Bump `maxAssetSize` to 2MB in webpack config |
| Multi-mesh node groups (car, donut, smart) harder to raycast | Attach `onClick` to group, r3f bubbles events up |
| `<Line>` from drei requires float32 point arrays | Pre-compute `Float32Array` positions at render, not per-frame |

---

## Verification

1. `cd nightfall-src && npm run build` — no errors (warnings OK for bundle size)
2. `npm start` — dev server opens
3. Netmap renders: black bg, 3D nodes visible, edges between them
4. WASD pans camera smoothly
5. Click node → camera animates to it (scrollToPosition contract)
6. Hover node → tooltip appears, node rises slightly
7. Cleared node → solid material (test with S1 which starts as CLEARED)
8. Nightfall effect → non-available nodes dimmed (trigger via game progression or mock prop)
9. Arrow buttons work on mobile viewport
10. Credits display + Menu button visible in overlay
