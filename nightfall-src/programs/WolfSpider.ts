import { IProgram, TargetColor as TC } from "../types";
import { Clog as ClogSound } from "../audio/audioSources";
import { resolveImage } from "../util/util";

export const WolfSpider: IProgram = {
  id: "WolfSpider",
  color: "rgb(27,231,0)",
  iconImageFile: resolveImage("programs/WolfSpider.png"),
  name: "Wolf Spider",
  description: "Speedy and Creepy Little Program",
  actions: [
    {
      name: "Byte",
      description: "Deletes 2 Sectors From Target",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.damageTarget(targetID, 2)],
    },
    {
      name: "Prick",
      description: "Decreases Move Rate of Target Program by 1",
      range: 1,
      run: (ac, tc, selfID, targetID) => [ac.changeTargetMoves(targetID, -1)],
      audioSource: ClogSound,
      targetColor: TC.Blue,
    },
  ],
  maxSize: 2,
  numMoves: 4,
};
