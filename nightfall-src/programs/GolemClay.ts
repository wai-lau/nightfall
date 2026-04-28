import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const GolemClay: IProgram = {
  id: "GolemClay",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemClay.png"),
  name: "Golem.Clay",
  description: "Clay is Stonger Than Mud",
  actions: [
    {
      name: "Bash",
      description: "Deletes 5 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 5)],
    },
  ],
  maxSize: 6,
  numMoves: 2,
};
