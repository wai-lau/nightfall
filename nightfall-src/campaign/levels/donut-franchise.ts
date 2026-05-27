import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "donut-franchise";
const map = `
--------------
-aa-b-------@-
--aAB---------
-c----------@-
-ccCdd--------
-eE--D-----@--
-efF----------
-ff---------@-
--ggG---------
------------@-
--------------
`;
const enemies = [
  Programs.Warden,
  Programs.Sentinel,
  Programs.Warden,
  Programs.Sentinel,
  Programs.Sentinel,
  Programs.Warden,
  Programs.Sentinel,
];

export default defineLevel(id, map, enemies);

// 13#1:33