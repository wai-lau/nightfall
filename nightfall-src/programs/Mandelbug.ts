import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Mandelbug: IProgram = {
  id: "Mandelbug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Mandelbug.png"),
  name: "Mandelbug",
  description: "It's Not a Bug, It's a Feature",
  actions: [attack("Fractal Glitch", "Deletes 4 Sectors From Target", 4)],
  maxSize: 1,
  numMoves: 5,
};
