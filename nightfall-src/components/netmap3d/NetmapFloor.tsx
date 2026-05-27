import React, { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TILE_SIZE, OFFSET_X, OFFSET_Z } from "../../util/netmap3d";
import { BAKED_TILES } from "../../campaign/netmap.baked";
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

export const SEC_HEIGHT_STEP = 1.2;
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

interface NetmapFloorProps {
  netmapStatus: { [id: string]: NodeStatus };
}

export default function NetmapFloor({ netmapStatus }: NetmapFloorProps) {
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

  // Set per-tile colors once (sec is baked, never changes).
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < instanceCount; i++) {
      const sec = BAKED_TILES[i].sec;
      const hex = SEC_PALETTE[Math.max(0, Math.min(SEC_PALETTE.length - 1, sec - 1))] ?? SEC_COLOR_DEFAULT;
      mesh.setColorAt(i, tmpColor.set(hex));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceCount, tmpColor]);

  // Dirty flag triggers a full repaint on netmapStatus change. useFrame additionally
  // runs while any owner is mid-reveal so tiles rise in sync with their node platform.
  const dirty = useRef(true);
  useEffect(() => {
    dirty.current = true;
  }, [netmapStatus]);

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
      const startTime = reveal.startTimeMs.get(tile.owner);
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
      const py = (tile.sec - 1) * SEC_HEIGHT_STEP + offset;
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
      <instancedMesh ref={meshRef} args={[FLOOR_COLUMN_GEO, FLOOR_TILE_MAT, instanceCount]} receiveShadow />
      <instancedMesh ref={frameRef} args={[FLOOR_FRAME_GEO, FLOOR_FRAME_MAT, instanceCount]} renderOrder={1} />
    </group>
  );
}
