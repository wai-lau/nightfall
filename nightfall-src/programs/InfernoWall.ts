import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const InfernoWall: IProgram = {
  id: "InfernoWall",
  color: "rgb(244,52,23)",
  iconImageFile: resolveImage("programs/InfernoWall.png"),
  name: "Infernowall",
  description: "Incinerates Unwanted Programs in Corprate Sectors",
  actions: [
    {
      name: "Incinerate",
      description: "Deletes 5 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 5)],
    },
  ],
  maxSize: 20,
  numMoves: 2,
};
