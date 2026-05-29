import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Ballista: IProgram = {
  id: "Ballista",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Ballista.png"),
  name: "Ballista",
  description: "Long-Range Attack Program",
  actions: [
    {
      name: "Bolt",
      description: "Deletes 3 Sectors From Target & 1 From Ballista",
      range: 4,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(selfID, 1), ac.damageTarget(targetID, 3)],
      sizeReq: 2,
    },
  ],
  maxSize: 3,
  numMoves: 2,
};
