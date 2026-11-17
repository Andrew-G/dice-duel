import type { Die } from "@/types/Dice";
import type { DiceTheme } from "@/types/DiceTheme";
import type { CSSProperties } from "react";

const CIRCLE_PIP_SRC = "/img/dice/pip/circle.svg";
const DEFAULT_PIP_COLOR = "#111827";

/** Edge length of the theme's custom pip, which only the face value 1 shows. */
const CUSTOM_PIP_SIZE = "16px";

/**
 * Pip visual treatments.
 *
 * Assumes the light source comes from the top-left.
 */
const PIP_STYLE_FILTERS = {
  flat: "",

  // Raised: light upper-left, dark lower-right.
  embossed:
    "drop-shadow(-1px -1px 0.75px rgba(255,255,255,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(0,0,0,0.6))",

  // Recessed: dark upper-left, light lower-right.
  debossed:
    "drop-shadow(-1px -1px 1px rgba(0,0,0,0.7)) " +
    "drop-shadow(1px 1px 1px rgba(255,255,255,0.55))",
} as const;

/**
 * Combines the optional theme filter with the pip style.
 */
const getPipFilter = (theme: DiceTheme) =>
  [theme.faceFilter, PIP_STYLE_FILTERS[theme.pipStyle ?? "flat"]]
    .filter(Boolean)
    .join(" ") || undefined;

/**
 * Circle pip positions in a 3x3 grid:
 *
 * 0 1 2
 * 3 4 5
 * 6 7 8
 *
 * The face value 1 isn't here: it shows the theme's custom pip instead.
 */
const PIP_POSITIONS: Record<Exclude<Die, 1>, readonly number[]> = {
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** One pip: the pip image used as a mask, so the theme controls its colour. */
const pipStyle = (
  theme: DiceTheme,
  src: string,
  size: string
): CSSProperties => ({
  display: "block",
  flexShrink: 0,

  width: size,
  height: size,

  backgroundColor: theme.pipColor ?? DEFAULT_PIP_COLOR,

  opacity: theme.faceOpacity,

  // Flat, embossed or debossed appearance.
  filter: getPipFilter(theme),

  maskImage: `url("${src}")`,
  WebkitMaskImage: `url("${src}")`,

  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",

  maskPosition: "center",
  WebkitMaskPosition: "center",

  maskSize: "contain",
  WebkitMaskSize: "contain",
});

type DicePipsProps = {
  theme: DiceTheme;
  value: Die;
};

/**
 * The pips on one die face. Fills its parent, so put it inside the die's
 * padding.
 *
 * The face value 1 shows the theme's custom pip at a fixed size; every other
 * value shows circle pips on a 3x3 grid, sized by the theme's `pipSize`.
 */
const DicePips = ({ theme, value }: DicePipsProps) => {
  if (value === 1) {
    return (
      <span
        aria-hidden="true"
        className="pointer-events-none flex h-full w-full items-center justify-center"
      >
        <span
          style={pipStyle(
            theme,
            theme.pipSrc ?? CIRCLE_PIP_SRC,
            CUSTOM_PIP_SIZE
          )}
        />
      </span>
    );
  }

  const activePips = PIP_POSITIONS[value];

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none grid h-full w-full grid-cols-3 grid-rows-3 place-items-center"
    >
      {Array.from({ length: 9 }, (_, position) => (
        <span
          key={position}
          className="flex h-full w-full items-center justify-center"
        >
          {activePips.includes(position) && (
            <span
              style={pipStyle(theme, CIRCLE_PIP_SRC, theme.pipSize ?? "70%")}
            />
          )}
        </span>
      ))}
    </span>
  );
};

export default DicePips;
