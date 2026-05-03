import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { TILE_SIZE, SCALE, OFFSET_X, OFFSET_Z } from "../../util/netmap3d";

const MAP_PX_W = 1958;
const MAP_PX_H = 1412;
export const FLOOR_Y = -0.5;

const worldW = MAP_PX_W / SCALE;
const worldH = MAP_PX_H / SCALE;
const BASE_COLS = Math.ceil(worldW / TILE_SIZE);
const BASE_ROWS = Math.ceil(worldH / TILE_SIZE);
const START_X = -OFFSET_X;
const START_Z = -OFFSET_Z;

export const FLOOR_TILE_MAT = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.05,
  roughness: 0.8,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
export const FLOOR_EDGE_MAT = new THREE.LineBasicMaterial({ color: 0xc8d8ec });
export const FLOOR_TILE_GEO = new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE);

const COLUMN_HEIGHT = 30;
export const FLOOR_COLUMN_GEO = new THREE.BoxGeometry(TILE_SIZE, COLUMN_HEIGHT, TILE_SIZE);
FLOOR_COLUMN_GEO.translate(0, -COLUMN_HEIGHT / 2, 0);
export const FLOOR_TOP_GEO = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
FLOOR_TOP_GEO.rotateX(-Math.PI / 2);

const TILE_GAP_FRAC = 0.02;
const FRAME_INSET = TILE_SIZE * (1 - TILE_GAP_FRAC);
const _frameOuter = new THREE.Shape();
_frameOuter.moveTo(-TILE_SIZE / 2, -TILE_SIZE / 2);
_frameOuter.lineTo(TILE_SIZE / 2, -TILE_SIZE / 2);
_frameOuter.lineTo(TILE_SIZE / 2, TILE_SIZE / 2);
_frameOuter.lineTo(-TILE_SIZE / 2, TILE_SIZE / 2);
_frameOuter.lineTo(-TILE_SIZE / 2, -TILE_SIZE / 2);
const _frameHole = new THREE.Path();
_frameHole.moveTo(-FRAME_INSET / 2, -FRAME_INSET / 2);
_frameHole.lineTo(FRAME_INSET / 2, -FRAME_INSET / 2);
_frameHole.lineTo(FRAME_INSET / 2, FRAME_INSET / 2);
_frameHole.lineTo(-FRAME_INSET / 2, FRAME_INSET / 2);
_frameHole.lineTo(-FRAME_INSET / 2, -FRAME_INSET / 2);
_frameOuter.holes.push(_frameHole);
export const FLOOR_FRAME_GEO = new THREE.ShapeGeometry(_frameOuter);
FLOOR_FRAME_GEO.rotateX(-Math.PI / 2);
export const FLOOR_FRAME_MAT = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1,
});

const NODE_FLOOR_RADIUS = 3;

function convexHull(pts: [number, number][]): [number, number][] {
  if (pts.length < 3) return pts.slice();
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

function pointInPoly(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function distToPoly(px: number, py: number, poly: [number, number][]): number {
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

function tileHash(col: number, row: number): number {
  let h = (col * 73856093) ^ (row * 19349663);
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return h / 0xffffffff;
}

interface NetmapFloorProps {
  nodePositions?: [number, number][];
  nodeSecurityLevels?: number[];
  extraTiles?: ([number, number] | [number, number, number])[];
}

export const SEC_HEIGHT_STEP = 1.2;
export const SEC_PALETTE: number[] = [
  0xc0c0c0, // 1 — light gray
  0xb0b0b0, // 2
  0xa0a0a0, // 3
  0x909090, // 4
  0x808080, // 5
];
export const SEC_COLOR_DEFAULT = 0x555555;
export function secColor(level: number): number {
  return SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, level - 1))] ?? SEC_COLOR_DEFAULT;
}

