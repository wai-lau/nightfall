import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Seeker3: IProgram = {
  id: "Seeker3",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Seeker3.png"),
  name: "Seeker 3.0",
  description: "Seeker with Extra Deletion Power",
  actions: [
    {
      name: "Poke",
      description: "Deletes 2 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Seek & Destroy",
      description: "Deletes 5 Sectors From Target & 2 From Seeker",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(selfID, 2), ac.damageTarget(targetID, 5)],
    },
  ],
  maxSize: 5,
  numMoves: 4,
};
