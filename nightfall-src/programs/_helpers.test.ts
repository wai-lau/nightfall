import { describe, it, expect } from "vitest";
import { attack, slow } from "./_helpers";
import { TargetColor as TC, IActionCoordinator } from "../types";

// Minimal action coordinator that records calls.
const recorder = () => {
  const calls: [string, string | null, number][] = [];
  const ac = {
    damageTarget: (id, v) => (calls.push(["damage", id, v]), Promise.resolve()),
    changeTargetMoves: (id, v) => (calls.push(["moves", id, v]), Promise.resolve()),
    growTarget: () => Promise.resolve(),
    changeTargetMaxSize: () => Promise.resolve(),
    bitFlipCoordinate: () => Promise.resolve(),
  } as IActionCoordinator;
  return { ac, calls };
};

describe("attack", () => {
  it("defaults to range 1, no sound, one damageTarget", () => {
    const a = attack("Byte", "desc", 2);
    expect(a.range).toBe(1);
    expect(a.audioSource).toBeUndefined();
    const { ac, calls } = recorder();
    a.run(ac, [0, 0], "self", "tgt");
    expect(calls).toEqual([["damage", "tgt", 2]]);
  });
  it("merges opts (range, sizeReq)", () => {
    expect(attack("Ping", "d", 1, { range: 8 }).range).toBe(8);
    expect(attack("Slam", "d", 8, { sizeReq: 6 }).sizeReq).toBe(6);
  });
});

describe("slow", () => {
  it("sets slow sound + blue indicator and a negative move change", () => {
    const s = slow("Poison", "d", 2);
    expect(s.targetColor).toBe(TC.Blue);
    expect(s.audioSource).toBeDefined();
    expect(s.range).toBe(1);
    const { ac, calls } = recorder();
    s.run(ac, [0, 0], "self", "tgt");
    expect(calls).toEqual([["moves", "tgt", -2]]);
  });
  it("opts override range/sizeReq, keep sound + color", () => {
    const s = slow("Hang", "d", 4, { range: 3, sizeReq: 4 });
    expect(s.range).toBe(3);
    expect(s.sizeReq).toBe(4);
    expect(s.targetColor).toBe(TC.Blue);
  });
});
