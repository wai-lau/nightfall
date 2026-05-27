import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const AttackDog: IProgram = {
  id: "AttackDog",
  color: "rgb(252,187,0)",
  iconImageFile: resolveImage("programs/AttackDog.png"),
  name: "Attack Dog",
  description: "Ravenous and Bloodthirsty Corporate Canine",
  actions: [attack("Megabyte", "Deletes 3 Sectors From Target", 3)],
  maxSize: 7,
  numMoves: 4,
};
