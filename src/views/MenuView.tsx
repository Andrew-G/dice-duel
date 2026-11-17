import Button from "@/components/Button";
import DiceThemePicker from "@/components/DiceThemePicker";

type MenuViewProps = {
  /** The player's best finished-game score, if any. */
  bestScore: number | null;
  /** False when there are no recorded games to play against. */
  canPlayRecorded: boolean;
  /** Challenge progress: opponents beaten out of the total. */
  challengeDefeated: number;
  challengeTotal: number;
  diceId: string;
  onSelectDice: (id: string) => void;
  onPlaySolo: () => void;
  onPlayRecorded: () => void;
  onPlayRobot: () => void;
  onPlayChallenge: () => void;
};

const MenuView = ({
  bestScore,
  canPlayRecorded,
  challengeDefeated,
  challengeTotal,
  diceId,
  onSelectDice,
  onPlaySolo,
  onPlayRecorded,
  onPlayRobot,
  onPlayChallenge,
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

    <Button
      variant="choice"
      onClick={onPlayRecorded}
      disabled={!canPlayRecorded}
    >
      <span className="block text-lg font-bold">Play vs Opponent</span>
      <span className="block text-sm text-white/70">
        Challenge a rival from a game played earlier. Out-roll them to win!
      </span>
    </Button>

    <Button variant="choice" onClick={onPlayRobot}>
      <span className="block text-lg font-bold">Play vs Robot</span>
      <span className="block text-sm text-white/70">
        A live rival that runs the numbers on every roll. Can you out-think it?
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
  </div>
);

export default MenuView;
