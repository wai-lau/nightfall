import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Seeker: IProgram = {
  id: "Seeker",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Seeker.png"),
  name: "Seeker",
  description: "Solid Distance Attack Program",
  actions: [
    {
      name: "Peek",
      description: "Deletes 2 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
