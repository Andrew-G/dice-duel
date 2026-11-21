import Button from "@/components/Button";
import DiceThemePicker from "@/components/DiceThemePicker";

type SettingsViewProps = {
  diceId: string;
  onSelectDice: (id: string) => void;
  /** Wipe Challenge progress and its story scenes, to test from the start. */
  onResetChallenge: () => void;
  /** Lock every achievement again and zero the stats, to test from scratch. */
  onResetAchievements: () => void;
  onBack: () => void;
};

/** Settings that outlive a single game. */
const SettingsView = ({
  diceId,
  onSelectDice,
  onResetChallenge,
  onResetAchievements,
  onBack,
}: SettingsViewProps) => (
  <div className="flex flex-col space-y-6 py-4">
    <h2 className="text-center text-xl font-bold">Settings</h2>

    <DiceThemePicker selectedId={diceId} onSelect={onSelectDice} />

    <div className="flex flex-col items-center gap-2">
      <Button variant="small" onClick={onResetChallenge}>
        Reset challenge progress (testing)
      </Button>
      <Button
        variant="small"
        onClick={() => {
          if (window.confirm("Lock all achievements again and reset your stats?")) {
            onResetAchievements();
          }
        }}
      >
        Reset achievements (testing)
      </Button>
    </div>

    <Button variant="small" onClick={onBack} className="self-center">
      Back
    </Button>
  </div>
);

export default SettingsView;
