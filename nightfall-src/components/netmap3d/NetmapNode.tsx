import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { PlatformYContext, NodeFootprintContext } from "./NetmapEdges";
import { Nodes } from "../../campaign/netmap";

const NODE_KEY_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(Nodes).map(([k, v]) => [v as string, k])
);
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
import { FLOOR_COLUMN_GEO, DAWN_TOP_EDGES, DAWN_TOP_FACE, FLOOR_FRAME_GEO, FLOOR_FRAME_MAT, FLOOR_Y, NIGHTFALL_TINT, NIGHTFALL_OPACITY, secColor, SEC_HEIGHT_STEP } from "./NetmapFloor";
import { RevealContext, REVEAL_HOLD_MS, REVEAL_RISE_MS, REVEAL_LOW_Y } from "./RevealContext";

const GLB_URLS: Record<string, string> = {
  ph:    require("../../img/nodes/3d/ph.glb"),
  lmm:   require("../../img/nodes/3d/lmm.glb"),
  car:   require("../../img/nodes/3d/car.glb"),
  ped:   require("../../img/nodes/3d/ped.glb"),
  donut: require("../../img/nodes/3d/donut.glb"),
  hq:    require("../../img/nodes/3d/hq.glb"),
  smart: require("../../img/nodes/3d/smart.glb"),
  warez: require("../../img/nodes/3d/warez.glb"),
  tang:  require("../../img/nodes/3d/tang.glb"),
  glad:  require("../../img/nodes/3d/glad.glb"),
};

for (const url of Object.values(GLB_URLS)) {
  useGLTF.preload(url);
}

const MODEL_SCALE = 280;
const MODEL_XZ_SCALE: Partial<Record<string, number>> = {
  warez: 0.8,
};
// Uniform per-corp scale multiplier applied to all 3 axes.
const MODEL_SCALE_MUL: Partial<Record<string, number>> = {
  tang: 1.15,
};

const COLOR_UNCLEARED = 0xc8d8ec;
const EMISSIVE_CLEARED = 0x2c3a4a;
const COLOR_DIMMED = 0x334455;

const MODEL_BASE_ROTATION_Y = -Math.PI / 2;
const MODEL_ROTATION_Y: Partial<Record<string, number>> = {
  warez: 0,
  car:   0,
  lmm:   0,
};

const NODE_Y = 0;
const RISE_AMOUNT = 2.25;
const SELECT_RISE = RISE_AMOUNT * 3;
const LERP = 0.12;
const LERP_EPSILON = 0.001;
const PLATFORM_Y_OFFSET = FLOOR_Y;

const glowMat = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color(0x000000) }, uMaxOpacity: { value: 0.35 } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uMaxOpacity;
    void main() {
      float d = distance(vUv, vec2(0.5, 0.5)) * 2.0;
      float a = uMaxOpacity * pow(1.0 - clamp(d, 0.0, 1.0), 2.0);
      gl_FragColor = vec4(uColor, a);
    }
  `,
  transparent: true,
  depthWrite: false,
});

const unclearedLineMat = new THREE.LineBasicMaterial({ color: COLOR_UNCLEARED });
const blockedLineMat = new THREE.LineBasicMaterial({ color: 0xffb0b0 });
const dimmedLineMat = new THREE.LineBasicMaterial({ color: COLOR_DIMMED, transparent: true, opacity: 0.2 });
const dimmedSurfaceMat = new THREE.MeshBasicMaterial({ color: 0x4a525a, transparent: true, opacity: 0.1, depthWrite: false });

const s1rGradientMat = new THREE.ShaderMaterial({
  uniforms: {},
  vertexShader: `
    varying float vY;
    void main() {
      vY = uv.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying float vY;
    void main() {
      float a = mix(0.8, 0.0, clamp(vY / 0.8, 0.0, 1.0));
      gl_FragColor = vec4(1.0, 0.0, 0.0, a);
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
});

