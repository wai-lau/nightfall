import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Catapult: IProgram = {
  id: "Catapult",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Catapult.png"),
  name: "Catapult",
  description: "Extreme-Range Mobile Attacker",
  actions: [attack("Fling", "Deletes 2 Sectors From Target", 2, { range: 5 })],
  maxSize: 3,
  numMoves: 2,
};
