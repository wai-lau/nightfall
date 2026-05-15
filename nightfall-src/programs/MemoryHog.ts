import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const MemoryHog: IProgram = {
  id: "MemoryHog",
  color: "rgb(182,252,0)",
  iconImageFile: resolveImage("programs/MemoryHog.png"),
  name: "Memory Hog",
  description: "Massive Memory-Filling Bloatware",
  actions: [
    {
      name: "Hug",
      description: "Decreases Movement of Target and Self by 1",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.changeTargetMoves(targetID, -1),
        ac.changeTargetMoves(selfID, -1),
      ],
    },
  ],
  maxSize: 30,
  numMoves: 6,
};
