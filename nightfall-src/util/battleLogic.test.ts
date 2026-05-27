import { describe, it, expect } from "vitest";
import {
  BattleModel,
  isFilled,
  programByID,
  programIDAtCoordinate,
  creditIDAtCoordinate,
  passableCells,
  validMoves,
  validDestinations,
  validTargets,
  applyMoveDelta,
  applyMaxSizeDelta,
  grownBody,
  getWinner,
} from "./battleLogic";
import {
  IGridActiveProgram,
  IGridActiveCredit,
  ValidTarget as VT,
  Coordinate,
  CoordinateFill,
} from "../types";

const prog = (over: Partial<IGridActiveProgram>): IGridActiveProgram => ({
  id: "p",
  name: "P",
  color: "",
  iconImageFile: "",
  description: "",
  actions: [],
  maxSize: 9,
  numMoves: 4,
  head: [0, 0],
  body: [[0, 0]],
  team: "CPU",
  movesRemaining: 4,
  hasActed: false,
  ...over,
});

const credit = (over: Partial<IGridActiveCredit>): IGridActiveCredit => ({
  id: "c",
  amount: 100,
  position: [0, 0],
  collected: false,
  ...over,
});

const allFilled = (w: number, h: number): CoordinateFill =>
  Array.from({ length: h }, () => Array.from({ length: w }, () => true));

const model = (over: Partial<BattleModel>): BattleModel => ({
  width: 5,
  height: 5,
  filledCoordinates: allFilled(5, 5),
  programs: [],
  credits: [],
  ...over,
});

const key = (c: Coordinate) => `${c[0]},${c[1]}`;
const keys = (cs: Coordinate[] | null) => new Set((cs ?? []).map(key));

describe("applyMoveDelta", () => {
  it("clamps remaining moves to 0 and shifts the max down", () => {
    expect(applyMoveDelta(4, 2, -5)).toEqual({ numMoves: 2, movesRemaining: 0 });
  });
  it("clamps remaining moves to 10 and shifts the max up", () => {
    expect(applyMoveDelta(4, 8, 5)).toEqual({ numMoves: 6, movesRemaining: 10 });
  });
  it("applies a normal decrease", () => {
    expect(applyMoveDelta(4, 4, -2)).toEqual({ numMoves: 2, movesRemaining: 2 });
  });
});

describe("applyMaxSizeDelta", () => {
  it("never drops below 0", () => {
    expect(applyMaxSizeDelta(3, -5)).toBe(0);
  });
  it("adds normally", () => {
    expect(applyMaxSizeDelta(3, 2)).toBe(5);
  });
});

describe("getWinner", () => {
  const cpu = prog({ id: "a", team: "CPU" });
  const p1 = prog({ id: "b", team: "P1" });
  it("returns null while two teams remain", () => {
    expect(getWinner([cpu, p1], false)).toBeNull();
  });
  it("returns the last team standing", () => {
    expect(getWinner([cpu], false)).toBe("CPU");
    expect(getWinner([p1], false)).toBe("P1");
  });
  it("withholds a non-CPU win on a data-pack map", () => {
    expect(getWinner([p1], true)).toBeNull();
  });
  it("still lets CPU win on a data-pack map", () => {
    expect(getWinner([cpu], true)).toBe("CPU");
  });
});

describe("lookups", () => {
  const a = prog({ id: "a", head: [1, 1], body: [[1, 1], [1, 2]] });
  it("programByID finds or throws", () => {
    expect(programByID([a], "a")).toBe(a);
    expect(() => programByID([a], "x")).toThrow();
    expect(() => programByID([a], null)).toThrow();
  });
  it("programIDAtCoordinate matches any body cell", () => {
    expect(programIDAtCoordinate([a], [1, 2])).toBe("a");
    expect(programIDAtCoordinate([a], [0, 0])).toBeNull();
  });
  it("creditIDAtCoordinate matches position", () => {
    const c = credit({ id: "c1", position: [3, 3] });
    expect(creditIDAtCoordinate([c], [3, 3])).toBe("c1");
    expect(creditIDAtCoordinate([c], [0, 0])).toBeNull();
  });
  it("isFilled reads the grid", () => {
    const m = model({ filledCoordinates: [[true, false], [false, true]], width: 2, height: 2 });
    expect(isFilled(m, [0, 0])).toBe(true);
    expect(isFilled(m, [1, 0])).toBe(false);
  });
});

