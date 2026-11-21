import {
  faArrowTrendUp,
  faBolt,
  faBullseye,
  faCrown,
  faDiceFive,
  faDiceSix,
  faFlagCheckered,
  faGamepad,
  faMedal,
  faRankingStar,
  faRobot,
  faStairs,
  faStar,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";
import { isYahtzee } from "@/engine/score";
import type {
  Achievement,
  AchievementCategory,
  AchievementContext,
  GameSnapshot,
} from "@/types/Achievement";
import type { RecordedTurn } from "@/types/Recording";

const CHALLENGE_TOTAL = CHALLENGE_ORDER.length;
const CHALLENGE_HALF = Math.ceil(CHALLENGE_TOTAL / 2);

/** An achievement that is earned by something that happened in a game. */
const inGame =
  (check: (game: GameSnapshot) => boolean) =>
  ({ game }: AchievementContext) =>
    game !== null && check(game);

/** Same, but only once the game has finished. */
const onceFinished = (check: (game: GameSnapshot) => boolean) =>
  inGame((game) => game.isComplete && check(game));

const finalTotal = (game: GameSnapshot) => game.playerSheet.total ?? 0;

/** Your total minus the opponent's, once there is an opponent. */
const margin = (game: GameSnapshot) =>
  game.opponentSheet ? finalTotal(game) - (game.opponentSheet.total ?? 0) : null;

/** The dice a turn was scored with. */
const finalRoll = (turn: RecordedTurn) => turn.rolls[turn.rolls.length - 1];

/** Order here is the order on the achievements screen. */
export const ACHIEVEMENTS: readonly Achievement[] = [
  // --- Dice -----------------------------------------------------------------
  {
    id: "yahtzee",
    title: "Yahtzee!",
    description: "Roll five of a kind.",
    category: "dice",
    icon: faDiceFive,
    isEarned: inGame((game) =>
      game.turns.some((turn) => isYahtzee(finalRoll(turn)))
    ),
  },
  {
    id: "bonusYahtzee",
    title: "Bonus Yahtzee",
    description: "Roll another Yahtzee after scoring 50 and earn the 100 point bonus.",
    category: "dice",
    icon: faBolt,
    isEarned: inGame((game) => (game.playerSheet.lowerBonus ?? 0) > 0),
  },
  {
    id: "firstRollYahtzee",
    title: "One-Roll Wonder",
    description: "Roll a Yahtzee on the first roll of a turn.",
    category: "dice",
    icon: faBullseye,
    isEarned: inGame((game) =>
      game.turns.some((turn) => isYahtzee(turn.rolls[0]))
    ),
  },
  {
    id: "largeStraight",
    title: "Straight Shooter",
    description: "Score a large straight.",
    category: "dice",
    icon: faArrowTrendUp,
    isEarned: inGame((game) =>
      game.turns.some(
        (turn) => turn.category === "largeStraight" && turn.score > 0
      )
    ),
  },
  {
    id: "upperBonus",
    title: "Upper Crust",
    description: "Earn the 35 point upper section bonus.",
    category: "dice",
    icon: faStairs,
    isEarned: inGame((game) => game.playerSheet.upperBonusEarned),
  },

  // --- Scores ---------------------------------------------------------------
  {
    id: "firstGame",
    title: "Rookie Roller",
    description: "Finish your first game.",
    category: "scores",
    icon: faGamepad,
    isEarned: onceFinished(() => true),
  },
  {
    id: "score200",
    title: "Solid Score",
    description: "Finish a game with 200 points or more.",
    category: "scores",
    icon: faMedal,
    isEarned: onceFinished((game) => finalTotal(game) >= 200),
  },
  {
    id: "score300",
    title: "High Roller",
    description: "Finish a game with 300 points or more.",
    category: "scores",
    icon: faDiceSix,
    isEarned: onceFinished((game) => finalTotal(game) >= 300),
  },

  // --- Battles --------------------------------------------------------------
  {
    id: "firstWin",
    title: "First Victory",
    description: "Beat a robot in a versus game.",
    category: "battles",
    icon: faRobot,
    isEarned: onceFinished((game) => game.outcome === "win"),
  },
  {
    id: "quickDraw",
    title: "Quick Draw",
    description: "Win a Quick Battle.",
    category: "battles",
    icon: faStar,
    isEarned: onceFinished(
      (game) => game.mode === "robot" && game.outcome === "win"
    ),
  },
  {
    id: "dominator",
    title: "Total Domination",
    description: "Win a game by 50 points or more.",
    category: "battles",
    icon: faCrown,
    isEarned: onceFinished(
      (game) => game.outcome === "win" && (margin(game) ?? 0) >= 50
    ),
  },
  {
    id: "photoFinish",
    title: "Photo Finish",
    description: "Win a game by 5 points or fewer.",
    category: "battles",
    icon: faFlagCheckered,
    isEarned: onceFinished(
      (game) =>
        game.outcome === "win" && (margin(game) ?? Infinity) <= 5
    ),
  },
  {
    id: "ladder",
    title: "Climbing the Ladder",
    description: `Beat ${CHALLENGE_HALF} opponents in Challenge mode.`,
    category: "battles",
    icon: faRankingStar,
    isEarned: ({ challengeDefeated }) => challengeDefeated >= CHALLENGE_HALF,
    progress: ({ challengeDefeated }) => ({
      current: Math.min(challengeDefeated, CHALLENGE_HALF),
      target: CHALLENGE_HALF,
    }),
  },
  {
    id: "champion",
    title: "Champion",
    description: "Beat every opponent in Challenge mode.",
    category: "battles",
    icon: faTrophy,
    isEarned: ({ challengeDefeated }) => challengeDefeated >= CHALLENGE_TOTAL,
    progress: ({ challengeDefeated }) => ({
      current: Math.min(challengeDefeated, CHALLENGE_TOTAL),
      target: CHALLENGE_TOTAL,
    }),
  },

  // --- Milestones -----------------------------------------------------------
  {
    id: "regular",
    title: "Regular",
    description: "Finish 10 games.",
    category: "milestones",
    icon: faGamepad,
    isEarned: ({ stats }) => stats.gamesCompleted >= 10,
    progress: ({ stats }) => ({
      current: Math.min(stats.gamesCompleted, 10),
      target: 10,
    }),
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Finish 50 games.",
    category: "milestones",
    icon: faMedal,
    isEarned: ({ stats }) => stats.gamesCompleted >= 50,
    progress: ({ stats }) => ({
      current: Math.min(stats.gamesCompleted, 50),
      target: 50,
    }),
  },
  {
    id: "serialWinner",
    title: "Serial Winner",
    description: "Win 10 versus games.",
    category: "milestones",
    icon: faTrophy,
    isEarned: ({ stats }) => stats.versusWins >= 10,
    progress: ({ stats }) => ({
      current: Math.min(stats.versusWins, 10),
      target: 10,
    }),
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> =
  Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const ACHIEVEMENT_CATEGORIES: {
  id: AchievementCategory;
  label: string;
}[] = [
  { id: "dice", label: "Dice" },
  { id: "scores", label: "Scores" },
  { id: "battles", label: "Battles" },
  { id: "milestones", label: "Milestones" },
];
