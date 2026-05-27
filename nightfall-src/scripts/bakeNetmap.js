#!/usr/bin/env node
// Bake static netmap geometry: edge paths (A*) + per-tile owner/sec.
// Run via: npm run bake-netmap (from nightfall-src/).
// Output: nightfall-src/campaign/netmap.baked.ts
//
// Algorithm parity:
//   - tile visibility = NetmapFloor.tsx tileVisible()
//   - sec map = util/netmap3d.ts buildSecMap()
//   - edge routing = NetmapEdges.tsx aStar() + port assignment + ripup
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ts = require("typescript");

const SRC_DIR = path.resolve(__dirname, "..");
const NETMAP_PATH = path.join(SRC_DIR, "campaign/netmap.ts");
const BAKED_PATH = path.join(SRC_DIR, "campaign/netmap.baked.ts");

// Mirrored from util/netmap3d.ts
const SCALE = 10;
const OFFSET_X = 98;
const OFFSET_Z = 71;
const TILE_SIZE = 2.5;
const DEPTH_SCALE = 1.5;

// Mirrored from NetmapFloor.tsx tileVisible() constants
const PLATFORM_R = 2;
const FALLOFF = 8;
const NODE_FLOOR_RADIUS = 3;
const FLOOR_HULL_PAD = 5;

// Mirrored from NetmapEdges.tsx
const PLATFORM_HALF = 1;
const PORT_OUT = 2;
const TURN_PENALTY = 4;
const STEP_COST = 1;
const DIAG_COST = 1.6;
// Penalty for entering a cell whose sec is not one of the edge's endpoint secs.
// Big enough to dominate STEP_COST so A* prefers a longer same-sec detour.
const SEC_PENALTY = 30;

const PORT_OFFSETS = {
  N: [0, -PORT_OUT],
  S: [0, PORT_OUT],
  W: [-PORT_OUT, 0],
  E: [PORT_OUT, 0],
  NE: [PORT_OUT, -PORT_OUT],
  NW: [-PORT_OUT, -PORT_OUT],
  SE: [PORT_OUT, PORT_OUT],
  SW: [-PORT_OUT, PORT_OUT],
};
const ALL_PORTS = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];
const CARDINAL_PORTS = ["N", "S", "E", "W"];
// Donut nodes route on cardinal ports only — no diagonal entry/exit.
const portsFor = (id) => (id.startsWith("donut-") ? CARDINAL_PORTS : ALL_PORTS);

// Per-edge port forcing. Listed edges are routed first; the named fp/tp is
// reserved before remaining edges are greedy-assigned. Either fp or tp may be
// omitted to let A* pick.
// Nodes excluded from bake (no floor tiles, no edges). Useful for overlay/wall
// nodes that share another node's position and shouldn't influence routing.
const BAKE_IGNORE = new Set(["smart-hq-retake"]);

const PORT_OVERRIDES = [
  { from: "ph-prdatabase", to: "car-memorytower", fp: "SE", tp: "SW" },
  { from: "car-memorytower", to: "car-sydney", fp: "W", tp: "SW" },
  { from: "lmm-toy", to: "ped-offshore", fp: "S" },
  { from: "lmm-toy", to: "warez-3", fp: "E" },
  { from: "lmm-toy", to: "tang-cultural-restoration", fp: "N" },
];

// Manual per-cell security-level overrides, applied after the owner/sec pass.
// Use sparingly for spots where the Voronoi sec clashes with a road that brushes
// a higher-sec node ring (road sits a step below the ring it touches).
const SEC_OVERRIDES = [
  // P2->P3 road (sec 3) brushes T5's sec-4 ring; level these cells to the road.
  { col: 43, row: 56, sec: 3 },
  { col: 43, row: 57, sec: 3 },
  { col: 44, row: 57, sec: 3 },
  // L2->C4 road (sec 2) wraps F2's sec-1 ring corner; level the touched cells.
  { col: 20, row: 37, sec: 2 },
  { col: 20, row: 39, sec: 2 },
  { col: 20, row: 40, sec: 2 },
  { col: 21, row: 40, sec: 2 },
];
const SEC_OVERRIDE_MAP = new Map(
  SEC_OVERRIDES.map((o) => [`${o.col},${o.row}`, o.sec])
);

