import React, { useMemo } from "react";
import { Line as DreiLine } from "@react-three/drei";

// Cast to avoid three-stdlib internal props leaking into JSX types
const Line = DreiLine as React.ComponentType<{
  points: [number, number, number][];
  color?: number;
  lineWidth?: number;
  key?: string;
}>;
import { INetmap, NodeStatus } from "../../types";
import { toWorld } from "../../util/netmap3d";

interface NetmapEdgesProps {
  nodes: INetmap["nodes"];
  positions: INetmap["positions"];
  netmapStatus: { [id: string]: NodeStatus };
}

interface StaticEdge {
  from: string;
  to: string;
  fromPoint: [number, number, number];
  toPoint: [number, number, number];
}

export default function NetmapEdges({ nodes, positions, netmapStatus }: NetmapEdgesProps) {
  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const staticEdges = useMemo<StaticEdge[]>(() => {
    return nodes
      .filter((n) => !!n.prereq)
      .flatMap((n) => {
        const fromNode = nodeMap.get(n.prereq!);
        const fromPos = positions[n.prereq!];
        const toPos = positions[n.id];
        if (!fromNode || !fromPos || !toPos) return [];
        return [{
          from: n.prereq!,
          to: n.id,
          fromPoint: toWorld(fromPos, fromNode.securityLevel),
          toPoint: toWorld(toPos, n.securityLevel),
        }];
      });
  }, [nodes, positions, nodeMap]);

  return (
    <>
      {staticEdges.map((edge) => {
        const toStatus = netmapStatus[edge.to];
        const accessible = toStatus !== undefined && toStatus !== NodeStatus.INVISIBLE;
        const points: [number, number, number][] = [edge.fromPoint, edge.toPoint];
        return (
          <Line
            key={`edge-${edge.from}-${edge.to}`}
            points={points}
            color={accessible ? 0xaaaaaa : 0x333333}
            lineWidth={accessible ? 1.5 : 1}
          />
        );
      })}
    </>
  );
}
