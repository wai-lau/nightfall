import { Coordinate, CoordinateFill } from "./Coordinate";
import { IGridInitialProgram } from "./Program";

export interface IUploadZone {
  position: Coordinate;
  team: string;
}

export interface IGridActiveUploadZone extends IUploadZone {
  id: string;
  programIndex: number | null;
}

export interface ICredit {
  id: string;
  amount: number;
  position: Coordinate;
}

export interface IGridActiveCredit extends ICredit {
  collected: boolean;
}

export interface ILevel {
  id: string;
  width: number;
  height: number;
  filledCoordinates: CoordinateFill;
  teams: string[];
  uploadZones: IUploadZone[];
  programs: IGridInitialProgram[];
  credits: ICredit[];
  dataPack?: Coordinate;
}
