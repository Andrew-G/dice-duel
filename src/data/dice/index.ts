import type { DiceTheme } from "@/types/DiceTheme";
import defaultTheme from "./default.json";
import { emberTheme } from "./ember";
import { emeraldTheme } from "./emerald";
import { ivoryTheme } from "./ivory";
import { sakuraTheme } from "./sakura";
import { cursedTheme } from "./cursed";
import { luckyCloverTheme } from "./lucky-clover";
import { celestialTheme } from "./celestial";
import { cyberGridTheme } from "./cyber-grid";
import { obsidianGoldTheme } from "./obsidian-gold";

/** The theme used when no `diceId` is given, or the id is unknown. */
export const DEFAULT_DICE_ID = "default";

export const DICE_THEMES: DiceTheme[] = [
  ivoryTheme,
  emberTheme,
  emeraldTheme,
  sakuraTheme,
  cursedTheme,
  luckyCloverTheme,
  celestialTheme,
  cyberGridTheme,
  obsidianGoldTheme,
];

/** Fast O(1) lookup dictionary for themes by their ID. */
export const themesById: Record<string, DiceTheme> = DICE_THEMES.reduce(
  (acc, theme) => {
    acc[theme.id] = theme;
    return acc;
  },
  {} as Record<string, DiceTheme>
);

/** Retrieves a theme by ID, falling back to ivory (or the first theme) if not found. */
export function getDiceTheme(id: string): DiceTheme {
  return themesById[id] ?? DICE_THEMES[0];
}

export {
  emberTheme,
  emeraldTheme,
  ivoryTheme,
  sakuraTheme,
  cursedTheme,
  luckyCloverTheme,
  celestialTheme,
  cyberGridTheme,
  obsidianGoldTheme,
};