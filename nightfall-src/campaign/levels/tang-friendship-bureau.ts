import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "tang-friendship-bureau";
const map = `
.............
.---1-2-3---.
.-----E-----.
-A--B---C--D-
-------------
-------------
-------------
.--@--@--@--.
.............
`;
const enemies = [
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.GuardPup,
  Programs.Radar,
];
const creditValues: number[] = [350, 400, 450];

export default defineLevel(id, map, enemies, creditValues);
