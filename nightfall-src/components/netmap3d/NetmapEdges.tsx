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
import { TILE_SIZE, OFFSET_X, OFFSET_Z } from "../../util/netmap3d";
import { FLOOR_Y, SEC_HEIGHT_STEP } from "./NetmapFloor";
import { RevealContext, REVEAL_HOLD_MS, REVEAL_RISE_MS, REVEAL_FLOW_MS } from "./RevealContext";
import { BAKED_EDGES } from "../../campaign/netmap.baked";

export const PlatformYContext = createContext<Map<string, { current: number }>>(new Map());
export const NodeFootprintContext = createContext<Map<string, { current: { halfX: number; halfZ: number } }>>(new Map());

const FOOTPRINT_DEFAULT = 0;
const EDGE_Y_OFFSET = 0.03;

const cellToWorld = (c: number, r: number): [number, number] => [
  -OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2,
  -OFFSET_Z + r * TILE_SIZE + TILE_SIZE / 2,
];

const tileForNodePos = (pos: [number, number]): [number, number] => {
  const x = pos[0] / 10 - OFFSET_X;
  const z = pos[1] / 10 - OFFSET_Z;
  return [Math.floor((x + OFFSET_X) / TILE_SIZE), Math.floor((z + OFFSET_Z) / TILE_SIZE)];
};

interface NetmapEdgesProps {
  nodes: INetmap["nodes"];
  positions: INetmap["positions"];
  netmapStatus: { [id: string]: NodeStatus };
  playerSecurityLevel: number;
  nightfall?: boolean;
}

