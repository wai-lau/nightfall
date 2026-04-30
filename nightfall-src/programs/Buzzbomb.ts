import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Buzzbomb: IProgram = {
  id: "Buzzbomb",
  color: "rgb(0,144,252)",
  iconImageFile: resolveImage("programs/Buzzbomb.png"),
  name: "Buzzbomb",
  description: "Fast and Annoying",
  actions: [
    {
      name: "Sting",
      description: "Deletes 1 Sector From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
    {
      name: "Kamikaze",
      description: "Deletes 5 Sectors From Target & Erases BuzzBomb",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(selfID, 999999),
        ac.damageTarget(targetID, 5),
      ],
    },
  ],
  maxSize: 1,
  numMoves: 8,
};
