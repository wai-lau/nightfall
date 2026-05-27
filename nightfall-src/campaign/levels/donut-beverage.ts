import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "donut-beverage";
const map = `
..-@@@--@@@-..
.------------.
--------------
--------------
--------------
--------------
--------------
--------------
--------------
.ABCD----EFGH.
..IJ------KL..
`;
const enemies = [
  Programs.Sentinel3,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.WatchmanSP,
  Programs.WatchmanSP,
  Programs.Sentinel3,
  Programs.AttackDog,
  Programs.AttackDog,
  Programs.AttackDog,
  Programs.AttackDog,
];

export default defineLevel(id, map, enemies);