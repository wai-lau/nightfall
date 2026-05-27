import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Radar: IProgram = {
  id: "Radar",
  color: "rgb(252,241,0)",
  iconImageFile: resolveImage("programs/Radar.png"),
  name: "Radar",
  description: "Long-Range Program Eradicator",
  actions: [attack("Ping", "Deletes 1 Sector From Target", 1, { range: 8 })],
  maxSize: 1,
  numMoves: 0,
};
