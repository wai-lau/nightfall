import processMap from "../../util/processMap";
import { IProgram } from "../../types";

// Single seam for turning a level's data into an ILevel. Each level module then
// carries only its map / enemies / credits, not the processMap wiring — and any
// future change to level construction lives here, not across ~50 files.
export const defineLevel = (
  id: string,
  map: string,
  enemies: IProgram[],
  creditValues: number[] = []
) => processMap(id, map, enemies, creditValues);
