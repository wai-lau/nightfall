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

// 'x' = X-first: corner at (to.x, from.z)
// 'z' = Z-first: corner at (from.x, to.z)
const CORNER: Record<string, "x" | "z"> = {
  // S1 root connections (not in prereqs)
  "smart-hq->warez-1":            "z",
  "smart-hq->lmm-techsupport":    "z",
  // smart-hq->ph-prdatabase is straight (same Z)

  // Level 1
  "ph-prdatabase->ph-employee":    "x",
  "ph-prdatabase->car-memorytower":"x",
  "car-memorytower->ph-govaffairs":"x",
  "car-memorytower->car-sydney":   "z",
  "car-memorytower->lmm-eastern":  "z",
  "lmm-techsupport->lmm-clubcenter":"x",

  // Level 2
  "lmm-clubcenter->car-inventory": "z",
  "car-inventory->warez-2":        "x",
  "lmm-clubcenter->car-commshub":  "x",
  "car-commshub->lmm-print":       "z",
  "lmm-print->lmm-banane":         "x",
  "car-commshub->donut-supply":    "x",
  "donut-supply->donut-franchise": "x",
  "lmm-eastern->ph-clinical":      "x",

  // Level 3
  "ph-clinical->lmm-toy":          "x",
  "lmm-toy->warez-3":              "x",
  "lmm-toy->ped-offshore":         "x",
  "ped-offshore->ph-vaccine":      "x",
  "ph-vaccine->ph-hmo":            "x",
  "donut-franchise->donut-market": "x",
  "donut-market->donut-beverage":  "z",
  "donut-market->donut-flavor":    "z",
  "donut-market->lmm-jungle":      "x",
  "donut-franchise->ped-fiduciary":"x",
  "ped-fiduciary->car-substation": "z",
  "car-substation->car-archives":  "z",
  "ped-fiduciary->ped-reinsurance":"x",

  // Level 4
  "donut-beverage->lmm-assimilation":"x",
  "lmm-assimilation->warez-4":     "x",
  "lmm-assimilation->donut-recipe":"x",
  "donut-recipe->lmm-film":        "z",
  "donut-recipe->ped-rdbackup":    "x",
  "ped-rdbackup->ph-syscore":      "z",
  "ph-syscore->ped-executive":     "z",
  "ped-executive->ped-treasury":   "z",
  "ped-treasury->ped-privileged":  "z",
  "ped-treasury->ph-proprietary":  "z",

  // Level 5
  "ph-syscore->disarray-hq":       "x",
};

type VisualEdge = { from: string; to: string };

const EXTRA_EDGES: VisualEdge[] = [
  { from: "smart-hq", to: "warez-1" },
  { from: "smart-hq", to: "lmm-techsupport" },
  { from: "smart-hq", to: "ph-prdatabase" },
];

export default function NetmapEdges({ nodes, positions, netmapStatus }: NetmapEdgesProps) {
  const edges = useMemo(() => {
    const prereqEdges: VisualEdge[] = nodes
      .filter(n => !!n.prereq)
      .map(n => ({ from: n.prereq!, to: n.id }));

    const allEdges = [...EXTRA_EDGES, ...prereqEdges];

    return allEdges.map(({ from, to }) => {
      const fromPos = positions[from];
      const toPos = positions[to];
      if (!fromPos || !toPos) return null;

      const [fx, , fz] = toWorld(fromPos, 0);
      const [tx, , tz] = toWorld(toPos, 0);

      const toStatus = netmapStatus[to];
      const accessible = toStatus !== undefined && toStatus !== NodeStatus.INVISIBLE;

      const from3: [number, number, number] = [fx, EDGE_Y, fz];
      const to3: [number, number, number] = [tx, EDGE_Y, tz];

      const sameX = Math.abs(fx - tx) < 0.1;
      const sameZ = Math.abs(fz - tz) < 0.1;

      if (sameX || sameZ) {
        return { points: [from3, to3] as [number, number, number][], accessible };
      }

      const key = `${from}->${to}`;
      const dir = CORNER[key] ?? "z";
      const corner: [number, number, number] = dir === "x"
        ? [tx, EDGE_Y, fz]
        : [fx, EDGE_Y, tz];

      return { points: [from3, corner, to3] as [number, number, number][], accessible };
    }).filter((e): e is { points: [number, number, number][]; accessible: boolean } => e !== null);
  }, [nodes, positions, netmapStatus]);

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
