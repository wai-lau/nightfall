import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Ballista: IProgram = {
  id: "Ballista",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Ballista.png"),
  name: "Ballista",
  description: "Extreme-Range Attack Program",
  actions: [attack("Fling", "Deletes 2 Sectors From Target", 2, { range: 4 })],
  maxSize: 2,
  numMoves: 2,
};
