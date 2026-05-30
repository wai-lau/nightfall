import React, { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TILE_SIZE, OFFSET_X, OFFSET_Z, toWorld } from "../../util/netmap3d";
import { BAKED_TILES } from "../../campaign/netmap.baked";
import netmap from "../../campaign/netmap";
import { NodeStatus } from "../../types";
import {
  RevealContext,
  REVEAL_HOLD_MS,
  REVEAL_RISE_MS,
  REVEAL_LOW_Y,
} from "./RevealContext";

export const FLOOR_Y = -0.5;

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

export const SEC_HEIGHT_STEP = 1.2;

// sec-5 background tiles (those NOT under a node's 5x5 platform) get a small,
// deterministic per-tile height jitter so the high-security expanse reads as
// broken terrain instead of one flat mesa. Hash-based on col/row so it stays
// fixed frame-to-frame.
const SEC5_JITTER = 0; // peak-to-peak, world units (flat)
function sec5Jitter(col: number, row: number): number {
  let h = (Math.imul(col, 73856093) ^ Math.imul(row, 19349663)) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * SEC5_JITTER;
}
const tileKey = (col: number, row: number) => col * 10000 + row;
export const SEC_PALETTE: number[] = [
  0xc0c0c0,
  0xb0b0b0,
  0xa0a0a0,
  0x909090,
  0x808080,
];
export const SEC_COLOR_DEFAULT = 0x555555;
export function secColor(level: number): number {
  return SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, level - 1))] ?? SEC_COLOR_DEFAULT;
}

// Dawn floor + node platforms: tiles take the node-green hue at their sec
// brightness, rendered at 20% opacity. The tint is multiplied onto the
// sec-palette grey so per-sec brightness ordering is preserved.
export const NIGHTFALL_TINT = new THREE.Color(0xa0ffa0);
export const NIGHTFALL_OPACITY = 0.2;

// Dawn tile: a flat top-face quad (DAWN_TOP_FACE) as a translucent green surface
// plus its 4 perimeter edges (DAWN_TOP_EDGES) as the green outline — no columns
// or verticals. Shared by floor + node platforms.
export const DAWN_TOP_FACE = FLOOR_TOP_GEO.toNonIndexed();
export const DAWN_TOP_EDGES = new THREE.EdgesGeometry(FLOOR_TOP_GEO, 1);
// Top face: translucent green, pushed back by polygonOffset so the outline edges
// (coincident in the same plane) sit crisply in front (no z-fight).
export const DAWN_FACE_MAT = new THREE.MeshBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: NIGHTFALL_OPACITY,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

interface NetmapFloorProps {
  netmapStatus: { [id: string]: NodeStatus };
  nightfall?: boolean;
}

