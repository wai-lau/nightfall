import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-jungle";
const map = `
---@------@---
--------------
--------------
--aaaAaaaaaa--
--aaaaaaaaaa--
B------------C
bbb--dddd-cccc
bbb-dddDd-cccc
bbb--d#dd--ccc
-1---ddddd--2-
`;
const enemies = [Programs.FireWall, Programs.FireWall, Programs.FireWall, Programs.FireWall];
const creditValues: number[] = [610, 690];

export default defineLevel(id, map, enemies, creditValues);

// 18#0:15