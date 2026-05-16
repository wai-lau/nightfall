import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "tang-imperial-guard";
const map = `
.....#.....
...G.H.I...
.cccC1Dddd.
.M.......N.
...AaJbB...
...K...L...
...ooooo...
.....o.....
..eeEOFff..
.....2.....
@3@4@5@6@7@
-----------
`;
const creditValues: number[] = [2000, 100, 100, 100, 100, 100, 100];
const enemies = [
  Programs.WatchmanX,
  Programs.WatchmanX,
  Programs.Sentinel3,
  Programs.Sentinel3,
  Programs.WatchmanX,
  Programs.WatchmanX,
  Programs.Sonar,
  Programs.Sonar,
  Programs.Sonar,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.WardenPP,
];

const level = processMap(id, map, enemies, creditValues);

export default level;
