import React, { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
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
import NetmapEdges from "./netmap3d/NetmapEdges";
import NetmapNode from "./netmap3d/NetmapNode";
import { pixelToWorldXZ, toWorld } from "../util/netmap3d";

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

  React.useEffect(() => {
    audioContext.player.playAudio(AudioSources.Netmap, { loop: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bindArrowScroll = useCallback((api: ArrowScrollAPI) => {
    arrowApiRef.current = api;
  }, []);

  const initialTarget = pixelToWorldXZ(initialScrollX + viewWidth / 2, initialScrollY + viewHeight / 2);

  return (
    <div className="netmap-container">
      <Canvas
        style={{ position: "absolute", inset: 0 }}
        camera={{ fov: 50, near: 0.1, far: 5000 }}
        gl={{ alpha: false }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 40, 20]} intensity={0.8} />

        <CameraController
          initialTarget={initialTarget}
          bindScrollFunction={bindScrollFunction}
          bindArrowScroll={bindArrowScroll}
        />

        <NetmapEdges nodes={nodes} positions={positions} netmapStatus={netmapStatus} />

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
            />
          );
        })}
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
