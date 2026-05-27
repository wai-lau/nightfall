import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Boss: IProgram = {
  id: "Boss",
  color: "rgb(252,98,0)",
  iconImageFile: resolveImage("programs/Boss.png"),
  name: "Boss",
  description: "Prepare To Be 0wned",
  actions: [attack("Shutdown", "Deletes 5 Sectors From Target Program", 5, { range: 5 })],
  maxSize: 25,
  numMoves: 6,
};
