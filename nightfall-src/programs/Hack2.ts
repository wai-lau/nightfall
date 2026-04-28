import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Hack2: IProgram = {
  id: "Hack2",
  color: "rgb(0,199,252)",
  iconImageFile: resolveImage("programs/Hack2.png"),
  name: "Hack 2.0",
  description: "Improved Hack: Larger Size and Better Attacks",
  actions: [
    {
      name: "Slice",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Dice",
      description: "Deletes 3 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
      sizeReq: 3,
    },
  ],
  maxSize: 4,
  numMoves: 3,
};
