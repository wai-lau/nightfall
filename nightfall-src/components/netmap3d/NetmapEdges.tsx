import React, { createContext, useContext, useMemo, useRef } from "react";
import { Line as DreiLine } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Line = DreiLine as unknown as React.ForwardRefExoticComponent<
  {
    points: [number, number, number][];
    color?: string;
    lineWidth?: number;
  } & React.RefAttributes<{ geometry: { setPositions: (a: number[] | Float32Array) => void } }>
>;
import { INetmap, NodeStatus } from "../../types";
import { TILE_SIZE, OFFSET_X, OFFSET_Z, buildSecMap } from "../../util/netmap3d";
import { FLOOR_Y, SEC_HEIGHT_STEP } from "./NetmapFloor";

export const PlatformYContext = createContext<Map<string, { current: number }>>(new Map());
export const NodeFootprintContext = createContext<Map<string, { current: { halfX: number; halfZ: number } }>>(new Map());

const FOOTPRINT_DEFAULT = 0;

interface NetmapEdgesProps {
  nodes: INetmap["nodes"];
  positions: INetmap["positions"];
  netmapStatus: { [id: string]: NodeStatus };
  playerSecurityLevel: number;
}

const EDGE_Y_OFFSET = 0.03;

// 'x' = X-first: corner at (to.x, from.z)
// 'z' = Z-first: corner at (from.x, to.z)
export const CORNER: Record<string, "x" | "z"> = {
  // S1 root connections (not in prereqs)
  "smart-hq->warez-1":            "z",
  "smart-hq->lmm-techsupport":    "z",
  // smart-hq->ph-prdatabase is straight (same Z)

  // Level 1
  "ph-prdatabase->ph-employee":    "x",
  "ph-prdatabase->car-memorytower":"x",
  "car-memorytower->ph-govaffairs":"x",
  "car-memorytower->car-sydney":   "z",
  "car-memorytower->lmm-eastern":  "z",
  "lmm-techsupport->lmm-clubcenter":"x",

  // Level 2
  "lmm-clubcenter->car-inventory": "z",
  "car-inventory->warez-2":        "x",
  "lmm-clubcenter->car-commshub":  "x",
  "car-commshub->lmm-print":       "z",
  "lmm-print->lmm-banane":         "x",
  "car-commshub->donut-supply":    "x",
  "donut-supply->donut-franchise": "x",
  "lmm-eastern->ph-clinical":      "x",

  // Level 3
  "ph-clinical->lmm-toy":          "x",
  "lmm-toy->warez-3":              "x",
  "lmm-toy->ped-offshore":         "x",
  "ped-offshore->ph-vaccine":      "x",
  "ph-vaccine->ph-hmo":            "x",
  "donut-franchise->donut-market": "x",
  "donut-market->donut-beverage":  "z",
  "donut-market->donut-flavor":    "z",
  "donut-market->lmm-jungle":      "x",
  "donut-franchise->ped-fiduciary":"x",
  "ped-fiduciary->car-substation": "z",
  "car-substation->car-archives":  "z",
  "ped-fiduciary->ped-reinsurance":"x",

  // Level 4
  "donut-beverage->lmm-assimilation":"x",
  "lmm-assimilation->warez-4":     "x",
  "lmm-assimilation->donut-recipe":"x",
  "donut-recipe->lmm-film":        "z",
  "donut-recipe->ped-rdbackup":    "x",
  "ped-rdbackup->ph-syscore":      "z",
  "ph-syscore->ped-executive":     "z",
  "ped-executive->ped-treasury":   "z",
  "ped-treasury->ped-privileged":  "z",
  "ped-treasury->ph-proprietary":  "z",

  // Level 5
  "ph-syscore->disarray-hq":       "x",
};

export type VisualEdge = { from: string; to: string };

export const EXTRA_EDGES: VisualEdge[] = [
  { from: "smart-hq", to: "warez-1" },
  { from: "smart-hq", to: "lmm-techsupport" },
  { from: "smart-hq", to: "ph-prdatabase" },
];

// Cell-grid orthogonal A* router with port assignment + ripup/reroute.
// Platforms occupy 3x3 cells around node tile. Ports = cardinal cells just outside platform.
// Sequential routing: each routed edge marks cells as occupied (hard block for next edges, except endpoints).
const PLATFORM_HALF = 1;     // 3x3 platform = center ± 1
const PORT_OUT = 2;          // port cells = center ± 2 in cardinal axis
const TURN_PENALTY = 4;
const STEP_COST = 1;

