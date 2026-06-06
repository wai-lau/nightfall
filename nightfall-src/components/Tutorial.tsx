import React from "react";
import Battle, { BattleState } from "./Battle";

import * as Programs from "../programs";
import { __TODO__ } from "../audio/audioSources";
import { IBattleStyle } from "../types";
import { resolveImage } from "../util/util";

import tutorialLevel from "../campaign/levels/tutorial";
import { SuperphreakTutorial } from "../campaign/dialogues";
import Dialogue from "./Dialogue";

interface TutorialProps {
  onEnd: () => void;
}
interface TutorialState {
  targetEl?: ReturnType<typeof document["querySelector"]>;
  // True while the current stage waits on a board click (ring shown, board
  // passthrough). False on dialogue-advance stages, which dim the screen.
  // Derived per-stage so it doesn't flicker with targetEl churn.
  boardStage?: boolean;
}

const battleStyle: IBattleStyle = {
  warningHeader: "",
  warningText: [""],
  bgImage: resolveImage("bg/code.jpg"),
  battleLogoImage: "",
  introAudio: __TODO__,
};

const stageSelectors: Record<number, string> = {
  200: ".grid-program.head[data-name='Upload Zone'][data-coord='3,4']",
  300: ".ul-cell[data-name='Hack']",
  400: ".grid-program.head[data-name='Upload Zone'][data-coord='2,2']",
  500: ".ul-cell[data-name='Slingshot']",
  600: ".begin-databattle > button",
  800: ".grid-program.head[data-name='Hack']",
  900: ".pm-actions > button:first-child",
  1000: ".undo > button",
  1100: ".move-right",
  1300: ".move-right",
  1400: ".pm-actions > button:first-child",
  1500: ".action.attack[data-coord='6,4']",
  1600: ".grid-program.head[data-name='Slingshot']",
  1700: ".move-right",
  1800: ".pm-actions > button:first-child",
  1900: ".action.attack[data-coord='6,2']",
};

// Keyboard equivalents of the stage targets above. Battle fires onTutorialAction
// from its keyboard-only paths; a stage advances when the fired key matches.
// Stages absent here are click-only (upload picks, the begin button which a
// keyboard Enter already turns into a click, and the grid-click attacks).
const stageActionKeys: Record<number, string> = {
  800: "select:Hack",
  900: "action:0",
  1000: "undo",
  1100: "move:right",
  1300: "move:right",
  1400: "action:0",
  1600: "select:Slingshot",
  1700: "move:right",
  1800: "action:0",
};

// Game shortcut keys the tutorial guards. Anything not in here (F5, devtools,
// etc.) passes through untouched; these are blocked unless they are the
// current stage's correct key.
const GAME_KEYS = new Set([
  "w", "a", "s", "d", "W", "A", "S", "D",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "q", "Q", "e", "E", "Tab", "Escape", " ", "Shift",
]);

// Raw key(s) that count as "correct" for each stage action.
const ACTION_KEYS: Record<string, string[]> = {
  "move:right": ["ArrowRight", "d", "D"],
  "move:left": ["ArrowLeft", "a", "A"],
  "move:up": ["ArrowUp", "w", "W"],
  "move:down": ["ArrowDown", "s", "S"],
  "action:0": ["q", "Q"],
  "action:1": ["e", "E"],
  undo: ["Escape"],
};

function allowedKeysFor(actionKey: string | null): Set<string> {
  if (!actionKey) return new Set(); // click-only stage: block every game key
  if (actionKey.startsWith("select:")) return new Set(["Tab"]);
  return new Set(ACTION_KEYS[actionKey] ?? []);
}

export default class Tutorial extends React.Component<TutorialProps, TutorialState> {
  battleRef: React.RefObject<Battle>;
  dialogueRef: React.RefObject<Dialogue>;
  battle: Battle | null;
  dialogue: Dialogue | null;
  initialBattleState: BattleState | null;
  findTargetInterval: ReturnType<typeof setInterval> | null;
  expectedActionKey: string | null;
  advanceStage: (() => void) | null;
  allowedKeys: Set<string>;

  constructor(props: TutorialProps) {
    super(props);
    this.state = {};
    this.battleRef = React.createRef<Battle>();
    this.dialogueRef = React.createRef<Dialogue>();
    this.battle = null;
    this.dialogue = null;
    this.initialBattleState = null;
    this.findTargetInterval = null;
    this.expectedActionKey = null;
    this.advanceStage = null;
    this.allowedKeys = new Set();
  }

  componentDidMount = async () => {
    const { battleRef, dialogueRef } = this;
    if (!battleRef || !battleRef.current || !dialogueRef || !dialogueRef.current) {
      return;
    }
    this.battle = this.battleRef.current!;
    this.dialogue = this.dialogueRef.current!;

    await this.battle.dismissIntro();
    // dismissIntro auto-selects the first upload zone; undo that so the tutorial
    // opens with nothing selected and only the pulsing ring marks the target.
    // Done before snapshotting initialBattleState so a stage-100 reset stays clean.
    await this.battle.setStateP(() => ({ selection: null, hasSelectedUploadZone: false }));
    this.initialBattleState = this.battle.state;

    this.battle.autoAdvance = async () => {};
    this.battle.checkForVictory = async () => {};
    this.battle.renderGuideText = () => undefined;
    this.battle.uzEl = null;
    this.battle.uploadEl = null;
    this.battle.forceUpdate();
    this.dialogue.componentDidUpdate = this.updateDialogue;
    this.battle.onTutorialAction = this.handleTutorialAction;

    window.addEventListener("click", this.captureMouseEvents, { capture: true });
    window.addEventListener("keydown", this.captureKeyEvents, { capture: true });
    document.body.classList.add("tutorial-active");
  };

