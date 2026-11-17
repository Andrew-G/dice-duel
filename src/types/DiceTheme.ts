/** Visual treatment for the pip silhouette. */
export type DicePipStyle = "flat" | "embossed" | "debossed";

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
  pipSize?: string;

  /** Visual treatment applied to every pip, custom or circle. */
  pipStyle?: DicePipStyle;

  /** Opacity applied to each pip (0-1). */
  faceOpacity: number;

  /** Optional CSS filter applied to each pip. */
  faceFilter?: string;
};
