import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const FireWall: IProgram = {
  id: "FireWall",
  color: "rgb(252,98,0)",
  iconImageFile: resolveImage("programs/FireWall.png"),
  name: "Firewall",
  description: "Keeps Unwanted Programs Out of Corprate Sectors",
  actions: [
    {
      name: "Burn",
      description: "Deletes 1 Sector From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 20,
  numMoves: 2,
};
