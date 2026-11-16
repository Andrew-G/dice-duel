import Button from "@/components/Button";

type DifficultyOption = {
  id: string;
  label: string;
  tagline: string;
  averageScore: number;
};

type DifficultyViewProps<T extends DifficultyOption> = {
  title: string;
  options: readonly T[];
  /** Say "about" when the averages are estimates rather than exact. */
  approximate?: boolean;
  onSelect: (option: T) => void;
  onBack: () => void;
};

/** A list of difficulty levels to pick from (recorded opponents or robots). */
function DifficultyView<T extends DifficultyOption>({
  title,
  options,
  approximate = false,
  onSelect,
  onBack,
}: DifficultyViewProps<T>) {
  return (
    <div className="flex flex-col space-y-3 py-4">
      <h2 className="text-center text-xl font-bold">{title}</h2>

      {options.map((option) => (
        <Button
          key={option.id}
          variant="choice"
          onClick={() => onSelect(option)}
        >
          <span className="block text-lg font-bold">{option.label}</span>
          <span className="block text-sm text-white/70">{option.tagline}</span>
          <span className="mt-1 block text-sm text-indigo-300">
            Averages {approximate && "about "}
            {option.averageScore} points
          </span>
        </Button>
      ))}

      <Button variant="small" onClick={onBack} className="self-center">
        Back
      </Button>
    </div>
  );
}

export default DifficultyView;
