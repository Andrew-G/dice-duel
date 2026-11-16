import type { RecordedGame } from "@/types/Recording";

export type DifficultyId = "easy" | "medium" | "hard";

const TIER_META: readonly {
  id: DifficultyId;
  label: string;
  tagline: string;
}[] = [
  { id: "easy", label: "Easy", tagline: "A casual roller. A good warm-up." },
  { id: "medium", label: "Medium", tagline: "Steady hands. Expect a fight." },
  {
    id: "hard",
    label: "Hard",
    tagline: "On a hot streak. You'll have to earn this one.",
  },
];

export interface DifficultyTier {
  id: DifficultyId;
  label: string;
  tagline: string;
  /** The recorded games an opponent of this difficulty can replay. */
  games: RecordedGame[];
  /** Mean final score of those games, rounded. */
  averageScore: number;
}

/** Which of the 3 tiers a game ranked `rank` (0 = lowest score) of `count` falls in. */
function tierIndex(rank: number, count: number): number {
  if (count >= 3) return Math.floor((rank * 3) / count); // thirds by score
  if (count === 2) return rank === 0 ? 0 : 2; // worst -> Easy, best -> Hard
  return 1; // a lone game is "Medium"
}

/**
 * Splits the pool into Easy / Medium / Hard by final score: the lowest-scoring
 * third of games are Easy, the highest-scoring third are Hard. Because it ranks
 * the pool, it adapts to however good (or bad) your recorded games are.
 * Tiers with no games are omitted.
 */
export function buildDifficultyTiers(
  games: readonly RecordedGame[]
): DifficultyTier[] {
  const sorted = [...games].sort((a, b) => a.finalScore - b.finalScore);
  const buckets: RecordedGame[][] = [[], [], []];
  sorted.forEach((game, rank) =>
    buckets[tierIndex(rank, sorted.length)].push(game)
  );

  return TIER_META.map((meta, i) => ({
    ...meta,
    games: buckets[i],
    averageScore: buckets[i].length
      ? Math.round(
          buckets[i].reduce((sum, g) => sum + g.finalScore, 0) /
            buckets[i].length
        )
      : 0,
  })).filter((tier) => tier.games.length > 0);
}

/** Random game from a tier, avoiding `exclude` (e.g. the last opponent) when possible. */
export function pickGameFromTier(
  tier: DifficultyTier,
  exclude?: RecordedGame | null,
  rng: () => number = Math.random
): RecordedGame {
  const candidates =
    tier.games.length > 1
      ? tier.games.filter((g) => g !== exclude)
      : tier.games;
  return candidates[Math.floor(rng() * candidates.length)];
}
