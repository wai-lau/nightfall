import { IProgram } from "../types";

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
  { key: "seekers", ids: ["Seeker", "Seeker2", "Seeker3"] },
  { key: "slings", ids: ["Slingshot", "Ballista", "Catapult"] },
  { key: "satellites", ids: ["Satellite", "LaserSatellite"] },
  { key: "clogs", ids: ["Clog", "Clog2", "Clog3"] },
  { key: "bombs", ids: ["Buzzbomb", "LogicBomb", "LogicBomb2"] },
  { key: "turbos", ids: ["Turbo", "TurboDX"] },
  { key: "hacks", ids: ["Hack", "Hack2", "Hack3"] },
  { key: "towers", ids: ["Tower", "MobileTower"] },
  { key: "golems", ids: ["GolemClay", "GolemMud", "GolemStone"] },
  { key: "medical", ids: ["DataDoctor", "DataDoctorPro", "Medic"] },
  { key: "bugs", ids: ["Bug", "Heisenbug", "Mandelbug"] },
  { key: "spiders", ids: ["BlackWidow", "Tarantula", "WolfSpider"] },
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
