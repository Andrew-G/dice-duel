import Button from "@/components/Button";
import type { PlayerGame } from "@/hooks/usePlayerGame";

type TurnControlsProps = {
  player: PlayerGame;
  isOpponentTurn: boolean;
};

const getRollLabel = (player: PlayerGame, isOpponentTurn: boolean) => {
  if (isOpponentTurn) return "Opponent's turn";
  if (!player.dice) return "Roll dice";
  if (player.rollsRemaining > 0) {
    return `Roll again (${player.rollsRemaining} left)`;
  }
  return "No rolls left";
};

const getHint = (player: PlayerGame, isOpponentTurn: boolean) => {
  if (isOpponentTurn) return "Watch their roll…";
  if (!player.dice) return "Roll to start your turn.";
  if (player.isRolling) return "Rolling…";
  if (player.rollsRemaining === 0) return "Pick a box to score.";
  if (player.keepMask.every((kept) => kept === 1)) {
    return "Release a die to roll again, or pick a box to score.";
  }
  return "Tap dice to hold them, or pick a box to score.";
};

/** The roll button and the hint under it. */
const TurnControls = ({ player, isOpponentTurn }: TurnControlsProps) => (
  <div className="flex flex-col items-center gap-2">
    <Button onClick={player.roll} disabled={!player.canRoll || isOpponentTurn}>
      {getRollLabel(player, isOpponentTurn)}
    </Button>
    <p className="text-sm text-white/60">{getHint(player, isOpponentTurn)}</p>
  </div>
);

export default TurnControls;