// Face-normal angle threshold (deg) below which adjacent triangle edges merge.
const EDGES_THRESHOLD_DEFAULT = 15;
const EDGES_THRESHOLD: Partial<Record<string, number>> = {};

const TILE_OFFSETS: [number, number][] = [];
for (let row = -1; row <= 1; row++) {
  for (let col = -1; col <= 1; col++) {
    TILE_OFFSETS.push([col * TILE_SIZE, row * TILE_SIZE]);
  }
}


function getCorpKey(node: INetmapBattleNode | INetmapNonBattleNode): string {
  const orgName = node.nodeStyle.netmapOrgName.toLowerCase();
  if (orgName.includes("pharmhaus"))                          return "ph";
  if (orgName.includes("lucky monkey"))                       return "lmm";
  if (orgName.includes("cellular"))                           return "car";
  if (orgName.includes("ped") || orgName.includes("parker"))  return "ped";
  if (orgName.includes("donut"))                              return "donut";
  if (orgName.includes("s.m.a.r.t") || orgName.includes("smart") || orgName.includes("sma-rt")) return "smart";
  if (orgName.includes("warez"))                              return "warez";
  if (orgName.includes("tang"))                               return "tang";
  if (orgName === "")                                         return "hq";
  return "hq";
}

const NODE_ID_ROTATION_Y: Partial<Record<string, number>> = {};
const NODE_ID_Y_OFFSET: Partial<Record<string, number>> = {};
const NODE_ID_Z_OFFSET: Partial<Record<string, number>> = {};

interface NodeModelProps {
  nodeId: string;
  corpKey: string;
  // Overrides the corp glb when set (Q1 swaps to the GLaD model once cleared).
  modelUrl?: string;
  cleared: boolean;
  dimmed: boolean;
  selected: boolean;
  securityLevel: number;
  blocked: boolean;
  nightfall: boolean;
}

const PASTEL_RED = 0xff6060;
// Dawn: nodes render in pastel green at 70% brightness with saturation halved,
// full opacity (green analogues of the pastel-red surface/line colours).
const NIGHTFALL_RED = 0x5f975f; // pastel green, 70% brightness, saturation halved
const nightfallLineMat = new THREE.LineBasicMaterial({ color: 0x89a589 });

const surfaceMatCache = new Map<number, THREE.MeshBasicMaterial>();
function getSurfaceMat(color: number, opacity: number): THREE.MeshBasicMaterial {
  const key = (color << 8) | Math.round(opacity * 255);
  let m = surfaceMatCache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    surfaceMatCache.set(key, m);
  }
  return m;
}
const clearedMatCache = new Map<number, THREE.MeshStandardMaterial>();
function getClearedMat(color: number): THREE.MeshStandardMaterial {
  let m = clearedMatCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, emissive: EMISSIVE_CLEARED, emissiveIntensity: 0.4, metalness: 0.05, roughness: 0.8 });
    clearedMatCache.set(color, m);
  }
  return m;
}

