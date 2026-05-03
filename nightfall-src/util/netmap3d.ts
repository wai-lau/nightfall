import { NetmapPosition } from "../types";

export const SCALE = 10;
export const OFFSET_X = 98;
export const OFFSET_Z = 71;
export const DEPTH_SCALE = 1.5;

export const TILE_SIZE = 2.5;

export function toWorld(pos: NetmapPosition, secLevel: number): [number, number, number] {
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

export function pixelToWorldXZ(px: number, pz: number): [number, number] {
  return [px / SCALE - OFFSET_X, pz / SCALE - OFFSET_Z];
}

// Build smoothed sec map matching NetmapFloor: per-cell sec via Voronoi nearest +
// 3 iterations of 3x3 majority smoothing. Returns Map<"col,row", sec>.
export function buildSecMap(nodeTiles: [number, number][], nodeSec: number[]): Map<string, number> {
  if (nodeTiles.length === 0) return new Map();
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
}
