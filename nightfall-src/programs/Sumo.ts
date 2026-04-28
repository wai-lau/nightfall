import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sumo: IProgram = {
  id: "Sumo",
  color: "rgb(182,252,0)",
  iconImageFile: resolveImage("programs/Sumo.png"),
  name: "Sumo",
  description: "A Massive and Slow-Moving Powerhouse",
  actions: [
    {
      name: "Slam",
      description: "Deletes 8 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 8)],
    },
  ],
  maxSize: 12,
  numMoves: 2,
};
