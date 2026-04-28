import { Coordinate, CoordinateArray } from "./Coordinate";

export interface IGridEntity {
  head: Coordinate;
  body: CoordinateArray;
}

export interface IGridActiveEntity extends IGridEntity {
  movesRemaining: number;
  hasActed: boolean;
}
