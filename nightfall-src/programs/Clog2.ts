import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { slow } from "./_helpers";

export const Clog2: IProgram = {
  id: "Clog2",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog2.png"),
  name: "Clog.02",
  description: "Twice as Effective as Version .01",
  actions: [slow("Chug", "Decreases Move Rate of Target by 2", 2, { range: 3 })],
  maxSize: 4,
  numMoves: 2,
};
