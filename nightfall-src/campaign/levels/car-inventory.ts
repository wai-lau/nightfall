import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "car-inventory";
const map = `
..----------..
.------------.
--aA------Bb--
--------------
--------------
--1---@@---2--
--------------
--------------
--cC------Dd--
.------------.
..----------..

`;
const enemies = [Programs.WatchmanX, Programs.WatchmanX, Programs.WatchmanX, Programs.WatchmanX];
const creditValues: number[] = [350, 480];

export default defineLevel(id, map, enemies, creditValues);

// 5#2:50