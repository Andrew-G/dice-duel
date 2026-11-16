/**
 * One dice set. Themes live as JSON/TypeScript in `src/data/dice/` (one file
 * per theme, registered in `src/data/dice/index.ts`). Any CSS color string is fine.
 */
export type DiceTheme = {
  /** Unique key. This is what `<GameDice diceId="..." />` looks up. */
  id: string;
  /** Label shown in the theme picker. */
  name: string;

  /** Die body is a top-left -> bottom-right gradient. Use the same value for a flat color. */
  bgFrom: string;
  bgTo: string;

  /** Beveled border: top + left edges use `borderLight`, bottom + right use `borderDark`. */
  borderLight: string;
  borderDark: string;

  /** A held die's border throbs between these two colors. */
  highlightPrimary: string;
  highlightSecondary: string;

  /** Color of the die's drop shadow. */
  shadowColor: string;

  /**
   * URL/path to a single transparent pip image (PNG, SVG, or another browser-
   * supported image format). Public assets should use a root-relative path,
   * e.g. "/img/dice/pips/black.svg". Defaults to "/img/dice/pip.svg".
   */
  pipSrc?: string;
  /** CSS size of each pip relative to its 3x3 grid cell. Defaults to "70%". */
  pipSize?: string;

  /** Opacity applied to each pip image (0-1). */
  faceOpacity: number;
  /** Optional CSS `filter` applied to each pip, e.g. "brightness(0)" or "hue-rotate(90deg)". */
  faceFilter?: string;
};
