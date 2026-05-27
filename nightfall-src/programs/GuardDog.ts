import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const GuardDog: IProgram = {
  id: "GuardDog",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/GuardDog.png"),
  name: "Guard Dog",
  description: "Who Let This Dog Out?",
  actions: [attack("Byte", "Deletes 2 Sectors From Target", 2)],
  maxSize: 3,
  numMoves: 3,
};
