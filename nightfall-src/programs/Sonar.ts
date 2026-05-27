import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sonar: IProgram = {
  id: "Sonar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Sonar.png"),
  name: "Sonar",
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
