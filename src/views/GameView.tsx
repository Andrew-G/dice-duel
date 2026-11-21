import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import GameDice, { DICE_FLIP_TOTAL_MS } from "@/components/GameDice";
import GameResult from "@/components/GameResult";
import OpponentPanel from "@/components/OpponentPanel";
import RecordPanel from "@/components/RecordPanel";
import ScoreCard from "@/components/ScoreCard";
import Button from "@/components/Button";
import TurnControls from "@/components/TurnControls";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";
import { TURNS_PER_GAME } from "@/engine/score";
import { useDelayedScroll } from "@/hooks/useDelayedScroll";
import { useGameSession, type GameOutcome } from "@/hooks/useGameSession";
import type { GameSounds } from "@/hooks/useGameSounds";
import type { HighScore } from "@/hooks/useHighScore";
import type { GameSnapshot } from "@/types/Achievement";
import type { ScoreCategory } from "@/types/Game";
import type { Matchup } from "@/types/Matchup";

type GameViewProps = {
  matchup: Matchup;
  diceId: string;
  highScore: HighScore;
  sounds: GameSounds;
  onRestart: () => void;
  onMenu: () => void;
  /** Called once when a versus game finishes, with how the player did. */
  onGameEnd?: (outcome: GameOutcome) => void;
  /** Challenge mode: move on from the result, which plays the character's reaction. */
  onChallengeContinue?: (outcome: GameOutcome) => void;
  /** Called after each of your turns and when the game ends (achievements). */
  onProgress?: (snapshot: GameSnapshot) => void;
};

/**
 * One game, solo or versus. Its state lives and dies with this view, so mount
 * it with a new `key` to start a fresh game.
 */
const GameView = ({
  matchup,
  diceId,
  highScore,
  sounds,
  onRestart,
  onMenu,
  onGameEnd,
  onChallengeContinue,
  onProgress,
}: GameViewProps) => {
  const session = useGameSession(
    matchup,
    highScore,
    sounds,
    onGameEnd,
    onProgress
  );
  const { player, opponent, isVersus, isOpponentTurn, tray, character } =
    session;
  const opponentName = character?.name ?? "Opponent";

  // --- Handing over the dice -------------------------------------------------
  // The tray is shared. It rolls your dice (your chosen theme) on your turn and
  // the character's on theirs. Scoring usually happens at the bottom of the
  // page, far from the opponent, so a moment after you score the page scrolls
  // back up to them. Once it has settled the dice turn over to their theme, and
  // only then does the opponent start rolling. When their turn ends the dice
  // turn back to yours at once: you're already at the top.
  const opponentRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [opponentDiceReady, setOpponentDiceReady] = useState(false);
  const { scrollTo } = useDelayedScroll();

  const showOpponentDice = isOpponentTurn && opponentDiceReady;

  // Always call the latest `startOpponentTurn` from the timers below.
  const startOpponentTurnRef = useRef(session.startOpponentTurn);
  useEffect(() => {
    startOpponentTurnRef.current = session.startOpponentTurn;
  });
  const flipTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  const handleScore = (category: ScoreCategory) => {
    setOpponentDiceReady(false);
    window.clearTimeout(flipTimer.current);
    if (!session.score(category)) return;

    scrollTo(
      // The opponent's panel in versus; the dice when solo, or the result if
      // that was the last turn and the dice are gone.
      () =>
        character ? opponentRef.current : diceRef.current ?? resultRef.current,
      () => {
        if (!isVersus) return;
        // Flip to their dice, let the flip finish, then they roll.
        setOpponentDiceReady(true);
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        flipTimer.current = window.setTimeout(
          () => startOpponentTurnRef.current(),
          reduceMotion ? 0 : DICE_FLIP_TOTAL_MS
        );
      }
    );
  };

  // Challenge mode: either way, Continue plays the character's reaction. After
  // that a win moves on to the next character and anything else is a rematch.
  const challengeResult =
    matchup.kind === "challenge" && session.outcome
      ? (() => {
          const outcome = session.outcome;
          const next = CHALLENGE_ORDER[matchup.stage + 1];
          const onAction = onChallengeContinue
            ? () => onChallengeContinue(outcome)
            : onMenu;
          return outcome === "win"
            ? {
                note: next
                  ? `You beat ${opponentName}! ${next.name} is up next.`
                  : `You beat ${opponentName}! You've conquered the whole Challenge!`,
                actionLabel: "Continue",
                onAction,
              }
            : {
                note: `You need to beat ${opponentName} to move on.`,
                actionLabel: "Continue",
                onAction,
              };
        })()
      : null;

  const statusText = isOpponentTurn
    ? `${opponentName}'s turn`
    : player.isFinished
    ? "Game over"
    : `Turn ${player.turnNumber} of ${TURNS_PER_GAME} • Rolls left ${player.rollsRemaining}`;

  return (
    <>
      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-sm text-indigo-300">
          {statusText}
        </p>
        <div className="flex gap-2">
          <Button variant="small" onClick={onRestart}>
            Restart
          </Button>
          <Button variant="small" onClick={onMenu}>
            Menu
          </Button>
        </div>
      </div>

      {character && (
        <div ref={opponentRef} className="scroll-mt-20 space-y-4">
          <OpponentPanel
            title={character.name}
            character={character}
            mood={opponent.mood}
            turnsCompleted={opponent.turnsCompleted}
            messages={session.chatMessages}
            error={session.robotError}
            onRetry={session.retryRobotTurn}
          />
        </div>
      )}

      {(!player.isFinished || isOpponentTurn) && (
        <>
          {/* One dice tray, fed by whoever's turn it is. */}
          <div
            ref={diceRef}
            className={clsx(
              "scroll-mt-20",
              isOpponentTurn && "pointer-events-none"
            )}
          >
            <GameDice
              dice={tray.dice ?? undefined}
              keepMask={tray.keepMask}
              diceId={diceId}
              opponentDiceId={character?.diceId}
              showOpponentDice={showOpponentDice}
              isRolling={tray.isRolling}
              // isWaiting{!tray.dice}
              isWaiting={!!!tray.dice}
              onKeepToggle={isOpponentTurn ? undefined : player.toggleKeep}
            />
          </div>
          {!player.isFinished && (
            <TurnControls player={player} isOpponentTurn={isOpponentTurn} />
          )}
        </>
      )}

      {session.isGameOver && (
        <div ref={resultRef} className="scroll-mt-20">
          <GameResult
            playerTotal={session.playerTotal}
            opponentTotal={isVersus ? session.opponentTotal : undefined}
            bestScore={highScore.best}
            isNewBest={highScore.isNewBest}
            note={challengeResult?.note}
            actionLabel={challengeResult?.actionLabel}
            onAction={challengeResult?.onAction ?? onRestart}
          />
        </div>
      )}

      <ScoreCard
        player={player.scoreSheet}
        opponent={isVersus ? opponent.scoreSheet : undefined}
        opponentLabel={opponentName}
        potential={player.potentialScores}
        canScore={player.canScore && !isOpponentTurn}
        onScore={handleScore}
      />

      {session.isGameOver && <RecordPanel turns={player.turns} />}
    </>
  );
};

export default GameView;
