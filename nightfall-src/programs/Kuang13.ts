import { IProgram } from "../types";
import { resolveImage } from "../util/util";

// Player-side Kuang-12 (awarded at T5). Same name, behaviour, art (emet sprite)
// AND colour as the enemy Kuang12 — it's the captured-same-program merge, so
// the variant pair is now identical in appearance (unlike LogicBomb / LogicBomb2,
// which still differ in art). Sector colour = the emet tile bg rgb(48,48,51), so
// the icon tile and sectors match (the convention every other program follows).
export const Kuang13: IProgram = {
  id: "Kuang13",
  color: "rgb(48,48,51)",
  iconImageFile: resolveImage("programs/emet.png"),
  name: "Kuang-12",
  description: "Military-Grade Program. Slow Viral Lattice. Has Teeth.",
  actions: [
    {
      name: "Devour",
      description: "Deletes 8 Sectors From Target & Heals 4 Self",
      range: 1,
      run: (ac, tc, selfID, targetID) => {
        const effects = [ac.damageTarget(targetID, 8)];
        // only feed (grow self) when it actually bit something
        if (targetID) effects.push(ac.growTarget(selfID, 4));
        return effects;
      },
    },
  ],
  maxSize: 12,
  numMoves: 4,
};
