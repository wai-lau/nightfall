import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Tarantula: IProgram = {
  id: "Tarantula",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/Tarantula.png"),
  name: "Tarantula",
  description: "Fast, with a Venomous Bite",
  actions: [
    {
      name: "Megabyte",
      description: "Deletes 3 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
    },
    {
      name: "Paralyze",
      description: "Decreases Move Rate of Target Program by 3",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -3)],
    },
  ],
  maxSize: 3,
  numMoves: 5,
};
