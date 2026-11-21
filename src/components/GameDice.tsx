import { DEFAULT_DICE_ID, getDiceTheme } from "@/data/dice";
import { useDiceWave } from "@/hooks/useDiceWave";
import type { Dice, Die, KeepMask } from "@/types/Dice";
import { useEffect, useState } from "react";
import GameDie from "./GameDie";

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
    <div className="w-full flex flex-row items-center gap-2 justify-center">
      {(dice || [null, null, null, null, null]).map((d, i) => {
        const isKept = !!keepMask[i];
        const isShaking = isRolling && !isKept;

        const faceValue = (isShaking ? diceRollValues[i] : d ?? 1) as Die;

        return (
          <GameDie
            key={i}
            i={i}
            diceRollPositions={diceRollPositions}
            faceValue={faceValue}
            isKept={isKept}
            isShaking={isShaking}
            isWaiting={isWaiting}
            onKeepToggle={onKeepToggle}
            theme={theme}
            wavePositions={wavePositions}
          />
        );
      })}
    </div>
  );
};

export default GameDice;
