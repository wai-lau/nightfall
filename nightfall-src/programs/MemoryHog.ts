import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const MemoryHog: IProgram = {
  id: "MemoryHog",
  color: "rgb(182,252,0)",
  iconImageFile: resolveImage("programs/MemoryHog.png"),
  name: "Memory Hog",
  description: "Massive Memory-Filling Bloatware",
  actions: [],
  maxSize: 30,
  numMoves: 8,
};
