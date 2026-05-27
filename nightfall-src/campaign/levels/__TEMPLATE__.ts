import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "__TEMPLATE__";
const map = `
AaBbCc--
123-#---
@@@-----
`;
const enemies = [Programs.Watchman, Programs.GuardPup, Programs.Sentinel];
const creditValues: number[] = [300, 340, 320];

export default defineLevel(id, map, enemies, creditValues);
