import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const WardenP: IProgram = {
  id: "WardenP",
  color: "rgb(252,0,16)",
  iconImageFile: resolveImage("programs/WardenP.png"),
  name: "Warden+",
  description: "Get Out Of Its Way",
  actions: [attack("Bash", "Deletes 5 Sectors From Target", 5)],
  maxSize: 6,
  numMoves: 2,
};
