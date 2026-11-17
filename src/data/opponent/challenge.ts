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
 * Who "Quick Battle" offers, in ladder order: every opponent the player has
 * beaten in Challenge (the first `defeated` of them), plus Ratchet, who is
 * always available.
 */
export const availableRobots = (defeated: number): Character[] =>
  CHALLENGE_ORDER.filter(
    (character, index) => index < defeated || character.id === RATCHET.id
  );

/**
 * Who speaks the generic Challenge scenes (the opening, and the ending), the
 * ones that don't belong to any one opponent.
 */
export const CHALLENGE_HOST: Character = RATCHET;
