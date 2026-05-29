import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Catapult: IProgram = {
  id: "Catapult",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Catapult.png"),
  name: "Catapult",
  description: "Long-Range Siege Program",
  actions: [
    {
      name: "Fling",
      description: "Deletes 5 Sectors From Target & 2 From Catapult",
      range: 4,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(selfID, 2), ac.damageTarget(targetID, 5)],
      sizeReq: 3,
    },
  ],
  maxSize: 5,
  numMoves: 2,
};
