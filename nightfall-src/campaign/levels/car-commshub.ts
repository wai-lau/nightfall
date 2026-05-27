import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "car-commshub";
const map = `
.----......---
-A-B----------
-----C------@-
-D-E----------
-------------.
--F---------..
..------------
..----------@-
.1------------
.2---@----@--@
...-------.--
`;
const enemies = [
  Programs.WatchmanX,
  Programs.Watchman,
  Programs.GuardDog,
  Programs.Watchman,
  Programs.Warden,
  Programs.GuardDog,
];
const creditValues: number[] = [460, 380];

export default defineLevel(id, map, enemies, creditValues);

// 8#0:24