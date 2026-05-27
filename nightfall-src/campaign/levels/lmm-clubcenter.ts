import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "lmm-clubcenter";
const map = `
a-..@-@.
aabb----
cA-B--@-
ccC-----
.ddD..-@
`;
const enemies = [Programs.Sentinel2, Programs.Sentinel2, Programs.Sentinel2, Programs.Sentinel2];

export default defineLevel(id, map, enemies);

// 4#2:24