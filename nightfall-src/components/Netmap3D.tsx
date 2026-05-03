import React, { useRef, useCallback, useMemo, useState, useEffect, Suspense } from "react";
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
import NetmapEdges, { computeEdgeRoutes } from "./netmap3d/NetmapEdges";
import NetmapFloor, { secColor, FLOOR_Y } from "./netmap3d/NetmapFloor";
import NetmapNode from "./netmap3d/NetmapNode";
import { RevealContext } from "./netmap3d/RevealContext";
import { pixelToWorldXZ, toWorld, TILE_SIZE, OFFSET_X, OFFSET_Z, buildSecMap } from "../util/netmap3d";
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
    securityLevel: playerSecurityLevel,
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

  // Force Canvas remount when the netmap-container's box size changes. fiber 7's
  // use-measure doesn't pick up FS layout swaps reliably on iOS Safari → right half
  // crops. ResizeObserver on the wrapper catches both physical rotation and inline
  // !important style swaps from wai-body.html FS toggle.
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportKey, setViewportKey] = useState("0x0");
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      const w = Math.round(e.contentRect.width);
      const h = Math.round(e.contentRect.height);
      setViewportKey(`${w}x${h}`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const revealStartRef = useRef<Map<string, number>>(new Map());
  const prevStatusRef = useRef<{ [id: string]: NodeStatus | undefined }>({});
  const initRef = useRef(false);
  React.useEffect(() => {
    if (!initRef.current) {
      prevStatusRef.current = { ...netmapStatus };
      initRef.current = true;
      return;
    }
    const now = performance.now();
    const allIds = new Set([
      ...Object.keys(netmapStatus),
      ...Object.keys(prevStatusRef.current),
    ]);
    allIds.forEach((id) => {
      const cur = netmapStatus[id];
      const prev = prevStatusRef.current[id];
      const wasInvisible = prev === undefined || prev === NodeStatus.INVISIBLE;
      const isVisible = cur !== undefined && cur !== NodeStatus.INVISIBLE;
      if (wasInvisible && isVisible) revealStartRef.current.set(id, now);
    });
    prevStatusRef.current = { ...netmapStatus };
  }, [netmapStatus]);
  const revealCtx = useMemo(() => ({ startTimeMs: revealStartRef.current }), []);

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
    const routes = computeEdgeRoutes(nodes, positions, netmapStatus);
    // Sec map matches NetmapFloor's smoothing so forced edge tiles use natural Voronoi sec.
    const nodeTiles: [number, number][] = [];
    const nodeSec: number[] = [];
    for (const node of nodes) {
      const p = positions[node.id];
      if (!p) continue;
      const w = toWorld(p, node.securityLevel);
      nodeTiles.push([
        Math.floor((w[0] + OFFSET_X) / TILE_SIZE),
        Math.floor((w[2] + OFFSET_Z) / TILE_SIZE),
      ]);
      nodeSec.push(node.securityLevel);
    }
    const secMap = buildSecMap(nodeTiles, nodeSec);
    const seen = new Set<string>();
    for (const r of routes) {
      if (!r.render) continue;
      for (const [c, row] of r.path) {
        const k = `${c},${row}`;
        if (seen.has(k)) continue;
        seen.add(k);
        const sec = secMap.get(k) ?? 1;
        out.push([c, row, sec]);
      }
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
    <div className="netmap-container" ref={containerRef}>
      <Canvas
        key={viewportKey}
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

        <RevealContext.Provider value={revealCtx}>
        <NetmapFloor nodePositions={nodeFloorPositions} nodeSecurityLevels={nodeFloorSecurityLevels} extraTiles={pathTiles} />
        <NetmapEdges nodes={nodes} positions={positions} netmapStatus={netmapStatus} playerSecurityLevel={playerSecurityLevel} />

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
              playerSecurityLevel={playerSecurityLevel}
              onClick={() => onSelectNode(node.id)}
              onHover={onHover}
            />
          );
        })}
        </Suspense>
        </RevealContext.Provider>
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