function readSource(p) {
  return fs.readFileSync(p, "utf8");
}

function parseNetmap(src) {
  const sf = ts.createSourceFile(
    "netmap.ts",
    src,
    ts.ScriptTarget.Latest,
    true
  );
  const NodesMap = {};
  const positions = {};
  const nodes = [];

  ts.forEachChild(sf, (stmt) => {
    if (!ts.isVariableStatement(stmt)) return;
    for (const decl of stmt.declarationList.declarations) {
      const name = decl.name.getText();
      const init = decl.initializer;
      if (!init) continue;

      if (name === "Nodes" && ts.isObjectLiteralExpression(init)) {
        for (const p of init.properties) {
          if (!ts.isPropertyAssignment(p)) continue;
          const k = p.name.getText();
          if (ts.isStringLiteral(p.initializer)) {
            NodesMap[k] = p.initializer.text;
          }
        }
      }

      if (name === "positions" && ts.isObjectLiteralExpression(init)) {
        for (const p of init.properties) {
          if (!ts.isPropertyAssignment(p)) continue;
          const txt = p.name.getText();
          const m = txt.match(/^\[Nodes\.(\w+)\]$/);
          if (!m) continue;
          const id = NodesMap[m[1]];
          if (!id) continue;
          if (!ts.isArrayLiteralExpression(p.initializer)) continue;
          const arr = p.initializer.elements;
          if (arr.length !== 2) continue;
          positions[id] = [+arr[0].getText(), +arr[1].getText()];
        }
      }

      if (name === "netmap" && ts.isObjectLiteralExpression(init)) {
        for (const p of init.properties) {
          if (!ts.isPropertyAssignment(p)) continue;
          if (p.name.getText() !== "nodes") continue;
          if (!ts.isArrayLiteralExpression(p.initializer)) continue;
          for (const e of p.initializer.elements) {
            if (!ts.isObjectLiteralExpression(e)) continue;
            let id, securityLevel, prereq;
            for (const np of e.properties) {
              if (!ts.isPropertyAssignment(np)) continue;
              const k = np.name.getText();
              const tx = np.initializer.getText();
              if (k === "id") {
                const mm = tx.match(/^Nodes\.(\w+)$/);
                if (mm) id = NodesMap[mm[1]];
              } else if (k === "securityLevel") {
                securityLevel = +tx;
              } else if (k === "prereq") {
                const mm = tx.match(/^Nodes\.(\w+)$/);
                if (mm) prereq = NodesMap[mm[1]];
              }
            }
            if (id && securityLevel !== undefined) {
              nodes.push({ id, securityLevel, prereq });
            }
          }
        }
      }
    }
  });
  return { Nodes: NodesMap, positions, nodes };
}

function toWorld(pos, secLevel) {
  const x = pos[0] / SCALE - OFFSET_X;
  const z = pos[1] / SCALE - OFFSET_Z;
  const col = Math.floor((x + OFFSET_X) / TILE_SIZE);
  const row = Math.floor((z + OFFSET_Z) / TILE_SIZE);
  return [
    -OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2,
    secLevel * DEPTH_SCALE,
    -OFFSET_Z + row * TILE_SIZE + TILE_SIZE / 2,
  ];
}

function tileForWorld(wx, wz) {
  return [
    Math.floor((wx + OFFSET_X) / TILE_SIZE),
    Math.floor((wz + OFFSET_Z) / TILE_SIZE),
  ];
}

function cellKey(c, r) {
  return c + "," + r;
}

function convexHull(pts) {
  if (pts.length < 3) return pts.slice();
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    )
      inside = !inside;
  }
  return inside;
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const cx = x1 + t * dx,
    cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function distToPoly(px, py, poly) {
  if (pointInPoly(px, py, poly)) return 0;
  let d = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    const ds = distToSeg(px, py, x1, y1, x2, y2);
    if (ds < d) d = ds;
  }
  return d;
}

function tileHash(col, row) {
  let h = (col * 73856093) ^ (row * 19349663);
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return h / 0xffffffff;
}

