import React, { useMemo } from "react";
import * as THREE from "three";
import { SCALE, OFFSET_X, OFFSET_Z } from "../../util/netmap3d";

const MAP_PX_W = 1958;
const MAP_PX_H = 1412;
const FLOOR_Y = -0.5;
const FLOOR_TILE = 1.0;

const worldW = MAP_PX_W / SCALE;
const worldH = MAP_PX_H / SCALE;
const cols = Math.ceil(worldW / FLOOR_TILE);
const rows = Math.ceil(worldH / FLOOR_TILE);
const startX = -OFFSET_X;
const startZ = -OFFSET_Z;
const endX = startX + cols * FLOOR_TILE;
const endZ = startZ + rows * FLOOR_TILE;
const centerX = (startX + endX) / 2;
const centerZ = (startZ + endZ) / 2;

const fillMat = new THREE.MeshStandardMaterial({
  color: 0x555555,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

const gridMat = new THREE.LineBasicMaterial({ color: 0x111111 });

function buildGridGeometry(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const z = startZ + row * FLOOR_TILE;
    pts.push(startX, 0, z, endX, 0, z);
  }
  for (let col = 0; col <= cols; col++) {
    const x = startX + col * FLOOR_TILE;
    pts.push(x, 0, startZ, x, 0, endZ);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

export default function NetmapFloor() {
  const gridGeo = useMemo(buildGridGeometry, []);

  return (
    <group position={[0, FLOOR_Y, 0]}>
      <mesh position={[centerX, 0, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cols * FLOOR_TILE, rows * FLOOR_TILE]} />
        <primitive object={fillMat} attach="material" />
      </mesh>
      <lineSegments geometry={gridGeo} material={gridMat} />
    </group>
  );
}
