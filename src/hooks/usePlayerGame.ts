import { useCallback, useEffect, useMemo, useReducer } from "react";
import { ROLLS_PER_TURN, TURNS_PER_GAME, scoreCategory } from "@/engine/score";
import { applyScore, getPotentialScores } from "@/engine/sheet";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import {
  createEmptyScoreSheet,
  type ScoreCategory,
  type ScoreSheet,
} from "@/types/Game";
import type { RecordedTurn } from "@/types/Recording";

const NO_KEEPS: KeepMask = [0, 0, 0, 0, 0];

export interface UsePlayerGameOptions {
  /** How long the dice tumble before the player can act again (ms). Default 600. */
  rollMs?: number;
  /** Injectable for tests. */
  rng?: () => number;
}

interface PlayerState {
  dice: Dice | null;
  keepMask: KeepMask;
  rollsUsed: number;
  isRolling: boolean;
  scoreSheet: ScoreSheet;
  /** Completed turns, already in recording format. */
  turns: RecordedTurn[];
  /** The turn in progress: dice after each roll, and the masks used between rolls. */
  turnRolls: Dice[];
  turnKeeps: KeepMask[];
}

type Action =
  | { type: "RESET" }
  | { type: "ROLL"; dice: Dice }
  | { type: "ROLL_DONE" }
  | { type: "TOGGLE_KEEP"; index: number }
  | { type: "SCORE"; category: ScoreCategory };

const initialState = (): PlayerState => ({
  dice: null,
  keepMask: NO_KEEPS,
  rollsUsed: 0,
  isRolling: false,
  scoreSheet: createEmptyScoreSheet(),
  turns: [],
  turnRolls: [],
  turnKeeps: [],
});

function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case "RESET":
      return initialState();

    case "ROLL":
      return {
        ...state,
        dice: action.dice,
        isRolling: true,
        rollsUsed: state.rollsUsed + 1,
        turnRolls: [...state.turnRolls, action.dice],
        // The mask in force at the moment of rerolling is the "keep" decision.
        turnKeeps:
          state.rollsUsed > 0
            ? [...state.turnKeeps, state.keepMask]
            : state.turnKeeps,
      };

    case "ROLL_DONE":
      return { ...state, isRolling: false };

    case "TOGGLE_KEEP": {
      const keepMask = state.keepMask.map((v, i) =>
        i === action.index ? 1 - v : v
      ) as KeepMask;
      return { ...state, keepMask };
    }

    case "SCORE": {
      if (!state.dice || state.isRolling) return state;
      if (state.scoreSheet[action.category] !== null) return state;
      const turn: RecordedTurn = {
        rolls: state.turnRolls,
        keeps: state.turnKeeps,
        category: action.category,
        score: scoreCategory(state.dice, action.category),
      };
      return {
        ...state,
        scoreSheet: applyScore(state.scoreSheet, state.dice, action.category),
        turns: [...state.turns, turn],
        dice: null,
        keepMask: NO_KEEPS,
        rollsUsed: 0,
        turnRolls: [],
        turnKeeps: [],
      };
    }
  }
}

/**
 * The human player's side of a solo game. Every roll, hold and score is
 * captured in `turns` (the RecordedTurn format) as you play, so recording is
 * free - the UI just decides whether to offer the export.
 */
export function usePlayerGame({
  rollMs = 600,
  rng = Math.random,
}: UsePlayerGameOptions = {}) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Tumble animation: unlock the dice once the roll has "finished".
  useEffect(() => {
    if (!state.isRolling) return;
    const timer = setTimeout(() => dispatch({ type: "ROLL_DONE" }), rollMs);
    return () => clearTimeout(timer);
  }, [state.isRolling, rollMs]);

  const turnsCompleted = state.turns.length;
  const isFinished = turnsCompleted >= TURNS_PER_GAME;
  const rollsRemaining = ROLLS_PER_TURN - state.rollsUsed;
  const allKept = state.keepMask.every((v) => v === 1);

  const canRoll =
    !state.isRolling && !isFinished && rollsRemaining > 0 && !(state.dice && allKept);
  const canHold = !!state.dice && !state.isRolling && rollsRemaining > 0;
  const canScore = !!state.dice && !state.isRolling && !isFinished;

  const roll = useCallback(() => {
    if (!canRoll) return;
    const previous = state.dice;
    const dice = Array.from({ length: 5 }, (_, i) =>
      previous && state.keepMask[i] === 1
        ? previous[i]
        : ((Math.floor(rng() * 6) + 1) as Die)
    ) as Dice;
    dispatch({ type: "ROLL", dice });
  }, [canRoll, state.dice, state.keepMask, rng]);

  const toggleKeep = useCallback(
    (index: number) => {
      if (canHold) dispatch({ type: "TOGGLE_KEEP", index });
    },
    [canHold]
  );

  const score = useCallback(
    (category: ScoreCategory) => {
      if (canScore) dispatch({ type: "SCORE", category });
    },
    [canScore]
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const potentialScores = useMemo(
    () =>
      state.dice && !state.isRolling
        ? getPotentialScores(state.scoreSheet, state.dice)
        : undefined,
    [state.dice, state.isRolling, state.scoreSheet]
  );

  return {
    // What to draw
    dice: state.dice,
    keepMask: state.keepMask,
    rollsRemaining,
    isRolling: state.isRolling,
    scoreSheet: state.scoreSheet,
    potentialScores,
    // Progress
    turnNumber: Math.min(turnsCompleted + 1, TURNS_PER_GAME),
    turnsCompleted,
    isFinished,
    /** Completed turns in recording format (feed to createRecordedGame). */
    turns: state.turns,
    // What the player may do right now
    canRoll,
    canHold,
    canScore,
    // Controls
    roll,
    toggleKeep,
    score,
    reset,
  };
}
