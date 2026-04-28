export interface ICharacter {
  id: string;
  name: string;
  image: string;
}

export interface IDialogueButton {
  to: number;
  text: string;
}

export interface IDialogueEntry {
  stage: number;
  text: string;
  buttons: IDialogueButton[];
}

export interface IDialogue {
  id: string;
  character: ICharacter;
  startStage: number;
  endStage: number;
  entries: IDialogueEntry[];
}
