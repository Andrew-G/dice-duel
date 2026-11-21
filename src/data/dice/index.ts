import type { DiceTheme } from "@/types/DiceTheme";
import { emberTheme } from "./themes/ember";
import { emeraldTheme } from "./themes/emerald";
import { ivoryTheme } from "./themes/ivory";
import { sakuraTheme } from "./themes/sakura";
import { cursedTheme } from "./themes/cursed";
import { luckyCloverTheme } from "./themes/lucky-clover";
import { celestialTheme } from "./themes/celestial";
import { cyberGridTheme } from "./themes/cyber-grid";
import { obsidianGoldTheme } from "./themes/obsidian-gold";
import { obsidianTheme } from "./themes/obsidian";
import { voidTheme } from "./themes/void";
import { royalAmethystTheme } from "./themes/royal-amethyst";
import { frostTheme } from "./themes/frost";
import { midnightNeonTheme } from "./themes/midnight-neon";
import { starlightTheme } from "./themes/starlight";
import { bonesTheme } from "./themes/bones";
import { obsidianRedTheme } from "./themes/obsidian-red";

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
  obsidianTheme,
  voidTheme,
  royalAmethystTheme,
  frostTheme,
  midnightNeonTheme,
  starlightTheme,
  bonesTheme,
];

/**
 * Dice that only opponent characters use (Anvil, Enforcer). They resolve by id
 * but are not in DICE_THEMES, so they never show up in the player's picker.
 */
const OPPONENT_ONLY_THEMES: DiceTheme[] = [bonesTheme, obsidianRedTheme];

export const DEFAULT_DICE_ID = DICE_THEMES[0].id;

/** Fast O(1) lookup dictionary for themes by their ID. */
export const themesById: Record<string, DiceTheme> = [
  ...DICE_THEMES,
  ...OPPONENT_ONLY_THEMES,
].reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {} as Record<string, DiceTheme>);

/** Retrieves a theme by ID, falling back to ivory (or the first theme) if not found. */
export function getDiceTheme(id: string): DiceTheme {
  return themesById[id] ?? DICE_THEMES[0];
}
