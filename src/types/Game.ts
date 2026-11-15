import type { Dice, KeepMask } from "./Dice";

export type ScoreCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "three_of_a_kind"
  | "four_of_a_kind"
  | "full_house"
  | "small_straight"
  | "large_straight"
  | "yahtzee"
  | "chance";

export type ScoreSheet = {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  /** Sum of the six upper boxes (before the 35pt bonus). */
  upper_section_total: number;
  upper_bonus_earned: boolean;
  three_of_a_kind: number | null;
  four_of_a_kind: number | null;
  full_house: number | null;
  small_straight: number | null;
  large_straight: number | null;
  yahtzee: number | null;
  chance: number | null;
  /** Accumulated extra-Yahtzee bonuses (100 each). */
  lower_bonus: number | null;
  /** Sum of the lower boxes plus lower_bonus. */
  lower_total: number | null;
  /** Upper total + upper bonus + lower total. */
  total: number | null;
};

export type GameStatus = "in_progress" | "finished";

export type GameState = {
  playerId: string;
  currentRoll: Dice | null;
  validCategories: ScoreCategory[];
  keepMask: KeepMask;
  rollsRemaining: number;
  scoreSheet: ScoreSheet;
  turnNumber: number;
  gameStatus: GameStatus;
};

/** Always returns a fresh object, so sheets are never shared by accident. */
export function createEmptyScoreSheet(): ScoreSheet {
  return {
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    upper_section_total: 0,
    upper_bonus_earned: false,
    three_of_a_kind: null,
    four_of_a_kind: null,
    full_house: null,
    small_straight: null,
    large_straight: null,
    yahtzee: null,
    chance: null,
    lower_bonus: 0,
    lower_total: 0,
    total: 0,
  };
}

export const defaultGameState: GameState = {
  playerId: "",
  currentRoll: null,
  validCategories: [],
  keepMask: [0, 0, 0, 0, 0],
  rollsRemaining: 3,
  scoreSheet: createEmptyScoreSheet(),
  turnNumber: 1,
  gameStatus: "in_progress",
};
