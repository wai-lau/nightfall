// Pure, headless battle rules — the query/validation/transform core that used
// to live as methods on the Battle React component. Nothing here touches React,
// audio, animation or timing, so it is directly unit-testable. Battle.tsx holds
// the live state and delegates the computation here, then applies the result
// (setState + effects) itself.
import {
  Coordinate,
  CoordinateArray,
  CoordinateFill,
  IGridActiveProgram,
  IGridActiveCredit,
  ValidTarget as VT,
} from "../types";
import {
  getAdjacent,
  isInBounds,
  coordinateInArray,
  coordinatesEqual,
  matchFlag,
} from "./util";
import { getRangeFromArea } from "./path";

// A read-only view of the grid the rules operate over.
export interface BattleModel {
  width: number;
  height: number;
  filledCoordinates: CoordinateFill;
  programs: IGridActiveProgram[];
  credits: IGridActiveCredit[];
  dataPack?: Coordinate;
}

export const isFilled = (m: BattleModel, c: Coordinate): boolean =>
  m.filledCoordinates[c[1]][c[0]];

export const programByID = (
  programs: IGridActiveProgram[],
  id: string | null
): IGridActiveProgram => {
  if (id === null) {
    throw new Error("Attempted to search for null ID");
  }
  const match = programs.find((p) => p.id === id);
  if (!match) {
    throw new Error("No program found with id " + id);
  }
  return match;
};

// First program whose body occupies the coordinate, or null. (Equivalent to the
// old program-map lookup: the head of the per-cell program list.)
export const programIDAtCoordinate = (
  programs: IGridActiveProgram[],
  c: Coordinate
): string | null => {
  const match = programs.find((p) => p.body.some((b) => coordinatesEqual(b, c)));
  return match ? match.id : null;
};

export const creditIDAtCoordinate = (
  credits: IGridActiveCredit[],
  c: Coordinate
): string | null => {
  const match = credits.find((credit) => coordinatesEqual(credit.position, c));
  return match ? match.id : null;
};

// Cells the given program may move through: filled, and either empty or its own.
// For the CPU, the data pack and credit cells are impassable.
export const passableCells = (m: BattleModel, programID: string): CoordinateArray => {
  const program = programByID(m.programs, programID);
  const passable: CoordinateArray = [];
  for (let y = 0; y < m.height; y++) {
    for (let x = 0; x < m.width; x++) {
      if (!m.filledCoordinates[y][x]) {
        continue;
      }
      const c: Coordinate = [x, y];
      if (program.team === "CPU") {
        if (m.dataPack && coordinatesEqual(m.dataPack, c)) {
          continue;
        }
        if (creditIDAtCoordinate(m.credits, c)) {
          continue;
        }
      }
      const occupyID = programIDAtCoordinate(m.programs, c);
      if (!occupyID || occupyID === programID) {
        passable.push([x, y]);
      }
    }
  }
  return passable;
};

// Single-step moves for a program (adjacent filled cells, empty or its own).
// null when the program has no moves left.
export const validMoves = (m: BattleModel, programID: string): CoordinateArray | null => {
  const { head, id, movesRemaining } = programByID(m.programs, programID);
  if (movesRemaining === 0) {
    return null;
  }
  return getAdjacent(head)
    .filter((c) => isInBounds(c, m.width, m.height))
    .filter((c) => isFilled(m, c))
    .filter((c) => {
      const occ = programIDAtCoordinate(m.programs, c);
      return occ === null || occ === id;
    });
};

// All cells a program can reach this turn (range-limited flood over passables).
export const validDestinations = (
  m: BattleModel,
  programID: string
): CoordinateArray | null => {
  const { head, id, movesRemaining } = programByID(m.programs, programID);
  if (movesRemaining === 0) {
    return null;
  }
  return getRangeFromArea([head], movesRemaining, passableCells(m, id));
};

// Cells the selected program's chosen action may target, per its target scheme.
export const validTargets = (
  m: BattleModel,
  programID: string,
  actionIndex: number | null
): CoordinateArray | null => {
  if (actionIndex === null) {
    return null;
  }
  const selectedProgram = programByID(m.programs, programID);
  if (selectedProgram.hasActed) {
    return null;
  }
  const action = selectedProgram.actions[actionIndex];
  if (!action) {
    return null;
  }
  const { range, validTargetScheme = VT.Default } = action;
  return getRangeFromArea([selectedProgram.head], range)
    .filter((c) => isInBounds(c, m.width, m.height))
    .filter((c) => {
      if (!isFilled(m, c)) {
        return matchFlag(validTargetScheme, VT.Unfilled);
      }
      const id = programIDAtCoordinate(m.programs, c);
      if (!id) {
        return matchFlag(validTargetScheme, VT.EmptyFilled);
      }
      const targetProgram = programByID(m.programs, id);
      if (targetProgram.id === selectedProgram.id) {
        return matchFlag(validTargetScheme, VT.Self);
      } else if (targetProgram.team === selectedProgram.team) {
        return matchFlag(validTargetScheme, VT.SameTeam);
      }
      return matchFlag(validTargetScheme, VT.OtherTeam);
    });
};

// Move-rate change clamps remaining moves to 0..10 and shifts the max in step.
export const applyMoveDelta = (
  numMoves: number,
  movesRemaining: number,
  delta: number
): { numMoves: number; movesRemaining: number } => {
  const newMovesRemaining = Math.min(Math.max(movesRemaining + delta, 0), 10);
  return {
    numMoves: newMovesRemaining - movesRemaining + numMoves,
    movesRemaining: newMovesRemaining,
  };
};

export const applyMaxSizeDelta = (maxSize: number, delta: number): number =>
  Math.max(0, maxSize + delta);

// Body after growing by `value` tiles: repeatedly append the first empty,
// in-grid, unoccupied neighbour of the earliest body cell that has one, up to
// maxSize.
export const grownBody = (
  m: BattleModel,
  programID: string,
  value: number
): CoordinateArray => {
  const { body, maxSize } = programByID(m.programs, programID);
  let numAdded = 0;
  const updatedBody: CoordinateArray = [...body];
  while (numAdded < value && updatedBody.length < maxSize) {
    let i = 0;
    while (i < updatedBody.length) {
      const empty = getAdjacent(updatedBody[i])
        .filter((c) => isInBounds(c, m.width, m.height))
        .filter((c) => isFilled(m, c))
        .filter(
          (c) =>
            !programIDAtCoordinate(m.programs, c) && !coordinateInArray(c, updatedBody)
        );
      if (empty.length) {
        updatedBody.push(empty[0]);
        numAdded++;
        break;
      }
      i++;
    }
    if (i === updatedBody.length) {
      break;
    }
  }
  return updatedBody;
};

// Winner team, or null if the battle continues. One team left wins — except a
// non-CPU survivor on a data-pack map must still grab the pack (no auto-win).
export const getWinner = (
  programs: IGridActiveProgram[],
  hasDataPack: boolean
): string | null => {
  const teams = new Set(programs.map((p) => p.team));
  if (teams.size !== 1) {
    return null;
  }
  const last = Array.from(teams)[0];
  if (last !== "CPU" && hasDataPack) {
    return null;
  }
  return last;
};
