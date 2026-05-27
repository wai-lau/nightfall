import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "tang-imperial-guard";
// L7 (lmm-assimilation) battle: one large program centre-grid, two corner
// pickups. Here the centre program is Kuang-12 and the two corners are
// WardenPP programs (A = Kuang-12 head, B/C = corner WardenPPs).
const map = `
@--------B
----------
---aaaA---
---aaaa---
---aaaa---
----------
C--------@
`;
const enemies = [Programs.Kuang12, Programs.WardenPP, Programs.WardenPP];
const creditValues: number[] = [];

const level = processMap(id, map, enemies, creditValues);

export default level;
