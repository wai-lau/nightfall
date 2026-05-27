import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const MobileTower: IProgram = {
  id: "MobileTower",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/MobileTower.png"),
  name: "MOBILE TOWER",
  description: "Slow-Moving Long-Range Program",
  actions: [attack("Spot", "Deletes 1 Sector From Target", 1, { range: 6 })],
  maxSize: 1,
  numMoves: 1,
};
