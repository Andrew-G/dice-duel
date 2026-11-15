import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "robo-dice:high-score";

function readStored(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null; // storage blocked / unavailable
  }
}

/**
 * The player's best finished-game score, kept in localStorage. Read after
 * mount (not during render) so server and client markup always match.
 */
export function useHighScore() {
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    setBest(readStored());
  }, []);

  /** Call once per finished game. A first-ever score is stored but not celebrated. */
  const submit = useCallback((score: number) => {
    const previous = readStored();
    if (previous !== null && score <= previous) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
      /* ignore - the score just won't persist */
    }
    setBest(score);
    if (previous !== null) setIsNewBest(true);
  }, []);

  const clearNewBest = useCallback(() => setIsNewBest(false), []);

  return { best, isNewBest, submit, clearNewBest };
}
