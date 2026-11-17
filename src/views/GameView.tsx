import clsx from "clsx";
import GameDice from "@/components/GameDice";
import GameResult from "@/components/GameResult";
import OpponentPanel from "@/components/OpponentPanel";
import RecordPanel from "@/components/RecordPanel";
import ScoreCard from "@/components/ScoreCard";
import Button from "@/components/Button";
import TurnControls from "@/components/TurnControls";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";
import { TURNS_PER_GAME } from "@/engine/score";
import { useGameSession, type GameOutcome } from "@/hooks/useGameSession";
import type { GameSounds } from "@/hooks/useGameSounds";
import type { HighScore } from "@/hooks/useHighScore";
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

  // The tray is shared, so while it's the opponent's turn it rolls their dice.
  const trayDiceId = isOpponentTurn && character ? character.diceId : diceId;

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

      {session.opponentTitle && (
        <OpponentPanel
          title={session.opponentTitle}
          character={character}
          mood={opponent.mood}
          turnsCompleted={opponent.turnsCompleted}
          messages={session.chatMessages}
          error={session.robotError}
          onRetry={session.retryRobotTurn}
        />
      )}

      {(!player.isFinished || isOpponentTurn) && (
        <>
          {/* One dice tray, fed by whoever's turn it is. */}
          <div
            className={clsx(
              !tray.dice && "opacity-40",
              isOpponentTurn && "pointer-events-none"
            )}
          >
            <GameDice
              dice={tray.dice ?? undefined}
              keepMask={tray.keepMask}
              diceId={character ? character.diceId : trayDiceId}
              isRolling={tray.isRolling}
              onKeepToggle={isOpponentTurn ? undefined : player.toggleKeep}
            />
          </div>
          {!player.isFinished && (
            <TurnControls player={player} isOpponentTurn={isOpponentTurn} />
          )}
        </>
      )}

      <ScoreCard
        player={player.scoreSheet}
        opponent={isVersus ? opponent.scoreSheet : undefined}
        opponentLabel={opponentName}
        potential={player.potentialScores}
        canScore={player.canScore && !isOpponentTurn}
        onScore={session.score}
      />

      {session.isGameOver && (
        <>
          <GameResult
            playerTotal={session.playerTotal}
            opponentTotal={isVersus ? session.opponentTotal : undefined}
            bestScore={highScore.best}
            isNewBest={highScore.isNewBest}
            note={challengeResult?.note}
            actionLabel={challengeResult?.actionLabel}
            onAction={challengeResult?.onAction ?? onRestart}
          />
          <RecordPanel turns={player.turns} />
        </>
      )}
    </>
  );
};

export default GameView;
