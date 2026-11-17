import {
  PHRASE_TYPE,
  getRandomPhrase,
  phrases as defaultPhrases,
  type PHRASES,
} from "@/constants/lang";
import {
  ROLLS_PER_TURN,
  isUpperCategory,
  upperCategoryFace,
} from "@/engine/score";
import { applyScore } from "@/engine/sheet";
import type { Mood } from "@/types/Character";
import type { Dice, KeepMask } from "@/types/Dice";
import {
  createEmptyScoreSheet,
  type ScoreCategory,
  type ScoreSheet,
} from "@/types/Game";

export const NO_KEEPS: KeepMask = [0, 0, 0, 0, 0];

/** What the page needs from any opponent, whether replayed or live. */
export interface OpponentController {
  // What to draw
  dice: Dice | null;
  keepMask: KeepMask;
  rollsRemaining: number;
  isRolling: boolean;
  scoreSheet: ScoreSheet;
  lastScored: { category: ScoreCategory; score: number } | null;
  // Flow
  /** True while a turn is being played out. */
  isPlaying: boolean;
  turnsCompleted: number;
  totalTurns: number;
  isFinished: boolean;
  // Personality
  mood: Mood;
  messages: string[];
  // Controls
  playTurn: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// State (pure reducer - all randomness / timers live outside it)
// ---------------------------------------------------------------------------
export interface OpponentState {
  dice: Dice | null;
  keepMask: KeepMask;
  rollsRemaining: number;
  isRolling: boolean;
  isPlaying: boolean;
  scoreSheet: ScoreSheet;
  turnsCompleted: number;
  lastScored: { category: ScoreCategory; score: number } | null;
}

export type OpponentAction =
  | { type: "RESET" }
  | { type: "TURN_START" }
  | { type: "ROLL_START"; keepMask: KeepMask }
  | { type: "ROLL_DONE"; dice: Dice; rollsRemaining: number }
  | { type: "KEEP"; keepMask: KeepMask }
  | { type: "SCORE"; dice: Dice; category: ScoreCategory }
  | { type: "TURN_END" }
  /** A turn that could not be played (e.g. the solver table failed to load). */
  | { type: "TURN_ABORT" };

export const initialOpponentState = (): OpponentState => ({
  dice: null,
  keepMask: NO_KEEPS,
  rollsRemaining: ROLLS_PER_TURN,
  isRolling: false,
  isPlaying: false,
  scoreSheet: createEmptyScoreSheet(),
  turnsCompleted: 0,
  lastScored: null,
});

export function opponentReducer(
  state: OpponentState,
  action: OpponentAction
): OpponentState {
  switch (action.type) {
    case "RESET":
      return initialOpponentState();
    case "TURN_START":
      return {
        ...state,
        isPlaying: true,
        keepMask: NO_KEEPS,
        rollsRemaining: ROLLS_PER_TURN,
        lastScored: null,
      };
    case "ROLL_START":
      return { ...state, isRolling: true, keepMask: action.keepMask };
    case "ROLL_DONE":
      return {
        ...state,
        isRolling: false,
        dice: action.dice,
        rollsRemaining: action.rollsRemaining,
      };
    case "KEEP":
      return { ...state, keepMask: action.keepMask };
    case "SCORE": {
      const scoreSheet = applyScore(
        state.scoreSheet,
        action.dice,
        action.category
      );
      return {
        ...state,
        scoreSheet,
        keepMask: NO_KEEPS,
        lastScored: {
          category: action.category,
          score: scoreSheet[action.category] ?? 0,
        },
      };
    }
    case "TURN_END":
      return {
        ...state,
        isPlaying: false,
        isRolling: false,
        turnsCompleted: state.turnsCompleted + 1,
      };
    case "TURN_ABORT":
      return { ...state, isPlaying: false, isRolling: false };
  }
}

// ---------------------------------------------------------------------------
// Opponent "personality": pick a mood / chat line from what was just scored
// ---------------------------------------------------------------------------
function isGoodScore(category: ScoreCategory, score: number): boolean {
  if (score === 0) return false;
  if (isUpperCategory(category))
    return score >= 3 * upperCategoryFace(category);
  switch (category) {
    case "threeOfAKind":
    case "fourOfAKind":
      return score >= 20;
    case "chance":
      return score >= 22;
    default:
      return true; // full house, straights, yahtzee
  }
}

/** `phrases` is the character's own lines; recorded rivals use the generic set. */
export function reactToScore(
  category: ScoreCategory,
  score: number,
  phrases: PHRASES = defaultPhrases
): { mood: Mood; message?: string } {
  if (category === "yahtzee" && score > 0) {
    return { mood: "woah", message: getRandomPhrase(phrases[PHRASE_TYPE.SUCCESS]) };
  }
  if (score === 0) {
    return { mood: "sad", message: getRandomPhrase(phrases[PHRASE_TYPE.FAILURE]) };
  }
  if (isGoodScore(category, score)) {
    return { mood: "cool", message: getRandomPhrase(phrases[PHRASE_TYPE.SUCCESS]) };
  }
  return { mood: "neutral" };
}
