import type { DifficultyTier } from "@/engine/difficulty";
import type { RobotLevel } from "@/engine/solver/levels";
import type { RecordedGame } from "./Recording";

/** Who the player is up against in a single game. */
export type Matchup =
  | { kind: "solo" }
  /** A replay of a recorded game, picked from a difficulty tier. */
  | { kind: "recorded"; tier: DifficultyTier; game: RecordedGame }
  /** A live robot that plays using the solver. */
  | { kind: "robot"; level: RobotLevel };
