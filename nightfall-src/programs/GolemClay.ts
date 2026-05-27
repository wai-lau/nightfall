import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const GolemClay: IProgram = {
  id: "GolemClay",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemClay.png"),
  name: "Golem.Clay",
  description: "Clay is Stonger Than Mud",
  actions: [attack("Bash", "Deletes 5 Sectors From Target", 5)],
  maxSize: 6,
  numMoves: 2,
};