type Cell = [number, number];
type Port = "N" | "S" | "E" | "W";
const PORT_OFFSETS: Record<Port, Cell> = {
  N: [0, -PORT_OUT],
  S: [0, PORT_OUT],
  W: [-PORT_OUT, 0],
  E: [PORT_OUT, 0],
};
const ALL_PORTS: Port[] = ["N", "S", "E", "W"];

const cellKey = (c: number, r: number) => `${c},${r}`;
const tileForPos = (pos: [number, number]): Cell => {
  const x = pos[0] / 10 - OFFSET_X;
  const z = pos[1] / 10 - OFFSET_Z;
  return [Math.floor((x + OFFSET_X) / TILE_SIZE), Math.floor((z + OFFSET_Z) / TILE_SIZE)];
};
const cellToWorld = (c: number, r: number): [number, number] => [
  -OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2,
  -OFFSET_Z + r * TILE_SIZE + TILE_SIZE / 2,
];

function aStar(
  start: Cell,
  end: Cell,
  blocked: Set<string>,
  used: Set<string>,
): Cell[] | null {
  // 4-neighbor A* with turn penalty + used-cell hard block. Direction tracked per state.
  type Node = { c: number; r: number; dir: number; g: number; f: number; parent: Node | null };
  const dirs: Cell[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const open: Node[] = [];
  const visited = new Map<string, number>();
  const h = (c: number, r: number) => Math.abs(c - end[0]) + Math.abs(r - end[1]);
  const startNode: Node = { c: start[0], r: start[1], dir: -1, g: 0, f: h(start[0], start[1]), parent: null };
  open.push(startNode);
  visited.set(`${start[0]},${start[1]},-1`, 0);
  while (open.length) {
    let bestI = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bestI].f) bestI = i;
    const cur = open.splice(bestI, 1)[0];
    if (cur.c === end[0] && cur.r === end[1]) {
      const path: Cell[] = [];
      let n: Node | null = cur;
      while (n) { path.unshift([n.c, n.r]); n = n.parent; }
      return path;
    }
    for (let d = 0; d < 4; d++) {
      const [dc, dr] = dirs[d];
      const nc = cur.c + dc, nr = cur.r + dr;
      const k = cellKey(nc, nr);
      const isEnd = nc === end[0] && nr === end[1];
      if (!isEnd && (blocked.has(k) || used.has(k))) continue;
      const turn = cur.dir !== -1 && cur.dir !== d ? TURN_PENALTY : 0;
      const ng = cur.g + STEP_COST + turn;
      const vk = `${nc},${nr},${d}`;
      const prev = visited.get(vk);
      if (prev !== undefined && prev <= ng) continue;
      visited.set(vk, ng);
      open.push({ c: nc, r: nr, dir: d, g: ng, f: ng + h(nc, nr), parent: cur });
    }
  }
  return null;
}

function compressPath(path: Cell[]): Cell[] {
  if (path.length <= 2) return path;
  const out: Cell[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const [px, py] = path[i - 1];
    const [cx, cy] = path[i];
    const [nx, ny] = path[i + 1];
    const d1 = [cx - px, cy - py];
    const d2 = [nx - cx, ny - cy];
    if (d1[0] !== d2[0] || d1[1] !== d2[1]) out.push(path[i]);
  }
  out.push(path[path.length - 1]);
  return out;
}

export interface EdgeRoute {
  from: string;
  to: string;
  path: Cell[];
  fromCenter: Cell;
  toCenter: Cell;
  render: boolean;
}

