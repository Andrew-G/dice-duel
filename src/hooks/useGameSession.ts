import { useEffect, useMemo, useRef, useState } from "react";
import { PHRASE_TYPE, getRandomPhrase } from "@/constants/lang";
import type { ScoreCategory } from "@/types/Game";
import type { Matchup } from "@/types/Matchup";
import type { GameSounds } from "./useGameSounds";
import type { HighScore } from "./useHighScore";
import { useLiveOpponent } from "./useLiveOpponent";
import { usePlayerGame } from "./usePlayerGame";

export type GameOutcome = "win" | "loss" | "tie";

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
 */
export function useGameSession(
  matchup: Matchup,
  highScore: HighScore,
  sounds: GameSounds,
  onGameEnd?: (outcome: GameOutcome) => void
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

  const isOpponentTurn = isVersus && opponent.isPlaying;
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
  const score = (category: ScoreCategory) => {
    if (!player.canScore || isOpponentTurn) return;
    if (player.scoreSheet[category] !== null) return;
    player.score(category);
    // Turns alternate: as soon as you score, the opponent plays theirs.
    if (isVersus) opponent.playTurn();
  };

  // --- What the views need ---------------------------------------------------
  /** The single dice tray shows whoever's turn it is. */
  const tray = isOpponentTurn
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
  };
}
