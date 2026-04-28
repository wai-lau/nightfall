import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const GolemStone: IProgram = {
  id: "GolemStone",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemStone.png"),
  name: "Golem.Stone",
  description: "Nothing Can Stand In Its Way",
  actions: [
    {
      name: "Crash",
      description: "Deletes 7 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 7)],
    },
  ],
  maxSize: 7,
  numMoves: 3,
};
