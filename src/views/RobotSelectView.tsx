import Button from "@/components/Button";
import { CHALLENGE_ORDER } from "@/data/opponent/challenge";
import type { Character } from "@/types/Character";

type RobotSelectViewProps = {
  /** The robots to choose from: those beaten in Challenge, plus Ratchet. */
  robots: readonly Character[];
  onSelect: (character: Character) => void;
  onBack: () => void;
};

/** Pick which robot to play against. */
const RobotSelectView = ({
  robots,
  onSelect,
  onBack,
}: RobotSelectViewProps) => (
  <div className="flex flex-col space-y-3 py-4">
    <h2 className="text-center text-xl font-bold">Choose your opponent</h2>

    {robots.map((character) => (
      <Button
        key={character.id}
        variant="choice"
        onClick={() => onSelect(character)}
        className="flex items-center gap-4"
      >
        <img
          src={character.avatarSrc}
          alt=""
          className="h-16 w-16 shrink-0 object-contain"
        />
        <span>
          <span className="block text-lg font-bold">{character.name}</span>
          <span className="block text-sm text-white/70">{character.brief}</span>
        </span>
      </Button>
    ))}

    {robots.length < CHALLENGE_ORDER.length && (
      <p className="text-center text-sm text-white/60">
        Beat rival robots in Challenge mode to unlock more opponents.
      </p>
    )}

    <Button variant="small" onClick={onBack} className="self-center">
      Back
    </Button>
  </div>
);

export default RobotSelectView;
