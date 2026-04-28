import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const BlackWidow: IProgram = {
  id: "BlackWidow",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/BlackWidow.png"),
  name: "Black Widow",
  description: "Speedier and Creepier",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Paralyze",
      description: "Decreases Move Rate of Target Program by 3",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -3)],
    },
  ],
  maxSize: 3,
  numMoves: 4,
};
