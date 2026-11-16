export type ScoreCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "threeOfAKind"
  | "fourOfAKind"
  | "fullHouse"
  | "smallStraight"
  | "largeStraight"
  | "yahtzee"
  | "chance";

export type ScoreSheet = {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  /** Sum of the six upper boxes (before the 35pt bonus). */
  upperSectionTotal: number;
  upperBonusEarned: boolean;
  threeOfAKind: number | null;
  fourOfAKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  yahtzee: number | null;
  chance: number | null;
  /** Accumulated extra-Yahtzee bonuses (100 each). */
  lowerBonus: number | null;
  /** Sum of the lower boxes plus lowerBonus. */
  lowerTotal: number | null;
  /** Upper total + upper bonus + lower total. */
  total: number | null;
};

/** Always returns a fresh object, so sheets are never shared by accident. */
export function createEmptyScoreSheet(): ScoreSheet {
  return {
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    upperSectionTotal: 0,
    upperBonusEarned: false,
    threeOfAKind: null,
    fourOfAKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yahtzee: null,
    chance: null,
    lowerBonus: 0,
    lowerTotal: 0,
    total: 0,
  };
}
