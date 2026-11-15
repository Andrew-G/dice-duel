import type { Dice, KeepMask } from "./Dice";
import type { ScoreCategory } from "./Game";

/**
 * One recorded turn.
 *
 * `rolls` holds the dice after each roll (1-3 entries; fewer than 3 means the
 * player scored early). `keeps[i]` is the mask applied between roll i and
 * roll i+1, so `keeps.length === rolls.length - 1`.
 */
export interface RecordedTurn {
  rolls: Dice[];
  keeps: KeepMask[];
  category: ScoreCategory;
  /** Points for the category box only (no bonuses). */
  score: number;
}

export interface RecordedGame {
  id: string;
  label: string;
  /** Final sheet total, including upper bonus and any Yahtzee bonuses. */
  finalScore: number;
  /** Exactly 13 turns. */
  turns: RecordedTurn[];
}
