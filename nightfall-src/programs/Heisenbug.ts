import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Heisenbug: IProgram = {
  id: "Heisenbug",
  color: "rgb(132,252,0)",
  iconImageFile: resolveImage("programs/Heisenbug.png"),
  name: "Heisenbug",
  description: "They Can't Kill What They Can't Catch",
  actions: [
    {
      name: "Quantum Glitch",
      description: "Deletes 6 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 6)],
    },
  ],
  maxSize: 1,
  numMoves: 5,
};
