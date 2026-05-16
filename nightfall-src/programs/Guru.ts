import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Heal, Clog } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Guru: IProgram = {
  id: "Guru",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Guru.png"),
  name: "Guru",
  description: "Multipurpose Software for the L33tist of the L33t",
  actions: [
    {
      name: "Glare",
      description: "Deletes 3 Sectors From Target and Decreases Move Rate by 1",
      range: 3,
      run: (ac, tc, selfID, targetID) => [
        ac.damageTarget(targetID, 3),
        ac.changeTargetMoves(targetID, -1),
      ],
      audioSource: Clog,
    },
    {
      name: "Magnify",
      description: "Adds 3 Sectors to Target",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.growTarget(targetID, 3)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Heal,
    },
  ],
  maxSize: 2,
  numMoves: 4,
};