export default function NetmapEdges({ nodes, positions, netmapStatus, playerSecurityLevel, nightfall }: NetmapEdgesProps) {
  const edges = useMemo(() => {
    const nodeSec: Record<string, number> = {};
    for (const n of nodes) nodeSec[n.id] = n.securityLevel;

    // Visibility + connected-from-smart-hq for render flag.
    const visibleSet = new Set<string>();
    for (const id of Object.keys(netmapStatus)) {
      const s = netmapStatus[id];
      if (s !== undefined && s !== NodeStatus.INVISIBLE) visibleSet.add(id);
    }
    const adj: Record<string, string[]> = {};
    for (const e of BAKED_EDGES) {
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

    return BAKED_EDGES.map((edge) => {
      const { from, to, path } = edge;
      const fromCenter = tileForNodePos(positions[from] as [number, number]);
      const toCenter = tileForNodePos(positions[to] as [number, number]);
      const fromStatus = netmapStatus[from];
      const toStatus = netmapStatus[to];
      const fromVisible = fromStatus !== undefined && fromStatus !== NodeStatus.INVISIBLE;
      const toVisible = toStatus !== undefined && toStatus !== NodeStatus.INVISIBLE;
      const fromCleared = fromStatus === NodeStatus.CLEARED;
      const toCleared = toStatus === NodeStatus.CLEARED;
      const bothCleared = fromCleared && toCleared;
      const accessible = toVisible;
      const toSec = nodeSec[to] ?? 1;
      const blocked = !toCleared && (toSec > playerSecurityLevel || !fromCleared);
      const render = fromVisible && toVisible && mainSet.has(from) && mainSet.has(to);

      const fromTopBaseY = FLOOR_Y + ((nodeSec[from] ?? 1) - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;
      const toTopBaseY = FLOOR_Y + ((nodeSec[to] ?? 1) - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;
      const cellTileY = (sec: number): number =>
        FLOOR_Y + (sec - 1) * SEC_HEIGHT_STEP + EDGE_Y_OFFSET;

      const N = path.length;
      const verts: number[] = [];
      const fromRiseIdx: number[] = [];
      const toRiseIdx: number[] = [];
      const [cs0x, cs0z] = cellToWorld(fromCenter[0], fromCenter[1]);
      const [csNx, csNz] = cellToWorld(toCenter[0], toCenter[1]);
      const [scx, scz] = cellToWorld(path[0][0], path[0][1]);
      const [ecx, ecz] = cellToWorld(path[N - 1][0], path[N - 1][1]);
      const fromUnitX = (scx - cs0x) / TILE_SIZE;
      const fromUnitZ = (scz - cs0z) / TILE_SIZE;
      const toUnitX = (ecx - csNx) / TILE_SIZE;
      const toUnitZ = (ecz - csNz) / TILE_SIZE;
      const fromCapStaticX = cs0x + FOOTPRINT_DEFAULT * fromUnitX;
      const fromCapStaticZ = cs0z + FOOTPRINT_DEFAULT * fromUnitZ;
      const toCapStaticX = csNx + FOOTPRINT_DEFAULT * toUnitX;
      const toCapStaticZ = csNz + FOOTPRINT_DEFAULT * toUnitZ;
      const [p1x, p1z] = cellToWorld(path[1][0], path[1][1]);
      const [pLx, pLz] = cellToWorld(path[N - 2][0], path[N - 2][1]);
      const path1Y = cellTileY(path[1][2]);
      const pathLY = cellTileY(path[N - 2][2]);

      // Drop point at offset 1.7 from node center along port axis: past platform
      // mesh edge (1.6) but before port cell (2.0). Lerp endCap toward port by 0.7.
      const fromDropX = scx + 0.49 * (p1x - scx);
      const fromDropZ = scz + 0.49 * (p1z - scz);
      const toDropX = ecx + 0.49 * (pLx - ecx);
      const toDropZ = ecz + 0.49 * (pLz - ecz);

      const pushVert = (x: number, y: number, z: number) => {
        const idx = verts.length / 3;
        verts.push(x, y, z);
        return idx;
      };

      const fromCapIdx = pushVert(fromCapStaticX, fromTopBaseY, fromCapStaticZ);
      fromRiseIdx.push(fromCapIdx);
      fromRiseIdx.push(pushVert(scx, fromTopBaseY, scz));
      fromRiseIdx.push(pushVert(fromDropX, fromTopBaseY, fromDropZ));
      pushVert(fromDropX, path1Y, fromDropZ);
      pushVert(p1x, path1Y, p1z);

      let prevX = p1x, prevZ = p1z, prevY = path1Y;
      for (let i = 2; i <= N - 3; i++) {
        const [cx, cz] = cellToWorld(path[i][0], path[i][1]);
        const ny = cellTileY(path[i][2]);
        const midX = (prevX + cx) / 2;
        const midZ = (prevZ + cz) / 2;
        pushVert(midX, prevY, midZ);
        if (ny !== prevY) pushVert(midX, ny, midZ);
        pushVert(cx, ny, cz);
        prevX = cx; prevZ = cz; prevY = ny;
      }

      if (N >= 4) {
        const midX = (prevX + pLx) / 2;
        const midZ = (prevZ + pLz) / 2;
        pushVert(midX, prevY, midZ);
        if (pathLY !== prevY) pushVert(midX, pathLY, midZ);
        pushVert(pLx, pathLY, pLz);
      }

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
      {edges.map((edge) => (
        <AnimatedEdge key={`${edge.from}->${edge.to}`} {...edge} nightfall={nightfall} />
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
  nightfall?: boolean;
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
  from, to, verts, accessible, render, bothCleared, blocked, nightfall, fromTopBaseY, toTopBaseY, fromRiseIdx, toRiseIdx,
  fromCapIdx, toCapIdx, fromCenterX, fromCenterZ, toCenterX, toCenterZ,
  fromUnitX, fromUnitZ, toUnitX, toUnitZ,
}: AnimatedEdgeProps) {
  if (!render) return null;
  const map = useContext(PlatformYContext);
  const fpMap = useContext(NodeFootprintContext);
  const reveal = useContext(RevealContext);
  const lineRef = useRef<{ geometry: { setPositions: (a: number[] | Float32Array) => void } }>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pulseRef = useRef<any>(null);
  const arrRef = useRef(verts);
  const points = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < verts.length; i += 3) out.push([verts[i], verts[i + 1], verts[i + 2]]);
    return out;
  }, [verts]);

  const fromStart = reveal.startTimeMs.get(from);
  const toStart = reveal.startTimeMs.get(to);
  const revealStart = toStart ?? fromStart;
  const usingReveal = revealStart !== undefined;
  const pulseDir = toStart !== undefined ? 1 : -1;

  // Detect blocked→unblocked transition with both endpoints already revealed:
  // fire pulse along the edge without waiting for any node rise.
  const prevBlockedRef = useRef<boolean | undefined>(undefined);
  const unblockStartRef = useRef<number | undefined>(undefined);
  if (
    prevBlockedRef.current === true &&
    blocked === false &&
    !usingReveal
  ) {
    unblockStartRef.current = performance.now();
  }
  prevBlockedRef.current = blocked;

  const pulseStart = usingReveal ? revealStart : unblockStartRef.current;
  const pulseDelay = usingReveal ? REVEAL_HOLD_MS + REVEAL_RISE_MS : 0;

  const prevRef = useRef({ f: NaN, t: NaN, fpFR: NaN, fpTR: NaN });
  useFrame((_, delta) => {
    const arr = arrRef.current;
    const line = lineRef.current;
    if (!line) return;
    const fromRise = map.get(from)?.current ?? 0;
    const toRise = map.get(to)?.current ?? 0;
    const fromFpRef = fpMap.get(from)?.current;
    const fromR_ = fromFpRef ? (fromUnitX !== 0 ? fromFpRef.halfX : fromFpRef.halfZ) : FOOTPRINT_DEFAULT;
    const toFpRef = fpMap.get(to)?.current;
    const toR_ = toFpRef ? (toUnitX !== 0 ? toFpRef.halfX : toFpRef.halfZ) : FOOTPRINT_DEFAULT;
    const now = performance.now();
    const pulseElapsed = pulseStart !== undefined ? now - pulseStart - pulseDelay : -Infinity;
    const pulseActive = pulseStart !== undefined && pulseElapsed < REVEAL_FLOW_MS;
    const inRise = usingReveal && now - revealStart! < REVEAL_HOLD_MS + REVEAL_RISE_MS;
    const p = prevRef.current;
    if (!pulseActive && !inRise && p.f === fromRise && p.t === toRise && p.fpFR === fromR_ && p.fpTR === toR_) return;
    prevRef.current = { f: fromRise, t: toRise, fpFR: fromR_, fpTR: toR_ };

    // Static link: hidden while a freshly-revealed endpoint is still rising;
    // unblock-only animations leave the line visible throughout.
    (line as unknown as { visible: boolean }).visible = !inRise;

    for (let i = 0; i < fromRiseIdx.length; i++) {
      arr[fromRiseIdx[i] * 3 + 1] = fromTopBaseY + fromRise;
    }
    for (let i = 0; i < toRiseIdx.length; i++) {
      arr[toRiseIdx[i] * 3 + 1] = toTopBaseY + toRise;
    }
    arr[fromCapIdx * 3] = fromCenterX + fromR_ * fromUnitX;
    arr[fromCapIdx * 3 + 2] = fromCenterZ + fromR_ * fromUnitZ;
    arr[toCapIdx * 3] = toCenterX + toR_ * toUnitX;
    arr[toCapIdx * 3 + 2] = toCenterZ + toR_ * toUnitZ;
    line.geometry.setPositions(arr);

    if (pulseRef.current && pulseStart !== undefined) {
      pulseRef.current.geometry.setPositions(arr);
      const visible = pulseElapsed >= 0 && pulseElapsed < REVEAL_FLOW_MS;
      pulseRef.current.visible = visible;
      const mat = pulseRef.current.material;
      if (mat && visible) {
        mat.dashOffset = (mat.dashOffset ?? 0) - delta * 18 * pulseDir;
        const fadeIn = Math.min(1, pulseElapsed / 200);
        const fadeOut = Math.max(0, 1 - pulseElapsed / REVEAL_FLOW_MS);
        mat.opacity = fadeIn * fadeOut;
        mat.transparent = true;
        mat.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        // Nightfall: edges at 40% brightness, desaturated to grey, full opacity.
        color={nightfall ? "#666666" : (blocked ? "#ff6060" : (accessible ? "#aaaaaa" : "#333333"))}
        lineWidth={bothCleared ? 4.5 : (accessible ? 1.5 : 1)}
      />
      {pulseStart !== undefined && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Line
          ref={pulseRef as any}
          points={points}
          color="#ffffff"
          lineWidth={3}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ dashed: true, dashSize: 2, gapSize: 4, transparent: true } as any)}
        />
      )}
    </>
  );
}