export default function NetmapFloor({ nodePositions = [], nodeSecurityLevels = [], extraTiles = [] }: NetmapFloorProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const zero = useMemo(() => {
    const o = new THREE.Object3D();
    o.scale.set(0, 0, 0);
    o.updateMatrix();
    return o.matrix.clone();
  }, []);

  const { allowed, skip, forced, forcedSec, minCol, minRow, cols, rows, nodeTiles, nodeSec, hullData } = useMemo(() => {
    const a = new Set<string>();
    const s = new Set<string>();
    const nt: [number, number][] = [];
    const ns: number[] = [];
    let maxCol = BASE_COLS - 1, maxRow = BASE_ROWS - 1;
    let minC = 0, minR = 0;
    let minTileC = Infinity, minTileR = Infinity, maxTileC = -Infinity, maxTileR = -Infinity;
    for (let idx = 0; idx < nodePositions.length; idx++) {
      const [x, z] = nodePositions[idx];
      const cc = Math.floor((x - START_X) / TILE_SIZE);
      const cr = Math.floor((z - START_Z) / TILE_SIZE);
      nt.push([cc, cr]);
      ns.push(nodeSecurityLevels[idx] ?? 1);
      if (cc < minTileC) minTileC = cc;
      if (cr < minTileR) minTileR = cr;
      if (cc > maxTileC) maxTileC = cc;
      if (cr > maxTileR) maxTileR = cr;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          s.add(`${cc + dc},${cr + dr}`);
        }
      }
    }
    // Convex hull fill of node tiles, dilated by `pad` tiles in all directions.
    const hull = convexHull(nt);
    const pad = 5;
    if (hull.length >= 3) {
      const r0 = Math.floor(minTileR) - pad;
      const r1 = Math.ceil(maxTileR) + pad;
      const c0 = Math.floor(minTileC) - pad;
      const c1 = Math.ceil(maxTileC) + pad;
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (distToPoly(c + 0.5, r + 0.5, hull) <= pad) {
            a.add(`${c},${r}`);
            if (c > maxCol) maxCol = c;
            if (r > maxRow) maxRow = r;
            if (c < minC) minC = c;
            if (r < minR) minR = r;
          }
        }
      }
    } else {
      // Fallback per-node radius
      for (const [cc, cr] of nt) {
        for (let dr = -NODE_FLOOR_RADIUS; dr <= NODE_FLOOR_RADIUS; dr++) {
          for (let dc = -NODE_FLOOR_RADIUS; dc <= NODE_FLOOR_RADIUS; dc++) {
            a.add(`${cc + dc},${cr + dr}`);
            if (cc + dc > maxCol) maxCol = cc + dc;
            if (cr + dr > maxRow) maxRow = cr + dr;
          }
        }
      }
    }
    const f = new Set<string>();
    const fs = new Map<string, number>();
    for (const t of extraTiles) {
      const c = t[0], r = t[1];
      const k = `${c},${r}`;
      a.add(k);
      if (t.length === 3 && t[2] !== undefined) {
        f.add(k);
        s.delete(k);
        fs.set(k, t[2]);
      }
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
      if (c < minC) minC = c;
      if (r < minR) minR = r;
    }
    return { allowed: a, skip: s, forced: f, forcedSec: fs, minCol: minC, minRow: minR, cols: maxCol - minC + 1, rows: maxRow - minR + 1, nodeTiles: nt, nodeSec: ns, hullData: { hull, pad } };
  }, [nodePositions, nodeSecurityLevels, extraTiles]);

  const tileVisible = useMemo(() => {
    const PLATFORM_R = 2;
    const FALLOFF = 8;
    const visible = new Set<string>();
    for (const k of allowed) {
      if (skip.has(k)) continue;
      if (forced.has(k)) { visible.add(k); continue; }
      const [cs, rs] = k.split(",");
      const c = +cs, r = +rs;
      let dPlat = Infinity;
      for (const [nc, nr] of nodeTiles) {
        const d = Math.hypot(c - nc, r - nr);
        if (d < dPlat) dPlat = d;
      }
      if (dPlat <= PLATFORM_R) { visible.add(k); continue; }
      const t = Math.min(1, (dPlat - PLATFORM_R) / FALLOFF);
      const platProb = Math.pow(t, 1.5);
      const { hull, pad } = hullData;
      let hullProb = 0;
      if (hull.length >= 3 && pad > 0) {
        const d = distToPoly(c + 0.5, r + 0.5, hull);
        if (d > 0) hullProb = d / pad;
      }
      const drop = Math.max(platProb, hullProb);
      if (tileHash(c + 9999, r + 9999) >= drop) visible.add(k);
    }
    // Fill 1x1 holes: invisible cell whose 4 cardinal neighbors are all visible.
    const fill: string[] = [];
    for (const k of allowed) {
      if (visible.has(k) || skip.has(k)) continue;
      const [cs, rs] = k.split(",");
      const c = +cs, r = +rs;
      if (
        visible.has(`${c + 1},${r}`) &&
        visible.has(`${c - 1},${r}`) &&
        visible.has(`${c},${r + 1}`) &&
        visible.has(`${c},${r - 1}`)
      ) fill.push(k);
    }
    for (const k of fill) visible.add(k);
    return (col: number, row: number) => visible.has(`${col},${row}`);
  }, [hullData, nodeTiles, allowed, skip, forced]);

  const secMap = useMemo(() => {
    if (nodeTiles.length === 0) return new Map<string, number>();
    let mC = Infinity, MC = -Infinity, mR = Infinity, MR = -Infinity;
    for (const [c, r] of nodeTiles) {
      if (c < mC) mC = c; if (c > MC) MC = c;
      if (r < mR) mR = r; if (r > MR) MR = r;
    }
    const PAD = 20;
    mC -= PAD; MC += PAD; mR -= PAD; MR += PAD;
    const W = MC - mC + 1, H = MR - mR + 1;
    const cur = new Int8Array(W * H);
    const next = new Int8Array(W * H);
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const col = c + mC, row = r + mR;
        let dMin = Infinity, sec = 1;
        for (let n = 0; n < nodeTiles.length; n++) {
          const [nc, nr] = nodeTiles[n];
          const d = (col - nc) * (col - nc) + (row - nr) * (row - nr);
          if (d < dMin) { dMin = d; sec = nodeSec[n]; }
        }
        cur[r * W + c] = sec;
      }
    }
    // Majority smoothing — 3 iterations to straighten jagged Voronoi borders.
    for (let iter = 0; iter < 3; iter++) {
      for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
          const counts = new Map<number, number>();
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const cc = c + dc, rr = r + dr;
              if (cc < 0 || cc >= W || rr < 0 || rr >= H) continue;
              const s = cur[rr * W + cc];
              counts.set(s, (counts.get(s) ?? 0) + 1);
            }
          }
          let best = cur[r * W + c], bestN = -1;
          for (const [s, n] of counts) {
            if (n > bestN || (n === bestN && s === cur[r * W + c])) { best = s; bestN = n; }
          }
          next[r * W + c] = best;
        }
      }
      cur.set(next);
    }
    const m = new Map<string, number>();
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        m.set(`${c + mC},${r + mR}`, cur[r * W + c]);
      }
    }
    return m;
  }, [nodeTiles, nodeSec]);

  const tileSec = useMemo(() => (col: number, row: number) => {
    const k = `${col},${row}`;
    const fs = forcedSec.get(k);
    if (fs !== undefined) return fs;
    return secMap.get(k) ?? 1;
  }, [secMap, forcedSec]);

  const tileY = useMemo(() => (col: number, row: number) => {
    return (tileSec(col, row) - 1) * SEC_HEIGHT_STEP;
  }, [tileSec]);

  const tmpColor = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    const mesh = meshRef.current;
    const frame = frameRef.current;
    if (!mesh) return;
    let i = 0;
    for (let dr = 0; dr < rows; dr++) {
      for (let dc = 0; dc < cols; dc++) {
        const col = minCol + dc;
        const row = minRow + dr;
        const k = `${col},${row}`;
        if (!allowed.has(k) || skip.has(k) || !tileVisible(col, row)) {
          mesh.setMatrixAt(i, zero);
          mesh.setColorAt(i, tmpColor.set(SEC_COLOR_DEFAULT));
          if (frame) frame.setMatrixAt(i, zero);
          i++;
          continue;
        }
        const px = START_X + col * TILE_SIZE + TILE_SIZE / 2;
        const py = tileY(col, row);
        const pz = START_Z + row * TILE_SIZE + TILE_SIZE / 2;
        dummy.position.set(px, py, pz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        const secNearest = tileSec(col, row);
        const hex = SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, secNearest - 1))] ?? SEC_COLOR_DEFAULT;
        mesh.setColorAt(i, tmpColor.set(hex));
        if (frame) {
          dummy.position.set(px, py + 0.001, pz);
          dummy.updateMatrix();
          frame.setMatrixAt(i, dummy.matrix);
        }
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (frame) frame.instanceMatrix.needsUpdate = true;
  }, [dummy, allowed, skip, zero, minCol, minRow, cols, rows, tileY, nodeTiles, nodeSec, tmpColor, tileVisible, tileSec]);

  return (
    <group position={[0, FLOOR_Y, 0]}>
      <instancedMesh ref={meshRef} args={[FLOOR_COLUMN_GEO, FLOOR_TILE_MAT, cols * rows]} key={`col-${cols}x${rows}`} receiveShadow />
      <instancedMesh ref={frameRef} args={[FLOOR_FRAME_GEO, FLOOR_FRAME_MAT, cols * rows]} key={`frame-${cols}x${rows}`} renderOrder={1} />
    </group>
  );
}
