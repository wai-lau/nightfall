import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Sumo: IProgram = {
  id: "Sumo",
  color: "rgb(182,252,0)",
  iconImageFile: resolveImage("programs/Sumo.png"),
  name: "Sumo",
  description: "A Massive and Slow-Moving Powerhouse",
  actions: [attack("Slam", "Deletes 8 Sectors From Target", 8, { sizeReq: 6 })],
  maxSize: 12,
  numMoves: 3,
};
