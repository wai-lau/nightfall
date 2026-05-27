import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Seeker: IProgram = {
  id: "Seeker",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Seeker.png"),
  name: "Seeker",
  description: "Solid Distance Attack Program",
  actions: [attack("Peek", "Deletes 2 Sectors From Target", 2, { range: 2 })],
  maxSize: 3,
  numMoves: 3,
};
