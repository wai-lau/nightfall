import { IProgram, ValidTarget as VT, TargetColor as TC } from "../types";
import { BitFlip } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const BitMan: IProgram = {
  id: "BitMan",
  color: "rgb(182,252,0)",
  iconImageFile: resolveImage("programs/BitMan.png"),
  name: "Bit-Man",
  description: "Makes Sectors of the Grid Appear or Disappear",
  actions: [
    {
      name: "Zero",
      description: "Deletes one grid square",
      range: 1,
      run: (ac, tc, _selfID, _targetID) => [ac.bitFlipCoordinate(tc, false)],
      targetColor: TC.Green,
      validTargetScheme: VT.Unfilled | VT.EmptyFilled,
      audioSource: BitFlip,
      alwaysPlayAudio: true,
    },
    {
      name: "One",
      description: "Repairs one grid square",
      range: 1,
      run: (ac, tc, _selfID, _targetID) => [ac.bitFlipCoordinate(tc, true)],
      targetColor: TC.Green,
      validTargetScheme: VT.Unfilled | VT.EmptyFilled,
      audioSource: BitFlip,
      alwaysPlayAudio: true,
    },
  ],
  maxSize: 3,
  numMoves: 3,
};
