import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-assimilation";
const map = `
@--------1
----------
---aaaA---
---aaaa---
---aaaa---
----------
2--------@
`;
const enemies = [Programs.Sumo];
const creditValues: number[] = [860, 790]; // TODO, made up 790

export default defineLevel(id, map, enemies, creditValues);

// 24#0:57