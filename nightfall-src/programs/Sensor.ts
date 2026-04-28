import { IProgram } from "../types";
import { resolveImage } from "../util/util";

export const Sensor: IProgram = {
  id: "Sensor",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Sensor.png"),
  name: "Sensor",
  description: "Immobile Program Eradicator",
  actions: [
    {
      name: "Blip",
      description: "Deletes 1 Sector From Target",
      range: 5,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 1)],
    },
  ],
  maxSize: 1,
  numMoves: 0,
};
