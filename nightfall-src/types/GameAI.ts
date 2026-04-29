import { Coordinate, CoordinateArray } from "./Coordinate";
import { IGridActiveProgram } from "./Program";

export default interface IGameAI {
  getProgramByID: (id: string) => IGridActiveProgram;
  getPrograms: () => IGridActiveProgram[];
  getProgramIDAtCoordinate: (c: Coordinate) => string | null;
  getPassable: (programID: string) => CoordinateArray;
  getDimensions: () => Coordinate;
  getValidTargets: () => CoordinateArray | null;
  createOnMove: (c: Coordinate) => () => Promise<void>;
  createOnAct: (c: Coordinate) => () => Promise<void>;
  createOnSelectProgram: (id: string) => () => Promise<void>;
  onSelectAction: (actionIndex: number) => Promise<void>;
  onSelectNoAction: () => Promise<void>;
}
