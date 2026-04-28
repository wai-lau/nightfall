import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const GuardDog: IProgram = {
  id: "GuardDog",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/GuardDog.png"),
  name: "Guard Dog",
  description: "Who Let This Dog Out?",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