  // Block game-shortcut keys during the tutorial unless the pressed key is the
  // current stage's correct key. Mirrors captureMouseEvents for the keyboard:
  // stopPropagation in the capture phase keeps the event from reaching Battle's
  // window keydown listener. Non-game keys pass through untouched.
  captureKeyEvents = (evt: KeyboardEvent) => {
    if (!GAME_KEYS.has(evt.key)) return;
    if (this.allowedKeys.has(evt.key)) return;
    evt.stopPropagation();
    evt.preventDefault();
  };

  // Advance on a keyboard action that matches the current stage's expected key.
  // Mirrors clicking the highlighted target (same advance()/cleanup path).
  handleTutorialAction = (key: string) => {
    if (this.expectedActionKey && key === this.expectedActionKey && this.advanceStage) {
      this.advanceStage();
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener("click", this.captureMouseEvents, { capture: true });
    window.removeEventListener("keydown", this.captureKeyEvents, { capture: true });
    document.body.classList.remove("tutorial-active");
  };

  captureMouseEvents = (evt: MouseEvent) => {
    const path = evt.composedPath();
    const dialogueButtons = document.querySelector(".dialogue-buttons");
    // exec-fn wrapper fullscreen toggle (absent in standalone dev) — always allowed
    const fsBtn = document.getElementById("wai-fs-btn");
    const pathMissesTarget = !this.state.targetEl || !path.includes(this.state.targetEl);
    const pathMissesDialogue = !dialogueButtons || !path.includes(dialogueButtons);
    const pathMissesFsBtn = !fsBtn || !path.includes(fsBtn);
    if (pathMissesTarget && pathMissesDialogue && pathMissesFsBtn) {
      evt.stopPropagation();
      return false;
    }
    return true;
  };

  updateDialogue = () => {
    // Dialogue re-renders constantly while text types out, calling this each
    // time. Clear the prior interval so they don't stack into a churn storm.
    if (this.findTargetInterval) {
      clearInterval(this.findTargetInterval);
    }
    this.findTargetInterval = setInterval(() => {
      if (this.state.targetEl && document.body.contains(this.state.targetEl)) {
        return;
      }
      const { dialogue, battle } = this;
      if (!dialogue || !battle) {
        // TODO better error
        throw new Error("Refs broke");
      }
      const stage = dialogue.state.current;

      if (stage === 100) {
        this.battle?.setState(this.initialBattleState);
      }

      const selector = stageSelectors[stage];
      if (!selector) {
        if (this.state.boardStage) this.setState({ boardStage: false });
        return;
      }

      const targetEl = document.querySelector(selector);
      if (!targetEl) {
        throw new Error("Selector did not match any element: " + selector);
      }
      // Pulse a white ring on the element itself rather than floating an arrow
      // beside it — a ring riveted to the node can't drift on reflow or mobile
      // orientation change.
      targetEl.classList.add("tutorial-target");
      this.setState({
        targetEl,
        boardStage: true,
      });

      const advance = () => {
        targetEl.classList.remove("tutorial-target");
        targetEl.removeEventListener("click", onClickTarget);
        if (this.findTargetInterval) {
          clearInterval(this.findTargetInterval);
        }
        this.findTargetInterval = null;
        this.expectedActionKey = null;
        this.advanceStage = null;
        this.allowedKeys = new Set();
        this.setState({ targetEl: null });
        dialogue.forceNextStage();
      };
      const onClickTarget = () => advance();

      targetEl.addEventListener("click", onClickTarget);
      // Keyboard path: arm the matching action key (if any) for this stage, and
      // restrict which game keys are allowed through to Battle.
      this.expectedActionKey = stageActionKeys[stage] ?? null;
      this.allowedKeys = allowedKeysFor(this.expectedActionKey);
      this.advanceStage = advance;
    }, 100);
  };

  render() {
    return (
      <>
        <Battle
          {...tutorialLevel}
          ref={this.battleRef}
          firstClearCredits={null}
          battleStyle={battleStyle}
          availablePrograms={[Programs.Hack, Programs.Slingshot]}
          onFinishBattle={() => {}}
          noModals
        />
        <Dialogue
          ref={this.dialogueRef}
          onEnd={this.props.onEnd}
          {...SuperphreakTutorial}
          // Pass clicks through to the board only on board stages. On
          // dialogue-advance stages drop passthrough so the screen dims behind
          // the message like a normal menu. Keyed off the stable per-stage
          // flag, not targetEl, so it can't flicker.
          passthrough={!!this.state.boardStage}
        />
      </>
    );
  }
}