function buildSecMap(nodeTiles, nodeSec) {
  if (nodeTiles.length === 0) return new Map();
  let mC = Infinity,
    MC = -Infinity,
    mR = Infinity,
    MR = -Infinity;
  for (const [c, r] of nodeTiles) {
    if (c < mC) mC = c;
    if (c > MC) MC = c;
    if (r < mR) mR = r;
    if (r > MR) MR = r;
  }
  const PAD = 20;
  mC -= PAD;
  MC += PAD;
  mR -= PAD;
  MR += PAD;
  const W = MC - mC + 1,
    H = MR - mR + 1;
  let cur = new Int8Array(W * H);
  let next = new Int8Array(W * H);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const col = c + mC,
        row = r + mR;
      let dMin = Infinity,
        sec = 1;
      for (let n = 0; n < nodeTiles.length; n++) {
        const [nc, nr] = nodeTiles[n];
        const d = (col - nc) * (col - nc) + (row - nr) * (row - nr);
        if (d < dMin) {
          dMin = d;
          sec = nodeSec[n];
        }
      }
      cur[r * W + c] = sec;
    }
  }
  for (let iter = 0; iter < 3; iter++) {
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const counts = new Map();
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const cc = c + dc,
              rr = r + dr;
            if (cc < 0 || cc >= W || rr < 0 || rr >= H) continue;
            const s = cur[rr * W + cc];
            counts.set(s, (counts.get(s) ?? 0) + 1);
          }
        }
        let best = cur[r * W + c],
          bestN = -1;
        for (const [s, n] of counts) {
          if (n > bestN || (n === bestN && s === cur[r * W + c])) {
            best = s;
            bestN = n;
          }
        }
        next[r * W + c] = best;
      }
    }
    cur.set(next);
  }
  const m = new Map();
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      m.set(c + mC + "," + (r + mR), cur[r * W + c]);
    }
  }
  return m;
}

function aStar(start, end, blocked, used, fromSec, toSec, secMap) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const stepCosts = [
    STEP_COST,
    STEP_COST,
    STEP_COST,
    STEP_COST,
    DIAG_COST,
    DIAG_COST,
    DIAG_COST,
    DIAG_COST,
  ];
  const open = [];
  const visited = new Map();
  // Octile heuristic — admissible for 8-way grid with diag cost ~sqrt(2).
  const h = (c, r) => {
    const dx = Math.abs(c - end[0]);
    const dy = Math.abs(r - end[1]);
    return Math.max(dx, dy) + (DIAG_COST - STEP_COST) * Math.min(dx, dy);
  };
  const startNode = {
    c: start[0],
    r: start[1],
    dir: -1,
    g: 0,
    f: h(start[0], start[1]),
    parent: null,
  };
  open.push(startNode);
  visited.set(start[0] + "," + start[1] + ",-1", 0);
  let iters = 0;
  const MAX_ITERS = 500000;
  while (open.length) {
    if (++iters > MAX_ITERS) return null;
    let bestI = 0;
    for (let i = 1; i < open.length; i++)
      if (open[i].f < open[bestI].f) bestI = i;
    const cur = open.splice(bestI, 1)[0];
    if (cur.c === end[0] && cur.r === end[1]) {
      const path = [];
      let n = cur;
      while (n) {
        path.unshift([n.c, n.r]);
        n = n.parent;
      }
      return path;
    }
    for (let d = 0; d < 8; d++) {
      const [dc, dr] = dirs[d];
      const nc = cur.c + dc,
        nr = cur.r + dr;
      const k = cellKey(nc, nr);
      const isEnd = nc === end[0] && nr === end[1];
      if (!isEnd && (blocked.has(k) || used.has(k))) continue;
      // Diagonals must not climb to a higher sec level.
      if (d >= 4) {
        const curSec = secMap.get(cellKey(cur.c, cur.r));
        const nextSec = secMap.get(k);
        if (curSec !== undefined && nextSec !== undefined && nextSec > curSec)
          continue;
      }
      const turn = cur.dir !== -1 && cur.dir !== d ? TURN_PENALTY : 0;
      const cellSec = secMap.get(k);
      const secPen =
        !isEnd && cellSec !== undefined && cellSec !== fromSec && cellSec !== toSec
          ? SEC_PENALTY
          : 0;
      const ng = cur.g + stepCosts[d] + turn + secPen;
      const vk = nc + "," + nr + "," + d;
      const prev = visited.get(vk);
      if (prev !== undefined && prev <= ng) continue;
      visited.set(vk, ng);
      open.push({
        c: nc,
        r: nr,
        dir: d,
        g: ng,
        f: ng + h(nc, nr),
        parent: cur,
      });
    }
  }
  return null;
}

