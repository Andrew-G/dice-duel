import { useCallback, useEffect, useRef, useState } from "react";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";

const STORAGE_KEY = "robo-dice:challenge-progress";
const INTRO_SEEN_KEY = "robo-dice:challenge-intro-seen";
const COMPLETE_SEEN_KEY = "robo-dice:challenge-complete-seen";
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

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    if (value) window.localStorage.setItem(key, "true");
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore - the flag just won't persist */
  }
}

/**
 * How far the player has got in Challenge mode, kept in localStorage.
 *
 * Opponents are beaten strictly in order, so progress is just a count:
 * `defeated` opponents beaten means CHALLENGE_ORDER[defeated] is the one to
 * face next. Alongside it we remember which one-off story scenes the player
 * has already watched (the opening, and the ending). Read after mount (not
 * during render) so server and client markup always match.
 */
export function useChallengeProgress() {
  const [defeated, setDefeated] = useState(0);
  const [introSeen, setIntroSeen] = useState(false);
  const [completeSeen, setCompleteSeen] = useState(false);
  // The source of truth within this session, so progress still works when
  // localStorage is unavailable.
  const defeatedRef = useRef(0);

  useEffect(() => {
    const stored = readStored();
    defeatedRef.current = stored;
    setDefeated(stored);
    setIntroSeen(readFlag(INTRO_SEEN_KEY));
    setCompleteSeen(readFlag(COMPLETE_SEEN_KEY));
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

  /** Call once the player has watched the Challenge's opening scene. */
  const markIntroSeen = useCallback(() => {
    writeFlag(INTRO_SEEN_KEY, true);
    setIntroSeen(true);
  }, []);

  /** Call once the player has watched the Challenge's ending scene. */
  const markCompleteSeen = useCallback(() => {
    writeFlag(COMPLETE_SEEN_KEY, true);
    setCompleteSeen(true);
  }, []);

  /** Wipe everything, so the next visit plays the opening scene again. */
  const reset = useCallback(() => {
    defeatedRef.current = 0;
    writeStored(0);
    writeFlag(INTRO_SEEN_KEY, false);
    writeFlag(COMPLETE_SEEN_KEY, false);
    setDefeated(0);
    setIntroSeen(false);
    setCompleteSeen(false);
  }, []);

  return {
    defeated,
    total: TOTAL,
    isComplete: defeated >= TOTAL,
    introSeen,
    completeSeen,
    recordWin,
    markIntroSeen,
    markCompleteSeen,
    reset,
  };
}

export type ChallengeProgress = ReturnType<typeof useChallengeProgress>;
