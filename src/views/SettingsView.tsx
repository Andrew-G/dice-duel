import Button from "@/components/Button";
import DiceThemePicker from "@/components/DiceThemePicker";

type SettingsViewProps = {
  diceId: string;
  onSelectDice: (id: string) => void;
  /** Wipe Challenge progress and its story scenes, to test from the start. */
  onResetChallenge: () => void;
  onBack: () => void;
};

/** Settings that outlive a single game. */
const SettingsView = ({
  diceId,
  onSelectDice,
  onResetChallenge,
  onBack,
}: SettingsViewProps) => (
  <div className="flex flex-col space-y-6 py-4">
    <h2 className="text-center text-xl font-bold">Settings</h2>

    <DiceThemePicker selectedId={diceId} onSelect={onSelectDice} />

    <div className="flex justify-center">
      <Button variant="small" onClick={onResetChallenge}>
        Reset challenge progress (testing)
      </Button>
    </div>

    <Button variant="small" onClick={onBack} className="self-center">
      Back
    </Button>
  </div>
);

export default SettingsView;