function main() {
  const src = readSource(NETMAP_PATH);
  const parsed = parseNetmap(src);
  const positions = parsed.positions;
  const nodeMeta = parsed.nodes.filter((n) => !BAKE_IGNORE.has(n.id));
  console.log(
    `parsed ${nodeMeta.length} nodes, ${Object.keys(positions).length} positions`
  );

  // 1. World tile for each node
  const nodeData = nodeMeta.map((n) => {
    const p = positions[n.id];
    if (!p) throw new Error(`no position for ${n.id}`);
    const w = toWorld(p, n.securityLevel);
    return {
      id: n.id,
      sec: n.securityLevel,
      prereq: n.prereq,
      tile: tileForWorld(w[0], w[2]),
    };
  });
  const nodeTiles = nodeData.map((n) => n.tile);
  const nodeSecArr = nodeData.map((n) => n.sec);

  // 2. Convex hull + allowed tiles + skip (3x3 around nodes)
  const hull = convexHull(nodeTiles);
  const allowed = new Set();
  const skip = new Set();
  let minTileC = Infinity,
    minTileR = Infinity,
    maxTileC = -Infinity,
    maxTileR = -Infinity;
  for (const [c, r] of nodeTiles) {
    if (c < minTileC) minTileC = c;
    if (r < minTileR) minTileR = r;
    if (c > maxTileC) maxTileC = c;
    if (r > maxTileR) maxTileR = r;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        skip.add(`${c + dc},${r + dr}`);
      }
    }
  }
  if (hull.length >= 3) {
    const r0 = Math.floor(minTileR) - FLOOR_HULL_PAD;
    const r1 = Math.ceil(maxTileR) + FLOOR_HULL_PAD;
    const c0 = Math.floor(minTileC) - FLOOR_HULL_PAD;
    const c1 = Math.ceil(maxTileC) + FLOOR_HULL_PAD;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (distToPoly(c + 0.5, r + 0.5, hull) <= FLOOR_HULL_PAD) {
          allowed.add(`${c},${r}`);
        }
      }
    }
  } else {
    for (const [cc, cr] of nodeTiles) {
      for (let dr = -NODE_FLOOR_RADIUS; dr <= NODE_FLOOR_RADIUS; dr++) {
        for (let dc = -NODE_FLOOR_RADIUS; dc <= NODE_FLOOR_RADIUS; dc++) {
          allowed.add(`${cc + dc},${cr + dr}`);
        }
      }
    }
  }

  // 3. Probabilistic + hull-falloff visibility (matches NetmapFloor)
  const visible = new Set();
  for (const k of allowed) {
    if (skip.has(k)) continue;
    const [cs, rs] = k.split(",");
    const c = +cs,
      r = +rs;
    let dPlat = Infinity;
    for (const [nc, nr] of nodeTiles) {
      const d = Math.hypot(c - nc, r - nr);
      if (d < dPlat) dPlat = d;
    }
    if (dPlat <= PLATFORM_R) {
      visible.add(k);
      continue;
    }
    const t = Math.min(1, (dPlat - PLATFORM_R) / FALLOFF);
    const platProb = Math.pow(t, 1.5);
    let hullProb = 0;
    if (hull.length >= 3 && FLOOR_HULL_PAD > 0) {
      const d = distToPoly(c + 0.5, r + 0.5, hull);
      if (d > 0) hullProb = d / FLOOR_HULL_PAD;
    }
    const drop = Math.max(platProb, hullProb);
    if (tileHash(c + 9999, r + 9999) >= drop) visible.add(k);
  }
  // 1x1 hole fill — iterate to fixpoint: filling a hole can give a neighboring
  // hole its 4th orthogonal neighbor, so a single pass leaves residual holes.
  for (;;) {
    const fill = [];
    for (const k of allowed) {
      if (visible.has(k) || skip.has(k)) continue;
      const [cs, rs] = k.split(",");
      const c = +cs,
        r = +rs;
      if (
        visible.has(`${c + 1},${r}`) &&
        visible.has(`${c - 1},${r}`) &&
        visible.has(`${c},${r + 1}`) &&
        visible.has(`${c},${r - 1}`)
      )
        fill.push(k);
    }
    if (!fill.length) break;
    for (const k of fill) visible.add(k);
  }

  // 4. Voronoi sec map + smoothing
  const secMap = buildSecMap(nodeTiles, nodeSecArr);

  // 5. Voronoi nearest-node owner. Base layer only — the final per-tile owner
  // is decided in one priority pass in step 7 (no stamp-order dependence).
  const voronoiOwner = new Map();
  for (const k of visible) {
    const [cs, rs] = k.split(",");
    const c = +cs,
      r = +rs;
    let dMin = Infinity,
      owner = null;
    for (let n = 0; n < nodeData.length; n++) {
      const [nc, nr] = nodeData[n].tile;
      const d = (c - nc) * (c - nc) + (r - nr) * (r - nr);
      if (d < dMin) {
        dMin = d;
        owner = nodeData[n].id;
      }
    }
    if (owner) voronoiOwner.set(k, owner);
  }

  // 6. Prereq edges → A* with port assignment + ripup
  const allEdges = nodeData
    .filter((n) => !!n.prereq)
    .map((n) => ({ from: n.prereq, to: n.id }))
    .filter((e) => {
      const a = nodeData.find((n) => n.id === e.from);
      const b = nodeData.find((n) => n.id === e.to);
      return a && b;
    });
  const tileById = {};
  for (const n of nodeData) tileById[n.id] = n.tile;

  const blocked = new Set();
  for (const n of nodeData) {
    const [cc, cr] = n.tile;
    for (let dr = -PLATFORM_HALF; dr <= PLATFORM_HALF; dr++) {
      for (let dc = -PLATFORM_HALF; dc <= PLATFORM_HALF; dc++) {
        blocked.add(`${cc + dc},${cr + dr}`);
      }
    }
  }

  const overrideFor = (from, to) =>
    PORT_OVERRIDES.find((o) => o.from === from && o.to === to);

  const ordered = allEdges
    .map((e) => {
      const [ac, ar] = tileById[e.from];
      const [bc, br] = tileById[e.to];
      return { ...e, dist: Math.abs(bc - ac) + Math.abs(br - ar) };
    })
    .sort((a, b) => {
      const ao = overrideFor(a.from, a.to) ? 0 : 1;
      const bo = overrideFor(b.from, b.to) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return a.dist - b.dist;
    });

  const used = new Set();
  const usedPorts = {};
  const baked = [];
  const coreCells = new Map(); // 1-wide A* centerline -> edge.to
  const wideCells = new Map(); // 3x3 brush around centerline -> edge.to
  // road cell -> gating node id(s) of every edge painting it (edge.to, the same
  // node that owns un-stolen road cells). Used as vis members so a road cell
  // whose owner was won by a neighbor's ring/core still fills with the rest of
  // its road when the edge is visible — no 3-wide paint holes.
  const roadMembers = new Map();
  // road cell -> security level, only for edges that stay at one level
  // (fromSec === toSec). Those edges paint their whole 3-wide band at the path
  // level instead of the per-cell Voronoi sec, so the road sits flat. Edges
  // that change level keep per-cell sec so the ramp is preserved.
  const roadSec = new Map();
  const nodeSecMap = {};
  for (const n of nodeData) nodeSecMap[n.id] = n.sec;
  for (const edge of ordered) {
    const [ac, ar] = tileById[edge.from];
    const [bc, br] = tileById[edge.to];
    const fromSec = nodeSecMap[edge.from];
    const toSec = nodeSecMap[edge.to];
    const fromUsed = usedPorts[edge.from] || new Set();
    const toUsed = usedPorts[edge.to] || new Set();
    const override = overrideFor(edge.from, edge.to);
    let best = null;
    for (const fp of portsFor(edge.from)) {
      if (fromUsed.has(fp)) continue;
      if (override?.fp && fp !== override.fp) continue;
      const [foc, forr] = PORT_OFFSETS[fp];
      const start = [ac + foc, ar + forr];
      for (const tp of portsFor(edge.to)) {
        if (toUsed.has(tp)) continue;
        if (override?.tp && tp !== override.tp) continue;
        const [toc, torr] = PORT_OFFSETS[tp];
        const end = [bc + toc, br + torr];
        const sk = cellKey(start[0], start[1]);
        const ek = cellKey(end[0], end[1]);
        const sBlocked = blocked.has(sk);
        const eBlocked = blocked.has(ek);
        if (sBlocked) blocked.delete(sk);
        if (eBlocked) blocked.delete(ek);
        const path = aStar(start, end, blocked, used, fromSec, toSec, secMap);
        if (sBlocked) blocked.add(sk);
        if (eBlocked) blocked.add(ek);
        if (!path) continue;
        const cost = path.length;
        if (!best || cost < best.cost) best = { full: path, cost, fp, tp };
      }
    }
    if (!best) {
      console.warn(`no route: ${edge.from} -> ${edge.to}`);
      continue;
    }
    (usedPorts[edge.from] ||= new Set()).add(best.fp);
    (usedPorts[edge.to] ||= new Set()).add(best.tp);
    for (let i = 1; i < best.full.length - 1; i++) {
      const [c, r] = best.full[i];
      used.add(cellKey(c, r));
    }
    const halfOff = (p) => {
      const [oc, or] = PORT_OFFSETS[p];
      return [oc / 2, or / 2];
    };
    const [foc, forr] = halfOff(best.fp);
    const [toc, torr] = halfOff(best.tp);
    const startCap = [ac + foc, ar + forr];
    const endCap = [bc + toc, br + torr];
    const fullPath = [startCap, ...best.full, endCap];
    // Same-level edges sit flat at the path level; level-changing edges follow
    // the per-cell Voronoi sec so they ramp. The edge line uses the same sec as
    // its floor band (below) so the road never bobs over a crossed sec band.
    const flatSec = fromSec === toSec ? fromSec : null;
    const pathWithSec = fullPath.map(([c, r]) => [
      c,
      r,
      flatSec ?? secMap.get(`${c},${r}`) ?? 1,
    ]);
    baked.push({ from: edge.from, to: edge.to, path: pathWithSec });

    // Record this edge's floor cells for the final owner pass: the 1-wide
    // A* centerline (core) plus a 3x3-brush widening for a 3-wide road.
    for (const [c, r] of best.full) {
      coreCells.set(`${c},${r}`, edge.to);
      // The 3-wide brush takes its centerline cell's sec so the band always
      // matches the road tile it surrounds: flat for same-level edges, ramping
      // with the centerline for level-changing ones — never a Voronoi step
      // across the road's width.
      const cellSec = flatSec ?? (secMap.get(`${c},${r}`) ?? 1);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const k = `${c + dc},${r + dr}`;
          wideCells.set(k, edge.to);
          if (!roadMembers.has(k)) roadMembers.set(k, new Set());
          roadMembers.get(k).add(edge.to);
          roadSec.set(k, cellSec);
        }
      }
    }
  }

  // 6b. Per-node 5x5 ring (outer ring only; inner 3x3 platform skipped).
  // ringOwner: last-write-wins, drives tile owner/color priority.
  // ringMembers: ALL nodes whose ring covers a cell — used so a shared border
  // cell stays visible when any encircling node is revealed (ring no longer
  // gaps toward a still-hidden neighbor that happened to win ownership).
  const ringOwner = new Map();
  const ringMembers = new Map();
  for (const n of nodeData) {
    const [cc, cr] = n.tile;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) continue;
        const k = `${cc + dc},${cr + dr}`;
        ringOwner.set(k, n.id);
        if (!ringMembers.has(k)) ringMembers.set(k, []);
        ringMembers.get(k).push(n.id);
      }
    }
  }

  // 7. Decide each tile's owner once, by priority — no stamp-order deps:
  //   edge core path > node ring > edge widening > Voronoi fill.
  // Core beats ring so a road never breaks where it crosses a foreign node's
  // ring; ring beats widening so the road narrows to its 1-wide centerline
  // through that ring rather than biting a 3-wide hole in it.
  const allCells = new Set([
    ...coreCells.keys(),
    ...ringOwner.keys(),
    ...wideCells.keys(),
    ...voronoiOwner.keys(),
  ]);
  const bakedTiles = [];
  for (const k of allCells) {
    // Never emit a floor tile inside a node's 3x3 platform: the node platform
    // occupies that space, so a road/neighbor-ring tile there z-fights it.
    if (skip.has(k)) continue;
    const coreO = coreCells.get(k);
    const ringO = ringOwner.get(k);
    const wideO = wideCells.get(k);
    const owner = coreO ?? ringO ?? wideO ?? voronoiOwner.get(k);
    if (!owner) continue;
    const [cs, rs] = k.split(",");
    // Road-owned tile (core won, or wide won with no ring above it) on a flat
    // same-level edge takes the path level so the band sits flat; all else uses
    // the per-cell Voronoi sec.
    const roadOwned = coreO !== undefined || (ringO === undefined && wideO !== undefined);
    const sec =
      SEC_OVERRIDE_MAP.get(k) ??
      (roadOwned && roadSec.has(k) ? roadSec.get(k) : (secMap.get(k) ?? 1));
    const tile = { col: +cs, row: +rs, owner, sec };
    // Extra visibility members beyond the priority-winning owner:
    //  - ring cells: every encircling node (ring stays whole if any revealed)
    //  - road cells: the painting edge's endpoints (3-wide paint fills whenever
    //    the edge is visible, even where a neighbor's ring/core won the cell)
    const ringMem = ringMembers.get(k) || [];
    const roadMem = roadMembers.has(k) ? [...roadMembers.get(k)] : [];
    if (ringMem.length || roadMem.length) {
      const extra = [...new Set([...ringMem, ...roadMem])].filter((m) => m !== owner);
      if (extra.length) tile.vis = extra;
    }
    bakedTiles.push(tile);
  }
  bakedTiles.sort((a, b) => a.row - b.row || a.col - b.col);

  // 8. Source hash for build-time staleness guard
  const hash = crypto.createHash("sha256").update(src).digest("hex").slice(0, 16);

  // 9. Compact serialization. Intern owner strings, run-length encode tiles
  // by row, flatten edge paths. The decoders emitted below rebuild the exact
  // same runtime shape, so consumers (NetmapFloor / NetmapEdges) are unchanged.
  const ownerList = [
    ...new Set([
      ...bakedTiles.map((t) => t.owner),
      ...bakedTiles.flatMap((t) => t.vis ?? []),
      ...baked.flatMap((e) => [e.from, e.to]),
    ]),
  ].sort();
  const ownerIdx = new Map(ownerList.map((o, i) => [o, i]));

  // Extra-visibility members for shared ring cells: [col, row, ...ownerIdx].
  const tileVis = bakedTiles
    .filter((t) => t.vis)
    .map((t) => [t.col, t.row, ...t.vis.map((o) => ownerIdx.get(o))]);

  // Tiles (sorted row-major) → [row, (col0, len, ownerIdx, sec) ...]: runs of
  // contiguous cells sharing owner + sec.
  const tileRows = [];
  let curRow = null;
  let runs = null;
  let run = null; // [col0, len, ownerIdx, sec]
  const flushRun = () => {
    if (run) runs.push(...run);
    run = null;
  };
  const flushRow = () => {
    flushRun();
    if (runs) tileRows.push([curRow, ...runs]);
  };
  for (const t of bakedTiles) {
    const oi = ownerIdx.get(t.owner);
    if (t.row !== curRow) {
      flushRow();
      curRow = t.row;
      runs = [];
    }
    if (run && run[0] + run[1] === t.col && run[2] === oi && run[3] === t.sec) {
      run[1] += 1;
    } else {
      flushRun();
      run = [t.col, 1, oi, t.sec];
    }
  }
  flushRow();

  // Edges → [fromIdx, toIdx, (col, row, sec) ...].
  const edgeData = baked.map((e) => [
    ownerIdx.get(e.from),
    ownerIdx.get(e.to),
    ...e.path.flatMap((c) => [c[0], c[1], c[2]]),
  ]);

  const out = [
    "// GENERATED by scripts/bakeNetmap.js — DO NOT EDIT.",
    "// Re-run via: npm run bake-netmap",
    `// Source hash: ${hash}`,
    "",
    `export const NETMAP_SOURCE_HASH = ${JSON.stringify(hash)};`,
    "",
    "export interface BakedEdge {",
    "  from: string;",
    "  to: string;",
    "  // path cells: [col, row, sec] — sec from Voronoi+smooth, for Y lookup.",
    "  path: ReadonlyArray<readonly [number, number, number]>;",
    "}",
    "",
    "export interface BakedTile {",
    "  col: number;",
    "  row: number;",
    "  owner: string;",
    "  sec: number;",
    "  // Ring tiles only: extra node ids that also make this tile visible when",
    "  // revealed (shared ring borders; keeps a ring whole past a hidden neighbor).",
    "  vis?: string[];",
    "}",
    "",
    `const OWNERS: ReadonlyArray<string> = ${JSON.stringify(ownerList)};`,
    "",
    "// Tiles, run-length encoded per row: [row, (col0, len, ownerIdx, sec) ...].",
    "const TILE_ROWS: ReadonlyArray<ReadonlyArray<number>> = [",
    ...tileRows.map((r) => `  [${r.join(",")}],`),
    "];",
    "",
    "// Shared ring cells with extra visibility members: [col, row, ...ownerIdx].",
    "const TILE_VIS: ReadonlyArray<ReadonlyArray<number>> = [",
    ...tileVis.map((r) => `  [${r.join(",")}],`),
    "];",
    "",
    "// Edges flattened: [fromIdx, toIdx, (col, row, sec) ...].",
    "const EDGE_DATA: ReadonlyArray<ReadonlyArray<number>> = [",
    ...edgeData.map((e) => `  [${e.join(",")}],`),
    "];",
    "",
    "function decodeTiles(): BakedTile[] {",
    "  const tiles: BakedTile[] = [];",
    "  for (const r of TILE_ROWS) {",
    "    const row = r[0];",
    "    for (let i = 1; i < r.length; i += 4) {",
    "      const c0 = r[i], len = r[i + 1], owner = OWNERS[r[i + 2]], sec = r[i + 3];",
    "      for (let c = c0; c < c0 + len; c += 1) tiles.push({ col: c, row, owner, sec });",
    "    }",
    "  }",
    "  const visByCell = new Map<string, string[]>();",
    "  for (const v of TILE_VIS) {",
    "    const members: string[] = [];",
    "    for (let i = 2; i < v.length; i += 1) members.push(OWNERS[v[i]]);",
    "    visByCell.set(`${v[0]},${v[1]}`, members);",
    "  }",
    "  for (const t of tiles) {",
    "    const v = visByCell.get(`${t.col},${t.row}`);",
    "    if (v) t.vis = v;",
    "  }",
    "  return tiles;",
    "}",
    "",
    "function decodeEdges(): BakedEdge[] {",
    "  return EDGE_DATA.map((e) => {",
    "    const path: Array<readonly [number, number, number]> = [];",
    "    for (let i = 2; i < e.length; i += 3) path.push([e[i], e[i + 1], e[i + 2]] as const);",
    "    return { from: OWNERS[e[0]], to: OWNERS[e[1]], path };",
    "  });",
    "}",
    "",
    "export const BAKED_EDGES: ReadonlyArray<BakedEdge> = decodeEdges();",
    "export const BAKED_TILES: ReadonlyArray<BakedTile> = decodeTiles();",
    "",
  ].join("\n");

  fs.writeFileSync(BAKED_PATH, out);
  console.log(
    `wrote ${path.relative(process.cwd(), BAKED_PATH)}: ${baked.length} edges, ${bakedTiles.length} tiles, hash ${hash}`
  );
}

main();
