import { IProgram, TargetColor } from "../types";
import { resolveImage } from "../util/util";
import { Clog as ClogSound } from "../audio/audioSources";

export const Clog: IProgram = {
  id: "Clog",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog.png"),
  name: "Clog.01",
  description: "Slows Down Hostile Programs",
  actions: [
    {
      name: "Lag",
      description: "Decrease Move Rate of Target by 1",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -1)],
      audioSource: ClogSound,
      targetColor: TargetColor.Blue,
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
