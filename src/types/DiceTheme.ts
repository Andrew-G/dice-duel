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

  /** Path to a transparent PNG or SVG pip asset. */
  pipSrc?: string;

  /** Colour used to tint the pip. */
  pipColor?: string;

  /** Size of each pip relative to its grid cell. */
  pipSize?: string;

  /** Visual treatment applied to each pip. */
  pipStyle?: DicePipStyle;

  /** Opacity applied to each pip (0-1). */
  faceOpacity: number;

  /** Optional CSS filter applied to each pip. */
  faceFilter?: string;
};