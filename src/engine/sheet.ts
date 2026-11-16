import type { Dice } from "@/types/Dice";
import type { ScoreCategory, ScoreSheet } from "@/types/Game";
import {
  ALL_CATEGORIES,
  LOWER_CATEGORIES,
  UPPER_BONUS_POINTS,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  YAHTZEE_BONUS_POINTS,
  YAHTZEE_POINTS,
  isYahtzee,
  scoreCategory,
} from "./score";

export function getOpenCategories(sheet: ScoreSheet): ScoreCategory[] {
  return ALL_CATEGORIES.filter((c) => sheet[c] === null);
}

export const isSheetComplete = (sheet: ScoreSheet): boolean =>
  getOpenCategories(sheet).length === 0;

/** What `dice` would score in every still-open category (for UI hints / bots). */
export function getPotentialScores(
  sheet: ScoreSheet,
  dice: Dice
): Partial<Record<ScoreCategory, number>> {
  const result: Partial<Record<ScoreCategory, number>> = {};
  for (const category of getOpenCategories(sheet)) {
    result[category] = scoreCategory(dice, category);
  }
  return result;
}

/** Recomputes every derived field (totals, bonus flag) from the filled boxes. */
export function recalculate(sheet: ScoreSheet): ScoreSheet {
  const upper = UPPER_CATEGORIES.reduce((sum, c) => sum + (sheet[c] ?? 0), 0);
  const upperBonusEarned = upper >= UPPER_BONUS_THRESHOLD;
  const lowerBoxes = LOWER_CATEGORIES.reduce(
    (sum, c) => sum + (sheet[c] ?? 0),
    0
  );
  const lowerTotal = lowerBoxes + (sheet.lowerBonus ?? 0);

  return {
    ...sheet,
    upperSectionTotal: upper,
    upperBonusEarned: upperBonusEarned,
    lowerTotal: lowerTotal,
    total: upper + (upperBonusEarned ? UPPER_BONUS_POINTS : 0) + lowerTotal,
  };
}

/**
 * Returns a NEW sheet with `dice` scored in `category`. Never mutates.
 * Throws if the box is already filled.
 *
 * Extra Yahtzees: if the Yahtzee box already holds 50 and `dice` are another
 * Yahtzee, +100 goes to `lowerBonus`. The dice are then scored normally in
 * whichever open box you pick. Official "Joker" placement rules (forcing the
 * matching upper box first, and scoring full house / straights at full value)
 * are deliberately NOT enforced.
 */
export function applyScore(
  sheet: ScoreSheet,
  dice: Dice,
  category: ScoreCategory
): ScoreSheet {
  if (sheet[category] !== null) {
    throw new Error(`Category already used: ${category}`);
  }

  const points = scoreCategory(dice, category);
  const earnsYahtzeeBonus = isYahtzee(dice) && sheet.yahtzee === YAHTZEE_POINTS;
  const lowerBonus =
    (sheet.lowerBonus ?? 0) + (earnsYahtzeeBonus ? YAHTZEE_BONUS_POINTS : 0);

  const next: ScoreSheet = { ...sheet, [category]: points };
  return recalculate({ ...next, lowerBonus: lowerBonus });
}
