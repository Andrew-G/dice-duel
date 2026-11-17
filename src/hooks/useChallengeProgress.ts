import { useCallback, useEffect, useRef, useState } from "react";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";

const STORAGE_KEY = "robo-dice:challenge-progress";
const TOTAL = CHALLENGE_ORDER.length;

function readStored(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return 0;
    const value = Number(raw);
    return Number.isInteger(value) ? Math.min(Math.max(value, 0), TOTAL) : 0;
  } catch {
    return 0; // storage blocked / unavailable
  }
}

function writeStored(value: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore - progress just won't persist */
  }
}

/**
 * How far the player has got in Challenge mode, kept in localStorage.
 *
 * Opponents are beaten strictly in order, so progress is just a count:
 * `defeated` opponents beaten means CHALLENGE_ORDER[defeated] is the one to
 * face next. Read after mount (not during render) so server and client
 * markup always match.
 */
export function useChallengeProgress() {
  const [defeated, setDefeated] = useState(0);
  // The source of truth within this session, so progress still works when
  // localStorage is unavailable.
  const defeatedRef = useRef(0);

  useEffect(() => {
    const stored = readStored();
    defeatedRef.current = stored;
    setDefeated(stored);
  }, []);

  /**
   * Call when the player wins against the opponent at `stage`. Only beating
   * the *current* opponent advances progress; rematches of earlier ones don't.
   */
  const recordWin = useCallback((stage: number) => {
    if (stage !== defeatedRef.current || stage >= TOTAL) return;
    const next = stage + 1;
    defeatedRef.current = next;
    writeStored(next);
    setDefeated(next);
  }, []);

  const reset = useCallback(() => {
    defeatedRef.current = 0;
    writeStored(0);
    setDefeated(0);
  }, []);

  return {
    defeated,
    total: TOTAL,
    isComplete: defeated >= TOTAL,
    recordWin,
    reset,
  };
}

export type ChallengeProgress = ReturnType<typeof useChallengeProgress>;
