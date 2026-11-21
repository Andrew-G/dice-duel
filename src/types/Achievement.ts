import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { GameOutcome, ScoreSheet } from "./Game";
import type { Matchup } from "./Matchup";
import type { RecordedTurn } from "./Recording";

/**
 * Where the game stands, reported after each of the player's turns and once
 * more when the game is over. Achievements are checked against it.
 */
export type GameSnapshot = {
  mode: Matchup["kind"];
  /** The player's completed turns so far, in recording format. */
  turns: RecordedTurn[];
  playerSheet: ScoreSheet;
  /** Only set for versus games. */
  opponentSheet: ScoreSheet | null;
  /** True once every turn has been played (by both sides in a versus game). */
  isComplete: boolean;
  /** Only set once a versus game is complete. */
  outcome: GameOutcome | null;
};

/** Running totals across games, kept alongside the unlocked achievements. */
export type AchievementStats = {
  gamesCompleted: number;
  versusWins: number;
};

/** Everything an achievement may look at. */
export type AchievementContext = {
  /** The game that just progressed, or null when checking saved progress. */
  game: GameSnapshot | null;
  stats: AchievementStats;
  /** How many Challenge opponents have been beaten. */
  challengeDefeated: number;
};

export type AchievementCategory = "dice" | "scores" | "battles" | "milestones";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: IconDefinition;
  /** Pure: true when this context earns the achievement. */
  isEarned: (context: AchievementContext) => boolean;
  /** For count-based achievements: how far along the player is. */
  progress?: (context: AchievementContext) => { current: number; target: number };
};
