import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Heisenbug: IProgram = {
  id: "Heisenbug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Heisenbug.png"),
  name: "Heisenbug",
  description: "They Can't Kill What They Can't Catch",
  actions: [attack("Quantum Glitch", "Deletes 6 Sectors From Target", 6)],
  maxSize: 1,
  numMoves: 5,
};
