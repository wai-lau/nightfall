import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Radar: IProgram = {
  id: "Radar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Radar.png"),
  name: "Radar",
  description: "Long-Range Program Eradicator",
  actions: [
    {
      name: "Pong",
      description: "Deletes 1 Sector From Target",
      range: 8,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
