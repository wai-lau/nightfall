import { IProgram } from "./Program";

export interface IWarezData {
  id: string;
  name: string;
  prices: { [programId: string]: number };
  programs: IProgram[];
}
