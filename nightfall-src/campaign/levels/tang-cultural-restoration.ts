import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "tang-cultural-restoration";
const map = `
--G-----C
--A---B--
......-.-
--D-H-E--
------F--
--I------
---------
......-.-
---------
-@-@-@---
---------
`;
const enemies = [
  Programs.Sentinel3,    // A
  Programs.GuardDog,     // B
  Programs.Sonar,        // C
  Programs.GuardDog,     // D
  Programs.GuardDog,     // E
  Programs.Sonar,        // F
  Programs.WardenPP,     // G — northmost sentinel slot
  Programs.Sentinel3,    // H (renamed from I)
  Programs.Sentinel3,    // I (renamed from J)
];

const level = processMap(id, map, enemies);

export default level;
