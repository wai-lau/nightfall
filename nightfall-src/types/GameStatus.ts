import { IProgram } from "./Program";
import { NodeStatus, NetmapPosition, INetmapNode } from "./Netmap";
import { IDialogue } from "./Dialogue";

export interface IGameStatus {
  numCredits: number;
  availablePrograms: IProgram[];
  netmapStatus: { [id: string]: NodeStatus };
  scrollPosition: NetmapPosition;
  firstClearNode: { id: INetmapNode["id"]; result: "clear" | "lose" } | null;
}

export interface IGameStatusCoordinator {
  addProgram(p: IProgram): Promise<void>;
  addCredits(n: number): Promise<void>;
  setNodeStatus(id: string, status: NodeStatus): Promise<void>;
  setScrollPosition(pos: NetmapPosition): Promise<void>;
  setFirstClearNode(node: { id: string; result: "clear" | "lose" } | null): Promise<void>;
  startDialogue(dialogue: IDialogue): void;
  openNode(id: string): Promise<void>;
}
