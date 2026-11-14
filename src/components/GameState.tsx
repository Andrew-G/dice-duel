import { GameState } from "@/types/game";
import React from "react";

const GameStateTable = ({
  gameState,
  mini,
}: {
  gameState: GameState;
  mini?: boolean;
}) => {
  if (mini) {
    const miniString = `Turn: ${gameState?.turnNumber} • Rolls: ${gameState?.rollsRemaining}`;
    return (
      <p className="text-sm text-indigo-400/[0.75] text-center">{miniString}</p>
    );
  }
  return (
    <div className="flex flex-row space-x-2 justify-between">
      <div className="bg-gray-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between text-sm space-x-2">
          <span className="font-medium">Turn Number</span>
          <span className="text-gray-700">{gameState?.turnNumber}</span>
        </div>
      </div>
      <div className="bg-gray-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between text-sm space-x-2">
          <span className="font-medium">Rolls Remaining</span>
          <span className="text-gray-700">{gameState?.rollsRemaining}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStateTable;
