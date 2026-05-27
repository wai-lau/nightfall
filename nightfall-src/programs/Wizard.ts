import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack, slow } from "./_helpers";

export const Wizard: IProgram = {
  id: "Wizard",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/Wizard.png"),
  name: "Wizard",
  description: "Pay No Attention to the Man Behind the Curtain",
  actions: [
    attack("Fire", "Deletes 4 Sectors From Target", 4, { range: 2 }),
    slow("Ice", "Decreases Movement of Target by 3", 3, { range: 2 }),
  ],
  maxSize: 3,
  numMoves: 2,
};
