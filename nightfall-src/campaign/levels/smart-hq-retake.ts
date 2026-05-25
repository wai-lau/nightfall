import * as Programs from "../../programs";
import processMap from "../../util/processMap";

const id = "smart-hq-retake";
const map = `
------....
----@-....
--@@--....
--@---AB..
-@----CD..
----------
...EF-----
...GH-----
.....-----
.....----I
`;
const enemies = [
  Programs.AttackDog,   // A
  Programs.LogicBomb2,  // B
  Programs.LogicBomb2,  // C
  Programs.AttackDog,   // D
  Programs.LogicBomb2,  // E
  Programs.AttackDog,   // F
  Programs.AttackDog,   // G
  Programs.LogicBomb2,  // H
  Programs.InfernoWall, // I
];
const creditValues: number[] = [];

const level = processMap(id, map, enemies, creditValues);

export default level;
