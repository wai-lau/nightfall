import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const GuardPup: IProgram = {
  id: "GuardPup",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/GuardPup.png"),
  name: "Guard Pup",
  description: "A Speedy Little Corporate Cur",
  actions: [attack("Byte", "Deletes 2 Sectors From Target", 2)],
  maxSize: 2,
  numMoves: 3,
};
