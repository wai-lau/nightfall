import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Mandelbug: IProgram = {
  id: "Mandelbug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Mandelbug.png"),
  name: "Mandelbug",
  description: "It's Not a Bug, It's a Feature",
  actions: [
    {
      name: "Fractal Glitch",
      description: "Deletes 4 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
  ],
  maxSize: 1,
  numMoves: 5,
};
