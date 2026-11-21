import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PHRASE_TYPE, getRandomPhrase } from "@/constants/lang";
import type { GameSnapshot } from "@/types/Achievement";
import type { GameOutcome, ScoreCategory } from "@/types/Game";
import type { Matchup } from "@/types/Matchup";
import type { GameSounds } from "./useGameSounds";
import type { HighScore } from "./useHighScore";
import { useLiveOpponent } from "./useLiveOpponent";
import { usePlayerGame } from "./usePlayerGame";

export type { GameOutcome };

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
 * Handing over: scoring in a versus game does not start the opponent's turn
 * by itself. It marks the opponent as up next (`isOpponentTurn`, so the
 * player's controls lock) and waits for `startOpponentTurn()`. That gives the
 * view time to scroll to the opponent and swap the dice first.
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

  const opponent = useLiveOpponent(character?.botSkill ?? null, {
    ...OPPONENT_PACE,
    phrases: character?.phrases,
  });

  // Set from the moment you score until the view calls `startOpponentTurn`.
  const [handoffPending, setHandoffPending] = useState(false);
  const isOpponentTurn = isVersus && (opponent.isPlaying || handoffPending);
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
    // Turns alternate: the opponent is up next, once the view says so.
    if (isVersus) setHandoffPending(true);
    return true;
  };

  /** The dice are theirs: the opponent plays their turn. */
  const { playTurn: playOpponentTurn } = opponent;
  const startOpponentTurn = useCallback(() => {
    setHandoffPending(false);
    playOpponentTurn();
  }, [playOpponentTurn]);

  // --- What the views need ---------------------------------------------------
  /**
   * The single dice tray shows whoever is actually playing. While the turn is
   * being handed over it still shows yours, so the opponent's previous dice
   * don't flash up in the wrong theme.
   */
  const tray = opponent.isPlaying
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
    startOpponentTurn,
  };
}
