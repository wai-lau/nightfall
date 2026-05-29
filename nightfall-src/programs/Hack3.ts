import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Hack3: IProgram = {
  id: "Hack3",
  color: "rgb(0,199,252)",
  iconImageFile: resolveImage("programs/Hack3.png"),
  name: "Hack 3.0",
  description: "The Top of the Hack Series",
  actions: [
    {
      name: "Slice",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Cleave",
      description: "Deletes 4 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
      sizeReq: 4,
    },
  ],
  maxSize: 4,
  numMoves: 4,
};
