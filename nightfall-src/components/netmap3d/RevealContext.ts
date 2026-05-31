import { createContext } from "react";

export const REVEAL_HOLD_MS = 750;
export const REVEAL_RISE_MS = 1400;
export const REVEAL_FLOW_MS = 1600;
export const REVEAL_LOW_Y = -10;
// Nodes spawn deeper than the floor tiles so the whole model starts below the
// ground fog (fully fogged under FLOOR_Y - 8) and rises up out of it.
export const REVEAL_NODE_LOW_Y = -16;

export interface RevealState {
  startTimeMs: Map<string, number>;
}

export const RevealContext = createContext<RevealState>({ startTimeMs: new Map() });
