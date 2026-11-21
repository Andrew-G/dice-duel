import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import { useDiceWave } from "@/hooks/useDiceWave";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import { useEffect, useRef, useState } from "react";
import GameDie from "./GameDie";

const DICE_COUNT = 5;

/** Half of a die's flip: from flat to edge-on. The theme swaps at that point. */
const FLIP_HALF_MS = 160;

/** Each die starts flipping a little after the one before, so it ripples across. */
const FLIP_STAGGER_MS = 70;

/** Edge-on is invisible, so the jump from +90deg to -90deg can't be seen. */
const FLIP_KEYFRAMES: Keyframe[] = [
  { transform: "perspective(300px) rotateY(0deg)", offset: 0, easing: "ease-in" },
  { transform: "perspective(300px) rotateY(90deg)", offset: 0.5 },
  {
    transform: "perspective(300px) rotateY(-90deg)",
    offset: 0.5,
    easing: "ease-out",
  },
  { transform: "perspective(300px) rotateY(0deg)", offset: 1 },
];

type GameDiceProps = {
  dice?: Dice;
  keepMask: KeepMask;
  /** The player's dice theme. */
  diceId?: string;
  /** The opponent's dice theme, for games where the dice change hands. */
  opponentDiceId?: string;
  /**
   * Show `opponentDiceId` instead of `diceId`. When this flips, the dice turn
   * over one after another to the other theme.
   */
  showOpponentDice?: boolean;
  isRolling?: boolean;
  isWaiting?: boolean;
  onKeepToggle?: (index: number) => void;
};

const GameDice = ({
  dice,
  keepMask,
  diceId = DEFAULT_DICE_ID,
  opponentDiceId,
  showOpponentDice,
  isRolling,
  isWaiting,
  onKeepToggle,
}: GameDiceProps) => {
  const theme = getDiceTheme(
    showOpponentDice && opponentDiceId ? opponentDiceId : diceId
  );
  const wavePositions = useDiceWave(!!isWaiting);

  // The theme each die is drawn with. It trails `theme` while the dice flip, so
  // every die swaps while it's edge-on instead of all of them popping at once.
  const [shownThemes, setShownThemes] = useState(() =>
    Array.from({ length: DICE_COUNT }, () => theme)
  );
  const settledThemeId = useRef(theme.id);
  const dieWrappers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (settledThemeId.current === theme.id) return;
    settledThemeId.current = theme.id;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const wrappers = dieWrappers.current;
    const timers: number[] = [];

    for (let i = 0; i < DICE_COUNT; i++) {
      const swap = () =>
        setShownThemes((prev) => prev.map((t, j) => (j === i ? theme : t)));

      if (reduceMotion) {
        swap();
        continue;
      }

      const delay = i * FLIP_STAGGER_MS;
      wrappers[i]?.animate(FLIP_KEYFRAMES, {
        duration: FLIP_HALF_MS * 2,
        delay,
      });
      timers.push(window.setTimeout(swap, delay + FLIP_HALF_MS));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      wrappers.forEach((el) => el?.getAnimations().forEach((a) => a.cancel()));
    };
  }, [theme]);

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
    <div className="w-full flex flex-row items-center gap-2 justify-center">
      {(dice || [null, null, null, null, null]).map((d, i) => {
        const isKept = !!keepMask[i];
        const isShaking = isRolling && !isKept;

        const faceValue = (isShaking ? diceRollValues[i] : d ?? 1) as Die;

        return (
          // The flip lives on this wrapper so it can't clash with the roll
          // shake and idle wave, which move the die itself.
          <div
            key={i}
            ref={(el) => {
              dieWrappers.current[i] = el;
            }}
            className="h-10 w-10 shrink-0"
          >
            <GameDie
              i={i}
              diceRollPositions={diceRollPositions}
              faceValue={faceValue}
              isKept={isKept}
              isShaking={isShaking}
              isWaiting={isWaiting}
              onKeepToggle={onKeepToggle}
              theme={shownThemes[i]}
              wavePositions={wavePositions}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GameDice;
