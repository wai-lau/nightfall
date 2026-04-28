import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Boss: IProgram = {
  id: "Boss",
  color: "rgb(252,98,0)",
  iconImageFile: resolveImage("programs/Boss.png"),
  name: "Boss",
  description: "Prepare To Be 0wned",
  actions: [
    {
      name: "Shutdown",
      description: "Deletes 5 Sectors From Target Program",
      range: 5,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 5)],
    },
  ],
  maxSize: 25,
  numMoves: 6,
};
