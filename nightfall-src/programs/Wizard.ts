import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Grow } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Wizard: IProgram = {
  id: "Wizard",
  color: "rgb(0,252,149)",
  iconImageFile: resolveImage("programs/Wizard.png"),
  name: "Wizard",
  description: "Pay No Attention to the Man Behind the Curtain",
  actions: [
    {
      name: "Scorch",
      description: "Deletes 2 Sectors From Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Stretch",
      description: "Increases Max Size of Target By 1",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMaxSize(targetID, 1)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Grow,
    },
  ],
  maxSize: 4,
  numMoves: 3,
};
