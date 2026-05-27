import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "donut-recipe";
const map = `
---A----B----
C.-.-.-.-.-.D
--1-------2--
-.-.-.-.-.-.-
------@------
E.-.@.-.@.-.F
------@------
-.-.-.-.-.-.-
--3-------4--
-.-.-.-.-.-.-
---G-------H-
`;
const enemies = [
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.WardenPP,
  Programs.Sentinel3,
];
const creditValues: number[] = [870, 780, 960, 890];

export default defineLevel(id, map, enemies, creditValues);

// 26#0:17