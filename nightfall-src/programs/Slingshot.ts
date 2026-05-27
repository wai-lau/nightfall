import { IProgram } from "../types";
import { resolveImage } from "../util/util";
import { attack } from "./_helpers";

export const Slingshot: IProgram = {
  id: "Slingshot",
  color: "rgb(0,217,165)",
  iconImageFile: resolveImage("programs/Slingshot.png"),
  name: "Slingshot",
  description: "Basic Ranged Attack Program",
  actions: [attack("Stone", "Deletes 1 Sector From Target", 1, { range: 3 })],
  maxSize: 2,
  numMoves: 2,
};
