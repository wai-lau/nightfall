import { IProgram, TargetColor } from "../types";
import { resolveImage } from "../util/util";
import { Clog as ClogSound } from "../audio/audioSources";

export const Clog3: IProgram = {
  id: "Clog3",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Clog3.png"),
  name: "Clog.03",
  description: "Brings Hostile Programs to a Halt",
  actions: [
    {
      name: "Chug",
      description: "Decreases Move Rate of Target by 2",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -2)],
      audioSource: ClogSound,
      targetColor: TargetColor.Blue,
    },
    {
      name: "Hang",
      description: "Decreases Move Rate of Target to 0",
      range: 3,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -99999)],
      sizeReq: 4,
      audioSource: ClogSound,
      targetColor: TargetColor.Blue,
    },
  ],
  maxSize: 4,
  numMoves: 2,
};
