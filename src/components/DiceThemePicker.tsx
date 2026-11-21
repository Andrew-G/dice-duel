import { DICE_THEMES } from "@/data/dice";
import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";
import DieFace from "./DieFace";

/** The faces shown in a theme's preview: its custom pip, and its circles. */
const PREVIEW_VALUES: readonly Die[] = [1, 5];

type PreviewDieProps = {
  theme: DiceTheme;
  value: Die;
  isKept?: boolean;
};

/**
 * A small die face for a theme tile. Decorative and non-interactive, so it
 * doesn't use `GameDie`: the tile is already a button, and a button can't
 * contain another.
 */
const PreviewDie = ({ theme, value, isKept }: PreviewDieProps) => (
  <span aria-hidden="true" className="block h-10 w-10 shrink-0">
    <DieFace theme={theme} value={value} isKept={isKept} />
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
                <PreviewDie
                  key={value}
                  theme={theme}
                  value={value}
                  isKept={value === 5}
                />
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
