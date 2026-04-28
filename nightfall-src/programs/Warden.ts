import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Warden: IProgram = {
  id: "Warden",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/Warden.png"),
  name: "Warden",
  description: "Slow and Steady Corporate Attack Program",
  actions: [
    {
      name: "Thump",
      description: "Deletes 3 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
    },
  ],
  maxSize: 5,
  numMoves: 1,
};
