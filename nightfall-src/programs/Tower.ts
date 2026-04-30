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
      description: "Deletes 1 Sector From Target",
      range: 6,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
