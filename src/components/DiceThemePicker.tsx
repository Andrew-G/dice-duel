import DicePips from "@/components/DicePips";
import { DICE_THEMES } from "@/data/dice";
import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";

/** The faces shown in a theme's preview: its custom pip, and its circles. */
const PREVIEW_VALUES: readonly Die[] = [1, 5];

type PreviewDieProps = {
  theme: DiceTheme;
  value: Die;
};

/** A small die face, drawn the same way as the dice in a game. */
const PreviewDie = ({ theme, value }: PreviewDieProps) => (
  <span
    aria-hidden="true"
    className="flex h-10 w-10 items-center justify-center rounded border-b-2 border-l border-r-2 border-t p-1.5"
    style={{
      backgroundImage: `linear-gradient(to bottom right, ${theme.bgFrom}, ${theme.bgTo})`,
      borderTopColor: theme.borderLight,
      borderLeftColor: theme.borderLight,
      borderBottomColor: theme.borderDark,
      borderRightColor: theme.borderDark,
    }}
  >
    <DicePips theme={theme} value={value} />
  </span>
);

type DiceThemePickerProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

const DiceThemePicker = ({ selectedId, onSelect }: DiceThemePickerProps) => (
  <div className="space-y-2">
    <h3 className="text-center text-sm font-bold text-white/70">Dice style</h3>

    <div
      role="radiogroup"
      aria-label="Dice style"
      className="flex flex-wrap justify-center gap-2"
    >
      {DICE_THEMES.map((theme) => {
        const isSelected = theme.id === selectedId;

        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(theme.id)}
            className={clsx(
              "flex w-28 flex-col items-center gap-1.5 rounded-lg border p-2 text-xs",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300",

              isSelected
                ? "border-white/50 bg-white/15"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <span className="flex gap-1.5">
              {PREVIEW_VALUES.map((value) => (
                <PreviewDie key={value} theme={theme} value={value} />
              ))}
            </span>

            <span>{theme.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default DiceThemePicker;
