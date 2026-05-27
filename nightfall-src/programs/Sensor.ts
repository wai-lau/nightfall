import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Sensor: IProgram = {
  id: "Sensor",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Sensor.png"),
  name: "Sensor",
  description: "Immobile Program Eradicator",
  actions: [attack("Blip", "Deletes 1 Sector From Target", 1, { range: 5 })],
  maxSize: 1,
  numMoves: 0,
};
