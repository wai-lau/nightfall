import parseDialogue from "../../util/parseDialogue";

export const ZhangShanT4 = parseDialogue(`
zhangshan:t4:100-500

#100 Agent. We need to talk.
>200 Talking.

#200 The signature on the original attacks against our nodes was not yours. Someone forged it. Same fingerprint your handler found.
>300 An inside job.

#300 Yes. My apologies. We retaliated on bad intel. Five thousand credits in reparations have been transferred to your handler, cleared for release to you.
>400 And the inside man?

#400 Yours to handle. Find him and end this, before either of us has to do it for the other.
>500 Understood.
`);
