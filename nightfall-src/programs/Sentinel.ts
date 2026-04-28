import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sentinel: IProgram = {
  id: "Sentinel",
  color: "rgb(252,152,0)",
  iconImageFile: resolveImage("programs/Sentinel.png"),
  name: "Sentinel",
  description: "Corporate Data Defender",
  actions: [
    {
      name: "Cut",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 3,
  numMoves: 1,
};
