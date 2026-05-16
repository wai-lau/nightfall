import * as Programs from "../../programs";
import processMap from "../../util/processMap";

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
  Programs.FireWall,
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

const level = processMap(id, map, enemies, creditValues);

export default level;
