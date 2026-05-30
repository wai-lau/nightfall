import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Zap, Heal } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Fiddle: IProgram = {
  id: "Fiddle",
  color: "rgb(140,120,230)",
  iconImageFile: resolveImage("programs/Fiddle.png"),
  name: "Fiddle",
  description: "Twiddle and Tweak The Power of your Programs",
  actions: [
    {
      name: "Tweak",
      description: "Increases Move Rate of Target by 1, Deletes 1 Sector from Fiddle",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(selfID, 1),
        ac.changeTargetMoves(targetID, 1),
      ],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Zap,
    },
    {
      name: "Twiddle",
      description: "Increases Maximum Size of Target by 1, Deletes 1 Sector from Fiddle",
      range: 1,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(selfID, 1),
        ac.changeTargetMaxSize(targetID, 1),
      ],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Heal, // ?
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