function NodeModel({ nodeId, corpKey, modelUrl, cleared, dimmed, selected, securityLevel, blocked, nightfall }: NodeModelProps) {
  const { scene } = useGLTF(modelUrl ?? GLB_URLS[corpKey] ?? GLB_URLS.hq);
  const fpMap = useContext(NodeFootprintContext);
  const fpRef = useRef<{ halfX: number; halfZ: number }>({ halfX: 0, halfZ: 0 });
  useEffect(() => {
    fpMap.set(nodeId, fpRef);
    return () => { fpMap.delete(nodeId); };
  }, [nodeId, fpMap]);

  const { obj, pos, scale } = useMemo(() => {
    const c = scene.clone(true);
    c.rotation.y = MODEL_BASE_ROTATION_Y + (MODEL_ROTATION_Y[corpKey] ?? 0) + (NODE_ID_ROTATION_Y[nodeId] ?? 0);

    c.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(c);

    // Center on footprint (vertices near bottom), not 3D bbox center.
    const tol = (box.max.y - box.min.y) * 0.05;
    const yCutoff = box.min.y + tol;
    let fpMinX = Infinity, fpMaxX = -Infinity, fpMinZ = Infinity, fpMaxZ = -Infinity, fpCount = 0;
    const v = new THREE.Vector3();
    c.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      const pos = mesh.geometry.attributes.position;
      if (!pos) return;
      mesh.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld);
        if (v.y <= yCutoff) {
          if (v.x < fpMinX) fpMinX = v.x;
          if (v.x > fpMaxX) fpMaxX = v.x;
          if (v.z < fpMinZ) fpMinZ = v.z;
          if (v.z > fpMaxZ) fpMaxZ = v.z;
          fpCount++;
        }
      }
    });
    const center = new THREE.Vector3();
    if (fpCount > 0) {
      center.set((fpMinX + fpMaxX) / 2, 0, (fpMinZ + fpMaxZ) / 2);
    } else {
      box.getCenter(center);
    }

    const baseColor = blocked
      ? PASTEL_RED
      : new THREE.Color(secColor(securityLevel)).multiplyScalar(0.85).getHex();
    const brightTopMultiplier: Partial<Record<string, number>> = { warez: 1.15, ped: 1.4 };
    const brightTopMul = brightTopMultiplier[corpKey];
    const brightTopCorp = brightTopMul !== undefined;
    const brightColor = blocked
      ? PASTEL_RED
      : new THREE.Color(secColor(securityLevel)).multiplyScalar(brightTopMul ?? 1).getHex();
    const wantOverlay = !(cleared && !dimmed);

    const splitMeshByUpFaces = (mesh: THREE.Mesh) => {
      const geom = mesh.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position as THREE.BufferAttribute;
      if (!pos) return false;
      const idx = geom.index;
      const triCount = idx ? idx.count / 3 : pos.count / 3;
      mesh.updateWorldMatrix(true, false);
      const nMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
      const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
      const ab = new THREE.Vector3(), ac = new THREE.Vector3(), n = new THREE.Vector3();
      const upTris: number[] = [];
      const otherTris: number[] = [];
      for (let t = 0; t < triCount; t++) {
        const ia = idx ? idx.getX(t * 3) : t * 3;
        const ib = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
        const ic = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
        va.fromBufferAttribute(pos, ia);
        vb.fromBufferAttribute(pos, ib);
        vc.fromBufferAttribute(pos, ic);
        ab.subVectors(vb, va); ac.subVectors(vc, va); n.crossVectors(ab, ac).applyMatrix3(nMat).normalize();
        if (n.y >= 0.9) upTris.push(ia, ib, ic); else otherTris.push(ia, ib, ic);
      }
      if (upTris.length === 0 || otherTris.length === 0) return false;
      const newIdx = upTris.concat(otherTris);
      const newGeom = geom.clone();
      newGeom.setIndex(newIdx);
      newGeom.clearGroups();
      newGeom.addGroup(0, upTris.length, 0);
      newGeom.addGroup(upTris.length, otherTris.length, 1);
      mesh.geometry = newGeom;
      return true;
    };

    if (cleared && !dimmed) {
      const mat = getClearedMat(baseColor);
      const matBright = getClearedMat(brightColor);
      c.traverse((child) => {
        const m = child as THREE.Mesh;
        if (!m.isMesh) return;
        if (brightTopCorp && splitMeshByUpFaces(m)) {
          m.material = [matBright, mat];
        } else {
          m.material = mat;
        }
        m.castShadow = true;
      });
    } else {
      const surfBase = nightfall ? NIGHTFALL_RED : (blocked ? PASTEL_RED : 0xaaaaaa);
      const surfMat = dimmed ? dimmedSurfaceMat : getSurfaceMat(surfBase, blocked ? 0.315 : 0.45);
      const surfMatBright = dimmed ? dimmedSurfaceMat : getSurfaceMat(surfBase, blocked ? 0.455 : 0.65);
      c.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (brightTopCorp && splitMeshByUpFaces(mesh)) {
          mesh.material = [surfMatBright, surfMat];
        } else {
          mesh.material = surfMat;
        }
        mesh.castShadow = false;
      });
    }
    if (wantOverlay) {
      const lineMat = nightfall ? nightfallLineMat : (dimmed ? dimmedLineMat : (blocked ? blockedLineMat : unclearedLineMat));
      const threshold = EDGES_THRESHOLD[corpKey] ?? EDGES_THRESHOLD_DEFAULT;
      const toAdd: { parent: THREE.Object3D; lines: THREE.LineSegments }[] = [];
      c.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh || !mesh.parent) return;
        const edges = new THREE.EdgesGeometry(mesh.geometry, threshold);
        const lines = new THREE.LineSegments(edges, lineMat);
        lines.position.copy(mesh.position);
        lines.rotation.copy(mesh.rotation);
        lines.scale.copy(mesh.scale);
        toAdd.push({ parent: mesh.parent, lines });
      });
      toAdd.forEach(({ parent, lines }) => parent.add(lines));
    }

    // Clone all materials so per-node opacity (reveal fade) doesn't mutate shared cache.
    c.traverse((child) => {
      const o = child as THREE.Mesh & THREE.LineSegments;
      const mat = (o as unknown as { material?: THREE.Material | THREE.Material[] }).material;
      if (!mat) return;
      const cloneOne = (m: THREE.Material): THREE.Material => {
        const cl = m.clone();
        cl.transparent = true;
        cl.userData.__baseOpacity = (m as unknown as { opacity?: number }).opacity ?? 1;
        return cl;
      };
      if (Array.isArray(mat)) {
        (o as unknown as { material: THREE.Material[] }).material = mat.map(cloneOne);
      } else {
        (o as unknown as { material: THREE.Material }).material = cloneOne(mat);
      }
    });

    const xzMul = MODEL_XZ_SCALE[corpKey] ?? 1;
    const uniMul = MODEL_SCALE_MUL[corpKey] ?? 1;
    const sy = MODEL_SCALE * uniMul;
    const sx = MODEL_SCALE * xzMul * uniMul;
    if (corpKey === "donut") {
      fpRef.current = {
        halfX: ((box.max.x - box.min.x) / 2) * sx,
        halfZ: ((box.max.z - box.min.z) / 2) * sx,
      };
    }
    return {
      obj: c,
      pos: [-center.x * sx, -box.min.y * sy + FLOOR_Y + (securityLevel - 1) * SEC_HEIGHT_STEP + (NODE_ID_Y_OFFSET[nodeId] ?? 0), -center.z * sx + (NODE_ID_Z_OFFSET[nodeId] ?? 0)] as [number, number, number],
      scale: [sx, sy, sx] as [number, number, number],
    };
  }, [scene, nodeId, corpKey, cleared, dimmed, selected, securityLevel, blocked, nightfall]); // eslint-disable-line react-hooks/exhaustive-deps

  return <primitive object={obj} scale={scale} position={pos} />;
}

