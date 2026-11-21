import { faGear, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/Button";

type MenuViewProps = {
  /** The player's best finished-game score, if any. */
  bestScore: number | null;
  /** Challenge progress: opponents beaten out of the total. */
  challengeDefeated: number;
  challengeTotal: number;
  onPlaySolo: () => void;
  onPlayRobot: () => void;
  onPlayChallenge: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
};

const MenuView = ({
  bestScore,
  challengeDefeated,
  challengeTotal,
  onPlaySolo,
  onPlayRobot,
  onPlayChallenge,
  onOpenSettings,
  onOpenAchievements,
}: MenuViewProps) => (
  <div className="flex flex-col space-y-3 py-4">
    <header>
      <h1 className="text-center text-2xl font-bold">Dice Duel</h1>

      {/* Pinned to the window's top right corner. */}
      <div className="fixed right-4 top-4 z-10 flex gap-2">
        <Button
          variant="icon"
          aria-label="Achievements"
          title="Achievements"
          onClick={onOpenAchievements}
        >
          <FontAwesomeIcon icon={faTrophy} />
        </Button>
        <Button
          variant="icon"
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
        >
          <FontAwesomeIcon icon={faGear} />
        </Button>
      </div>
    </header>

    <Button variant="choice" onClick={onPlaySolo}>
      <span className="block text-lg font-bold">Play Solo</span>
      <span className="block text-sm text-white/70">
        Just you and the dice. Chase down your high score!
      </span>
      {bestScore !== null && (
        <span className="mt-1 block text-sm text-indigo-300">
          Your best: {bestScore}
        </span>
      )}
    </Button>

    <Button variant="choice" onClick={onPlayRobot}>
      <span className="block text-lg font-bold">Quick Battle</span>
      <span className="block text-sm text-white/70">
        Battle against a rival robot.
      </span>
    </Button>

    <Button variant="choice" onClick={onPlayChallenge}>
      <span className="block text-lg font-bold">Challenge</span>
      <span className="block text-sm text-white/70">
        Take on a ladder of rival droids, easiest to hardest. Beat each one to
        unlock the next.
      </span>
      <span className="mt-1 block text-sm text-indigo-300">
        {challengeDefeated >= challengeTotal
          ? `Complete: all ${challengeTotal} opponents beaten`
          : challengeDefeated > 0
            ? `Beaten ${challengeDefeated} of ${challengeTotal}`
            : `${challengeTotal} opponents to beat`}
      </span>
    </Button>
  </div>
);

export default MenuView;
