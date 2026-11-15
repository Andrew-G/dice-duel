import type { RecordedGame } from "@/types/Recording";

/**
 * Pretty-prints a recording with each dice / mask array on one line, so the
 * JSON stays readable (and diffs nicely) instead of one number per line.
 */
export function serializeRecordedGame(game: RecordedGame): string {
  const pretty = JSON.stringify(game, null, 2).replace(
    /\[\s*(\d[\d,\s]*?)\s*\]/g,
    (_match, inner: string) => `[${inner.replace(/\s+/g, " ").trim()}]`
  );
  return `${pretty}\n`;
}

/** e.g. "Dave's best game!" + "g1abc" -> "daves-best-game-g1abc.json" */
export function recordingFileName(game: Pick<RecordedGame, "id" | "label">): string {
  const slug = game.label
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug ? `${slug}-` : ""}${game.id}.json`;
}
