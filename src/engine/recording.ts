import type { Dice } from "@/types/Dice";
import { createEmptyScoreSheet, type ScoreSheet } from "@/types/Game";
import type { RecordedGame, RecordedTurn } from "@/types/Recording";
import {
  ALL_CATEGORIES,
  ROLLS_PER_TURN,
  TURNS_PER_GAME,
  scoreCategory,
} from "./score";
import { applyScore } from "./sheet";

/** The dice a turn was scored with (the last roll). */
export const finalDice = (turn: RecordedTurn): Dice =>
  turn.rolls[turn.rolls.length - 1];

/** Replays a game's turns through the real scoring rules. */
export function buildScoreSheet(turns: RecordedTurn[]): ScoreSheet {
  return turns.reduce(
    (sheet, turn) => applyScore(sheet, finalDice(turn), turn.category),
    createEmptyScoreSheet()
  );
}

/** Wraps finished turns into a RecordedGame; finalScore is derived from the turns. */
export function createRecordedGame(
  turns: RecordedTurn[],
  id: string,
  label: string
): RecordedGame {
  return { id, label, finalScore: buildScoreSheet(turns).total ?? 0, turns };
}

/**
 * Checks a recorded game for internal consistency and returns a list of
 * problems (empty = valid). Use it when loading games and in a test over
 * your data folder, so a typo in a recording can't silently corrupt a replay.
 */
export function validateRecordedGame(game: RecordedGame): string[] {
  const errors: string[] = [];

  if (game.turns.length !== TURNS_PER_GAME) {
    errors.push(`Expected ${TURNS_PER_GAME} turns, got ${game.turns.length}`);
  }

  let sheet = createEmptyScoreSheet();

  game.turns.forEach((turn, i) => {
    const label = `Turn ${i + 1}`;
    const rollCount = turn.rolls.length;
    let turnIsSound = true;

    if (rollCount < 1 || rollCount > ROLLS_PER_TURN) {
      errors.push(
        `${label}: expected 1-${ROLLS_PER_TURN} rolls, got ${rollCount}`
      );
      return;
    }
    if (turn.keeps.length !== rollCount - 1) {
      errors.push(
        `${label}: expected ${rollCount - 1} keep mask(s), got ${turn.keeps.length}`
      );
      return;
    }

    turn.rolls.forEach((dice, r) => {
      const valid =
        dice.length === 5 &&
        dice.every((d) => Number.isInteger(d) && d >= 1 && d <= 6);
      if (!valid) {
        errors.push(
          `${label}, roll ${r + 1}: invalid dice [${dice.join(", ")}]`
        );
        turnIsSound = false;
        return;
      }
      if (r > 0) {
        const mask = turn.keeps[r - 1];
        const prev = turn.rolls[r - 1];
        for (let j = 0; j < 5; j++) {
          if (mask[j] === 1 && dice[j] !== prev[j]) {
            errors.push(
              `${label}, roll ${r + 1}: die ${j + 1} was kept but changed (${prev[j]} -> ${dice[j]})`
            );
            turnIsSound = false;
          }
        }
      }
    });

    if (!ALL_CATEGORIES.includes(turn.category)) {
      errors.push(`${label}: unknown category "${turn.category}"`);
      return;
    }
    if (sheet[turn.category] !== null) {
      errors.push(`${label}: category "${turn.category}" was already used`);
      return;
    }
    if (!turnIsSound) return;

    const dice = finalDice(turn);
    const expected = scoreCategory(dice, turn.category);
    if (turn.score !== expected) {
      errors.push(
        `${label}: ${turn.category} for [${dice.join(", ")}] should score ${expected}, recorded ${turn.score}`
      );
    }
    sheet = applyScore(sheet, dice, turn.category);
  });

  if (game.finalScore !== sheet.total) {
    errors.push(
      `finalScore is ${game.finalScore} but the turns add up to ${sheet.total}`
    );
  }

  return errors;
}
