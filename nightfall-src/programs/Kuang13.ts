import { IProgram } from "../types";
import { resolveImage } from "../util/util";

// Player-side Kuang-12 (awarded at T5). Same name + behaviour as the enemy
// Kuang12; different art/colour — the LogicBomb / LogicBomb2 pattern.
export const Kuang13: IProgram = {
  id: "Kuang13",
  color: "rgb(255,56,207)",
  iconImageFile: resolveImage("programs/Kuang13.png"),
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
