import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ROLLS_PER_TURN, TURNS_PER_GAME, scoreCategory } from "@/engine/score";
import { applyScore } from "@/engine/sheet";
import {
  decideCategory,
  decideKeep,
  type BotSkill,
} from "@/engine/solver/policy";
import { rollDice } from "@/engine/solver/simulate";
import {
  getLoadedSolverTable,
  loadSolverTable,
  type SolverTable,
} from "@/engine/solver/table";
import type { PHRASES } from "@/constants/lang";
import type { Mood } from "@/types/Character";
import type { Dice, KeepMask } from "@/types/Dice";
import { createEmptyScoreSheet, type ScoreCategory } from "@/types/Game";
import {
  NO_KEEPS,
  initialOpponentState,
  opponentReducer,
  reactToScore,
  type OpponentController,
} from "./opponentCore";

export interface UseLiveOpponentOptions {
  /** How long the dice tumble before a roll result shows (ms). Default 600. */
  rollMs?: number;
  /** Pause between each visible step: result -> hold -> roll -> score (ms). Default 600. */
  stepMs?: number;
  /** The character's lines for reacting to scores. Defaults to the generic set. */
  phrases?: PHRASES;
  /** Injectable for tests. */
  rng?: () => number;
  /** Called after each turn has fully finished. */
  onTurnComplete?: (info: {
    turnIndex: number;
    category: ScoreCategory;
    score: number;
  }) => void;
}

/**
 * A live robot opponent. Each turn it really rolls dice and decides what to
 * hold and where to score using the dynamic-programming solver, at the given
 * skill (see engine/solver/levels.ts). Pass `null` to disable it.
 *
 * Exposes the same controller as `useReplay`, so the page can use either.
 * `playTurn()` plays one whole turn at a fixed pace (roll -> hold -> roll ->
 * hold -> roll -> score). The value table is fetched on first use; if that
 * fails, `error` is set and calling `playTurn()` again retries.
 */
export function useLiveOpponent(
  skill: BotSkill | null,
  {
    rollMs = 600,
    stepMs = 600,
    phrases,
    rng = Math.random,
    onTurnComplete,
  }: UseLiveOpponentOptions = {}
): OpponentController & { error: string | null } {
  const [state, dispatch] = useReducer(
    opponentReducer,
    undefined,
    initialOpponentState
  );
  const [mood, setMood] = useState<Mood>("neutral");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const token = useRef(0); // bumped on reset/unmount so stale callbacks do nothing
  const playingRef = useRef(false);
  const turnsRef = useRef(0);
  const sheetRef = useRef(createEmptyScoreSheet());
  const onTurnCompleteRef = useRef(onTurnComplete);
  useEffect(() => {
    onTurnCompleteRef.current = onTurnComplete;
  });

  const cancel = useCallback(() => {
    token.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    cancel();
    playingRef.current = false;
    turnsRef.current = 0;
    sheetRef.current = createEmptyScoreSheet();
    dispatch({ type: "RESET" });
    setMood("neutral");
    setMessages([]);
    setError(null);
  }, [cancel]);

  // A different skill (or switching the robot on/off) starts a fresh game.
  useEffect(() => {
    reset();
  }, [skill, reset]);

  // Never leave timers running after unmount.
  useEffect(() => cancel, [cancel]);

  const playTurn = useCallback(() => {
    const bot = skill;
    if (!bot || playingRef.current || turnsRef.current >= TURNS_PER_GAME)
      return;

    playingRef.current = true;
    setError(null);
    setMood("think");
    dispatch({ type: "TURN_START" });
    const myToken = ++token.current;
    const turnIndex = turnsRef.current;

    // Zero-delay steps run immediately; the rest are timers that die with this turn.
    const later = (ms: number, fn: () => void) => {
      if (ms <= 0) {
        fn();
        return;
      }
      timers.current.push(
        setTimeout(() => {
          if (token.current === myToken) fn();
        }, ms)
      );
    };

    const runTurn = (table: SolverTable) => {
      const sheet = sheetRef.current;

      const rollStep = (
        rollNo: number,
        mask: KeepMask,
        previous: Dice | null
      ) => {
        dispatch({ type: "ROLL_START", keepMask: mask });
        later(rollMs, () => {
          const dice = rollDice(previous, mask, rng);
          dispatch({
            type: "ROLL_DONE",
            dice,
            rollsRemaining: ROLLS_PER_TURN - rollNo,
          });
          later(stepMs, () => decide(rollNo, dice));
        });
      };

      const decide = (rollNo: number, dice: Dice) => {
        const remaining = ROLLS_PER_TURN - rollNo;
        if (remaining > 0) {
          const mask = decideKeep(table, sheet, dice, remaining, bot, rng);
          if (mask) {
            dispatch({ type: "KEEP", keepMask: mask });
            later(stepMs, () => rollStep(rollNo + 1, mask, dice));
            return;
          }
        }
        scoreStep(dice); // out of rolls, or the robot chose to stand pat
      };

      const scoreStep = (dice: Dice) => {
        const category = decideCategory(table, sheet, dice, bot, rng);
        const points = scoreCategory(dice, category);
        sheetRef.current = applyScore(sheet, dice, category);
        dispatch({ type: "SCORE", dice, category });

        const reaction = reactToScore(category, points, phrases);
        setMood(reaction.mood);
        if (reaction.message) {
          const line = reaction.message;
          setMessages((prev) => [...prev, line]);
        }

        later(stepMs, () => {
          turnsRef.current += 1;
          playingRef.current = false;
          dispatch({ type: "TURN_END" });
          onTurnCompleteRef.current?.({ turnIndex, category, score: points });
        });
      };

      rollStep(1, NO_KEEPS, null);
    };

    const loaded = getLoadedSolverTable();
    if (loaded) {
      runTurn(loaded);
    } else {
      loadSolverTable().then(
        (table) => {
          if (token.current === myToken) runTurn(table);
        },
        (failure: unknown) => {
          if (token.current !== myToken) return;
          playingRef.current = false;
          dispatch({ type: "TURN_ABORT" });
          setMood("neutral");
          setError(
            failure instanceof Error ? failure.message : String(failure)
          );
        }
      );
    }
  }, [skill, rollMs, stepMs, phrases, rng]);

  const totalTurns = skill ? TURNS_PER_GAME : 0;

  return {
    dice: state.dice,
    keepMask: state.keepMask,
    rollsRemaining: state.rollsRemaining,
    isRolling: state.isRolling,
    scoreSheet: state.scoreSheet,
    lastScored: state.lastScored,
    isPlaying: state.isPlaying,
    turnsCompleted: state.turnsCompleted,
    totalTurns,
    isFinished: totalTurns > 0 && state.turnsCompleted >= totalTurns,
    mood,
    messages,
    error,
    playTurn,
    reset,
  };
}
