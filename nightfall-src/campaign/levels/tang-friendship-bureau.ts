import * as Programs from "../../programs";
import processMap from "../../util/processMap";

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

const level = processMap(id, map, enemies, creditValues);

export default level;
