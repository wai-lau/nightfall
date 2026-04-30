import * as AudioSources from "../audio/audioSources";
import { IAudioShufflerConfig } from "../util/AudioShuffler";

const loopConfig = (source: typeof AudioSources.BattleCAR, id: string): IAudioShufflerConfig => ({
  entries: [
    {
      canStart: true,
      id,
      minPlay: 1,
      maxPlay: 999,
      source,
      transitions: { [id]: 1.0 },
    },
  ],
});

export const CARConfig = loopConfig(AudioSources.BattleCAR, "car");
export const LMMConfig = loopConfig(AudioSources.BattleLMM, "lmm");
export const DonutConfig = loopConfig(AudioSources.BattleDonut, "donut");
export const Q1Config = loopConfig(AudioSources.BattleQ1, "q1");
