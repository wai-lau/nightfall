import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Watchman: IProgram = {
  id: "Watchman",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/Watchman.png"),
  name: "Watchman",
  description: "Corporate Ranged Attack Program",
  actions: [
    {
      name: "Phaser",
      description: "Deletes 2 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 2,
  numMoves: 1,
};
