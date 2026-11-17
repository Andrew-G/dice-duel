"use client";

import { useRef, useState } from "react";
import { recordedGames } from "@/data/games";
import { CHALLENGE_ORDER, robotCharacter } from "@/data/opponent/challenge";
import {
  buildDifficultyTiers,
  pickGameFromTier,
  type DifficultyTier,
} from "@/engine/difficulty";
import { ROBOT_LEVELS, type RobotLevel } from "@/engine/solver/levels";
import { loadSolverTable } from "@/engine/solver/table";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useDiceTheme } from "@/hooks/useDiceTheme";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHighScore } from "@/hooks/useHighScore";
import type { Matchup } from "@/types/Matchup";
import type { RecordedGame } from "@/types/Recording";
import ChallengeView from "./ChallengeView";
import DifficultyView from "./DifficultyView";
import GameView from "./GameView";
import MenuView from "./MenuView";

type Screen =
  | { name: "menu" }
  | { name: "recordedSelect" }
  | { name: "robotSelect" }
  | { name: "challenge" }
  /** `round` changes for every new game, which remounts the game view. */
  | { name: "game"; matchup: Matchup; round: number };

const TIERS = buildDifficultyTiers(recordedGames);

/** Start fetching the robot's value table early so its first turn isn't delayed. */
const warmUpRobot = () => {
  loadSolverTable().catch(() => {});
};

/**
 * The whole app: owns navigation between screens and the settings that outlive
 * a single game (dice style, high score, sounds).
 */
const DiceDuel = () => {
  const [screen, setScreen] = useState<Screen>({ name: "menu" });
  const round = useRef(0);

  const diceTheme = useDiceTheme();
  const highScore = useHighScore();
  const sounds = useGameSounds();
  const challenge = useChallengeProgress();
  const { clearNewBest } = highScore;

  const startGame = (matchup: Matchup) => {
    clearNewBest();
    round.current += 1;
    setScreen({ name: "game", matchup, round: round.current });
  };

  const playSolo = () => startGame({ kind: "solo" });

  const playRecorded = (tier: DifficultyTier, previous?: RecordedGame) =>
    startGame({
      kind: "recorded",
      tier,
      game: pickGameFromTier(tier, previous),
    });

  const playRobot = (level: RobotLevel) => {
    warmUpRobot();
    // Robot games are always against Ratchet, at the chosen skill.
    startGame({ kind: "robot", level, character: robotCharacter(level) });
  };

  const playChallenge = (stage: number) => {
    warmUpRobot();
    startGame({
      kind: "challenge",
      character: CHALLENGE_ORDER[stage],
      stage,
    });
  };

  /** Same kind of game again (a recorded opponent picks a different game). */
  const restart = (matchup: Matchup) => {
    switch (matchup.kind) {
      case "solo":
        return playSolo();
      case "recorded":
        return playRecorded(matchup.tier, matchup.game);
      case "robot":
        return playRobot(matchup.level);
      case "challenge":
        return playChallenge(matchup.stage);
    }
  };

  const showMenu = () => setScreen({ name: "menu" });

  const showRobotSelect = () => {
    warmUpRobot(); // warm up while the player chooses
    setScreen({ name: "robotSelect" });
  };

  const showChallenge = () => {
    warmUpRobot(); // warm up while the player reads who's next
    setScreen({ name: "challenge" });
  };

  return (
    <main className="flex min-h-screen w-full items-center bg-gradient-to-b from-violet-950/[0.9] to-indigo-950/[0.75]">
      <div className="m-auto flex w-full max-w-full flex-col space-y-4 rounded-lg border border-black/[.75] bg-gradient-to-b from-black/[.5] to-black p-4 text-white shadow-2xl md:w-[40rem]">
        {screen.name === "menu" && (
          <MenuView
            bestScore={highScore.best}
            canPlayRecorded={TIERS.length > 0}
            challengeDefeated={challenge.defeated}
            challengeTotal={challenge.total}
            diceId={diceTheme.diceId}
            onSelectDice={diceTheme.select}
            onPlaySolo={playSolo}
            onPlayRecorded={() => setScreen({ name: "recordedSelect" })}
            onPlayRobot={showRobotSelect}
            onPlayChallenge={showChallenge}
          />
        )}

        {screen.name === "recordedSelect" && (
          <DifficultyView
            title="Choose your opponent"
            options={TIERS}
            onSelect={(tier) => playRecorded(tier)}
            onBack={showMenu}
          />
        )}

        {screen.name === "robotSelect" && (
          <DifficultyView
            title="Choose your robot"
            options={ROBOT_LEVELS}
            approximate
            onSelect={playRobot}
            onBack={showMenu}
          />
        )}

        {screen.name === "challenge" && (
          <ChallengeView
            defeated={challenge.defeated}
            onStart={playChallenge}
            onReset={challenge.reset}
            onBack={showMenu}
          />
        )}

        {screen.name === "game" && (
          <GameView
            key={screen.round}
            matchup={screen.matchup}
            diceId={diceTheme.diceId}
            highScore={highScore}
            sounds={sounds}
            onRestart={() => restart(screen.matchup)}
            onMenu={showMenu}
            onChallengeContinue={showChallenge}
            onGameEnd={(outcome) => {
              // Only a win unlocks the next opponent.
              if (screen.matchup.kind === "challenge" && outcome === "win") {
                challenge.recordWin(screen.matchup.stage);
              }
            }}
          />
        )}
      </div>
    </main>
  );
};

export default DiceDuel;
