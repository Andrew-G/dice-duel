
import { DICE_THEMES } from "@/data/dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";

const DEFAULT_PIP_SRC = "/img/dice/pip.svg";
const DEFAULT_PIP_COLOR = "#111827";

const PIP_STYLE_FILTERS = {
  flat: "",

  embossed:
    "drop-shadow(-1px -1px 0.75px rgba(255,255,255,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(0,0,0,0.6))",

  debossed:
    "drop-shadow(-1px -1px 1px rgba(0,0,0,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(255,255,255,0.55))",
} as const;

const getPipFilter = (
  theme: Pick<DiceTheme, "faceFilter" | "pipStyle">
) =>
  [
    theme.faceFilter,
    PIP_STYLE_FILTERS[theme.pipStyle ?? "flat"],
  ]
    .filter(Boolean)
    .join(" ") || undefined;

/** Five-pip preview layout. */
const PREVIEW_PIP_POSITIONS = new Set([0, 2, 4, 6, 8]);

const DiceThemePicker: React.FC<{
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ selectedId, onSelect }) => (
  <div className="space-y-2">
    <h2 className="text-center text-sm font-bold text-white/70">
      Dice style
    </h2>

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
              "flex w-24 flex-col items-center gap-1.5 rounded-lg border p-2 text-xs",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300",

              isSelected
                ? "border-white/50 bg-white/15"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            {/* Theme preview die. */}
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
                      <span
                        aria-hidden="true"
                        className="pointer-events-none"
                        style={{
                          display: "block",

                          width: theme.pipSize ?? "70%",
                          height: theme.pipSize ?? "70%",

                          backgroundColor:
                            theme.pipColor ?? DEFAULT_PIP_COLOR,

                          opacity: theme.faceOpacity,

                          // Match the actual dice pip treatment.
                          filter: getPipFilter(theme),

                          maskImage: `url("${
                            theme.pipSrc ?? DEFAULT_PIP_SRC
                          }")`,
                          WebkitMaskImage: `url("${
                            theme.pipSrc ?? DEFAULT_PIP_SRC
                          }")`,

                          maskRepeat: "no-repeat",
                          WebkitMaskRepeat: "no-repeat",

                          maskPosition: "center",
                          WebkitMaskPosition: "center",

                          maskSize: "contain",
                          WebkitMaskSize: "contain",
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