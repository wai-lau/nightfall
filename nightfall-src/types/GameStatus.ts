import { IProgram } from "./Program";
import { NodeStatus, NetmapPosition, INetmapNode } from "./Netmap";
import { IDialogue } from "./Dialogue";

export interface IGameStatus {
  numCredits: number;
  availablePrograms: IProgram[];
  netmapStatus: { [id: string]: NodeStatus };
  scrollPosition: NetmapPosition;
  firstClearNode: { id: INetmapNode["id"]; result: "clear" | "lose" } | null;
  collectedCreditIDs: string[];
  securityLevel: number;
  completedTutorial: boolean;
  nightfallAvailableNodes?: INetmapNode["id"][];
}

export interface IGameStatusCoordinator {
  addProgram(p: IProgram): Promise<void>;
  addCredits(n: number): Promise<void>;
  getNodeStatus(id: string): NodeStatus | null;
  setNodeStatus(id: string, status: NodeStatus): Promise<void>;
  startDialogue(dialogue: IDialogue): Promise<boolean>;
  revealNode(id: string): Promise<void>;
  scrollToNode(id: string): Promise<void>;
  setLevel(l: number): Promise<void>;
  displayMessage(header: string, message: string): Promise<void>;
  setNightfallNodes(ids?: string[]): Promise<void>;
}
