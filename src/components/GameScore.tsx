import type { GameState, ScoreSheet } from "@/types/Game";
import React from "react";

/** Typed against ScoreSheet so renaming a field there is a compile error here. */
const scoreCategoryNames: Record<keyof ScoreSheet, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  upperSectionTotal: "Upper total",
  upperBonusEarned: "Upper bonus",
  threeOfAKind: "Three of a Kind",
  fourOfAKind: "Four of a Kind",
  fullHouse: "Full House",
  smallStraight: "Small Straight",
  largeStraight: "Large Straight",
  yahtzee: "Yahtzee",
  chance: "Chance",
  lowerBonus: "Lower Bonus",
  lowerTotal: "Lower total",
  total: "Total",
};

const formatValue = (value: number | boolean | null): string =>
  value === null ? "-" : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);

const GameScore: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-3 rounded-md shadow-xs">
        <div className="space-y-1">
          {Object.entries(gameState.scoreSheet).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b pb-1">
              <span className="text-xs font-medium">
                {scoreCategoryNames[key as keyof ScoreSheet]}:
              </span>
              <span className="text-xs text-gray-700">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScore;
