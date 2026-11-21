"use client";

import { useCallback, useRef, useState } from "react";
import {
  CHALLENGE_HOST,
  CHALLENGE_ORDER,
  availableRobots,
} from "@/data/opponent/challenge";
import { scene } from "@/data/scene";
import { loadSolverTable } from "@/engine/solver/table";
import type { GameOutcome } from "@/hooks/useGameSession";
import { useAchievements } from "@/hooks/useAchievements";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useDiceTheme } from "@/hooks/useDiceTheme";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHighScore } from "@/hooks/useHighScore";
import type { Character } from "@/types/Character";
import type { Matchup } from "@/types/Matchup";
import type { SceneMessage } from "@/types/Scene";
import AchievementToasts from "@/components/AchievementToasts";
import FadeOverlay from "@/components/FadeOverlay";
import AchievementsView from "./AchievementsView";
import ChallengeView from "./ChallengeView";
import GameView from "./GameView";
import MenuView from "./MenuView";
import RobotSelectView from "./RobotSelectView";
import SceneView from "./SceneView";
import SettingsView from "./SettingsView";

type Screen =
  | { name: "menu" }
  | { name: "robotSelect" }
  | { name: "challenge" }
  | { name: "settings" }
  | { name: "achievements" }
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

/** How long a fade to or from black takes. */
const FADE_MS = 500;

/**
 * The black cover between screens: fading in over the old screen, then (if the
 * new one needs to load) waiting with a spinner, then fading back out.
 */
type Cover = "none" | "fadingIn" | "loading";

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
  const [cover, setCover] = useState<Cover>("none");
  const round = useRef(0);

  const diceTheme = useDiceTheme();
  const highScore = useHighScore();
  const sounds = useGameSounds();
  const challenge = useChallengeProgress();
  const achievements = useAchievements(challenge.defeated);
  const { clearNewBest } = highScore;

  const startGame = (matchup: Matchup) => {
    clearNewBest();
    round.current += 1;
    setScreen({ name: "game", matchup, round: round.current });
  };

  const playSolo = () => startGame({ kind: "solo" });

  const playRobot = (character: Character) => {
    warmUpRobot();
    startGame({ kind: "robot", character });
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

  /** Same kind of game again, against the same opponent. */
  const restart = (matchup: Matchup) => {
    switch (matchup.kind) {
      case "solo":
        return playSolo();
      case "robot":
        return playRobot(matchup.character);
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

  const showSettings = () => setScreen({ name: "settings" });

  const showAchievements = () => setScreen({ name: "achievements" });

  /** Lift the black cover once the scene underneath has loaded. */
  const revealScene = useCallback(() => setCover("none"), []);

  /**
   * From the menu: the very first visit starts with the opening scene. The
   * screen fades to black first, then the scene loads behind the black (with a
   * spinner until its portrait is ready) and fades in.
   */
  const openChallenge = () => {
    if (challenge.introSeen) return showChallengeHub();
    setCover("fadingIn");
    window.setTimeout(() => {
      setCover("loading");
      playScene(scene.challenge.introduction, CHALLENGE_HOST, () => {
        challenge.markIntroSeen();
        showChallengeHub();
      });
    }, FADE_MS);
  };

  return (
    <main className="flex min-h-screen w-full items-center bg-linear-to-b from-violet-950/90 to-indigo-950/75">
      <div className="m-auto flex w-full max-w-full flex-col space-y-4 rounded-lg border border-black/75 bg-linear-to-b from-black/50 to-black p-4 text-white shadow-2xl md:w-160">
        {screen.name === "menu" && (
          <MenuView
            bestScore={highScore.best}
            challengeDefeated={challenge.defeated}
            challengeTotal={challenge.total}
            onPlaySolo={playSolo}
            onPlayRobot={showRobotSelect}
            onPlayChallenge={openChallenge}
            onOpenSettings={showSettings}
            onOpenAchievements={showAchievements}
          />
        )}

        {screen.name === "achievements" && (
          <AchievementsView
            unlocked={achievements.unlocked}
            stats={achievements.stats}
            challengeDefeated={challenge.defeated}
            onBack={showMenu}
          />
        )}

        {screen.name === "settings" && (
          <SettingsView
            diceId={diceTheme.diceId}
            onSelectDice={diceTheme.select}
            onResetChallenge={challenge.reset}
            onResetAchievements={achievements.reset}
            onBack={showMenu}
          />
        )}

        {screen.name === "robotSelect" && (
          <RobotSelectView
            robots={availableRobots(challenge.defeated)}
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
            onReady={revealScene}
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
            onProgress={achievements.report}
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

      <AchievementToasts
        ids={achievements.toastIds}
        onDismiss={achievements.dismissToast}
      />

      <FadeOverlay
        isVisible={cover !== "none"}
        isLoading={cover === "loading"}
        durationMs={FADE_MS}
      />
    </main>
  );
};

export default DiceDuel;
