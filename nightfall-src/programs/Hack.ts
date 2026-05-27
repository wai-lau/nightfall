import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Hack: IProgram = {
  id: "Hack",
  color: "rgb(0,199,252)",
  iconImageFile: resolveImage("programs/Hack.png"),
  name: "Hack",
  description: "Basic Attack Program",
  actions: [attack("Slice", "Deletes 2 Sectors From Target", 2)],
  maxSize: 4,
  numMoves: 2,
};
