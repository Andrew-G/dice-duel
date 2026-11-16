import { diceThemes } from "@/data/dice";
import clsx from "clsx";

/** Fallback pip asset used by themes that do not specify their own. */
const DEFAULT_PIP_SRC = "/img/dice/pip.svg";

/** The picker keeps the same five-pip preview that the old d5.png displayed. */
const PREVIEW_PIP_POSITIONS = new Set([0, 2, 4, 6, 8]);

/** Lets the player choose a dice set from every theme in src/data/dice. */
const DiceThemePicker: React.FC<{
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ selectedId, onSelect }) => (
  <div className="space-y-2">
    <h2 className="text-center text-sm font-bold text-white/70">Dice style</h2>
    <div
      role="radiogroup"
      aria-label="Dice style"
      className="flex flex-wrap justify-center gap-2"
    >
      {diceThemes.map((theme) => {
        const isSelected = theme.id === selectedId;

        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(theme.id)}
            className={clsx(
              "flex w-24 flex-col items-center gap-1.5 rounded-lg border p-2 text-xs",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300",
              isSelected
                ? "border-white/50 bg-white/15"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            {/* A swatch of this theme's body, bevel border and custom five-pip face. */}
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
              <span className="grid h-full w-full grid-cols-3 grid-rows-3 place-items-center">
                {Array.from({ length: 9 }, (_, position) => (
                  <span
                    key={position}
                    className="flex h-full w-full items-center justify-center"
                  >
                    {PREVIEW_PIP_POSITIONS.has(position) && (
                      <img
                        alt=""
                        draggable={false}
                        src={theme.pipSrc ?? DEFAULT_PIP_SRC}
                        className="pointer-events-none object-contain"
                        style={{
                          width: theme.pipSize ?? "70%",
                          height: theme.pipSize ?? "70%",
                          opacity: theme.faceOpacity,
                          filter: theme.faceFilter,
                        }}
                      />
                    )}
                  </span>
                ))}
              </span>
            </span>
            <span>{theme.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default DiceThemePicker;
