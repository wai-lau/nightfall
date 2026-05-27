import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ped-fiduciary";
const map = `
aA-----Bb
aa-----bb
----@----
cc-----dd
cC-----Dd
`;
const enemies = [Programs.Sentinel2, Programs.Sentinel2, Programs.Sentinel2, Programs.Sentinel2];
export default defineLevel(id, map, enemies);

// 14#0:18