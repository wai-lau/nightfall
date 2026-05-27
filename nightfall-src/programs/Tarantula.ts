import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack, slow } from "./_helpers";

export const Tarantula: IProgram = {
  id: "Tarantula",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/Tarantula.png"),
  name: "Tarantula",
  description: "Fast, with a Venomous Bite",
  actions: [
    attack("Megabyte", "Deletes 3 Sectors From Target", 3),
    slow("Paralyze", "Decreases Move Rate of Target Program by 3", 3),
  ],
  maxSize: 3,
  numMoves: 5,
};
