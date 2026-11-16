import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "robo-dice:dice-theme";

/**
 * The player's chosen dice theme id, kept in localStorage. Read after mount
 * (not during render) so server and client markup always match.
 */
export function useDiceTheme() {
  const [diceId, setDiceId] = useState(DEFAULT_DICE_ID);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setDiceId(getDiceTheme(stored).id);
    } catch {
      /* storage blocked / unavailable - stay on the default */
    }
  }, []);

  const select = useCallback((id: string) => {
    const next = getDiceTheme(id).id;
    setDiceId(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore - the choice just won't persist */
    }
  }, []);

  return { diceId, select };
}
