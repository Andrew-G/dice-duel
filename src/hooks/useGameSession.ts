import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PHRASE_TYPE, getRandomPhrase } from "@/constants/lang";
import { TURNS_PER_GAME } from "@/engine/score";
import type { GameSnapshot } from "@/types/Achievement";
import type { GameOutcome, ScoreCategory } from "@/types/Game";
import type { Matchup } from "@/types/Matchup";
import type { GameSounds } from "./useGameSounds";
import type { HighScore } from "./useHighScore";
import { useLiveOpponent } from "./useLiveOpponent";
import { usePlayerGame } from "./usePlayerGame";

export type { GameOutcome };

/**
 * Where the shared dice tray is in the turn cycle. Exactly one at a time:
 *
 *   waiting -> playerTurn -> scrollingToOpponent -> flippingToOpponent
 *     -> opponentTurn -> flippingToPlayer -> waiting -> ...
 *
 * Solo games only ever use `waiting` and `playerTurn`.
 *
 * - `waiting`: your dice, theirs to roll, at rest (the idle wave plays).
 * - `playerTurn`: you've rolled; the dice are live (rolling, held, scored).
 * - `scrollingToOpponent`: you've scored; the page scrolls up to the opponent.
 * - `flippingToOpponent`: the dice turn over to the opponent's theme.
 * - `opponentTurn`: the opponent rolls, holds and scores.
 * - `flippingToPlayer`: the dice turn back to your theme.
 */
export type DiceStage =
  | "waiting"
  | "playerTurn"
  | "scrollingToOpponent"
  | "flippingToOpponent"
  | "opponentTurn"
  | "flippingToPlayer";

/** The stored half of `DiceStage`: whose turn it is and how the hand-over is going. */
type Phase = "player" | Exclude<DiceStage, "waiting" | "playerTurn">;

// Opponents move at a fixed, brisk pace (ms) so you never wait long.
const OPPONENT_PACE = { rollMs: 400, stepMs: 350 };

/**
 * Everything that happens during one game: the player, the live robot
 * opponent (if any), turn-taking, sound effects and recording the high score.
 *
 * The state belongs to the game, so mount it with a fresh `key` for each new
 * game rather than resetting it by hand.
 *
 * `onGameEnd` is called once, when a versus game finishes, with the player's
 * outcome (Challenge mode uses it to unlock the next opponent).
 *
 * `onProgress` is called after each of the player's turns, and once more when
 * the game is over (achievements use it).
 *
 * Handing over: a versus game moves through the `DiceStage`s above, one step
 * at a time, and each step waits for the view to say the previous one is done:
 *
 *   score()                -> scrollingToOpponent (the player's controls lock)
 *   finishScrollToOpponent -> flippingToOpponent  (the page has stopped moving)
 *   finishDiceFlip         -> opponentTurn        (the flip is over; they roll)
 *   (their turn ends)      -> flippingToPlayer
 *   finishDiceFlip         -> waiting             (the player may roll again)
 *
 * Your controls stay locked (`isOpponentTurn`) for all of it, except that when
 * the opponent's last turn ends the game, there is no flip back.
 */
