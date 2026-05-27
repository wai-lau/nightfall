import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const LaserSatellite: IProgram = {
  id: "LaserSatellite",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/LaserSatellite.png"),
  name: "Laser Satellite",
  description: "Long-Range Hard-Hitting Program",
  actions: [attack("Megascramble", "Deletes 4 Sectors From Target", 4, { range: 3 })],
  maxSize: 1,
  numMoves: 2,
};
