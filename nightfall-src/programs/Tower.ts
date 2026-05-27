import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Tower: IProgram = {
  id: "Tower",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/Tower.png"),
  name: "TOWER",
  description: "Immobile Long-Range Program",
  actions: [attack("Spot", "Deletes 1 Sector From Target", 1, { range: 6 })],
  maxSize: 1,
  numMoves: 0,
};
