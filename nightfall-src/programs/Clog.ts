import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { slow } from "./_helpers";

export const Clog: IProgram = {
  id: "Clog",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog.png"),
  name: "Clog.01",
  description: "Slows Down Hostile Programs",
  actions: [slow("Lag", "Decrease Move Rate of Target by 1", 1, { range: 3 })],
  maxSize: 4,
  numMoves: 2,
};
