import clsx from "clsx";
import { useRef, useState } from "react";
import GameDice from "@/components/GameDice";
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
}: GameViewProps) => {
  const session = useGameSession(matchup, highScore, sounds, onGameEnd);
  const { player, opponent, isVersus, isOpponentTurn, tray, character } =
    session;
  const opponentName = character?.name ?? "Opponent";

  const isChallenge = matchup.kind === "challenge";

  // Dice themes. Challenge: your dice on your turn and theirs on theirs. Other
  // versus games always roll the character's dice, and solo always yours.
  const playerDiceId = character && !isChallenge ? character.diceId : diceId;
  const opponentDiceId = isChallenge ? character?.diceId : undefined;

  // --- After you score: scroll to the action, then change hands -------------
  // Scoring usually happens at the bottom of the page, far from the dice and
  // the opponent. So a moment after you score, the page scrolls back up to
  // them. The dice only change theme once that's done, so you see it happen.
  const opponentRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [opponentDiceReady, setOpponentDiceReady] = useState(false);
  const { scrollTo } = useDelayedScroll();

  // Back to your dice the moment their turn ends: you're already at the top.
  const showOpponentDice = isChallenge && isOpponentTurn && opponentDiceReady;

  const handleScore = (category: ScoreCategory) => {
    setOpponentDiceReady(false);
    session.score(category);
    scrollTo(
      // The opponent's panel in versus; the dice when solo, or the result if
      // that was the last turn and the dice are gone.
      () =>
        character
          ? opponentRef.current
          : diceRef.current ?? resultRef.current,
      () => setOpponentDiceReady(true)
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
              !tray.dice && "opacity-40",
              isOpponentTurn && "pointer-events-none"
            )}
          >
            <GameDice
              dice={tray.dice ?? undefined}
              keepMask={tray.keepMask}
              diceId={playerDiceId}
              opponentDiceId={opponentDiceId}
              showOpponentDice={showOpponentDice}
              isRolling={tray.isRolling}
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
            animateVerdict={isChallenge}
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
