import type { DiceTheme } from "@/types/DiceTheme";
import defaultTheme from "./default.json";
import ember from "./ember.json";
import emerald from "./emerald.json";
import sakura from "./sakura.json";
import ivory from "./ivory.json";

/** The theme used when no `diceId` is given, or the id is unknown. */
export const DEFAULT_DICE_ID = "default";

/**
 * Every dice theme the player can pick from, in picker order.
 *
 * To add one: drop a new JSON file in this folder (copy default.json and
 * change the id + colors), import it above and add it to the array below.
 */
export const diceThemes: DiceTheme[] = [defaultTheme, ember, emerald, sakura, ivory];

const themesById = new Map(diceThemes.map((theme) => [theme.id, theme]));

/** Look up a theme by id, falling back to the default theme. */
export function getDiceTheme(id?: string | null): DiceTheme {
  const theme = id ? themesById.get(id) : undefined;
  if (!theme && id && process.env.NODE_ENV !== "production") {
    console.warn(`Unknown dice theme "${id}"; using "${DEFAULT_DICE_ID}".`);
  }
  return theme ?? themesById.get(DEFAULT_DICE_ID) ?? diceThemes[0];
}
