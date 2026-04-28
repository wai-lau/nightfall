import { IProgram, TargetColor } from "../types";
import { resolveImage } from "../util/util";
import { Clog as ClogSound } from "../audio/audioSources";

export const Clog2: IProgram = {
  id: "Clog2",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog2.png"),
  name: "Clog.02",
  description: "Twice as Effective as Version .01",
  actions: [
    {
      name: "Chug",
      description: "Decreases Move Rate of Target by 2",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -2)],
      audioSource: ClogSound,
      targetColor: TargetColor.Blue,
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
