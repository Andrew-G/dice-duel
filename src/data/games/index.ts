import type { RecordedGame } from "@/types/Recording";
import placeholderBots from "./placeholder-bots.json";
import g1 from "./untitled-game-gmwg0l1ar.json";

/**
 * Every game the VS opponent can replay. They are split into Easy / Medium /
 * Hard by final score (see engine/difficulty.ts), so the more you record, the
 * better the tiers get.
 *
 * To add one you recorded: save the JSON from the end-of-game panel into this
 * folder, import it above, and add it to the array below. Once you have enough
 * of your own, delete placeholder-bots.json and its import. In dev, a recording
 * that fails validation is reported in the browser console when replayed.
 */
export const recordedGames = [
  ...placeholderBots,
  g1,
] as unknown as RecordedGame[];
