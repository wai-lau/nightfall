import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ped-offshore";
const map = `
----@..--.....
-@----.----.-.
------.--A----
@-----.-------
.------B------
---------C----
...--..------.
.--D----------
.-----E---F1--
----G--H--23--
.--.--------..
`;
const enemies = [
  Programs.Watchman,
  Programs.Sensor,
  Programs.Watchman,
  Programs.Sensor,
  Programs.Watchman,
  Programs.Sensor,
  Programs.Watchman,
  Programs.Sensor,
];
const creditValues: number[] = [570, 630, 550];

export default defineLevel(id, map, enemies, creditValues);

// 21#3:31