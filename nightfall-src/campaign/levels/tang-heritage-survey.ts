import * as Programs from "../../programs";
import processMap from "../../util/processMap";

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

const level = processMap(id, map, enemies);

export default level;
