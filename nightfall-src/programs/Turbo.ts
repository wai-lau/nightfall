import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Zap } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Turbo: IProgram = {
  id: "Turbo",
  color: "rgb(42,137,245)",
  iconImageFile: resolveImage("programs/Turbo.png"),
  name: "Turbo",
  description: "Speeds Up Your Programs",
  actions: [
    {
      name: "Boost",
      description: "Increase Move Rate of Target by 1 & Deletes 1 Sector from Turbo",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(selfID, 1),
        ac.changeTargetMoves(targetID, 1),
      ],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Zap,
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
