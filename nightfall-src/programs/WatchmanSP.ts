import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const WatchmanSP: IProgram = {
  id: "WatchmanSP",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/WatchmanSP.png"),
  name: "Watchman SP",
  description: "Qui Custodiet Ipsos Custodes?",
  actions: [
    {
      name: "Photon",
      description: "Deletes 2 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 4,
  numMoves: 1,
};
