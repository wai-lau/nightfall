import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const WardenPP: IProgram = {
  id: "WardenPP",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/WardenPP.png"),
  name: "Warden++",
  description: "The Last Word in Corporate Security",
  actions: [attack("Crash", "Deletes 7 Sectors From Target", 7)],
  maxSize: 7,
  numMoves: 3,
};
