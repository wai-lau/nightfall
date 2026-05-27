import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const FireWall: IProgram = {
  id: "FireWall",
  color: "rgb(252,98,0)",
  iconImageFile: resolveImage("programs/FireWall.png"),
  name: "Firewall",
  description: "Keeps Unwanted Programs Out of Corprate Sectors",
  actions: [attack("Burn", "Deletes 1 Sector From Target", 1)],
  maxSize: 20,
  numMoves: 2,
};
