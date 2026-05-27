import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-techsupport";
const map = `
.----..----.
---A----B---
.----------.
..--------..
...--..--...
..--------..
.----------.
------------
.---@..@---.
`;
const enemies = [Programs.Sentinel, Programs.Sentinel];

export default defineLevel(id, map, enemies);

// 2#0:16