interface NetmapNodeProps {
  node: INetmapBattleNode | INetmapNonBattleNode;
  position: [number, number, number];
  status: NodeStatus | undefined;
  isSelected: boolean;
  isNightfallDimmed: boolean;
  playerSecurityLevel: number;
  prereqCleared: boolean;
  clickDisabled?: boolean;
  onClick: () => void;
  onHover?: () => void;
}

export default function NetmapNode({
  node,
  position,
  status,
  isSelected,
  isNightfallDimmed,
  playerSecurityLevel,
  prereqCleared,
  clickDisabled,
  onClick,
  onHover,
}: NetmapNodeProps) {
  const meshGroupRef = useRef<THREE.Group>(null);
  const platformMat = useMemo(() => {
    const base = new THREE.Color(secColor(node.securityLevel));
    const c = isSelected ? base.clone().multiplyScalar(1.6) : base;
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: isSelected ? base : 0x000000,
      emissiveIntensity: isSelected ? 0.5 : 0,
      metalness: 0.05, roughness: 0.8,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    });
  }, [node.securityLevel, isSelected]);
  // Dawn: platform tiles match the floor — flat translucent green top face +
  // outline edges (no verticals), sec colour green-tinted at 20% opacity.
  const platformLineMat = useMemo(
    () => new THREE.LineBasicMaterial({
      color: new THREE.Color(secColor(node.securityLevel)).multiply(NIGHTFALL_TINT),
      transparent: true,
      opacity: NIGHTFALL_OPACITY,
    }),
    [node.securityLevel]
  );
  const platformFaceMat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: new THREE.Color(secColor(node.securityLevel)).multiply(NIGHTFALL_TINT),
      transparent: true,
      opacity: NIGHTFALL_OPACITY,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    [node.securityLevel]
  );
  const platformRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const yRef = useRef(0);
  const platformYMap = useContext(PlatformYContext);
  useEffect(() => {
    platformYMap.set(node.id, yRef);
    return () => { platformYMap.delete(node.id); };
  }, [node.id, platformYMap]);
  const targetY = (node.id !== Nodes.S1R && (isSelected || hovered)) ? RISE_AMOUNT : 0;

  const reveal = useContext(RevealContext);
  const revealActiveRef = useRef(false);

  useFrame(() => {
    const hovering = Math.abs(targetY - yRef.current) >= LERP_EPSILON;
    const startTime = reveal.startTimeMs.get(node.id);
    const elapsed = startTime !== undefined ? performance.now() - startTime : Infinity;
    const inReveal = elapsed < REVEAL_HOLD_MS + REVEAL_RISE_MS;
    if (!hovering && !inReveal && !revealActiveRef.current) return;

    if (hovering) yRef.current += (targetY - yRef.current) * LERP;

    let revealYOffset = 0;
    let revealOpacity = 1;
    let active = false;
    if (startTime !== undefined) {
      if (elapsed < REVEAL_HOLD_MS) {
        revealYOffset = REVEAL_LOW_Y;
        revealOpacity = 0;
        active = true;
      } else if (elapsed < REVEAL_HOLD_MS + REVEAL_RISE_MS) {
        const r = (elapsed - REVEAL_HOLD_MS) / REVEAL_RISE_MS;
        const eased = 1 - Math.pow(1 - r, 3);
        revealYOffset = REVEAL_LOW_Y * (1 - eased);
        revealOpacity = Math.min(1, r * 1.6);
        active = true;
      }
    }

    if (meshGroupRef.current) {
      meshGroupRef.current.position.y = yRef.current + revealYOffset;
      meshGroupRef.current.visible = !(active && revealOpacity <= 0);
      if (active || revealActiveRef.current) {
        meshGroupRef.current.traverse((child) => {
          const mat = (child as unknown as { material?: THREE.Material | THREE.Material[] }).material;
          if (!mat) return;
          const apply = (m: THREE.Material) => {
            const base = (m.userData?.__baseOpacity as number | undefined) ?? 1;
            (m as unknown as { opacity: number }).opacity = base * revealOpacity;
          };
          if (Array.isArray(mat)) mat.forEach(apply); else apply(mat);
        });
      }
    }
    if (platformRef.current) {
      platformRef.current.position.y = NODE_Y + yRef.current + PLATFORM_Y_OFFSET + (node.securityLevel - 1) * SEC_HEIGHT_STEP + revealYOffset;
      platformRef.current.visible = !(active && revealOpacity <= 0);
    }
    revealActiveRef.current = active;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const corpKey = useMemo(() => getCorpKey(node), [node.id]);

  if (status === undefined || status === NodeStatus.INVISIBLE) return null;

  const cleared = matchFlag(status, NodeStatus.WON);
  const blocked = !cleared && (node.securityLevel > playerSecurityLevel || !prereqCleared);
  // During nightfall, affected nodes read as inaccessible — pastel-red wireframe
  // mesh — instead of the old dark fade.
  const nfCleared = isNightfallDimmed ? false : cleared;
  const nfBlocked = isNightfallDimmed ? true : blocked;
  // Once Q1 is cleared, render it with the GLaD geometry instead of the hq model.
  // Keyed off real cleared (not nfCleared) since clearing Q1 triggers nightfall.
  const modelUrl = node.id === Nodes.Q1 && cleared ? GLB_URLS.glad : undefined;

  return (
    <>
      <group
        position={[position[0], NODE_Y, position[2]]}
        onClick={clickDisabled ? undefined : (e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={clickDisabled ? undefined : (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; onHover?.(); }}
        onPointerOut={clickDisabled ? undefined : () => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <mesh position={[0, PLATFORM_Y_OFFSET + (node.securityLevel - 1) * SEC_HEIGHT_STEP + (SELECT_RISE + 4) / 2, 0]}>
          <boxGeometry args={[3 * TILE_SIZE, SELECT_RISE + 4, 3 * TILE_SIZE]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <group ref={meshGroupRef}>
          {node.id !== Nodes.S1R && (
            <NodeModel nodeId={node.id} corpKey={corpKey} modelUrl={modelUrl} cleared={nfCleared} dimmed={false} selected={isSelected} securityLevel={node.securityLevel} blocked={nfBlocked} nightfall={isNightfallDimmed} />
          )}
          {node.id === Nodes.S1R && (() => {
            const w = 3 * TILE_SIZE;
            const h = 6 * TILE_SIZE;
            const baseY = PLATFORM_Y_OFFSET + (node.securityLevel - 1) * SEC_HEIGHT_STEP;
            const half = w / 2;
            return (
              <group position={[0, baseY + h / 2, 0]}>
                <mesh position={[0, 0,  half]} material={s1rGradientMat}>
                  <planeGeometry args={[w, h]} />
                </mesh>
                <mesh position={[0, 0, -half]} rotation={[0, Math.PI, 0]} material={s1rGradientMat}>
                  <planeGeometry args={[w, h]} />
                </mesh>
                <mesh position={[ half, 0, 0]} rotation={[0,  Math.PI / 2, 0]} material={s1rGradientMat}>
                  <planeGeometry args={[w, h]} />
                </mesh>
                <mesh position={[-half, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={s1rGradientMat}>
                  <planeGeometry args={[w, h]} />
                </mesh>
              </group>
            );
          })()}
        </group>

        {hovered && (
          <Html center distanceFactor={30} style={{ pointerEvents: "none" }}>
            <div className="node-tooltip" style={{ opacity: 1 }}>
              <span>[{NODE_KEY_BY_ID[node.id] ?? node.id}]</span>
              <span>{node.nodeStyle.netmapOrgName}</span>
              <span>{node.name}</span>
              <span>Security Level {node.securityLevel}</span>
            </div>
          </Html>
        )}
      </group>

      <group ref={platformRef} position={[position[0], NODE_Y + PLATFORM_Y_OFFSET + (node.securityLevel - 1) * SEC_HEIGHT_STEP, position[2]]}>
        {TILE_OFFSETS.map(([ox, oz], i) => (
          <React.Fragment key={i}>
            {isNightfallDimmed ? (
              <group position={[ox, 0, oz]}>
                <mesh geometry={DAWN_TOP_FACE} material={platformFaceMat} />
                <lineSegments geometry={DAWN_TOP_EDGES} material={platformLineMat} />
              </group>
            ) : (
              <>
                <mesh position={[ox, 0, oz]} geometry={FLOOR_COLUMN_GEO} material={platformMat} receiveShadow />
                <mesh position={[ox, 0.001, oz]} geometry={FLOOR_FRAME_GEO} material={FLOOR_FRAME_MAT} renderOrder={1} />
              </>
            )}
          </React.Fragment>
        ))}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glowMat}>
          <planeGeometry args={[3.2 * TILE_SIZE, 3.2 * TILE_SIZE]} />
        </mesh>
      </group>
    </>
  );
}
