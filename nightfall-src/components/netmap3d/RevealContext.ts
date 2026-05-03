import { createContext } from "react";

export const REVEAL_HOLD_MS = 750;
export const REVEAL_RISE_MS = 700;
export const REVEAL_FLOW_MS = 1600;
export const REVEAL_LOW_Y = -10;

export interface RevealState {
  startTimeMs: Map<string, number>;
}

export const RevealContext = createContext<RevealState>({ startTimeMs: new Map() });
