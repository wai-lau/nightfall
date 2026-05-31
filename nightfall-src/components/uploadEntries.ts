import { IProgram } from "../types";
import warez1 from "../campaign/levels/warez-1";
import warez2 from "../campaign/levels/warez-2";
import warez3 from "../campaign/levels/warez-3";
import warez4 from "../campaign/levels/warez-4";

// program id -> warez tier (0 = warez-1 ... 3 = warez-4), for ordering within a
// group by which warez node a program was acquired from (lowest tier on the
// left). Programs from no warez node sort last. First warez to list a program
// wins, so a program offered by multiple nodes keys off its earliest source.
const WAREZ_ORDER: Record<string, number> = {};
[warez1, warez2, warez3, warez4].forEach((w, tier) => {
  w.programs.forEach((p) => {
    if (WAREZ_ORDER[p.id] === undefined) WAREZ_ORDER[p.id] = tier;
  });
});
const warezTier = (id: string) => WAREZ_ORDER[id] ?? Number.MAX_SAFE_INTEGER;

// One row in the program.list: a distinct program id, plus the programs[]
// indexes it occupies (filteredIndexes = those not already placed/selected).
export interface UploadEntry {
  id: string;
  program: IProgram;
  color: string;
  groupKey: string;
  indexes: number[];
  filteredIndexes: number[];
}

// Explicit program categories (the "lines"). Grouping keys off these, NOT raw
// icon color, so that everything uncategorized collapses into one bucket
// regardless of the colors enemy/corp programs happen to share. Order here is
// the render order; the misc bucket is always appended last.
export const PROGRAM_CATEGORIES: { key: string; ids: string[] }[] = [
  // Leading order is fixed: Hacks, Slings, Bugs, Golems, Spiders. The rest
  // follow in any order.
  { key: "hacks", ids: ["Hack", "Hack2", "Hack3"] },
  { key: "slings", ids: ["Slingshot", "Ballista", "Catapult"] },
  { key: "bugs", ids: ["Bug", "Heisenbug", "Mandelbug"] },
  { key: "golems", ids: ["GolemClay", "GolemMud", "GolemStone"] },
  { key: "spiders", ids: ["BlackWidow", "Tarantula", "WolfSpider"] },
  { key: "seekers", ids: ["Seeker", "Seeker2", "Seeker3"] },
  { key: "satellites", ids: ["Satellite", "LaserSatellite"] },
  { key: "clogs", ids: ["Clog", "Clog2", "Clog3"] },
  { key: "bombs", ids: ["Buzzbomb", "LogicBomb", "LogicBomb2"] },
  { key: "turbos", ids: ["Turbo", "TurboDX"] },
  { key: "towers", ids: ["Tower", "MobileTower"] },
  { key: "medical", ids: ["DataDoctor", "DataDoctorPro", "Medic"] },
];

// Catch-all for uncategorized programs AND for any category the player owns
// fewer than two distinct programs of (no group should render with one cell).
export const MISC_GROUP = "everything-else";

const CATEGORY_OF: Record<string, string> = {};
const CATEGORY_ORDER: Record<string, number> = {};
PROGRAM_CATEGORIES.forEach((c, i) => {
  CATEGORY_ORDER[c.key] = i;
  c.ids.forEach((id) => (CATEGORY_OF[id] = c.key));
});

// Build the ordered, category-grouped entry list shared by UploadMenu (render)
// and Battle (keyboard nav). Order MUST match between the two or the keyboard
// highlight lands on the wrong cell — hence this single source of truth.
export function buildUploadEntries(programs: IProgram[], selectedIndexes: number[] = []): UploadEntry[] {
  const seen: Record<string, number> = {};
  const entries: UploadEntry[] = [];
  programs.forEach((p, i) => {
    if (seen[p.id] === undefined) {
      seen[p.id] = entries.length;
      entries.push({
        id: p.id,
        program: p,
        color: p.color,
        groupKey: CATEGORY_OF[p.id] ?? MISC_GROUP,
        indexes: [],
        filteredIndexes: [],
      });
    }
    const entry = entries[seen[p.id]];
    entry.indexes.push(i);
    if (!selectedIndexes.includes(i)) {
      entry.filteredIndexes.push(i);
    }
  });

  // Bucket by category key.
  const buckets: Record<string, UploadEntry[]> = {};
  entries.forEach((entry) => {
    (buckets[entry.groupKey] ??= []).push(entry);
  });

  // Order within each group by warez node acquired (lowest tier on the left).
  // Stable: programs from the same warez node keep acquisition order.
  Object.values(buckets).forEach((b) =>
    b.sort((a, c) => warezTier(a.id) - warezTier(c.id))
  );

  // A real category needs >=2 distinct owned programs; otherwise its lone entry
  // drops into the misc bucket. The misc bucket itself always shows.
  const categoryKeys = Object.keys(buckets)
    .filter((k) => k !== MISC_GROUP && buckets[k].length >= 2)
    .sort((a, b) => CATEGORY_ORDER[a] - CATEGORY_ORDER[b]);

  const ordered: UploadEntry[] = [];
  categoryKeys.forEach((k) => ordered.push(...buckets[k]));

  const misc: UploadEntry[] = [];
  Object.keys(buckets).forEach((k) => {
    if (k === MISC_GROUP || buckets[k].length < 2) {
      buckets[k].forEach((entry) => misc.push({ ...entry, groupKey: MISC_GROUP }));
    }
  });
  return [...ordered, ...misc];
}

// Split the flat ordered entries into contiguous group runs, carrying the flat
// index of each entry (keyboard highlight + onSelectProgram index space).
export interface UploadGroup {
  key: string;
  color: string;
  entries: { entry: UploadEntry; flatIndex: number }[];
}

export function groupUploadEntries(entries: UploadEntry[]): UploadGroup[] {
  const groups: UploadGroup[] = [];
  entries.forEach((entry, flatIndex) => {
    const last = groups[groups.length - 1];
    if (!last || last.key !== entry.groupKey) {
      groups.push({ key: entry.groupKey, color: entry.color, entries: [] });
    }
    groups[groups.length - 1].entries.push({ entry, flatIndex });
  });
  return groups;
}
