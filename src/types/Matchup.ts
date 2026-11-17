import type { DifficultyTier } from "@/engine/difficulty";
import type { RobotLevel } from "@/engine/solver/levels";
import type { Character } from "./Character";
import type { RecordedGame } from "./Recording";

/** Who the player is up against in a single game. */
export type Matchup =
  | { kind: "solo" }
  /** A replay of a recorded game, picked from a difficulty tier. */
  | { kind: "recorded"; tier: DifficultyTier; game: RecordedGame }
  /**
   * A live robot that plays using the solver. Always Ratchet, with his skill
   * swapped for the chosen level's (see `robotCharacter`).
   */
  | { kind: "robot"; level: RobotLevel; character: Character }
  /** A character from the Challenge ladder; `stage` is its place in CHALLENGE_ORDER. */
  | { kind: "challenge"; character: Character; stage: number };
