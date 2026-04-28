import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const GuardPup: IProgram = {
  id: "GuardPup",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/GuardPup.png"),
  name: "Guard Pup",
  description: "A Speedy Little Corporate Cur",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 2,
  numMoves: 3,
};