export function useGameSession(
  matchup: Matchup,
  highScore: HighScore,
  sounds: GameSounds,
  onGameEnd?: (outcome: GameOutcome) => void,
  onProgress?: (snapshot: GameSnapshot) => void
) {
  // Every versus game is against a live robot with a personality.
  const character = matchup.kind === "solo" ? null : matchup.character;
  const isVersus = character !== null;
  const [greeting] = useState(() =>
    character ? getRandomPhrase(character.phrases[PHRASE_TYPE.GREETINGS]) : null
  );

  // Whose turn it is and how the hand-over is going. A ref mirrors it so the
  // callbacks below always see the latest value, even when a timer or an
  // animation calls them long after the render they were made in.
  const [phase, setPhaseState] = useState<Phase>("player");
  const phaseRef = useRef<Phase>("player");
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const opponent = useLiveOpponent(character?.botSkill ?? null, {
    ...OPPONENT_PACE,
    phrases: character?.phrases,
    // Their turn is over: flip the dice back to yours. If that was the last
    // turn of the game there's nothing left to roll, so skip the flip.
    onTurnComplete: ({ turnIndex }) =>
      setPhase(turnIndex + 1 >= TURNS_PER_GAME ? "player" : "flippingToPlayer"),
  });

  const isOpponentTurn = isVersus && phase !== "player";
  const player = usePlayerGame({ isPlayerTurn: !isOpponentTurn });

  // --- High score: record it once per finished game ------------------------
  const playerTotal = player.scoreSheet.total ?? 0;
  const { submit: submitHighScore } = highScore;
  const scoreSubmitted = useRef(false);
  useEffect(() => {
    if (!player.isFinished || scoreSubmitted.current) return;
    scoreSubmitted.current = true;
    submitHighScore(playerTotal);
  }, [player.isFinished, playerTotal, submitHighScore]);

  // --- Result: report it once per finished versus game ----------------------
  const opponentTotal = opponent.scoreSheet.total ?? 0;
  const isGameOver = isVersus
    ? player.isFinished && opponent.isFinished
    : player.isFinished;
  const outcome: GameOutcome | null =
    isVersus && isGameOver
      ? playerTotal > opponentTotal
        ? "win"
        : playerTotal < opponentTotal
          ? "loss"
          : "tie"
      : null;
  const outcomeReported = useRef(false);
  useEffect(() => {
    if (!outcome || outcomeReported.current) return;
    outcomeReported.current = true;
    onGameEnd?.(outcome);
  }, [outcome, onGameEnd]);

  // --- Achievements: report after each of your turns, and when the game ends -
  const snapshot: GameSnapshot = {
    mode: matchup.kind,
    turns: player.turns,
    playerSheet: player.scoreSheet,
    opponentSheet: isVersus ? opponent.scoreSheet : null,
    isComplete: isGameOver,
    outcome,
  };
  const snapshotRef = useRef(snapshot);
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    snapshotRef.current = snapshot;
    onProgressRef.current = onProgress;
  });
  const turnsPlayed = player.turns.length;
  const completionReported = useRef(false);
  useEffect(() => {
    if (turnsPlayed === 0) return;
    if (isGameOver) {
      if (completionReported.current) return;
      completionReported.current = true;
    }
    onProgressRef.current?.(snapshotRef.current);
  }, [turnsPlayed, isGameOver]);

  // --- Sound effects --------------------------------------------------------
  const { playRoll, playOpponentRoll, playChat } = sounds;
  useEffect(() => {
    if (player.isRolling) playRoll();
  }, [player.isRolling, playRoll]);
  useEffect(() => {
    if (opponent.isRolling) playOpponentRoll();
  }, [opponent.isRolling, playOpponentRoll]);
  const opponentMessageCount = opponent.messages.length;
  useEffect(() => {
    if (opponentMessageCount > 0) playChat();
  }, [opponentMessageCount, playChat]);

  // --- Actions ---------------------------------------------------------------
  /** Returns whether the score went through. */
  const score = (category: ScoreCategory): boolean => {
    if (!player.canScore || isOpponentTurn) return false;
    if (player.scoreSheet[category] !== null) return false;
    player.score(category);
    // Turns alternate: the view scrolls to the opponent, then the dice flip.
    if (isVersus) setPhase("scrollingToOpponent");
    return true;
  };

  /** The page has scrolled the opponent into view: now flip the dice. */
  const finishScrollToOpponent = useCallback(() => {
    if (phaseRef.current === "scrollingToOpponent") {
      setPhase("flippingToOpponent");
    }
  }, [setPhase]);

  /**
   * The dice have finished turning over (the view reports it, and it also
   * fires at once if both sides use the same dice). Either they're now the
   * opponent's, so the opponent rolls, or they're yours again and at rest.
   */
  const { playTurn: playOpponentTurn } = opponent;
  const finishDiceFlip = useCallback(() => {
    switch (phaseRef.current) {
      case "flippingToOpponent":
        setPhase("opponentTurn");
        playOpponentTurn();
        break;
      case "flippingToPlayer":
        setPhase("player");
        break;
    }
  }, [setPhase, playOpponentTurn]);

  // --- What the views need ---------------------------------------------------
  const diceStage: DiceStage =
    phase === "player" ? (player.dice ? "playerTurn" : "waiting") : phase;

  /**
   * The single dice tray shows the opponent's dice only while they play. In
   * every other stage it shows yours, so the other side's dice never flash up
   * in the wrong theme while the tray flips.
   */
  const tray =
    diceStage === "opponentTurn"
      ? {
          dice: opponent.dice,
          keepMask: opponent.keepMask,
          isRolling: opponent.isRolling,
        }
      : {
          dice: player.dice,
          keepMask: player.keepMask,
          isRolling: player.isRolling,
        };

  const chatMessages = useMemo(
    () => (greeting ? [greeting, ...opponent.messages] : opponent.messages),
    [greeting, opponent.messages]
  );

  return {
    player,
    opponent,
    isVersus,
    isOpponentTurn,
    diceStage,
    tray,
    chatMessages,
    /** Set for versus games; solo play has none. */
    character,
    playerTotal,
    opponentTotal,
    isGameOver,
    outcome,
    robotError: character ? opponent.error : null,
    retryRobotTurn: opponent.playTurn,
    score,
    finishScrollToOpponent,
    finishDiceFlip,
  };
}
