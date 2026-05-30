import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Seeker3: IProgram = {
  id: "Seeker3",
  color: "rgb(120,200,180)",
  iconImageFile: resolveImage("programs/Seeker3.png"),
  name: "Seeker 3.0",
  description: "Seeker with Extra Deletion Power",
  actions: [
    {
      name: "Prod",
      description: "Deletes 4 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
  ],
  maxSize: 4,
  numMoves: 4,
};
