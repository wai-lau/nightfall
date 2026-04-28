import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const WardenP: IProgram = {
  id: "WardenP",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/WardenP.png"),
  name: "Warden+",
  description: "Get Out Of Its Way",
  actions: [
    {
      name: "Bash",
      description: "Deletes 5 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 5)],
    },
  ],
  maxSize: 6,
  numMoves: 2,
};
