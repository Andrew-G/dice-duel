import { useCallback, useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID } from "@/data/achievements";
import type { AchievementStats, GameSnapshot } from "@/types/Achievement";

const STORAGE_KEY = "robo-dice:achievements";

type StoredAchievements = {
  /** Achievement id -> when it was unlocked (ISO date). */
  unlocked: Record<string, string>;
  stats: AchievementStats;
};

const emptyData = (): StoredAchievements => ({
  unlocked: {},
  stats: { gamesCompleted: 0, versusWins: 0 },
});

const toCount = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;

function readStored(): StoredAchievements {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyData();
    const parsed = JSON.parse(raw) as Partial<StoredAchievements> | null;

    const unlocked: Record<string, string> = {};
    for (const [id, at] of Object.entries(parsed?.unlocked ?? {})) {
      // Ignore achievements that no longer exist.
      if (id in ACHIEVEMENTS_BY_ID && typeof at === "string") unlocked[id] = at;
    }
    return {
      unlocked,
      stats: {
        gamesCompleted: toCount(parsed?.stats?.gamesCompleted),
        versusWins: toCount(parsed?.stats?.versusWins),
      },
    };
  } catch {
    return emptyData(); // storage blocked, or the saved data was corrupt
  }
}

function writeStored(data: StoredAchievements) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore - achievements just won't persist */
  }
}

/**
 * The player's unlocked achievements and running stats, kept in localStorage.
 * Read after mount (not during render) so server and client markup match.
 *
 * - `report(snapshot)`: call after each of the player's turns and when a game
 *   ends. Stats are only counted for the snapshot with `isComplete` set, so
 *   report that one once per game.
 * - Achievements that come from saved progress (the Challenge ladder, running
 *   totals) are re-checked whenever `challengeDefeated` changes, so players
 *   who already have the progress are awarded them straight away.
 * - `toastIds` are the achievements just unlocked, until dismissed.
 */
export function useAchievements(challengeDefeated: number) {
  const [data, setData] = useState<StoredAchievements>(emptyData);
  const [hydrated, setHydrated] = useState(false);
  const [toastIds, setToastIds] = useState<string[]>([]);

  // The source of truth within this session, so two reports in quick
  // succession can't both unlock the same thing.
  const dataRef = useRef<StoredAchievements>(data);
  const challengeRef = useRef(challengeDefeated);

  useEffect(() => {
    challengeRef.current = challengeDefeated;
  }, [challengeDefeated]);

  useEffect(() => {
    const stored = readStored();
    dataRef.current = stored;
    setData(stored);
    setHydrated(true);
  }, []);

  const check = useCallback((game: GameSnapshot | null) => {
    const current = dataRef.current;
    const stats: AchievementStats = game?.isComplete
      ? {
          gamesCompleted: current.stats.gamesCompleted + 1,
          versusWins:
            current.stats.versusWins + (game.outcome === "win" ? 1 : 0),
        }
      : current.stats;

    const context = { game, stats, challengeDefeated: challengeRef.current };
    const earned = ACHIEVEMENTS.filter(
      (achievement) =>
        !(achievement.id in current.unlocked) && achievement.isEarned(context)
    );
    if (earned.length === 0 && stats === current.stats) return;

    const at = new Date().toISOString();
    const next: StoredAchievements = {
      stats,
      unlocked: {
        ...current.unlocked,
        ...Object.fromEntries(earned.map((achievement) => [achievement.id, at])),
      },
    };
    dataRef.current = next;
    writeStored(next);
    setData(next);
    if (earned.length > 0) {
      setToastIds((prev) => [...prev, ...earned.map((a) => a.id)]);
    }
  }, []);

  // Saved progress: the Challenge ladder and running totals.
  useEffect(() => {
    if (hydrated) check(null);
  }, [hydrated, challengeDefeated, check]);

  const dismissToast = useCallback(
    (id: string) => setToastIds((prev) => prev.filter((t) => t !== id)),
    []
  );

  /** Lock everything again and zero the stats (for testing). */
  const reset = useCallback(() => {
    const empty = emptyData();
    dataRef.current = empty;
    writeStored(empty);
    setData(empty);
    setToastIds([]);
  }, []);

  return {
    unlocked: data.unlocked,
    stats: data.stats,
    unlockedCount: Object.keys(data.unlocked).length,
    total: ACHIEVEMENTS.length,
    toastIds,
    dismissToast,
    report: check,
    reset,
  };
}

export type Achievements = ReturnType<typeof useAchievements>;
