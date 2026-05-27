import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Warden: IProgram = {
  id: "Warden",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/Warden.png"),
  name: "Warden",
  description: "Slow and Steady Corporate Attack Program",
  actions: [attack("Thump", "Deletes 3 Sectors From Target", 3)],
  maxSize: 5,
  numMoves: 1,
};
