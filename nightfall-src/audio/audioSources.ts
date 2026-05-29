import { IAudioSource } from "../types";

declare const AUDIO_BASE_URL: string;
const u = (file: string): string => `${AUDIO_BASE_URL}/${file}`;

export const __TODO__: IAudioSource = {
  solo: true,
  srcUrl: u("hover-c.mp3"),
  name: "__TODO__",
};

export const Theme: IAudioSource = {
  solo: true,
  srcUrl: u("theme.wav"),
  name: "theme",
  volume: 0.8,
};

export const Netmap: IAudioSource = {
  solo: true,
  srcUrl: u("netmap.mp3"),
  name: "netmap",
  volume: 0.4,
};

export const Move: IAudioSource = {
  srcUrl: u("move.mp3"),
  name: "move",
};

export const Attack: IAudioSource = {
  srcUrl: u("attack.mp3"),
  name: "attack",
};

export const BitFlip: IAudioSource = {
  srcUrl: u("bitflip.mp3"),
  name: "bitflip",
};

export const Heal: IAudioSource = {
  srcUrl: u("heal.mp3"),
  name: "heal",
};

export const Loop1: IAudioSource = {
  solo: true,
  srcUrl: u("loop-1.mp3"),
  name: "loop-1",
  volume: 0.4,
};

export const Loop2: IAudioSource = {
  solo: true,
  srcUrl: u("loop-2.mp3"),
  name: "loop-2",
  volume: 0.4,
};

export const Loop3: IAudioSource = {
  solo: true,
  srcUrl: u("loop-3.mp3"),
  name: "loop-3",
  volume: 0.4,
};

export const Loop4: IAudioSource = {
  solo: true,
  srcUrl: u("loop-4.mp3"),
  name: "loop-4",
  volume: 0.4,
};

export const ProgramReady: IAudioSource = {
  srcUrl: u("program-ready.mp3"),
  name: "program-ready",
};

export const SelectAction: IAudioSource = {
  srcUrl: u("select-action.mp3"),
  name: "select-action",
};

export const NoAction: IAudioSource = {
  srcUrl: u("select-action.mp3"),
  name: "select-action",
};

export const ButtonNormal: IAudioSource = {
  srcUrl: u("select-action.mp3"),
  name: "select-action",
};

export const Disconnect: IAudioSource = {
  srcUrl: u("disconnect.mp3"),
  name: "disconnect",
  solo: true,
  volume: 0.6,
};

export const Success: IAudioSource = {
  srcUrl: u("success.mp3"),
  name: "success",
  solo: true,
};

export const Credit: IAudioSource = {
  srcUrl: u("credit.mp3"),
  name: "credit",
};

export const HoverC: IAudioSource = {
  srcUrl: u("hover-c.mp3"),
  name: "hover-c",
};

export const HoverEb: IAudioSource = {
  srcUrl: u("hover-eb.mp3"),
  name: "hover-eb",
};

export const HoverF: IAudioSource = {
  srcUrl: u("hover-f.mp3"),
  name: "hover-f",
};

export const LMMIntro: IAudioSource = {
  solo: true,
  srcUrl: u("lmm-intro.mp3"),
  name: "lmm-intro",
};

export const PHIntro: IAudioSource = {
  solo: true,
  srcUrl: u("ph-intro.mp3"),
  name: "ph-intro",
};

export const CARIntro: IAudioSource = {
  solo: true,
  srcUrl: u("car-intro.mp3"),
  name: "car-intro",
};

export const PEDIntro: IAudioSource = {
  solo: true,
  srcUrl: u("ped-intro.mp3"),
  name: "ped-intro",
};

export const DonutIntro: IAudioSource = {
  solo: true,
  srcUrl: u("donut-intro.mp3"),
  name: "donut-intro",
};

export const DisarrayIntro: IAudioSource = {
  solo: true,
  srcUrl: u("disarray-intro.mp3"),
  name: "disarray-intro",
};

export const TANGIntro: IAudioSource = {
  solo: true,
  srcUrl: u("tang-intro.mp3"),
  name: "tang-intro",
};

export const IntroNoise: IAudioSource = {
  solo: false,
  srcUrl: u("intro-noise.mp3"),
  name: "intro-noise",
  volume: 0.6,
};

export const Zap: IAudioSource = {
  srcUrl: u("zap.mp3"),
  name: "zap",
};

export const Clog: IAudioSource = {
  srcUrl: u("clog.mp3"),
  name: "clog",
};

export const Grow: IAudioSource = {
  srcUrl: u("grow.mp3"),
  name: "grow",
};

export const UploadProgram: IAudioSource = {
  srcUrl: u("upload-program.mp3"),
  name: "upload-program",
};

export const Received: IAudioSource = {
  srcUrl: u("received.mp3"),
  name: "received",
};

export const BattleCAR: IAudioSource = {
  solo: true,
  srcUrl: u("CAR.mp3"),
  name: "battle-car",
  volume: 0.4,
};

export const BattleLMM: IAudioSource = {
  solo: true,
  srcUrl: u("LMM.mp3"),
  name: "battle-lmm",
  volume: 0.4,
};

export const BattleDonut: IAudioSource = {
  solo: true,
  srcUrl: u("Donut.mp3"),
  name: "battle-donut",
  volume: 0.4,
};

export const BattleQ1: IAudioSource = {
  solo: true,
  srcUrl: u("Q1.mp3"),
  name: "battle-q1",
  volume: 0.4,
};

export const BattleTANG: IAudioSource = {
  solo: true,
  srcUrl: u("TANG.mp3"),
  name: "battle-tang",
  volume: 0.4,
};
