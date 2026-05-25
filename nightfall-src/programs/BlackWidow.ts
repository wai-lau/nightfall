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
      name: "Poison",
      description: "Decreases Move Rate of Target Program by 2",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -2)],
    },
  ],
  maxSize: 2,
  numMoves: 4,
};
