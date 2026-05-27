import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "tang-strategic-reserve";
const map = `
@------AaaaaaJ1
...----EeeeeeK2
@------IiiiiiL3
...----..C#DFG4
@------bbbbbbb5
...----bbbbbHb6
@------Bbbbbbb7
`;
const creditValues: number[] = [500, 500, 500, 500, 500, 500, 500];
const enemies = [
  Programs.Warden,
  Programs.InfernoWall,
  Programs.WatchmanX,
  Programs.WatchmanX,
  Programs.Warden,
  Programs.Sonar,
  Programs.Sonar,
  Programs.AttackDog,
  Programs.Warden,
  Programs.GuardDog,
  Programs.GuardDog,
  Programs.GuardDog,
];

export default defineLevel(id, map, enemies, creditValues);
