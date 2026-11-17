import Button from "@/components/Button";
import DiceThemePicker from "@/components/DiceThemePicker";

type MenuViewProps = {
  /** The player's best finished-game score, if any. */
  bestScore: number | null;
  /** Challenge progress: opponents beaten out of the total. */
  challengeDefeated: number;
  challengeTotal: number;
  diceId: string;
  onSelectDice: (id: string) => void;
  onPlaySolo: () => void;
  onPlayRobot: () => void;
  onPlayChallenge: () => void;
  /** Wipe Challenge progress and its story scenes, to test from the start. */
  onResetChallenge: () => void;
};

const MenuView = ({
  bestScore,
  challengeDefeated,
  challengeTotal,
  diceId,
  onSelectDice,
  onPlaySolo,
  onPlayRobot,
  onPlayChallenge,
  onResetChallenge,
}: MenuViewProps) => (
  <div className="flex flex-col space-y-3 py-4">
    <h1 className="text-center text-2xl font-bold">Dice Duel</h1>

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

    <DiceThemePicker selectedId={diceId} onSelect={onSelectDice} />

    <div className="flex justify-center">
      <Button variant="small" onClick={onResetChallenge}>
        Reset challenge progress (testing)
      </Button>
    </div>
  </div>
);

export default MenuView;
