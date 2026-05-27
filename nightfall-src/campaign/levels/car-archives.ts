import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "car-archives";
const map = `
-@--.....12
@@--..--.--
----..--...
---Aaa--.B-
...aaaaa.C-
...aaaaa.--
.---aaaa.--
.---aaaD.--
.........--
3-.EF------
4-.-------#
`;
const enemies = [
  Programs.FireWall,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.Sonar,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
];
const creditValues: number[] = [720, 640, 700, 670]; // TODO

export default defineLevel(id, map, enemies, creditValues);

// 15#3:11