describe("passableCells", () => {
  it("includes empty + own cells, excludes other programs", () => {
    const a = prog({ id: "a", team: "P1", head: [1, 1], body: [[1, 1]] });
    const b = prog({ id: "b", team: "P1", head: [0, 0], body: [[0, 0]] });
    const m = model({ width: 3, height: 3, filledCoordinates: allFilled(3, 3), programs: [a, b] });
    const p = keys(passableCells(m, "a"));
    expect(p.has("1,1")).toBe(true); // own
    expect(p.has("0,0")).toBe(false); // other program
    expect(p.size).toBe(8); // 9 cells minus b's tile
  });
  it("blocks credits and data pack for the CPU", () => {
    const a = prog({ id: "a", team: "CPU", head: [1, 1], body: [[1, 1]] });
    const m = model({
      width: 3,
      height: 3,
      filledCoordinates: allFilled(3, 3),
      programs: [a],
      credits: [credit({ position: [2, 2] })],
      dataPack: [0, 2],
    });
    const p = keys(passableCells(m, "a"));
    expect(p.has("2,2")).toBe(false); // credit
    expect(p.has("0,2")).toBe(false); // data pack
    expect(p.size).toBe(7); // 9 minus credit minus datapack
  });
});

describe("validMoves", () => {
  it("returns the orthogonal in-bounds filled neighbours", () => {
    const a = prog({ id: "a", team: "P1", head: [1, 1], body: [[1, 1]], movesRemaining: 3 });
    const m = model({ width: 3, height: 3, filledCoordinates: allFilled(3, 3), programs: [a] });
    expect(keys(validMoves(m, "a"))).toEqual(keys([[2, 1], [0, 1], [1, 2], [1, 0]]));
  });
  it("returns null with no moves left", () => {
    const a = prog({ id: "a", team: "P1", head: [1, 1], body: [[1, 1]], movesRemaining: 0 });
    const m = model({ width: 3, height: 3, programs: [a] });
    expect(validMoves(m, "a")).toBeNull();
  });
});

describe("validDestinations", () => {
  it("is null with no moves, non-empty otherwise", () => {
    const a = prog({ id: "a", team: "P1", head: [1, 1], body: [[1, 1]], movesRemaining: 0 });
    const m = model({ width: 3, height: 3, programs: [a] });
    expect(validDestinations(m, "a")).toBeNull();
    const b = prog({ id: "b", team: "P1", head: [1, 1], body: [[1, 1]], movesRemaining: 2 });
    const m2 = model({ width: 3, height: 3, filledCoordinates: allFilled(3, 3), programs: [b] });
    expect((validDestinations(m2, "b") ?? []).length).toBeGreaterThan(0);
  });
});

describe("validTargets", () => {
  const attack = { name: "hit", description: "", range: 1, validTargetScheme: VT.OtherTeam, run: () => [] };
  it("hits the enemy in range, not self or empty", () => {
    const a = prog({ id: "a", team: "CPU", head: [1, 1], body: [[1, 1]], actions: [attack] });
    const e = prog({ id: "e", team: "P1", head: [2, 1], body: [[2, 1]] });
    const m = model({ width: 3, height: 3, filledCoordinates: allFilled(3, 3), programs: [a, e] });
    const t = keys(validTargets(m, "a", 0));
    expect(t.has("2,1")).toBe(true); // enemy
    expect(t.has("1,1")).toBe(false); // self
    expect(t.has("0,1")).toBe(false); // empty (scheme has no EmptyFilled bit)
  });
  it("returns null once the program has acted", () => {
    const a = prog({ id: "a", team: "CPU", head: [1, 1], body: [[1, 1]], actions: [attack], hasActed: true });
    const m = model({ programs: [a] });
    expect(validTargets(m, "a", 0)).toBeNull();
  });
  it("returns null with no action selected", () => {
    const a = prog({ id: "a", actions: [attack] });
    const m = model({ programs: [a] });
    expect(validTargets(m, "a", null)).toBeNull();
  });
});

describe("grownBody", () => {
  it("adds up to value tiles, capped at maxSize", () => {
    const a = prog({ id: "a", head: [2, 2], body: [[2, 2]], maxSize: 3 });
    const m = model({ width: 5, height: 5, filledCoordinates: allFilled(5, 5), programs: [a] });
    const grown = grownBody(m, "a", 2);
    expect(grown.length).toBe(3); // 1 + 2
    expect(grown).toContainEqual([2, 2]); // keeps the head cell
  });
  it("cannot exceed maxSize", () => {
    const a = prog({ id: "a", head: [2, 2], body: [[2, 2]], maxSize: 1 });
    const m = model({ width: 5, height: 5, filledCoordinates: allFilled(5, 5), programs: [a] });
    expect(grownBody(m, "a", 5).length).toBe(1);
  });
  it("stops when boxed in by other programs", () => {
    const a = prog({ id: "a", head: [0, 0], body: [[0, 0]], maxSize: 9 });
    const wall1 = prog({ id: "w1", head: [1, 0], body: [[1, 0]] });
    const wall2 = prog({ id: "w2", head: [0, 1], body: [[0, 1]] });
    const m = model({ width: 3, height: 3, filledCoordinates: allFilled(3, 3), programs: [a, wall1, wall2] });
    expect(grownBody(m, "a", 5).length).toBe(1); // no empty neighbour
  });
});
