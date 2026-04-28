import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Catapult: IProgram = {
  id: "Catapult",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Catapult.png"),
  name: "Catapult",
  description: "Extreme-Range Mobile Attacker",
  actions: [
    {
      name: "Fling",
      description: "Deletes 2 Sectors From Target",
      range: 4,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 3,
  numMoves: 2,
};
