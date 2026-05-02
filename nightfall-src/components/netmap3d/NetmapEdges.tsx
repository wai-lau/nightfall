import React, { useMemo } from "react";
import { Line as DreiLine } from "@react-three/drei";

const Line = DreiLine as unknown as React.ComponentType<{
  points: [number, number, number][];
  color?: string;
  lineWidth?: number;
  key?: React.Key;
}>;
import { INetmap, NodeStatus } from "../../types";
import { toWorld } from "../../util/netmap3d";
import { FLOOR_Y } from "./NetmapFloor";

interface NetmapEdgesProps {
  nodes: INetmap["nodes"];
  positions: INetmap["positions"];
  netmapStatus: { [id: string]: NodeStatus };
}

const EDGE_Y = FLOOR_Y + 0.08;

// Axis-aligned segment: [x1, z1, x2, z2]
type Seg = [number, number, number, number];

function segsCross(a: Seg, b: Seg): boolean {
  const aHoriz = Math.abs(a[1] - a[3]) < 0.01;
  const bHoriz = Math.abs(b[1] - b[3]) < 0.01;

  // Parallel — check for interior overlap
  if (aHoriz === bHoriz) {
    if (aHoriz) {
      if (Math.abs(a[1] - b[1]) > 0.01) return false;
      const [a0, a1] = [Math.min(a[0], a[2]), Math.max(a[0], a[2])];
      const [b0, b1] = [Math.min(b[0], b[2]), Math.max(b[0], b[2])];
      return a0 < b1 - 0.01 && b0 < a1 - 0.01;
    } else {
      if (Math.abs(a[0] - b[0]) > 0.01) return false;
      const [a0, a1] = [Math.min(a[1], a[3]), Math.max(a[1], a[3])];
      const [b0, b1] = [Math.min(b[1], b[3]), Math.max(b[1], b[3])];
      return a0 < b1 - 0.01 && b0 < a1 - 0.01;
    }
  }

  // One horizontal, one vertical — strict interior T/+ crossing
  const [h, v] = aHoriz ? [a, b] : [b, a];
  const hMinX = Math.min(h[0], h[2]);
  const hMaxX = Math.max(h[0], h[2]);
  const vMinZ = Math.min(v[1], v[3]);
  const vMaxZ = Math.max(v[1], v[3]);
  const vx = v[0];
  const hz = h[1];
  return vx > hMinX + 0.01 && vx < hMaxX - 0.01 && hz > vMinZ + 0.01 && hz < vMaxZ - 0.01;
}

function crossCount(segs: Seg[], existing: Seg[]): number {
  return segs.reduce((n, s) => n + existing.filter(e => segsCross(s, e)).length, 0);
}

export default function NetmapEdges({ nodes, positions, netmapStatus }: NetmapEdgesProps) {
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const edges = useMemo(() => {
    const routed: Seg[] = [];
    const result: { points: [number, number, number][]; accessible: boolean }[] = [];

    for (const node of nodes) {
      if (!node.prereq) continue;
      const fromNode = nodeMap.get(node.prereq);
      const fromPos = positions[node.prereq];
      const toPos = positions[node.id];
      if (!fromNode || !fromPos || !toPos) continue;

      const [fx, , fz] = toWorld(fromPos, fromNode.securityLevel);
      const [tx, , tz] = toWorld(toPos, node.securityLevel);

      const status = netmapStatus[node.id];
      const accessible = status !== undefined && status !== NodeStatus.INVISIBLE;

      const from3: [number, number, number] = [fx, EDGE_Y, fz];
      const to3: [number, number, number] = [tx, EDGE_Y, tz];

      const sameX = Math.abs(fx - tx) < 0.01;
      const sameZ = Math.abs(fz - tz) < 0.01;

      if (sameX || sameZ) {
        // Straight line
        routed.push([fx, fz, tx, tz]);
        result.push({ points: [from3, to3], accessible });
        continue;
      }

      // Option 0: go X first → corner at (tx, fz)
      const segs0: Seg[] = [[fx, fz, tx, fz], [tx, fz, tx, tz]];
      // Option 1: go Z first → corner at (fx, tz)
      const segs1: Seg[] = [[fx, fz, fx, tz], [fx, tz, tx, tz]];

      // Z-first preferred (matches netmap.png trunk pattern); fall back to X-first if fewer crossings
      const useOpt0 = crossCount(segs1, routed) < crossCount(segs0, routed);
      const chosen = useOpt0 ? segs0 : segs1;
      const corner: [number, number, number] = useOpt0 ? [tx, EDGE_Y, fz] : [fx, EDGE_Y, tz];

      routed.push(...chosen);
      result.push({ points: [from3, corner, to3], accessible });
    }

    return result;
  }, [nodes, positions, netmapStatus, nodeMap]);

  return (
    <>
      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge.points}
          color={edge.accessible ? "#aaaaaa" : "#333333"}
          lineWidth={edge.accessible ? 1.5 : 1}
        />
      ))}
    </>
  );
}
