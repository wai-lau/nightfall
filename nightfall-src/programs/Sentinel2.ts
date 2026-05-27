import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Sentinel2: IProgram = {
  id: "Sentinel2",
  color: "rgb(252,152,0)",
  iconImageFile: resolveImage("programs/Sentinel2.png"),
  name: "Sentinel 2.0",
  description: "Improved Corporate Data Defender",
  actions: [attack("Cut", "Deletes 2 Sectors From Target", 2)],
  maxSize: 4,
  numMoves: 2,
};
