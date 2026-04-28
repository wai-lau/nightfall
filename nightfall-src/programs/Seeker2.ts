import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Seeker2: IProgram = {
  id: "Seeker2",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Seeker2.png"),
  name: "Seeker 2.0",
  description: "Bigger and Better than Seeker",
  actions: [
    {
      name: "Poke",
      description: "Deletes 2 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
  ],
  maxSize: 4,
  numMoves: 3,
};
