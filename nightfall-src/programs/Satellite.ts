import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Satellite: IProgram = {
  id: "Satellite",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Satellite.png"),
  name: "Satellite",
  description: "Short-Range Hard-Hitting Program",
  actions: [
    {
      name: "Scramble",
      description: "Deletes 4 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
  ],
  maxSize: 1,
  numMoves: 1,
};
