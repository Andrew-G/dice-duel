"use client";

import { useRef, useState } from "react";
import { recordedGames } from "@/data/games";
import {
  CHALLENGE_HOST,
  CHALLENGE_ORDER,
  robotCharacter,
} from "@/data/opponent/challenge";
import { scene } from "@/data/scene";
import {
  buildDifficultyTiers,
  pickGameFromTier,
  type DifficultyTier,
} from "@/engine/difficulty";
import { ROBOT_LEVELS, type RobotLevel } from "@/engine/solver/levels";
import { loadSolverTable } from "@/engine/solver/table";
import type { GameOutcome } from "@/hooks/useGameSession";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useDiceTheme } from "@/hooks/useDiceTheme";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHighScore } from "@/hooks/useHighScore";
import type { Character } from "@/types/Character";
import type { Matchup } from "@/types/Matchup";
import type { RecordedGame } from "@/types/Recording";
import type { SceneMessage } from "@/types/Scene";
import ChallengeView from "./ChallengeView";
import DifficultyView from "./DifficultyView";
import GameView from "./GameView";
import MenuView from "./MenuView";
import SceneView from "./SceneView";

type Screen =
  | { name: "menu" }
  | { name: "recordedSelect" }
  | { name: "robotSelect" }
  | { name: "challenge" }
  /** A story scene; `onDone` decides where the player goes once it's over. */
  | {
      name: "scene";
      messages: SceneMessage[];
      character: Character;
      onDone: () => void;
      round: number;
    }
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

  /** Start the match itself, with no scene first (also used for rematches). */
  const playChallenge = (stage: number) => {
    warmUpRobot();
    startGame({
      kind: "challenge",
      character: CHALLENGE_ORDER[stage],
      stage,
    });
  };

  const playScene = (
    messages: SceneMessage[],
    character: Character,
    onDone: () => void
  ) => {
    round.current += 1; // a new scene remounts the scene view
    setScreen({
      name: "scene",
      messages,
      character,
      onDone,
      round: round.current,
    });
  };

  /** Before facing a character, they introduce themselves. */
  const startChallengeFight = (stage: number) => {
    warmUpRobot();
    const character = CHALLENGE_ORDER[stage];
    playScene(scene.challenge[character.id].introduction, character, () =>
      playChallenge(stage)
    );
  };

  /**
   * After a Challenge match, the character reacts to the result. A loss (or
   * a tie) leads straight into a rematch; a win goes back to the ladder, via
   * the Challenge's ending if that was the last opponent.
   */
  const finishChallengeGame = (stage: number, outcome: GameOutcome) => {
    const character = CHALLENGE_ORDER[stage];
    const scenes = scene.challenge[character.id];

    if (outcome !== "win") {
      return playScene(scenes.failure, character, () => playChallenge(stage));
    }

    playScene(scenes.success, character, () => {
      const wonEverything = stage === CHALLENGE_ORDER.length - 1;
      if (wonEverything && !challenge.completeSeen) {
        playScene(scene.challenge.complete, CHALLENGE_HOST, () => {
          challenge.markCompleteSeen();
          showChallengeHub();
        });
      } else {
        showChallengeHub();
      }
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

  const showChallengeHub = () => {
    warmUpRobot(); // warm up while the player reads who's next
    setScreen({ name: "challenge" });
  };

  /** From the menu: the very first visit starts with the opening scene. */
  const openChallenge = () => {
    if (challenge.introSeen) return showChallengeHub();
    playScene(scene.challenge.introduction, CHALLENGE_HOST, () => {
      challenge.markIntroSeen();
      showChallengeHub();
    });
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
            onPlayChallenge={openChallenge}
            onResetChallenge={challenge.reset}
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
            onStart={startChallengeFight}
            onReset={challenge.reset}
            onBack={showMenu}
          />
        )}

        {screen.name === "scene" && (
          <SceneView
            key={screen.round}
            messages={screen.messages}
            character={screen.character}
            onComplete={screen.onDone}
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
            onChallengeContinue={(outcome) => {
              if (screen.matchup.kind === "challenge") {
                finishChallengeGame(screen.matchup.stage, outcome);
              }
            }}
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
