import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ph-vaccine";
const map = `
a-b-c....-----
a1b2c....-@-@-
A-B-C....-----
-----....-----
-----....-----
-----....-----
-----....-----
-----....-----
-----....-D-E-
-@-@-....dd3ee
-----....dd-ee
`;
const enemies = [
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.WardenP,
  Programs.WardenP,
];
const creditValues: number[] = [650, 590, 680]; // TODO - I made these up

export default defineLevel(id, map, enemies, creditValues);

// 22#2:33