import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Satellite: IProgram = {
  id: "Satellite",
  color: "rgb(160,110,255)",
  iconImageFile: resolveImage("programs/Satellite.png"),
  name: "Satellite",
  description: "Extreme-Range Fast-Moving Program",
  actions: [attack("Scramble", "Deletes 1 Sector From Target", 1, { range: 5 })],
  maxSize: 1,
  numMoves: 3,
};
