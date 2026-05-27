import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack, slow } from "./_helpers";

export const WolfSpider: IProgram = {
  id: "WolfSpider",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/WolfSpider.png"),
  name: "Wolf Spider",
  description: "Speedy and Creepy Little Program",
  actions: [
    attack("Byte", "Deletes 2 Sectors From Target", 2),
    slow("Prick", "Decreases Move Rate of Target Program by 1", 1),
  ],
  maxSize: 2,
  numMoves: 4,
};
