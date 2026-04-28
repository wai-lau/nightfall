import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Bug: IProgram = {
  id: "Bug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Bug.png"),
  name: "Bug",
  description: "Fast, Cheap, and Out of Control",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 1,
  numMoves: 5,
};
