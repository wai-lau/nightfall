import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const LaserSatellite: IProgram = {
  id: "LaserSatellite",
  color: "rgb(160,110,255)",
  iconImageFile: resolveImage("programs/LaserSatellite.png"),
  name: "Laser Satellite",
  description: "Extreme-Range Faster-Moving Program",
  actions: [attack("Megascramble", "Deletes 2 Sectors From Target", 2, { range: 5 })],
  maxSize: 1,
  numMoves: 4,
};
