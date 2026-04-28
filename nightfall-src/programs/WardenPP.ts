import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const WardenPP: IProgram = {
  id: "WardenPP",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/WardenPP.png"),
  name: "Warden++",
  description: "The Last Word in Corporate Security",
  actions: [
    {
      name: "Crash",
      description: "Deletes 7 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 7)],
    },
  ],
  maxSize: 7,
  numMoves: 3,
};
