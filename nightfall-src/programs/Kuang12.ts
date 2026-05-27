import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Kuang12: IProgram = {
  id: "Kuang12",
  color: "rgb(166,147,86)",
  iconImageFile: resolveImage("programs/Kuang12.png"),
  name: "Kuang-12",
  description: "Military-Grade Program. Slow Viral Lattice. Has Teeth.",
  actions: [
    {
      name: "Devour",
      description: "Deletes 8 Sectors From Target & Heals 4 Self",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(targetID, 8),
        ac.growTarget(selfID, 4),
      ],
    },
  ],
  maxSize: 12,
  numMoves: 4,
};
