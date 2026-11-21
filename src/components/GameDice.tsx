import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import { useDiceWave } from "@/hooks/useDiceWave";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import { useEffect, useRef, useState } from "react";
import type { DiceTheme } from "@/types/DiceTheme";
import DieFlip, { DIE_FLIP_MS, DIE_FLIP_STAGGER_MS } from "./DieFlip";
import GameDie from "./GameDie";

const DICE_COUNT = 5;

/** How long it takes for all the dice to finish rolling over to a new theme. */
const DICE_FLIP_TOTAL_MS = DIE_FLIP_MS + DIE_FLIP_STAGGER_MS * (DICE_COUNT - 1);

/** Sideways wobble mid-roll for each die (degrees), so they don't move in lockstep. */
const FLIP_WOBBLE_DEG = [6, -8, 5, -7, 8];

type GameDiceProps = {
  dice?: Dice;
  keepMask: KeepMask;
  /** The player's dice theme. */
  diceId?: string;
  /** The opponent's dice theme, for games where the dice change hands. */
  opponentDiceId?: string;
  /**
   * Show `opponentDiceId` instead of `diceId`. When this flips, the dice roll
   * over one after another, like cubes, to the other theme.
   */
  showOpponentDice?: boolean;
  isRolling?: boolean;
  /** Dice at rest between turns: they bob in an idle wave. */
  isWaiting?: boolean;
  /**
   * Called once the dice have finished turning over after `showOpponentDice`
   * changed. If both sides use the same theme there is nothing to animate, and
   * it is called straight away.
   */
  onFlipEnd?: () => void;
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
  onFlipEnd,
  onKeepToggle,
}: GameDiceProps) => {
  const theme = getDiceTheme(
    showOpponentDice && opponentDiceId ? opponentDiceId : diceId
  );
  const wavePositions = useDiceWave(!!isWaiting);

  // The theme the dice are drawn with. It trails `theme` while they roll over
  // (`flip` is set then), and catches up when the roll is done.
  const [shownTheme, setShownTheme] = useState(theme);
  const [flip, setFlip] = useState<{ from: DiceTheme; to: DiceTheme } | null>(
    null
  );
  const shownThemeRef = useRef(shownTheme);
  useEffect(() => {
    shownThemeRef.current = shownTheme;
  });
  const settledSide = useRef(!!showOpponentDice);

  // Always call the latest `onFlipEnd` from the timer below. This effect is
  // declared first so it has run before the flip effect needs it.
  const onFlipEndRef = useRef(onFlipEnd);
  useEffect(() => {
    onFlipEndRef.current = onFlipEnd;
  });

  useEffect(() => {
    // Roll when the side changes (not on first mount).
    if (settledSide.current === !!showOpponentDice) return;
    settledSide.current = !!showOpponentDice;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const from = shownThemeRef.current;

    // Nothing to animate (both sides use the same dice, or motion is reduced):
    // swap at once and report that the flip is over.
    if (reduceMotion || from.id === theme.id) {
      setFlip(null);
      setShownTheme(theme);
      onFlipEndRef.current?.();
      return;
    }

    setFlip({ from, to: theme });
    const timer = window.setTimeout(() => {
      setShownTheme(theme);
      setFlip(null);
      onFlipEndRef.current?.();
    }, DICE_FLIP_TOTAL_MS);

    return () => window.clearTimeout(timer);
  }, [theme, showOpponentDice]);

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

        // While the theme changes the die is drawn as a rolling cube instead.
        if (flip) {
          return (
            <DieFlip
              key={i}
              from={flip.from}
              to={flip.to}
              value={faceValue}
              delayMs={i * DIE_FLIP_STAGGER_MS}
              wobbleDeg={FLIP_WOBBLE_DEG[i]}
            />
          );
        }

        return (
          <div key={i} className="h-10 w-10 shrink-0">
            <GameDie
              i={i}
              diceRollPositions={diceRollPositions}
              faceValue={faceValue}
              isKept={isKept}
              isShaking={isShaking}
              isWaiting={isWaiting}
              onKeepToggle={onKeepToggle}
              theme={shownTheme}
              wavePositions={wavePositions}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GameDice;
