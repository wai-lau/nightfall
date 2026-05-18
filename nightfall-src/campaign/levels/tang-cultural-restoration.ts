import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "tang-cultural-restoration";
const map = `
H-G-----C
--A---B--
......-.-
--D-I-E--
------F--
--J------
---------
......-.-
---------
-@-@-@---
---------
`;
const enemies = [
  Programs.Sentinel3,
  Programs.GuardDog,
  Programs.Sonar,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.Sonar,
  Programs.WardenPP, // G — northmost sentinel slot
  Programs.GuardDog,
  Programs.Sentinel3,
  Programs.Sentinel3,
];

const level = processMap(id, map, enemies);

export default level;
