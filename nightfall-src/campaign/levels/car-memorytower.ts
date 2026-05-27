import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "car-memorytower";
const map = `
.........--.
..-...---A--
.------D--B-
---------C-.
----------E.
-----------.
--@@-------.
.-@@-------.
.----------.
....---.....
`;

const enemies = [
  Programs.Watchman,
  Programs.Watchman,
  Programs.Sentinel,
  Programs.GuardPup,
  Programs.GuardPup,
];

export default defineLevel(id, map, enemies);

// 2#4:13