import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const LogicBomb: IProgram = {
  id: "LogicBomb",
  color: "rgb(0,144,252)",
  iconImageFile: resolveImage("programs/LogicBomb.png"),
  name: "LogicBomb",
  description: "Self-Destructing Attack Program",
  actions: [
    {
      name: "Selfdestruct",
      description: "Deletes 10 Sector From Target & Erases LogicBomb",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(selfID, 999999),
        ac.damageTarget(targetID, 10),
      ],
    },
  ],
  maxSize: 6,
  numMoves: 3,
};
