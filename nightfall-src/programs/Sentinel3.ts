import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sentinel3: IProgram = {
  id: "Sentinel3",
  color: "rgb(252,152,0)",
  iconImageFile: resolveImage("programs/Sentinel3.png"),
  name: "Sentinel 3.0",
  description: "Sentinel That Attacks Several Programs At Once",
  actions: [
    {
      name: "Taser",
      description: "Deletes 4 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
