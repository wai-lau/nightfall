import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ph-hmo";
const map = `
--------------
-----ABCDE----
K#---12345----
-----FGHIJ----
--------------
............--
............--
............--
.@--........--
.@------------
.@------------
`;
const enemies = [
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sensor,
  Programs.Sonar,
];
const creditValues: number[] = [680, 650, 670, 680, 620];

export default defineLevel(id, map, enemies, creditValues);

// 23#0:12