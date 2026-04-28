import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Ballista: IProgram = {
  id: "Ballista",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Ballista.png"),
  name: "Ballista",
  description: "Extreme-Range Attack Program",
  actions: [
    {
      name: "Fling",
      description: "Deletes 2 Sectors From Target",
      range: 4,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 2,
  numMoves: 1,
};
