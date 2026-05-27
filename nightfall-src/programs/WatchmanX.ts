import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const WatchmanX: IProgram = {
  id: "WatchmanX",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/WatchmanX.png"),
  name: "Watchman X",
  description: "Improved Version of Watchman",
  actions: [attack("Phaser", "Deletes 2 Sectors From Target", 2, { range: 2 })],
  maxSize: 4,
  numMoves: 1,
};
