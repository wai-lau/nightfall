import { NetmapPosition } from "../types";

export const SCALE = 10;
export const OFFSET_X = 98;
export const OFFSET_Z = 71;
export const DEPTH_SCALE = 1.5;

export const TILE_SIZE = 2.5;

export function toWorld(pos: NetmapPosition, secLevel: number): [number, number, number] {
  const x = pos[0] / SCALE - OFFSET_X;
  const z = pos[1] / SCALE - OFFSET_Z;
  return [
    Math.round(x / TILE_SIZE) * TILE_SIZE,
    secLevel * DEPTH_SCALE,
    Math.round(z / TILE_SIZE) * TILE_SIZE,
  ];
}

export function pixelToWorldXZ(px: number, pz: number): [number, number] {
  return [px / SCALE - OFFSET_X, pz / SCALE - OFFSET_Z];
}
