/** Visual treatment for the pip silhouette. */
export type DicePipStyle = "flat" | "embossed" | "debossed";

/** How a face texture is blended into the die's gradient. */
export type DiceTextureBlend =
  | "multiply"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "darken"
  | "luminosity";

export type DiceTheme = {
  id: string;
  name: string;

  bgFrom: string;
  bgTo: string;

  borderLight: string;
  borderDark: string;

  highlightPrimary: string;
  highlightSecondary: string;

  shadowColor: string;

  /**
   * Path to a transparent PNG or SVG pip asset. It's the theme's signature
   * pip, shown (at 16px) only on the face value 1; every other face uses
   * circle pips.
   */
  pipSrc?: string;

  /** Colour used to tint the pip. */
  pipColor?: string;

  /** Size of each circle pip relative to its grid cell. */
  // TODO, delete all pip sizes
  pipSize?: string;

  /** Visual treatment applied to every pip, custom or circle. */
  pipStyle?: DicePipStyle;

  /** Opacity applied to each pip (0-1). */
  faceOpacity: number;

  /** Optional CSS filter applied to each pip. */
  faceFilter?: string;

  /** Path to an image blended over the die's gradient (see `faceTextureBlend`). */
  faceTexture?: string;

  /**
   * CSS blend mode used to mix `faceTexture` into the gradient. Defaults to
   * `overlay`. Try `multiply` for a darker, grimier look, or `soft-light`
   * for a subtler one.
   */
  faceTextureBlend?: DiceTextureBlend;
};