export default function NetmapFloor({ netmapStatus, nightfall }: NetmapFloorProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const zero = useMemo(() => {
    const o = new THREE.Object3D();
    o.scale.set(0, 0, 0);
    o.updateMatrix();
    return o.matrix.clone();
  }, []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const reveal = useContext(RevealContext);

  const instanceCount = BAKED_TILES.length;

  // Tiles within +/-2 (the 5x5 footprint) of any node center are platform tiles
  // and stay flat; sec-5 tiles outside every footprint get jittered.
  const platformKeys = useMemo(() => {
    const s = new Set<number>();
    const pos = netmap.positions;
    for (const id in pos) {
      const [wx, , wz] = toWorld(pos[id], 1);
      const nc = Math.round((wx + OFFSET_X - TILE_SIZE / 2) / TILE_SIZE);
      const nr = Math.round((wz + OFFSET_Z - TILE_SIZE / 2) / TILE_SIZE);
      for (let dc = -2; dc <= 2; dc++) {
        for (let dr = -2; dr <= 2; dr++) s.add(tileKey(nc + dc, nr + dr));
      }
    }
    return s;
  }, []);

  // Morning (solid tiles): per-tile sec colors. (Dawn renders the wireframe
  // below instead.) nightfall is a dep so the colors re-apply when the solid
  // mesh remounts on the dawn->morning toggle.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < instanceCount; i++) {
      const sec = BAKED_TILES[i].sec;
      const hex = SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, sec - 1))] ?? SEC_COLOR_DEFAULT;
      mesh.setColorAt(i, tmpColor.set(hex));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceCount, tmpColor, nightfall]);

  // Dawn floor: each visible tile is a flat top-face quad + its outline edges,
  // merged into one faces mesh + one LineSegments, per-tile green-tinted by sec.
  // Visibility matches the morning cull (owner or a shared-ring member revealed)
  // so dawn never fills an unrevealed node's ring while its platform is absent.
  const dawnFloor = useMemo(() => {
    if (!nightfall) return { lineGeo: new THREE.BufferGeometry(), faceGeo: new THREE.BufferGeometry() };
    const isVis = (id: string) => {
      const s = netmapStatus[id];
      return s !== undefined && s !== NodeStatus.INVISIBLE;
    };
    const tiles = BAKED_TILES.filter((t) => isVis(t.owner) || (t.vis?.some(isVis) ?? false));
    const ep = DAWN_TOP_EDGES.attributes.position.array as ArrayLike<number>;
    const fp = DAWN_TOP_FACE.attributes.position.array as ArrayLike<number>;
    const elen = ep.length;
    const flen = fp.length;
    const n = tiles.length;
    const linePos = new Float32Array(elen * n);
    const lineCol = new Float32Array(elen * n);
    const facePos = new Float32Array(flen * n);
    const faceCol = new Float32Array(flen * n);
    const c = new THREE.Color();
    let lo = 0, fo = 0;
    for (const t of tiles) {
      const px = START_X + t.col * TILE_SIZE + TILE_SIZE / 2;
      let py = (t.sec - 1) * SEC_HEIGHT_STEP;
      if (t.sec === 5 && !platformKeys.has(tileKey(t.col, t.row))) {
        py += sec5Jitter(t.col, t.row);
      }
      const pz = START_Z + t.row * TILE_SIZE + TILE_SIZE / 2;
      const hex = SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, t.sec - 1))] ?? SEC_COLOR_DEFAULT;
      c.set(hex).multiply(NIGHTFALL_TINT);
      for (let i = 0; i < elen; i += 3) {
        linePos[lo] = ep[i] + px;
        linePos[lo + 1] = ep[i + 1] + py;
        linePos[lo + 2] = ep[i + 2] + pz;
        lineCol[lo] = c.r; lineCol[lo + 1] = c.g; lineCol[lo + 2] = c.b;
        lo += 3;
      }
      for (let i = 0; i < flen; i += 3) {
        facePos[fo] = fp[i] + px;
        facePos[fo + 1] = fp[i + 1] + py;
        facePos[fo + 2] = fp[i + 2] + pz;
        faceCol[fo] = c.r; faceCol[fo + 1] = c.g; faceCol[fo + 2] = c.b;
        fo += 3;
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const faceGeo = new THREE.BufferGeometry();
    faceGeo.setAttribute("position", new THREE.BufferAttribute(facePos, 3));
    faceGeo.setAttribute("color", new THREE.BufferAttribute(faceCol, 3));
    return { lineGeo, faceGeo };
  }, [netmapStatus, nightfall, platformKeys]);

  // Dispose the previous merged geometries when they rebuild (status change) or
  // on unmount, so toggling/clearing in dawn doesn't leak GPU buffers.
  useEffect(() => {
    return () => {
      dawnFloor.lineGeo.dispose();
      dawnFloor.faceGeo.dispose();
    };
  }, [dawnFloor]);

  // Dirty flag triggers a full repaint on netmapStatus change. useFrame additionally
  // runs while any owner is mid-reveal so tiles rise in sync with their node platform.
  const dirty = useRef(true);
  // netmapStatus repaints on reveal; nightfall repaints because toggling back to
  // morning remounts a fresh instancedMesh whose instance matrices are zeroed.
  useEffect(() => {
    dirty.current = true;
  }, [netmapStatus, nightfall]);

  useFrame(() => {
    const mesh = meshRef.current;
    const frame = frameRef.current;
    if (!mesh) return;
    const now = performance.now();
    let anyReveal = false;
    // Extend window 32ms past reveal end so we run one cleanup pass that lands at offset=0.
    for (const [, st] of reveal.startTimeMs) {
      if (now - st < REVEAL_HOLD_MS + REVEAL_RISE_MS + 32) {
        anyReveal = true;
        break;
      }
    }
    if (!dirty.current && !anyReveal) return;

    for (let i = 0; i < instanceCount; i++) {
      const tile = BAKED_TILES[i];
      const isVis = (id: string) => {
        const s = netmapStatus[id];
        return s !== undefined && s !== NodeStatus.INVISIBLE;
      };
      // Shared ring cells: visible if the owner OR any encircling member node is
      // revealed, so a ring never gaps toward a still-hidden neighbor.
      const visible = isVis(tile.owner) || (tile.vis?.some(isVis) ?? false);
      if (!visible) {
        mesh.setMatrixAt(i, zero);
        if (frame) frame.setMatrixAt(i, zero);
        continue;
      }
      let offset = 0;
      // Key the rise on the earliest reveal among the owner and any encircling
      // member: a shared-ring tile can be made visible by a neighbor's reveal
      // while its owner is still hidden, so owner alone misses those tiles.
      let startTime = reveal.startTimeMs.get(tile.owner);
      if (tile.vis) {
        for (const m of tile.vis) {
          const t = reveal.startTimeMs.get(m);
          if (t !== undefined && (startTime === undefined || t < startTime)) {
            startTime = t;
          }
        }
      }
      if (startTime !== undefined) {
        const elapsed = now - startTime;
        if (elapsed < REVEAL_HOLD_MS) {
          offset = REVEAL_LOW_Y;
        } else if (elapsed < REVEAL_HOLD_MS + REVEAL_RISE_MS) {
          const r = (elapsed - REVEAL_HOLD_MS) / REVEAL_RISE_MS;
          const eased = 1 - Math.pow(1 - r, 3);
          offset = REVEAL_LOW_Y * (1 - eased);
        }
      }
      const px = START_X + tile.col * TILE_SIZE + TILE_SIZE / 2;
      let py = (tile.sec - 1) * SEC_HEIGHT_STEP + offset;
      if (tile.sec === 5 && !platformKeys.has(tileKey(tile.col, tile.row))) {
        py += sec5Jitter(tile.col, tile.row);
      }
      const pz = START_Z + tile.row * TILE_SIZE + TILE_SIZE / 2;
      dummy.position.set(px, py, pz);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (frame) {
        dummy.position.set(px, py + 0.001, pz);
        dummy.updateMatrix();
        frame.setMatrixAt(i, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (frame) frame.instanceMatrix.needsUpdate = true;
    dirty.current = false;
  });

  return (
    <group position={[0, FLOOR_Y, 0]}>
      {nightfall ? (
        // Dawn: translucent green tile faces + crisp wireframe edges (short
        // sec-step slabs). No frame.
        <>
          <mesh geometry={dawnFloor.faceGeo} material={DAWN_FACE_MAT} />
          <lineSegments geometry={dawnFloor.lineGeo}>
            <lineBasicMaterial vertexColors transparent opacity={NIGHTFALL_OPACITY} />
          </lineSegments>
        </>
      ) : (
        <>
          <instancedMesh
            ref={meshRef}
            args={[FLOOR_COLUMN_GEO, FLOOR_TILE_MAT, instanceCount]}
            receiveShadow
          />
          <instancedMesh
            ref={frameRef}
            args={[FLOOR_FRAME_GEO, FLOOR_FRAME_MAT, instanceCount]}
            renderOrder={1}
          />
        </>
      )}
    </group>
  );
}
