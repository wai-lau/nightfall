import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Tower: IProgram = {
  id: "Tower",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/Tower.png"),
  name: "TOWER",
  description: "Immobile Long-Range Program",
  actions: [
    {
      name: "Spot",
      description: "Deletes 3 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
