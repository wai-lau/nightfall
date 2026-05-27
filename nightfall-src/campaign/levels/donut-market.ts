import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "donut-market";
const map = `
--@--------a
---@------Aa
@---------Bb
-@---------C
------------
------------
------------
-----------D
-----------d
-EF-------Gg
eefH-----Iig
`;
const enemies = [
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
];

export default defineLevel(id, map, enemies);

// 16#2:58