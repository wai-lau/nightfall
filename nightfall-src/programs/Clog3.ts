import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { slow } from "./_helpers";

export const Clog3: IProgram = {
  id: "Clog3",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog3.png"),
  name: "Clog.03",
  description: "Brings Hostile Programs to a Halt",
  actions: [
    slow("Chug", "Decreases Move Rate of Target by 2", 2, { range: 3 }),
    slow("Hang", "Decreases Move Rate of Target by 4", 4, { range: 3, sizeReq: 4 }),
  ],
  maxSize: 4,
  numMoves: 2,
};
