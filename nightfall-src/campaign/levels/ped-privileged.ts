import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ped-privileged";
const map = `
-AB-CD-12--E--
---.----------
-F---GH..-I--J
-----------K-.
.-3-..-45----.
.------67----L
----------M--N
@--@----.-O---
@-------.-----
@----------P-Q
-@@@..-89----R
`;
const enemies = [
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.WardenPP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WardenPP,
  Programs.WatchmanSP,
  Programs.WardenPP,
  Programs.WatchmanSP,
  Programs.WardenPP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WardenPP,
  Programs.WardenPP,
];
const creditValues: number[] = [800, 730, 760, 880, 700, 860, 860, 830, 870];

export default defineLevel(id, map, enemies, creditValues);

// 32#1:23