import type { RobotLevel } from "@/engine/solver/levels";
import type { Character } from "@/types/Character";
import { CHARACTERS, RATCHET } from "./characters";

/**
 * The Challenge ladder: every character, easiest first and hardest last.
 * A higher botSkill temperature means a sloppier (easier) opponent, so we sort
 * by temperature, descending. (`sort` is stable, so ties keep the order they
 * have in CHARACTERS.)
 */
export const CHALLENGE_ORDER: readonly Character[] = [...CHARACTERS].sort(
  (a, b) => b.botSkill.temperature - a.botSkill.temperature
);

/**
 * "Play vs Robot" always faces Ratchet, but with the skill the player picked
 * instead of his own.
 */
export const robotCharacter = (level: RobotLevel): Character => ({
  ...RATCHET,
  botSkill: level.skill,
});

/**
 * Who speaks the generic Challenge scenes (the opening, and the ending), the
 * ones that don't belong to any one opponent.
 */
export const CHALLENGE_HOST: Character = RATCHET;
