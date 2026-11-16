import clsx from "clsx";
import GameDice from "@/components/GameDice";
import GameResult from "@/components/GameResult";
import OpponentPanel from "@/components/OpponentPanel";
import RecordPanel from "@/components/RecordPanel";
import ScoreCard from "@/components/ScoreCard";
import Button from "@/components/Button";
import TurnControls from "@/components/TurnControls";
import { TURNS_PER_GAME } from "@/engine/score";
import { useGameSession } from "@/hooks/useGameSession";
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
}: GameViewProps) => {
  const session = useGameSession(matchup, highScore, sounds);
  const { player, opponent, isVersus, isOpponentTurn, tray } = session;

  const statusText = isOpponentTurn
    ? "Opponent's turn"
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
              diceId={diceId}
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
            onPlayAgain={onRestart}
          />
          <RecordPanel turns={player.turns} />
        </>
      )}
    </>
  );
};

export default GameView;
