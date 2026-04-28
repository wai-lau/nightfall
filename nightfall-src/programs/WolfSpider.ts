import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const WolfSpider: IProgram = {
  id: "WolfSpider",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/WolfSpider.png"),
  name: "Wolf Spider",
  description: "Speedy and Creepy Little Program",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
