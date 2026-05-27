import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-eastern";
const map = `
.---......---.
---A-....--@@-
-#B--....-----
C----.....----
-D---..-------
-1E-----------
-------..-----
-F--.....-----
-2---....-----
---G-....--@@-
.---......---.
`;
const enemies = [
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
];
const creditValues: number[] = [360, 450];

export default defineLevel(id, map, enemies, creditValues);

// 6#0:16