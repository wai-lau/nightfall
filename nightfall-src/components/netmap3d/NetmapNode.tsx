import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  INetmapBattleNode,
  INetmapNonBattleNode,
  NodeStatus,
} from "../../types";
import { matchFlag } from "../../util/util";
import { TILE_SIZE } from "../../util/netmap3d";
import { FLOOR_COLUMN_GEO, FLOOR_TILE_MAT, FLOOR_EDGE_MAT, FLOOR_Y } from "./NetmapFloor";

const GLB_URLS: Record<string, string> = {
  ph:    require("../../img/nodes/3d/ph.glb"),
  lmm:   require("../../img/nodes/3d/lmm.glb"),
  car:   require("../../img/nodes/3d/car.glb"),
  ped:   require("../../img/nodes/3d/ped.glb"),
  donut: require("../../img/nodes/3d/donut.glb"),
  hq:    require("../../img/nodes/3d/hq.glb"),
  smart: require("../../img/nodes/3d/smart.glb"),
  warez: require("../../img/nodes/3d/warez.glb"),
};

const MODEL_FIT_SIZE = 8.0; // target max dimension in world units

const COLOR_UNCLEARED = 0x8faabb;
const COLOR_CLEARED = 0x6a8a9e;
const EMISSIVE_CLEARED = 0x2a4a5e;
const COLOR_DIMMED = 0x334455;

const NODE_Y = 0;
const RISE_AMOUNT = 1.5;
const LERP = 0.12;
const LERP_EPSILON = 0.001;
const PLATFORM_Y_OFFSET = FLOOR_Y;

const unclearedMat = new THREE.MeshBasicMaterial({ wireframe: true, color: COLOR_UNCLEARED });
const clearedMat = new THREE.MeshStandardMaterial({ color: COLOR_CLEARED, emissive: EMISSIVE_CLEARED, emissiveIntensity: 0.4 });
const dimmedMat = new THREE.MeshBasicMaterial({ wireframe: true, color: COLOR_DIMMED, transparent: true, opacity: 0.2 });

const TILE_OFFSETS: [number, number][] = [];
for (let row = -1; row <= 1; row++) {
  for (let col = -1; col <= 1; col++) {
    TILE_OFFSETS.push([col * TILE_SIZE, row * TILE_SIZE]);
  }
}

const PLATFORM_HALF = 1.5 * TILE_SIZE;
const platformEdgeGeo = (() => {
  const pts: number[] = [];
  for (let i = 0; i <= 3; i++) {
    const v = -PLATFORM_HALF + i * TILE_SIZE;
    pts.push(-PLATFORM_HALF, 0, v, PLATFORM_HALF, 0, v);
    pts.push(v, 0, -PLATFORM_HALF, v, 0, PLATFORM_HALF);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
})();

function getCorpKey(node: INetmapBattleNode | INetmapNonBattleNode): string {
  const orgName = node.nodeStyle.netmapOrgName.toLowerCase();
  if (orgName.includes("pharmhaus"))                          return "ph";
  if (orgName.includes("lucky monkey"))                       return "lmm";
  if (orgName.includes("cellular"))                           return "car";
  if (orgName.includes("ped") || orgName.includes("parker"))  return "ped";
  if (orgName.includes("donut"))                              return "donut";
  if (orgName.includes("s.m.a.r.t") || orgName.includes("smart")) return "smart";
  if (orgName.includes("warez"))                              return "warez";
  if (orgName === "")                                         return "hq";
  return "hq";
}

interface NodeModelProps {
  corpKey: string;
  material: THREE.Material;
}

function NodeModel({ corpKey, material }: NodeModelProps) {
  const { scene } = useGLTF(GLB_URLS[corpKey] ?? GLB_URLS.hq);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? MODEL_FIT_SIZE / maxDim : 1;
    // center X/Z, sit bottom on y=0
    return { scale: s, offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s) };
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
      }
    });
  }, [scene, material]);

  return <primitive object={scene} scale={scale} position={[offset.x, offset.y, offset.z]} />;
}

interface NetmapNodeProps {
  node: INetmapBattleNode | INetmapNonBattleNode;
  position: [number, number, number];
  status: NodeStatus | undefined;
  isSelected: boolean;
  isNightfallDimmed: boolean;
  onClick: () => void;
}

export default function NetmapNode({
  node,
  position,
  status,
  isSelected,
  isNightfallDimmed,
  onClick,
}: NetmapNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const yRef = useRef(0);
  const targetY = isSelected || hovered ? RISE_AMOUNT : 0;

  useFrame(() => {
    if (Math.abs(targetY - yRef.current) < LERP_EPSILON) return;
    yRef.current += (targetY - yRef.current) * LERP;
    if (groupRef.current) groupRef.current.position.y = NODE_Y + yRef.current;
    if (platformRef.current) platformRef.current.position.y = NODE_Y + yRef.current + PLATFORM_Y_OFFSET;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const corpKey = useMemo(() => getCorpKey(node), [node.id]);

  if (status === undefined || status === NodeStatus.INVISIBLE) return null;

  const cleared = matchFlag(status, NodeStatus.WON);
  const material = isNightfallDimmed ? dimmedMat : cleared ? clearedMat : unclearedMat;

  return (
    <>
      <group
        ref={groupRef}
        position={[position[0], NODE_Y, position[2]]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <NodeModel corpKey={corpKey} material={material} />

        {hovered && (
          <Html center distanceFactor={30} style={{ pointerEvents: "none" }}>
            <div className="node-tooltip" style={{ opacity: 1 }}>
              <span>{node.nodeStyle.netmapOrgName}</span>
              <span>{node.name}</span>
              <span>Security Level {node.securityLevel}</span>
            </div>
          </Html>
        )}
      </group>

      {isSelected && (
        <group ref={platformRef} position={[position[0], NODE_Y + PLATFORM_Y_OFFSET, position[2]]}>
          {TILE_OFFSETS.map(([ox, oz], i) => (
            <mesh key={i} position={[ox, 0, oz]} geometry={FLOOR_COLUMN_GEO} material={FLOOR_TILE_MAT} />
          ))}
          <lineSegments geometry={platformEdgeGeo} material={FLOOR_EDGE_MAT} />
        </group>
      )}
    </>
  );
}
