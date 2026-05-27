import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const GolemStone: IProgram = {
  id: "GolemStone",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemStone.png"),
  name: "Golem.Stone",
  description: "Nothing Can Stand In Its Way",
  actions: [attack("Crash", "Deletes 7 Sectors From Target", 7)],
  maxSize: 7,
  numMoves: 3,
};
