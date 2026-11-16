import { useEffect, useMemo, useRef, useState } from "react";
import { getRandomPhrase, phrases } from "@/constants/lang";
import type { ScoreCategory } from "@/types/Game";
import type { Matchup } from "@/types/Matchup";
import type { OpponentController } from "./opponentCore";
import type { GameSounds } from "./useGameSounds";
import type { HighScore } from "./useHighScore";
import { useLiveOpponent } from "./useLiveOpponent";
import { usePlayerGame } from "./usePlayerGame";
import { useReplay } from "./useReplay";

// Opponents move at a fixed, brisk pace (ms) so you never wait long.
const OPPONENT_PACE = { rollMs: 400, stepMs: 350 };

/**
 * Everything that happens during one game: the player, the opponent (a
 * replayed recording or the live robot), turn-taking, sound effects and
 * recording the high score.
 *
 * The state belongs to the game, so mount it with a fresh `key` for each new
 * game rather than resetting it by hand.
 */
export function useGameSession(
  matchup: Matchup,
  highScore: HighScore,
  sounds: GameSounds
) {
  const isVersus = matchup.kind !== "solo";
  const [greeting] = useState(() =>
    isVersus ? getRandomPhrase(phrases.greetings) : null
  );

  const replay = useReplay(
    matchup.kind === "recorded" ? matchup.game : null,
    OPPONENT_PACE
  );
  const robot = useLiveOpponent(
    matchup.kind === "robot" ? matchup.level.skill : null,
    OPPONENT_PACE
  );
  const opponent: OpponentController =
    matchup.kind === "robot" ? robot : replay;

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

  const opponentTitle =
    matchup.kind === "robot"
      ? `${matchup.level.label} robot`
      : matchup.kind === "recorded"
        ? `${matchup.tier.label} • ${matchup.game.label}`
        : null;

  return {
    player,
    opponent,
    isVersus,
    isOpponentTurn,
    tray,
    chatMessages,
    opponentTitle,
    playerTotal,
    opponentTotal: opponent.scoreSheet.total ?? 0,
    isGameOver: isVersus
      ? player.isFinished && opponent.isFinished
      : player.isFinished,
    robotError: matchup.kind === "robot" ? robot.error : null,
    retryRobotTurn: robot.playTurn,
    score,
  };
}
