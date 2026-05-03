import React, { useRef, useCallback, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import {
  INetmap,
  INetmapNode,
  NodeStatus,
  IProgram,
  ALL_DIRECTIONS,
  NetmapPosition,
} from "../types";
import { AudioContext, IAudioContext } from "../util/AudioContext";
import * as AudioSources from "../audio/audioSources";
import { CreditDisplay } from "./CreditDisplay";
import CurrentPrograms from "./CurrentPrograms";
import Button from "./Button";
import CameraController, { ArrowScrollAPI } from "./netmap3d/CameraController";
import NetmapEdges, { CORNER, EXTRA_EDGES } from "./netmap3d/NetmapEdges";
import NetmapFloor, { secColor, FLOOR_Y } from "./netmap3d/NetmapFloor";
import NetmapNode from "./netmap3d/NetmapNode";
import { pixelToWorldXZ, toWorld, TILE_SIZE, OFFSET_X, OFFSET_Z } from "../util/netmap3d";
import { leadDebounce } from "../util/util";

const HOVER_SOUNDS = [AudioSources.HoverC, AudioSources.HoverEb, AudioSources.HoverF];

// Ground fog: patch three.js fog shader chunks to be y-based instead of distance-based.
// Columns below GROUND_FOG_BOTTOM_Y fully fogged; above GROUND_FOG_TOP_Y unfogged.
const GROUND_FOG_BOTTOM_Y = FLOOR_Y - 8;
const GROUND_FOG_TOP_Y = FLOOR_Y - 1;

THREE.ShaderChunk.fog_pars_vertex = `
#ifdef USE_FOG
  varying float vFogWorldY;
#endif
`;
THREE.ShaderChunk.fog_vertex = `
#ifdef USE_FOG
  vFogWorldY = (modelMatrix * vec4(transformed, 1.0)).y;
#endif
`;
THREE.ShaderChunk.fog_pars_fragment = `
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogWorldY;
#endif
`;
THREE.ShaderChunk.fog_fragment = `
#ifdef USE_FOG
  float fogT = clamp((vFogWorldY - float(${GROUND_FOG_BOTTOM_Y})) / float(${GROUND_FOG_TOP_Y - GROUND_FOG_BOTTOM_Y}), 0.0, 1.0);
  float fogFactor = pow(1.0 - fogT, 0.5);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif
`;

interface Netmap3DProps extends INetmap {
  initialScrollX?: number;
  initialScrollY?: number;
  viewWidth: number;
  viewHeight: number;
  onSelectNode: (id: string) => void;
  netmapStatus: { [id: string]: NodeStatus };
  credits: number;
  securityLevel: number;
  showArrows?: boolean;
  programs: IProgram[];
  forceShowPrograms: boolean;
  bindScrollFunction: (f: (pos: NetmapPosition, duration?: number) => Promise<NetmapPosition>) => void;
  selectedID?: string;
  onMenu: () => void;
  nightfallAvailableNodes?: INetmapNode["id"][];
}

export default function Netmap3D(props: Netmap3DProps) {
  const {
    nodes,
    positions,
    netmapStatus,
    credits,
    showArrows = true,
    programs,
    forceShowPrograms,
    bindScrollFunction,
    selectedID,
    onMenu,
    nightfallAvailableNodes,
    onSelectNode,
    initialScrollX = 0,
    initialScrollY = 0,
    viewWidth,
    viewHeight,
  } = props;

  const audioContext = React.useContext(AudioContext) as IAudioContext;
  const arrowApiRef = useRef<ArrowScrollAPI | null>(null);
  const hoverIdxRef = useRef(0);
  const onHover = useMemo(
    () => leadDebounce(() => {
      audioContext.player.playAudio(HOVER_SOUNDS[hoverIdxRef.current]);
      hoverIdxRef.current = (hoverIdxRef.current + 1) % HOVER_SOUNDS.length;
    }, 500),
    [audioContext]
  );

  React.useEffect(() => {
    audioContext.player.playAudio(AudioSources.Netmap, { loop: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bindArrowScroll = useCallback((api: ArrowScrollAPI) => {
    arrowApiRef.current = api;
  }, []);

  const initialTarget = pixelToWorldXZ(initialScrollX + viewWidth / 2, initialScrollY + viewHeight / 2);

  const scrollBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const node of nodes) {
      const p = positions[node.id];
      if (!p) continue;
      const st = netmapStatus[node.id];
      if (st === undefined || st === NodeStatus.INVISIBLE) continue;
      const w = toWorld(p, node.securityLevel);
      if (w[0] < minX) minX = w[0];
      if (w[0] > maxX) maxX = w[0];
      if (w[2] < minZ) minZ = w[2];
      if (w[2] > maxZ) maxZ = w[2];
    }
    if (!isFinite(minX)) return undefined;
    const pad = TILE_SIZE * 4;
    return { minX: minX - pad, maxX: maxX + pad, minZ: minZ - pad, maxZ: maxZ + pad };
  }, [nodes, positions, netmapStatus]);

  const { nodeFloorPositions, nodeFloorSecurityLevels } = useMemo(() => {
    const pos: [number, number][] = [];
    const sec: number[] = [];
    for (const node of nodes) {
      const p = positions[node.id];
      if (!p) continue;
      const st = netmapStatus[node.id];
      if (st === undefined || st === NodeStatus.INVISIBLE) continue;
      const w = toWorld(p, node.securityLevel);
      pos.push([w[0], w[2]]);
      sec.push(node.securityLevel);
    }
    return { nodeFloorPositions: pos, nodeFloorSecurityLevels: sec };
  }, [nodes, positions, netmapStatus]);

  const pathTiles = useMemo<([number, number] | [number, number, number])[]>(() => {
    const out: ([number, number] | [number, number, number])[] = [];
    const visible = (id: string) => {
      const st = netmapStatus[id];
      return st !== undefined && st !== NodeStatus.INVISIBLE;
    };
    const tileOf = (id: string): [number, number] | null => {
      const p = positions[id];
      if (!p) return null;
      const node = nodes.find(n => n.id === id);
      if (!node) return null;
      const w = toWorld(p, node.securityLevel);
      return [
        Math.floor((w[0] + OFFSET_X) / TILE_SIZE),
        Math.floor((w[2] + OFFSET_Z) / TILE_SIZE),
      ];
    };
    const prereqEdges = nodes.filter(n => !!n.prereq).map(n => ({ from: n.prereq!, to: n.id }));
    const allEdges = [...EXTRA_EDGES, ...prereqEdges];
    for (const { from, to } of allEdges) {
      if (!visible(from) || !visible(to)) continue;
      const a = tileOf(from);
      const b = tileOf(to);
      if (!a || !b) continue;
      const key = `${from}->${to}`;
      const dir = CORNER[key] ?? "z";
      const corner: [number, number] = dir === "x" ? [b[0], a[1]] : [a[0], b[1]];
      const fill = (p1: [number, number], p2: [number, number]) => {
        if (p1[0] === p2[0]) {
          const c = p1[0];
          const [r0, r1] = p1[1] < p2[1] ? [p1[1], p2[1]] : [p2[1], p1[1]];
          for (let r = r0; r <= r1; r++) out.push([c, r]);
        } else if (p1[1] === p2[1]) {
          const r = p1[1];
          const [c0, c1] = p1[0] < p2[0] ? [p1[0], p2[0]] : [p2[0], p1[0]];
          for (let c = c0; c <= c1; c++) out.push([c, r]);
        }
      };
      fill(a, corner);
      fill(corner, b);
    }
    const agora = nodes.find(n => n.id === "warez-4");
    const ap = agora && positions[agora.id];
    if (agora && ap) {
      const aw = toWorld(ap, agora.securityLevel);
      const ac = Math.floor((aw[0] + OFFSET_X) / TILE_SIZE);
      const ar = Math.floor((aw[2] + OFFSET_Z) / TILE_SIZE);
      out.push([ac - 2, ar + 1, agora.securityLevel]);
      out.push([ac - 1, ar + 2, agora.securityLevel]);
    }
    return out;
  }, [nodes, positions, netmapStatus]);

  return (
    <div className="netmap-container">
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        camera={{ fov: 50, near: 0.1, far: 5000 }}
        gl={{ alpha: false }}
        shadows={{ type: THREE.VSMShadowMap }}
      >
        <color attach="background" args={[secColor(3)]} />
        <fog attach="fog" args={[secColor(3), 1, 1000]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[0, 30, 60]} intensity={0.25} />
        <directionalLight
          position={[-20, 30, -20]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
          shadow-camera-near={1}
          shadow-camera-far={200}
          shadow-intensity={0.5}
          shadow-radius={14}
          shadow-blurSamples={32}
        />

        <CameraController
          initialTarget={initialTarget}
          bindScrollFunction={bindScrollFunction}
          bindArrowScroll={bindArrowScroll}
          bounds={scrollBounds}
        />

        <NetmapFloor nodePositions={nodeFloorPositions} nodeSecurityLevels={nodeFloorSecurityLevels} extraTiles={pathTiles} />
        <NetmapEdges nodes={nodes} positions={positions} netmapStatus={netmapStatus} />

        <Suspense fallback={null}>
        {nodes.map((node) => {
          const pos2d = positions[node.id];
          if (!pos2d) return null;
          const position = toWorld(pos2d, node.securityLevel);
          const isNightfallDimmed =
            nightfallAvailableNodes !== undefined &&
            !nightfallAvailableNodes.includes(node.id);
          return (
            <NetmapNode
              key={node.id}
              node={node}
              position={position}
              status={netmapStatus[node.id]}
              isSelected={node.id === selectedID}
              isNightfallDimmed={isNightfallDimmed}
              onClick={() => onSelectNode(node.id)}
              onHover={onHover}
            />
          );
        })}
        </Suspense>
      </Canvas>

      <div className="top-right-controls">
        <CreditDisplay numCredits={credits} />
        <Button isBold onClick={onMenu}>
          Menu
        </Button>
      </div>

      {showArrows &&
        ALL_DIRECTIONS.map((dir) => (
          <div
            key={dir}
            className={`arrow arrow-${dir}`}
            onMouseDown={() => arrowApiRef.current?.startScroll(dir)}
            onMouseUp={() => arrowApiRef.current?.endScroll()}
            onTouchStart={() => arrowApiRef.current?.startScroll(dir)}
            onTouchEnd={() => arrowApiRef.current?.endScroll()}
          />
        ))}

      <CurrentPrograms forceOn={forceShowPrograms} currentPrograms={programs} />
    </div>
  );
}
