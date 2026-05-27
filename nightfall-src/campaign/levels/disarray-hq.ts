import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "disarray-hq";
const map = `
BCDEFGH..aaaaa
IJKLMNO.PAaaaa
-------..-aaaa
-------.Q-aaaa
-------..-aaaa
-------...R.S.
-------.......
---------ttttt
-@@@@@---Ttttt
-@@@@@---Uuuuu
---------uuuuu
`;
const enemies = [
  Programs.Boss,
  Programs.AttackDog,
  Programs.AttackDog,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.AttackDog,
  Programs.AttackDog,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WardenP,
  Programs.WardenP,
  Programs.WardenP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.Sumo,
  Programs.Sumo,
];

export default defineLevel(id, map, enemies);

// TODO Purple sumo
// 37#0:40