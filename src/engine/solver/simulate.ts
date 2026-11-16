import type { Dice, Die, KeepMask } from "@/types/Dice";
import { createEmptyScoreSheet } from "@/types/Game";
import type { RecordedTurn } from "@/types/Recording";
import { ROLLS_PER_TURN, TURNS_PER_GAME, scoreCategory } from "../score";
import { applyScore } from "../sheet";
import {
  decideCategory,
  decideKeep,
  PERFECT_SKILL,
  type BotSkill,
} from "./policy";
import type { SolverTable } from "./table";

export const rollDice = (
  previous: Dice | null,
  mask: KeepMask,
  rng: () => number
): Dice =>
  Array.from({ length: 5 }, (_, i) =>
    previous && mask[i] === 1
      ? previous[i]
      : ((Math.floor(rng() * 6) + 1) as Die)
  ) as Dice;

/**
 * Plays one whole game headlessly with the robot policy, using the real
 * scoring rules, and returns it as recorded turns (so it can be validated or
 * replayed like any other recording).
 */
export function simulateGame(
  table: SolverTable,
  skill: BotSkill = PERFECT_SKILL,
  rng: () => number = Math.random
): { turns: RecordedTurn[]; total: number } {
  let sheet = createEmptyScoreSheet();
  const turns: RecordedTurn[] = [];

  for (let t = 0; t < TURNS_PER_GAME; t++) {
    const rolls: Dice[] = [rollDice(null, [0, 0, 0, 0, 0], rng)];
    const keeps: KeepMask[] = [];
    while (rolls.length < ROLLS_PER_TURN) {
      const dice = rolls[rolls.length - 1];
      const mask = decideKeep(
        table,
        sheet,
        dice,
        ROLLS_PER_TURN - rolls.length,
        skill,
        rng
      );
      if (!mask) break; // stop and score
      keeps.push(mask);
      rolls.push(rollDice(dice, mask, rng));
    }
    const dice = rolls[rolls.length - 1];
    const category = decideCategory(table, sheet, dice, skill, rng);
    turns.push({
      rolls,
      keeps,
      category,
      score: scoreCategory(dice, category),
    });
    sheet = applyScore(sheet, dice, category);
  }
  return { turns, total: sheet.total ?? 0 };
}
