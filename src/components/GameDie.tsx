import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import DieFace from "./DieFace";

type GameDieProps = {
  i: number;
  isShaking?: boolean;
  isKept?: boolean;
  isWaiting?: boolean;
  diceRollPositions: number[][];
  wavePositions: number[][];
  faceValue: Die;
  theme: DiceTheme;
  onKeepToggle?: (i: number) => void;
};

/**
 * One die in play: a button that toggles keep, wrapped in the roll-shake and
 * idle-wave motion. The look comes from `DieFace`.
 */
const GameDie = ({
  i,
  isShaking,
  isKept,
  isWaiting,
  diceRollPositions,
  wavePositions,
  faceValue,
  theme,
  onKeepToggle,
}: GameDieProps) => (
  <div
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
      className="group absolute inset-0 m-0 rounded-sm p-0 transition-all duration-150 hover:-inset-0.5 hover:z-10"
      onClick={() => onKeepToggle?.(i)}
    >
      <DieFace theme={theme} value={faceValue} isKept={isKept} />
    </button>
  </div>
);

export default GameDie;
