"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSound from "use-sound";

import chatMessageSfx from "@/assets/sfx/chat-message.mp3";
import diceRollSfx from "@/assets/sfx/dice-roll.mp3";
import Bot from "@/components/Bot";
import GameChat from "@/components/GameChat";
import GameDice from "@/components/GameDice";
import RecordPanel from "@/components/RecordPanel";
import ScoreCard from "@/components/ScoreCard";
import { getRandomPhrase, phrases } from "@/constants/lang";
import { recordedGames } from "@/data/games";
import {
  buildDifficultyTiers,
  pickGameFromTier,
  type DifficultyTier,
} from "@/engine/difficulty";
import { TURNS_PER_GAME } from "@/engine/score";
import { ROBOT_LEVELS, type RobotLevel } from "@/engine/solver/levels";
import { loadSolverTable } from "@/engine/solver/table";
import { useHighScore } from "@/hooks/useHighScore";
import { useLiveOpponent } from "@/hooks/useLiveOpponent";
import type { OpponentController } from "@/hooks/opponentCore";
import { usePlayerGame } from "@/hooks/usePlayerGame";
import { useReplay } from "@/hooks/useReplay";
import type { ScoreCategory } from "@/types/Game";
import type { RecordedGame } from "@/types/Recording";

type Screen = "menu" | "difficulty" | "robot-difficulty" | "solo" | "vs";

// Opponents move at a fixed, brisk pace (ms) so you never wait long.
const OPPONENT_PACE = { rollMs: 400, stepMs: 350 };

const TIERS = buildDifficultyTiers(recordedGames);

const buttonClass =
  "rounded-md bg-gray-100 px-6 py-2 text-black shadow hover:bg-white disabled:opacity-40 disabled:hover:bg-gray-100";
const smallButtonClass =
  "rounded-md bg-gray-100 px-3 py-1 text-sm text-black shadow hover:bg-white";
const choiceClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300 disabled:opacity-40 disabled:hover:bg-white/5";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("menu");
  // Recorded opponent: a difficulty tier and the game picked from it.
  const [difficulty, setDifficulty] = useState<DifficultyTier | null>(null);
  const [opponentGame, setOpponentGame] = useState<RecordedGame | null>(null);
  // Live robot opponent: its level (null when not playing the robot).
  const [robotLevel, setRobotLevel] = useState<RobotLevel | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);

  const [playRollSfx] = useSound(diceRollSfx);
  const [playOpponentRollSfx] = useSound(diceRollSfx, { volume: 0.4 });
  const [playChatSfx] = useSound(chatMessageSfx);

  const player = usePlayerGame();
  const replay = useReplay(opponentGame, OPPONENT_PACE);
  const robot = useLiveOpponent(robotLevel?.skill ?? null, OPPONENT_PACE);
  const opponent: OpponentController = robotLevel ? robot : replay;
  const highScore = useHighScore();
  const { submit: submitHighScore, clearNewBest } = highScore;

  const isVs = screen === "vs";
  const isOpponentTurn = isVs && opponent.isPlaying;

  // --- High score: record it once per finished game -----------------------
  const youTotal = player.scoreSheet.total ?? 0;
  const scoreSubmitted = useRef(false);
  useEffect(() => {
    if (!player.isFinished || scoreSubmitted.current) return;
    scoreSubmitted.current = true;
    submitHighScore(youTotal);
  }, [player.isFinished, youTotal, submitHighScore]);

  // --- Sound effects ------------------------------------------------------
  useEffect(() => {
    if (player.isRolling) playRollSfx();
  }, [player.isRolling, playRollSfx]);
  useEffect(() => {
    if (opponent.isRolling) playOpponentRollSfx();
  }, [opponent.isRolling, playOpponentRollSfx]);
  const opponentMessageCount = opponent.messages.length;
  useEffect(() => {
    if (opponentMessageCount > 0) playChatSfx();
  }, [opponentMessageCount, playChatSfx]);

  // --- Navigation ---------------------------------------------------------
  const resetGame = () => {
    player.reset();
    replay.reset();
    robot.reset();
    clearNewBest();
    scoreSubmitted.current = false;
  };

  const startSolo = () => {
    resetGame();
    setDifficulty(null);
    setOpponentGame(null);
    setRobotLevel(null);
    setGreeting(null);
    setScreen("solo");
  };

  const startGhost = (tier: DifficultyTier, previous?: RecordedGame | null) => {
    resetGame();
    setDifficulty(tier);
    setOpponentGame(pickGameFromTier(tier, previous));
    setRobotLevel(null);
    setGreeting(getRandomPhrase(phrases.greetings));
    setScreen("vs");
  };

  const startRobot = (level: RobotLevel) => {
    resetGame();
    setDifficulty(null);
    setOpponentGame(null);
    setRobotLevel(level);
    setGreeting(getRandomPhrase(phrases.greetings));
    setScreen("vs");
    // Start fetching the robot's value table now so its first turn isn't delayed.
    loadSolverTable().catch(() => {});
  };

  const restart = () => {
    if (isVs && robotLevel) startRobot(robotLevel);
    else if (isVs && difficulty) startGhost(difficulty, opponentGame);
    else startSolo();
  };

  const backToMenu = () => {
    resetGame();
    setDifficulty(null);
    setOpponentGame(null);
    setRobotLevel(null);
    setGreeting(null);
    setScreen("menu");
  };

  const openRobotMenu = () => {
    setScreen("robot-difficulty");
    loadSolverTable().catch(() => {}); // warm up while the player chooses
  };

  const handleScore = (category: ScoreCategory) => {
    if (!player.canScore || isOpponentTurn) return;
    if (player.scoreSheet[category] !== null) return;
    player.score(category);
    // Turns alternate: as soon as you score, the opponent plays theirs.
    if (isVs) opponent.playTurn();
  };

  // --- What the single dice tray shows -----------------------------------
  const active = isOpponentTurn
    ? { dice: opponent.dice, keepMask: opponent.keepMask, isRolling: opponent.isRolling }
    : { dice: player.dice, keepMask: player.keepMask, isRolling: player.isRolling };

  const chatMessages = useMemo(
    () => (greeting ? [greeting, ...opponent.messages] : opponent.messages),
    [greeting, opponent.messages]
  );

  const allKept = player.keepMask.every((v) => v === 1);
  const rollLabel = isOpponentTurn
    ? "Opponent's turn"
    : !player.dice
    ? "Roll dice"
    : player.rollsRemaining > 0
    ? `Roll again (${player.rollsRemaining} left)`
    : "No rolls left";
  const hint = isOpponentTurn
    ? "Watch their roll…"
    : !player.dice
    ? "Roll to start your turn."
    : player.isRolling
    ? "Rolling…"
    : player.rollsRemaining === 0
    ? "Pick a box to score."
    : allKept
    ? "Release a die to roll again, or pick a box to score."
    : "Tap dice to hold them, or pick a box to score.";

  const opponentTotal = opponent.scoreSheet.total ?? 0;
  const gameOver = isVs ? player.isFinished && opponent.isFinished : player.isFinished;
  const verdict =
    youTotal > opponentTotal ? "You win!" : youTotal < opponentTotal ? "You lose." : "It's a tie.";

  const statusText = isOpponentTurn
    ? "Opponent's turn"
    : player.isFinished
    ? "Game over"
    : `Turn ${player.turnNumber} of ${TURNS_PER_GAME} • Rolls left ${player.rollsRemaining}`;

  const opponentTitle = robotLevel
    ? `${robotLevel.label} robot`
    : difficulty && opponentGame
    ? `${difficulty.label} • ${opponentGame.label}`
    : null;

  return (
    <div className="flex min-h-screen w-full items-center bg-gradient-to-b from-violet-950/[0.9] to-indigo-950/[0.75]">
      <div className="m-auto flex w-full max-w-full flex-col space-y-4 rounded-lg border border-black/[.75] bg-gradient-to-b from-black/[.5] to-black p-4 text-white shadow-2xl md:w-[40rem]">
        {screen === "menu" && (
          <div className="flex flex-col space-y-3 py-4">
            <h1 className="text-center text-2xl font-bold">Robo Dice</h1>
            <button type="button" onClick={startSolo} className={choiceClass}>
              <span className="block text-lg font-bold">Play Solo</span>
              <span className="block text-sm text-white/70">
                Just you and the dice. Chase down your high score!
              </span>
              {highScore.best !== null && (
                <span className="mt-1 block text-sm text-indigo-300">
                  Your best: {highScore.best}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setScreen("difficulty")}
              disabled={TIERS.length === 0}
              className={choiceClass}
            >
              <span className="block text-lg font-bold">Play vs Opponent</span>
              <span className="block text-sm text-white/70">
                Challenge a rival from a game played earlier. Out-roll them to win!
              </span>
            </button>
            <button type="button" onClick={openRobotMenu} className={choiceClass}>
              <span className="block text-lg font-bold">Play vs Robot</span>
              <span className="block text-sm text-white/70">
                A live rival that runs the numbers on every roll. Can you out-think it?
              </span>
            </button>
          </div>
        )}

        {screen === "difficulty" && (
          <div className="flex flex-col space-y-3 py-4">
            <h2 className="text-center text-xl font-bold">Choose your opponent</h2>
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => startGhost(tier)}
                className={choiceClass}
              >
                <span className="block text-lg font-bold">{tier.label}</span>
                <span className="block text-sm text-white/70">{tier.tagline}</span>
                <span className="mt-1 block text-sm text-indigo-300">
                  Averages {tier.averageScore} points
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setScreen("menu")}
              className={`${smallButtonClass} self-center`}
            >
              Back
            </button>
          </div>
        )}

        {screen === "robot-difficulty" && (
          <div className="flex flex-col space-y-3 py-4">
            <h2 className="text-center text-xl font-bold">Choose your robot</h2>
            {ROBOT_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => startRobot(level)}
                className={choiceClass}
              >
                <span className="block text-lg font-bold">{level.label}</span>
                <span className="block text-sm text-white/70">{level.tagline}</span>
                <span className="mt-1 block text-sm text-indigo-300">
                  Averages about {level.averageScore} points
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setScreen("menu")}
              className={`${smallButtonClass} self-center`}
            >
              Back
            </button>
          </div>
        )}

        {(screen === "solo" || screen === "vs") && (
          <>
            <div className="flex items-center justify-between">
              <p aria-live="polite" className="text-sm text-indigo-300">
                {statusText}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={restart} className={smallButtonClass}>
                  Restart
                </button>
                <button type="button" onClick={backToMenu} className={smallButtonClass}>
                  Menu
                </button>
              </div>
            </div>

            {isVs && opponentTitle && (
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                <Bot mood={opponent.mood} />
                <div className="flex w-full flex-1 flex-col space-y-2">
                  <p className="text-sm text-indigo-300">
                    {opponentTitle} • {opponent.turnsCompleted} of {TURNS_PER_GAME} turns played
                  </p>
                  <GameChat messages={chatMessages} />
                </div>
              </div>
            )}

            {robotLevel && robot.error && (
              <div role="alert" className="space-y-2 rounded-md bg-red-900/50 p-3 text-sm">
                <p>The robot couldn&apos;t load its brain ({robot.error}).</p>
                <button type="button" onClick={robot.playTurn} className={smallButtonClass}>
                  Try again
                </button>
              </div>
            )}

            {(!player.isFinished || isOpponentTurn) && (
              <>
                {/* One dice tray, fed by whoever's turn it is. */}
                <div className={`${(active.dice ? "" : "opacity-40")} ${isOpponentTurn ? 'pointer-events-none' : ''}`}>
                  <GameDice
                    dice={active.dice ?? undefined}
                    keepMask={active.keepMask}
                    isRolling={active.isRolling}
                    onKeepToggle={isOpponentTurn ? undefined : player.toggleKeep}
                  />
                </div>
                {!player.isFinished && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={player.roll}
                      disabled={!player.canRoll || isOpponentTurn}
                      className={buttonClass}
                    >
                      {rollLabel}
                    </button>
                    <p className="text-sm text-white/60">{hint}</p>
                  </div>
                )}
              </>
            )}

            <ScoreCard
              player={player.scoreSheet}
              opponent={isVs ? opponent.scoreSheet : undefined}
              potential={player.potentialScores}
              canScore={player.canScore && !isOpponentTurn}
              onScore={handleScore}
            />

            {gameOver && (
              <>
                <div aria-live="polite" className="space-y-2 rounded-md bg-black/40 p-4 text-center">
                  <p className="text-lg font-bold">
                    {isVs ? `${verdict} ${youTotal} to ${opponentTotal}` : `Final score: ${youTotal}`}
                  </p>
                  {highScore.isNewBest ? (
                    <p className="text-indigo-300">New high score!</p>
                  ) : (
                    highScore.best !== null && (
                      <p className="text-sm text-white/60">High score: {highScore.best}</p>
                    )
                  )}
                  <button type="button" onClick={restart} className={buttonClass}>
                    Play again
                  </button>
                </div>
                <RecordPanel turns={player.turns} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
