import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const LogicBomb2: IProgram = {
  id: "LogicBomb2",
  color: "rgb(252,142,0)",
  iconImageFile: resolveImage("programs/LogicBomb2.png"),
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
  maxSize: 7,
  numMoves: 4,
};
