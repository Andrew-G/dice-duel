import { GameState } from "@/types/Game";
import React from "react";

const scoreCategoryNames: Record<string, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  upper_section_total: "Upper total",
  upper_bonus_earned: "Upper bonus",
  three_of_a_kind: "Three of a Kind",
  four_of_a_kind: "Four of a Kind",
  full_house: "Full House",
  small_straight: "Small Straight",
  large_straight: "Large Straight",
  yahtzee: "Yahtzee",
  chance: "Chance",
  lower_bonus: "Lower Bonus",
  lower_total: "Lower total",
  total: "Total",
};

const GameScore: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-3 rounded-md shadow-sm">
        <div className="space-y-1">
          {Object.entries(gameState.scoreSheet).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b pb-1">
              <span className="text-xs font-medium">
                {scoreCategoryNames[key]}:
              </span>
              <span className="text-xs text-gray-700">
                {value === null ? "-" : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScore;
