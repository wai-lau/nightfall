import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Radar: IProgram = {
  id: "Radar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Radar.png"),
  name: "Radar",
  description: "Deadly Program Eradicator",
  actions: [
    {
      name: "Pong",
      description: "Deletes 2 Sectors From Target",
      range: 5,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
