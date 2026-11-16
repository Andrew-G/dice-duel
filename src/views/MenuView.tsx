import Button from "@/components/Button";
import DiceThemePicker from "@/components/DiceThemePicker";

type MenuViewProps = {
  /** The player's best finished-game score, if any. */
  bestScore: number | null;
  /** False when there are no recorded games to play against. */
  canPlayRecorded: boolean;
  diceId: string;
  onSelectDice: (id: string) => void;
  onPlaySolo: () => void;
  onPlayRecorded: () => void;
  onPlayRobot: () => void;
};

const MenuView = ({
  bestScore,
  canPlayRecorded,
  diceId,
  onSelectDice,
  onPlaySolo,
  onPlayRecorded,
  onPlayRobot,
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

    <DiceThemePicker selectedId={diceId} onSelect={onSelectDice} />
  </div>
);

export default MenuView;
