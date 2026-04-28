import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const MobileTower: IProgram = {
  id: "MobileTower",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/MobileTower.png"),
  name: "MOBILE TOWER",
  description: "Slow-Moving Long-Range Program",
  actions: [
    {
      name: "Spot",
      description: "Deletes 3 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
    },
  ],
  maxSize: 1,
  numMoves: 1,
};
