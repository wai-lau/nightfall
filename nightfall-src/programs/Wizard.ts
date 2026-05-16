import { IProgram, TargetColor as TC } from "../types";
import { Clog } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Wizard: IProgram = {
  id: "Wizard",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/Wizard.png"),
  name: "Wizard",
  description: "Pay No Attention to the Man Behind the Curtain",
  actions: [
    {
      name: "Fire",
      description: "Deletes 4 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
    {
      name: "Ice",
      description: "Decreases Movement of Target by 3",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -3)],
      targetColor: TC.Blue,
      audioSource: Clog,
    },
  ],
  maxSize: 3,
  numMoves: 2,
};
