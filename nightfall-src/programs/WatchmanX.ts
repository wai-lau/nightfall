import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const WatchmanX: IProgram = {
  id: "WatchmanX",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/WatchmanX.png"),
  name: "Watchman X",
  description: "Improved Version of Watchman",
  actions: [
    {
      name: "Phaser",
      description: "Deletes 2 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 4,
  numMoves: 1,
};
