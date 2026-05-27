import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "donut-supply";
const map = `
-@-----------@
@------aA-----
----B---------
----b-----C---
--Dd-E----c---
-----eef------
---g---fF-hH--
---G-----i----
---------I----
-----Jj------@
@-----------@-
`;
const enemies = [
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Sentinel2,
  Programs.Sentinel2,
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Sentinel,
];

export default defineLevel(id, map, enemies);

// 8#3:29