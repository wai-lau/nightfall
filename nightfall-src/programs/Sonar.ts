import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sonar: IProgram = {
  id: "Sonar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Sonar.png"),
  name: "Sonar",
  description: "Long-Range Program Eradicator",
  actions: [
    {
      name: "Ping",
      description: "Deletes 1 Sector From Target",
      range: 8,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
