import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Heal } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const DataDoctor: IProgram = {
  id: "DataDoctor",
  color: "rgb(0,51,249)",
  iconImageFile: resolveImage("programs/DataDoctor.png"),
  name: "Data Doctor",
  description: "Helps Your Programs Grow",
  actions: [
    {
      name: "Grow",
      description: "Adds 2 Sectors To Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.growTarget(targetID, 2)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Heal,
    },
  ],
  maxSize: 5,
  numMoves: 4,
};
