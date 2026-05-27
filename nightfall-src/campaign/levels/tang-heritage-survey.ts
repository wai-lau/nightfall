import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "tang-heritage-survey";
const map = `
@---.........
.----..A-HG..
---E-..-.---.
---F--.-C..D.
--------B----
-------------
---@---------
@-----------@
`;
const enemies = [
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.Sentinel2,
  Programs.Sentinel2,
  Programs.Radar,
  Programs.WatchmanSP,
];

export default defineLevel(id, map, enemies);
