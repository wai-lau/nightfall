import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Sentinel: IProgram = {
  id: "Sentinel",
  color: "rgb(252,152,0)",
  iconImageFile: resolveImage("programs/Sentinel.png"),
  name: "Sentinel",
  description: "Corporate Data Defender",
  actions: [attack("Cut", "Deletes 2 Sectors From Target", 2)],
  maxSize: 3,
  numMoves: 1,
};
