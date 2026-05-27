import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-film";
const map = `
---.aaaaaa.-1-
-#--aaaaaA--23
---.aaaaaa.---
............-.
............-.
............-.
---.bbbbbb.---
-@--Bbbbbb--45
---.bbbbbb.-6-
`;
const enemies = [Programs.InfernoWall, Programs.InfernoWall];
const creditValues: number[] = [800, 890, 840, 900, 760, 860]; // TODO - may be inaccurate

export default defineLevel(id, map, enemies, creditValues);

// 26#3:41