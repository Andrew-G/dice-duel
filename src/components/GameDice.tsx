import { Dice, KeepMask } from "@/constants/types";
import useDiceWave from "@/hooks/useDiceWave";
import { useEffect, useState } from "react";

const GameDice: React.FC<{
  dice?: Dice;
  keepMask: KeepMask;
  isRolling?: boolean;
  isWaiting?: boolean;

  onKeepToggle?: (index: number) => void;
}> = ({ dice, keepMask, isRolling, isWaiting, onKeepToggle }) => {
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
      {(dice || [null, null, null, null, null]).map((d, i) => (
        <button
          key={i}
          className={`m-0 text-black w-10 h-10 flex items-center justify-center p-1.5
            border border-t-[1px] border-l-[1px] border-b-[2px] border-r-[2px]
            border-t-indigo-400/[0.5] border-l-indigo-400/[0.5]
            border-b-indigo-600/[0.5] border-r-indigo-600/[0.5]
            shadow-md transition-all duration-150 rounded text-white font-bold]
            bg-gradient-to-br from-indigo-400/[.25] to-indigo-600/[0.25] shadow-[2px_2px_6px_rgba(0,0,0,0.3)]
            ${keepMask[i] ? "opacity-75" : ""}
            hover:shadow-lg`}
          onClick={() => onKeepToggle?.(i)}
          style={
            isRolling && !keepMask[i]
              ? {
                  transform: `translate(${diceRollPositions[i][0]}px, ${
                    diceRollPositions[i][1]
                  }px) rotate(${diceRollPositions[i][0] * 5}deg)`,
                  transition: "transform 0.1s",
                }
              : isWaiting
              ? {
                  transform: `translate(0px, ${wavePositions[i][1]}px)`,
                  transition: "transform 0.1s",
                }
              : undefined
          }
        >
          <img
            className="opacity-75 w-full h-full pointer-events-none"
            src={`/img/dice/d${
              isRolling && !keepMask[i] ? diceRollValues[i] : d ?? "1"
            }.png`}
          />
        </button>
      ))}
    </div>
  );
};

export default GameDice;
