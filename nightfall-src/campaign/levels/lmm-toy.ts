import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-toy";
const map = `
------------
-@--------A-
------------
----bbbB----
----bbbb----
----bbbb----
------------
-C--------@-
------------
`;
const enemies = [Programs.AttackDog, Programs.FireWall, Programs.AttackDog];
export default defineLevel(id, map, enemies);

// 11#0:44