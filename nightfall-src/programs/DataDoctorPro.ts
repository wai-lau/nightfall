import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { Heal, Grow } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const DataDoctorPro: IProgram = {
  id: "DataDoctorPro",
  color: "rgb(0,51,249)",
  iconImageFile: resolveImage("programs/DataDoctorPro.png"),
  name: "Data Doctor Pro",
  description: "Twice the Expansion Power of Data Doctor",
  actions: [
    {
      name: "Megagrow",
      description: "Adds Up to 4 Sectors to Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.growTarget(targetID, 4)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Heal,
    },
    {
      name: "Surgery",
      description: "Increases Maximum Size of Target Program by 1",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMaxSize(targetID, 1)],
      targetColor: TC.Blue,
      validTargetScheme: VT.EmptyFilled | VT.SameTeam,
      audioSource: Grow,
    },
  ],
  maxSize: 8,
  numMoves: 5,
};