export function computeEdgeRoutes(
  nodes: INetmap["nodes"],
  positions: INetmap["positions"],
  netmapStatus: { [id: string]: NodeStatus }
): EdgeRoute[] {
  const prereqEdges: VisualEdge[] = nodes
    .filter(n => !!n.prereq)
    .map(n => ({ from: n.prereq!, to: n.id }));

  const allEdges = [...EXTRA_EDGES, ...prereqEdges];

  const nodeTile: Record<string, Cell> = {};
  for (const id of Object.keys(positions)) {
    nodeTile[id] = tileForPos(positions[id]);
  }

  const blocked = new Set<string>();
  for (const id of Object.keys(nodeTile)) {
    const [cc, cr] = nodeTile[id];
    for (let dr = -PLATFORM_HALF; dr <= PLATFORM_HALF; dr++) {
      for (let dc = -PLATFORM_HALF; dc <= PLATFORM_HALF; dc++) {
        blocked.add(cellKey(cc + dc, cr + dr));
      }
    }
  }

  const ordered = allEdges
    .filter(e => positions[e.from] && positions[e.to])
    .map(e => {
      const [ac, ar] = nodeTile[e.from];
      const [bc, br] = nodeTile[e.to];
      return { ...e, dist: Math.abs(bc - ac) + Math.abs(br - ar) };
    })
    .sort((a, b) => a.dist - b.dist);

  const used = new Set<string>();
  const out: EdgeRoute[] = [];

  for (const edge of ordered) {
    const [ac, ar] = nodeTile[edge.from];
    const [bc, br] = nodeTile[edge.to];
    let best: { full: Cell[]; compressed: Cell[]; cost: number; fp: Port; tp: Port } | null = null;
    for (const fp of ALL_PORTS) {
      const [foc, forr] = PORT_OFFSETS[fp];
      const start: Cell = [ac + foc, ar + forr];
      for (const tp of ALL_PORTS) {
        const [toc, torr] = PORT_OFFSETS[tp];
        const end: Cell = [bc + toc, br + torr];
        const sk = cellKey(start[0], start[1]);
        const ek = cellKey(end[0], end[1]);
        const sBlocked = blocked.has(sk);
        const eBlocked = blocked.has(ek);
        if (sBlocked) blocked.delete(sk);
        if (eBlocked) blocked.delete(ek);
        const path = aStar(start, end, blocked, used);
        if (sBlocked) blocked.add(sk);
        if (eBlocked) blocked.add(ek);
        if (!path) continue;
        const compressed = compressPath(path);
        const cost = path.length + compressed.length * 3;
        if (!best || cost < best.cost) {
          best = { full: path, compressed, cost, fp, tp };
        }
      }
    }
    if (!best) continue;
    for (let i = 1; i < best.full.length - 1; i++) {
      const [c, r] = best.full[i];
      used.add(cellKey(c, r));
    }
    const halfOff = (p: Port): Cell => {
      const [oc, or] = PORT_OFFSETS[p];
      return [oc / 2, or / 2];
    };
    const [foc, forr] = halfOff(best.fp);
    const [toc, torr] = halfOff(best.tp);
    const startCap: Cell = [ac + foc, ar + forr];
    const endCap: Cell = [bc + toc, br + torr];
    const fullPath: Cell[] = [startCap, ...best.full, endCap];
    out.push({ from: edge.from, to: edge.to, path: fullPath, fromCenter: [ac, ar], toCenter: [bc, br], render: false });
  }

  const visibleSet = new Set<string>();
  for (const id of Object.keys(positions)) {
    if (netmapStatus[id] !== undefined && netmapStatus[id] !== NodeStatus.INVISIBLE) visibleSet.add(id);
  }
  const adj: Record<string, string[]> = {};
  for (const e of allEdges) {
    if (!visibleSet.has(e.from) || !visibleSet.has(e.to)) continue;
    (adj[e.from] ||= []).push(e.to);
    (adj[e.to] ||= []).push(e.from);
  }
  const mainSet = new Set<string>();
  if (visibleSet.has("smart-hq")) {
    const queue = ["smart-hq"];
    mainSet.add("smart-hq");
    while (queue.length) {
      const n = queue.shift()!;
      for (const m of adj[n] || []) if (!mainSet.has(m)) { mainSet.add(m); queue.push(m); }
    }
  }
  for (const r of out) {
    const fromVis = visibleSet.has(r.from);
    const toVis = visibleSet.has(r.to);
    r.render = fromVis && toVis && mainSet.has(r.from) && mainSet.has(r.to);
  }
  return out;
}

