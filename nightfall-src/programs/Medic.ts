import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Heal } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Medic: IProgram = {
  id: "Medic",
  color: "rgb(0,51,249)",
  iconImageFile: resolveImage("programs/Medic.png"),
  name: "Medic",
  description: "Grows Your Programs From A Distance",
  actions: [
    {
      name: "Hypo",
      description: "Adds 2 Sectors To Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.growTarget(targetID, 2)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Heal,
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
