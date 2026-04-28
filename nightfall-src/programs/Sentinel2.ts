import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sentinel2: IProgram = {
  id: "Sentinel2",
  color: "rgb(252,152,0)",
  iconImageFile: resolveImage("programs/Sentinel2.png"),
  name: "Sentinel 2.0",
  description: "Improved Corporate Data Defender",
  actions: [
    {
      name: "Cut",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
