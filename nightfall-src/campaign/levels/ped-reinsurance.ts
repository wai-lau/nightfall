import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ped-reinsurance";
const map = `
#AB-..........
-CD-...------G
E--F...-.....-
----...-.....-
----...1234..-
----...5HI6..-
----...7890..-
----.........-
----.........-
----.........-
@@@@---------J
`;
const enemies = [
  Programs.AttackDog,
  Programs.AttackDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
  Programs.Radar,
];
const creditValues: number[] = [560, 500, 520, 660, 700, 580, 660, 650, 580, 670];

export default defineLevel(id, map, enemies, creditValues);

// 18#2:58