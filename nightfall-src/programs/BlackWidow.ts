import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack, slow } from "./_helpers";

export const BlackWidow: IProgram = {
  id: "BlackWidow",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/BlackWidow.png"),
  name: "Black Widow",
  description: "Speedier and Creepier",
  actions: [
    attack("Byte", "Deletes 2 Sectors From Target", 2),
    slow("Poison", "Decreases Move Rate of Target Program by 2", 2),
  ],
  maxSize: 2,
  numMoves: 4,
};
