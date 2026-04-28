import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const AttackDog: IProgram = {
  id: "AttackDog",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/AttackDog.png"),
  name: "Attack Dog",
  description: "Ravenous and Bloodthirsty Corporate Canine",
  actions: [
    {
      name: "Megabyte",
      description: "Deletes 3 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 3)],
    },
  ],
  maxSize: 7,
  numMoves: 4,
};
