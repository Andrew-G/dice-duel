import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ROLLS_PER_TURN } from "@/engine/score";
import { validateRecordedGame } from "@/engine/recording";
import type { Mood } from "@/types/Character";
import type { KeepMask } from "@/types/Dice";
import type { ScoreCategory } from "@/types/Game";
import type { RecordedGame } from "@/types/Recording";
import {
  NO_KEEPS,
  initialOpponentState,
  opponentReducer,
  reactToScore,
  type OpponentController,
} from "./opponentCore";

export interface UseReplayOptions {
  /** How long the dice tumble before a roll result shows (ms). Default 600. */
  rollMs?: number;
  /** Pause between each visible step: result -> hold -> roll -> score (ms). Default 600. */
  stepMs?: number;
  /** Called after each replayed turn has fully finished. */
  onTurnComplete?: (info: {
    turnIndex: number;
    category: ScoreCategory;
    score: number;
  }) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Plays a pre-recorded game back as if it were a live opponent.
 *
 * Call `playTurn()` each time the opponent should move (e.g. right after the
 * human finishes their turn). It animates one whole turn at a fixed pace:
 * roll -> hold -> roll -> hold -> roll -> score, then `isPlaying` goes false
 * and `onTurnComplete` fires.
 *
 * Pass a stable `game` object (an imported constant or state). Passing a
 * different object resets the replay.
 */
export function useReplay(
  game: RecordedGame | null,
  { rollMs = 600, stepMs = 600, onTurnComplete }: UseReplayOptions = {}
): OpponentController {
  const [state, dispatch] = useReducer(
    opponentReducer,
    undefined,
    initialOpponentState
  );
  const [mood, setMood] = useState<Mood>("neutral");
  const [messages, setMessages] = useState<string[]>([]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const turnIndexRef = useRef(0);
  const playingRef = useRef(false);
  const onTurnCompleteRef = useRef(onTurnComplete);
  useEffect(() => {
    onTurnCompleteRef.current = onTurnComplete;
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    turnIndexRef.current = 0;
    playingRef.current = false;
    dispatch({ type: "RESET" });
    setMood("neutral");
    setMessages([]);
  }, [clearTimers]);

  // New game object -> start over. In dev, also sanity-check the recording.
  useEffect(() => {
    reset();
    if (game && process.env.NODE_ENV !== "production") {
      const errors = validateRecordedGame(game);
      if (errors.length > 0) {
        console.error(
          `Recorded game "${game.id}" is invalid:\n- ${errors.join("\n- ")}`
        );
      }
    }
  }, [game, reset]);

  // Never leave timers running after unmount.
  useEffect(() => clearTimers, [clearTimers]);

  const playTurn = useCallback(() => {
    if (!game || playingRef.current) return;
    const turnIndex = turnIndexRef.current;
    const turn = game.turns[turnIndex];
    if (!turn) return; // game already finished

    playingRef.current = true;
    dispatch({ type: "TURN_START" });
    setMood("think");

    let t = 0;
    // Zero-delay steps run right away so the first roll starts in the same
    // render as TURN_START (no one-tick gap where nothing is animating).
    const at = (ms: number, fn: () => void) => {
      if (ms <= 0) fn();
      else timers.current.push(setTimeout(fn, ms));
    };

    turn.rolls.forEach((dice, i) => {
      const keepBefore: KeepMask = i === 0 ? NO_KEEPS : turn.keeps[i - 1];

      at(t, () => dispatch({ type: "ROLL_START", keepMask: keepBefore }));
      t += rollMs;
      at(t, () =>
        dispatch({
          type: "ROLL_DONE",
          dice,
          rollsRemaining: ROLLS_PER_TURN - (i + 1),
        })
      );
      t += stepMs;

      if (i < turn.rolls.length - 1) {
        const mask = turn.keeps[i];
        at(t, () => dispatch({ type: "KEEP", keepMask: mask }));
        t += stepMs;
      }
    });

    const finalDice = turn.rolls[turn.rolls.length - 1];
    at(t, () => {
      dispatch({ type: "SCORE", dice: finalDice, category: turn.category });
      const reaction = reactToScore(turn.category, turn.score);
      setMood(reaction.mood);
      if (reaction.message) {
        const line = reaction.message;
        setMessages((prev) => [...prev, line]);
      }
    });
    t += stepMs;

    at(t, () => {
      turnIndexRef.current = turnIndex + 1;
      playingRef.current = false;
      dispatch({ type: "TURN_END" });
      onTurnCompleteRef.current?.({
        turnIndex,
        category: turn.category,
        score: turn.score,
      });
    });
  }, [game, rollMs, stepMs]);

  const totalTurns = game?.turns.length ?? 0;

  return {
    // What to draw
    dice: state.dice,
    keepMask: state.keepMask,
    rollsRemaining: state.rollsRemaining,
    isRolling: state.isRolling,
    scoreSheet: state.scoreSheet,
    lastScored: state.lastScored,
    // Flow
    isPlaying: state.isPlaying, // true while a turn is being played out (use as "isPending")
    turnsCompleted: state.turnsCompleted,
    totalTurns,
    isFinished: totalTurns > 0 && state.turnsCompleted >= totalTurns,
    // Personality (feed straight into <Bot /> / <GameChat />)
    mood,
    messages,
    // Controls
    playTurn,
    reset,
  };
}
