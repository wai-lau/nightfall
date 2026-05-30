import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Zap } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const TurboDX: IProgram = {
  id: "TurboDX",
  color: "rgb(140,120,230)",
  iconImageFile: resolveImage("programs/TurboDX.png"),
  name: "Turbo Deluxe",
  description: "Slow and Steady is for Losers",
  actions: [
    {
      name: "Megaboost",
      description: "Increase Move Rate of Target by 2 & Deletes 2 Sectors from Turbo",
      range: 2,
      run: (ac, tc, selfID, targetID) => {
        return [ac.damageTarget(selfID, 2), ac.changeTargetMoves(targetID, 2)];
      },
      sizeReq: 3,
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Zap,
    },
  ],
  maxSize: 4,
  numMoves: 4,
};
