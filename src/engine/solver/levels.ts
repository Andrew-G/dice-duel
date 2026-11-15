import type { BotSkill } from "./policy";

export type RobotLevelId = "easy" | "medium" | "hard" | "perfect";

export interface RobotLevel {
  id: RobotLevelId;
  label: string;
  tagline: string;
  skill: BotSkill;
  /** Typical final score, measured over 1,500 simulated games per level (rounded to 5). */
  averageScore: number;
}

/**
 * Difficulty = how often the robot picks something other than the best move,
 * as a softmax temperature over each option's expected final score (points).
 * Re-measure with simulateGame() if you change the rules or these numbers.
 */
export const ROBOT_LEVELS: readonly RobotLevel[] = [
  {
    id: "easy",
    label: "Easy",
    tagline: "Rolls fast and thinks little. A friendly warm-up.",
    skill: { temperature: 4 },
    averageScore: 155,
  },
  {
    id: "medium",
    label: "Medium",
    tagline: "Knows the odds, but still slips up.",
    skill: { temperature: 2.2 },
    averageScore: 195,
  },
  {
    id: "hard",
    label: "Hard",
    tagline: "Rarely slips. Bring your A-game.",
    skill: { temperature: 1.2 },
    averageScore: 230,
  },
  {
    id: "perfect",
    label: "Perfect",
    tagline: "The mathematically best move, every single time.",
    skill: { temperature: 0 },
    averageScore: 255,
  },
];
