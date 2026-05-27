import { ProgramAction, TargetColor as TC } from "../types";
import { Clog as ClogSound } from "../audio/audioSources";

// Builders for the two most common program actions, so number-only variants
// stop restating the action body (and can't drift — e.g. a slow forgetting its
// sound/indicator). Pass `opts` to override defaults (range, sizeReq, etc.).

// Single-target damage.
export const attack = (
  name: string,
  description: string,
  damage: number,
  opts: Partial<ProgramAction> = {}
): ProgramAction => ({
  name,
  description,
  range: 1,
  run: (ac, _tc, _selfID, targetID) => [ac.damageTarget(targetID, damage)],
  ...opts,
});

// Move-rate debuff on an enemy (the "slow" family). The slow sound + blue
// indicator live here once, so every slow program stays consistent.
export const slow = (
  name: string,
  description: string,
  amount: number,
  opts: Partial<ProgramAction> = {}
): ProgramAction => ({
  name,
  description,
  range: 1,
  audioSource: ClogSound,
  targetColor: TC.Blue,
  run: (ac, _tc, _selfID, targetID) => [ac.changeTargetMoves(targetID, -amount)],
  ...opts,
});
