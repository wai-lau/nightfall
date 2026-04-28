import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Slingshot: IProgram = {
  id: "Slingshot",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Slingshot.png"),
  name: "Slingshot",
  description: "Basic Ranged Attack Program",
  actions: [
    {
      name: "Stone",
      description: "Deletes 1 Sector From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 2,
  numMoves: 2,
};
