import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const GolemMud: IProgram = {
  id: "GolemMud",
  color: "rgb(0,252,249)",
  iconImageFile: resolveImage("programs/GolemMud.png"),
  name: "Golem.Mud",
  description: "Slow and Steady Attack Program",
  actions: [attack("Thump", "Deletes 3 Sectors From Target", 3)],
  maxSize: 5,
  numMoves: 1,
};
