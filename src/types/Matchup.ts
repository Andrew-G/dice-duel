import type { Character } from "./Character";

/** Who the player is up against in a single game. */
export type Matchup =
  | { kind: "solo" }
  /** A live rematch against a robot the player has beaten in Challenge, or Ratchet. */
  | { kind: "robot"; character: Character }
  /** A character from the Challenge ladder; `stage` is its place in CHALLENGE_ORDER. */
  | { kind: "challenge"; character: Character; stage: number };
