import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const MobileTower: IProgram = {
  id: "MobileTower",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/MobileTower.png"),
  name: "MOBILE TOWER",
  description: "Slow-Moving Extreme-Range Program",
  actions: [attack("Spot", "Deletes 2 Sectors From Target", 2, { range: 5 })],
  maxSize: 1,
  numMoves: 1,
};
