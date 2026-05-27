import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Sonar: IProgram = {
  id: "Sonar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Sonar.png"),
  name: "Sonar",
  description: "Deadly Program Eradicator",
  actions: [attack("Pong", "Deletes 2 Sectors From Target", 2, { range: 5 })],
  maxSize: 1,
  numMoves: 0,
};
