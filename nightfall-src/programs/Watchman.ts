import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Watchman: IProgram = {
  id: "Watchman",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/Watchman.png"),
  name: "Watchman",
  description: "Corporate Ranged Attack Program",
  actions: [attack("Phaser", "Deletes 2 Sectors From Target", 2, { range: 2 })],
  maxSize: 2,
  numMoves: 1,
};
