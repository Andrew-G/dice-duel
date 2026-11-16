import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import useDiceWave from "@/hooks/useDiceWave";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import clsx from "clsx";
import { useEffect, useState, type CSSProperties } from "react";

/** Fallback pip asset used by themes that do not specify their own. */
const DEFAULT_PIP_SRC = "/img/dice/pip.svg";

/**
 * The active cell indexes in a 3x3 grid for each standard die face.
 * Indexes are read from left to right, top to bottom:
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
 * Expose a theme's colors and pip sizing as CSS variables. The Tailwind classes
 * below (and the `die-throb` keyframes in tailwind.config.ts) read these, so one
 * theme restyles every die without Tailwind needing to know the values up front.
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
  } as CSSProperties);

const GameDice: React.FC<{
  dice?: Dice;
  keepMask: KeepMask;
  /** Id of a theme from src/data/dice. Unknown or missing ids use the default theme. */
  diceId?: string;
  isRolling?: boolean;
  isWaiting?: boolean;
  onKeepToggle?: (index: number) => void;
}> = ({
  dice,
  keepMask,
  diceId = DEFAULT_DICE_ID,
  isRolling,
  isWaiting,
  onKeepToggle,
}) => {
  const theme = getDiceTheme(diceId);
  console.log('theme',theme)
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
        const faceValue = (isShaking ? diceRollValues[i] : d ?? 1) as Die;
        const activePips = PIP_POSITIONS[faceValue] ?? PIP_POSITIONS[1];

        return (
          // Fixed-size slot: it holds the die's place in the row (and carries the
          // roll/wave movement), so the die inside can grow on hover without
          // nudging its neighbours.
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
                ? { transform: `translate(0px, ${wavePositions[i][1]}px)` }
                : undefined
            }
          >
            <button
              type="button"
              aria-pressed={isKept}
              aria-label={`${isKept ? "Unkeep" : "Keep"} die ${i + 1}, showing ${faceValue}`}
              className={clsx(
                // Shape. Absolutely positioned, so growing it never affects layout.
                "absolute inset-0 m-0 flex items-center justify-center rounded p-1.5 font-bold text-white",
                "transition-all duration-150",
                // Raised on hover: grows 2px on every side and sits above its neighbours.
                "hover:-inset-0.5 hover:z-10",
                // Theme body + shadow.
                "bg-gradient-to-br from-[color:var(--die-bg-from)] to-[color:var(--die-bg-to)]",
                "[box-shadow:2px_2px_6px_var(--die-shadow)]",
                "hover:[box-shadow:4px_6px_12px_var(--die-shadow)]",
                isKept
                  ? // Held: a uniform border that throbs between the two highlight colors.
                    // The static color is the fallback for reduced-motion users.
                    "border-2 border-[color:var(--die-highlight-primary)] motion-safe:animate-die-throb"
                  : // Not held: beveled theme border (light top/left, dark bottom/right).
                    "border-l border-t border-b-2 border-r-2 " +
                      "border-l-[color:var(--die-border-light)] border-t-[color:var(--die-border-light)] " +
                      "border-b-[color:var(--die-border-dark)] border-r-[color:var(--die-border-dark)]"
              )}
              onClick={() => onKeepToggle?.(i)}
            >
              {/*
                A 3x3 grid replaces the six full-face PNGs. Each active cell
                renders the same theme pip asset, so changing a theme only
                changes one image rather than six separate face images.
              */}
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
                      <img
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="h-[var(--die-pip-size)] w-[var(--die-pip-size)] object-contain"
                        style={{
                          opacity: theme.faceOpacity,
                          filter: theme.faceFilter,
                        }}
                        src={theme.pipSrc ?? DEFAULT_PIP_SRC}
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
