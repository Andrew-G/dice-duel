import type { Dice } from "@/types/Dice";
import type { ScoreCategory } from "@/types/Game";

// ---------------------------------------------------------------------------
// Rules constants
// ---------------------------------------------------------------------------
export const ROLLS_PER_TURN = 3;
export const TURNS_PER_GAME = 13;

export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS_POINTS = 35;

export const FULL_HOUSE_POINTS = 25;
export const SMALL_STRAIGHT_POINTS = 30;
export const LARGE_STRAIGHT_POINTS = 40;
export const YAHTZEE_POINTS = 50;
/** Awarded for each extra Yahtzee once the Yahtzee box holds 50. */
export const YAHTZEE_BONUS_POINTS = 100;

export const UPPER_CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
] as const;

export const LOWER_CATEGORIES = [
  "three_of_a_kind",
  "four_of_a_kind",
  "full_house",
  "small_straight",
  "large_straight",
  "yahtzee",
  "chance",
] as const;

export type UpperCategory = (typeof UPPER_CATEGORIES)[number];
export type LowerCategory = (typeof LOWER_CATEGORIES)[number];

export const ALL_CATEGORIES: readonly ScoreCategory[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
];

const UPPER_FACE: Record<UpperCategory, number> = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};

export const isUpperCategory = (c: ScoreCategory): c is UpperCategory =>
  c in UPPER_FACE;

/** The die face an upper category counts, e.g. "fours" -> 4. */
export const upperCategoryFace = (c: UpperCategory): number => UPPER_FACE[c];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** counts[face] = how many dice show that face (index 0 unused). */
function faceCounts(dice: readonly number[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d] += 1;
  return counts;
}

const sumDice = (dice: readonly number[]): number =>
  dice.reduce((total, d) => total + d, 0);

export const isYahtzee = (dice: readonly number[]): boolean =>
  dice.length > 0 && dice.every((d) => d === dice[0]);

const SMALL_STRAIGHT_RUNS = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
];
const LARGE_STRAIGHT_RUNS = [
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6],
];

/**
 * Points `dice` would earn in `category`. Pure; ignores whether the box is
 * already filled.
 *
 * Full house is strictly a pair plus a triple, so five of a kind does NOT
 * count as a full house (no Joker rules - see sheet.ts).
 */
export function scoreCategory(dice: Dice, category: ScoreCategory): number {
  const counts = faceCounts(dice);

  if (isUpperCategory(category)) {
    const face = UPPER_FACE[category];
    return counts[face] * face;
  }

  switch (category) {
    case "three_of_a_kind":
      return counts.some((c) => c >= 3) ? sumDice(dice) : 0;
    case "four_of_a_kind":
      return counts.some((c) => c >= 4) ? sumDice(dice) : 0;
    case "full_house":
      return counts.includes(3) && counts.includes(2) ? FULL_HOUSE_POINTS : 0;
    case "small_straight":
      return SMALL_STRAIGHT_RUNS.some((run) => run.every((f) => counts[f] > 0))
        ? SMALL_STRAIGHT_POINTS
        : 0;
    case "large_straight":
      return LARGE_STRAIGHT_RUNS.some((run) => run.every((f) => counts[f] > 0))
        ? LARGE_STRAIGHT_POINTS
        : 0;
    case "yahtzee":
      return isYahtzee(dice) ? YAHTZEE_POINTS : 0;
    case "chance":
      return sumDice(dice);
    default: {
      const unreachable: never = category;
      throw new Error(`Unknown category: ${String(unreachable)}`);
    }
  }
}
