import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Bug: IProgram = {
  id: "Bug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Bug.png"),
  name: "Bug",
  description: "Fast, Cheap, and Out of Control",
  actions: [attack("Byte", "Deletes 2 Sectors From Target", 2)],
  maxSize: 1,
  numMoves: 5,
};
