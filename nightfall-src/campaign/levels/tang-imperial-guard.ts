import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "tang-imperial-guard";
// L7 (lmm-assimilation) battle: one large program centre-grid, two corner
// pickups. Here the centre program is Kuang-12 and the two corners are
// LogicBomb2 programs (A = Kuang-12 head, B/C = corner LogicBomb2s).
const map = `
@--------B
----------
---aaaA---
---aaaa---
---aaaa---
----------
C--------@
`;
const enemies = [Programs.Kuang12, Programs.LogicBomb2, Programs.LogicBomb2];
const creditValues: number[] = [];

const level = processMap(id, map, enemies, creditValues);

export default level;
