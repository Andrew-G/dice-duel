import type { Dice, KeepMask } from "@/types/Dice";
import type { ScoreCategory, ScoreSheet } from "@/types/Game";
import {
  ALL_CATEGORIES,
  ROLLS_PER_TURN,
  UPPER_CATEGORIES,
  YAHTZEE_POINTS,
} from "../score";
import {
  UPPER_CAP,
  bestCategoryPerHand,
  categoryValue,
  createTurnBuffers,
  rerollLayer,
  stateIndex,
} from "./core";
import type { SolverTable } from "./table";
import {
  HAND_KEEP_LIST,
  HAND_KEEP_START,
  KEEP_COUNTS,
  KEEP_OUT_HAND,
  KEEP_OUT_PROB,
  KEEP_OUT_START,
  KEEP_SIZE,
  NUM_CATEGORIES,
  handIdOfDice,
} from "./tables";

/**
 * How well the robot plays. temperature 0 = perfect. Higher values make it
 * pick near-optimal AND worse options more often, via a softmax over the
 * expected final score of each option (in points).
 */
export interface BotSkill {
  temperature: number;
}
export const PERFECT_SKILL: BotSkill = { temperature: 0 };

/** The three numbers that describe a score sheet to the solver. */
export function stateFromSheet(sheet: ScoreSheet): { used: number; upper: number; yz: number } {
  let used = 0;
  ALL_CATEGORIES.forEach((category, i) => {
    if (sheet[category] !== null) used |= 1 << i;
  });
  const upperTotal = UPPER_CATEGORIES.reduce((sum, c) => sum + (sheet[c] ?? 0), 0);
  return {
    used,
    upper: Math.min(UPPER_CAP, upperTotal),
    yz: sheet.yahtzee === YAHTZEE_POINTS ? 1 : 0,
  };
}

/** Picks an index from `values` by softmax at `temperature` (0 = argmax, ties -> first). */
export function sampleSoftmax(values: readonly number[], temperature: number, rng: () => number): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
  if (temperature <= 0 || values.length === 1) return best;

  const weights = values.map((v) => Math.exp((v - values[best]) / temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return values.length - 1;
}

// ---- choosing a box ---------------------------------------------------------

/** Expected final-score gain of scoring `dice` in each open box, best first not guaranteed. */
export function evaluateCategories(
  table: SolverTable,
  sheet: ScoreSheet,
  dice: Dice
): { category: ScoreCategory; value: number }[] {
  const { used, upper, yz } = stateFromSheet(sheet);
  const hand = handIdOfDice(dice);
  const lookup = (i: number) => table.value(i);
  const options: { category: ScoreCategory; value: number }[] = [];
  for (let c = 0; c < NUM_CATEGORIES; c++) {
    if ((used >> c) & 1) continue;
    options.push({ category: ALL_CATEGORIES[c], value: categoryValue(used, upper, yz, hand, c, lookup) });
  }
  return options;
}

export function decideCategory(
  table: SolverTable,
  sheet: ScoreSheet,
  dice: Dice,
  skill: BotSkill = PERFECT_SKILL,
  rng: () => number = Math.random
): ScoreCategory {
  const options = evaluateCategories(table, sheet, dice);
  return options[sampleSoftmax(options.map((o) => o.value), skill.temperature, rng)].category;
}

// ---- choosing what to hold ---------------------------------------------------

/**
 * Expected final-score gain of every hold you could make from `dice`, with
 * `rollsRemaining` (1 or 2) rolls still to come. A keep of all 5 dice means
 * "stop and score".
 */
export function evaluateKeeps(
  table: SolverTable,
  sheet: ScoreSheet,
  dice: Dice,
  rollsRemaining: number
): { keepId: number; value: number }[] {
  const { used, upper, yz } = stateFromSheet(sheet);
  const hand = handIdOfDice(dice);
  const buffers = createTurnBuffers();

  bestCategoryPerHand(used, upper, yz, (i) => table.value(i), buffers.v3);
  let next = buffers.v3; // value of each hand after the roll we are choosing a hold for
  if (rollsRemaining >= 2) {
    rerollLayer(buffers.v3, buffers.e2, buffers.v2);
    next = buffers.v2;
  }

  // Only the keeps available from this hand are needed for the final layer.
  const options: { keepId: number; value: number }[] = [];
  for (let j = HAND_KEEP_START[hand]; j < HAND_KEEP_START[hand + 1]; j++) {
    const keepId = HAND_KEEP_LIST[j];
    let value = 0;
    for (let o = KEEP_OUT_START[keepId]; o < KEEP_OUT_START[keepId + 1]; o++) {
      value += KEEP_OUT_PROB[o] * next[KEEP_OUT_HAND[o]];
    }
    options.push({ keepId, value });
  }
  return options;
}

/** Turns a keep (a multiset of faces) into a mask over the actual dice positions. */
export function keepMaskFor(dice: Dice, keepId: number): KeepMask {
  const need = [...KEEP_COUNTS[keepId]];
  return dice.map((face) => {
    if (need[face - 1] > 0) {
      need[face - 1] -= 1;
      return 1;
    }
    return 0;
  }) as KeepMask;
}

/**
 * What to do after a roll with `rollsRemaining` rolls left (1 or 2):
 * a KeepMask to reroll the rest, or null to stop and score these dice.
 */
export function decideKeep(
  table: SolverTable,
  sheet: ScoreSheet,
  dice: Dice,
  rollsRemaining: number,
  skill: BotSkill = PERFECT_SKILL,
  rng: () => number = Math.random
): KeepMask | null {
  if (rollsRemaining < 1 || rollsRemaining >= ROLLS_PER_TURN) {
    throw new Error(`rollsRemaining must be 1 or 2, got ${rollsRemaining}`);
  }
  const options = evaluateKeeps(table, sheet, dice, rollsRemaining);
  const { keepId } = options[sampleSoftmax(options.map((o) => o.value), skill.temperature, rng)];
  return KEEP_SIZE[keepId] === 5 ? null : keepMaskFor(dice, keepId);
}

export { stateIndex };
