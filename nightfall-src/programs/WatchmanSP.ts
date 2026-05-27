import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const WatchmanSP: IProgram = {
  id: "WatchmanSP",
  color: "rgb(255,37,138)",
  iconImageFile: resolveImage("programs/WatchmanSP.png"),
  name: "Watchman SP",
  description: "Qui Custodiet Ipsos Custodes?",
  actions: [attack("Photon", "Deletes 2 Sectors From Target", 2, { range: 3 })],
  maxSize: 4,
  numMoves: 1,
};
