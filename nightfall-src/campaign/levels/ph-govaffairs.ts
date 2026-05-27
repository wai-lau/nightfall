import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ph-govaffairs";
const map = `
.-A-......-B-.
--------------
C------------D
--------------
.-----@@-----.
.-1--------2-.
.-----@@-----.
--------------
E------------F
--------------
.-G-......-H-.
`;
const enemies = [
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
];
const creditValues: number[] = [250, 320];

export default defineLevel(id, map, enemies, creditValues);

// 3#2:37