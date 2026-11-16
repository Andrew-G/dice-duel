import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import { useDiceWave } from "@/hooks/useDiceWave";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";
import { useEffect, useState, type CSSProperties } from "react";

const DEFAULT_PIP_SRC = "/img/dice/pip.svg";
const DEFAULT_PIP_COLOR = "#111827";

/**
 * Pip visual treatments.
 *
 * Assumes the light source comes from the top-left.
 */
const PIP_STYLE_FILTERS = {
  flat: "",

  // Raised: light upper-left, dark lower-right.
  embossed:
    "drop-shadow(-1px -1px 0.75px rgba(255,255,255,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(0,0,0,0.6))",

  // Recessed: dark upper-left, light lower-right.
  debossed:
    "drop-shadow(-1px -1px 1px rgba(0,0,0,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(255,255,255,0.55))",
} as const;

/**
 * Combines the optional theme filter with the pip style.
 */
const getPipFilter = (theme: DiceTheme) =>
  [theme.faceFilter, PIP_STYLE_FILTERS[theme.pipStyle ?? "flat"]]
    .filter(Boolean)
    .join(" ") || undefined;

/**
 * Pip positions in a 3x3 grid:
 *
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
const PIP_POSITIONS: Record<Die, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Expose theme values as CSS variables.
 */
const themeVars = (theme: DiceTheme) =>
  ({
    "--die-bg-from": theme.bgFrom,
    "--die-bg-to": theme.bgTo,
    "--die-border-light": theme.borderLight,
    "--die-border-dark": theme.borderDark,
    "--die-highlight-primary": theme.highlightPrimary,
    "--die-highlight-secondary": theme.highlightSecondary,
    "--die-shadow": theme.shadowColor,
    "--die-pip-size": theme.pipSize ?? "70%",
  }) as CSSProperties;

type GameDiceProps = {
  dice?: Dice;
  keepMask: KeepMask;
  diceId?: string;
  isRolling?: boolean;
  isWaiting?: boolean;
  onKeepToggle?: (index: number) => void;
};

const GameDice = ({
  dice,
  keepMask,
  diceId = DEFAULT_DICE_ID,
  isRolling,
  isWaiting,
  onKeepToggle,
}: GameDiceProps) => {
  const theme = getDiceTheme(diceId);
  const wavePositions = useDiceWave(!!isWaiting);

  const [diceRollPositions, setDiceRollPositions] = useState<number[][]>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  const [diceRollValues, setDiceRollValues] = useState<number[]>([
    1, 1, 1, 1, 1,
  ]);

  const getRandomArray = () =>
    Array.from({ length: 5 }, () => [
      Math.floor(Math.random() * 3) - 1,
      Math.floor(Math.random() * 3) - 1,
    ]);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDiceRollPositions(getRandomArray());

        const newRollValues = Array.from(
          { length: 5 },
          () => Math.floor(Math.random() * 6) + 1
        ).map((die, index) =>
          keepMask?.[index] === 1 ? die : Math.floor(Math.random() * 6) + 1
        );

        setDiceRollValues(newRollValues);
      }, 100);

      return () => {
        setDiceRollPositions([
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ]);

        clearInterval(interval);
      };
    }
  }, [isRolling, dice, keepMask]);

  return (
    <div
      className="w-full flex flex-row items-center gap-2 justify-center"
      style={themeVars(theme)}
    >
      {(dice || [null, null, null, null, null]).map((d, i) => {
        const isKept = !!keepMask[i];
        const isShaking = isRolling && !isKept;

        const faceValue = (isShaking ? diceRollValues[i] : (d ?? 1)) as Die;

        const activePips = PIP_POSITIONS[faceValue] ?? PIP_POSITIONS[1];

        return (
          <div
            key={i}
            className="relative h-10 w-10 shrink-0 transition-transform duration-100"
            style={
              isShaking
                ? {
                    transform: `translate(${diceRollPositions[i][0]}px, ${
                      diceRollPositions[i][1]
                    }px) rotate(${diceRollPositions[i][0] * 5}deg)`,
                  }
                : isWaiting
                  ? {
                      transform: `translate(0px, ${wavePositions[i][1]}px)`,
                    }
                  : undefined
            }
          >
            <button
              type="button"
              aria-pressed={isKept}
              aria-label={`${isKept ? "Unkeep" : "Keep"} die ${
                i + 1
              }, showing ${faceValue}`}
              className={clsx(
                "absolute inset-0 m-0 flex items-center justify-center rounded p-1.5 font-bold text-white",
                "transition-all duration-150",
                "hover:-inset-0.5 hover:z-10",

                "bg-gradient-to-br from-[color:var(--die-bg-from)] to-[color:var(--die-bg-to)]",

                "[box-shadow:2px_2px_6px_var(--die-shadow)]",
                "hover:[box-shadow:4px_6px_12px_var(--die-shadow)]",

                isKept
                  ? "border-2 border-[color:var(--die-highlight-primary)] motion-safe:animate-die-throb"
                  : "border-l border-t border-b-2 border-r-2 " +
                      "border-l-[color:var(--die-border-light)] border-t-[color:var(--die-border-light)] " +
                      "border-b-[color:var(--die-border-dark)] border-r-[color:var(--die-border-dark)]"
              )}
              onClick={() => onKeepToggle?.(i)}
            >
              {/* 3x3 grid of theme-controlled pip silhouettes. */}
              <span
                aria-hidden="true"
                className="grid h-full w-full grid-cols-3 grid-rows-3 place-items-center pointer-events-none"
              >
                {Array.from({ length: 9 }, (_, position) => (
                  <span
                    key={position}
                    className="flex h-full w-full items-center justify-center"
                  >
                    {activePips.includes(position) && (
                      <span
                        aria-hidden="true"
                        className="h-[var(--die-pip-size)] w-[var(--die-pip-size)]"
                        style={{
                          display: "block",

                          backgroundColor: theme.pipColor ?? DEFAULT_PIP_COLOR,

                          opacity: theme.faceOpacity,

                          // Flat, embossed or debossed appearance.
                          filter: getPipFilter(theme),

                          // Use the pip image as a mask so its colour is
                          // controlled entirely by the theme.
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
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GameDice;
