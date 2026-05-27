import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ph-prdatabase";
const map = `
........----
----.----2B-
-A1-.--.----
----.--.....
.--.----.---
.-----@---3k-
.----@----C-
....----.---`;
const enemies = [Programs.Watchman, Programs.GuardPup, Programs.Sentinel];
const creditValues: number[] = [300, 340, 320];

export default defineLevel(id, map, enemies, creditValues);

// 2#2:11