import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { TILE_SIZE, SCALE, OFFSET_X, OFFSET_Z } from "../../util/netmap3d";

const MAP_PX_W = 1958;
const MAP_PX_H = 1412;
export const FLOOR_Y = -0.5;

const worldW = MAP_PX_W / SCALE;
const worldH = MAP_PX_H / SCALE;
const COLS = Math.ceil(worldW / TILE_SIZE);
const ROWS = Math.ceil(worldH / TILE_SIZE);
const START_X = -OFFSET_X;
const START_Z = -OFFSET_Z;
const END_X = START_X + COLS * TILE_SIZE;
const END_Z = START_Z + ROWS * TILE_SIZE;
const COUNT = COLS * ROWS;

export const FLOOR_TILE_MAT = new THREE.MeshStandardMaterial({
  color: 0x555555,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
export const FLOOR_EDGE_MAT = new THREE.LineBasicMaterial({ color: 0x111111 });
export const FLOOR_TILE_GEO = new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE);

function buildGridLines(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let row = 0; row <= ROWS; row++) {
    const z = START_Z + row * TILE_SIZE;
    pts.push(START_X, 0, z, END_X, 0, z);
  }
  for (let col = 0; col <= COLS; col++) {
    const x = START_X + col * TILE_SIZE;
    pts.push(x, 0, START_Z, x, 0, END_Z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

export default function NetmapFloor() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridGeo = useMemo(buildGridLines, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let i = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        dummy.position.set(
          START_X + col * TILE_SIZE + TILE_SIZE / 2,
          0,
          START_Z + row * TILE_SIZE + TILE_SIZE / 2
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <group position={[0, FLOOR_Y, 0]}>
      <instancedMesh ref={meshRef} args={[FLOOR_TILE_GEO, FLOOR_TILE_MAT, COUNT]} />
      <lineSegments geometry={gridGeo} material={FLOOR_EDGE_MAT} />
    </group>
  );
}
