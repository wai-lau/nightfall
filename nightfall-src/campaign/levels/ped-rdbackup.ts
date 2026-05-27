import * as Programs from "../../programs";
import { defineLevel } from "./_defineLevel";

const id = "ped-rdbackup";
const map = `
-A--------B-
C....--....D
-.--------.-
-.--------.-
-.--@--@--.-
-----12-----
-.--@--@--.-
-.---------.-
-.---------.-
E....--....F
-G--------H-
`;
const enemies = [
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
  Programs.Mandelbug,
];
const creditValues: number[] = [800, 870];

export default defineLevel(id, map, enemies, creditValues);

// 28#0:14
// TODO: Pink MandelBug