export default function NetmapEdges({ nodes, positions, netmapStatus, playerSecurityLevel }: NetmapEdgesProps) {
  const edges = useMemo(() => {
    const nodeSec: Record<string, number> = {};
    for (const n of nodes) nodeSec[n.id] = n.securityLevel;

    const nodeTile: Record<string, Cell> = {};
    for (const id of Object.keys(positions)) {
      nodeTile[id] = tileForPos(positions[id]);
    }

    const results = computeEdgeRoutes(nodes, positions, netmapStatus);

    // Per-cell tile Y matches NetmapFloor's smoothed sec map (Voronoi + 3 majority iters).
    const nodeIds = Object.keys(nodeTile);
    const tilesArr: [number, number][] = nodeIds.map(id => nodeTile[id]);
    const secArr: number[] = nodeIds.map(id => nodeSec[id] ?? 1);
    const secMap = buildSecMap(tilesArr, secArr);
    const cellTileY = (c: number, r: number): number => {
      const sec = secMap.get(`${c},${r}`) ?? 1;
      return FLOOR_Y + (sec - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;
    };

    return results.map(({ from, to, path, fromCenter, toCenter, render }) => {
      const fromStatus = netmapStatus[from];
      const toStatus = netmapStatus[to];
      const toVisible = toStatus !== undefined && toStatus !== NodeStatus.INVISIBLE;
      const fromCleared = fromStatus === NodeStatus.CLEARED;
      const toCleared = toStatus === NodeStatus.CLEARED;
      const bothCleared = fromCleared && toCleared;
      const accessible = toVisible;
      const toSec = nodeSec[to] ?? 1;
      const blocked = !toCleared && toSec > playerSecurityLevel;
      const fromTopBaseY = FLOOR_Y + ((nodeSec[from] ?? 1) - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;
      const toTopBaseY = FLOOR_Y + ((nodeSec[to] ?? 1) - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;
      const N = path.length;
      const verts: number[] = [];
      const fromRiseIdx: number[] = []; // vertex indices whose Y follows fromRise
      const toRiseIdx: number[] = [];   // vertex indices whose Y follows toRise
      const [cs0x, cs0z] = cellToWorld(fromCenter[0], fromCenter[1]);
      const [csNx, csNz] = cellToWorld(toCenter[0], toCenter[1]);
      const [scx, scz] = cellToWorld(path[0][0], path[0][1]);                 // startCap (offset 1)
      const [ecx, ecz] = cellToWorld(path[N - 1][0], path[N - 1][1]);         // endCap (offset 1)
      // Cap unit dir (cardinal): from center toward startCap/endCap. |sc-cs|=TILE_SIZE so unit = (sc-cs)/TILE_SIZE.
      const fromUnitX = (scx - cs0x) / TILE_SIZE;
      const fromUnitZ = (scz - cs0z) / TILE_SIZE;
      const toUnitX = (ecx - csNx) / TILE_SIZE;
      const toUnitZ = (ecz - csNz) / TILE_SIZE;
      // Static placement uses default radius; useFrame overrides with actual model footprint.
      const fromCapStaticX = cs0x + FOOTPRINT_DEFAULT * fromUnitX;
      const fromCapStaticZ = cs0z + FOOTPRINT_DEFAULT * fromUnitZ;
      const toCapStaticX = csNx + FOOTPRINT_DEFAULT * toUnitX;
      const toCapStaticZ = csNz + FOOTPRINT_DEFAULT * toUnitZ;
      const [p1x, p1z] = cellToWorld(path[1][0], path[1][1]);                 // first port off-platform (offset 2)
      const [pLx, pLz] = cellToWorld(path[N - 2][0], path[N - 2][1]);         // last port off-platform (offset 2)
      const path1Y = cellTileY(path[1][0], path[1][1]);
      const pathLY = cellTileY(path[N - 2][0], path[N - 2][1]);

      // Drop point at offset 1.7 from node center along port axis: just past platform mesh edge (1.6) but before port cell (2.0).
      // Lerp endCap (offset 1) toward port (offset 2) by 0.7.
      const fromDropX = scx + 0.49 * (p1x - scx);
      const fromDropZ = scz + 0.49 * (p1z - scz);
      const toDropX = ecx + 0.49 * (pLx - ecx);
      const toDropZ = ecz + 0.49 * (pLz - ecz);

      const pushVert = (x: number, y: number, z: number) => {
        const idx = verts.length / 3;
        verts.push(x, y, z);
        return idx;
      };

      // FROM platform: cap (clipped to model footprint), startCap, drop point at mesh edge — all ride fromRise.
      const fromCapIdx = pushVert(fromCapStaticX, fromTopBaseY, fromCapStaticZ);
      fromRiseIdx.push(fromCapIdx);
      fromRiseIdx.push(pushVert(scx, fromTopBaseY, scz));
      fromRiseIdx.push(pushVert(fromDropX, fromTopBaseY, fromDropZ));
      // Drop vertically at mesh edge to floor of port cell.
      pushVert(fromDropX, path1Y, fromDropZ);
      // Continue horizontally to port cell at floor.
      pushVert(p1x, path1Y, p1z);

      // Off-platform travel: path[2] through path[N-3].
      let prevX = p1x, prevZ = p1z, prevY = path1Y;
      for (let i = 2; i <= N - 3; i++) {
        const [cx, cz] = cellToWorld(path[i][0], path[i][1]);
        const ny = cellTileY(path[i][0], path[i][1]);
        const midX = (prevX + cx) / 2;
        const midZ = (prevZ + cz) / 2;
        pushVert(midX, prevY, midZ);
        if (ny !== prevY) pushVert(midX, ny, midZ);
        pushVert(cx, ny, cz);
        prevX = cx; prevZ = cz; prevY = ny;
      }

      // Bridge to to-side port: midpoint at prevY, vertical if needed, then port at pathLY.
      if (N >= 4) {
        const midX = (prevX + pLx) / 2;
        const midZ = (prevZ + pLz) / 2;
        pushVert(midX, prevY, midZ);
        if (pathLY !== prevY) pushVert(midX, pathLY, midZ);
        pushVert(pLx, pathLY, pLz);
      }

      // TO platform: travel to mesh-edge drop point at floor, rise vertically, then ride toRise across platform to cap_top.
      pushVert(toDropX, pathLY, toDropZ);
      toRiseIdx.push(pushVert(toDropX, toTopBaseY, toDropZ));
      toRiseIdx.push(pushVert(ecx, toTopBaseY, ecz));
      const toCapIdx = pushVert(toCapStaticX, toTopBaseY, toCapStaticZ);
      toRiseIdx.push(toCapIdx);

      return {
        from, to,
        verts: new Float32Array(verts),
        accessible, render, bothCleared, blocked, fromTopBaseY, toTopBaseY,
        fromRiseIdx: new Uint16Array(fromRiseIdx),
        toRiseIdx: new Uint16Array(toRiseIdx),
        fromCapIdx, toCapIdx,
        fromCenterX: cs0x, fromCenterZ: cs0z,
        toCenterX: csNx, toCenterZ: csNz,
        fromUnitX, fromUnitZ, toUnitX, toUnitZ,
      };
    });
  }, [nodes, positions, netmapStatus, playerSecurityLevel]);

  return (
    <>
      {edges.map((edge, i) => (
        <AnimatedEdge key={i} {...edge} />
      ))}
    </>
  );
}

interface AnimatedEdgeProps {
  from: string;
  to: string;
  verts: Float32Array;
  accessible: boolean;
  render: boolean;
  bothCleared: boolean;
  blocked: boolean;
  fromTopBaseY: number;
  toTopBaseY: number;
  fromRiseIdx: Uint16Array;
  toRiseIdx: Uint16Array;
  fromCapIdx: number;
  toCapIdx: number;
  fromCenterX: number;
  fromCenterZ: number;
  toCenterX: number;
  toCenterZ: number;
  fromUnitX: number;
  fromUnitZ: number;
  toUnitX: number;
  toUnitZ: number;
}

function AnimatedEdge({
  from, to, verts, accessible, render, bothCleared, blocked, fromTopBaseY, toTopBaseY, fromRiseIdx, toRiseIdx,
  fromCapIdx, toCapIdx, fromCenterX, fromCenterZ, toCenterX, toCenterZ,
  fromUnitX, fromUnitZ, toUnitX, toUnitZ,
}: AnimatedEdgeProps) {
  if (!render) return null;
  const map = useContext(PlatformYContext);
  const fpMap = useContext(NodeFootprintContext);
  const lineRef = useRef<{ geometry: { setPositions: (a: number[] | Float32Array) => void } }>(null);
  const arrRef = useRef(verts);
  const points = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < verts.length; i += 3) out.push([verts[i], verts[i + 1], verts[i + 2]]);
    return out;
  }, [verts]);

  useFrame(() => {
    const arr = arrRef.current;
    const line = lineRef.current;
    if (!line) return;
    const fromRise = map.get(from)?.current ?? 0;
    const toRise = map.get(to)?.current ?? 0;
    for (let i = 0; i < fromRiseIdx.length; i++) {
      arr[fromRiseIdx[i] * 3 + 1] = fromTopBaseY + fromRise;
    }
    for (let i = 0; i < toRiseIdx.length; i++) {
      arr[toRiseIdx[i] * 3 + 1] = toTopBaseY + toRise;
    }
    // Clip caps to node model footprint along the cap axis (X if unit X != 0, else Z).
    const fromFp = fpMap.get(from)?.current;
    const fromR = fromFp ? (fromUnitX !== 0 ? fromFp.halfX : fromFp.halfZ) : FOOTPRINT_DEFAULT;
    arr[fromCapIdx * 3] = fromCenterX + fromR * fromUnitX;
    arr[fromCapIdx * 3 + 2] = fromCenterZ + fromR * fromUnitZ;
    const toFp = fpMap.get(to)?.current;
    const toR = toFp ? (toUnitX !== 0 ? toFp.halfX : toFp.halfZ) : FOOTPRINT_DEFAULT;
    arr[toCapIdx * 3] = toCenterX + toR * toUnitX;
    arr[toCapIdx * 3 + 2] = toCenterZ + toR * toUnitZ;
    line.geometry.setPositions(arr);
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={blocked ? "#ffb0b0" : (accessible ? "#aaaaaa" : "#333333")}
      lineWidth={bothCleared ? 4.5 : (accessible ? 1.5 : 1)}
    />
  );
}
