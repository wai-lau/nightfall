import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "tang-imperial-guard";
// L7 (lmm-assimilation) battle: one large program centre-grid, two corner
// pickups. Centre is Kuang-12 (A) with its bottom-left cell carved out for a
// Radar (D); the two map corners are WardenPPs (B/C).
const map = `
@--------B
----------
---aaaA---
---aaaa---
---Daaa---
----------
C--------@
`;
const enemies = [Programs.Kuang12, Programs.WardenPP, Programs.WardenPP, Programs.Radar];
const creditValues: number[] = [];

export default defineLevel(id, map, enemies, creditValues);
