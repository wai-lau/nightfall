import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const InfernoWall: IProgram = {
  id: "InfernoWall",
  color: "rgb(209,57,33)",
  iconImageFile: resolveImage("programs/InfernoWall.png"),
  name: "Infernowall",
  description: "Incinerates Unwanted Programs in Corprate Sectors",
  actions: [attack("Incinerate", "Deletes 5 Sectors From Target", 5)],
  maxSize: 20,
  numMoves: 2,
};
