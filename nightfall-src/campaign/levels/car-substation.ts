import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "car-substation";
const map = `
...--A-....---
-----------B-C
--1.----------
@------.-----D
-------.-@----
----@-...-----
------..---.--
-----..--2-.-@
..E--.--------
..-F---G----..
..---H---.....
`;
const enemies = [
  Programs.AttackDog,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.AttackDog,
  Programs.Sentinel3,
];
const creditValues: number[] = [670, 670];

export default defineLevel(id, map, enemies, creditValues);

// 15#1:01