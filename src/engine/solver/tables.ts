/**
 * Static lookup tables for the Yahtzee solver. Dice are treated as multisets
 * (order doesn't matter): there are 252 distinct 5-dice "hands" and 462
 * distinct "keeps" (any sub-multiset of 0-5 dice you might hold back).
 *
 * Everything here is derived from the game's own scoring rules
 * (engine/score.ts) at module load - it takes a few milliseconds.
 */
import type { Dice } from "@/types/Dice";
import { ALL_CATEGORIES, isYahtzee, scoreCategory } from "../score";

export const NUM_FACES = 6;
export const NUM_CATEGORIES = ALL_CATEGORIES.length; // 13

const POW = [1, 6, 36, 216, 1296, 7776];
const FACT = [1, 1, 2, 6, 24, 120];
const KEY_SPACE = 46656; // 6^6: every counts vector (each count 0-5) has a unique key

/** counts[face-1] = how many dice show `face`; encoded as a base-6 number. */
const countsKey = (counts: ArrayLike<number>): number => {
  let key = 0;
  for (let f = 0; f < NUM_FACES; f++) key += counts[f] * POW[f];
  return key;
};

/** All count vectors over the 6 faces that sum to exactly `total`. */
function vectors(total: number): number[][] {
  const out: number[][] = [];
  const cur = [0, 0, 0, 0, 0, 0];
  const rec = (face: number, left: number) => {
    if (face === NUM_FACES - 1) {
      cur[face] = left;
      out.push([...cur]);
      return;
    }
    for (let n = 0; n <= left; n++) {
      cur[face] = n;
      rec(face + 1, left - n);
    }
  };
  rec(0, total);
  return out;
}

const sum = (v: readonly number[]) => v.reduce((a, b) => a + b, 0);

// ---- hands (5 dice) and keeps (0-5 dice) ----------------------------------
export const HAND_COUNTS: number[][] = vectors(5);
export const KEEP_COUNTS: number[][] = [0, 1, 2, 3, 4, 5].flatMap(vectors);
export const NUM_HANDS = HAND_COUNTS.length; // 252
export const NUM_KEEPS = KEEP_COUNTS.length; // 462

const HAND_ID_BY_KEY = new Int16Array(KEY_SPACE).fill(-1);
const KEEP_ID_BY_KEY = new Int16Array(KEY_SPACE).fill(-1);
HAND_COUNTS.forEach((c, h) => (HAND_ID_BY_KEY[countsKey(c)] = h));
KEEP_COUNTS.forEach((c, k) => (KEEP_ID_BY_KEY[countsKey(c)] = k));

export const KEEP_SIZE = Uint8Array.from(KEEP_COUNTS.map(sum));
export const EMPTY_KEEP_ID = KEEP_ID_BY_KEY[0];

export function countsOfDice(dice: readonly number[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d - 1] += 1;
  return counts;
}
export const handIdOfDice = (dice: readonly number[]): number =>
  HAND_ID_BY_KEY[countsKey(countsOfDice(dice))];

// ---- scoring, straight from the game's rules -------------------------------
/** SCORE[hand * 13 + category] = points that hand scores in that box. */
export const SCORE = new Uint8Array(NUM_HANDS * NUM_CATEGORIES);
export const IS_YAHTZEE_HAND = new Uint8Array(NUM_HANDS);
HAND_COUNTS.forEach((counts, h) => {
  const dice = counts.flatMap((n, f) => Array<number>(n).fill(f + 1)) as Dice;
  ALL_CATEGORIES.forEach((category, c) => {
    SCORE[h * NUM_CATEGORIES + c] = scoreCategory(dice, category);
  });
  IS_YAHTZEE_HAND[h] = isYahtzee(dice) ? 1 : 0;
});

// ---- reroll transitions (CSR layout) ---------------------------------------
// Holding keep `k` and rerolling the other dice lands on hand
// KEEP_OUT_HAND[j] with probability KEEP_OUT_PROB[j],
// for j in [KEEP_OUT_START[k], KEEP_OUT_START[k + 1]).
const outHand: number[] = [];
const outProb: number[] = [];
export const KEEP_OUT_START = new Int32Array(NUM_KEEPS + 1);
KEEP_COUNTS.forEach((keep, k) => {
  KEEP_OUT_START[k] = outHand.length;
  const rerolled = 5 - sum(keep);
  const total = 6 ** rerolled;
  for (const roll of vectors(rerolled)) {
    let ways = FACT[rerolled]; // multinomial: orderings of this multiset of faces
    for (let f = 0; f < NUM_FACES; f++) ways /= FACT[roll[f]];
    outHand.push(HAND_ID_BY_KEY[countsKey(keep.map((n, f) => n + roll[f]))]);
    outProb.push(ways / total);
  }
});
KEEP_OUT_START[NUM_KEEPS] = outHand.length;
export const KEEP_OUT_HAND = Int16Array.from(outHand);
export const KEEP_OUT_PROB = Float64Array.from(outProb);

// ---- which keeps are possible for each hand (CSR) --------------------------
// HAND_KEEP_LIST[j], j in [HAND_KEEP_START[h], HAND_KEEP_START[h + 1]), are the
// ids of every sub-multiset of hand h (including "nothing" and "everything").
const handKeeps: number[] = [];
export const HAND_KEEP_START = new Int32Array(NUM_HANDS + 1);
HAND_COUNTS.forEach((hand, h) => {
  HAND_KEEP_START[h] = handKeeps.length;
  const cur = [0, 0, 0, 0, 0, 0];
  const rec = (face: number) => {
    if (face === NUM_FACES) {
      handKeeps.push(KEEP_ID_BY_KEY[countsKey(cur)]);
      return;
    }
    for (let n = 0; n <= hand[face]; n++) {
      cur[face] = n;
      rec(face + 1);
    }
    cur[face] = 0;
  };
  rec(0);
});
HAND_KEEP_START[NUM_HANDS] = handKeeps.length;
export const HAND_KEEP_LIST = Int16Array.from(handKeeps);

/** Probability of each hand on the opening 5-dice roll. */
export const OPENING_PROB = new Float64Array(NUM_HANDS);
for (
  let j = KEEP_OUT_START[EMPTY_KEEP_ID];
  j < KEEP_OUT_START[EMPTY_KEEP_ID + 1];
  j++
) {
  OPENING_PROB[KEEP_OUT_HAND[j]] = KEEP_OUT_PROB[j];
}
