/**
 * The dynamic-programming core.
 *
 * A game STATE is everything that affects future scoring:
 *   used   - which of the 13 boxes are filled (13-bit mask, bit i = ALL_CATEGORIES[i])
 *   upper  - upper-section total so far, capped at 63 (all the bonus needs)
 *   yz     - 1 if the Yahtzee box holds 50 (so extra Yahtzees earn +100)
 * That is 2^20 (~1M) states. V(state) = the expected number of ADDITIONAL
 * points from here to the end of the game under optimal play (this includes
 * the 35pt upper bonus and any 100pt Yahtzee bonuses still to come).
 *
 * One turn is solved backwards in layers:
 *   roll 3 lands  -> pick the best box           (categoryValue, per hand)
 *   before roll 3 -> pick the best hold          (rerollLayer)
 *   before roll 2 -> pick the best hold          (rerollLayer)
 *   opening roll  -> average over all hands
 */
import {
  ALL_CATEGORIES,
  UPPER_BONUS_POINTS,
  UPPER_BONUS_THRESHOLD,
  YAHTZEE_BONUS_POINTS,
  YAHTZEE_POINTS,
} from "../score";
import {
  HAND_KEEP_LIST,
  HAND_KEEP_START,
  IS_YAHTZEE_HAND,
  KEEP_OUT_HAND,
  KEEP_OUT_PROB,
  KEEP_OUT_START,
  NUM_CATEGORIES,
  NUM_HANDS,
  NUM_KEEPS,
  OPENING_PROB,
  SCORE,
} from "./tables";

export const ALL_USED = (1 << NUM_CATEGORIES) - 1;
export const STATE_COUNT = 1 << 20;
export const UPPER_CAP = UPPER_BONUS_THRESHOLD; // 63
const UPPER_BOXES = 6; // the first 6 categories are the upper section
const YAHTZEE_BOX = ALL_CATEGORIES.indexOf("yahtzee");

export const stateIndex = (used: number, upper: number, yz: number): number =>
  (used << 7) | (upper << 1) | yz;

/** Value (expected additional points) of the state at `index`. */
export type ValueLookup = (index: number) => number;

/**
 * Value of scoring `hand` in box `category` from state (used, upper, yz):
 * the points it scores now, plus any bonus it triggers, plus the value of
 * the state you land in. Mirrors engine/sheet.ts `applyScore` exactly.
 */
export function categoryValue(
  used: number,
  upper: number,
  yz: number,
  hand: number,
  category: number,
  value: ValueLookup
): number {
  const points = SCORE[hand * NUM_CATEGORIES + category];
  let bonus = 0;
  let nextUpper = upper;
  if (category < UPPER_BOXES) {
    nextUpper = Math.min(UPPER_CAP, upper + points);
    if (upper < UPPER_CAP && nextUpper >= UPPER_CAP)
      bonus += UPPER_BONUS_POINTS;
  }
  if (yz === 1 && IS_YAHTZEE_HAND[hand] === 1) bonus += YAHTZEE_BONUS_POINTS;
  const nextYz =
    yz === 1 || (category === YAHTZEE_BOX && points === YAHTZEE_POINTS) ? 1 : 0;
  return (
    points +
    bonus +
    value(stateIndex(used | (1 << category), nextUpper, nextYz))
  );
}

/** out[hand] = value of the best box to put that hand in. */
export function bestCategoryPerHand(
  used: number,
  upper: number,
  yz: number,
  value: ValueLookup,
  out: Float64Array
): void {
  for (let h = 0; h < NUM_HANDS; h++) {
    let best = -Infinity;
    for (let c = 0; c < NUM_CATEGORIES; c++) {
      if ((used >> c) & 1) continue;
      const v = categoryValue(used, upper, yz, h, c, value);
      if (v > best) best = v;
    }
    out[h] = best;
  }
}

/**
 * One reroll step. keepValue[k] = expected value of holding keep k and
 * rerolling the rest, given `next[hand]` = value of ending up with that hand.
 * handValue[h] (optional) = best keepValue among keeps you could hold from h.
 */
export function rerollLayer(
  next: Float64Array,
  keepValue: Float64Array,
  handValue: Float64Array | null
): void {
  for (let k = 0; k < NUM_KEEPS; k++) {
    let total = 0;
    for (let j = KEEP_OUT_START[k]; j < KEEP_OUT_START[k + 1]; j++) {
      total += KEEP_OUT_PROB[j] * next[KEEP_OUT_HAND[j]];
    }
    keepValue[k] = total;
  }
  if (!handValue) return;
  for (let h = 0; h < NUM_HANDS; h++) {
    let best = -Infinity;
    for (let j = HAND_KEEP_START[h]; j < HAND_KEEP_START[h + 1]; j++) {
      const v = keepValue[HAND_KEEP_LIST[j]];
      if (v > best) best = v;
    }
    handValue[h] = best;
  }
}

/** Scratch space for one state's computation (one set per recursion depth). */
export interface TurnBuffers {
  v3: Float64Array;
  v2: Float64Array;
  v1: Float64Array;
  e2: Float64Array;
  e1: Float64Array;
}
export const createTurnBuffers = (): TurnBuffers => ({
  v3: new Float64Array(NUM_HANDS),
  v2: new Float64Array(NUM_HANDS),
  v1: new Float64Array(NUM_HANDS),
  e2: new Float64Array(NUM_KEEPS),
  e1: new Float64Array(NUM_KEEPS),
});

/**
 * V(used, upper, yz), given the values of every state one box further on.
 * `buffers` must not be shared with any state computed inside `value`.
 */
export function computeStateValue(
  used: number,
  upper: number,
  yz: number,
  value: ValueLookup,
  buffers: TurnBuffers
): number {
  const { v3, v2, v1, e2, e1 } = buffers;
  bestCategoryPerHand(used, upper, yz, value, v3);
  rerollLayer(v3, e2, v2);
  rerollLayer(v2, e1, v1);
  let total = 0;
  for (let h = 0; h < NUM_HANDS; h++) total += OPENING_PROB[h] * v1[h];
  return total;
}
