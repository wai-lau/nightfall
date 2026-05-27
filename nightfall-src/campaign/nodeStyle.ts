import { INetmapBattleNode, INetmapNonBattleNode } from "../types";
import { resolveImage } from "../util/util";
import * as AudioSources from "../audio/audioSources";
import { TANGConfig } from "./corpAudioConfigs";

// The boilerplate corp access-warning — only the org's legal name varies.
const standardWarning = (org: string): string[] => [
  `The node you are attempting to access is the property of ${org}. Unauthorized access beyond this point is strictly prohibited.`,
  "If you proceed you will be in violation of international corporate stature 71J-36Wf9 and will be forcibly disconnected by this node's anti-intrusion security software. Thank you for not hacking.",
];

export const ph: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-ph-t.png"),
    clearedIcon: resolveImage("nodes/trim-ph-o.png"),
    infoImage: resolveImage("bg/ph-logo.png"),
    netmapOrgName: "Pharmhaus",
  },
  battleStyle: {
    warningHeader: "We take your medication seriously",
    warningText: standardWarning("Pharmahaus LLC"),
    battleLogoImage: resolveImage("bg/ph-logo.png"),
    bgImage: resolveImage("bg/pharmhaus.jpg"),
    introAudio: AudioSources.PHIntro,
  },
};
export const lmm: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-lmm-t.png"),
    clearedIcon: resolveImage("nodes/trim-lmm-o.png"),
    infoImage: resolveImage("bg/lmm-logo-text.png"),
    netmapOrgName: "Lucky Monkey",
  },
  battleStyle: {
    warningHeader: "It's all in your imagination",
    warningText: standardWarning("Lucky Monkey Media"),
    battleLogoImage: resolveImage("bg/lmm-logo.png"),
    bgImage: resolveImage("bg/lucky-monkey.jpg"),
    introAudio: AudioSources.LMMIntro,
  },
};
export const ped: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-ped-t.png"),
    clearedIcon: resolveImage("nodes/trim-ped-o.png"),
    infoImage: resolveImage("bg/ped-logo.png"),
    netmapOrgName: "PED",
  },
  battleStyle: {
    warningHeader: "Your money is our business",
    warningText: standardWarning("Parker Ellington Davis Consulting"),
    battleLogoImage: resolveImage("bg/ped-logo.png"),
    bgImage: resolveImage("bg/parker-ellington-davis.jpg"),
    introAudio: AudioSources.PEDIntro,
  },
};
export const car: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-car-t.png"),
    clearedIcon: resolveImage("nodes/trim-car-o.png"),
    infoImage: resolveImage("bg/car-logo.png"),
    netmapOrgName: "Cellular Automata",
  },
  battleStyle: {
    warningHeader: "Making the future less predictable",
    warningText: standardWarning("Cellular Automata Research"),
    battleLogoImage: resolveImage("bg/car-logo.png"),
    bgImage: resolveImage("bg/cellular-automata.jpg"),
    introAudio: AudioSources.CARIntro,
  },
};
export const donut: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-donut-t.png"),
    clearedIcon: resolveImage("nodes/trim-donut-o.png"),
    infoImage: resolveImage("bg/donut-logo-text.png"),
    netmapOrgName: "Dr. Donut",
  },
  battleStyle: {
    warningHeader: 'Open wide and say "AHHHHHH!"',
    warningText: standardWarning("Dr. Donut"),
    battleLogoImage: resolveImage("bg/donut-logo.png"),
    bgImage: resolveImage("bg/dr-donut.jpg"),
    introAudio: AudioSources.DonutIntro,
  },
};
export const hq: Pick<INetmapBattleNode, "battleStyle" | "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-hq-t.png"),
    clearedIcon: resolveImage("nodes/trim-hq-o.png"),
    infoImage: "", // No Image
    netmapOrgName: "", // No Name
  },
  battleStyle: {
    warningHeader: "DisArray's HQ – Keep Out!",
    warningText: [
      "The node you are attempting to access is the property of Disarray, the world's most elite hacker. Unauthorized access beyuond this point is only for the extremely stupid.",
      "If you proceed you will be in violation of my net genius and will be forcibly ripped into bit-sized pieces by killer programs which will plague your nightmares for the rest of your natural life. Thank you for not hacking well.",
    ],
    battleLogoImage: "",
    bgImage: resolveImage("bg/code.jpg"),
    introAudio: AudioSources.DisarrayIntro,
  },
};

export const tang: Pick<
  INetmapBattleNode,
  "battleStyle" | "nodeStyle" | "audioConfig"
> = {
  audioConfig: TANGConfig,
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-ph-t.png"),
    clearedIcon: resolveImage("nodes/trim-ph-o.png"),
    infoImage: resolveImage("bg/ph-logo.png"),
    netmapOrgName: "TANG",
  },
  battleStyle: {
    warningHeader: "Sovereignty as a Service",
    warningText: standardWarning("Territorial Ancestry Negotiation Group"),
    battleLogoImage: resolveImage("bg/ph-logo.png"),
    bgImage: resolveImage("bg/tang.png"),
    introAudio: AudioSources.PHIntro,
  },
};

export const smart: Pick<INetmapNonBattleNode, "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-smart.png"),
    clearedIcon: resolveImage("nodes/trim-smart.png"),
    infoImage: resolveImage("bg/smart-logo.png"),
    netmapOrgName: "SmA-RT",
  },
};
export const warez: Pick<INetmapNonBattleNode, "nodeStyle"> = {
  nodeStyle: {
    unclearedIcon: resolveImage("nodes/trim-warez-t.png"),
    clearedIcon: resolveImage("nodes/trim-warez-o.png"),
    infoImage: resolveImage("bg/warez-logo.png"),
    netmapOrgName: "Warez Node",
  },
};