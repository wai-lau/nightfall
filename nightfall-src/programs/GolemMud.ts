import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const GolemMud: IProgram = {
  id: "GolemMud",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemMud.png"),
  name: "Golem.Mud",
  description: "Slow and Steady Attack Program",
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
