import { IProgram, TargetColor as TC } from "../types";
import { Clog } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const Guru: IProgram = {
  id: "Guru",
  color: "rgb(0,252,203)",
  iconImageFile: resolveImage("programs/Guru.png"),
  name: "Guru",
  description: "Multipurpose Software for the L33tist of the L33t",
  actions: [
    {
      name: "Fire",
      description: "Deletes 4 Sectors From Target",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 4)],
    },
    {
      name: "Ice",
      description: "Decreases Movement of Target by 3",
      range: 2,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -3)],
      targetColor: TC.Blue,
      audioSource: Clog,
    },
  ],
  maxSize: 3,
  numMoves: 2,
};
