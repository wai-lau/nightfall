import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Hack: IProgram = {
  id: "Hack",
  color: "rgb(0,199,252)",
  iconImageFile: resolveImage("programs/Hack.png"),
  name: "Hack",
  description: "Basic Attack Program",
  actions: [
    {
      name: "Slice",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
