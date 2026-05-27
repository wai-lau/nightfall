import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Satellite: IProgram = {
  id: "Satellite",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Satellite.png"),
  name: "Satellite",
  description: "Short-Range Hard-Hitting Program",
  actions: [attack("Scramble", "Deletes 4 Sectors From Target", 4, { range: 2 })],
  maxSize: 1,
  numMoves: 1,
};
