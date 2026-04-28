import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const LaserSatellite: IProgram = {
  id: "LaserSatellite",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/LaserSatellite.png"),
  name: "Laser Satellite",
  description: "Long-Range Hard-Hitting Program",
  actions: [
    {
      name: "Megascramble",
      description: "Deletes 4 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
  ],
  maxSize: 1,
  numMoves: 2,
};
